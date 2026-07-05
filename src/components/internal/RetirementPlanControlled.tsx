import React from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { NumericInput } from '../NumericInput';

/**
 * Controlled component for retirement plan inputs.
 * Replaces prop-based API with controlled children pattern.
 * Accepts state as read-only props and update callbacks.
 *
 * @example
 * ```tsx
 * <RetirementPlanControlled
 *   retirementSpending={15000}
 *   socialSecurityAge={65}
 *   socialSecurityIncome={60000}
 *   safeWithdrawalRate={3.5}
 *   onRetirementSpendingChange={(spending) => setInputs(prev => ({ ...prev, retirementSpending: spending }))}
 *   onSSAgeChange={(age) => setInputs(prev => ({ ...prev, socialSecurityAge: age }))}
 *   onSSIncomeChange={(income) => setInputs(prev => ({ ...prev, socialSecurityIncome: income }))}
 *   onSWRChange={(rate) => setInputs(prev => ({ ...prev, safeWithdrawalRate: rate }))}
 * />
 * ```
 */
export const RetirementPlanControlled: React.FC<{
  retirementSpending: number;
  socialSecurityAge: number;
  socialSecurityIncome: number;
  safeWithdrawalRate: number;
  onRetirementSpendingChange: (value: number) => void;
  onSSAgeChange: (value: number) => void;
  onSSIncomeChange: (value: number) => void;
  onSWRChange: (value: number) => void;
}> = ({ retirementSpending, socialSecurityAge, socialSecurityIncome, safeWithdrawalRate, onRetirementSpendingChange, onSSAgeChange, onSSIncomeChange, onSWRChange }) => {
  return (
    <Box>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Retirement Plan
      </Typography>

      <NumericInput
        label="Monthly Retirement Spending ($)"
        value={retirementSpending}
        onChange={onRetirementSpendingChange}
        min={0}
        step={100}
      />

      <NumericInput
        label="Social Security Start Age"
        value={socialSecurityAge}
        onChange={onSSAgeChange}
        min={62}
        max={70}
      />

      <NumericInput
        label="Annual SS Income (Today $)"
        value={socialSecurityIncome}
        onChange={onSSIncomeChange}
        min={0}
        step={1000}
      />

      <NumericInput
        label="Safe Withdrawal Rate (%)"
        value={safeWithdrawalRate}
        onChange={onSWRChange}
        min={1}
        max={10}
        step={0.1}
      />
    </Box>
  );
};
