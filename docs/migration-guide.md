# FIRE Calculator Refactor Migration Guide

## Overview

The FIRECalculator component was refactored from a monolithic component with inline state to a hooks-based architecture with controlled child components.

## What Changed

### State Management → Hooks

Previously, all state was managed inline in `FIRECalculator.tsx` with `useState` arrays and manual setter functions. Now each domain has its own hook:

| Domain | Old Pattern | New Hook |
|--------|-------------|----------|
| Pensions | `const [pensions, setPensions] = useState(...)` | `usePensions()` from `src/hooks/usePensions.ts` |
| Life Events | `const [lifeEvents, setLifeEvents] = useState(...)` | `useLifeEvents()` from `src/hooks/useLifeEvents.ts` |
| Debt Payments | `const [debtPayments, setDebtPayments] = useState(...)` | `useDebtPayments()` from `src/hooks/useDebtPayments.ts` |
| Milestones | `const [milestones, setMilestones] = useState(...)` | `useMilestones()` from `src/hooks/useMilestones.ts` |
| Actuals | `const [actuals, setActuals] = useState(...)` | `useActuals()` from `src/hooks/useActuals.ts` |

### Hook API Pattern

All hooks follow the same CRUD interface:

```ts
const { items, addItem, updateItem, removeItem } = useItems(initialItems);
```

- `addItem(data: Omit<Item, 'id'>)` — adds with auto-generated id
- `updateItem(id: string, updates: Partial<...>)` — partial update, returns `boolean`
- `removeItem(id: string)` — removes by id

### Input Sections → Controlled Children

Previously, `InputPanel` contained all the input sections inline with massive prop lists. Now each section is a standalone controlled component in `src/components/internal/`:

- `PersonalDetailsControlled`
- `FinancialDetailsControlled`
- `RetirementPlanControlled`
- `HealthCareControlled`
- `ReturnsAndInflationControlled`
- `PensionsControlled`
- `LifeEventsControlled`
- `DebtPaymentsControlled`
- `MilestonesControlled`
- `VariableInflationControlled`

Each component receives only the data it needs and callbacks for mutations — no shared global state.

### Reset / Import

Reset and Import now work by writing to `localStorage` and calling `window.location.reload()`, since hooks can't be reset in-place without remounting.

## Validation Utilities

New validation functions in `src/utils/validation.ts`:

- `validateLifeEvents(events)` → `string[]`
- `validatePensions(pensions)` → `string[]`
- `validateMilestone(milestone)` → `string | null`
- `validateProjectionYears(years)` → `string[]`
- `validateMilestones(milestones)` → `string[]`

## Calculations

`src/utils/calculations.ts` exports:

- `aggregatePensions(pensions?)` → `PensionSummary`
- `calculateProjection(...)` → `{ projection, fireTarget, fireAgeAchieved }`
