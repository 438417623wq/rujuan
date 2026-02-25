#!/bin/bash
echo "============================================"
echo "  入卷 AIRP - AI Interactive Roleplay Novel"
echo "============================================"
echo

# Check Python
if command -v python3 &>/dev/null; then
    PYTHON=python3
elif command -v python &>/dev/null; then
    PYTHON=python
else
    echo "[错误] 未检测到 Python，请先安装 Python 3.8+"
    exit 1
fi

cd "$(dirname "$0")"

echo "[启动] 正在启动服务器..."
echo "[信息] 按 Ctrl+C 停止服务器"
echo

# Open browser after delay
(sleep 2 && open "http://localhost:8080" 2>/dev/null || xdg-open "http://localhost:8080" 2>/dev/null) &

$PYTHON server.py
