# Lost Ark 副本日程表系統 - 詳細實施計畫

## 🎯 專案概覽

基於現有的 Next.js 應用程式架構，重新設計 Lost Ark 副本日程管理系統，實現類似 Google Sheets 的即時協作功能，提升玩家排程體驗和管理效率。

## 📋 現況分析

### 已有技術棧
- ✅ **前端**: Next.js 15.4, TypeScript, Tailwind CSS v3/v4, shadcn/ui
- ✅ **後端**: Next.js API Routes, Supabase (PostgreSQL + Auth + Realtime + Storage)
- ✅ **即時功能**: Supabase Realtime + Socket.io
- ✅ **認證系統**: Supabase Auth + NextAuth.js
- ✅ **狀態管理**: Zustand
- ✅ **快取**: Redis/ioredis
- ✅ **Excel支援**: xlsx庫
- ✅ **測試**: Playwright

### 現有資料庫結構分析
```sql
✅ user_profiles (用戶管理)
✅ characters (角色管理)
✅ schedules (日程管理)
✅ raids (副本管理)
✅ raid_participants (參與者)
✅ rewards (獎勵系統)
```

### 📊 Excel 原始數據結構分析 (關鍵發現)

通過分析 `出團表單.xlsx` 發現了豐富的業務邏輯：

#### 1. **裝等表** - 核心角色數據
- **多職業支持**: 槍術士、格鬥大師、聖騎士、畫家、氣象術士、影殺者、拳霸、刀鋒等
- **裝等追蹤**: 1490-1610 範圍的裝備等級
- **副本參與標記**: 夢幻、天界、瘟疫、象牙塔的布林值標記
- **多列佈局**: 支持同一頁面顯示多個角色資訊

#### 2. **副本排程表** - 實際排團數據
- **時間管理**: Excel 序列號格式的日期時間
- **角色分工**: DPS 定位系統
- **難度模式**: 普通/困難 (困) 模式區分
- **實時分配**: 具體角色到具體副本關卡的分配

#### 3. **收益金系統** - 經濟模型
- **階段成本**: P1, P2, P3, P4 各階段的金幣消耗
- **收益類型**: 活金(流動金幣) vs 綁金(綁定金幣)
- **副本收益**: 不同副本的具體收益數據
  - 丑龍系列: 普通 500金, 困難 700金
  - 鹿: 1000金, 牛系列: 1250-2700金
  - 魅系列: 1450-1750金

#### 4. **額外功能發現**
- **成就計算器**: 完成獎牌的自動計算
- **寶石比價系統**: 不同等級寶石的價格對比
- **攻略指南**: 島之心、巨人之心、奧菲斯之星收集指南
- **艾波娜委託**: 聲望系統和每日任務追蹤

## 🏗️ 系統架構重新設計

### 1. 資料庫擴展計畫

#### 1.1 新增職業系統 (基於Excel實際數據)
```sql
-- 創建枚舉類型
create type job_role as enum ('DPS', 'SUPPORT');

-- 職業類別表
create table public.game_job_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null, -- 男戰士、女戰士、魔法師等
  color text not null, -- 代表色
  icon text not null, -- 職業圖標路徑
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 職業表
create table public.game_jobs (
  id uuid default gen_random_uuid() primary key,
  name text not null, -- 實際發現職業: 槍術士、格鬥大師、聖騎士、畫家、氣象術士、影殺者、拳霸、刀鋒等
  category_id uuid references public.game_job_categories(id) on delete cascade,
  logo text not null, -- 職業logo路徑
  role job_role default 'DPS'::job_role, -- DPS, SUPPORT
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### 1.2 擴展 Character 模型
```sql
-- 更新角色表
alter table public.characters
add column game_job_id uuid references public.game_jobs(id) on delete set null;

