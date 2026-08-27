import React from 'react';
import { Box, Typography, Tooltip, IconButton } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { NumericInput } from './NumericInput';
import type { AccountBalances } from '../../types';

/**
 * Account breakdown input component.
 *
 * Allows users to specify their portfolio balance broken down by account type:
 * - Traditional (pre-tax 401k/IRA)
 * - Roth (post-tax Roth 401k/IRA)
 * - Taxable (brokerage)
 * - HSA (Health Savings Account)
 *
 * The total portfolio is displayed as the sum of all account types.
 */
export interface AccountBreakdownProps {
  accounts: AccountBalances;
  onAccountsChange: (accounts: AccountBalances) => void;
}

export const AccountBreakdown: React.FC<AccountBreakdownProps> = ({
  accounts,
  onAccountsChange,
}) => {
  const totalPortfolio =
    accounts.traditionalBalance +
    accounts.rothBalance +
    accounts.taxableBalance +
    accounts.hsaBalance;

  const updateField = (field: keyof AccountBalances) => (value: number) => {
    onAccountsChange({ ...accounts, [field]: value });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Account Breakdown
        </Typography>
        <Tooltip title="Break down your portfolio by account type for tax-aware retirement planning. Each account type has different tax treatment on withdrawals.">
          <IconButton size="small" sx={{ ml: 0.5 }}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Split your portfolio by tax treatment for accurate tax projections
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
          Traditional 401k/IRA (Pre-tax)
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Taxed as ordinary income on withdrawal
        </Typography>
        <NumericInput
          label="Traditional Balance"
          value={accounts.traditionalBalance}
          onChange={updateField('traditionalBalance')}
          min={0}
          step={10000}
          prefix="$"
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
          Roth 401k/IRA (Post-tax)
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Tax-free qualified withdrawals in retirement
        </Typography>
        <NumericInput
          label="Roth Balance"
          value={accounts.rothBalance}
          onChange={updateField('rothBalance')}
          min={0}
          step={10000}
          prefix="$"
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
          Taxable Brokerage
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Capital gains tax on appreciation (preferential rates)
        </Typography>
        <NumericInput
          label="Taxable Balance"
          value={accounts.taxableBalance}
          onChange={updateField('taxableBalance')}
          min={0}
          step={10000}
          prefix="$"
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
          HSA (Health Savings Account)
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Tax-free for medical expenses, taxed as ordinary income otherwise
        </Typography>
        <NumericInput
          label="HSA Balance"
          value={accounts.hsaBalance}
          onChange={updateField('hsaBalance')}
          min={0}
          step={5000}
          prefix="$"
        />
      </Box>

      <Box
        sx={{
          p: 2,
          bgcolor: 'primary.light',
          borderRadius: 1,
          mt: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} color="primary.dark">
          Total Portfolio: ${totalPortfolio.toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
};
