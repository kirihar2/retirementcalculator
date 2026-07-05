import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { Line } from 'react-chartjs-2';
import type {AnnualActuals, ProjectionYear} from '../types';
import { formatCurrency } from '../utils/formatting';

interface PortfolioChartProps {
  projection: ProjectionYear[];
  fireTarget: number;
  displayMode?: 'real' | 'nominal'; // Optional - defaults to 'real' (inflation-adjusted)
  actual?: AnnualActuals[]; // Optional actual for comparison
}

export const PortfolioChart: React.FC<PortfolioChartProps> = ({
  projection,
  fireTarget,
  displayMode = 'real',
  actual = [],
}) => {
  // For actual data, always show in nominal dollars
  const actualData = (actual || []).map(a => {
    // Actual portfolio is stored in real terms - convert to nominal using the first year's inflation
    const baseInflation = 3; // Base inflation rate for converting real to nominal
    const multiplier = Math.pow(1 + baseInflation / 100, a.age - (actual[0]?.age || 0));
    return (a.portfolio || 0) * multiplier;
  });

  // Get the appropriate portfolio value based on display mode
  const projectedData = displayMode === 'nominal'
    ? projection.map((p) => p.portfolioAfterInflation)
    : projection.map((p) => p.portfolio);

  const chartData = {
    labels: projection.map((p) => p.age),
    datasets: [
      {
        label: 'Projected Balance',
        data: projectedData,
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },

      // Actual data (always in nominal as it's what was actually earned)
      ...((actual || []).length > 0 ? [
        {
          label: displayMode === 'nominal'
            ? 'Actual Balance (Nominal)'
            : 'Actual Balance',
          data: actualData,
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
        } ,
      ] : []),

      // FIRE Target line (shown in nominal mode only)
      ...(displayMode === 'nominal' ? [
        {
          label: displayMode === 'nominal' ? 'FIRE Target (Nominal)' : 'FIRE Target',
          data: Array(projection.length).fill(fireTarget),
          borderColor: '#f57c00',
          borderDash: [5, 5],
          borderWidth: 2,
          fill: false,
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
          label: (context: any) => {
            const value = context.raw;
            let label = context.dataset.label || '';
            if (displayMode === 'nominal' && context.dataset.label?.includes('FIRE')) {
              label += ` (${formatCurrency(value)} nominal)`;
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: string | number) => {
            if (typeof value === 'number') {
              return formatCurrency(value);
            }
            return formatCurrency(0);
          },
        },
      },
    },
  } as const;

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {actual && actual.length > 0 ? 'Portfolio vs Actual' : 'Portfolio Growth Projection'}
        </Typography>
      </Box>
      {projection.length > 0 && <Line data={chartData} options={chartOptions} />}
    </Paper>
  );
};
