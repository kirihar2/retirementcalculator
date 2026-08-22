import React, { useRef, useCallback } from 'react';
import { Paper, Typography, Box, Tooltip as MuiTooltip, ButtonGroup, Button } from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ZoomOutMap as ResetZoomIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import type { Chart } from 'chart.js';
import type {AnnualActuals, ProjectionYear} from '../types';
import { formatCurrency } from '../utils/formatting';
import { calculateAllVariances } from '../utils/variance';

interface PortfolioChartProps {
  projection: ProjectionYear[];
  fireTarget: number;
  displayMode?: 'real' | 'nominal'; // Optional - defaults to 'real' (inflation-adjusted)
  actual?: AnnualActuals[]; // Optional actual for comparison
}

/**
 * Calculate 3-year rolling average of actual portfolio values.
 * Falls back to simple average when fewer than 3 years available.
 */
function calculateRollingAverage(
  actuals: AnnualActuals[],
  projection: ProjectionYear[],
  displayMode: 'real' | 'nominal',
): (number | null)[] {
  if (actuals.length === 0) return projection.map(() => null);

  // Build a map of age -> actual portfolio value (nominal)
  const actualByAge = new Map<number, number>();
  const baseInflation = 3;
  const baseAge = actuals[0]?.age || 0;

  for (const a of actuals) {
    const multiplier = Math.pow(1 + baseInflation / 100, a.age - baseAge);
    actualByAge.set(a.age, (a.portfolio || 0) * multiplier);
  }

  // For each projection year, compute rolling average of surrounding actuals
  return projection.map((p) => {
    // Collect actual values for this age and up to 2 prior years
    const values: number[] = [];
    for (let offset = 0; offset < 3; offset++) {
      const age = p.age - offset;
      const val = actualByAge.get(age);
      if (val !== undefined) {
        values.push(val);
      }
    }
    if (values.length === 0) return null;
    return values.reduce((s, v) => s + v, 0) / values.length;
  });
}

/**
 * Calculate percentage variance between projected and actual at each age.
 * Returns null for ages without actual data.
 */
function calculateVarianceLine(
  projection: ProjectionYear[],
  actuals: AnnualActuals[],
): (number | null)[] {
  if (actuals.length === 0) return projection.map(() => null);

  const { portfolio: variances } = calculateAllVariances(projection, actuals);
  return variances.map(v => v.hasData ? v.percentVariance : null);
}

/**
 * Determine trend direction at a given age based on recent variance changes.
 */
function getTrendAtAge(
  age: number,
  projection: ProjectionYear[],
  actuals: AnnualActuals[],
): '↑' | '↓' | '→' | '' {
  if (actuals.length < 2) return '';

  const { portfolio: variances } = calculateAllVariances(projection, actuals);
  const idx = variances.findIndex(v => v.age === age);
  if (idx < 1 || !variances[idx].hasData) return '';

  const current = variances[idx].percentVariance;
  // Look back up to 2 prior years for trend
  let priorValue: number | null = null;
  for (let i = idx - 1; i >= Math.max(0, idx - 3); i--) {
    if (variances[i].hasData) {
      priorValue = variances[i].percentVariance;
      break;
    }
  }
  if (priorValue === null) return '';

  const delta = current - priorValue;
  if (delta > 1) return '↑';
  if (delta < -1) return '↓';
  return '→';
}

/**
 * Find a comment for a given age from actuals data.
 * Matches integer or nearby decimal ages.
 */
function getCommentAtAge(age: number, actuals: AnnualActuals[]): string | undefined {
  if (actuals.length === 0) return undefined;
  // Exact match first
  const exact = actuals.find(a => a.age === age);
  if (exact?.comment) return exact.comment;
  // Check if this age is close to a decimal actual (within 0.5)
  const nearby = actuals.find(a => Math.abs(a.age - age) < 0.6 && a.comment);
  return nearby?.comment;
}

