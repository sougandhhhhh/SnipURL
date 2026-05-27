@echo off
REM Start backend and frontend servers, then open the frontend in Chrome.

REM Change to project root
pushd "%~dp0"

echo Starting backend in a new window...
start "SnapURL Backend" cmd /k "cd /d "%~dp0backend" && set SERVICE_API_KEY=su_dev_bootstrap_key&& npm run dev"

echo Waiting for backend to initialize...
timeout /t 3 >nul

echo Starting frontend in a new window...
start "SnapURL Frontend" cmd /k "cd /d "%~dp0frontend" && set NEXT_PUBLIC_API_URL=http://127.0.0.1:8787&& set NEXT_PUBLIC_API_KEY=su_dev_bootstrap_key&& npm run dev"

echo Waiting for frontend to initialize...
timeout /t 4 >nul

echo Opening site in Chrome...
start "" chrome "http://localhost:3000" 2>nul || start "" "http://localhost:3000"

popd
echo All processes started.
exit /b 0