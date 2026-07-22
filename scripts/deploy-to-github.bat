@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0.."

echo ========================================
echo  Push на GitHub ^(CI задеплоит Pages^)
echo ========================================
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] git не найден.
  goto :fail
)

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Это не git-репозиторий.
  goto :fail
)

echo Текущий статус:
git status -sb
echo.

set "MSG=%~1"
if "%MSG%"=="" set "MSG=Update Donino records from Google Sheets"

git add -A
git diff --cached --quiet
if errorlevel 1 (
  echo Коммит: %MSG%
  git commit -m "%MSG%"
  if errorlevel 1 goto :fail
) else (
  echo Нет новых изменений для коммита — пушу текущую ветку как есть.
)

echo.
echo Push...
git push
if errorlevel 1 goto :fail

echo.
echo ========================================
echo  Готово. CI: build-all-data → Cloudflare Pages
echo  Сайт: https://coursing-stats.ru
echo ========================================
pause
exit /b 0

:fail
echo.
echo [ERROR] Push не выполнен.
pause
exit /b 1
