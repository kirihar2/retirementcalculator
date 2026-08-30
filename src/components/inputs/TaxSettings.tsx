import React from 'react';
import { Box, Typography, FormControl, RadioGroup, FormControlLabel, Radio, Tooltip, IconButton } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { NumericInput } from './NumericInput';
import type { TaxConfig } from '../../types';
import { getTaxYear } from '../../utils/taxConfig';

/**
 * Tax settings input component.
 *
 * Allows users to configure:
 * - Filing status (Single or Married Filing Jointly)
 * - State tax rate (percentage)
 *
 * Tax brackets are hardcoded for the deployment tax year and updated via new deployments.
 */
export interface TaxSettingsProps {
  taxConfig: TaxConfig;
  onTaxConfigChange: (config: TaxConfig) => void;
}

export const TaxSettings: React.FC<TaxSettingsProps> = ({
  taxConfig,
  onTaxConfigChange,
}) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Tax Settings
        </Typography>
        <Tooltip title="Configure your tax situation for accurate tax projections. Tax brackets are based on current tax law and updated with new deployments.">
          <IconButton size="small" sx={{ ml: 0.5 }}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Tax Year: {getTaxYear()} (hardcoded, updated via deployments)
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          Filing Status
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            value={taxConfig.filingStatus}
            onChange={(e) =>
              onTaxConfigChange({
                ...taxConfig,
                filingStatus: e.target.value as 'single' | 'mfj',
              })
            }
          >
            <FormControlLabel value="single" control={<Radio />} label="Single" />
            <FormControlLabel value="mfj" control={<Radio />} label="Married Filing Jointly" />
          </RadioGroup>
        </FormControl>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
          State Tax Rate
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Enter your state's income tax rate (0% for no state income tax states)
        </Typography>
        <NumericInput
          label="State Tax Rate (%)"
          value={taxConfig.stateTaxRate}
          onChange={(value) => onTaxConfigChange({ ...taxConfig, stateTaxRate: value })}
          min={0}
          max={20}
          step={0.5}
          helperText="Enter your state's income tax rate as a percentage"
          testId="state-tax-rate-input"
        />
      </Box>

      <Box
        sx={{
          p: 1.5,
          bgcolor: 'info.light',
          borderRadius: 1,
          mt: 2,
        }}
      >
        <Typography variant="caption" color="info.dark">
          💡 <strong>Tip:</strong> States with no income tax (AK, FL, NV, NH, SD, TN, TX, WA, WY) should enter 0%.
          For states with progressive tax, use your marginal rate or an average rate.
        </Typography>
      </Box>
    </Box>
  );
};
