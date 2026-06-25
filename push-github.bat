@echo off
echo Pushing to GitHub...
echo.

REM Check if git remote exists
git remote -v >nul 2>&1
if %errorlevel% neq 0 (
    echo No git remote found. Please set up remote first:
    echo git remote add origin https://github.com/USERNAME/REPO.git
    echo.
    pause
    exit /b 1
)

REM Add all files
echo Adding files...
git add .

REM Commit with auto message
echo Committing changes...
git commit -m "Auto update %date% %time%"

REM Push
echo Pushing to GitHub...
git push

echo.
echo Done!
echo.
echo Note: Both frontend and backend will be deployed automatically to Cloudflare.
pause
