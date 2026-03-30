@echo off
echo Starting PostgreSQL Server...
cd "E:\Backup C\Postgres\bin"
.\pg_ctl.exe -D "E:\Backup C\Postgres\data" start
echo.
echo PostgreSQL started successfully!
echo Press any key to close this window...
pause > nul
