@echo off
echo Setting up AI Scoring for PTE Mock Test...

REM Install Python dependencies
echo Installing Python dependencies...
cd scripts
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Failed to install Python dependencies
    pause
    exit /b %errorlevel%
)

REM Go back to main directory
cd ..

REM Install Node.js dependencies
echo Installing Node.js dependencies...
npm install

REM Copy .env.example to .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file from example...
    copy .env.example .env
)

echo Setup complete!
echo.
echo To start the Python scoring server, run: npm run start-python-server
echo To start the main application, run: npm run dev
pause