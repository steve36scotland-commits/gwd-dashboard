#!/bin/bash
# GWD Dashboard Launcher
# Run this on your Mac mini to start the dashboard

echo "Starting GWD Dashboard..."
echo ""

# Kill any existing processes
pkill -f "api-server.py" 2>/dev/null
pkill -f "cloudflared" 2>/dev/null
sleep 2

# Start the API server
cd /Users/user/.openclaw/workspace
python3 api-server.py &
API_PID=$!
echo "✓ API Server started (PID: $API_PID)"
sleep 3

# Check if server is running
if curl -s http://192.168.1.93:9000/api/budget > /dev/null 2>&1; then
    echo "✓ API responding on port 9000"
else
    echo "✗ API not responding, trying port 9001..."
    sed -i '' 's/PORT = 9000/PORT = 9001/' api-server.py
    pkill -f api-server.py
    sleep 1
    python3 api-server.py &
    sleep 3
fi

# Get IP
IP=$(python3 -c "import socket; s=socket.socket(socket.AF_INET,socket.SOCK_DGRAM); s.connect(('8.8.8.8',80)); print(s.getsockname()[0]); s.close()")
PORT=$(grep "PORT =" api-server.py | head -1 | grep -o "[0-9]*")

echo ""
echo "=========================================="
echo "DASHBOARD IS RUNNING"
echo "=========================================="
echo ""
echo "LOCAL ACCESS:"
echo "  http://${IP}:${PORT}"
echo ""
echo "To access remotely, run:"
echo "  npx localtunnel --port ${PORT}"
echo ""
echo "Press Ctrl+C to stop"
echo "=========================================="

# Keep script running
wait $API_PID