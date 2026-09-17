@echo off
echo ==========================================
echo 🎈 正在啟動小朋友單字拼拼樂 (Kids Word Puzzle)...
echo 👦 Tim & 👧 Bella 專屬拼字學習網頁
echo ==========================================
start http://localhost:3000
python -m http.server 3000
pause
