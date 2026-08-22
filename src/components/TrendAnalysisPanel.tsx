import { useMemo } from 'react';
import { Box, Typography, Chip, Divider } from '@mui/material';
import type { AnnualActuals, ProjectionYear } from '../types';
import { analyzeAllTrends, generateRecommendations, type TrendAnalysisResult } from '../utils/trend-analysis';

/**
 * Trend Analysis Panel
 *
 * Displays overall trend status for portfolio, savings, and spending,
 * along with actionable recommendations.
 */
export interface TrendAnalysisPanelProps {
  actuals: AnnualActuals[];
  projection: ProjectionYear[];
  retirementAge: number;
  currentAge: number;
}

const formatCurrency = (value: number): string => {
  const abs = Math.abs(value);
  const sign = value >= 0 ? '' : '-';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
};

function TrendRow({ label, result }: { label: string; result: TrendAnalysisResult }) {
  if (result.yearsWithData === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
        <Typography variant="body2" color="textSecondary">{label}</Typography>
        <Typography variant="body2" color="textSecondary" fontStyle="italic">
          No matching data
        </Typography>
      </Box>
    );
  }

  const directionLabel = {
    improving: 'Improving',
    declining: 'Declining',
    stable: 'Stable',
    insufficient_data: `Need ${3 - result.yearsWithData} more yr${3 - result.yearsWithData === 1 ? '' : 's'}`,
  }[result.direction];

  // Use darker variants for text readability on tinted backgrounds
  const darkColor = {
    improving: '#2e7d32',
    declining: '#c62828',
    stable: '#616161',
    insufficient_data: '#757575',
  }[result.direction];

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
      <Typography variant="body2">{label}</Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Chip
          label={`${result.arrow} ${directionLabel}`}
          size="small"
          sx={{
            bgcolor: `${result.color}20`,
            color: darkColor,
            fontWeight: 'bold',
          }}
        />
        <Typography variant="body2" sx={{ color: darkColor, minWidth: 60, textAlign: 'right' }}>
          {result.averagePercentVariance >= 0 ? '+' : ''}{result.averagePercentVariance.toFixed(1)}%
        </Typography>
      </Box>
    </Box>
  );
}

export function TrendAnalysisPanel({
  actuals,
  projection,
  retirementAge,
  currentAge,
}: TrendAnalysisPanelProps) {
  const trends = useMemo(() => {
    return analyzeAllTrends(actuals, projection);
  }, [actuals, projection]);

  const recommendations = useMemo(() => {
    const yearsToRetirement = Math.max(0, retirementAge - currentAge);
    return generateRecommendations(trends, yearsToRetirement);
  }, [trends, retirementAge, currentAge]);

  const hasEnoughData = actuals.length >= 1;

  if (!hasEnoughData) {
    return (
      <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#fafafa' }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
          Trend Analysis
        </Typography>
        <Typography variant="body2" color="textSecondary" fontStyle="italic">
          Add at least 1 year of actual data to see trend analysis.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
        Trend Analysis
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Based on {actuals.length} year{actuals.length !== 1 ? 's' : ''} of actual data
        {actuals.length < 3 && ' (3+ years recommended for reliable trends)'}
      </Typography>

      {/* Trend Rows */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
        <TrendRow label="Portfolio" result={trends.portfolio} />
        <TrendRow label="Savings" result={trends.savings} />
        <TrendRow label="Spending" result={trends.spending} />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Catch-Up Gap */}
      {trends.portfolio.yearsWithData > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Current Gap vs Projection
          </Typography>
          <Typography
            variant="body1"
            fontWeight="bold"
            sx={{ color: trends.portfolio.catchUpGap >= 0 ? '#2e7d32' : '#c62828' }}
          >
            {trends.portfolio.catchUpGap >= 0 ? 'Ahead' : 'Behind'} by{' '}
            {formatCurrency(trends.portfolio.catchUpGap)} ({trends.portfolio.catchUpGapPercent >= 0 ? '+' : ''}
            {trends.portfolio.catchUpGapPercent.toFixed(1)}%)
          </Typography>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Recommendations */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Recommendations
        </Typography>
        {recommendations.map((rec, idx) => (
          <Typography
            key={idx}
            variant="body2"
            sx={{
              mb: 0.5,
              pl: 1,
              borderLeft: '3px solid #1976d2',
              color: 'text.secondary',
            }}
          >
            {rec}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}
