@echo off
set PSQL_PATH="E:\Backup C\Postgres\bin\psql.exe"

echo Setting up PostgreSQL Database...
echo.

echo Dropping existing database...
%PSQL_PATH% -U postgres -c "DROP DATABASE IF EXISTS liquidity_asset_db;"

echo Creating database...
%PSQL_PATH% -U postgres -c "CREATE DATABASE liquidity_asset_db;"

echo Running setup script...
%PSQL_PATH% -U postgres -d liquidity_asset_db -f backend\setup_database.sql

echo.
echo Database setup complete!
pause
