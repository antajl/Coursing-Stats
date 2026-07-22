@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0.."

echo ========================================
echo  Локальный dev: Vite :5173 + API :8787
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js не найден.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo [INFO] npm install...
  call npm install
)

if not exist "frontend\node_modules\" (
  echo [INFO] npm install в frontend...
  pushd frontend
  call npm install
  popd
)

call npm run dev
pause
