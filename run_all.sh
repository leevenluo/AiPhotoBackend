#!/bin/bash

# 一键启动和测试脚本

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════╗"
echo "║                                                   ║"
echo "║     AI Photo Backend - 一键启动测试脚本          ║"
echo "║                                                   ║"
echo "╚═══════════════════════════════════════════════════╝"
echo -e "${NC}"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

echo -e "${GREEN}✓ Node.js 版本: $(node --version)${NC}"
echo ""

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
    echo ""
fi

# 启动服务（后台运行）
echo "🚀 启动服务..."
node src/app.js > server.log 2>&1 &
SERVER_PID=$!
echo "服务进程 PID: $SERVER_PID"

# 等待服务启动
echo "⏳ 等待服务启动..."
for i in {1..10}; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 服务启动成功！${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 10 ]; then
        echo "❌ 服务启动超时"
        kill $SERVER_PID 2>/dev/null
        exit 1
    fi
done

echo ""
echo "================================"
echo "开始运行测试..."
echo "================================"
echo ""

# 运行测试
node test/test.js

TEST_EXIT_CODE=$?

# 停止服务
echo ""
echo "🛑 停止服务..."
kill $SERVER_PID 2>/dev/null

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════════════════════════╗"
    echo "║                                                   ║"
    echo "║           ✓ 所有测试通过！                       ║"
    echo "║                                                   ║"
    echo "╚═══════════════════════════════════════════════════╝"
    echo -e "${NC}"
else
    echo -e "${YELLOW}"
    echo "⚠️  部分测试失败，请查看上面的详细信息"
    echo -e "${NC}"
fi

echo ""
echo "提示："
echo "- 启动开发服务器: npm run dev"
echo "- 运行测试: npm test"
echo "- 查看日志: tail -f server.log"
