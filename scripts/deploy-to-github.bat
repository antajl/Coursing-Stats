@echo off
echo Deploying to GitHub...
echo.

git add .
git commit -m "Auto deploy"
git push

echo.
echo Done! Site will be deployed automatically via GitHub Actions.
echo Frontend: https://procoursing.antajl.ru
echo API: https://api.procoursing.antajl.ru
echo.
pause
