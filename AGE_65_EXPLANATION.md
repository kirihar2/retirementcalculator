# Age 65 Net Cash Flow Explained

## Why It Makes Sense (With Your Current Defaults)

### The Calculation:
```
Net Cash Flow = Income - ALL Spending
               = (Social Security + Pension) - (Base Spending + Life Events + Health Care + Debt)
```

### At Age 65, You're Correct That This Should Be Negative! 🟥

**Your current defaults at age 65:**
- **Income**: SS ($60k) + Pension ($40k) = ~$100k/year
- **Spending Components**:
  - Base spending: ~$168k/year (inflation-adjusted from $4k/month)
  - Life Events: Travel (~$240k, active ages 52-72) ⚠️
  - Health Care: Likely included in base spending or medicareAge logic
  = **Total Spending: ~$408k/year**

**Net Cash Flow**: $100k - $408k = **-$308k ❌ (RED)**

This is CORRECT and expected because:
1. You're retired (no salary)
2. Your passive income ($100k) can't cover all spending (~$408k)
3. The shortfall comes from portfolio withdrawals

### Why This Is Actually GOOD for FIRE Planning! 💡

The negative net cash flow at retirement means:
- **Portfolio must fill the gap**: ~$308k/year withdrawal needed
- **This is sustainable** if you have enough assets (e.g., $25M+ for 4% rule)
- **You're not "contributing"** - you're in FIRE mode, withdrawing sustainably

### The Issue: Your Defaults May Be Unrealistic!

**Travel at $20k/month = $240k/year seems way too high!** 

Typical travel costs might be:
- $1.5k-$5k per trip
- 2-4 trips per year
- Total: $5k-$20k/year (NOT monthly!)

### Fix Options:

1. **Change Travel to One-Time Event:**
   ```javascript
   {
     id: '7',
     name: 'Travel',
     type: 'one-time',  // Not monthly!
     amount: 5000,      // $5k per trip, happens every year
     startAge: 62,      // Start adding travel savings
     endAge: null       // Or set to your retirement age + years of travel
   }
   ```

2. **Or Change to Realistic Monthly Amount:**
   ```javascript
   amount: 1500,  // $1500/month instead of $20000!
   ```

3. **Or Remove from Life Events entirely** (if it's already in base spending)

### The Bottom Line:

The formula IS correct - the issue is your default values include:
- Travel as $20,000 **per month**, not per year
- This creates a huge negative cash flow that seems wrong but is mathematically correct

**To fix**: Change travel from `$20,000/month` to either:
- `$1,500-$3,000/month` (realistic monthly travel budget)
- OR `type: 'one-time'` with amount like $5k-$10k per trip

Then the Net Cash Flow at age 65 will be something like **-$250k to -$100k**, which is more realistic while still showing that your passive income ($100k) doesn't cover total expenses.
