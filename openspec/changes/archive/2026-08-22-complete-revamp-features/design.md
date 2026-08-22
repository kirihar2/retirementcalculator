## Context

The retirement dashboard currently has:
- **Partial implementation on `feature/revamp`**: Monte Carlo types, withdrawal strategy types, UUID manager, and StrategySelector component exist but are not integrated
- **Build blocker**: TypeScript error in `src/types/uuid.ts` (line 17) prevents compilation
- **Completed foundation**: Actuals tracking feature (Task-1) is mostly done but missing variance tracking and trend analysis
- **Architecture decision**: localStorage-based persistence with export/import for privacy-first data handling (see `backlog/decisions/projected-milestone-adr.md`)

The codebase uses React with TypeScript, Material-UI components, and a controlled-component pattern for input sections. The main calculator (`FIRECalculator.tsx`) orchestrates state and passes props to child components.

## Goals / Non-Goals

**Goals:**
- Fix build error and complete the feature/revamp integration work
- Implement production-ready Monte Carlo simulation with real statistical modeling
- Build intuitive withdrawal strategy comparison UI showing trade-offs at key ages
- Add visual variance tracking between projected and actual values
- Provide trend analysis for actuals data to show improvement/decline patterns
- Maintain privacy-first architecture (no backend, localStorage persistence)

**Non-Goals:**
- Backend server or database migration (stays client-side per ADR)
- Real-time collaboration or multi-device sync
- Cryptographic encryption of stored data (future enhancement)
- Integration with external financial data APIs
- Mobile app development (responsive web only)

## Decisions

### Decision 1: Monte Carlo Simulation Approach
**Choice**: Implement simplified Monte Carlo using parametric return distributions (normal/lognormal) rather than historical bootstrap resampling.

**Rationale**: 
- Parametric approach is computationally efficient for 1000+ iterations in browser
- Allows user to configure expected return and volatility directly
- Historical bootstrap requires large dataset storage and is less flexible for custom assumptions
- Can add bootstrap as future enhancement if needed

**Alternatives considered**:
- Historical bootstrap: More realistic but requires storing decades of market data
- Full MPT/CAPM model: Overly complex for personal finance tool
- External API calls: Breaks privacy-first architecture

### Decision 2: Withdrawal Strategy Comparison UI
**Choice**: Side-by-side comparison table showing portfolio values at ages 80, 90, 100, plus depletion age, with strategy descriptions and key metrics.

**Rationale**:
- Table format is scannable and allows direct comparison
- Key ages (80/90/100) align with common retirement planning horizons
- Depletion age is the most critical metric for sustainability
- Avoids overwhelming users with year-by-year charts for each strategy

**Alternatives considered**:
- Separate chart per strategy: Too much visual clutter
- Single chart with overlapping lines: Hard to distinguish 4+ strategies
- Detailed year-by-year table: Too much information, hides key insights

### Decision 3: Variance Tracking Visualization
**Choice**: Color-coded percentage variance with directional arrows in ProjectionTable, plus optional variance line on PortfolioChart.

**Rationale**:
- Color coding (green = ahead, red = behind) provides instant visual feedback
- Percentage variance is more meaningful than absolute dollars (scales with portfolio size)
- Arrows reinforce direction (improving vs declining)
- Chart line shows variance trend over time without cluttering main projection view

**Alternatives considered**:
- Separate variance-only chart: Adds another chart to an already complex view
- Absolute dollar variance: Misleading as portfolio grows (5% of $1M looks small)
- No visualization: Users can't quickly assess if they're on track

### Decision 4: Trend Analysis Method
**Choice**: Rolling 3-year average of actual vs projected, with simple linear regression slope to determine improving/declining trend.

**Rationale**:
- 3-year window smooths out market volatility while remaining responsive
- Linear regression slope provides clear "improving vs declining" signal
- Catch-up gap calculation (actual - projected) shows absolute distance from plan
- Computationally simple, runs in browser without performance issues

**Alternatives considered**:
- Complex statistical tests (Mann-Kendall, etc.): Overkill for personal finance
- Longer rolling window (5+ years): Too slow to reflect recent changes
- Machine learning models: Unnecessary complexity, not transparent to users

### Decision 5: Strategy Preset Integration
**Choice**: StrategySelector sets stock/bond allocation percentages and expected return, which feed into existing return rate calculations. Selection persists to localStorage.

**Rationale**:
- Leverages existing input infrastructure (return rate, allocation inputs)
- Presets are starting points; users can customize after selection
- Persistence matches existing pattern for other inputs
- Avoids creating parallel calculation paths

**Alternatives considered**:
- Hard-coded strategy-specific calculations: Duplicates logic, harder to maintain
- No persistence: Users would re-select on every page load
- Separate "strategy mode" toggle: Unnecessary complexity, presets are just quick-apply

## Risks / Trade-offs

**Risk**: Monte Carlo simulation with 1000+ iterations may block UI thread → **Mitigation**: Use Web Worker or debounce with setTimeout/requestAnimationFrame; show progress indicator for long runs

**Risk**: Withdrawal strategy comparisons may confuse users with too many options → **Mitigation**: Provide clear descriptions, highlight "recommended" strategy (Classic 4%), use progressive disclosure (show details on click)

**Risk**: Variance tracking may discourage users if they're behind projections → **Mitigation**: Frame as "catch-up opportunity" not "failure"; show actionable insights (increase savings by X to close gap)

**Risk**: Trend analysis with limited actual data (< 3 years) may be misleading → **Mitigation**: Show "insufficient data" message when < 3 years of actuals; use simple averages for early years

**Trade-off**: Simplified Monte Carlo (parametric) vs more realistic historical bootstrap → Accepting less realism for computational efficiency and flexibility; can enhance later

**Trade-off**: Table-based strategy comparison vs visual charts → Accepting less visual appeal for clarity and scannability; can add charts as supplementary view later

## Migration Plan

No migration needed - all changes are additive features. Existing data in localStorage remains compatible.

Deployment steps:
1. Fix TypeScript error in `uuid.ts` (unblocks build)
2. Wire in existing components (StrategySelector, internal controlled components)
3. Implement Monte Carlo engine (replace placeholder)
4. Build withdrawal strategy comparison UI
5. Add variance tracking to existing charts/tables
6. Implement trend analysis for actuals
7. Test end-to-end flows
8. Deploy to production

Rollback: Not applicable (client-side app, no backend state to migrate)

## Open Questions

- **Q**: Should Monte Carlo results be cached per input set to avoid re-computation?
  - **A**: Yes, cache by input hash in localStorage or in-memory; invalidate on input change

- **Q**: What default number of Monte Carlo iterations to use?
  - **A**: Start with 1000; allow advanced users to increase via settings (1000, 5000, 10000)

- **Q**: Should withdrawal strategy comparison include tax implications?
  - **A**: No, keep it pre-tax for simplicity; add tax-aware strategies as future enhancement

- **Q**: How to handle variance when user has no actuals data yet?
  - **A**: Hide variance indicators until at least 1 year of actuals exists; show "Add actuals to track variance" prompt
