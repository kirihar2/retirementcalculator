/**
 * Trend Analysis Utilities
 *
 * Analyzes historical actuals data to identify trends:
 * - Rolling 3-year averages
 * - Linear regression slope for trend detection
 * - Catch-up gap calculation
 * - Year-over-year change tracking
 */

import type { AnnualActuals, ProjectionYear } from '../types';

export type TrendDirection = 'improving' | 'declining' | 'stable' | 'insufficient_data';

export interface TrendAnalysisResult {
  metric: 'portfolio' | 'savings' | 'spending';
  direction: TrendDirection;
  arrow: '↑' | '↓' | '→' | '?';
  color: string;
  averagePercentVariance: number;
  rollingAverage: number;
  slope: number;                   // linear regression slope (percent variance change per year)
  yearsWithData: number;
  catchUpGap: number;              // current actual - projected at current age
  catchUpGapPercent: number;
  yoyChanges: Array<{ age: number; change: number; percentChange: number }>;
}

/**
 * Calculate linear regression slope from data points.
 * Returns the slope (rate of change) using least squares.
 */
function linearRegressionSlope(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return 0;

  return (n * sumXY - sumX * sumY) / denominator;
}

/**
 * Calculate rolling 3-year average.
 */
function rollingAverage(values: number[], window = 3): number {
  if (values.length === 0) return 0;
  const recent = values.slice(-window);
  return recent.reduce((s, v) => s + v, 0) / recent.length;
}

/**
 * Classify trend direction based on slope.
 */
function classifyTrend(slope: number): TrendDirection {
  if (slope > 1) return 'improving';
  if (slope < -1) return 'declining';
  return 'stable';
}

/**
 * Get arrow for trend direction.
 */
function getTrendArrow(direction: TrendDirection): '↑' | '↓' | '→' | '?' {
  switch (direction) {
    case 'improving': return '↑';
    case 'declining': return '↓';
    case 'stable': return '→';
    case 'insufficient_data': return '?';
  }
}

/**
 * Get color for trend direction.
 */
function getTrendColor(direction: TrendDirection): string {
  switch (direction) {
    case 'improving': return '#4caf50';  // green
    case 'declining': return '#f44336';  // red
    case 'stable': return '#9e9e9e';     // gray
    case 'insufficient_data': return '#bdbdbd'; // light gray
  }
}

/**
 * Perform trend analysis for a given metric.
 *
 * @param actuals Array of actuals data
 * @param projection Array of projection data
 * @param metric Which metric to analyze ('portfolio', 'savings', 'spending')
 */
