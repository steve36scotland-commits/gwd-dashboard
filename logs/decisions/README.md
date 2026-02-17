# Decision & Incident Ledger

## Purpose
Preserve rationale, prevent re-litigating choices, and make handoffs faster.

## File Naming Convention
- Decisions: `logs/decisions/YYYY-MM-DD-{topic}.md`
- Incidents: `logs/decisions/INCIDENT-{timestamp}-{type}.md`

## Template: Decision Record

```markdown
---
date: "2026-02-16"
type: decision
topic: "API Integration Strategy"
owner: "🥷 Ninja"
stakeholders: ["🦞 CEO", "🧙‍♂️ Gandalf"]
status: accepted
---

## Context
[What problem were we solving? Background info]

## Options Considered

### Option A: [Name]
- Pros: 
- Cons: 
- Cost estimate: 

### Option B: [Name]
- Pros: 
- Cons: 
- Cost estimate: 

## Decision
[What we chose and why]

## Owner
[Who is accountable]

## Follow-ups
- [ ] Action item 1
- [ ] Action item 2

## Related
- Links to playbooks, previous decisions
```

## Template: Incident Record

```markdown
---
date: "2026-02-16"
type: incident
severity: P2
lead: "🧌 Chunk"
---

## Summary
[One-paragraph what happened]

## Timeline
- 14:32: Issue detected
- 14:35: Chunk paged
- 14:40: Containment started
- 15:00: Issue resolved

## Root Cause
[Technical explanation]

## Resolution
[What was done to fix it]

## Lessons Learned
[What we'll do differently]

## Preventive Actions
- [ ] Action 1 (owner: @role)
```

## Index

### 2026-02-16
- [Company Formation](2026-02-16-company-formation.md) — GWD Consulting established
- [Initial Team Structure](2026-02-16-team-structure.md) — First 10 employees hired
- [Morning Brief System](2026-02-16-morning-brief.md) — 6am daily reports scheduled

## Quick Search
```bash
# Find all decisions by topic
grep -r "topic: \"API\"" logs/decisions/

# Find incidents by severity
grep -r "severity: P1" logs/decisions/

# Find decisions by owner
grep -r "owner: \"🥷 Ninja\"" logs/decisions/
```