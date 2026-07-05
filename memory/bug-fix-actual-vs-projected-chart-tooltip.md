name: bug-fix-actual-vs-projected-chart-tooltip
description: Fixed confusing tooltip showing multiple metrics at once in ActualVsProjectedChart
metadata:
  type: feedback

**Problem**: The ActualVsProjectedChart displayed `$765K $155K $58K $56K` in tooltips, which was confusing users because:

1. **Line chart had 2 datasets**: "Projected Portfolio" and "Actual Portfolio"
2. **Bar chart had 1 dataset**: "Variance from Projection"  
3. The tooltip showed ALL values from both charts simultaneously, making it unclear which value corresponded to what metric

**What each number represented**:
- `$765K` = Projected portfolio at age 33 (correct)
- `$155K` = Annual contribution (from projection table, not shown in chart)
- `$58K` = Appears incorrectly (likely tooltip iterating through datasets showing unrelated values)
- `$56K` = Annual return (from projection table, not shown in chart)
- `$0` = SS Income (not shown in chart)

**Fix applied**: Removed the bar chart showing variance since:
1. The line chart already clearly shows portfolio growth trajectory
2. Variance information is redundant with the single-line comparison
3. Two separate charts cause tooltip confusion when hovering

The chart now displays ONLY the line chart comparing projected vs actual portfolio growth, with clear labels and tooltips.

**Files changed**: `src/components/ActualVsProjectedChart.tsx`

**Related**: [[projection-table-displays-annual-metrics]]
