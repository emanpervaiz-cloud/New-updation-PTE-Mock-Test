@echo off
echo Setting up Direct AI Scoring for PTE Mock Test (No n8n Required)...

REM Install Node.js dependencies
echo Installing Node.js dependencies...
npm install

REM Copy .env.example to .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file from example...
    copy .env.example .env
)

echo.
echo Setup complete!
echo.
echo To use Direct AI Scoring:
echo 1. Add your API keys to .env file:
echo    VITE_GEMINI_API_KEY=your_gemini_key
echo    VITE_OPENROUTER_API_KEY=your_openrouter_key
echo    VITE_OPENAI_API_KEY=your_openai_key
echo.
echo 2. Start the main application:
echo    npm run dev
echo.
echo This setup uses direct API calls to AI providers without n8n dependency.
pause