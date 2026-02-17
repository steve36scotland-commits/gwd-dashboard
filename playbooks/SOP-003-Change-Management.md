---
topic: "Change Management"
owner: "👮‍♀️ PC Plod"
tags: ["process", "changes", "deployment"]
last_reviewed: "2026-02-16"
---

# SOP-003: Change Management

## Purpose
Control changes to systems, apps, and infrastructure.

## Change Types

### Standard Change (Low Risk)
- Dashboard updates
- Documentation edits
- New cron jobs with existing patterns
- **Approval:** Self (document only)

### Normal Change (Medium Risk)
- New API integrations
- Model configuration changes
- New employee onboarding
- **Approval:** 🦞 CEO review

### Emergency Change (High Risk)
- Security patches
- Service outage fixes
- **Approval:** 🧌 Chunk + 🦞 CEO (post-hoc if needed)

## Change Process

### 1. REQUEST
- File: Create `logs/decisions/YYYY-MM-DD-change-NAME.md`
- Template:
```markdown
---
type: change-request
severity: [standard|normal|emergency]
requester: [your name]
---

## Change Description
[What is changing and why]

## Impact Assessment
- Systems affected: 
- Risk level: [low|medium|high]
- Rollback plan: 

## Testing Plan
[How will this be tested]
```

### 2. ASSESS
- 👮‍♀️ PC Plod reviews completeness
- Relevant pod lead assesses technical impact
- Security review if touching credentials/external services

### 3. APPROVE
- Standard: Auto-approved after 24h if no objections
- Normal: CEO approval required
- Emergency: Chunk + CEO verbal approval, documented within 1h

### 4. IMPLEMENT
- [ ] Change made in feature branch or isolated session
- [ ] Tests pass
- [ ] 👮‍♀️ PC Plod verifies compliance with SOP
- [ ] Deploy to production
- [ ] Monitor for 1 hour (normal) or 4 hours (emergency)

### 5. REVIEW
- Document actual vs. expected outcomes
- Close change request
- Update playbooks if new pattern emerged

## Forbidden Changes (Always Require Full Review)
- Deleting MEMORY.md or USER.md
- Changing owner (Stevie) contact info
- Modifying payment/financial data
- Removing security controls
- Changing encryption keys