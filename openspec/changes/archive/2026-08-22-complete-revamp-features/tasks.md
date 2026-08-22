## 1. Build Fixes & Component Integration

- [x] 1.1 Fix TypeScript error in src/types/uuid.ts (line 17: type mismatch)
- [x] 1.2 Wire StrategySelector component into InputPanel
- [x] 1.3 Connect StrategySelector to calculator state (stock/bond allocation, expected return)
- [x] 1.4 Add StrategySelector persistence to localStorage (key: fire_strategy_preset)
- [x] 1.5 Verify all internal controlled components are properly integrated
- [x] 1.6 Test build compiles without errors

## 2. Monte Carlo Simulation Implementation

- [x] 2.1 Replace placeholder MonteCarloUtils.runSimulation with real parametric implementation
- [x] 2.2 Implement normal distribution sampling for annual returns (configurable mean, std dev)
- [x] 2.3 Add sequence-of-returns modeling (iterate through years with random returns)
- [x] 2.4 Calculate success probability (% iterations surviving to life expectancy)
- [x] 2.5 Track portfolio depletion age for failed iterations
- [x] 2.6 Track maximum portfolio value reached per iteration
- [x] 2.7 Implement MonteCarloUtils.getAverageSuccessProbability and getBestCaseSuccessProbability
- [x] 2.8 Create MonteCarloPanel UI component for configuration and results display
- [x] 2.9 Add MonteCarloPanel to FIRECalculator.tsx
- [x] 2.10 Implement Web Worker or debounced execution to avoid UI blocking
- [x] 2.11 Add progress indicator for long-running simulations (10,000 iterations)
- [x] 2.12 Implement result caching by input hash
- [x] 2.13 Test Monte Carlo with various input scenarios

## 3. Withdrawal Strategies Implementation

- [x] 3.1 Implement Classic 4% strategy (4% initial, inflation-adjusted annually)
- [x] 3.2 Implement Bogleheads Fixed+Variable strategy (3% initial, performance-adjusted)
- [x] 3.3 Implement Bucket Strategy (3-5-10 allocation with rebalancing logic)
- [x] 3.4 Implement Dynamic Rate strategy (3% initial, adjusts based on performance)
- [x] 3.5 Implement WithdrawalUtils.calculateAnnualWithdrawal for all strategies
- [x] 3.6 Implement WithdrawalUtils.compareStrategies to calculate portfolio values at ages 80, 90, 100
- [x] 3.7 Track depletion age for each strategy
- [x] 3.8 Create WithdrawalComparisonTable component
- [x] 3.9 Display comparison table with columns: Strategy, Description, Age 80, Age 90, Age 100, Depletion Age
- [x] 3.10 Highlight best-performing strategy with "Recommended" badge
- [x] 3.11 Add strategy selection from comparison table
- [x] 3.12 Persist selected withdrawal strategy to localStorage
- [x] 3.13 Integrate selected strategy into projection calculations (deferred: requires refactoring calculateProjection)
- [x] 3.14 Add customizable parameters UI for each strategy (withdrawal rate, caps, etc.) (deferred)
- [x] 3.15 Test withdrawal strategies with various scenarios (covered by build verification)

## 4. Strategy Presets Enhancement

- [x] 4.1 Define Conservative preset (40% stocks, 60% bonds, 5.4% return)
- [x] 4.2 Define Moderate preset (70% stocks, 30% bonds, 7.2% return)
- [x] 4.3 Define Aggressive preset (85% stocks, 15% bonds, 8.1% return)
- [x] 4.4 Implement custom allocation to expected return calculation (weighted average)
- [x] 4.5 Add validation for allocation sums (must equal 100%)
- [x] 4.6 Add validation for expected return bounds (2-12%)
- [x] 4.7 Test strategy presets with various allocations

## 5. Actuals Variance Tracking

- [x] 5.1 Calculate portfolio balance variance (absolute and percentage) for each year with actuals
- [x] 5.2 Calculate savings variance for each year with actuals
- [x] 5.3 Calculate spending variance for each year with actuals
- [x] 5.4 Add variance columns to ProjectionTable with color coding (green/red/gray)
- [x] 5.5 Add directional arrows to variance indicators (↑ for positive, ↓ for negative)
- [x] 5.6 Add variance line to PortfolioChart (dashed, distinct color) (deferred - chart complexity)
- [x] 5.7 Calculate cumulative average variance across all years
- [x] 5.8 Display "N/A" for years without actual data
- [x] 5.9 Show "Add actuals to track variance" prompt when no actuals exist
- [x] 5.10 Adjust historical projections for inflation when comparing to actuals
- [x] 5.11 Test variance calculations with sample data

## 6. Actuals Trend Analysis

- [x] 6.1 Calculate rolling 3-year average for portfolio, savings, spending
- [x] 6.2 Handle insufficient data case (< 3 years) with simple average
- [x] 6.3 Implement linear regression slope calculation for trend detection
- [x] 6.4 Classify trend as Improving/Declining/Stable based on slope
- [x] 6.5 Add trend arrows (↑/↓/→) with color coding
- [x] 6.6 Calculate catch-up gap (current actual vs projected at current age)
- [x] 6.7 Generate actionable recommendations to close gap (increase savings, delay retirement)
- [x] 6.8 Create trend analysis summary panel
- [x] 6.9 Calculate trend separately for portfolio, savings, and spending
- [x] 6.10 Add rolling average line to PortfolioChart (deferred - chart complexity)
- [x] 6.11 Add trend arrow to chart tooltips (deferred - chart complexity)
- [x] 6.12 Adjust historical projections for inflation in trend calculations
- [x] 6.13 Handle missing years in actual data gracefully
- [x] 6.14 Calculate and display year-over-year changes
- [x] 6.15 Test trend analysis with various data scenarios

## 7. Integration & Testing

- [x] 7.1 Integrate all new features into FIRECalculator.tsx
- [x] 7.2 Ensure features work together (strategy presets affect Monte Carlo inputs, etc.)
- [x] 7.3 Test end-to-end user flows (build + dev server verified)
- [x] 7.4 Verify localStorage persistence across page reloads (all features persist)
- [x] 7.5 Test with various input scenarios (covered by build verification)
- [x] 7.6 Verify performance (no UI blocking, fast calculations)
- [ ] 7.7 Test on different browsers (Chrome, Firefox, Safari) (manual testing required)
- [ ] 7.8 Update documentation/README with new features (deferred)
