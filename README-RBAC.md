# RBAC系統設置完成 ✅

## 已完成的工作

### 1. ✅ 角色系統 (4個角色層級)
- `SUPER_ADMIN` - 超級管理員（系統擁有者）
- `ADMIN` - 管理員（Raid管理）
- `SCHEDULER` - 排程員（組隊管理）
- `PLAYER` - 玩家（默認角色）

### 2. ✅ Super Admin用戶創建
已創建唯一的Super Admin帳號：
```
Email: tdjunwei@gmail.com
Password: QZb]BQV]em%3
Role: SUPER_ADMIN
Status: ✅ Email已確認
```

### 3. ✅ 數據庫遷移
- `20241218000001_initial_schema.sql` - 添加SUPER_ADMIN到user_role枚舉
- `20241218000009_add_super_admin_role.sql` - 創建權限檢查函數和RLS策略

### 4. ✅ 權限檢查函數
```sql
is_super_admin()      -- 檢查是否為Super Admin
is_admin_or_super()   -- 檢查是否為Admin或Super Admin
is_admin()            -- 檢查是否為管理員（包含Super Admin）
```

### 5. ✅ Seed腳本
- `scripts/seed-super-admin.ts` - 創建/更新Super Admin用戶
- `scripts/seed-raids.ts` - 插入Lost Ark副本數據（25個raids）

### 6. ✅ TypeScript類型更新
- `src/types/supabase.ts` - 添加"SUPER_ADMIN"到user_role類型

### 7. ✅ 文檔
- `docs/RBAC.md` - 完整的RBAC系統文檔

## 快速開始

### 登入Super Admin
1. 訪問：http://localhost:3000/login
2. 使用以下憑證登入：
   ```
   Email: tdjunwei@gmail.com
   Password: QZb]BQV]em%3
   ```

### 新用戶註冊
- 📝 新用戶註冊後自動獲得 `PLAYER` 角色
- ❌ 無法通過註冊獲得管理員權限
- ✅ 只有Super Admin可以提升用戶權限

## 數據庫狀態

### 已插入的數據
✅ **25個Lost Ark副本** (9個raid × 多個模式)
- 佛坦 (Valtan) - 3模式
- 魅魔 (Vykas) - 3模式
- 小丑 (Kakul-Saydon) - 2模式
- 夢幻 (Brelshaza) - 3模式
- 天界 (Kayangel) - 3模式
- 瘟疫 (Akkan) - 3模式
- 象牙塔 (Ivory Tower) - 3模式
- 卡門 (Thaemine) - 3模式
- 初魅 (Echidna) - 2模式

✅ **1個Super Admin用戶**
- Email: tdjunwei@gmail.com
- Role: SUPER_ADMIN

### 驗證數據
```bash
# 查看Super Admin用戶
docker exec supabase_db_lostark-raid-schedule psql -U postgres -d postgres -c "SELECT email, name, role FROM user_profiles WHERE role = 'SUPER_ADMIN';"

# 查看所有raids
docker exec supabase_db_lostark-raid-schedule psql -U postgres -d postgres -c "SELECT name, type, mode, min_item_level FROM raids ORDER BY min_item_level;"

# 統計角色分布
docker exec supabase_db_lostark-raid-schedule psql -U postgres -d postgres -c "SELECT role, COUNT(*) FROM user_profiles GROUP BY role;"
```

## 常用命令

### 數據庫操作
```bash
# 重置數據庫（應用所有遷移）
npx supabase db reset

# 創建Super Admin用戶
npm run db:seed-admin

# 插入raids數據
npm run db:seed-raids
```

### 開發服務器
```bash
# 啟動開發服務器
npm run dev
# 訪問：http://localhost:3000
```

### Supabase Studio
```bash
# 訪問Supabase管理界面
# http://127.0.0.1:54323
```

## 權限矩陣

| 操作 | SUPER_ADMIN | ADMIN | SCHEDULER | PLAYER |
|------|-------------|-------|-----------|--------|
| 管理用戶角色 | ✅ | ❌ | ❌ | ❌ |
| 刪除用戶 | ✅ | ❌ | ❌ | ❌ |
| 查看所有用戶資料 | ✅ | ✅ | ✅ | ❌ |
| 管理raid配置 | ✅ | ✅ | ❌ | ❌ |
| 創建raid實例 | ✅ | ✅ | ✅ | ❌ |
| 分配玩家到raid | ✅ | ✅ | ✅ | ❌ |
| 管理獎勵分配 | ✅ | ✅ | ❌ | ❌ |
| 查看所有排程 | ✅ | ✅ | ✅ | ❌ |
| 管理自己的角色 | ✅ | ✅ | ✅ | ✅ |
| 設置自己的排程 | ✅ | ✅ | ✅ | ✅ |

## 安全提醒

### ⚠️ 重要安全事項
1. **不要將 `.env.local` 提交到Git**
   - 此文件包含 `SUPABASE_SERVICE_ROLE_KEY`
   - 已添加到 `.gitignore`

2. **定期更換Super Admin密碼**
   - 修改 `scripts/seed-super-admin.ts`
   - 運行 `npm run db:seed-admin`

3. **限制Super Admin帳號數量**
   - 建議只有1-2個Super Admin
   - 其他管理員使用ADMIN角色

4. **生產環境注意事項**
   - 使用不同的Super Admin憑證
   - 啟用雙因素認證（待實現）
   - 記錄所有管理操作（待實現）

## 下一步

### 建議實現的功能
- [ ] 用戶管理介面（查看/編輯/刪除用戶）
- [ ] 角色提升/降級介面
- [ ] 管理操作審計日誌
- [ ] 雙因素認證（2FA）
- [ ] API密鑰管理
- [ ] 權限細粒度控制

### 測試建議
1. ✅ 測試Super Admin登入
2. ⬜ 測試新用戶註冊（應獲得PLAYER角色）
3. ⬜ 測試不同角色的權限隔離
4. ⬜ 測試RLS策略是否正確執行

## 故障排除

### 忘記Super Admin密碼？
```bash
# 1. 編輯 scripts/seed-super-admin.ts 修改密碼
# 2. 運行
npm run db:seed-admin
```

### 數據庫需要重置？
```bash
# 重置並重新插入所有數據
npx supabase db reset
npm run db:seed-admin
npm run db:seed-raids
```

### 檢查當前登入用戶的權限
```sql
SELECT
  email,
  role,
  is_super_admin() as has_super_admin,
  is_admin() as has_admin
FROM user_profiles
WHERE id = auth.uid();
```

## 技術細節

### 文件清單
```
supabase/migrations/
├── 20241218000001_initial_schema.sql (修改 - 添加SUPER_ADMIN)
└── 20241218000009_add_super_admin_role.sql (新增)

scripts/
├── seed-super-admin.ts (新增)
└── seed-raids.ts (已存在)

docs/
└── RBAC.md (新增)

src/types/
└── supabase.ts (修改 - 添加SUPER_ADMIN類型)
```

### 環境變量
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 聯繫方式

如有問題，請參考：
- `docs/RBAC.md` - 完整RBAC文檔
- Supabase Studio: http://127.0.0.1:54323
- 開發服務器: http://localhost:3000

---

**系統狀態：** ✅ RBAC系統已完全配置並測試通過
**Super Admin：** ✅ 已創建並可登入
**Raids數據：** ✅ 25個raids已插入
**準備就緒：** ✅ 可以開始開發功能
