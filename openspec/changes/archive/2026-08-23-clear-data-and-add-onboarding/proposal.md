## Why

New users currently see hardcoded sample data (a 32-year-old with $480K portfolio, $22.5K monthly income, etc.) which is confusing and makes the app feel pre-configured rather than personalized. We need to clear these defaults so new users start with a clean slate, export the existing test data to a JSON fixture for development/testing, ensure Firebase save works correctly for authenticated users, and add an onboarding walkthrough to guide first-time users through the app.

## What Changes

- Export all current hardcoded default values to a test JSON fixture file (`test-data/sample-plan.json`)
- Clear all hardcoded default values in FIRECalculator.tsx so new users start with empty/zero inputs
- Update initialization logic to handle empty state gracefully (no crashes, show helpful prompts)
- Verify and fix Firebase cloud save/load integration so authenticated users' data persists correctly
- Add a first-time user onboarding walkthrough that explains key features and guides users through their first plan setup
- Ensure the walkthrough only shows once per user (persist `hasSeenOnboarding` flag)

## Capabilities

### New Capabilities
- `data-export-fixture`: Export current test data to JSON fixture file for development/testing
- `clean-slate-initialization`: Clear hardcoded defaults so new users start with empty state
- `onboarding-walkthrough`: First-time user tutorial that explains app features and guides initial setup

### Modified Capabilities
- `user-data-api`: Ensure Firebase save/load works correctly with empty initial state and handles edge cases (no existing plan, first save after onboarding)

## Impact

- **FIRECalculator.tsx**: Remove hardcoded default values, update initialization to use empty/zero state, add onboarding trigger logic
- **types.ts**: May need to make some fields optional or add default-empty handling
- **useCloudSync.ts**: Ensure cloud sync handles empty initial state correctly (don't push empty plan on first load)
- **New component**: `OnboardingWalkthrough.tsx` - step-by-step tutorial overlay
- **New file**: `test-data/sample-plan.json` - exported fixture with current test data
- **localStorage**: Add `fire_has_seen_onboarding` flag
- **No breaking changes**: Existing users with localStorage data keep their data; only new users see empty state
