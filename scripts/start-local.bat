@echo off
cd ..
echo Starting ProCoursing Stats Servers...
echo.
echo Starting Worker backend on http://127.0.0.1:8787...
echo Using remote D1 database...
start "Worker Backend" cmd /k "npx wrangler dev backend/src/worker.ts --remote --port 8787"
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend on http://localhost:5173...
cd frontend
start "Frontend" cmd /k "npm run dev"
cd ..
echo.
echo Servers started!
echo - Worker: http://127.0.0.1:8787 (using remote D1)
echo - Frontend: http://localhost:5173
echo.
