name: add-debt-payments-column
description: Added separate Debt Payments column to ProjectionTable for clearer expense tracking
metadata:
  type: feedback

**Problem**: The annual spending calculation now includes debt payments (mortgage, auto, student loans) but the ProjectionTable didn't show them separately, making it hard to see the breakdown.

**Solution**: Added a new "Debt Payments" column to the ProjectionTable with a purple background to clearly distinguish it from other expense categories.

**Files changed**:
- `src/types.ts` - Added `annualDebtPayments?: number` field to `ProjectionYear`
- `src/utils/calculations.ts` - Store annual debt payments in projection data for each year
- `src/components/ProjectionTable.tsx` - Added new column showing debt payments

**Now the table shows**:
| Age | Portfolio | Contribution | Spending | **Debt Payments** | Return | SS Income |
|-----|-----------|--------------|----------|-------------------|--------|-----------|
| 32  | $555K     | $155K        | $133K    | **$76K**          | $56K   | $0        |

This makes it easy to see:
- Total annual spending (includes everything you're spending)
- How much of that is debt-related vs discretionary spending

**Related**: [[bug-fix-actual-vs-projected-chart-tooltip]]
