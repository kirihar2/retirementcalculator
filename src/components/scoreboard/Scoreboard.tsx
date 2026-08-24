import { Box, Paper, Typography, LinearProgress } from '@mui/material';
import {
  AccountBalanceWallet as AccountBalanceWalletIcon,
  TrendingUp as TrendingUpIcon,
  Savings as SavingsIcon,
  EmojiEvents as EmojiEventsIcon,
} from '@mui/icons-material';
import type { PensionSummary } from '../../types';
import { formatCurrency } from '../../utils/formatting';
import { StatCard } from '../primitives/StatCard';
import { gradients } from '../../theme';

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
  const isEmptyState = !fireTarget && !currentPortfolio && !currentAge;

  return (
    <Paper
      elevation={2}
      sx={{
        mb: 3,
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      {/* Hero header with gradient */}
      <Box
        sx={{
          background: gradients.scoreboard,
          color: 'white',
          px: 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              letterSpacing: 0.5,
              mb: 0.5,
            }}
          >
            FIRE Dashboard
          </Typography>
          <Typography
            variant="body2"
            sx={{
              opacity: 0.9,
              fontSize: '0.875rem',
            }}
          >
            {isEmptyState ? 'Enter your details to see projections' : 'Financial Independence, Retire Early'}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', display: 'block' }}>
            Progress to FIRE
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontFamily: '"DM Mono", monospace',
            }}
          >
            {isEmptyState ? '—' : `${progress.toFixed(1)}%`}
          </Typography>
        </Box>
      </Box>

      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 6,
          bgcolor: 'rgba(255,255,255,0.2)',
          '& .MuiLinearProgress-bar': {
            bgcolor: progress >= 100 ? '#4caf50' : 'white',
            borderRadius: 3,
          },
        }}
      />

      {/* Stat cards */}
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(auto-fit, minmax(180px, 1fr))',
            },
            gap: 2,
            mb: 2,
          }}
        >
          <StatCard
            label="FIRE Target"
            value={formatCurrency(fireTarget)}
            subtitle={`@ ${safeWithdrawalRate}% SWR`}
            color="primary"
            icon={<AccountBalanceWalletIcon fontSize="small" />}
            size="medium"
          />
          <StatCard
            label="Current Portfolio"
            value={formatCurrency(currentPortfolio)}
            subtitle={`${progress.toFixed(1)}% of target`}
            color={progress >= 100 ? 'success' : 'primary'}
            icon={<TrendingUpIcon fontSize="small" />}
            size="medium"
          />
          <StatCard
            label="Annual Saving"
            value={formatCurrency(annualSaving)}
            subtitle="net surplus/yr"
            color={annualSaving >= 0 ? 'success' : 'warning'}
            icon={<SavingsIcon fontSize="small" />}
            size="medium"
          />
          <StatCard
            label="FIRE Age"
            value={fireAgeAchieved != null ? `${fireAgeAchieved}` : '—'}
            subtitle={
              fireAgeAchieved != null
                ? yearsToFIRE != null && yearsToFIRE > 0
                  ? `in ${yearsToFIRE} years`
                  : 'Achieved!'
                : 'Not achieved'
            }
            color={fireAgeAchieved != null ? 'success' : 'warning'}
            icon={<EmojiEventsIcon fontSize="small" />}
            size="large"
          />
          {pensionSummary.totalAnnualPensionIncome > 0 && (
            <StatCard
              label="Pension Income"
              value={formatCurrency(pensionSummary.totalAnnualPensionIncome)}
              subtitle={`${pensionSummary.activePensions.length} pension(s)/yr`}
              color="actuals"
              size="medium"
            />
          )}
          {socialSecurityIncome > 0 && (
            <StatCard
              label="Social Security"
              value={formatCurrency(socialSecurityIncome)}
              subtitle="annual income"
              color="actuals"
              size="medium"
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
}
