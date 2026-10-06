@echo off
title FounderOS Mobile (Android)
echo ========================================================
echo   FounderOS Mobile (Android) Sync & Launch
echo ========================================================
cd /d "%~dp0"

echo Syncing web assets and Capacitor native plugins to Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo Error syncing Android project.
    pause
    exit /b %errorlevel%
)

echo Opening Android Studio...
call npx cap open android
echo ========================================================
echo   Android Studio opened. You can run on an emulator or
echo   plugged-in Android phone, or build an APK via:
echo   Build -> Build Bundle(s) / APK(s) -> Build APK(s)
echo ========================================================
pause
