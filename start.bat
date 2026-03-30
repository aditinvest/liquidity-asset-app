@echo off
set PYTHON_PATH="E:\Backup C\Phyton\python.exe"

echo ========================================
echo Starting Liquidity Asset App
echo ========================================
echo.

echo Starting Backend Server (Port 8000)...
start cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server (Port 3000)...
start cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Servers Starting...
echo ========================================
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C in each window to stop the servers
echo.
