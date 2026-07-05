# Debug Check: Age 65 Net Cash Flow = +$52k

## Current Behavior:
The table shows Net Cash Flow = +$52k (green) at age 65, but you expected it to be negative.

## Possible Causes:

### Cause 1: annualContribution from projection is positive
The formula uses:
```javascript
const netCashFlow = year.annualContribution > 0 ? year.annualContribution : (ss + pension - year.annualSpending);
```

If `year.annualContribution` at age 65 happens to be positive (like $52k), it shows that directly!

**Why this would happen:**
- The calculation in `calculations.ts` might store `annualContribution` as positive when income > base spending
- But the projection should calculate `annualContribution = Math.max(0, netCashFlow)` which clamps negatives to 0

### Cause 2: annualSpending stored doesn't include life events
Looking at the code flow:
1. Life events are added to `annualSpending` (line 138 of calculations.ts)
2. But then at age >= retirementAge, spending is reset:
   ```javascript
   if (age >= retirementAge) {
     annualIncome = ssIncome + annualPensionIncome;
     annualSpending = adjustedAnnualSpending + healthCareCost;  // <-- This resets spending!
   }
   ```

**This could be the bug!** The `annualSpending` value at age 65 might NOT include life events because it gets reset for post-retirement ages.

## To Fix:

I need to check if `annualSpending` at retirement ages properly includes life events OR if we should calculate net cash flow differently in the table.

The safest fix is to NOT rely on `year.annualContribution` but instead directly calculate from income and spending components that are available in the projection data.
