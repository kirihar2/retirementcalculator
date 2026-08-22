/**
 * Variance Tracking Utilities
 *
 * Calculates variance between projected and actual values
 * for portfolio balance, savings, and spending.
 */

import type { AnnualActuals, ProjectionYear } from '../types';

export interface VarianceResult {
  age: number;
  projectedValue: number;
  actualValue: number;
  absoluteVariance: number;         // actual - projected
  percentVariance: number;          // (actual - projected) / projected * 100
  hasData: boolean;                 // whether actual data exists for this year
}

/**
 * Calculate portfolio variance for a single year.
 */
export function calculatePortfolioVariance(
  projected: ProjectionYear,
  actualYear: AnnualActuals | undefined,
): VarianceResult {
  if (!actualYear) {
    return {
      age: projected.age,
      projectedValue: projected.portfolio,
      actualValue: 0,
      absoluteVariance: 0,
      percentVariance: 0,
      hasData: false,
    };
  }

  const projectedValue = projected.portfolio;
  const actualValue = actualYear.portfolio;
  const absoluteVariance = actualValue - projectedValue;
  const percentVariance = projectedValue !== 0
    ? (absoluteVariance / projectedValue) * 100
    : 0;

  return {
    age: projected.age,
    projectedValue,
    actualValue,
    absoluteVariance,
    percentVariance,
    hasData: true,
  };
}

/**
 * Calculate savings variance for a single year.
 */
export function calculateSavingsVariance(
  projected: ProjectionYear,
  actualYear: AnnualActuals | undefined,
): VarianceResult {
  if (!actualYear) {
    return {
      age: projected.age,
      projectedValue: projected.annualContribution,
      actualValue: 0,
      absoluteVariance: 0,
      percentVariance: 0,
      hasData: false,
    };
  }

  const projectedValue = projected.annualContribution;
  const actualValue = actualYear.savings;
  const absoluteVariance = actualValue - projectedValue;
  const percentVariance = projectedValue !== 0
    ? (absoluteVariance / projectedValue) * 100
    : 0;

  return {
    age: projected.age,
    projectedValue,
    actualValue,
    absoluteVariance,
    percentVariance,
    hasData: true,
  };
}

/**
 * Calculate spending variance for a single year.
 */
export function calculateSpendingVariance(
  projected: ProjectionYear,
  actualYear: AnnualActuals | undefined,
): VarianceResult {
  if (!actualYear) {
    return {
      age: projected.age,
      projectedValue: projected.annualSpending,
      actualValue: 0,
      absoluteVariance: 0,
      percentVariance: 0,
      hasData: false,
    };
  }

  const projectedValue = projected.annualSpending;
  const actualValue = actualYear.spending;
  // Note: For spending, lower is better, so we negate the variance
  // positive variance means spending was higher than projected (bad)
  const absoluteVariance = actualValue - projectedValue;
  const percentVariance = projectedValue !== 0
    ? (absoluteVariance / projectedValue) * 100
    : 0;

  return {
    age: projected.age,
    projectedValue,
    actualValue,
    absoluteVariance,
    percentVariance,
    hasData: true,
  };
}

/**
 * Calculate variance for all projection years.
 */
export function calculateAllVariances(
  projection: ProjectionYear[],
  actuals: AnnualActuals[],
): {
  portfolio: VarianceResult[];
  savings: VarianceResult[];
  spending: VarianceResult[];
} {
  const portfolio: VarianceResult[] = [];
  const savings: VarianceResult[] = [];
  const spending: VarianceResult[] = [];

  for (const year of projection) {
    const actualYear = actuals.find(a => a.age === year.age);
    portfolio.push(calculatePortfolioVariance(year, actualYear));
    savings.push(calculateSavingsVariance(year, actualYear));
    spending.push(calculateSpendingVariance(year, actualYear));
  }

  return { portfolio, savings, spending };
}

/**
 * Calculate cumulative average variance across all years with data.
 */
export function calculateCumulativeVariance(variances: VarianceResult[]): {
  averagePercentVariance: number;
  totalYearsWithData: number;
  improving: boolean;
} {
  const withData = variances.filter(v => v.hasData);
  if (withData.length === 0) {
    return { averagePercentVariance: 0, totalYearsWithData: 0, improving: false };
  }

  const averagePercentVariance = withData.reduce((sum, v) => sum + v.percentVariance, 0) / withData.length;

  // Determine if improving: compare first half to second half
  const midpoint = Math.floor(withData.length / 2);
  const firstHalf = withData.slice(0, midpoint);
  const secondHalf = withData.slice(midpoint);

  const firstAvg = firstHalf.length > 0
    ? firstHalf.reduce((s, v) => s + v.percentVariance, 0) / firstHalf.length
    : 0;
  const secondAvg = secondHalf.length > 0
    ? secondHalf.reduce((s, v) => s + v.percentVariance, 0) / secondHalf.length
    : 0;

  const improving = secondAvg > firstAvg;

  return { averagePercentVariance, totalYearsWithData: withData.length, improving };
}

/**
 * Format variance as string with sign and percentage.
 */
export function formatVariance(v: VarianceResult, type: 'absolute' | 'percent' = 'percent'): string {
  if (!v.hasData) return 'N/A';
  if (type === 'absolute') {
    const sign = v.absoluteVariance >= 0 ? '+' : '';
    return `${sign}${formatCurrency(v.absoluteVariance)}`;
  }
  const sign = v.percentVariance >= 0 ? '+' : '';
  return `${sign}${v.percentVariance.toFixed(1)}%`;
}

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return `${value.toFixed(0)}`;
}

/**
 * Get variance arrow indicator.
 */
export function getVarianceArrow(v: VarianceResult): '↑' | '↓' | '→' | '' {
  if (!v.hasData) return '';
  if (v.percentVariance > 1) return '↑';
  if (v.percentVariance < -1) return '↓';
  return '→';
}

/**
 * Get variance color based on direction.
 */
export function getVarianceColor(v: VarianceResult): string {
  if (!v.hasData) return '#9e9e9e'; // gray
  if (v.percentVariance > 1) return '#4caf50';  // green
  if (v.percentVariance < -1) return '#f44336'; // red
  return '#9e9e9e'; // gray for ~0%
}
