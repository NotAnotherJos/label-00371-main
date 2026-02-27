#!/bin/bash

echo "========================================"
echo "  MCP Puppeteer Client - 一键启动"
echo "========================================"
echo

cd "$(dirname "$0")/mcp-puppeteer-client"

echo "[1/2] 检查并安装依赖..."
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖，请稍候..."
    npm install
    if [ $? -ne 0 ]; then
        echo "依赖安装失败！"
        exit 1
    fi
    echo "依赖安装完成！"
else
    echo "依赖已存在，跳过安装。"
fi

echo
echo "[2/2] 启动演示程序..."
echo "----------------------------------------"
echo

npm run demo

echo
echo "========================================"
echo "  演示完成！"
echo "========================================"
