#!/bin/bash

# NeuroX Master Startup Script (Optimized)
PROJECT_ROOT=$(pwd)

echo "🕵️  Cleaning up existing processes on NeuroX ports..."
# Common ports used by NeuroX
PORTS=(4000 5173 5174 5001 5005)

for PORT in "${PORTS[@]}"; do
    PID=$(lsof -ti:$PORT)
    if [ ! -z "$PID" ]; then
        echo "  -> Killing process on port $PORT (PID: $PID)..."
        kill -9 $PID 2>/dev/null
    fi
done

# Dynamic IP Detection for Network Access
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
[ -z "$LOCAL_IP" ] && LOCAL_IP="localhost"

echo "📍 Network Node Detected: $LOCAL_IP"

# Update Environment Files with Dynamic IP
if [ -f "$PROJECT_ROOT/frontend/.env" ]; then
    echo "  -> Syncing frontend/.env with $LOCAL_IP..."
    sed -i '' "s|VITE_API_URL=.*|VITE_API_URL=http://$LOCAL_IP:4000|g" "$PROJECT_ROOT/frontend/.env"
fi

if [ -f "$PROJECT_ROOT/backend/.env" ]; then
    echo "  -> Syncing backend/.env with $LOCAL_IP..."
    sed -i '' "s|FRONTEND_URL=.*|FRONTEND_URL=http://$LOCAL_IP:5173|g" "$PROJECT_ROOT/backend/.env"
fi

echo "🚀 Starting NeuroX Ecosystem..."

# 1. Start JD Parser (Port 5005)
if [ -d "$PROJECT_ROOT/ml" ]; then
    echo "  -> Starting JD Parser..."
    cd "$PROJECT_ROOT/ml" && (python3 app_jd_parser.py > jd_parser.log 2>&1 &)
fi

# 2. Start Integrity Engine (Port 5001)
if [ -d "$PROJECT_ROOT/ml" ]; then
    echo "  -> Starting Integrity Engine..."
    cd "$PROJECT_ROOT/ml" && (python3 app_skill_integrity.py > integrity.log 2>&1 &)
fi

# 3. Start Frontend (Port 5173/5174)
if [ -d "$PROJECT_ROOT/frontend" ]; then
    echo "  -> Starting Frontend..."
    cd "$PROJECT_ROOT/frontend" && (npm run dev > frontend.log 2>&1 &)
fi

echo "✅ ML and Frontend services started in background."
echo "📝 Background logs: ml/*.log and frontend/frontend.log"
echo ""
echo "🌍 NeuroX Access Links:"
echo "   ➜ Local:   http://localhost:5173"
echo "   ➜ Network: http://$LOCAL_IP:5173"
echo ""
echo "⚙️  Starting Backend in foreground (Watch for OTPs)..."
echo "--------------------------------------------------------"

if [ -d "$PROJECT_ROOT/backend" ]; then
    cd "$PROJECT_ROOT/backend" && npm run dev
else
    echo "❌ Backend directory not found!"
fi
