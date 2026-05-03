#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$SCRIPT_DIR/backend"
FRONTEND="$SCRIPT_DIR/frontend"

echo ""
echo "  =========================================="
echo "    SalesOS — Starting Development Server"
echo "  =========================================="
echo ""

# ── Check Python ──
if ! command -v python3 &>/dev/null; then
  echo "[ERROR] python3 not found. Install Python 3.10+"
  exit 1
fi

# ── Check Node ──
if ! command -v node &>/dev/null; then
  echo "[ERROR] node not found. Install Node.js 18+ from nodejs.org"
  exit 1
fi

# ── Backend setup ──
cd "$BACKEND"

if [ ! -d "venv" ]; then
  echo "[1/5] Creating virtual environment..."
  python3 -m venv venv
else
  echo "[1/5] venv already exists."
fi

source venv/bin/activate

echo "[2/5] Installing Python dependencies..."
pip install -r requirements.txt -q

echo "[3/5] Running migrations..."
python manage.py migrate --no-input

# ── Frontend setup ──
cd "$FRONTEND"

if [ ! -d "node_modules" ]; then
  echo "[4/5] Installing Node dependencies..."
  npm install --silent
else
  echo "[4/5] node_modules already exists."
fi

echo "[5/5] Launching servers..."
echo ""
echo "  Backend  →  http://localhost:8000"
echo "  Frontend →  http://localhost:5173"
echo "  Admin    →  http://localhost:8000/admin"
echo ""
echo "  Press Ctrl+C to stop both servers."
echo ""

# Launch both in background, kill both on exit
cleanup() {
  echo ""
  echo "  Stopping servers..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

cd "$BACKEND"
source venv/bin/activate
python manage.py runserver &
BACKEND_PID=$!

sleep 1

cd "$FRONTEND"
npm run dev &
FRONTEND_PID=$!

wait
