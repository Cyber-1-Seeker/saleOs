@echo off
title SalesOS — Launcher
color 0A

echo.
echo  ==========================================
echo    SalesOS — Starting Development Server
echo  ==========================================
echo.

:: ── Check Python ──
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Install Python 3.10+ and add to PATH.
    pause
    exit /b
)

:: ── Check Node ──
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Install Node.js 18+ from nodejs.org
    pause
    exit /b
)

echo [1/5] Setting up Python virtual environment...
cd /d "%~dp0backend"
if not exist "venv" (
    python -m venv venv
    echo       venv created.
) else (
    echo       venv already exists.
)

echo [2/5] Installing Python dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt --quiet

echo [3/5] Running Django migrations...
python manage.py migrate --no-input

echo [4/5] Installing Node dependencies...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    npm install --silent
) else (
    echo       node_modules already exists.
)

echo [5/5] Launching servers...
echo.
echo  Backend  →  http://localhost:8000
echo  Frontend →  http://localhost:5173
echo  Admin    →  http://localhost:8000/admin
echo.

:: Launch Django in a new window
start "SalesOS Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && python manage.py runserver"

:: Short pause so backend starts first
timeout /t 2 /nobreak >nul

:: Launch Vite in a new window
start "SalesOS Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo  Both servers are starting in separate windows.
echo  Open http://localhost:5173 in your browser.
echo.
pause
