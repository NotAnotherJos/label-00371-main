@echo off
chcp 65001 >nul
echo ========================================
echo   MCP Puppeteer Client - 一键启动
echo ========================================
echo.

cd /d "%~dp0mcp-puppeteer-client"

echo [1/2] 检查并安装依赖...
if not exist "node_modules" (
    echo 正在安装依赖，请稍候...
    call npm install
    if errorlevel 1 (
        echo 依赖安装失败！
        pause
        exit /b 1
    )
    echo 依赖安装完成！
) else (
    echo 依赖已存在，跳过安装。
)

echo.
echo [2/2] 启动演示程序...
echo ----------------------------------------
echo.

call npm run demo

echo.
echo ========================================
echo   演示完成！
echo ========================================
pause
