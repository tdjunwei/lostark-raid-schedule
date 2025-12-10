#!/bin/bash

# 驗證 Docker 和配置設置
# 運行此腳本以確保所有內容都已正確配置

echo "🔍 驗證 Lost Ark Raid Schedule 設置"
echo "===================================="
echo ""

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 檢查計數
passed=0
failed=0
warnings=0

# 檢查函數
check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 已安裝"
        ((passed++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 未安裝"
        ((failed++))
        return 1
    fi
}

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 存在"
        ((passed++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 不存在"
        ((failed++))
        return 1
    fi
}

check_executable() {
    if [ -x "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 可執行"
        ((passed++))
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $1 不可執行，正在修復..."
        chmod +x "$1"
        ((warnings++))
        return 1
    fi
}

check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠${NC} 端口 $1 已被占用"
        ((warnings++))
        return 1
    else
        echo -e "${GREEN}✓${NC} 端口 $1 可用"
        ((passed++))
        return 0
    fi
}

# 1. 檢查必需的命令
echo "1. 檢查必需工具:"
echo "-----------------------------------"
check_command "docker"
check_command "node"
check_command "npm"
check_command "git"

# 檢查 Docker 是否運行
if docker info > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Docker daemon 正在運行"
    ((passed++))
else
    echo -e "${RED}✗${NC} Docker daemon 未運行"
    echo "  請啟動 Docker Desktop"
    ((failed++))
fi

echo ""

# 2. 檢查 Docker 配置文件
echo "2. 檢查 Docker 配置:"
echo "-----------------------------------"
check_file "docker-compose.yml"
check_file "docker-compose.app.yml"
check_file "Dockerfile"
check_file "Dockerfile.dev"
check_file ".dockerignore"

echo ""

# 3. 檢查腳本
echo "3. 檢查腳本文件:"
echo "-----------------------------------"
check_file "start-dev.sh"
check_executable "start-dev.sh"
check_file "stop-dev.sh"
check_executable "stop-dev.sh"

echo ""

# 4. 檢查 Netlify 配置
echo "4. 檢查 Netlify 配置:"
echo "-----------------------------------"
check_file "netlify.toml"

echo ""

# 5. 檢查文檔
echo "5. 檢查文檔:"
echo "-----------------------------------"
check_file "DOCKER.md"
check_file "NETLIFY.md"
check_file "QUICK-START.md"

echo ""

# 6. 檢查環境配置
echo "6. 檢查環境配置:"
echo "-----------------------------------"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local 存在"
    ((passed++))

    # 檢查必需的環境變量
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo -e "${GREEN}✓${NC}   NEXT_PUBLIC_SUPABASE_URL 已配置"
        ((passed++))
    else
        echo -e "${YELLOW}⚠${NC}   NEXT_PUBLIC_SUPABASE_URL 未配置"
        ((warnings++))
    fi

    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo -e "${GREEN}✓${NC}   NEXT_PUBLIC_SUPABASE_ANON_KEY 已配置"
        ((passed++))
    else
        echo -e "${YELLOW}⚠${NC}   NEXT_PUBLIC_SUPABASE_ANON_KEY 未配置"
        ((warnings++))
    fi
else
    echo -e "${YELLOW}⚠${NC} .env.local 不存在"
    echo "  運行 ./start-dev.sh 會自動創建"
    ((warnings++))
fi

echo ""

# 7. 檢查端口
echo "7. 檢查端口可用性:"
echo "-----------------------------------"
check_port 3000
check_port 54321
check_port 54322
check_port 54323
check_port 6379

echo ""

# 8. 檢查 Node 模塊
echo "8. 檢查依賴:"
echo "-----------------------------------"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules 存在"
    ((passed++))
else
    echo -e "${YELLOW}⚠${NC} node_modules 不存在"
    echo "  運行: npm install"
    ((warnings++))
fi

echo ""

# 總結
echo "===================================="
echo "驗證結果:"
echo "-----------------------------------"
echo -e "${GREEN}通過: $passed${NC}"
if [ $warnings -gt 0 ]; then
    echo -e "${YELLOW}警告: $warnings${NC}"
fi
if [ $failed -gt 0 ]; then
    echo -e "${RED}失敗: $failed${NC}"
fi
echo ""

# 給出建議
if [ $failed -eq 0 ]; then
    if [ $warnings -eq 0 ]; then
        echo -e "${GREEN}✓ 所有檢查通過！可以啟動開發環境了${NC}"
        echo ""
        echo "運行以下命令開始開發:"
        echo "  ./start-dev.sh"
    else
        echo -e "${YELLOW}⚠ 有一些警告，但可以繼續${NC}"
        echo ""
        echo "運行以下命令開始開發:"
        echo "  ./start-dev.sh"
    fi
else
    echo -e "${RED}✗ 發現問題，請先解決${NC}"
    echo ""
    echo "常見問題解決方案:"
    echo "  - Docker 未運行: 啟動 Docker Desktop"
    echo "  - 缺少工具: 安裝對應的命令行工具"
    echo "  - 端口被占用: 使用 lsof -ti:<port> | xargs kill -9"
fi

echo ""
