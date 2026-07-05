@echo off
setlocal

cd /d "%~dp0.."

if "%~1"=="" (
  set "MSG=Deploy update"
) else (
  set "MSG=%~1"
)

echo Deploying to GitHub...
echo Commit message: %MSG%
echo.

git add -A

git diff --cached --quiet
if %errorlevel%==0 (
  echo Nothing to commit. Aborting.
  pause
  exit /b 1
)

git status --short
echo.

git commit -m "%MSG%"
if errorlevel 1 (
  echo Commit failed.
  pause
  exit /b 1
)

git push --force
if errorlevel 1 (
  echo Push failed.
  pause
  exit /b 1
)

echo.
echo Done! Site will be deployed automatically via GitHub Actions.
echo Frontend: https://coursing-stats.ru
echo API: https://api.coursing-stats.ru
echo.
pause
