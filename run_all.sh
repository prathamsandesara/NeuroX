#!/bin/bash

# NeuroX Master Startup Script (Background Version)
PROJECT_ROOT=$(pwd)

echo "🕵️ Cleaning up existing processes on ports 5005, 5001, 5173, 4000..."
# List of ports to clean
PORTS=(5005 5001 5173 5174 4000)

for PORT in "${PORTS[@]}"; do
    PID=$(lsof -ti:$PORT)
    if [ ! -z "$PID" ]; then
        echo "  -> Killing process on port $PORT (PID: $PID)..."
        kill -9 $PID 2>/dev/null
    fi
done

echo "🚀 Starting NeuroX Ecosystem in background..."

# 1. Start JD Parser (Port 5005)
echo "  -> Starting JD Parser..."
cd "$PROJECT_ROOT/ml" && python3 app_jd_parser.py > jd_parser.log 2>&1 &

# 2. Start Integrity Engine (Port 5001)
echo "  -> Starting Integrity Engine..."
cd "$PROJECT_ROOT/ml" && python3 app_skill_integrity.py > integrity.log 2>&1 &

# 3. Start Frontend (Port 5173)
echo "  -> Starting Frontend..."
cd "$PROJECT_ROOT/frontend" && npm run dev > frontend.log 2>&1 &

echo "✅ ML and Frontend services started in background."
echo "📝 Logs are being written to .log files in their respective folders."
echo ""
echo "⚙️  Starting Backend in foreground (so you can see the OTP)..."
echo "--------------------------------------------------------"
lsof -ti:4000 | xargs kill -9 2>/dev/null
cd "$PROJECT_ROOT/backend" && npm run dev
