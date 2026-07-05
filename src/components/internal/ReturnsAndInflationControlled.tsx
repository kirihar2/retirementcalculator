import React from 'react';
import { Box } from '@mui/material';
import { NumericInput } from '../NumericInput';

/**
 * Controlled component for return rates and inflation inputs.
 * Replaces prop-based API with controlled children pattern.
 * Accepts state as read-only props and update callbacks.
 *
 * @example
 * ```tsx
 * <ReturnsAndInflationControlled
 *   preRetirementReturn={10}
 *   coastingReturn={9}
 *   retirementReturn={6}
 *   inflationRate={3}
 *   onPreRetirementReturnChange={(rate) => setInputs(prev => ({ ...prev, preRetirementReturn: rate }))}
 *   onCoastingReturnChange={(rate) => setInputs(prev => ({ ...prev, coastingReturn: rate }))}
 *   onRetirementReturnChange={(rate) => setInputs(prev => ({ ...prev, retirementReturn: rate }))}
 *   onInflationRateChange={(rate) => setInputs(prev => ({ ...prev, inflationRate: rate }))}
 * />
 * ```
 */
export const ReturnsAndInflationControlled: React.FC<{
  preRetirementReturn: number;
  coastingReturn: number;
  retirementReturn: number;
  inflationRate: number;
  onPreRetirementReturnChange: (value: number) => void;
  onCoastingReturnChange: (value: number) => void;
  onRetirementReturnChange: (value: number) => void;
  onInflationRateChange: (value: number) => void;
}> = ({ preRetirementReturn, coastingReturn, retirementReturn, inflationRate, onPreRetirementReturnChange, onCoastingReturnChange, onRetirementReturnChange, onInflationRateChange }) => {
  return (
    <Box>
      <NumericInput
        label="Pre-Retirement Return (%)"
        value={preRetirementReturn}
        onChange={onPreRetirementReturnChange}
        min={0}
        max={20}
        step={0.1}
      />

      <NumericInput
        label="Coasting Return (%) — 10y before retire"
        value={coastingReturn}
        onChange={onCoastingReturnChange}
        min={0}
        max={20}
        step={0.1}
      />

      <NumericInput
        label="Retirement Return (%)"
        value={retirementReturn}
        onChange={onRetirementReturnChange}
        min={0}
        max={20}
        step={0.1}
      />

      <NumericInput
        label="Inflation Rate (%)"
        value={inflationRate}
        onChange={onInflationRateChange}
        min={0}
        max={10}
        step={0.1}
      />
    </Box>
  );
};
