@echo off
title TITIK DIGI SHOP - Bot WhatsApp
color 0A
echo ========================================================
echo   MENJALANKAN BOT WHATSAPP TITIK DIGI SHOP
echo ========================================================
echo.

IF NOT EXIST node_modules (
    echo [INFO] Folder node_modules belum ada. Menginstall dependensi...
    call npm install
)

echo [INFO] Menyalakan bot-wa.js...
echo.
node bot-wa.js

echo.
echo ========================================================
echo Bot berhenti berjalan.
pause
