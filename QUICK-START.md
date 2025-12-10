# 🚀 快速開始指南

## 本地開發環境

### 選項 1: Docker Compose（推薦）

**一鍵啟動所有服務：**

```bash
# 首次運行：賦予執行權限
chmod +x start-dev.sh stop-dev.sh

# 啟動開發環境
./start-dev.sh

# 停止開發環境
./stop-dev.sh
```

**訪問地址：**
- 應用: http://localhost:3000
- Supabase Studio: http://127.0.0.1:54323
- 數據庫: postgresql://postgres:postgres@127.0.0.1:54322/postgres

### 選項 2: 傳統方式

```bash
# 1. 安裝依賴
npm install

# 2. 啟動 Supabase
npx supabase start

# 3. 配置環境變量
cp .env.example .env.local
# 編輯 .env.local 填入 Supabase 配置

# 4. 運行遷移
npx supabase db reset

# 5. 運行種子腳本
npm run db:seed-admin  # 創建 Super Admin
npm run db:seed-raids  # 插入 Raids 數據

# 6. 啟動開發服務器
npm run dev
```

## 生產部署

### Netlify（推薦）

1. **推送代碼到 Git**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **在 Netlify 創建項目**
   - 訪問 https://app.netlify.com
   - Import from Git → 選擇倉庫
   - Build settings 自動檢測（已配置 netlify.toml）

3. **設置環境變量**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NODE_VERSION=22
   ```

4. **部署**
   - 點擊 "Deploy site"
   - 等待構建完成

詳細指南: [NETLIFY.md](./NETLIFY.md)

### Docker（自托管）

```bash
# 構建生產映像
docker build -t lostark-app:latest .

# 運行
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  lostark-app:latest
```

詳細指南: [DOCKER.md](./DOCKER.md)

## 初始化數據

### 創建 Super Admin

```bash
# Docker
docker exec -it lostark-app npm run db:seed-admin

# 本地
npm run db:seed-admin
```

**默認帳號：**
- Email: tdjunwei@gmail.com
- Password: QZb]BQV]em%3

### 插入 Raids 數據

```bash
# Docker
docker exec -it lostark-app npm run db:seed-raids

# 本地
npm run db:seed-raids
```

## 常用命令

```bash
# 開發
npm run dev              # 啟動開發服務器
npm run build            # 構建生產版本
npm run start            # 啟動生產服務器

# 數據庫
npm run db:reset         # 重置數據庫
npm run db:seed-admin    # 創建 Super Admin
npm run db:seed-raids    # 插入 Raids 數據

# 代碼質量
npm run lint             # 運行 ESLint
npm run type-check       # TypeScript 類型檢查

# Docker
./start-dev.sh           # 啟動 Docker 開發環境
./stop-dev.sh            # 停止 Docker 開發環境
```

## 項目結構

```
lostark-raid-schedule/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Dashboard 佈局組
│   │   │   └── dashboard/      # Dashboard 頁面
│   │   │       ├── characters/ # 角色管理
│   │   │       ├── schedule/   # 排程管理
│   │   │       ├── raids/      # 副本管理
│   │   │       └── economics/  # 收益管理
│   │   └── api/                # API 路由
│   ├── components/             # React 組件
│   │   ├── ui/                 # shadcn/ui 組件
│   │   ├── characters/         # 角色相關組件
│   │   ├── schedule/           # 排程相關組件
│   │   └── ...
│   ├── lib/                    # 工具函數
│   └── types/                  # TypeScript 類型
├── supabase/
│   └── migrations/             # 數據庫遷移
├── scripts/                    # 工具腳本
├── public/                     # 靜態資源
├── docker-compose.yml          # Supabase Docker Compose
├── docker-compose.app.yml      # App Docker Compose
├── netlify.toml                # Netlify 配置
├── start-dev.sh               # 開發環境啟動腳本
└── stop-dev.sh                # 開發環境停止腳本
```

## 技術棧

- **前端**: Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **UI 組件**: shadcn/ui, Radix UI
- **後端**: Next.js API Routes, Supabase
- **數據庫**: PostgreSQL (Supabase)
- **認證**: NextAuth.js + Supabase Auth
- **緩存**: Redis, ioredis
- **部署**: Netlify / Docker

## 文檔

- [Docker 使用指南](./DOCKER.md)
- [Netlify 部署指南](./NETLIFY.md)
- [RBAC 系統文檔](./docs/RBAC.md)
- [RBAC 快速開始](./README-RBAC.md)
- [項目說明](./CLAUDE.md)

## 疑難排除

### 端口被占用

```bash
# 查找並殺死占用端口的進程
lsof -ti:3000 | xargs kill -9
lsof -ti:54321 | xargs kill -9
```

### Docker 構建失敗

```bash
# 清理並重建
docker system prune -a
./start-dev.sh
```

### Supabase 連接失敗

```bash
# 檢查 Supabase 狀態
npx supabase status

# 重啟 Supabase
npx supabase stop
npx supabase start
```

### 數據庫遷移問題

```bash
# 重置數據庫
npx supabase db reset

# 重新運行種子腳本
npm run db:seed-admin
npm run db:seed-raids
```

## 獲取幫助

- [項目 Issues](https://github.com/your-username/lostark-raid-schedule/issues)
- [Next.js 文檔](https://nextjs.org/docs)
- [Supabase 文檔](https://supabase.com/docs)
- [shadcn/ui 文檔](https://ui.shadcn.com)

## License

MIT
