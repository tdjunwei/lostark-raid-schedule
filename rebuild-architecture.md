# Lost Ark 副本日程表系統 - 重新構建架構

## 🎯 項目重構目標

基於對原始 Excel 數據的深入分析，重新構建一個現代化的 Lost Ark 副本排程管理系統，完美承接現有工作流程並提升用戶體驗。

## 📊 核心業務需求 (基於 Excel 分析)

### 1. **角色管理系統**
- 支持多種職業：槍術士、格鬥大師、聖騎士、畫家、氣象術士、影殺者、拳霸、刀鋒等
- 裝等追蹤：1490-1610+ 範圍
- 職業定位：DPS/輔助/坦克角色分工
- 多角色管理：單一用戶可擁有多個角色

### 2. **經濟系統**
- **階段成本管理**：P1, P2, P3, P4 各階段金幣消耗
- **收益分類**：活金 vs 綁金收益追蹤
- **副本收益數據**：
  - 丑龍系列: 普通 500金, 困難 700金
  - 鹿: 1000金
  - 牛系列: 1250-2700金
  - 魅系列: 1450-1750金
- **收益最佳化**：自動計算收益/成本比

### 3. **副本管理系統**
- **副本類型**：天界、夢幻、象牙塔、瘟疫
- **難度模式**：單人、普通、困難
- **關卡系統**：G1, G2, G3 進度追蹤
- **人數需求**：4人、8人、16人副本支持
- **角色需求**：輸出/輔助人數配置

### 4. **排程系統**
- **特殊週期**：週四到週三的遊戲週期
- **時間管理**：支持 Excel 時間格式轉換
- **即時分配**：角色到副本的動態分配
- **衝突檢測**：自動檢測時間和人員衝突

## 🏗️ 技術架構設計

### 技術棧選擇
```typescript
Frontend:
- Next.js 15.4 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui v4
- Zustand (狀態管理)
- React Hook Form (表單管理)

Backend:
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- Redis (快取)
- Socket.io (即時功能)

Excel 整合:
- xlsx (讀取/寫入)
- 自定義解析器

測試:
- Playwright (E2E)
- Jest (單元測試)
```

### 資料庫設計

#### 核心模型
```prisma
// 用戶系統
model User {
  id          String @id @default(cuid())
  email       String @unique
  name        String?
  role        UserRole @default(PLAYER)
  characters  Character[]
  schedules   Schedule[]
}

// 職業系統
model JobCategory {
  id     String @id @default(cuid())
  name   String // 男戰士、女戰士、魔法師等
  color  String
  icon   String
  jobs   Job[]
}

model Job {
  id         String @id @default(cuid())
  name       String // 槍術士、格鬥大師等
  categoryId String
  role       JobRole @default(DPS)
  
  category   JobCategory @relation(fields: [categoryId], references: [id])
  characters Character[]
}

// 角色系統
model Character {
  id           String @id @default(cuid())
  userId       String
  nickname     String
  itemLevel    Int
  jobId        String
  isMain       Boolean @default(false)
  
  user         User @relation(fields: [userId], references: [id])
  job          Job @relation(fields: [jobId], references: [id])
  participants RaidParticipant[]
  economics    RaidEconomics[]
}

// 副本系統
model Raid {
  id               String @id @default(cuid())
  name             String
  type             RaidType
  mode             RaidMode
  gate             String?
  scheduledTime    DateTime
  status           RaidStatus @default(PLANNED)
  
  // 需求設定
  maxPlayers       Int
  requiredDps      Int
  requiredSupport  Int
  minItemLevel     Int
  
  // 經濟模型
  phase1Cost       Int?
  phase2Cost       Int?
  phase3Cost       Int?
  phase4Cost       Int?
  activeGoldReward Int?
  boundGoldReward  Int?
  
  participants     RaidParticipant[]
  timeline         RaidTimeline[]
  economics        RaidEconomics[]
}

// 經濟追蹤
model RaidEconomics {
  id           String @id @default(cuid())
  raidId       String
  characterId  String
  totalCost    Int
  activeGold   Int
  boundGold    Int
  totalRevenue Int
  profitRatio  Float // 收益率
  
  raid         Raid @relation(fields: [raidId], references: [id])
  character    Character @relation(fields: [characterId], references: [id])
}

// 時間線系統
model RaidTimeline {
  id          String @id @default(cuid())
  raidId      String
  gate        String
  status      GateStatus @default(PENDING)
  startTime   DateTime?
  completedAt DateTime?
  
  raid        Raid @relation(fields: [raidId], references: [id])
}

// 列舉類型
enum UserRole {
  ADMIN
  SCHEDULER  
  PLAYER
}

enum JobRole {
  DPS
  SUPPORT
  TANK
}

enum RaidType {
  CELESTIAL     // 天界
  DREAM         // 夢幻
  IVORY_TOWER   // 象牙塔
  PLAGUE        // 瘟疫
}

enum RaidMode {
  SOLO     // 單人
  NORMAL   // 普通
  HARD     // 困難
}

enum RaidStatus {
  PLANNED
  RECRUITING
  FULL
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum GateStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
}
```

## 🎨 UI/UX 設計理念

### 1. **Excel 風格熟悉度**
- 表格式數據展示
- 多欄位同時編輯
- 快捷鍵支持
- 批量操作功能

### 2. **即時協作**
- 實時狀態同步
- 用戶在線指示
- 變更歷史追蹤
- 衝突解決界面

### 3. **數據視覺化**
- 收益趨勢圖表
- 參與度統計
- 進度追蹤儀表板
- 職業分佈圓餅圖

## 🚀 開發計劃

### Phase 1: 基礎建設 (1-2週)
- [ ] Next.js 項目初始化
- [ ] 資料庫設計和 Prisma 設定
- [ ] 基礎 UI 組件庫
- [ ] 認證系統整合
- [ ] Excel 匯入/匯出工具

### Phase 2: 核心功能 (2-3週)
- [ ] 角色管理系統
- [ ] 職業管理界面
- [ ] 副本創建和管理
- [ ] 經濟系統實現
- [ ] 基礎排程功能

### Phase 3: 高級功能 (2-3週)
- [ ] 即時協作功能
- [ ] 智能排程算法
- [ ] 數據分析和報表
- [ ] 移動端適配
- [ ] 性能優化

### Phase 4: 測試和部署 (1-2週)
- [ ] 完整測試套件
- [ ] 性能測試
- [ ] 用戶驗收測試
- [ ] 生產環境部署
- [ ] 數據遷移腳本

## 📈 成功指標

### 技術指標
- 頁面載入時間 < 1.5秒
- API 響應時間 < 200ms
- 系統可用性 > 99.9%
- 支持 100+ 並發用戶

### 業務指標
- 排程效率提升 60%
- 用戶操作錯誤減少 70%
- Excel 匯入成功率 > 95%
- 用戶滿意度 > 4.5/5

---

**預計開發時間**: 6-10 週  
**團隊規模**: 1-2 名開發者  
**重點**: 完美承接現有 Excel 工作流程，同時提供現代化用戶體驗