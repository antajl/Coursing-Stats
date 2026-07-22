@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0.."

echo ========================================
echo  Обновление данных Донино из Google Sheets
echo ========================================
echo.
echo  1^) Замер скорости ^(км/ч^)
echo  2^) Бега 350 м ^(сек^)
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js не найден. Установи Node.js и повтори.
  goto :fail
)

if not exist "node_modules\" (
  echo [INFO] node_modules нет — запускаю npm install...
  call npm install
  if errorlevel 1 goto :fail
)

echo --- Замер скорости ---
call npx tsx backend/scripts/speed/export-speed-from-sheets.ts
if errorlevel 1 goto :fail
echo.

echo --- Бега борзых 350 м ---
call npx tsx backend/scripts/speed/export-coursing-from-sheets.ts
if errorlevel 1 goto :fail
echo.

echo ========================================
echo  Готово. Файлы:
echo    data\v1\donino\speed_records.json
echo    data\v1\donino\coursing_records.json
echo.
echo  Локально: npm run dev
echo  На сайт:  scripts\deploy-to-github.bat
echo ========================================
pause
exit /b 0

:fail
echo.
echo [ERROR] Обновление не удалось.
pause
exit /b 1
