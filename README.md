# Lost Ark 出團管理系統

一個使用 Next.js 建構的 Lost Ark 團隊排程管理系統，具備即時協作功能，類似 Google Sheets 的體驗。

## 功能特色

- 🎮 **團隊管理** - 管理玩家資料與角色裝等
- 📅 **排程系統** - 視覺化時段安排與玩家可用性
- ⚔️ **副本管理** - 天界、夢幻、象牙塔、瘟疫等副本團隊管理
- 💰 **收益追蹤** - 自動計算與分配金幣獎勵
- 🔄 **即時同步** - 多人同時編輯，即時反映變更
- 📊 **資料匯入** - 支援從 Excel 檔案匯入現有資料

## 技術架構

- **前端**: Next.js 15.4, TypeScript, Tailwind CSS v4
- **UI 元件**: shadcn/ui
- **資料庫**: PostgreSQL + Prisma ORM
- **即時通訊**: Socket.io
- **狀態管理**: Zustand
- **快取**: Redis

## 開發環境設定

### 前置需求

- Node.js 18+
- PostgreSQL
- Redis

### 安裝步驟

1. 複製專案
```bash
git clone <repository-url>
cd lostark-raid-schedule
```

2. 安裝相依套件
```bash
npm install
```

3. 設定環境變數
```bash
cp .env.example .env
# 編輯 .env 檔案，設定資料庫連線資訊
```

4. 初始化資料庫
```bash
npx prisma db push
```

5. 啟動開發伺服器
```bash
npm run dev
```

應用程式將在 http://localhost:3000 啟動

## 資料庫指令

```bash
# 產生 Prisma 客戶端
npx prisma generate

# 同步資料庫結構
npx prisma db push

# 建立 migration
npx prisma migrate dev --name <migration-name>

# 開啟 Prisma Studio
npx prisma studio
```

## 專案結構

```
lostark-raid-schedule/
├── src/
│   ├── app/                    # Next.js 頁面路由
│   │   ├── players/           # 玩家管理頁面
│   │   ├── schedule/          # 排程管理頁面
│   │   └── raids/             # 副本管理頁面
│   ├── components/            # React 元件
│   │   └── ui/                # shadcn/ui 元件
│   └── lib/                   # 工具函式
├── prisma/                    # 資料庫結構定義
└── original-files/            # 原始 Excel 檔案
```

## 部署

### 建構生產版本

```bash
npm run build
npm start
```

### 環境變數

生產環境需要設定以下環境變數：

- `DATABASE_URL` - PostgreSQL 連線字串
- `NEXTAUTH_SECRET` - NextAuth.js 密鑰
- `REDIS_URL` - Redis 連線字串

## 貢獻

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 檔案