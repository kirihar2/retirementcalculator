import React from 'react';
import { Box, Button, Divider, Grid, Paper, TextField, Typography } from '@mui/material';
import { NumericInput } from './NumericInput';
import type { Pension, PensionSummary } from '../types';

export const aggregatePensions = (pensions?: Pension[]): PensionSummary => {
  if (!pensions || pensions.length === 0) {
    return { totalAnnualPensionIncome: 0, activePensions: [] };
  }
  const activePensions = pensions.filter(p => !p.endAge || p.endAge === null);
  const totalAnnualPensionIncome = activePensions.reduce(
    (sum, pension) => sum + pension.currentAnnualPayout,
    0
  );
  return { totalAnnualPensionIncome, activePensions };
};

interface PensionSectionProps {
  pensions: Pension[];
  onAddPension: () => void;
  onUpdatePension: (id: string, updates: Partial<Pick<Pension, 'name' | 'currentAnnualPayout' | 'startAge' | 'endAge'>>) => void;
  onRemovePension: (id: string) => void;
}

export const PensionSection: React.FC<PensionSectionProps> = ({
  pensions,
  onAddPension,
  onUpdatePension,
  onRemovePension,
}) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Traditional Pensions (Optional)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
        Add traditional corporate pensions (defined benefit plans) that provide fixed annual payouts.
        These are different from investment accounts like 401k/IRA — you don't contribute, the employer pays.
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" size="small" onClick={onAddPension} sx={{ textTransform: 'none' }}>
          + Add Pension
        </Button>
      </Box>

      {pensions.length === 0 ? (
        <Box sx={{ p: 3, backgroundColor: '#f5f5f5', borderRadius: 1, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No pensions added. Add one to include guaranteed income from traditional pension plans.
          </Typography>
        </Box>
      ) : (
        pensions.map((pension) => (
          <Paper key={pension.id} elevation={1} sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Pension Name"
                  value={pension.name}
                  onChange={(e) => onUpdatePension(pension.id, { name: e.target.value })}
                  size="small"
                  fullWidth
                  placeholder="e.g., ABC Corp Pension"
                />
              </Grid>
              <Grid item xs={12}>
                <NumericInput
                  label="Annual Payout ($)"
                  value={pension.currentAnnualPayout}
                  onChange={(value) => onUpdatePension(pension.id, { currentAnnualPayout: value })}
                  min={0}
                  step={100}
                />
              </Grid>
              <Grid item xs={6}>
                <NumericInput
                  label="Start Age"
                  value={pension.startAge}
                  onChange={(value) => onUpdatePension(pension.id, { startAge: value })}
                  min={0}
                  max={120}
                />
              </Grid>
              <Grid item xs={6}>
                <NumericInput
                  label="End Age (0 = until death)"
                  value={pension.endAge ?? 0}
                  onChange={(value) => onUpdatePension(pension.id, { endAge: value || null })}
                  min={0}
                  max={120}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button color="error" size="small" onClick={() => onRemovePension(pension.id)} variant="outlined">
                    Remove
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    💰 ${pension.currentAnnualPayout.toLocaleString()} annual payout starting at age {pension.startAge}
                    {pension.endAge ? ` through age ${pension.endAge}` : ' (continues until death)'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        ))
      )}

      {pensions.length > 0 && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            💵 Total Annual Pension Income: ${pensions.reduce((sum, p) => sum + p.currentAnnualPayout, 0).toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Combined with Social Security, this provides guaranteed income during retirement.
          </Typography>
        </Box>
      )}
    </Box>
  );
};
