import React from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { NumericInput } from '../NumericInput';

/**
 * Controlled component for health care inputs before Medicare.
 * Replaces prop-based API with controlled children pattern.
 * Accepts state as read-only props and update callbacks.
 *
 * @example
 * ```tsx
 * <HealthCareControlled
 *   medicareAge={65}
 *   healthCareMonthly={2000}
 *   setMedicareAge={(age) => setInputs(prev => ({ ...prev, medicareAge: age }))}
 *   setHealthCareMonthly={(amount) => setInputs(prev => ({ ...prev, healthCareMonthly: amount }))}
 * />
 * ```
 */
export const HealthCareControlled: React.FC<{
  medicareAge: number;
  healthCareMonthly: number;
  setMedicareAge: (value: number) => void;
  setHealthCareMonthly: (value: number) => void;
}> = ({ medicareAge, healthCareMonthly, setMedicareAge, setHealthCareMonthly }) => {
  return (
    <Box>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
        Health Care
      </Typography>

      <NumericInput
        label="Medicare Age"
        value={medicareAge}
        onChange={setMedicareAge}
        min={62}
        inline
      />

      <NumericInput
        label={`Monthly Cost ($/mo, $${(healthCareMonthly * 12).toLocaleString()}/yr)`}
        value={healthCareMonthly}
        onChange={setHealthCareMonthly}
        min={0}
        step={100}
        prefix="$"
      />
    </Box>
  );
};
