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
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Health Care Before Medicare
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
        For people retiring before Medicare eligibility (typically age 65).
        Estimates below are for annualized health care needs.
      </Typography>

      <NumericInput
        label="Medicare Eligibility Age (US Standard)"
        value={medicareAge}
        onChange={setMedicareAge}
        min={62}
        max={70}
        helperText="Standard: 65 (age when eligible for Medicare Part B)"
      />

      <NumericInput
        label="Est. Monthly Health Care Cost ($)"
        value={healthCareMonthly}
        onChange={setHealthCareMonthly}
        min={0}
        step={100}
        helperText={`Annual: $${(healthCareMonthly * 12).toLocaleString()} before Medicare`}
      />
    </Box>
  );
};
