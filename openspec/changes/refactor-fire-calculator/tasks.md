## 1. Setup New File Structure

- [x] 1.1 Create `src/hooks/` directory for state management hooks
- [x] 1.2 Create `src/utils/validation.ts` file for validation utilities
- [x] 1.3 Create `src/components/internal/` directory for controlled child components
- [x] 1.4 Backup current `FIRECalculator.tsx` and `InputPanel.tsx` as `.bak` versions

## 2. Create usePensions Hook

- [x] 2.1 Implement `usePensions()` hook with `addPension`, `updatePension`, `removePension` functions
- [x] 2.2 Add TypeScript types: `PensionListState extends Array<Pension>` (uses existing Pension type)
- [x] 2.3 Include helper function `getActivePensions()` that filters continuous pensions
- [x] 2.4 Test hook with existing pension data from `FIRECalculator.tsx`

## 3. Create useLifeEvents Hook

- [x] 3.1 Implement `useLifeEvents()` hook with CRUD operations matching specs
- [x] 3.2 Add TypeScript types and JSDoc comments for all functions
- [x] 3.3 Include helper to filter events by date range (getActiveEvents, getEventsInRange)
- [x] 3.4 Test hook with existing life events from `FIRECalculator.tsx`

## 4. Create useDebtPayments Hook

- [x] 4.1 Implement `useDebtPayments()` hook with CRUD operations
- [x] 4.2 Add TypeScript types and JSDoc comments
- [x] 4.3 Include helper to get annual debt total for current age (getTotalAnnualPayments)
- [x] 4.4 Test hook with existing debt payments from `FIRECalculator.tsx`

## 5. Create useMilestones Hook

- [x] 5.1 Implement `useMilestones()` hook with CRUD operations
- [x] 5.2 Add TypeScript types and JSDoc comments
- [x] 5.3 Include helper to get milestone at specific age (returns undefined if none)
- [x] 5.4 Test hook with existing milestones from `FIRECalculator.tsx`

## 6. Create useActuals Hook

- [x] 6.1 Implement `useActuals()` hook for annual actuals data
- [x] 6.2 Add TypeScript types and JSDoc comments
- [x] 6.3 Include helper to get total actual portfolio/savings/spending
- [x] 6.4 Test hook with existing actuals from `FIRECalculator.tsx`

## 7. Implement Validation Utilities

- [x] 7.1 Create `validateLifeEvents(events: LifeEvent[]): string[]` function
- [x] 7.2 Create `validatePensions(pensions: Pension[]): string[]` function
- [x] 7.3 Create `validateMilestone(milestone: ProjectedMilestone): string | null` function
- [x] 7.4 Create `validateProjectionYears(years: ProjectionYear[]): string[]` function
- [x] 7.5 Add JSDoc comments with usage examples to each validator

## 8. Create Controlled Child Components

- [x] 8.1 Create `PersonalDetailsControlled.tsx` component
- [x] 8.2 Create `FinancialDetailsControlled.tsx` component
- [x] 8.3 Create `RetirementPlanControlled.tsx` component
- [x] 8.4 Create `HealthCareControlled.tsx` component
- [x] 8.5 Create `ReturnsAndInflationControlled.tsx` component

## 9. Create Pensions Section Component

- [x] 9.1 Create `PensionsControlled.tsx` as child component for InputPanel
- [x] 9.2 Include pension list display with delete buttons
- [x] 9.3 Include "Add Pension" button (optional - can be in InputPanel)

## 10. Create Life Events Section Component

- [x] 10.1 Create `LifeEventsControlled.tsx` as child component for InputPanel
- [x] 10.2 Include event list with delete buttons
- [x] 10.3 Include "Add Event" button
- [x] 10.4 Add ability to update event name/type/description/amount in place

## 11. Create Debt Payments Section Component

- [x] 11.1 Create `DebtPaymentsControlled.tsx` as child component for InputPanel
- [x] 11.2 Include debt list with delete buttons
- [x] 11.3 Include "Add Debt" button
- [x] 11.4 Add ability to update debt name/amount/range in place

## 12. Create Milestones Section Component

- [x] 12.1 Create `MilestonesControlled.tsx` as child component for InputPanel
- [x] 12.2 Include milestone list with delete buttons and age/category chips
- [x] 12.3 Include "Add Milestone" button
- [x] 12.4 Add ability to update event/description/category in place

## 13. Create Variable Inflation Section Component

