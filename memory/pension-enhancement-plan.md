---
name: pension-enhancement-plan
description: Actionable plan for implementing remaining pension features (UI input, scoreboard, charts)
metadata:
  type: project
---

## Goal

Add user-facing pension management and visualization to the retirement planning app while maintaining backward compatibility with existing code.

## Implementation Phases

### Phase 1: Add Pension Input UI Component ⏳

**Priority:** High — Enables users to model pension scenarios

#### Changes to `src/components/InputPanel.tsx`

Create a new component `PensionInputSection`:

```typescript
// Suggested component structure (add after HealthCare section)
import React, { useState } from 'react';
import { Box, Typography, TextField, Switch, Button, Divider } from '@mui/material';
import type { Pension, PensionSummary } from '../types';
import { aggregatePensions } from '../types';

interface PensionInputSectionProps {
  onAddPension: (pension: Omit<Pension, 'id'>) => void;
  onRemovePension: (pensionId: string) => void;
  pensions: Pension[]; // Will be passed to component
}

export const PensionInputSection: React.FC<PensionInputSectionProps> = ({
  onAddPension,
  onRemovePension,
  pensions,
}) => {
  const [hasPension, setHasPension] = useState(false);
  const [pensionName, setPensionName] = useState('');
  const [annualPayout, setAnnualPayout] = useState('');
  const [startAge, setStartAge] = useState(retirementAge); // Default to retirement age
  const [endAge, setEndAge] = useState(lifeExpectancy); // Default to life expectancy

  const handleAddPension = () => {
    if (!hasPension || !annualPayout) return;
    
    const newPension: Omit<Pension, 'id'> = {
      name: pensionName || `Pension ${pensions.length + 1}`,
      currentAnnualPayout: Number(annualPayout),
      startAge: Number(startAge),
      endAge: endAge === lifeExpectancy ? null : Number(endAge), // null = until death
    };
    
    onAddPension(newPension);
    
    // Reset form
    setHasPension(false);
    setPensionName('');
    setAnnualPayout('');
    setStartAge(retirementAge);
    setEndAge(lifeExpectancy);
  };

  return (
    <Box>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Traditional Pension Income
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
        Model employer-sponsored annuity-style pension income (e.g., from a former employer).
        Different from Social Security - this is taxable ordinary income.
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1" sx={{ mr: 2 }}>Enable Traditional Pension Income</Typography>
        <Switch
          checked={hasPension}
          onChange={(e) => setHasPension(e.target.checked)}
          color="primary"
        />
      </Box>

      {hasPension && (
        <>
          <TextField
            label="Pension Name (optional)"
            value={pensionName}
            onChange={(e) => setPensionName(e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              label="Annual Payout ($)"
              type="number"
              value={annualPayout}
              onChange={(e) => setAnnualPayout(e.target.value)}
              variant="outlined"
              size="small"
            />

            <TextField
              label="Start Age"
              type="number"
              value={startAge}
              onChange={(e) => setStartAge(Number(e.target.value))}
              variant="outlined"
              size="small"
              min={retirementAge}
              max={lifeExpectancy}
            />

            <TextField
              label="End Age (null = until death)"
              type="number"
              value={endAge === lifeExpectancy ? '' : endAge}
              onChange={(e) => setEndAge(e.target.value ? Number(e.target.value) : lifeExpectancy)}
              variant="outlined"
              size="small"
            />

            <Button
              variant="contained"
              onClick={handleAddPension}
              disabled={!annualPayout || Number(annualPayout) <= 0}
            >
              Add Pension Income
            </Button>
          </Box>

          {pensions.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Current Pensions ({pensions.length})
              </Typography>
              {pensions.map(p => (
                <Box key={p.id} sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, mb: 0.5 }}>
                  <Typography variant="body2">
                    {p.name || 'Unnamed Pension'} • ${formatCurrency(p.currentAnnualPayout)}/year
                    (Starting age {p.startAge}, ending at {p.endAge ?? 'death'})
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => onRemovePension(p.id)}
                    sx={{ mt: 0.5 }}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Box>
          )}

          {/* Show aggregate summary */}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Total Annual Pension Income: {formatCurrency(aggregatePensions(pensions).totalAnnualPensionIncome)}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default PensionInputSection;
```

