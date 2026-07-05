---
id: task-1
title: Add Actuals Tracking Feature
status: In Progress -> Completed
priority: medium
assignee: []
created_date: '2026-06-17 06:02'
labels: []
dependencies: []
references: []
documentation: []
ordinal: 1000
---

The user wants to track their actual financial progress (savings, spending, portfolio) against the projections to see if they are on track for FIRE.

## Acceptance Criteria

- [x] Add a way to input actual annual savings, spending, and portfolio balance for past years.
  - Added `ActualsSection` component with add/remove/update functionality
  - Added "Initial Actuals" section in InputPanel for capturing past year values
- [x] Update the projection calculation to incorporate these actual values into the future projection.
  - Modified `calculateProjection()` to accept and use `actuals` array
  - When actual data exists for a year, it overrides calculated values
- [x] Visualize the difference between projected and actual values in the chart or table.
  - Updated `PortfolioChart` to show "Actual Balance" line (green) when actuals exist
  - Updated `ProjectionTable` to show side-by-side comparison with highlighted columns
- [ ] Add visual indicators for variance tracking
- [ ] Consider adding trend analysis over time

## Implementation Summary

### Files Modified:
1. **src/components/ActualsSection.tsx** - Already existed, fixed React key prop
2. **src/FIRECalculator.tsx** - Added state, handlers, and UI integration
3. **src/components/InputPanel.tsx** - Added Initial Actuals input section
4. **src/components/PortfolioChart.tsx** - Added actuals visualization
5. **src/components/ProjectionTable.tsx** - Added actuals comparison columns

### Features Implemented:
- Table view for entering annual actuals (age, portfolio, savings, spending)
- Initial actuals capture for past year baseline
- Projection updates based on actual data where available
- Chart comparison showing projected vs. actual portfolio growth
- Table comparison with colored background indicators

## Next Steps (Future Enhancements):
- Add variance tracking indicators (+/- from projection)
- Support multiple years of historical actuals
- Export/import actuals data
- Consider showing the "gap" needed to catch up if behind track
