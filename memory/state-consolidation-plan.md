# State Consolidation Plan - Option B (Non-Breaking)

**Date:** 2026-06-28  
**Status:** Planned, not yet implemented  
**Approach:** Keep current prop pattern, consolidate state definition only

---

## Goal

Consolidate all ~23 scattered `useState` hooks in `FIRECalculator.tsx` into a single consolidated initial state object, while keeping the same external prop interfaces (no breaking changes to InputPanel).

---

## Phase-by-Phase Implementation

### **Phase 1: Add Type Definition** (`src/types.ts`)

**Add these interfaces:**
```typescript
interface InputState {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentPortfolio: number;
  monthlyIncome: number;
  monthlySpending: number;
  retirementSpending: number;
  preRetirementReturn: number;
  coastingReturn: number;
  retirementReturn: number;
  inflationRate: number;
  socialSecurityAge: number;
  socialSecurityIncome: number;
  safeWithdrawalRate: number;
  medicareAge: number;
  healthCareMonthly: number;
  coastingMode: CoastingMode;
}

interface ActualsInitialState {
  portfolio: number;
  savings: number;
  spending: number;
}
```

**Lines changed:** +13 (in types.ts)

---

### **Phase 2: Consolidate State Definition** (`src/FIRECalculator.tsx`)

**Current (~90 lines):**
```typescript
const [currentAge, setCurrentAge] = useState(32);
const [retirementAge, setRetirementAge] = useState(52);
const [lifeExpectancy, setLifeExpectancy] = useState(95);
const [currentPortfolio, setCurrentPortfolio] = useState(555000);
// ... 18+ more individual states
```

**After (~10 lines):**
```typescript
import type { InputState } from './types';

const initialState: InputState = {
  currentAge: 32,
  retirementAge: 52,
  lifeExpectancy: 95,
  currentPortfolio: 555000,
  monthlyIncome: 22500,
  monthlySpending: 4000,
  retirementSpending: 15000,
  preRetirementReturn: 10,
  coastingReturn: 9,
  retirementReturn: 6,
  inflationRate: 3,
  socialSecurityAge: 65,
  socialSecurityIncome: 60000,
  safeWithdrawalRate: 3.5,
  medicareAge: 65,
  healthCareMonthly: 2000,
  coastingMode: { enabled: false, coastingAge: 50, coasingMultiplier: 0.75 },
};

const [inputs] = useState<InputState>(initialState);
```

**Lines changed:** ~80 lines consolidated → 10 lines

---

### **Phase 3: Add LocalStorage Persistence** (`src/FIRECalculator.tsx`)

**After existing localStorage saves (line ~226):**
```typescript
// Persist inputs state to localStorage
localStorage.setItem('fire_input_state', JSON.stringify(inputs));
```

**On mount (after line ~243, existing initial actuals load):**
```typescript
const savedInputs = localStorage.getItem('fire_input_state');
if (savedInputs) {
  try {
    setInputs(JSON.parse(savedInputs));
  } catch (e) {
    console.error('Failed to parse input state from localStorage', e);
  }
}
```

**Lines changed:** +10 (in FIRECalculator.tsx)

---

### **Phase 4: Sync Inputs on Changes** (`src/FIRECalculator.tsx`)

**After projection effect (line ~367):**
```typescript
useEffect(() => {
  localStorage.setItem('fire_input_state', JSON.stringify(inputs));
}, [inputs]);
```

**Lines changed:** +2 (in FIRECalculator.tsx)

---

### **Phase 5: Keep All Individual Handlers As-Is** (`src/FIRECalculator.tsx`)

**No changes needed to handlers.** They still pass individual values to InputPanel.

**Example - currentAge handler stays the same:**
```typescript
const [currentAge] = useState(32); // → becomes part of `inputs.currentAge`
// But handlers can keep: setCurrentAge = (value) => {/* ... */}
// Or simply: const handleCurrentAgeChange = (value: number) => { setInputs(p => ({...p, currentAge: value})); }
```

**Recommendation:** Create partial update helpers for cleaner code.

```typescript
const handleChangeField = <K extends keyof InputState>(field: K, value: InputState[K]) => {
  setInputs(prev => ({ ...prev, [field]: value }));
};

// Then handlers become:
const handleCurrentAgeChange = useCallback((value: number) => 
  handleChangeField('currentAge', value)
);
```

