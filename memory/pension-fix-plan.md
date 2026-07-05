---
name: pension-fix-plan
description: Implementation of traditional pension support (annuity-style payments) with UI components
metadata:
  type: project
---

## Completed Implementation ✅

The implementation adds annuity-style pension support as an optional feature alongside existing retirement income tracking.

### What Was Implemented

#### 1. **src/types.ts**: Added Pension interfaces and functions
- `Pension` interface with fields for: id, name, currentAnnualPayout, startAge, endAge (optional - null = until death)
- `PensionSummary` interface with totalAnnualPensionIncome and activePensions array
- `aggregatePensions()` function to sum up all active pension incomes

#### 2. **src/utils/calculations.ts**: Pension income calculation logic
- Added optional `pensions?: Pension[]` parameter to `calculateProjection()`
- Implemented pension income addition to annual income during working years
- Pension payments treated as taxable ordinary income in projection
- Returns `projectionIncome` in each year with pension amounts

#### 3. **src/components/PensionSection.tsx**: New UI component for pension management
- Full CRUD operations: add, edit, remove traditional pensions
- Fields: name, annual payout ($), start age, end age (optional)
- Shows total annual pension income summary
- Optional field - users can choose not to use traditional pensions

#### 4. **src/components/InputPanel.tsx**: Updated with PensionInputs section
- Added PensionInputs component within the sidebar
- Integrated with FIRECalculator state management
- Pension data persists across session (state-based, not localStorage yet)

#### 5. **src/components/Scoreboard.tsx**: Updated to show pension income
- "Guaranteed Annual Income" section added
- Shows Pension Income card when pensions are configured
- Shows Social Security separately with standard start ages
- Visual indicator for combined guaranteed income sources

#### 6. **src/components/ProjectionTable.tsx**: Already had Pension column
- Added "Pension" column (amber background) showing pension income per year
- Works in both nominal and real display modes

#### 7. **src/FIRECalculator.tsx**: Main calculator updated
- State management for pensions array
- Calls `aggregatePensions()` to get total pension income
- Passes pensionSummary to Scoreboard component
- Pensions passed to calculations function (currently optional, defaults to empty)

## Design Rationale

Traditional corporate pensions (like defined benefit plans):
- Provide guaranteed monthly/annual income starting at retirement age
- Usually last until death (endAge is typically null)
- Treated as taxable ordinary income in FIRE projections
- Employer pays contributions - employee doesn't contribute (unlike 401k/IRA)
- Can be 20-50% of pre-retirement salary

This is different from investment accounts like 401k/IRA where you contribute and manage investments.

## Future Enhancements

### Suggested Improvements:
1. **Make pensions optional**: Add toggle to enable/disable pension modeling entirely
2. **Multiple pensions**: Currently supports single pension - add support for multiple (e.g., from different employers)
3. **Inflation adjustments**: Allow users to set inflation rate adjustment for pension payouts
4. **Tax treatment options**: Flag for tax-deferred vs. taxable pension income
5. **Endowment factor**: Some pensions have survivor benefits or annuity features
6. **Pension persistence**: Store pension data in localStorage like actuals
7. **ProjectionChart updates**: Add visualization showing income sources (SS vs pension vs portfolio)

## Files Modified Summary

| File | Change |
|------|--------|
| `src/types.ts` | Added Pension, PensionSummary interfaces and aggregatePensions() function |
| `src/utils/calculations.ts` | Added pensions parameter to calculateProjection(), implements income addition |
| `src/components/PensionSection.tsx` | NEW - Full CRUD UI component for pension management |
| `src/components/InputPanel.tsx` | Added PensionInputs subsection in sidebar |
| `src/components/Scoreboard.tsx` | Added guaranteed income section with pension display |
| `src/FIRECalculator.tsx` | Integrated state management and aggregatePensions() call |

## See Also

- [[pension-fix-completed]] for original implementation details
