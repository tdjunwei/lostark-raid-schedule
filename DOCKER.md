# Docker 開發環境使用指南

## 快速開始

### 一鍵啟動（推薦）

```bash
# 賦予腳本執行權限（首次運行）
chmod +x start-dev.sh stop-dev.sh

# 啟動開發環境
./start-dev.sh
```

這會自動啟動：
- ✅ Supabase (PostgreSQL, Auth, Storage, etc.)
- ✅ Next.js 應用（支持熱重載）
- ✅ Redis 緩存

### 停止服務

```bash
./stop-dev.sh
```

## 服務訪問

啟動後，你可以訪問：

| 服務 | 地址 | 說明 |
|------|------|------|
| **Next.js 應用** | http://localhost:3000 | 主應用 |
| **Supabase Studio** | http://127.0.0.1:54323 | 數據庫管理界面 |
| **Supabase API** | http://127.0.0.1:54321 | REST API |
| **PostgreSQL** | postgresql://postgres:postgres@127.0.0.1:54322/postgres | 數據庫連接 |
| **Redis** | redis://localhost:6379 | Redis 緩存 |

## 手動操作

### 啟動所有服務

```bash
# 啟動 Supabase
docker compose up -d

# 啟動 Next.js 應用
docker compose -f docker-compose.app.yml up -d
```

### 查看日誌

```bash
# 查看所有服務日誌
docker compose -f docker-compose.app.yml logs -f

# 只查看應用日誌
docker compose -f docker-compose.app.yml logs -f app

# 查看 Supabase 日誌
docker compose logs -f db
```

### 重啟服務

```bash
# 重啟 Next.js 應用
docker compose -f docker-compose.app.yml restart app

# 重啟 Redis
docker compose -f docker-compose.app.yml restart redis

# 重啟 Supabase
docker compose restart
```

### 停止服務

```bash
# 停止 Next.js 應用
docker compose -f docker-compose.app.yml down

# 停止 Supabase
docker compose down

# 停止並刪除所有數據（危險！）
docker compose down -v
```

## 進入容器

```bash
# 進入 Next.js 應用容器
docker exec -it lostark-app sh

# 進入 PostgreSQL 容器
docker exec -it supabase-db psql -U postgres

# 進入 Redis 容器
docker exec -it lostark-redis redis-cli
```

## 數據庫操作

### 重置數據庫

```bash
# 在宿主機上使用 supabase CLI
npx supabase db reset

# 或在容器內執行
docker exec -it lostark-app npm run db:reset
```

### 運行種子腳本

```bash
# 創建 Super Admin
docker exec -it lostark-app npm run db:seed-admin

# 插入 Raids 數據
docker exec -it lostark-app npm run db:seed-raids
```

### 查看數據庫

```bash
# 使用 Supabase Studio
open http://127.0.0.1:54323

# 或使用 psql
docker exec -it supabase-db psql -U postgres -d postgres
```

## 開發工作流

### 代碼熱重載

代碼修改後會自動重載，無需重啟容器。

### 安裝新依賴

```bash
# 方法 1: 在宿主機上安裝
npm install <package-name>

# 方法 2: 在容器內安裝
docker exec -it lostark-app npm install <package-name>

# 重建容器以應用更改
docker compose -f docker-compose.app.yml up -d --build app
```

### 清理並重建

```bash
# 停止所有服務
docker compose -f docker-compose.app.yml down
docker compose down

# 刪除舊映像
docker rmi lostark-raid-schedule-app

# 重建並啟動
./start-dev.sh
```

## 環境變量

### 必需的環境變量 (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 獲取 Supabase 密鑰

```bash
# 使用 supabase CLI
npx supabase status --output json | jq -r '.ANON_KEY, .SERVICE_ROLE_KEY'

# 或訪問 Supabase Studio
open http://127.0.0.1:54323
# Settings → API → API Keys
```

## 故障排除

### 端口衝突

如果端口被占用：

```bash
# 查找占用端口的進程
lsof -ti:3000 -ti:54321 -ti:54322 -ti:54323 -ti:6379

# 殺死進程
kill -9 $(lsof -ti:3000)

# 或修改端口
# 編輯 docker-compose.app.yml 修改 ports 配置
```

### 容器無法啟動

```bash
# 查看錯誤日誌
docker compose -f docker-compose.app.yml logs app

# 檢查 Docker 資源
docker system df

# 清理未使用的資源
docker system prune -a
```

### 數據庫連接失敗

```bash
# 檢查數據庫是否運行
docker ps | grep supabase-db

# 檢查數據庫健康狀態
docker exec supabase-db pg_isready -U postgres

# 重啟數據庫
docker compose restart db
```

### 熱重載不工作

```bash
# 確認 volumes 掛載正確
docker inspect lostark-app | jq '.[0].Mounts'

# 嘗試設置 WATCHPACK_POLLING
# 已在 docker-compose.app.yml 中設置
```

## 性能優化

### 減少映像大小

生產環境使用多階段構建：

```bash
docker build -t lostark-app:prod -f Dockerfile .
```

### 緩存優化

```bash
# 使用 BuildKit
export DOCKER_BUILDKIT=1
docker compose -f docker-compose.app.yml build --no-cache
```

## 生產部署

### 使用 Docker 部署

```bash
# 構建生產映像
docker build -t lostark-app:latest .

# 運行生產容器
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_production_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key \
  lostark-app:latest
```

### 使用 Netlify 部署

請參考 [NETLIFY.md](./NETLIFY.md)

## 參考資料

- [Next.js Docker 文檔](https://nextjs.org/docs/deployment#docker-image)
- [Supabase 本地開發](https://supabase.com/docs/guides/cli/local-development)
- [Docker Compose 文檔](https://docs.docker.com/compose/)
