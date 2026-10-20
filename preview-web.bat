@echo off
title TITIK DIGI SHOP - Live Web Preview
color 0B
echo ========================================================
echo   MENJALANKAN LIVE PREVIEW WEB TITIK DIGI SHOP
echo ========================================================
echo.
echo Browser akan otomatis terbuka di http://localhost:3000
echo Setiap kali Anda menyimpan file (Ctrl + S), web otomatis refresh!
echo.
echo Tekan Ctrl + C untuk menghentikan server.
echo ========================================================
echo.

call npx live-server --port=3000 --entry-file=index.html
pause