export const PortfolioChart: React.FC<PortfolioChartProps> = ({
  projection,
  fireTarget,
  displayMode = 'real',
  actual = [],
}) => {
  const chartRef = useRef<Chart<'line'> | null>(null);

  const handleZoomIn = useCallback(() => {
    const chart = chartRef.current;
    if (chart) chart.zoom(1.1);
  }, []);

  const handleZoomOut = useCallback(() => {
    const chart = chartRef.current;
    if (chart) chart.zoom(0.9);
  }, []);

  const handleResetZoom = useCallback(() => {
    const chart = chartRef.current;
    if (chart) chart.resetZoom();
  }, []);

  // For actual data, always show in nominal dollars.
  // IMPORTANT: Align actuals to projection ages by building a lookup map.
  // Historical or decimal ages get mapped to the nearest integer projection age.
  const actualByAge = new Map<number, number>();
  if (actual && actual.length > 0) {
    const baseAge = actual[0].age;
    for (const a of actual) {
      // Convert real portfolio to nominal
      const baseInflation = 3;
      const multiplier = Math.pow(1 + baseInflation / 100, a.age - baseAge);
      const nominal = (a.portfolio || 0) * multiplier;
      // Round decimal ages to nearest integer for chart alignment
      const roundedAge = Math.round(a.age);
      // If multiple actuals map to the same age, keep the one closest to integer
      const existing = actualByAge.get(roundedAge);
      if (existing === undefined || Math.abs(a.age - roundedAge) < Math.abs(Math.ceil(a.age) - a.age)) {
        actualByAge.set(roundedAge, nominal);
      }
    }
  }

  // Get the appropriate portfolio value based on display mode
  const projectedData = displayMode === 'nominal'
    ? projection.map((p) => p.portfolioAfterInflation)
    : projection.map((p) => p.portfolio);

  // Task 5.6: Variance line (percentage variance, shown on secondary y-axis)
  const varianceData = calculateVarianceLine(projection, actual);
  const hasVarianceData = varianceData.some(v => v !== null);

  // Task 6.10: Rolling 3-year average of actual data
  const rollingAvgData = calculateRollingAverage(actual, projection, displayMode);
  const hasRollingAvgData = rollingAvgData.some(v => v !== null);

  // Build the full age range including historical actuals that predate the projection
  const projectionStartAge = projection.length > 0 ? projection[0].age : 0;
  const historicalAges = Array.from(actualByAge.keys())
    .filter(age => age < projectionStartAge)
    .sort((a, b) => a - b);

  // Full labels: historical ages + projection ages
  const allLabels = [...historicalAges, ...projection.map(p => p.age)];

  // Pad projected data with nulls for historical ages (no projection exists there)
  const paddedProjectedData = [
    ...historicalAges.map(() => null),
    ...projectedData,
  ];

  // Build actual data aligned to the full age range
  const fullActualData = allLabels.map(age => actualByAge.get(age) ?? null);

  const chartData = {
    labels: allLabels,
    datasets: [
      {
        label: 'Projected Balance',
        data: paddedProjectedData,
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
        spanGaps: false,
      },

      // Actual data (always in nominal as it's what was actually earned)
      ...((actual || []).length > 0 ? [
        {
          label: displayMode === 'nominal'
            ? 'Actual Balance (Nominal)'
            : 'Actual Balance',
          data: fullActualData,
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: 'y',
          spanGaps: false,
        },
      ] : []),

      // Task 6.10: Rolling 3-year average line (padded for historical ages)
      ...(hasRollingAvgData ? [
        {
          label: 'Rolling Avg (3yr)',
          data: [...historicalAges.map(() => null), ...rollingAvgData],
          borderColor: '#ff9800',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [2, 2],
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 4,
          yAxisID: 'y',
          spanGaps: false,
        },
      ] : []),

      // FIRE Target line (shown in nominal mode only, padded for historical ages)
      ...(displayMode === 'nominal' ? [
        {
          label: displayMode === 'nominal' ? 'FIRE Target (Nominal)' : 'FIRE Target',
          data: [...historicalAges.map(() => null), ...Array(projection.length).fill(fireTarget)],
          borderColor: '#f57c00',
          borderDash: [5, 5],
          borderWidth: 2,
          fill: false,
          yAxisID: 'y',
          spanGaps: false,
        },
      ] : []),

      // Task 5.6: Variance percentage line (secondary y-axis, padded for historical ages)
      ...(hasVarianceData ? [
        {
          label: 'Variance (%)',
          data: [...historicalAges.map(() => null), ...varianceData],
          borderColor: '#9c27b0',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [6, 3],
          tension: 0.2,
          fill: false,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: '#9c27b0',
          yAxisID: 'yVariance',
          spanGaps: false,
        },
      ] : []),
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          title: (contexts: any[]) => {
            if (!contexts.length) return '';
            const age = contexts[0].label;
            return `Age ${age}`;
          },
          afterBody: (contexts: any[]) => {
            if (!contexts.length) return [];
            const age = parseFloat(contexts[0].label);
            const comment = getCommentAtAge(age, actual);
            if (comment) {
              return [``, `💬 ${comment}`];
            }
            return [];
          },
          label: (context: any) => {
            const value = context.raw;
            const label = context.dataset.label || '';

            // Skip null/undefined data points (e.g., rolling avg before enough data)
            if (value === null || value === undefined) return undefined;

            // Variance: show as percentage
            if (label.includes('Variance')) {
              const sign = value >= 0 ? '+' : '';
              return `${label}: ${sign}${value.toFixed(1)}%`;
            }

            // FIRE Target: show currency with nominal note
            if (label.includes('FIRE')) {
              const suffix = displayMode === 'nominal' ? ' nominal' : '';
              return `${label}: ${formatCurrency(value)}${suffix}`;
            }

            // All other datasets: show formatted currency
            let result = `${label}: ${formatCurrency(value)}`;

            // Add trend arrow for Actual Balance data points
            if (label.includes('Actual') && actual.length >= 2) {
              const age = parseFloat(context.label);
              if (!isNaN(age)) {
                const trend = getTrendAtAge(age, projection, actual);
                if (trend) {
                  result += ` ${trend}`;
                }
              }
            }

            return result;
          },
        },
      },
      // Zoom & Pan configuration
      zoom: {
        pan: {
          enabled: true,
          mode: 'x' as const,
          modifierKey: undefined,
        },
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.05,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x' as const,
        },
        limits: {
          x: {
            minRange: 5, // Minimum 5 years visible when fully zoomed in
          },
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        ticks: {
          callback: (value: string | number) => {
            if (typeof value === 'number') {
              return formatCurrency(value);
            }
            return formatCurrency(0);
          },
        },
      },
      // Task 5.6: Secondary y-axis for variance percentage
      ...(hasVarianceData ? {
        yVariance: {
          type: 'linear' as const,
          position: 'right' as const,
          grid: { drawOnChartArea: false },
          ticks: {
            callback: (value: string | number) => {
              if (typeof value === 'number') return `${value >= 0 ? '+' : ''}${value.toFixed(0)}%`;
              return '0%';
            },
            color: '#9c27b0',
          },
          title: {
            display: true,
            text: 'Variance %',
            color: '#9c27b0',
          },
        },
      } : {}),
    },
  } as const;

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {actual && actual.length > 0 ? 'Portfolio vs Actual' : 'Portfolio Growth Projection'}
        </Typography>
        {/* Zoom Controls */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <MuiTooltip title="Scroll/pinch to zoom, drag to pan">
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              Interactive
            </Typography>
          </MuiTooltip>
          <ButtonGroup size="small" variant="outlined">
            <Button onClick={handleZoomIn} sx={{ minWidth: 36, p: 0.5 }}>
              <ZoomInIcon fontSize="small" />
            </Button>
            <Button onClick={handleZoomOut} sx={{ minWidth: 36, p: 0.5 }}>
              <ZoomOutIcon fontSize="small" />
            </Button>
            <Button onClick={handleResetZoom} sx={{ minWidth: 36, p: 0.5 }}>
              <ResetZoomIcon fontSize="small" />
            </Button>
          </ButtonGroup>
        </Box>
      </Box>
      {projection.length > 0 && <Line ref={chartRef} data={chartData} options={chartOptions} />}
    </Paper>
  );
};
