@echo off
echo Starting Image-PDF Toolkit...
echo.

cd /d "%~dp0"
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies.
    echo Please make sure Node.js is installed on your system.
    pause
    exit /b 1
)

echo.
echo Starting development server...
echo The application will open in your browser shortly...
echo.
call npm run dev -- --open
pause 