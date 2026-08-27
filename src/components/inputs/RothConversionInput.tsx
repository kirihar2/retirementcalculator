import React, { useMemo } from 'react';
import { Box, Typography, TextField, Tooltip, IconButton } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { calculateFederalIncomeTax } from '../../utils/taxEngine';
import type { TaxConfig } from '../../types';

export interface RothConversionInputProps {
  currentAge: number;
  retirementAge: number;
  rothConversions: { [age: number]: number };
  onRothConversionsChange: (conversions: { [age: number]: number }) => void;
  taxConfig?: TaxConfig;
  otherIncome?: { [age: number]: number }; // Other taxable income by age (salary, etc.)
}

export const RothConversionInput: React.FC<RothConversionInputProps> = ({
  currentAge,
  retirementAge,
  rothConversions,
  onRothConversionsChange,
  taxConfig,
  otherIncome = {},
}) => {
  const handleChange = (age: number, value: string) => {
    const amount = parseFloat(value) || 0;
    const updated = { ...rothConversions };
    if (amount > 0) {
      updated[age] = amount;
    } else {
      delete updated[age];
    }
    onRothConversionsChange(updated);
  };

  // Show years from current age to retirement age (or up to 10 years, whichever is less)
  const maxYears = Math.min(retirementAge - currentAge, 10);
  const years = Array.from({ length: maxYears }, (_, i) => currentAge + i);

  // Calculate tax cost of conversions
  const conversionTaxCost = useMemo(() => {
    if (!taxConfig) return 0;

    let totalTax = 0;
    for (const [ageStr, amount] of Object.entries(rothConversions)) {
      const age = parseInt(ageStr);
      const otherIncomeForAge = otherIncome[age] || 0;
      const totalTaxableIncome = otherIncomeForAge + amount;

      // Calculate tax with and without conversion
      const taxWithConversion = calculateFederalIncomeTax(totalTaxableIncome, taxConfig.filingStatus);
      const taxWithoutConversion = calculateFederalIncomeTax(otherIncomeForAge, taxConfig.filingStatus);

      // The tax cost is the difference
      totalTax += (taxWithConversion - taxWithoutConversion);
    }

    return totalTax;
  }, [rothConversions, otherIncome, taxConfig]);

  // Calculate baseline tax (without conversions) for comparison
  const baselineTax = useMemo(() => {
    if (!taxConfig) return 0;

    let totalTax = 0;
    for (const age of years) {
      const income = otherIncome[age] || 0;
      totalTax += calculateFederalIncomeTax(income, taxConfig.filingStatus);
    }
    return totalTax;
  }, [years, otherIncome, taxConfig]);

  const totalConversions = Object.values(rothConversions).reduce((sum, amt) => sum + amt, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Roth Conversion Strategy
        </Typography>
        <Tooltip title="Enter amounts you want to convert from Traditional to Roth each year before retirement. Conversions are taxed as ordinary income in the year of conversion, but reduce future RMDs and provide tax-free growth.">
          <IconButton size="small" sx={{ ml: 1 }}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Plan Roth conversions before retirement to reduce future RMDs and tax burden. Each conversion is taxed as ordinary income in the conversion year.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
        {years.map((age) => (
          <Box key={age}>
            <Typography variant="caption" color="text.secondary">
              Age {age}
            </Typography>
            <TextField
              size="small"
              type="number"
              fullWidth
              placeholder="$0"
              value={rothConversions[age] || ''}
              onChange={(e) => handleChange(age, e.target.value)}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
              inputProps={{
                min: 0,
                step: 1000,
              }}
            />
          </Box>
        ))}
      </Box>

      {totalConversions > 0 && taxConfig && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Total Planned Conversions: </strong>
            ${totalConversions.toLocaleString()}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Estimated Tax Cost: </strong>
            ${conversionTaxCost.toLocaleString()}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Baseline Tax (No Conversions): </strong>
            ${baselineTax.toLocaleString()}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Total Tax with Conversions: </strong>
            ${(baselineTax + conversionTaxCost).toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Note: Conversions increase taxable income in conversion years but reduce future RMDs and provide tax-free growth.
          </Typography>
        </Box>
      )}
    </Box>
  );
};
