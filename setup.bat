@echo off
set PYTHON_PATH="E:\Backup C\Phyton\python.exe"
set PSQL_PATH="E:\Backup C\Postgres\bin\psql.exe"

echo ========================================
echo Liquidity Asset App - Setup Script
echo ========================================
echo.
echo Python Path: %PYTHON_PATH%
echo PostgreSQL Path: %PSQL_PATH%
echo.

echo [1/5] Checking Python installation...
%PYTHON_PATH% --version
if errorlevel 1 (
    echo ERROR: Python not found!
    pause
    exit /b 1
)

echo.
echo [2/5] Setting up Backend...
cd backend

echo Creating virtual environment...
%PYTHON_PATH% -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Upgrading pip...
python -m pip install --upgrade pip

echo Installing Python dependencies...
pip install -r requirements.txt

echo Copying environment file...
if not exist .env copy .env.example .env

cd ..

echo.
echo [3/5] Setting up Frontend...
cd frontend

echo Installing Node dependencies...
call npm install

cd ..

echo.
echo [4/5] Setting up PostgreSQL Database...
echo.
set DB_PASSWORD=postgres

echo.
echo Creating database...
%PSQL_PATH% -U postgres -c "DROP DATABASE IF EXISTS liquidity_asset_db;"
%PSQL_PATH% -U postgres -c "CREATE DATABASE liquidity_asset_db;"

echo Running setup script...
%PSQL_PATH% -U postgres -d liquidity_asset_db -f backend\setup_database.sql

echo.
echo [5/5] Updating backend configuration...
(
echo DATABASE_URL=postgresql://postgres:%DB_PASSWORD%@localhost:5432/liquidity_asset_db
echo UPLOAD_DIR=./uploads
echo MAX_UPLOAD_SIZE=52428800
) > backend\.env

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Run: start.bat
echo.
echo Or manually:
echo    Backend:  cd backend ^&^& venv\Scripts\activate ^&^& uvicorn app.main:app --reload
echo    Frontend: cd frontend ^&^& npm run dev
echo.
pause
