import React from 'react';
import { Box, Typography } from '@mui/material';
import { NumericInput } from '../NumericInput';

/**
 * Controlled component for personal details inputs.
 * Replaces prop-based API with controlled children pattern.
 * Accepts state as read-only props and update callbacks.
 *
 * @example
 * ```tsx
 * <PersonalDetailsControlled
 *   currentAge={32}
 *   retirementAge={52}
 *   lifeExpectancy={95}
 *   onCurrentAgeChange={(age) => setInputs(prev => ({ ...prev, currentAge: age }))}
 *   onRetirementAgeChange={(age) => setInputs(prev => ({ ...prev, retirementAge: age }))}
 *   onLifeExpectancyChange={(age) => setInputs(prev => ({ ...prev, lifeExpectancy: age }))}
 * />
 * ```
 */
export const PersonalDetailsControlled: React.FC<{
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  onCurrentAgeChange: (value: number) => void;
  onRetirementAgeChange: (value: number) => void;
  onLifeExpectancyChange: (value: number) => void;
}> = ({ currentAge, retirementAge, lifeExpectancy, onCurrentAgeChange, onRetirementAgeChange, onLifeExpectancyChange }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Personal Details
      </Typography>

      <NumericInput
        label="Current Age"
        value={currentAge}
        onChange={onCurrentAgeChange}
        min={18}
        max={100}
      />

      <NumericInput
        label="Target Retirement Age"
        value={retirementAge}
        onChange={onRetirementAgeChange}
        min={currentAge}
        max={100}
      />

      <NumericInput
        label="Life Expectancy"
        value={lifeExpectancy}
        onChange={onLifeExpectancyChange}
        min={70}
        max={110}
      />
    </Box>
  );
};
