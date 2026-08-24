## Context

The FIRE calculator currently initializes with hardcoded sample data (32-year-old, $480K portfolio, $22.5K/month income, etc.) spread across ~14 localStorage keys. New users see this pre-filled data and must manually clear it before entering their own. The app has Firebase auth + cloud sync implemented but the interaction with empty initial state hasn't been tested. There is no onboarding or walkthrough for first-time users.

## Goals / Non-Goals

**Goals:**
- New users see a clean slate with empty/zero inputs
- Existing test data preserved in a JSON fixture for development and testing
- Onboarding walkthrough guides users through first plan setup
- Firebase save/load works correctly with empty initial state
- Existing users with localStorage data are unaffected

**Non-Goals:**
- Changing the export/import file format (existing JSON export stays the same)
- Building a full tutorial system — one-time walkthrough overlay only
- Modifying the backend API or data model
- Handling multi-device onboarding sync

## Decisions

### 1. Empty state representation
Use zero/empty defaults instead of `null`/`undefined` to minimize changes to calculation logic.
- Numbers default to `0`
- Arrays default to `[]`
- Strings default to `''`
- Booleans default to `false`

**Rationale**: Calculations already handle numeric inputs. Using `0` avoids null-checks throughout the codebase. Arrays that are empty simply render empty sections. This keeps the change localized to initialization.

**Alternative considered**: Making fields optional (`number | null`). Rejected because it would require null-checks in every calculation, chart, and display component.

### 2. Onboarding implementation
Build a lightweight step-based overlay using MUI Dialog + custom stepper, not a third-party tour library.
- 4-5 steps highlighting: inputs drawer, scoreboard, charts, analysis tabs
- Each step has a brief description and a "Next"/"Skip" button
- Persist `fire_has_seen_onboarding` in localStorage
- Only show when the flag is absent or `false`

**Rationale**: Avoids adding a dependency for a simple feature. MUI components are already in use. The overlay is straightforward and maintainable.

**Alternative considered**: `react-joyride` or similar. Rejected — adds a dependency for a one-time feature, and the highlight/tooltip pattern is more complex than needed.

### 3. Test data fixture approach
Create `test-data/sample-plan.json` containing the current hardcoded defaults in the same format as the existing export feature (`aggregateLocalPlan()` output).

**Rationale**: Reuses the existing Plan wire format. Can be loaded via the existing import feature for testing. Serves as documentation of the original sample data.

### 4. Cloud sync with empty state
Don't push empty plans to the backend. Only sync when at least one meaningful input is non-default.
- Check if all numeric inputs are `0` and all arrays are empty
- If so, skip the cloud push
- This prevents overwriting a remote plan with empty data on first login

**Rationale**: Without this guard, a new user who signs in before entering any data could wipe their remote plan.

### 5. Existing user migration
No migration needed. Users with existing localStorage data keep it. The `fire_has_seen_onboarding` flag controls walkthrough display independently.

## Risks / Trade-offs

- **[Empty state breaks calculations]** → Calculations with zero inputs may produce nonsensical results (division by zero, negative ages). Mitigation: Add guard in `calculateProjection` to skip calculation when critical inputs are zero, show "Enter your details to see projections" message.
- **[Users confused by empty state]** → Without any guidance, users may not know what to enter. Mitigation: Onboarding walkthrough + placeholder text in empty sections.
- **[Walkthrough blocks app interaction]** → Modal overlay prevents using the app during walkthrough. Mitigation: Keep steps brief, allow skip, and position walkthrough to not block the inputs drawer.
- **[Cloud sync race on first login]** → Empty local state + existing remote plan could trigger reconciliation that overwrites remote. Mitigation: Empty-state guard in cloud sync skip push when local is all zeros.
