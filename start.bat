@echo off
chcp 65001 >nul 2>&1
title 入卷 AIRP

echo ============================================
echo   入卷 AIRP - AI Interactive Roleplay Novel
echo ============================================
echo.

REM Check Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    where python3 >nul 2>&1
    if %errorlevel% neq 0 (
        echo [错误] 未检测到 Python，请先安装 Python 3.8+
        echo 下载地址: https://www.python.org/downloads/
        echo 安装时请勾选 "Add Python to PATH"
        pause
        exit /b 1
    )
    set PYTHON=python3
) else (
    set PYTHON=python
)

REM Check Python version
%PYTHON% -c "import sys; exit(0 if sys.version_info >= (3, 8) else 1)" 2>nul
if %errorlevel% neq 0 (
    echo [错误] Python 版本过低，需要 3.8+
    %PYTHON% --version
    pause
    exit /b 1
)

REM Navigate to script directory
cd /d "%~dp0"

echo [启动] 正在启动服务器...
echo [信息] 按 Ctrl+C 停止服务器
echo.

REM Open browser after a short delay
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:8080"

REM Start server
%PYTHON% server.py

pause
