---
name: fire-calculator-pensions
description: FIRECalculator updated to call calculateProjection with optional pensions parameter
metadata:
  type: project
---

Updated `src/FIRECalculator.tsx` to correctly call `calculateProjection()` with the new optional `pensions` parameter.

**Before:** Passed `coastingMode` and `actuals` in original order
```typescript
calculateProjection(
  ...,
  lifeEvents,
  debtPayments,
  coastingMode,     // <- wrong position
  actuals           // <- wrong position
)
```

**After:** Added `undefined` for pensions parameter
```typescript
calculateProjection(
  ...,
  lifeEvents,
  debtPayments,
  undefined,        // <- pensions (optional, no traditional pensions by default)
  coastingMode,     // <- correct position
  actuals           // <- correct position
)
```

See [[pension-fix-completed]] for full implementation details.
