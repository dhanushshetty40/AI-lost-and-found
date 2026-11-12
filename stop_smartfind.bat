@echo off
title Stop SmartFind
echo ===================================================
echo           Stopping SmartFind AI System
echo ===================================================
echo.

echo Stopping Frontend and Vite processes on port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo Stopping Backend and Uvicorn processes on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo All SmartFind servers have been stopped cleanly!
timeout /t 2 >nul
exit

