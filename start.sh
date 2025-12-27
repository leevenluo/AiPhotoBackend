#!/bin/bash

echo "================================"
echo "AI Photo Backend 启动脚本"
echo "================================"

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: Node.js 未安装"
    echo "请访问 https://nodejs.org 下载安装"
    exit 1
fi

echo "✓ Node.js 版本: $(node --version)"
echo "✓ npm 版本: $(npm --version)"
echo ""

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖中..."
    npm install
    
    if [ $? -eq 0 ]; then
        echo "✓ 依赖安装成功"
    else
        echo "❌ 依赖安装失败"
        exit 1
    fi
else
    echo "✓ 依赖已安装"
fi

echo ""
echo "🚀 启动服务..."
echo ""

npm run dev
