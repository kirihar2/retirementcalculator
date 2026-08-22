## Why

The retirement dashboard has several features partially implemented or stubbed out on the `feature/revamp` branch: Monte Carlo simulation types exist but use placeholder logic, withdrawal strategies are defined but not integrated into the UI, the StrategySelector component is created but not wired in, and there's a TypeScript build error blocking compilation. Additionally, the Actuals Tracking feature (Task-1) has two incomplete acceptance criteria around variance tracking and trend analysis. Completing these features will give users a comprehensive view of their retirement readiness with risk analysis, strategy comparison, and progress tracking against projections.

## What Changes

- **Fix TypeScript build error** in `src/types/uuid.ts` (line 17: type mismatch preventing compilation)
- **Wire in StrategySelector component** - connect the existing `StrategySelector.tsx` to the main calculator, integrate with allocation inputs, and persist selection
- **Implement real Monte Carlo simulation** - replace placeholder logic in `src/types/monte-carlo.ts` with actual market return distributions, proper success probability calculations, and sequence-of-returns risk modeling
- **Integrate withdrawal strategies comparison** - build UI to compare Classic 4%, Bogleheads Fixed+Variable, Bucket Strategy, and Dynamic Rate side-by-side with portfolio projections at different ages
- **Add variance tracking indicators** - show +/- differences between projected and actual values in charts and tables with visual cues (color coding, arrows, percentage variance)
- **Add trend analysis for actuals** - analyze historical actual data to show trends (improving/declining vs projection), rolling averages, and catch-up gap calculations
- **Reconcile ActualVsProjectedChart removal** - the chart was removed from the main view on feature/revamp; either restore it with improvements or replace with better visualization

## Capabilities

### New Capabilities
- `monte-carlo-simulation`: Real Monte Carlo simulation engine with configurable return distributions, sequence-of-returns modeling, success probability calculations, and confidence intervals
- `withdrawal-strategies-comparison`: Multi-strategy withdrawal comparison engine with UI showing portfolio projections at key ages (80, 90, 100), depletion age, and strategy trade-offs
- `investment-strategy-presets`: Quick-apply allocation strategy presets (Conservative/Moderate/Aggressive) that adjust stock/bond allocations and expected returns
- `actuals-variance-tracking`: Visual variance indicators showing projected vs actual differences with color coding, percentage variance, and trend arrows
- `actuals-trend-analysis`: Historical trend analysis for actuals data including rolling averages, improvement/decline indicators, and catch-up gap calculations

### Modified Capabilities
(None - all existing specs are infrastructure-level and not affected by these feature additions)

## Impact

- **Code**: 
  - `src/types/monte-carlo.ts` - replace placeholder with real simulation
  - `src/types/withdrawal-strategies.ts` - implement actual bucket/dynamic logic
  - `src/types/uuid.ts` - fix TypeScript error
  - `src/components/StrategySelector.tsx` - already exists, needs integration
  - `src/FIRECalculator.tsx` - wire in new components and features
  - `src/components/PortfolioChart.tsx` - add variance visualization
  - `src/components/ProjectionTable.tsx` - add variance columns and trend indicators
  - `src/components/ActualVsProjectedChart.tsx` - restore or replace
  - New components for withdrawal strategy comparison UI

- **Dependencies**: May need to add statistical libraries for proper Monte Carlo (e.g., random number generators with normal distribution)

- **Performance**: Monte Carlo simulation with 1000+ iterations may need worker threads or debouncing to avoid UI blocking

- **User Experience**: Adds significant new capabilities for risk analysis and strategy comparison; UI must remain clear and not overwhelm users with complexity
