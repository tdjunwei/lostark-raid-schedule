# Netlify 部署指南

## 快速部署

### 前提條件

1. GitHub/GitLab/Bitbucket 賬號
2. Netlify 賬號（https://netlify.com）
3. Supabase 生產環境（https://supabase.com）

### 步驟 1: 準備 Supabase

1. 訪問 [Supabase Dashboard](https://supabase.com/dashboard)
2. 創建新項目或使用現有項目
3. 獲取 API 密鑰：
   - Project Settings → API
   - 複製 `URL` 和 `anon key`

### 步驟 2: 推送代碼到 Git

```bash
# 初始化 Git（如果還沒有）
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub
git remote add origin https://github.com/your-username/lostark-raid-schedule.git
git push -u origin main
```

### 步驟 3: 連接 Netlify

1. 登入 [Netlify](https://app.netlify.com)
2. 點擊 **"Add new site" → "Import an existing project"**
3. 選擇你的 Git 提供商（GitHub/GitLab/Bitbucket）
4. 選擇 `lostark-raid-schedule` 倉庫

### 步驟 4: 配置構建設置

Netlify 會自動檢測到 `netlify.toml`，但你也可以手動確認：

**Build settings:**
```
Build command: npm run build
Publish directory: .next
```

### 步驟 5: 設置環境變量

在 Netlify Dashboard：

1. Site settings → Environment variables
2. 添加以下變量：

```bash
# Supabase 配置（必需）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Next.js 配置
NODE_VERSION=22
NPM_VERSION=10
```

### 步驟 6: 安裝 Next.js 插件

```bash
# 安裝依賴
npm install --save-dev @netlify/plugin-nextjs

# 已在 netlify.toml 中配置
```

### 步驟 7: 部署

1. 點擊 **"Deploy site"**
2. 等待構建完成（約 2-5 分鐘）
3. 訪問生成的 URL（如：`https://your-site-name.netlify.app`）

## 高級配置

### 自定義域名

1. Site settings → Domain management
2. 點擊 **"Add custom domain"**
3. 輸入你的域名（如：`lostark.example.com`）
4. 按照指示配置 DNS 記錄

### HTTPS 證書

Netlify 自動提供免費 Let's Encrypt SSL 證書。

### 持續部署

每次推送到 `main` 分支會自動部署：

```bash
git add .
git commit -m "Update feature"
git push origin main
```

### 預覽部署

Pull Request 會自動創建預覽部署：

```bash
git checkout -b feature/new-feature
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
# 在 GitHub 創建 Pull Request
```

### 部署鉤子

在 `netlify.toml` 中已配置：

```toml
[context.production]
  command = "npm run build"
  environment = { NODE_ENV = "production" }

[context.deploy-preview]
  command = "npm run build"
```

## 數據庫遷移

### 運行遷移

在 Supabase Dashboard：

1. SQL Editor
2. 複製 `supabase/migrations/*.sql` 的內容
3. 執行 SQL

或使用 Supabase CLI：

```bash
# 連接到生產環境
npx supabase link --project-ref your-project-ref

# 推送遷移
npx supabase db push

# 運行種子腳本
npm run db:seed-admin
npm run db:seed-raids
```

## 性能優化

### 啟用 Edge Functions

netlify.toml 已配置自動優化。

### 圖片優化

Next.js 圖片會自動優化。確保使用 `next/image`：

```tsx
import Image from 'next/image'

<Image
  src="/icons/jobs/destroyer.png"
  alt="Destroyer"
  width={32}
  height={32}
/>
```

### 緩存策略

在 `netlify.toml` 中已配置：

```toml
[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## 監控與分析

### Netlify Analytics

1. Site settings → Analytics
2. 啟用 Netlify Analytics（付費功能）

### 日誌查看

1. Deploys → 選擇部署
2. Deploy log → 查看構建日誌

### 錯誤追蹤

使用 Sentry 或其他錯誤追蹤服務：

```bash
npm install @sentry/nextjs
```

## 環境管理

### 多環境部署

```bash
# 開發環境
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321

# 預覽環境
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co

# 生產環境
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
```

在 Netlify：
- **Production branch**: main
- **Deploy Previews**: 所有分支

## 回滾部署

### 方法 1: Netlify Dashboard

1. Deploys
2. 選擇之前的部署
3. 點擊 **"Publish deploy"**

### 方法 2: Git Revert

```bash
git revert HEAD
git push origin main
```

## 成本優化

### 免費方案限制

- ✅ 100GB 帶寬/月
- ✅ 300 構建分鐘/月
- ✅ 1 並發構建
- ✅ 無限站點

### 升級建議

如果超出免費額度，考慮：
1. **Pro Plan** ($19/月) - 1TB 帶寬，3 並發構建
2. 使用 CDN 減少帶寬
3. 優化圖片大小

## 故障排除

### 構建失敗

```bash
# 查看構建日誌
# Netlify Dashboard → Deploys → Deploy log

# 常見錯誤：
# 1. 缺少環境變量
# 2. Node 版本不匹配
# 3. 依賴安裝失敗
```

### 404 錯誤

確保 `netlify.toml` 包含重定向規則：

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Supabase 連接失敗

檢查環境變量：

```bash
# Netlify Dashboard → Site settings → Environment variables
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 構建超時

```toml
[build]
  command = "npm run build"
  # 增加超時時間
  timeout = 30
```

## 最佳實踐

### 1. 使用環境變量

❌ 不要硬編碼 API 密鑰
✅ 使用環境變量

### 2. 啟用 HTTPS

✅ Netlify 自動提供

### 3. 設置 CSP Headers

已在 `netlify.toml` 配置：

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

### 4. 使用 CDN

✅ Netlify 自動使用全球 CDN

### 5. 監控性能

使用 Lighthouse CI：

```bash
npm install --save-dev @netlify/plugin-lighthouse
```

## 替代方案

如果 Netlify 不適合，考慮：

- **Vercel** - Next.js 官方推薦
- **Railway** - 支持 Docker
- **Fly.io** - 支持 Docker
- **AWS Amplify** - AWS 生態系統

## 參考資料

- [Netlify Next.js 文檔](https://docs.netlify.com/frameworks/next-js/)
- [Supabase 生產部署](https://supabase.com/docs/guides/platform/production-checklist)
- [Next.js 部署文檔](https://nextjs.org/docs/deployment)
