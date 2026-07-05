import { Box, Paper, Typography } from '@mui/material';
import type { PensionSummary } from '../types';
import { formatCurrency } from '../utils/formatting';

interface ScoreboardProps {
  fireTarget: number;
  currentPortfolio: number;
  annualSaving: number;
  fireAgeAchieved: number | null;
  currentAge: number;
  safeWithdrawalRate: number;
  pensionSummary: PensionSummary;
  socialSecurityIncome: number;
}

export function Scoreboard({
  fireTarget,
  currentPortfolio,
  annualSaving,
  fireAgeAchieved,
  currentAge,
  safeWithdrawalRate,
  pensionSummary,
  socialSecurityIncome,
}: ScoreboardProps) {
  const progress = fireTarget > 0 ? Math.min(100, (currentPortfolio / fireTarget) * 100) : 0;
  const yearsToFIRE = fireAgeAchieved != null ? fireAgeAchieved - currentAge : null;

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        FIRE Dashboard
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2, mb: 2 }}>
        <ScoreCard
          label="FIRE Target"
          value={formatCurrency(fireTarget)}
          subtitle={`@ ${safeWithdrawalRate}% SWR`}
          color="primary"
        />
        <ScoreCard
          label="Current Portfolio"
          value={formatCurrency(currentPortfolio)}
          subtitle={`${progress.toFixed(1)}% of target`}
          color={progress >= 100 ? 'success' : 'info'}
        />
        <ScoreCard
          label="Annual Saving"
          value={formatCurrency(annualSaving)}
          subtitle="net surplus/yr"
          color={annualSaving >= 0 ? 'success' : 'warning'}
        />
        <ScoreCard
          label="FIRE Age"
          value={fireAgeAchieved != null ? `Age ${fireAgeAchieved}` : 'Not Achieved'}
          subtitle={yearsToFIRE != null ? `in ${yearsToFIRE} years` : 'adjust inputs'}
          color={fireAgeAchieved != null ? 'success' : 'warning'}
        />
        {pensionSummary.totalAnnualPensionIncome > 0 && (
          <ScoreCard
            label="Pension Income"
            value={formatCurrency(pensionSummary.totalAnnualPensionIncome)}
            subtitle={`${pensionSummary.activePensions.length} pension(s)/yr`}
            color="info"
          />
        )}
        {socialSecurityIncome > 0 && (
          <ScoreCard
            label="Social Security"
            value={formatCurrency(socialSecurityIncome)}
            subtitle="annual income"
            color="info"
          />
        )}
      </Box>

      {/* Progress bar */}
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Portfolio Progress to FIRE
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {progress.toFixed(1)}%
          </Typography>
        </Box>
        <Box sx={{ height: 8, borderRadius: 4, backgroundColor: '#e0e0e0', overflow: 'hidden' }}>
          <Box
            sx={{
              height: '100%',
              width: `${Math.min(100, progress)}%`,
              backgroundColor: progress >= 100 ? '#4caf50' : '#1976d2',
              borderRadius: 4,
              transition: 'width 0.5s ease',
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
}

function ScoreCard({
  label,
  value,
  subtitle,
  color,
}: {
  label: string;
  value: string;
  subtitle: string;
  color: 'primary' | 'success' | 'warning' | 'info';
}) {
  const colorMap = {
    primary: '#1976d2',
    success: '#4caf50',
    warning: '#ff9800',
    info: '#2196f3',
  };

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1,
        border: `1px solid ${colorMap[color]}22`,
        backgroundColor: `${colorMap[color]}08`,
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: colorMap[color], lineHeight: 1.2 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
  );
}
