## Why

The `FIRECalculator.tsx` and `InputPanel.tsx` files have become unruly with excessive component complexity, prop surface bloat, and intertwined concerns. They violate the Single Responsibility Principle and make testing, maintenance, and feature additions error-prone. This refactor will split concerns into focused components, introduce controlled children patterns, and add TypeScript rigor to prevent runtime issues.

## What Changes

- **Split `FIRECalculator.tsx`**: Extract all state-handling logic (pensions, life events, debt, milestones, actuals, projections) into dedicated internal components
- **Restructure `InputPanel.tsx`**: Convert current prop-based inputs to controlled children API with typed callbacks
- **Add TypeScript strictness**: Remove `any` types, use proper union types for event categories and other enums
- **Introduce component hooks**: Create reusable `usePensions`, `useLifeEvents`, `useDebtPayments`, `useMilestones` hooks in a new `src/hooks/` directory
- **Extract render functions**: Move JSX rendering from main components to separate `RenderXxx.tsx` files for declarative clarity
- **Add validation layer**: Create `src/utils/validation.ts` with typed validators for inputs, milestones, and projections
- **Export utilities**: Make calculation helpers (`aggregatePensions`, projection helpers) properly exported from `calculations.ts`

## Capabilities

### New Capabilities

- **component-splitters**: Internal components that encapsulate single concerns (e.g., `PensionsPanel`, `LifeEventsPanel`)
- **hooks-for-manage-state**: Reusable hooks in `src/hooks/` for pensions, life events, debt, milestones, actuals
- **validation-utils**: Typed validation functions in `src/utils/validation.ts`

## Impact

- **Modified Code**: `FIRECalculator.tsx`, `InputPanel.tsx` (prop API replaced with controlled children), all child components receiving massive prop lists
- **New Files**: `hooks/` directory, `utils/validation.ts`, render helpers
- **Breaking Changes**: None to public API; internal component contracts change