**Wire up to InputPanel:**

```typescript
// In InputPanel component - add pensions state and pass props
interface InputPanelProps {
  // ... existing props
  pensions: Pension[];
  onAddPension: (pension: Omit<Pension, 'id'>) => void;
  onRemovePension: (pensionId: string) => void;
}

// Add PensionInputSection after HealthCare section in render
<HealthCare {...healthCareProps} />
<PensionInputSection
  pensions={props.pensions}
  onAddPension={props.onAddPension}
  onRemovePension={props.onRemovePension}
/>
```

**Estimated effort:** 1-2 hours


---

### Phase 2: Update Scoreboard Component ⏳

**Priority:** Medium — Shows pension income in summary view

#### Changes to `src/components/Scoreboard.tsx`

Current scoreboard shows guaranteed income from SS. Add pension line items.

```typescript
import { PensionSummary } from '../types'; // Import type if needed

// In ScoreboardProps interface - add pensions parameter
interface ScoreboardProps {
  projection: ProjectionYear[];
  fireTarget: number;
  fireAgeAchieved: number | null;
  actual?: AnnualActuals[];
  socialSecurityIncome: number;
  safeWithdrawalRate: number;
  annualSurplus: number; // This currently needs to include pension income
  // Add new props
  pensions?: Pension[];
}

// In render - add pension income lines after SS income section
export const Scoreboard: React.FC<ScoreboardProps> = ({
  projection,
  fireTarget,
  fireAgeAchieved,
  annualSurplus,
  socialSecurityIncome,
  pensions, // Add this prop
}) => {
  const lastYear = projection[projection.length - 1];

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>Scoreboard</Typography>

      {/* Show both SS and Pension income */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          Guaranteed Annual Income
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 3, flexDirection: ['column', 'row'], flexWrap: 'wrap' }}>
          {/* Social Security */}
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: '#f3e5f5', 
              borderRadius: 1,
              flex: 1
            }}
          >
            <Typography variant="caption" sx={{ color: '#7b1fa2' }}>🔵 Social Security</Typography>
            <Typography variant="h5">${formatCurrency(lastYear?.ssIncome || 0)}</Typography>
            <Typography variant="caption" color="text.secondary">
              Starts age {lastYear?.age ?? '-'}
            </Typography>
          </Box>

          {/* Pension */}
          {(pensions && aggregatePensions(pensions).totalAnnualPensionIncome > 0) && (
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: '#fff3e0', 
                borderRadius: 1,
                flex: 1
              }}
            >
              <Typography variant="caption" sx={{ color: '#e65100' }}>🏛️ Traditional Pension</Typography>
              <Typography variant="h5">${formatCurrency(lastYear?.pensionIncome || 0)}</Typography>
              <Typography variant="caption" color="text.secondary">
                Employer-sponsored annuity income (taxable)
              </Typography>
            </Box>
          )}

          {/* Combined total */}
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: '#e8f5e9', 
              borderRadius: 1,
              flex: 1
            }}
          >
            <Typography variant="subtitle2" sx={{ color: '#2e7d32' }}>
              Combined Guaranteed Income
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="#1b5e20">
              ${formatCurrency(
                (lastYear?.ssIncome || 0) + 
                (lastYear?.pensionIncome || 0)
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {((lastYear?.ssIncome || 0) + (lastYear?.pensionIncome || 0)) / lastYear.spending * 100}% of spending covered
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Keep existing score metrics */}
      {/* ... */}
    </Paper>
  );
};
```

**Wire up in FIRECalculator:**

```typescript
// After calculating projection, calculate pension income for last year
const lastYear = projection[projection.length - 1];
const { totalAnnualPensionIncome: annualPensionIncome } = aggregatePensions(pensions || []);

// Pass to Scoreboard
<Scoreboard
  projection={projection}
  fireTarget={fireTarget}
  fireAgeAchieved={fireAgeAchieved}
  annualSurplus={annualSurplus}
  socialSecurityIncome={socialSecurityIncome}
  pensions={pensions || []}
/>
```

**Estimated effort:** 1-2 hours


---

### Phase 3: Update Annual Surplus Calculation ⏳

**Priority:** Medium — Accurate cash flow tracking

