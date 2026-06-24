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

REM Commit
echo Committing changes...
git commit -m "Restructure project: backend/frontend/data separation with documentation"

REM Push
echo Pushing to GitHub...
git push -u origin main

echo.
echo Done!
pause
