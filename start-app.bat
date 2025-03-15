@echo off
echo Starting Image-PDF Toolkit...
echo.

cd /d "%~dp0"

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Install frontend dependencies
echo Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install frontend dependencies.
    pause
    exit /b 1
)

:: Install backend dependencies
echo.
echo Installing backend dependencies...
cd server
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install backend dependencies.
    cd ..
    pause
    exit /b 1
)
cd ..

:: Create .env file if it doesn't exist
if not exist "server\.env" (
    echo Creating server environment file...
    echo PORT=3001 > server\.env
    echo EMAIL_USER=ayushjaiswal0970@gmail.com >> server\.env
    echo EMAIL_PASSWORD=sonujaiswal970 >> server\.env
)

:: Start backend server in a new window
echo.
echo Starting backend server...
start "Backend Server" cmd /k "cd server && npm run dev"

:: Wait a moment for the backend to start
timeout /t 5 /nobreak

:: Start frontend server
echo.
echo Starting frontend server...
echo The application will open in your browser shortly...
echo.

:: Start the frontend server and open in browser
call npm run dev -- --open

:: Keep the window open if there's an error
pause 