#### Changes to `src/FIRECalculator.tsx`

The current annualSurplus calculation doesn't account for pension income. Need to update the logic.

```typescript
// In FIRECalculator.tsx - find where annualSurplus is calculated
// Currently around line 285-305, add pension-aware calculation

// Extract last year from projection
const lastYear = projection[projection.length - 1];

// Calculate monthly pension income
const monthlyPensionIncome = (lastYear?.pensionIncome || 0) / 12;

// Update annualSurplus to include pension income
if (retirementAge <= lifeExpectancy) {
  const retirementIndex = projection.findIndex(y => y.age >= retirementAge);
  
  // For retired years, calculate surplus with pension and SS
  if (lastYear.age >= retirementAge) {
    const lastSSIncome = lastYear?.ssIncome || 0;
    
    // AnnualSurplus for FIRE calculator: income - spending
    annualSurplus = (lastSSIncome + monthlyPensionIncome * 12) - 
                     (retirementSpending * 12 * Math.pow(1 + inflationRate/100, lastYear.age - retirementAge));
    
    // Health care costs already included in spending calculation
  } else {
    // Pre-retirement (working years)
    annualSurplus = (monthlyIncome + monthlyPensionIncome) * 12 - 
                    (monthlySpending * 12);
  }
}
```

**Alternative simpler approach** - calculate pension-aware surplus based on current phase:

```typescript
// After projection is calculated, compute pension-informed surplus
let annualSurplus: number;

const lastYear = projection[projection.length - 1];
const monthlyPensionIncome = (lastYear?.pensionIncome || 0) / 12;

if (lastYear.age >= retirementAge) {
  // Retired phase
  const ssIncome = lastYear?.ssIncome || 0;
  const inflationFactor = Math.pow(1 + inflationRate/100, lastYear.age - retirementAge);
  const adjustedSpending = retirementSpending * 12 * inflationFactor;
  
  annualSurplus = (ssIncome + monthlyPensionIncome * 12) - adjustedSpending;
} else {
  // Working phase with pension income
  annualSurplus = (monthlyIncome + monthlyPensionIncome) * 12 - 
                  (monthlySpending * 12);
}

// Update state
setAnnualSurplus(annualSurplus);
```

**Wire up pensions prop to FIRECalculator:**

```typescript
const [pensions, setPensions] = useState<Pension[]>([]); // New state

// Initial actuals input (add pension inputs here too)
const addActual = (age: number) => {
  setActuals([...actuals, { age, portfolio: 0, savings: 0, spending: 0 }]);
};

// Add pension management functions
const addPension = (pension: Omit<Pension, 'id'>) => {
  const newPension: Pension = {
    ...pension,
    id: `pension-${Date.now()}`,
  };
  setPensions([...pensions, newPension]);
};

const removePension = (pensionId: string) => {
  setPensions(pensions.filter(p => p.id !== pensionId));
};

// In useEffect where projection is calculated
useEffect(() => {
  // ... existing code
  
  const lastYear = projection[projection.length - 1];
  const monthlyPensionIncome = (lastYear?.pensionIncome || 0) / 12;
  
  if (lastYear.age >= retirementAge) {
    const ssIncome = lastYear?.ssIncome || 0;
    const inflationFactor = Math.pow(1 + inflationRate/100, lastYear.age - retirementAge);
    const adjustedSpending = retirementSpending * 12 * inflationFactor;
    
    annualSurplus = (ssIncome + monthlyPensionIncome * 12) - adjustedSpending;
  } else {
    annualSurplus = (monthlyIncome + monthlyPensionIncome) * 12 - 
                    (monthlySpending * 12);
  }

  // ... rest of useEffect
}, [currentAge, retirementAge, lifeExpectancy, currentPortfolio, monthlyIncome, monthlySpending, 
    retirementSpending, preRetirementReturn, coastingReturn, retirementReturn, inflationRate,
    socialSecurityAge, socialSecurityIncome, safeWithdrawalRate, medicareAge, healthCareMonthly,
    pensions]); // Add pensions to dependency array
```

**Estimated effort:** 2-3 hours


---

### Phase 4: Update ProjectionTable (Optional Enhancement) ⏳

**Priority:** Low — Visual enhancement for existing column

