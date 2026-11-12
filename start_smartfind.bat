@echo off
title SmartFind Launcher
echo ===================================================
echo           Starting SmartFind AI System
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Backend (FastAPI on http://127.0.0.1:8000)...
start "SmartFind Backend" cmd /k "cd /d "%~dp0backend" && .\venv\Scripts\python -m uvicorn app.main:app --reload --port 8000"

echo [2/3] Starting Frontend (Vite on http://localhost:5173)...
start "SmartFind Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo Opening browser at http://localhost:5173...
start http://localhost:5173

echo.
echo ===================================================
echo  SmartFind is running!
echo  To stop everything, run 'stop_smartfind.bat'
echo  or close the Backend and Frontend windows.
echo ===================================================
timeout /t 3 >nul
exit

