@echo off
title FounderOS Desktop
echo Starting FounderOS Windows Desktop Application...
cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not found on PATH. Please install Node.js 20+ from https://nodejs.org
    pause
    exit /b 1
)

echo Launching Next.js server and Electron desktop window...
npm run electron:dev
pause
