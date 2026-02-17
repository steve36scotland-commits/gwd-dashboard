#!/bin/bash
# Briefing Trigger for System Cron
# Called by: crontab (macOS system scheduler)
# Purpose: Deliver daily factual briefing to Telegram at 5 AM

set -e

LOG_FILE="/tmp/openclaw-briefing-$(date +%Y-%m-%d).log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S %Z')

echo "[$TIMESTAMP] Briefing cron triggered" >> "$LOG_FILE"

# Source the agent environment (optional, for PATH/vars)
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export HOME="/Users/user"

# Call OpenClaw gateway to spawn a briefing sub-agent
# This uses the sessions_spawn API to generate the brief
GATEWAY_URL="http://127.0.0.1:18789"
GATEWAY_TOKEN="e9bcba0380e95a177457a3cf63a7f06487fe43c036f15ae3"

# Spawn briefing task via OpenClaw API
curl -s -X POST "$GATEWAY_URL/api/sessions/spawn" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GATEWAY_TOKEN" \
  -d '{
    "task": "Generate a factual morning briefing for Burlington, Ontario. Include: 1) Real current weather (use weather skill for actual temp/conditions), 2) Real news headlines (search for verified Ontario/Canada news - no fabrication), 3) Calendar events only if available from authenticated sources. DO NOT generate fake events or data. If any section unavailable, skip it. Format clearly and send directly to Telegram chat 903821546.",
    "label": "cron-briefing-5am",
    "model": "openai/gpt-4o-mini",
    "runTimeoutSeconds": 60
  }' >> "$LOG_FILE" 2>&1

echo "[$TIMESTAMP] Briefing spawn request submitted" >> "$LOG_FILE"
