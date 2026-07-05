import React from 'react';
import { Paper, Typography, Box, Alert } from '@mui/material';
import { Line } from 'react-chartjs-2';
import type { ProjectionYear, AnnualActuals } from '../types';
import { formatCurrency } from '../utils/formatting';

interface ActualVsProjectedChartProps {
  projection: ProjectionYear[];
  actual: AnnualActuals[];
  displayMode?: 'real' | 'nominal'; // Optional - defaults to 'real' (inflation-adjusted)
}

export const ActualVsProjectedChart: React.FC<ActualVsProjectedChartProps> = ({
  projection,
  actual,
  displayMode = 'real',
}) => {
  // Group projection by age (every year) and show every 5th for readability
  const displayStep = Math.max(1, Math.floor((projection.length - 1) / 10));

  // Filter projection to show at regular intervals (e.g., every 5 years or less if <10 years)
  const filteredProjection = projection.filter((_, i) => i % displayStep === 0);

  // Get the appropriate projection data based on display mode
  const projectedData = displayMode === 'nominal'
    ? filteredProjection.map((p) => p.portfolioAfterInflation)
    : filteredProjection.map((p) => p.portfolio);

  // For actual data, convert to nominal using base inflation rate when in nominal mode
  const actualAligned = filteredProjection.map((proj) => {
    const currentActual = actual.find(a => a.age === proj.age);
    if (!currentActual) return null;

    // Actual portfolio is stored in real terms - convert to nominal if needed
    return displayMode === 'nominal'
      ? (currentActual.portfolio * 1.03) // Apply base inflation for nominal view
      : currentActual.portfolio;
  });

  if (projection.length === 0 || !actual.length) {
    return (
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Actual vs Projected Portfolio Growth
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Add some actual results to see a comparison between your projected path and real performance.
        </Typography>
      </Paper>
    );
  }

  // Chart data for line chart comparing projections vs actual
  const lineChartData = {
    labels: filteredProjection.map((p) => `${p.age}y`),
    datasets: [
      {
        label: displayMode === 'nominal' ? 'Projected Portfolio (Nominal)' : 'Projected Portfolio',
        data: projectedData,
        borderColor: '#1976d2', // Blue for projection
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: displayMode === 'nominal' ? 'Actual Portfolio (Nominal)' : 'Actual Portfolio',
        data: actualAligned.map((a) => a || 0),
        borderColor: '#4caf50', // Green for actual
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointStyle: 'circle',
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: '"DM Mono", "Roboto", sans-serif',
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (_context: any) => {
            // Get the correct dataset label from context
            const dsLabel = _context.dataset?.label || '';

            if (!dsLabel) return;

            let label = dsLabel;
            if (displayMode === 'nominal') {
              label += ` (${formatCurrency(_context.raw)} nominal)`;
            } else {
              label += ` (${formatCurrency(_context.raw)} today's dollars)`;
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: string | number) => formatCurrency(typeof value === 'number' ? value : 0),
          font: {
            size: 11,
            family: '"DM Mono", "Roboto", sans-serif',
          },
        },
      },
      x: {
        ticks: {
          font: {
            size: 10,
            family: '"DM Mono", "Roboto", sans-serif',
          },
        },
      },
    },
  } as const;

  // Calculate summary stats
  const earliestAge = projection[0]?.age || 0;
  const projectedFirst = filteredProjection[0]?.portfolio || 0;
  const actualFirst = actualAligned.find(a => a !== null) || 0;
  const firstYearVariance = actualFirst === null ? 0 : actualFirst - projectedFirst;

  // Find the latest year where we have both data points
  const lastCompleteAge = filteredProjection
    .reverse()
    .find((_, i) => actualAligned[filteredProjection.length - 1 - i] !== null)?.age || earliestAge;

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {displayMode === 'nominal' ? 'Actual vs Projected (Nominal)' : 'Actual vs Projected Portfolio Growth'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Compare your actual portfolio performance against the projected path{' '}
            {displayMode === 'real' ? "(in today's dollars)" : '(nominal - as printed in newspapers)'}
          </Typography>
        </Box>
        <Alert severity="info" sx={{ fontSize: '0.8rem', width: '180px' }}>
          Blue = Projected | Green = Actual
        </Alert>
      </Box>

      {/* Line chart showing portfolio growth */}
      <Box sx={{ height: '320px' }}>
        <Line data={lineChartData} options={lineChartOptions} />
      </Box>

      {/* Summary section */}
      <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
        <Typography variant="subtitle2" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
          Summary
        </Typography>
        <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Display Mode
            </Typography>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              {displayMode === 'real' ? "Today's Dollars (Real)" : 'Nominal'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Years of Actual Data
            </Typography>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              {lastCompleteAge - earliestAge} years
            </Typography>
          </Box>
        </Box>

        {/* Variance summary */}
        {firstYearVariance !== 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: firstYearVariance > 0 ? '#e8f5e9' : '#ffebee', borderRadius: 1 }}>
            <Typography variant="body2" component="div" sx={{ fontWeight: 'bold' }}>
              {firstYearVariance > 0 ? 'You\'re ahead of projection!' : 'Behind projection'} by {formatCurrency(Math.abs(firstYearVariance))}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};