export function analyzeTrend(
  actuals: AnnualActuals[],
  projection: ProjectionYear[],
  metric: 'portfolio' | 'savings' | 'spending',
): TrendAnalysisResult {
  // Sort actuals by age
  const sortedActuals = [...actuals].sort((a, b) => a.age - b.age);

  if (sortedActuals.length === 0) {
    return {
      metric,
      direction: 'insufficient_data',
      arrow: '?',
      color: '#bdbdbd',
      averagePercentVariance: 0,
      rollingAverage: 0,
      slope: 0,
      yearsWithData: 0,
      catchUpGap: 0,
      catchUpGapPercent: 0,
      yoyChanges: [],
    };
  }

  // Calculate percent variances over time
  const variances: number[] = [];
  const actualValues: number[] = [];

  for (const actual of sortedActuals) {
    const projectedYear = projection.find(p => p.age === actual.age);
    if (!projectedYear) continue;

    let projectedValue: number;
    let actualValue: number;

    switch (metric) {
      case 'portfolio':
        projectedValue = projectedYear.portfolio;
        actualValue = actual.portfolio;
        break;
      case 'savings':
        projectedValue = projectedYear.annualContribution;
        actualValue = actual.savings;
        break;
      case 'spending':
        projectedValue = projectedYear.annualSpending;
        actualValue = actual.spending;
        break;
    }

    actualValues.push(actualValue);
    const variance = projectedValue !== 0
      ? ((actualValue - projectedValue) / projectedValue) * 100
      : 0;
    variances.push(variance);
  }

  // Year-over-year changes
  const yoyChanges: Array<{ age: number; change: number; percentChange: number }> = [];
  for (let i = 1; i < sortedActuals.length; i++) {
    const prev = actualValues[i - 1];
    const curr = actualValues[i];
    const change = curr - prev;
    const percentChange = prev !== 0 ? (change / prev) * 100 : 0;
    yoyChanges.push({
      age: sortedActuals[i].age,
      change,
      percentChange,
    });
  }

  // Calculate slope
  const slope = linearRegressionSlope(variances);

  // Classify trend
  let direction: TrendDirection;
  if (variances.length < 3) {
    direction = 'insufficient_data';
  } else {
    direction = classifyTrend(slope);
  }

  // Calculate metrics
  const averagePercentVariance = variances.length > 0
    ? variances.reduce((s, v) => s + v, 0) / variances.length
    : 0;
  const rollingAvg = rollingAverage(actualValues);

  // Catch-up gap: current actual vs projected at current age
  const mostRecentActual = sortedActuals[sortedActuals.length - 1];
  const currentAge = mostRecentActual.age;
  const currentProjected = projection.find(p => p.age === currentAge);

  let catchUpGap = 0;
  let catchUpGapPercent = 0;
  if (currentProjected) {
    let currentValue: number;
    let projectedValue: number;
    switch (metric) {
      case 'portfolio':
        currentValue = mostRecentActual.portfolio;
        projectedValue = currentProjected.portfolio;
        break;
      case 'savings':
        currentValue = mostRecentActual.savings;
        projectedValue = currentProjected.annualContribution;
        break;
      case 'spending':
        currentValue = mostRecentActual.spending;
        projectedValue = currentProjected.annualSpending;
        break;
    }
    catchUpGap = currentValue - projectedValue;
    catchUpGapPercent = projectedValue !== 0
      ? (catchUpGap / projectedValue) * 100
      : 0;
  }

  return {
    metric,
    direction,
    arrow: getTrendArrow(direction),
    color: getTrendColor(direction),
    averagePercentVariance,
    rollingAverage: rollingAvg,
    slope,
    yearsWithData: variances.length,
    catchUpGap,
    catchUpGapPercent,
    yoyChanges,
  };
}

/**
 * Perform trend analysis for all metrics.
 */
export function analyzeAllTrends(
  actuals: AnnualActuals[],
  projection: ProjectionYear[],
): {
  portfolio: TrendAnalysisResult;
  savings: TrendAnalysisResult;
  spending: TrendAnalysisResult;
} {
  return {
    portfolio: analyzeTrend(actuals, projection, 'portfolio'),
    savings: analyzeTrend(actuals, projection, 'savings'),
    spending: analyzeTrend(actuals, projection, 'spending'),
  };
}

/**
 * Generate actionable recommendations based on trend analysis.
 */
export function generateRecommendations(
  trends: ReturnType<typeof analyzeAllTrends>,
  yearsToRetirement: number,
): string[] {
  const recommendations: string[] = [];

  // Portfolio gap recommendations
  if (trends.portfolio.catchUpGapPercent < -10 && yearsToRetirement > 5) {
    const additionalAnnual = Math.abs(trends.portfolio.catchUpGap) / yearsToRetirement;
    recommendations.push(
      `You are ${Math.abs(trends.portfolio.catchUpGapPercent).toFixed(1)}% behind projection. Consider increasing annual savings by ~$${(additionalAnnual / 1000).toFixed(0)}K to close the gap.`
    );
  }

  // Declining trend warning
  if (trends.portfolio.direction === 'declining' && trends.portfolio.rollingAverage > 0) {
    recommendations.push(
      'Your portfolio variance is declining. Review spending and savings to get back on track.'
    );
  }

  // Strong positive trend
  if (trends.portfolio.direction === 'improving' && trends.portfolio.catchUpGapPercent > 10) {
    recommendations.push(
      'You are ahead of projection and improving. Consider if early retirement is now feasible.'
    );
  }

  // Spending trend
  if (trends.spending.direction === 'declining' && trends.spending.catchUpGapPercent < -5) {
    // For spending, declining variance means spending is lower than projected (good!)
    recommendations.push(
      'Your spending is below projection. Consider directing the surplus to savings.'
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('Your plan is on track. Keep monitoring actuals to stay informed.');
  }

  return recommendations;
}
