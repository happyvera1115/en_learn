@echo off
chcp 65001 >nul
echo ========================================================
echo  啟動單字拼拼樂公開連線 (Tim & Bella)
echo ========================================================
echo.
echo 正在本機啟動伺服器...
start "Local Web Server" /min cmd /c "node server.js"
timeout /t 2 >nul
echo 正在建立公開 Cloudflare 網址，請稍候...
echo.
cmd /c "npx --yes cloudflared tunnel --url http://127.0.0.1:4321"
pause