-- 或者重新創建角色表
create table public.characters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  nickname text not null,
  item_level integer not null,
  game_job_id uuid references public.game_jobs(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### 1.3 擴展 Raid 模型 (整合Excel經濟數據)
```sql
-- 創建枚舉類型
create type raid_mode as enum ('SOLO', 'NORMAL', 'HARD');
create type gate_status as enum ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- 擴展副本表
alter table public.raids
add column mode raid_mode default 'NORMAL'::raid_mode,
add column gate text,
add column required_dps integer default 0,
add column required_support integer default 0,
add column phase1_cost integer,
add column phase2_cost integer,
add column phase3_cost integer,
add column phase4_cost integer,
add column active_gold_reward integer,
add column bound_gold_reward integer;

-- 副本時間線表
create table public.raid_timelines (
  id uuid default gen_random_uuid() primary key,
  raid_id uuid references public.raids(id) on delete cascade,
  gate text not null,
  status gate_status default 'PENDING'::gate_status,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 副本經濟表
create table public.raid_economics (
  id uuid default gen_random_uuid() primary key,
  raid_id uuid references public.raids(id) on delete cascade,
  character_id uuid references public.characters(id) on delete cascade,
  total_cost integer not null,
  active_gold integer not null,
  bound_gold integer not null,
  total_revenue integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### 1.4 用戶角色權限系統
```sql
-- 角色表
create table public.roles (
  id uuid default gen_random_uuid() primary key,
  name text not null, -- 管理員、排程員、玩家
  permissions jsonb not null, -- 權限配置
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 用戶角色關聯表
create table public.user_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  role_id uuid references public.roles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, role_id)
);
```

### 2. 前端組件架構重新設計

#### 2.1 主要頁面結構
```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── players/           # 玩家管理
│   │   ├── jobs/              # 職業管理 (新增)
│   │   ├── raids/             # 副本管理
│   │   ├── schedule/          # 日程管理
│   │   ├── timeline/          # 副本時間線 (新增)
│   │   └── admin/             # 管理員功能 (新增)
│   └── api/
│       ├── players/
│       ├── jobs/              # 職業API (新增)
│       ├── raids/
│       ├── schedule/
│       └── admin/             # 管理API (新增)
```

#### 2.2 核心組件設計

##### 職業管理組件
```typescript
// components/jobs/job-category-manager.tsx
// components/jobs/job-selector.tsx
// components/jobs/job-card.tsx
```

##### 日程日曆組件
```typescript
// components/calendar/weekly-calendar.tsx - 週四到週三顯示
// components/calendar/availability-picker.tsx
// components/calendar/time-slot.tsx
```

##### 副本時間線組件
```typescript
// components/raids/raid-timeline.tsx
// components/raids/gate-progress.tsx
// components/raids/completion-marker.tsx
```

##### 即時協作組件
```typescript
// components/realtime/presence-indicator.tsx
// components/realtime/conflict-resolver.tsx
// components/realtime/live-cursor.tsx
```

### 3. API 設計規劃

#### 3.1 職業管理 API
```typescript
// POST /api/admin/job-categories
// GET /api/jobs/categories
// POST /api/admin/jobs
// GET /api/jobs
```

#### 3.2 增強的副本 API
```typescript
// GET /api/raids/timeline/:raidId
// PATCH /api/raids/:raidId/gates/:gate/complete
// GET /api/raids/search?name=&mode=&status=
```

#### 3.3 即時更新 API
```typescript
// Socket.io events:
// - 'raid:updated'
// - 'gate:completed'
// - 'schedule:changed'
// - 'user:presence'
```

### 4. 使用者介面設計

#### 4.1 管理員界面
- **玩家管理**: 批量導入、職業分配、裝等追蹤
- **職業管理**: 職業系統配置、圖標上傳、顏色設定
- **權限管理**: 角色創建、權限分配

#### 4.2 排程員界面
- **副本創建**: 快速設定副本參數、人數需求
- **時間安排**: 拖拽式排程、衝突檢測
- **參與者管理**: 自動匹配、手動調整

#### 4.3 玩家界面
- **空閒時間**: 互動式日曆（週四-週三）
- **副本瀏覽**: 搜尋、過濾、收益查看
- **進度追蹤**: 個人副本完成狀況、時間線視圖

## 🚀 開發階段計畫

### Phase 1: 基礎架構 (Week 1-2)
- [ ] **Supabase數據庫架構設計和遷移** (包含Excel數據結構整合)
- [ ] **職業管理系統開發** (支持Excel中發現的所有職業)
- [ ] **Supabase RLS權限系統實現** (管理員/排程員/玩家)
- [ ] **基礎 UI 組件更新** (支持多列佈局顯示)
- [ ] **Excel匯入功能增強** (支持16個工作表結構，直接寫入Supabase)

### Phase 2: 核心功能 (Week 3-4)
- [ ] **增強版日程管理** (週四到週三週期)
- [ ] **副本時間線功能** (關卡進度追蹤)
- [ ] **經濟系統整合** (活金/綁金收益追蹤)
- [ ] **搜尋和過濾系統** (按職業、裝等、副本類型)
- [ ] **角色分工系統** (DPS定位管理)

### Phase 3: 即時協作 (Week 5-6)
- [ ] **Supabase Realtime 整合** (即時排程更新)
- [ ] **即時狀態同步** (副本完成狀態同步)
- [ ] **衝突解決機制** (多人同時編輯處理)
- [ ] **用戶在線狀態** (Supabase Presence實時在線指示器)
- [ ] **收益計算器** (即時收益預覽)

### Phase 4: 優化和測試 (Week 7-8)
- [ ] **性能優化** (大量數據處理優化)
- [ ] **全面測試** (包含Excel匯入測試)
- [ ] **UI/UX 細化** (Excel風格的熟悉界面)
- [ ] **部署配置** (Docker容器化)
- [ ] **數據遷移腳本** (Excel到系統的完整遷移)

## 📊 技術挑戰和解決方案 (基於Excel分析)

### 1. 即時協作挑戰
**問題**: 多用戶同時編輯可能產生衝突
**解決方案**: 
- 實現樂觀鎖定機制
- 使用 Supabase Realtime 進行即時狀態同步
- 設計衝突解決策略 (基於Supabase Row Level Security)
- 參考Excel中的實時分配邏輯

### 2. 複雜經濟系統處理
**問題**: Excel中複雜的收益計算 (P1-P4階段、活金/綁金分離)
**解決方案**:
- 建立 RaidEconomics 模型追蹤每筆交易
- 自動計算總收益和成本效益比
- 支持不同難度模式的收益差異
- 即時收益預覽功能

### 3. 複雜日程管理
**問題**: 週四到週三的特殊週期 + Excel序列號時間格式
**解決方案**:
- 自定義日曆組件支持非標準週期
- Excel時間序列號轉換工具
- 時區處理和本地化
- 支持Excel中發現的時間範圍格式

### 4. 多職業系統整合
**問題**: Excel中發現的豐富職業數據 (槍術士、格鬥大師等)
**解決方案**:
- 基於實際數據建立完整職業系統
- 支持職業角色分工 (DPS/輔助定位)
- 動態職業圖標和配色系統
- 職業與副本需求的自動匹配

### 5. Excel數據遷移挑戰
**問題**: 16個工作表的複雜結構和業務邏輯
**解決方案**:
- 增強Excel匯入工具支持所有工作表 (使用Supabase Client)
- 智能數據驗證和清理 (使用Supabase Database Functions)
- 段階式數據遷移策略 (使用Supabase Migrations)
- 保持與原有Excel工作流的兼容性

## 🎨 UI/UX 改進重點

### 1. 色彩系統
- 職業代表色整合到整體設計
- Dark/Light 主題支援
- 無障礙色彩對比

### 2. 互動體驗
- 拖拽排程
- 即時預覽
- 動畫過渡效果
- 觸控友好設計

### 3. 資料視覺化
- 副本進度圖表
- 收益統計圖
- 參與度熱力圖

## 🔧 DevOps 和部署

### 1. 容器化部署
```dockerfile
# 多階段建構優化
# Redis 快取配置
# Supabase 連接配置
# 環境變數管理
```

### 2. CI/CD 流程
```yaml
# 自動化測試
# 程式碼品質檢查
# Supabase遷移自動化
# 零停機部署
```

### 3. 監控和日誌
- 應用程式效能監控
- Supabase資料庫查詢優化
- 錯誤追蹤和報警
- Supabase Analytics 整合

## 📈 成功指標

### 技術指標
- 頁面載入時間 < 2秒
- 即時更新延遲 < 100ms
- 系統可用性 > 99.5%

### 使用者體驗指標
- 排程建立時間減少 50%
- 衝突解決效率提升 80%
- 使用者滿意度 > 4.5/5

## 🔐 安全性考量

### 1. 資料保護
- 用戶資料加密
- API 速率限制
- SQL 注入防護

### 2. 權限控制
- 基於角色的存取控制
- API 授權驗證
- 敏感操作記錄

## 📝 文件計畫

### 1. 技術文件
- API 文件 (OpenAPI)
- Supabase資料庫設計文件
- 部署指南 (含Supabase設定)

### 2. 使用者文件
- 使用者手冊
- 管理員指南
- 故障排除指南

---

**預計總開發時間**: 8 週
**核心開發人員**: 1-2 名
**預算估算**: 根據功能複雜度調整

此計畫涵蓋了從系統設計到部署的完整流程，確保新系統能滿足所有需求並具備良好的擴展性。