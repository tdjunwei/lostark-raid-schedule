# RBAC - 基於角色的訪問控制

## 角色層級

系統支援4個角色層級，權限由高至低：

### 1. SUPER_ADMIN（超級管理員）
**權限：**
- ✅ 管理所有用戶（查看、編輯、刪除、變更角色）
- ✅ 管理所有角色（提升/降級用戶權限）
- ✅ 查看和管理所有raid數據
- ✅ 查看和管理所有用戶排程
- ✅ 訪問系統管理功能
- ✅ 執行系統維護操作

**限制：**
- ⚠️ 僅應分配給系統擁有者
- ⚠️ 應通過seed腳本創建，不能通過註冊獲得

### 2. ADMIN（管理員）
**權限：**
- ✅ 管理raid配置
- ✅ 查看所有用戶的排程和角色
- ✅ 創建和管理raid實例
- ✅ 分配玩家到raids
- ✅ 管理raid獎勵分配

**限制：**
- ❌ 不能提升用戶為ADMIN或SUPER_ADMIN
- ❌ 不能刪除其他ADMIN用戶

### 3. SCHEDULER（排程員）
**權限：**
- ✅ 創建和管理raid實例
- ✅ 查看所有玩家的排程
- ✅ 分配玩家到raids
- ✅ 更新raid狀態

**限制：**
- ❌ 不能修改系統配置
- ❌ 不能變更用戶角色
- ❌ 不能管理raid獎勵分配（只能查看）

### 4. PLAYER（玩家）- 默認角色
**權限：**
- ✅ 管理自己的角色
- ✅ 設置自己的排程
- ✅ 查看可用的raids
- ✅ 申請參加raids
- ✅ 查看自己的獎勵

**限制：**
- ❌ 不能查看其他玩家的完整資料
- ❌ 不能創建raid實例
- ❌ 只能管理自己的數據

## Super Admin 設置

### 創建Super Admin用戶

系統已預設一個Super Admin帳號：

```
Email: tdjunwei@gmail.com
Password: QZb]BQV]em%3
Role: SUPER_ADMIN
```

### 手動創建額外的Super Admin

如需創建額外的Super Admin，請修改 `scripts/seed-super-admin.ts` 文件中的配置：

```typescript
const SUPER_ADMIN: SuperAdminConfig = {
  email: 'your-email@example.com',
  password: 'your-secure-password',
  name: 'Admin Name',
}
```

然後執行：
```bash
npm run db:seed-admin
```

## 新用戶註冊

### 默認行為
- 📝 新用戶通過註冊表單註冊
- 🔑 自動分配 `PLAYER` 角色
- ❌ 不能通過註冊獲得管理員權限

### 提升用戶權限

只有 `SUPER_ADMIN` 可以提升用戶角色：

```sql
-- 提升用戶為ADMIN
UPDATE user_profiles
SET role = 'ADMIN'
WHERE email = 'user@example.com';

-- 提升用戶為SCHEDULER
UPDATE user_profiles
SET role = 'SCHEDULER'
WHERE email = 'user@example.com';
```

或通過管理介面（需要實現）。

## 權限檢查函數

系統提供以下PostgreSQL函數用於權限檢查：

### `is_super_admin()`
檢查當前用戶是否為SUPER_ADMIN：
```sql
SELECT is_super_admin(); -- Returns: true/false
```

### `is_admin_or_super()`
檢查當前用戶是否為ADMIN或SUPER_ADMIN：
```sql
SELECT is_admin_or_super(); -- Returns: true/false
```

### `is_admin()`
檢查當前用戶是否為ADMIN或SUPER_ADMIN（向下兼容）：
```sql
SELECT is_admin(); -- Returns: true/false
```

## RLS策略示例

### 用戶資料訪問
```sql
-- Super Admins可以管理所有用戶資料
CREATE POLICY "Super admins can manage all profiles"
ON user_profiles
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Admins可以查看所有用戶資料
CREATE POLICY "Admins can view all profiles"
ON user_profiles
FOR SELECT
USING (is_admin());

-- 玩家只能查看和修改自己的資料
CREATE POLICY "Users can manage their own profile"
ON user_profiles
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

## 安全建議

### 密碼管理
- ⚠️ Super Admin密碼應該定期更換
- ⚠️ 使用強密碼（至少16字符，包含大小寫字母、數字和特殊字符）
- ⚠️ 不要在代碼中硬編碼密碼
- ⚠️ 不要將 `.env.local` 提交到版本控制

### 訪問控制
- 🔒 限制Super Admin帳號數量（建議1-2個）
- 🔒 定期審查用戶角色分配
- 🔒 使用日誌記錄所有管理操作
- 🔒 實施雙因素認證（2FA）用於管理員帳號

### 環境隔離
- 🏗️ 生產環境和開發環境使用不同的Super Admin帳號
- 🏗️ 測試環境可以有額外的測試管理員帳號
- 🏗️ 不要在生產環境使用開發環境的憑證

## 常見操作

### 查看所有用戶及其角色
```sql
SELECT email, name, role, created_at
FROM user_profiles
ORDER BY
  CASE role
    WHEN 'SUPER_ADMIN' THEN 1
    WHEN 'ADMIN' THEN 2
    WHEN 'SCHEDULER' THEN 3
    WHEN 'PLAYER' THEN 4
  END,
  created_at;
```

### 統計各角色用戶數量
```sql
SELECT role, COUNT(*) as count
FROM user_profiles
GROUP BY role
ORDER BY
  CASE role
    WHEN 'SUPER_ADMIN' THEN 1
    WHEN 'ADMIN' THEN 2
    WHEN 'SCHEDULER' THEN 3
    WHEN 'PLAYER' THEN 4
  END;
```

### 查找所有管理員
```sql
SELECT email, name, role
FROM user_profiles
WHERE role IN ('SUPER_ADMIN', 'ADMIN', 'SCHEDULER')
ORDER BY created_at DESC;
```

## 故障排除

### 忘記Super Admin密碼
如果忘記Super Admin密碼，執行以下步驟：

1. 修改 `scripts/seed-super-admin.ts` 中的密碼
2. 運行 `npm run db:seed-admin`
3. 腳本會更新現有用戶的密碼

### 意外降級Super Admin
如果Super Admin被意外降級：

```sql
-- 直接在數據庫中恢復
UPDATE user_profiles
SET role = 'SUPER_ADMIN'
WHERE email = 'tdjunwei@gmail.com';
```

### 檢查當前用戶權限
```sql
-- 查看當前登入用戶的權限
SELECT
  email,
  role,
  is_super_admin() as has_super_admin,
  is_admin() as has_admin
FROM user_profiles
WHERE id = auth.uid();
```

## 未來改進

- [ ] 實現Web界面的用戶角色管理
- [ ] 添加角色變更的審計日誌
- [ ] 實施雙因素認證（2FA）
- [ ] 添加角色權限的細粒度控制
- [ ] 實現臨時權限提升（sudo模式）
- [ ] 添加API密鑰管理用於程序化訪問
