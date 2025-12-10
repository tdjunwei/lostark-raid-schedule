#!/bin/bash

# Lost Ark Raid Schedule - 開發環境啟動腳本
# 一鍵啟動 Supabase + Next.js App + Redis

set -e

echo "🚀 Lost Ark Raid Schedule - 開發環境啟動"
echo "=========================================="

# 檢查 Docker 是否運行
if ! docker info > /dev/null 2>&1; then
    echo "❌ 錯誤：Docker 未運行，請先啟動 Docker Desktop"
    exit 1
fi

# 檢查 .env.local 是否存在
if [ ! -f .env.local ]; then
    echo "⚠️  警告：.env.local 不存在"
    echo "正在從 supabase 配置複製..."

    # 從 supabase CLI 狀態獲取配置
    if command -v supabase &> /dev/null; then
        echo "NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321" > .env.local
        ANON_KEY=$(supabase status --output json 2>/dev/null | jq -r '.ANON_KEY' || echo "")
        SERVICE_KEY=$(supabase status --output json 2>/dev/null | jq -r '.SERVICE_ROLE_KEY' || echo "")

        if [ -n "$ANON_KEY" ]; then
            echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY" >> .env.local
        fi
        if [ -n "$SERVICE_KEY" ]; then
            echo "SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY" >> .env.local
        fi

        echo "✅ 已創建 .env.local"
    else
        echo "❌ 錯誤：找不到 supabase CLI，請手動創建 .env.local"
        exit 1
    fi
fi

# 載入環境變量
export $(cat .env.local | grep -v '^#' | xargs)

echo ""
echo "📦 正在啟動服務..."
echo ""

# 1. 啟動 Supabase（如果還沒啟動）
echo "🔵 檢查 Supabase 狀態..."
if ! docker ps | grep -q "supabase-db"; then
    echo "   啟動 Supabase 服務..."
    docker compose up -d

    echo "   等待 Supabase 初始化..."
    sleep 10

    # 等待數據庫就緒
    echo "   等待數據庫就緒..."
    until docker exec supabase-db pg_isready -U postgres > /dev/null 2>&1; do
        echo "   數據庫尚未就緒，等待中..."
        sleep 2
    done

    echo "   ✅ Supabase 已啟動"
else
    echo "   ✅ Supabase 已在運行"
fi

# 2. 啟動 Next.js App + Redis
echo ""
echo "🟢 啟動 Next.js 應用..."
docker compose -f docker-compose.app.yml up -d

echo ""
echo "⏳ 等待服務啟動..."
sleep 5

# 檢查服務狀態
echo ""
echo "📊 服務狀態檢查："
echo "=========================================="

# 檢查 Supabase
if docker ps | grep -q "supabase-db"; then
    echo "✅ Supabase DB       http://127.0.0.1:54322"
    echo "✅ Supabase Studio   http://127.0.0.1:54323"
    echo "✅ Supabase API      http://127.0.0.1:54321"
else
    echo "❌ Supabase 未運行"
fi

# 檢查 Next.js
if docker ps | grep -q "lostark-app"; then
    echo "✅ Next.js App       http://localhost:3000"
else
    echo "❌ Next.js App 未運行"
fi

# 檢查 Redis
if docker ps | grep -q "lostark-redis"; then
    echo "✅ Redis             redis://localhost:6379"
else
    echo "❌ Redis 未運行"
fi

echo ""
echo "=========================================="
echo "🎉 開發環境啟動完成！"
echo ""
echo "📝 常用命令："
echo "   查看日誌:    docker compose -f docker-compose.app.yml logs -f app"
echo "   停止服務:    ./stop-dev.sh"
echo "   重啟應用:    docker compose -f docker-compose.app.yml restart app"
echo "   進入容器:    docker exec -it lostark-app sh"
echo ""
echo "🌐 訪問地址："
echo "   應用:        http://localhost:3000"
echo "   Supabase:    http://127.0.0.1:54323"
echo ""
echo "按 Ctrl+C 退出（服務將繼續在後台運行）"
echo "=========================================="

# 顯示應用日誌
docker compose -f docker-compose.app.yml logs -f app
