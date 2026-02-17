---
topic: "Incident Response"
owner: "🧌 Chunk"
tags: ["security", "emergency", "sop"]
last_reviewed: "2026-02-16"
---

# SOP-001: Incident Response

## Purpose
Standardized response to security breaches, system outages, and critical failures.

## Roles & Responsibilities
| Role | Responsibility |
|------|----------------|
| 🧌 Chunk (CSO) | Lead response, assess scope |
| 🦞 CEO | Coordinate team, external comms |
| 🥷 Ninja | Technical remediation |
| 👮‍♀️ PC Plod | Document timeline, preserve evidence |

## Response Steps

### 1. DETECT (0-5 minutes)
- [ ] Incident identified via alert, user report, or monitoring
- [ ] Chunk paged via Telegram with incident ID
- [ ] Initial severity assigned: P1 (Critical), P2 (High), P3 (Medium)

### 2. RESPOND (5-15 minutes)
- [ ] CEO convenes war room (subagent swarm)
- [ ] Chunk assesses scope and containment options
- [ ] Ninja executes containment (isolate, shut down, patch)
- [ ] PC Plod starts incident log

### 3. COMMUNICATE (15-30 minutes)
- [ ] Stevie notified if P1 or P2 (decision: inform or escalate)
- [ ] External parties notified if required (service providers, clients)
- [ ] Telegram status channel updated

### 4. RECOVER (30+ minutes)
- [ ] Root cause identified
- [ ] Fix implemented and tested
- [ ] Systems restored to production
- [ ] Monitoring re-enabled

### 5. REVIEW (24-48 hours)
- [ ] Post-incident review meeting
- [ ] Lessons learned documented in logs/decisions/
- [ ] Process improvements assigned to owners
- [ ] Incident closed with final report

## Escalation Path
1. Chunk (first 15 min)
2. CEO (if unresolved in 15 min or P1)
3. Stevie (if business impact > $500 or data breach)

## Contact Tree
- 🦞 CEO: Telegram @openclaw_bot
- 🧌 Chunk: Spawn with @chunk tag
- External: See USER.md for emergency contacts