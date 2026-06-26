@echo off
echo Starting ProCoursing Stats Servers...
echo.
echo Starting Worker backend on http://127.0.0.1:8787...
start "Worker Backend" cmd /k "npx wrangler dev backend/src/worker.js --port 8787"
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend on http://localhost:5173...
cd frontend
start "Frontend" cmd /k "npm run dev"
cd ..
echo.
echo Servers started!
echo - Worker: http://127.0.0.1:8787
echo - Frontend: http://localhost:5173
echo.
