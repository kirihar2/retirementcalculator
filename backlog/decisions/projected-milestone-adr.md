# Architecture Decision Record: Projected Milestone Tracking Storage Strategy

**Date:** 2026-06-28  
**Status:** Accepted  
**Context:** Adding projected milestone tracking feature to retirement dashboard.

## Status
Accepted

## Context
The team needs to add a "projected milestone" tracking feature that allows users to:
- Define custom milestones at specific ages (e.g., "Move to Florida at 58", "Reach $2M portfolio at 60")
- Track progress toward these milestones
- Persist data so it's available across sessions

Initial options evaluated:
1. **Option 1A:** Enhanced localStorage with export/import portability
2. **Option 1B:** IndexedDB for larger datasets  
3. **Option 2:** SQLite backend with Express API server
4. **Option 3:** Full backend migration to external service

## Decision Criteria
- **Security/Privacy:** User financial data should remain under user control
- **Portability:** Should work across devices without complex setup
- **Complexity:** Minimal attack surface, easy to understand and maintain
- **Hosting:** Should work locally with zero or minimal infrastructure
- **Extensibility:** Ability to add features later (API, auth) if needed

## Decision
**Choose Option 1A (Enhanced localStorage + Export/Import).**

### Rationale

This decision was made because:

1. **Security & Privacy First:** Financial data should never leave the user's device unless explicitly exported by the user. No backend = no external exposure, no authentication vulnerabilities, no SQL injection risks.

2. **Maximum Portability:** Data is portable via simple JSON export/import. User controls backup location (email to self, cloud storage, physical backup). No server dependencies or database sync complexities.

3. **Zero Infrastructure:** Works immediately on any device with a modern browser. No deployment pipelines, environment variables, or hosting platforms needed for basic functionality.

4. **Matches Existing Patterns:** The codebase already uses localStorage for `actuals` data (see `fire_actuals`, `fire_initial_actuals`). Extending this pattern requires minimal refactoring.

5. **Low Attack Surface:** No network-facing API endpoints means fewer security vectors to protect. If user wants API later, it can be added as an optional layer.

### Trade-offs Acknowledged

- **No Cross-Device Sync:** User must manually export/import between devices. This is intentional - keeps security model simple.
- **Browser Limits:** localStorage has ~5-10MB limit per origin. If dataset grows larger, migration to IndexedDB can happen later.
- **Single Source of Truth:** Data only exists in browser until explicitly exported/modified elsewhere.

### Migration Path if Needs Change Later

1. **Larger Datasets:** Migrate to IndexedDB when data exceeds localStorage limits (~500k entries)
2. **API Requirements:** Add Express server layer as separate module, optionally with SQLite persistence
3. **Multi-Device Sync:** Implement PouchDB/CouchDB sync if user needs collaborative features
4. **Authentication:** If backend added, can introduce JWT/session auth when data leaves device

## Implementation Plan

### Phase 1: Client-Side Storage (Current Decision)
- Add `projectedMilestones` state to `FIRECalculator.tsx`
- Persist to localStorage with existing pattern
- Create milestone management UI components
- Add export/import backup functionality

### Phase 2: Potential Future Enhancements
- Export/Import as compressed JSON + encryption option
- Optional IndexedDB migration if data grows large
- API layer as separate feature (not required for core functionality)

## References
- Existing localStorage usage in `FIRECalculator.tsx` (lines 214-263)
- Types defined in `src/types.ts`
- Milestone display component: `src/components/Milestones.tsx`

---

**Why:** Security, privacy-first, and portability without complexity.  
**How to apply:** Implement localStorage persistence pattern matching existing `actuals` implementation; add export/import UI.
