#!/bin/bash
# GWD Dashboard Monitor & Auto-Restart
# Keeps dashboard server running 24/7

LOG_FILE="/Users/user/.openclaw/workspace/logs/dashboard-monitor.log"
PID_FILE="/tmp/dashboard-server.pid"
API_SERVER="/Users/user/.openclaw/workspace/api-server.py"
PORT=$(grep "PORT =" $API_SERVER 2>/dev/null | head -1 | grep -o "[0-9]*" || echo "9000")

echo "$(date): Dashboard Monitor Starting..." >> $LOG_FILE

while true; do
    # Check if server is running
    if ! curl -s http://localhost:$PORT/api/budget > /dev/null 2>&1; then
        echo "$(date): Server DOWN detected. Restarting..." >> $LOG_FILE
        
        # Kill any existing processes
        pkill -f "api-server.py" 2>/dev/null
        sleep 2
        
        # Start server
        cd /Users/user/.openclaw/workspace
        nohup python3 api-server.py >> /tmp/api-server.log 2>&1 &
        NEW_PID=$!
        echo $NEW_PID > $PID_FILE
        
        sleep 5
        
        # Verify restart
        if curl -s http://localhost:$PORT/api/budget > /dev/null 2>&1; then
            echo "$(date): Server RESTARTED successfully (PID: $NEW_PID)" >> $LOG_FILE
            
            # Send alert to Telegram
            curl -s -X POST "https://api.telegram.org/bot7556707117:AAFuzeNV_AY-zWtO2LAxnieDEaiKPK9BCn4/sendMessage" \
                -d "chat_id=903821546" \
                -d "text=🚨 Dashboard Server Restarted\nTime: $(date)\nPort: $PORT\nStatus: ONLINE" 2>/dev/null
        else
            echo "$(date): Server restart FAILED" >> $LOG_FILE
        fi
    fi
    
    # Check every 60 seconds
    sleep 60
done