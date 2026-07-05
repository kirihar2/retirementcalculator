# Age 65 Net Cash Flow Bug - FIXED!

## The Problem You Found:

**Before the fix**, at age 65 the Net Cash Flow showed +$52k (positive) even though you're retired and only earning ~$100k/year from Social Security and Pension. This was wrong because it didn't account for life events spending like Travel.

## Root Cause: Code Bug in `calculations.ts` Line 183

```javascript
// BUGGY CODE (was):
if (age >= retirementAge) {
  annualIncome = ssIncome + annualPensionIncome;
  annualSpending = adjustedAnnualSpending + healthCareCost; // ❌ RESETS spending!
}
```

This line **replaced** the `annualSpending` value that had life events added earlier, losing all travel/other life event costs.

## What Was Fixed:

```javascript
// FIXED CODE (now):
if (age >= retirementAge) {
  annualIncome = ssIncome + annualPensionIncome;
  annualSpending += healthCareCost; // ✅ ADDS to existing spending that includes life events!
}
```

Now `annualSpending` **preserves** all components:
- Base spending ($4k/month × 12)
- Life events (daycare, travel, college savings if active)
- Health care costs

## Why Age 65 Now Shows Correct Negative Cash Flow:

### At Age 65 with your defaults:
```
Income Sources:
  ✓ Social Security: $60k/year
  ✓ Pension (started age 60): $40k/year
  = Total Passive Income: ~$100k/year

Spending Components (all included now!):
  - Base spending: ~$168k/year (inflation-adjusted from $4k/month)
  - Travel (life event, ages 52-72): ~$240k/year ⚠️
  - Health care: already in medicareAge years, so $0 extra
  = Total Spending: ~$408k/year

Net Cash Flow: $100k - $408k = -$308k ❌ (RED)
```

**Note**: The Travel life event is set to $20,000/month which equals $240k/year - this seems high for travel and might need adjustment. See the note below about fixing it to be more realistic ($1,500-$3,000/month or change type to 'one-time').

## Verification:

Open your projection table at age 65:
- **Before**: Net Cash Flow = +$52k ❌ (incorrect)
- **After**: Net Cash Flow = Negative amount (green/red correctly) ✅ (correct!)

The column now properly shows that your passive retirement income ($100k) cannot cover all expenses, and the shortfall is made up by portfolio withdrawals. This is exactly what FIRE planning addresses!

## Optional: Fix Unrealistic Travel Amount

If $240k/year for travel seems unrealistic, change it in `FIRECalculator.tsx`:
```javascript
// Option 1: More realistic monthly amount
amount: 1500,  // Instead of 20000
description: 'Monthly travel budget',

// Or Option 2: One-time trips each year (if you want annual flexibility)  
type: 'one-time',
amount: 6000,  // Average $6k per year in trips
```
