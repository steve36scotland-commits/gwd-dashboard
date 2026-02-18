# GWD Memory System Architecture v2.0

## Current State (Problems)
- Fragmented across multiple files
- No semantic search
- Manual consolidation required
- Context window limits not managed

## Proposed Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   MEMORY LAYERS                          │
├─────────────────────────────────────────────────────────┤
│  L1: SESSION (Short-term)                                │
│  ├── Active conversation context                         │
│  ├── Last 10 messages                                    │
│  └── Auto-expires: End of session                        │
├─────────────────────────────────────────────────────────┤
│  L2: DAILY (Medium-term)                                 │
│  ├── Daily summaries (auto-generated)                    │
│  ├── Key decisions made                                  │
│  └── Auto-expires: 7 days                                │
├─────────────────────────────────────────────────────────┤
│  L3: PERMANENT (Long-term)                               │
│  ├── USER.md (profile)                                   │
│  ├── Important decisions                                 │
│  ├── Preferences learned                                 │
│  └── Manual curation                                     │
└─────────────────────────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: Auto-Summarization (This Week)
- [ ] Daily digest generation at 11 PM
- [ ] Key fact extraction
- [ ] Decision logging

### Phase 2: Semantic Search (Next Week)
- [ ] Embed all memories
- [ ] Query interface
- [ ] Relevant context retrieval

### Phase 3: Smart Context Management (Week 3)
- [ ] Automatic context window optimization
- [ ] Priority-based memory retention
- [ ] Cross-reference linking

## File Structure

```
memory/
├── _index.json              # Master index
├── user-profile.md          # L3: Permanent
├── identity-core.md         # L3: Permanent
├── 2026-02-17-summary.md    # L2: Daily
├── 2026-02-17-decisions.md  # L2: Daily
├── _session-current.json    # L1: Session
└── archive/                 # Old daily summaries
```

## Daily Digest Format

```markdown
# Daily Summary - 2026-02-17

## Key Facts Learned
- Stevie's current time is 7:48 PM EST
- Dashboard server stability issues identified
- Budget: $0.13 used today

## Decisions Made
- [APPROVED] Implement all team recommendations
- [APPROVED] Hire Luna (Night Watch) and Terra (DevOps)
- [PENDING] Test 6AM brief backup system

## Action Items
- [ ] Ninja: Build model router
- [ ] Rosco: Improve budget tracker
- [ ] Terra: Fix server stability

## Context for Tomorrow
- 6AM brief scheduled
- Dashboard should be monitored overnight
- Cross-training starts tomorrow
```

## Automation

### 11:30 PM Daily (Luna)
```bash
# Generate daily summary
node tools/generate-daily-summary.js

# Archive old session data
mv memory/_session-current.json memory/archive/$(date +%Y-%m-%d).json

# Clear session layer
echo '{}' > memory/_session-current.json
```

### On Key Events (Auto)
- Important decision → Log to decisions file
- User preference learned → Update user-profile.md
- Error/failure → Log to incident log
