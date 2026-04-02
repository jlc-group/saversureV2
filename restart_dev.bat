@echo off
echo Cleaning up previous instances...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :30400') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :30402') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :30403') do taskkill /F /PID %%a >nul 2>&1
echo Restarting development server...
cd /d c:\saversureV2
npm run dev
