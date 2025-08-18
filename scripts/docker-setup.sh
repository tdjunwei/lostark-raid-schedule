#!/bin/bash
# Lost Ark 副本日程表系統 Docker 設置腳本

set -e

echo "🚀 Lost Ark 副本日程表系統 Docker 設置"
echo "======================================"

# 檢查 Docker 是否已安裝
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安裝，請先安裝 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安裝，請先安裝 Docker Compose"
    exit 1
fi

echo "✅ Docker 環境檢查通過"

# 選擇環境
echo ""
echo "請選擇要啟動的環境："
echo "1) 生產環境 (docker-compose.yml)"
echo "2) 開發環境 (docker-compose.dev.yml)"
read -p "請輸入選擇 (1 或 2): " env_choice

# 設置環境變數檔案
if [ "$env_choice" = "1" ]; then
    COMPOSE_FILE="docker-compose.yml"
    ENV_FILE=".env.docker"
    echo "📦 啟動生產環境..."
elif [ "$env_choice" = "2" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
    ENV_FILE=".env.example"
    echo "🔧 啟動開發環境..."
else
    echo "❌ 無效選擇"
    exit 1
fi

# 複製環境變數檔案
if [ ! -f ".env" ]; then
    echo "📝 複製環境變數檔案..."
    cp "$ENV_FILE" ".env"
    echo "✅ 請編輯 .env 檔案設置您的環境變數"
fi

# 建立必要的目錄
echo "📁 建立必要目錄..."
mkdir -p uploads
mkdir -p logs

# 停止並清理舊的容器 (如果存在)
echo "🧹 清理舊容器..."
docker-compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true

# 建構映像
echo "🏗️  建構 Docker 映像..."
docker-compose -f "$COMPOSE_FILE" build --no-cache

# 啟動服務
echo "🚀 啟動服務..."
docker-compose -f "$COMPOSE_FILE" up -d

# 等待服務啟動
echo "⏳ 等待服務啟動..."
sleep 30

# 檢查服務狀態
echo "🔍 檢查服務狀態..."
docker-compose -f "$COMPOSE_FILE" ps

echo ""
echo "✅ 部署完成！"
echo ""
if [ "$env_choice" = "1" ]; then
    echo "🌐 應用程式: http://localhost:3000"
    echo "🗄️  Supabase Studio: http://localhost:3001"
    echo "📧 Inbucket (測試郵件): http://localhost:54324"
elif [ "$env_choice" = "2" ]; then
    echo "🌐 應用程式: http://localhost:3000"
    echo "🗄️  Supabase Studio: http://localhost:54323"
    echo "📧 Inbucket (測試郵件): http://localhost:54324"
    echo "🔧 PostgreSQL: localhost:54322"
    echo "🚀 Redis: localhost:6379"
fi

echo ""
echo "📋 常用指令："
echo "   查看日誌: docker-compose -f $COMPOSE_FILE logs -f"
echo "   停止服務: docker-compose -f $COMPOSE_FILE down"
echo "   重啟服務: docker-compose -f $COMPOSE_FILE restart"
echo ""
echo "🎉 Happy coding!"