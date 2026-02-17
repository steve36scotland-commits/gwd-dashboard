---
topic: "Data Backup & Recovery"
owner: "🧠 BrainZ"
tags: ["operations", "backup", "disaster-recovery"]
last_reviewed: "2026-02-16"
---

# SOP-002: Data Backup & Recovery

## Purpose
Ensure critical data is protected and recoverable.

## Critical Data Inventory
| Data | Location | Backup Frequency | Retention |
|------|----------|------------------|-----------|
| MEMORY.md | workspace/ | Daily | 30 days |
| USER.md | workspace/ | Daily | 30 days |
| GWD files | workspace/ | Daily | 30 days |
| OpenClaw config | ~/.openclaw/ | Weekly | 90 days |
| Telegram history | Cloud | Real-time | N/A |

## Backup Schedule

### Daily (2:00 AM)
```bash
#!/bin/bash
# backup-daily.sh
tar czf "backups/gwd-$(date +%Y%m%d).tar.gz" workspace/
cp ~/.openclaw/openclaw.json backups/
```

### Weekly (Sunday 3:00 AM)
- Full system snapshot
- Test restore from backup

## Recovery Procedures

### File Recovery (single file)
1. Locate backup: `ls -la backups/gwd-YYYYMMDD.tar.gz`
2. Extract specific file: `tar xzf backup.tar.gz workspace/path/to/file`
3. Verify integrity
4. Document recovery in logs/decisions/

### Full System Recovery (disaster)
1. Restore from most recent backup
2. Re-run setup scripts
3. Verify all services (gateway, node, cron)
4. Run health checks
5. Notify team of recovery completion

## Testing
- [ ] Monthly restore test (first Monday)
- [ ] Verify backup integrity (automated checksum)
- [ ] Document test results in logs/decisions/