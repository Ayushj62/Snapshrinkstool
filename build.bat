@echo off
echo Building Image-PDF Toolkit...
echo.

cd /d "%~dp0"

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Build frontend
echo Building frontend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Failed to build frontend.
    pause
    exit /b 1
)

:: Build backend
echo.
echo Building backend...
cd server
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Failed to build backend.
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo Build completed successfully!
echo The built files are in the 'dist' and 'server/dist' directories.
pause 