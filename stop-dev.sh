#!/bin/bash

# Lost Ark Raid Schedule - 開發環境停止腳本

set -e

echo "🛑 Lost Ark Raid Schedule - 停止開發環境"
echo "=========================================="

# 停止 Next.js App
echo "🔴 停止 Next.js 應用..."
docker compose -f docker-compose.app.yml down

# 詢問是否停止 Supabase
read -p "是否同時停止 Supabase? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔴 停止 Supabase..."
    docker compose down
    echo "✅ Supabase 已停止"
fi

echo ""
echo "✅ 開發環境已停止"
echo ""
echo "重新啟動: ./start-dev.sh"
