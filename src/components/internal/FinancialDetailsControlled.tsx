import React from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { NumericInput } from '../NumericInput';

/**
 * Controlled component for financial details inputs.
 * Replaces prop-based API with controlled children pattern.
 * Accepts state as read-only props and update callbacks.
 *
 * @example
 * ```tsx
 * <FinancialDetailsControlled
 *   currentPortfolio={555000}
 *   monthlyIncome={22500}
 *   monthlySpending={4000}
 *   onCurrentPortfolioChange={(amount) => setInputs(prev => ({ ...prev, currentPortfolio: amount }))}
 *   onMonthlyIncomeChange={(income) => setInputs(prev => ({ ...prev, monthlyIncome: income }))}
 *   onMonthlySpendingChange={(spending) => setInputs(prev => ({ ...prev, monthlySpending: spending }))}
 * />
 * ```
 */
export const FinancialDetailsControlled: React.FC<{
  currentPortfolio: number;
  monthlyIncome: number;
  monthlySpending: number;
  onCurrentPortfolioChange: (value: number) => void;
  onMonthlyIncomeChange: (value: number) => void;
  onMonthlySpendingChange: (value: number) => void;
}> = ({ currentPortfolio, monthlyIncome, monthlySpending, onCurrentPortfolioChange, onMonthlyIncomeChange, onMonthlySpendingChange }) => {
  return (
    <Box>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Current Finances
      </Typography>

      <NumericInput
        label="Current Portfolio ($)"
        value={currentPortfolio}
        onChange={onCurrentPortfolioChange}
        min={0}
        step={10000}
      />

      <NumericInput
        label="Monthly Income (Gross) ($)"
        value={monthlyIncome}
        onChange={onMonthlyIncomeChange}
        min={0}
        step={100}
      />

      <NumericInput
        label="Monthly Spending ($)"
        value={monthlySpending}
        onChange={onMonthlySpendingChange}
        min={0}
        step={100}
      />
    </Box>
  );
};
