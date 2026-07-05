# Debugging Age 65 +$54k Issue

## Current Code State

**calculations.ts Line 184 (post-retirement spending):**
```javascript
annualSpending += healthCareCost; // ADDS to existing value that includes life events
```

**calculations.ts Line 212 (net cash flow calculation):**
```javascript
const netCashFlow = annualIncome - annualSpending - annualDebtPayments; // Uses annualSpending with life events
```

## Expected Behavior at Age 65:

With your defaults:
- monthlySpending: $4,000
- Life Events at age 65 (active ages 52-72): Travel $20,000/month = $240k/year
- Health Care: medicareAge is 72, so no additional health costs at 65

**Calculations:**
1. baseAnnualSpending = monthlySpending * 12 × inflationFactor = ~$48k (inflation-adjusted from $4k/month)
2. annualSpending = baseAnnualSpending = ~$48k
3. Life events added: Travel $240k → annualSpending = ~$288k
4. healthCareCost added: 0 (already past pre-medicare period) → annualSpending stays ~$288k
5. annualIncome = SS ($60k) + Pension ($40k) = ~$100k
6. annualDebtPayments at age 65: Mortgage ended at age 58, so likely $0

**Net Cash Flow:** $100k - $288k - $0 = -$188k ❌ (Should be RED, negative)

## But You See +$54k...?

This suggests `annualSpending` is much lower than expected. Possible causes:

### Possibility 1: Life Events Aren't Being Added
Check if the life events loop (lines 134-143) is actually adding travel at age 65.

### Possibility 2: Spending Categories Override
Even with empty spendingCategories array, maybe `adjustedAnnualSpending` is being used instead of `annualSpending`.

### Possibility 3: Actuals Override
If you have past actual data stored, maybe it's being applied incorrectly to age 65.

## To Debug:

1. Check if travel life event is active at age 65:
   ```javascript
   travelEvent.startAge = 52
   travelEvent.endAge = 72
   ```
   Age 65 falls between 52-72, so it should be active.

2. Verify `annualSpending` includes life events by checking the calculation flow:
   - Line 111: `annualSpending = baseAnnualSpending`
   - Lines 134-143: Life events added to `annualSpending`
   - Line 184: healthCareCost added to `annualSpending`

3. The issue might be that I need to ALSO apply inflation adjustment to annualSpending, not just adjustedAnnualSpending. Let me check if that's needed...

## Potential Fix:

Maybe the display is showing nominal dollars but the calculation is using real (inflation-adjusted) spending. Let me check how `annualSpendingNominal` is calculated vs `finalAnnualSpending`:

Actually, looking at line 225 of calculations.ts:
```javascript
spendingNominal = Math.round(adjustedAnnualSpending * cumulativeInflationFactor);
```

This uses `adjustedAnnualSpending`, not `annualSpending`! So if the table is using `spendingNominal` instead of `finalAnnualSpending`, it would show spending without life events!

Let me check which field the ProjectionTable is using for comparison...

## Real Issue Found:

The table might be reading from `year.annualSpending` which should now include life events (after my fix), but there might be a timing issue where the rebuild isn't picking up the changes properly, OR the values are being cached somewhere.

Let me also check if we need to rebuild the types for ProjectionYear or if annualContribution is being stored incorrectly...
