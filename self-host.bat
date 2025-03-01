@echo off
echo ===== GamePortal Self-Hosting Script =====
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Error: Node.js is not installed or not in PATH
  echo Please install Node.js from https://nodejs.org/
  exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Error: npm is not installed or not in PATH
  echo Please install Node.js from https://nodejs.org/
  exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
  echo Installing dependencies...
  npm install
  if %ERRORLEVEL% neq 0 (
    echo Error: Failed to install dependencies
    exit /b 1
  )
)

REM Build the application
echo Building the application...
call npm run build
if %ERRORLEVEL% neq 0 (
  echo Error: Build failed
  exit /b 1
)

REM Set environment variables
set NODE_ENV=production
set PORT=3000

echo.
echo ===== Starting GamePortal Server =====
echo Server will be available at http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

REM Start the server
node vite.server.js