@echo off
echo Deploying to GitHub...
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

REM Show what will be committed
echo Changes to be committed:
git status --short
echo.

REM Ask for commit message
set /p commit_msg="Enter commit message (or press Enter for auto message): "

REM Add all files
echo Adding files...
git add .

REM Commit with custom or auto message
echo Committing changes...
if "%commit_msg%"=="" (
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do (set mytime=%%a:%%b)
    git commit -m "Auto update %mydate% %mytime%"
) else (
    git commit -m "%commit_msg%"
)

REM Push
echo Pushing to GitHub...
git push

echo.
echo Done!
echo.
echo Note: Frontend and backend will be deployed automatically to Cloudflare via GitHub Actions.
pause