Current table has a Pension column but it's hidden when no pensions exist. Can improve visibility.

#### Suggested Improvements

1. **Always show Pension column header** - even if values are zero
2. **Add color coding** - green cells for years with pension income, gray for zero
3. **Add tooltip or summary footer** showing total pension income across all years

```typescript
// In ProjectionTable.tsx - update rendering logic
<TableCell align="right" style={{ backgroundColor: '#fff3e0' }}>Pension</TableCell>

// In map function - add conditional styling for pension column
<p style={{ 
  color: year.pensionIncome && year.pensionIncome > 0 ? 'green' : '#999',
  fontWeight: year.pensionIncome && year.pensionIncome > 0 ? 'bold' : 'normal'
}}>
  {formatCurrency(year.pensionIncome || 0)}
</p>
```

**Estimated effort:** 30-60 minutes


---

### Phase 5: Add Pension Summary Footer (Optional) ⏳

**Priority:** Low — User-friendly summary display

Add a footer or sidebar showing pension impact at a glance.

#### Suggested Component in `Footer.tsx`

```typescript
export const FooterWithPensions: React.FC<{
  projection: ProjectionYear[];
  pensions?: Pension[];
}> = ({ projection, pensions }) => {
  const lastYear = projection[projection.length - 1];
  const { totalAnnualPensionIncome } = aggregatePensions(pensions || []);
  const monthlyPensionIncome = (lastYear?.pensionIncome || 0) / 12;
  
  return (
    <Footer>
      {/* ... existing footer content */}
      
      {/* Add pension summary section */}
      {totalAnnualPensionIncome > 0 && (
        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            🏛️ Traditional Pension Summary
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">Monthly Income</Typography>
              <Typography variant="h6">${formatCurrency(monthlyPensionIncome)}</Typography>
            </Box>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">Annual Income</Typography>
              <Typography variant="h5">${formatCurrency(totalAnnualPensionIncome)}</Typography>
            </Box>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">Years of Income</Typography>
              <Typography variant="h6">{(() => {
                const startAge = Math.min(...(pensions || []).map(p => p.startAge));
                const endAge = Math.max(...(pensions || []).filter(p => !p.endAge || p.endAge === null).map(p => 
                  p.endAge ?? lifeExpectancy
                ));
                return endAge - startAge;
              })().toFixed(0)} years</Typography>
            </Box>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            💡 Note: Pension income is taxable ordinary income, separate from Social Security.
          </Typography>
        </Box>
      )}
    </Footer>
  );
};
```

**Estimated effort:** 1-2 hours


---

## Summary of Efforts

| Phase | Task | Priority | Estimated Effort |
|-------|------|----------|------------------|
| 1 | Add Pension Input UI Component | High | 1-2 hours |
| 2 | Update Scoreboard Component | Medium | 1-2 hours |
| 3 | Update Annual Surplus Calculation | Medium | 2-3 hours |
| 4 | Update ProjectionTable Visibility | Low | 30-60 min |
| 5 | Add Pension Summary Footer | Low | 1-2 hours |
| **Total** | | | **6-10 hours** |

## Implementation Order Recommendation

1. **Phase 1 first** - Core functionality (input UI)
2. **Phase 3 next** - Accurate calculations with pensions
3. **Phase 2** - Display in scoreboard
4. **Phases 4-5** - Visual enhancements (optional)

## Testing Checklist

- [ ] Add pension income via UI
- [ ] Verify projection includes pension income in correct years
- [ ] Check that annualSurplus reflects pension income
- [ ] Confirm Scoreboard displays pension income boxes
- [ ] Test removal of pensions updates projection correctly
- [ ] Verify inflation adjustment works for pension payout
- [ ] Check edge cases: multiple pensions, pension ending before death

## Files to Modify

1. `src/components/InputPanel.tsx` - Add PensionInputSection component
2. `src/components/Scoreboard.tsx` - Add pension income display
3. `src/FIRECalculator.tsx` - Update annualSurplus calculation and add pensions state
4. `src/components/Footer.tsx` (optional) - Add pension summary

## Dependencies

- Build must succeed after each change (already passes TypeScript checks)
- No external dependencies required (all existing MUI components)

See [[pension-fix-completed]] for implementation reference.
