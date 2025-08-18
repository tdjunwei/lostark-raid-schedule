# Lost Ark 副本日程表系統 - Docker 部署指南

## 🐳 Docker 環境說明

本系統提供完整的 Docker 容器化解決方案，包含：

- **Next.js 應用程式** - 主要 Web 應用
- **Supabase** - 完整的 BaaS 解決方案
- **PostgreSQL** - 資料庫
- **Redis** - 快取服務
- **Kong** - API Gateway
- **開發工具** - Studio、Inbucket 等

## 🚀 快速開始

### 前置需求

1. **Docker** 20.10+
2. **Docker Compose** 2.0+
3. **8GB+ RAM** (推薦)

### 一鍵部署

```bash
# 執行自動設置腳本
./scripts/docker-setup.sh
```

腳本會自動：
- 檢查 Docker 環境
- 選擇部署環境 (生產/開發)
- 複製環境變數
- 建構和啟動所有服務

## 📦 部署環境

### 生產環境

```bash
# 建構並啟動生產環境
docker-compose up -d --build

# 查看服務狀態
docker-compose ps

# 查看日誌
docker-compose logs -f app
```

**服務端點:**
- 🌐 主應用程式: http://localhost:3000
- 🗄️  Supabase Studio: http://localhost:3001
- 🔗 Supabase API: http://localhost:8000
- 📧 測試郵件: http://localhost:54324

### 開發環境

```bash
# 啟動開發環境 (包含熱重載)
docker-compose -f docker-compose.dev.yml up -d --build

# 查看開發服務
docker-compose -f docker-compose.dev.yml ps
```

**開發服務端點:**
- 🌐 Next.js Dev Server: http://localhost:3000
- 🗄️  Supabase Studio: http://localhost:54323
- 🔗 PostgreSQL: localhost:54322
- 🚀 Redis: localhost:6379
- 📧 測試郵件: http://localhost:54324

## ⚙️ 環境配置

### 生產環境配置 (.env.docker)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 資料庫
POSTGRES_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-32-char-jwt-secret
```

### 開發環境配置 (.env.example)

```env
# 開發用 Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-anon-key

# 本地資料庫
POSTGRES_PASSWORD=postgres
```

## 🏗️ 服務架構

### 生產環境架構

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│             │    │              │    │             │
│  Next.js    │◄──►│     Kong     │◄──►│  Supabase   │
│     App     │    │   Gateway    │    │  Services   │
│             │    │              │    │             │
└─────────────┘    └──────────────┘    └─────────────┘
       │                                       │
       ▼                                       ▼
┌─────────────┐                    ┌─────────────────┐
│             │                    │                 │
│    Redis    │                    │   PostgreSQL    │
│             │                    │                 │
└─────────────┘                    └─────────────────┘
```

### 主要服務

| 服務 | 端口 | 說明 |
|------|------|------|
| app | 3000 | Next.js 主應用 |
| supabase-kong | 8000 | API Gateway |
| supabase-studio | 3001 | 管理界面 |
| supabase-db | 5432 | PostgreSQL 資料庫 |
| redis | 6379 | Redis 快取 |

## 🔧 管理指令

### 基本操作

```bash
# 啟動所有服務
docker-compose up -d

# 停止所有服務
docker-compose down

# 重啟服務
docker-compose restart [service_name]

# 查看服務狀態
docker-compose ps

# 查看服務日誌
docker-compose logs -f [service_name]
```

### 資料庫操作

```bash
# 連接到 PostgreSQL
docker-compose exec supabase-db psql -U postgres -d postgres

# 執行資料庫遷移
docker-compose exec app npm run db:migrate

# 重置資料庫
docker-compose down -v
docker-compose up -d
```

### 應用程式管理

```bash
# 重新建構應用程式
docker-compose build --no-cache app

# 查看應用程式日誌
docker-compose logs -f app

# 進入應用程式容器
docker-compose exec app sh
```

## 📊 監控和日誌

### 服務健康檢查

```bash
# 檢查所有服務狀態
docker-compose ps

# 檢查特定服務健康狀況
docker-compose exec app curl http://localhost:3000/api/health
```

### 日誌管理

```bash
# 查看所有服務日誌
docker-compose logs

# 即時追蹤特定服務日誌
docker-compose logs -f app

# 查看最近的日誌
docker-compose logs --tail=100 app
```

## 🔍 故障排除

### 常見問題

**1. 端口被佔用**
```bash
# 查看端口使用情況
lsof -i :3000
lsof -i :8000

# 修改 docker-compose.yml 中的端口映射
```

**2. 容器無法啟動**
```bash
# 查看詳細錯誤信息
docker-compose logs [service_name]

# 重新建構容器
docker-compose build --no-cache [service_name]
```

**3. 資料庫連接失敗**
```bash
# 檢查資料庫容器狀態
docker-compose ps supabase-db

# 查看資料庫日誌
docker-compose logs supabase-db

# 重啟資料庫
docker-compose restart supabase-db
```

**4. 記憶體不足**
```bash
# 查看容器資源使用
docker stats

# 增加 Docker 記憶體限制
# Docker Desktop > Settings > Resources > Memory
```

### 清理命令

```bash
# 停止並清理所有容器、網絡、數據卷
docker-compose down -v --remove-orphans

# 清理未使用的 Docker 資源
docker system prune -a

# 重新建構所有服務
docker-compose build --no-cache
```

## 🚀 生產部署最佳實踐

### 安全設定

1. **更改預設密碼**
   ```bash
   # 修改 .env 中的密碼
   POSTGRES_PASSWORD=your-strong-password
   JWT_SECRET=your-32-character-secret
   ```

2. **使用 HTTPS**
   ```bash
   # 配置 SSL 證書
   # 使用 nginx 或 Traefik 作為反向代理
   ```

3. **限制網絡訪問**
   ```yaml
   # docker-compose.yml
   networks:
     lostark-network:
       driver: bridge
       internal: true  # 限制外部訪問
   ```

### 效能優化

1. **資源限制**
   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             memory: 512M
             cpus: '0.5'
   ```

2. **數據卷優化**
   ```yaml
   volumes:
     supabase-db-data:
       driver: local
       driver_opts:
         type: none
         device: /opt/lostark/db
         o: bind
   ```

### 備份策略

```bash
# 定期備份資料庫
docker-compose exec supabase-db pg_dump -U postgres postgres > backup.sql

# 備份數據卷
docker run --rm -v lostark_supabase-db-data:/data -v $(pwd):/backup alpine tar czf /backup/db-backup.tar.gz /data
```

## 📈 擴展部署

### 水平擴展

```yaml
# docker-compose.scale.yml
services:
  app:
    scale: 3  # 運行 3 個應用實例
    
  nginx:  # 負載均衡
    image: nginx:alpine
    ports:
      - "80:80"
    depends_on:
      - app
```

### 微服務架構

```yaml
services:
  # API 服務
  api:
    build: ./api
    
  # 前端服務  
  frontend:
    build: ./frontend
    
  # 背景任務
  worker:
    build: ./worker
```

---

**支援聯絡**: 如有問題請查看 [GitHub Issues](https://github.com/your-repo/issues)