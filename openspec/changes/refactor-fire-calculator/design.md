## Context

The current `FIRECalculator.tsx` is a monolithic component with 500+ lines containing:
- Consolidated input state (70+ fields)
- All event handlers (pensions, life events, debt, milestones, actuals)
- Calculation effects and localStorage persistence
- JSX rendering for all sections

The `InputPanel.tsx` uses a prop-based API with 35+ props passed from `FIRECalculator`. This creates:
- Massive prop surface area in parent component
- Tight coupling between state and UI
- Hard to test individual input sections independently
- No separation of concerns

## Goals / Non-Goals

**Goals:**
- Split monolithic `FIRECalculator.tsx` into focused, testable components
- Replace prop-based API with controlled children pattern in `InputPanel`
- Introduce reusable hooks for complex state management (pensions, life events)
- Add TypeScript validation utilities
- Reduce component file complexity (each < 100 lines target)

**Non-Goals:**
- Changing calculation logic
- Altering chart rendering
- Redesigning UI layout
- Adding new features beyond refactoring

## Decisions

### Controlled Children API over State Passing
Instead of passing state values as props with callbacks, we'll use a hybrid approach:
```tsx
// Old (prop-based):
<InputPanel currentAge={age} onCurrentAgeChange={onChange} />

// New (controlled children):
<InputPanel child="personal-details">
  <PersonalDetailsControlled age={age} setAge={setAge} />
</InputPanel>
```
**Rationale**: Reduces prop count from 35 to a type-safe interface. The `child` prop becomes a key that determines which internal components render.

### Hook Extraction Pattern
Create hooks in `src/hooks/`:
- `usePensions`: Handles pension CRUD operations with proper typing
- `useLifeEvents`: Manages life events array and mutations
- `useDebtPayments`: Debt payment state management
- `useMilestones`: Projected milestone tracking

**Why hooks?** They encapsulate event handlers, reduce prop drilling in render components, and make unit testing easier.

### Validation Layer in `utils/validation.ts`
Create dedicated validators:
```tsx
validateLifeEvents(events: LifeEvent[]): string[];
validatePensions(pensions: Pension[]): string[];
validateMilestone(milestone: ProjectedMilestone): string | null;
```
**Why separate?** Allows reusing validation logic in forms, error displays, and API exports without duplication.

### Render Helper Functions
Move JSX rendering to `RenderXxx.tsx` files:
- `RenderPensions.tsx`: Only contains JSX for pensions section
- `RenderLifeEvents.tsx`: Life events table/panel JSX
- etc.

**Why separate?** Allows declarative components in `FIRECalculator` like:
```tsx
<Box>
  <RenderPensions state={pensions} onAdd={add} onUpdate={upd} onDelete={del} />
  <RenderLifeEvents state={lifeEvents} onAdd={add} ... />
</Box>
```

### TypeScript Strictness
- Replace `any` with proper types (`unknown`, or specific union types)
- Use discriminated unions for event categories
- Add JSDoc comments to helper functions

**Why strict?** Catches bugs at compile time; improves IDE autocomplete.

## Risks / Trade-offs

[High prop reduction effort] → Mitigation: Keep existing functionality identical during refactor; test thoroughly before/after.

[Tight coupling between components and hooks] → Mitigation: Ensure all hooks are pure state transformers where possible, not side-effect driven.

[Maintaining backward compatibility for exports] → Mitigation: Update `calculations.ts` to properly export `aggregatePensions`; add deprecation warnings if needed.

## Migration Plan

1. Create new file structure (`hooks/`, `utils/validation.ts`, render helpers)
2. Extract state handlers into hooks
3. Refactor `FIRECalculator.tsx` to use controlled children pattern
4. Update `InputPanel.tsx` interface
5. Add validation utilities
6. Test all scenarios before committing changes

## Open Questions

1. Should we keep a hybrid transition period (both prop-based and controlled children) for backward compatibility?
2. How granular should render helpers be per-section vs grouping related sections?