**Lines changed:** Optional +15 (helper functions)

---

### **Phase 6: Update All Field References** (`src/FIRECalculator.tsx`)

**Search/replace pattern:** Find all `const [fieldName, setFieldName]` accesses → change to `inputs.fieldName`

**Locations affected (~30 references):**
- Line ~89: coastingMode (keep as separate refactor target)
- Line ~284-292: actuals initial storage sync
- Line ~338-360: projection recalculation
- Line ~527-552: annual surplus calculation

**Example - projection effect:**
```typescript
// Before:
const { projection, fireTarget } = calculateProjection(
  currentAge, retirementAge, lifeExpectancy, ...
);

// After:
const { projection, fireTarget } = calculateProjection(
  inputs.currentAge, inputs.retirementAge, inputs.lifeExpectancy, ...
);
```

**Lines changed:** ~30 individual field references updated

---

### **Phase 7: Update Annual Surplus Effect** (`src/FIRECalculator.tsx`)

**Same pattern as Phase 6.** All `monthlyIncome`, `monthlySpending`, etc. become `inputs.monthlyIncome`.

**Dependencies array:**
```typescript
}, [
  inputs.monthlyIncome,
  inputs.monthlySpending,
  inputs.debtPayments,
  inputs.currentAge,
  inputs.medicareAge,
  inputs.healthCareMonthly,
  inputs.retirementAge,
  inputs.coastingMode,
]);
```

**Lines changed:** ~12 field references + dependency array updated

---

## Summary of All Changes

| File | Lines Added | Lines Removed | Net Change |
|------|-------------|---------------|------------|
| `src/types.ts` | +13 | 0 | +13 |
| `src/FIRECalculator.tsx` | +57 (storage refs) | -80 (scattered states) | -23 |

**Total lines changed:** ~40 lines modified across 2 files

## Breaking Changes: **NONE** ✅

- InputPanel props remain identical (`onCurrentAgeChange`, etc.)
- No changes to `src/components/InputPanel.tsx`
- No changes to `utils/calculations.ts`
- No changes to downstream consumers

## Migration Checklist

- [ ] Add `InputState` and `ActualsInitialState` interfaces to types.ts
- [ ] Create `initialState: InputState` object with all values
- [ ] Replace individual `useState` calls with single `[inputs] = useState<InputState>(initialState)`
- [ ] Add localStorage save after existing saves (line ~226)
- [ ] Add localStorage load on mount (after line ~243)
- [ ] Sync to localStorage after projection effect (line ~367)
- [ ] Update all field references to `inputs.fieldName` pattern
- [ ] (Optional) Create helper functions for cleaner partial updates
- [ ] Run `npm run build` to verify no TypeScript errors

---

## Testing Checklist After Migration

1. **Check initial values load correctly** from localStorage
2. **Test each input field change** updates projection (currentAge, monthlySpending, etc.)
3. **Verify annual surplus calculation** still produces same results
4. **Test coasting mode toggle** still works with nested object in consolidated state
5. **Check export functionality** includes all input fields
6. **Test import restoration** loads consolidated state correctly

---

## Potential Issues & Mitigations

### Issue 1: Large State Object May Cause Unnecessary Re-renders
**Risk:** Updating one field triggers re-render of entire consolidated state  
**Mitigation:** Accept this tradeoff for now; can later refactor to `useReducer` if needed

### Issue 2: Type Safety on Nested Objects (coastingMode)
**Risk:** Need nested partial updates like `{ ...prev, coastingMode: { ...prev.coastingMode, enabled } }`  
**Mitigation:** Either accept this pattern now or create specialized handlers later

### Issue 3: localStorage Key for Consolidated State
**Decision:** Using `fire_input_state` as new key; existing keys remain for actuals/milestones/etc.  
**Mitigation:** Can rename existing keys later if desired

---

## Next Steps

1. ✅ Review this plan
2. 🔜 Execute changes (add interfaces → consolidate state → update references)
3. 🔜 Test each field change produces correct projection updates
4. 🔜 Verify export/import still works with consolidated state

**Estimated time to implement:** 10-15 minutes
