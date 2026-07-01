@echo off
echo Deploying to GitHub...
echo.

cd /d "%~dp0.."

git add .
git commit -m "Update: UI improvements and documentation"
git push --force

echo.
echo Done! Site will be deployed automatically via GitHub Actions.
echo Frontend: https://procoursing.antajl.ru
echo API: https://procoursing-stats.antajltube.workers.dev
echo.
pause
