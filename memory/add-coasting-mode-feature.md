name: add-coasting-mode-feature
description: Added coasting mode - reduced income before retirement option
metadata:
  type: project

The app now supports "coasting mode" - a feature that allows users to take a less stressful job with reduced income before retiring, rather than working part-time. This is different from traditional Barista FIRE (working part-time).

**Implementation:**
1. **types.ts**: Added `CoastingMode` interface with fields for enabled status, coasting age, and income multiplier (0.5-1.0)
2. **calculations.ts**: Modified to support three phases: normal work (full income), coasting (reduced income via `coasingMultiplier`), and retirement. Added `isCoasting` flag to projection for visualization.
3. **InputPanel.tsx**: Added new "Coasting Mode" section with toggle switch, age input, and income multiplier slider
4. **FIRECalculator.tsx**: Added coasting mode state with handlers:
   - `coastingMode`: { enabled, coastingAge, coasingMultiplier }
   - When enabled, annual income is multiplied by `coasingMultiplier` during coasting period
5. **Scoreboard.tsx**: Shows visual indicator when coasting mode is active
6. **ProjectionTable.tsx**: Added "Phase" column showing Working/Coasting/Retired with color coding and emoji indicators

**User Experience:**
- When coasting mode is OFF (default), behavior is unchanged from original app
- When enabled, user can specify:
  - Age when transitioning to coasting work (e.g., age 50)
  - Income multiplier (default 75%)
- The annual surplus calculation automatically adjusts based on coasting income level

**Default Settings:**
- Coasting Mode: Disabled by default
- Coast Age: 50 (can be customized)
- Income Multiplier: 75% of normal income/contributions during coasting period

Tip: For a true "coasting" feel, use 60-80% income multiplier. For less stress but similar lifestyle, keep at 100%.

Related: [[memory/add-debt-payments-column.md]]