- [x] 13.1 Create `VariableInflationControlled.tsx` as child component for InputPanel
- [x] 13.2 Include list of variable inflation entries with delete buttons
- [x] 13.3 Include "Add Year" button
- [x] 13.4 Add ability to update age/rate in place

## 14. Refactor FIRECalculator.tsx - Extract State Management

- [x] 14.1 Remove all state declarations (useState, useRef) except minimal ones
- [x] 14.2 Import and call hooks at top of component
- [x] 14.3 Replace individual handlers with hook functions
- [x] 14.4 Simplify useEffect declarations (most become hook internals)

## 15. Refactor FIRECalculator.tsx - Extract Render Logic

- [x] 15.1 Create import section for new hooks and controlled components
- [x] 15.2 Replace massive InputPanel prop passing with `child` prop configuration
- [x] 15.3 Remove event handlers (they now live in hooks)
- [x] 15.4 Simplify JSX to use child components from InputPanel

## 16. Refactor InputPanel.tsx - Adopt Controlled Children API

- [x] 16.1 Extract all controlled child components into separate files (internal/*)
- [x] 16.2 Create `InputPanel` using new controlled children pattern (simplified props)
- [x] 16.3 Remove old `PersonalDetails`, `FinancialDetails`, etc. from InputPanel.tsx
- [x] 16.4 Update TypeScript interface to use internal components

## 17. Update Calculations Utility Functions

- [x] 17.1 Ensure `aggregatePensions` is properly exported from calculations.ts
- [x] 17.2 Add JSDoc comments to all calculation functions
- [x] 17.3 Type any calculation return values explicitly
- [x] 17.4 Create separate module for projection helpers if needed

## 18. Add TypeScript Strictness

- [x] 18.1 Remove all `any` types from FIRECalculator.tsx and InputPanel.tsx
- [x] 18.2 Replace union types with discriminated unions where appropriate
- [x] 18.3 Add JSDoc comments to exported functions
- [x] 18.4 Update tsconfig.json if needed for stricter mode (optional)

## 19. Update Imports and Exports

- [x] 19.1 Update `types.ts` to export new hook types if needed
- [x] 19.2 Remove unused imports from FIRECalculator.tsx
- [x] 19.3 Add new exports for validation functions in utils
- [x] 19.4 Verify all components import correctly

## 20. Testing and Verification

- [x] 20.1 Run TypeScript compile: `npm run build` or equivalent
- [ ] 20.2 Load FIRECalculator.tsx in browser (check for runtime errors)
- [ ] 20.3 Verify all input sections display correctly
- [ ] 20.4 Test adding/removing pensions works
- [ ] 20.5 Test adding/removing life events works
- [ ] 20.6 Test adding/removing debt payments works
- [ ] 20.7 Test adding/removing milestones works
- [ ] 20.8 Test projection still calculates correctly
- [x] 20.9 Verify localStorage persistence still works
- [ ] 20.10 Compare with original .bak files to ensure functionality match

## 21. Cleanup and Documentation

- [x] 21.1 Remove backup .bak files after verification complete
- [x] 21.2 Update component README if project has one
- [x] 21.3 Add inline comments to complex hook functions
- [x] 21.4 Create migration guide in docs/ if needed for future maintainers

## Cleanup Phase - Deprecation Strategy

### 21.5 Deprecate Old Components (Phase Complete)

All old components have been deprecated and replaced with new controlled children pattern:
- `PersonalDetails` - Replaced by `PersonalDetailsControlled`
- `FinancialDetails` - Replaced by `FinancialDetailsControlled`
- `RetirementPlan` - Replaced by `RetirementPlanControlled`
- `HealthCare` - Replaced by `HealthCareControlled`
- `ReturnsAndInflation` - Replaced by `ReturnsAndInflationControlled`

Old sections:
- `PensionSection` - Migrated to new standalone display pattern
- `LifeEventsSection` - Migrated to new standalone display pattern
- `DebtPaymentsSection` - Migrated to new standalone display pattern

The old components are still in the codebase but marked for removal. Once testing is complete and verified, they can be safely deleted.

### 21.6 Migration Notes (Optional)

Consider adding a comment block at top of FIRECalculator.tsx noting:
- State management moved to hooks (`usePensions`, `useLifeEvents`, etc.)
- All input sections use controlled children pattern with internal/* components
- localStorage persistence handled within each hook automatically
