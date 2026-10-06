@echo off
title FounderOS Windows Installer Builder
echo ========================================================
echo   Building FounderOS Standalone Windows Application (.exe)
echo ========================================================
cd /d "%~dp0"

echo Step 1: Compiling Next.js production build...
call npm run build
if %errorlevel% neq 0 (
    echo Error during Next.js build.
    pause
    exit /b %errorlevel%
)

echo Step 2: Packaging Windows desktop application (.exe installer and portable binary)...
call npm run electron:build
if %errorlevel% neq 0 (
    echo Error during Electron packaging.
    pause
    exit /b %errorlevel%
)

echo ========================================================
echo   Build complete! Binaries are in: dist-electron/
echo ========================================================
pause
