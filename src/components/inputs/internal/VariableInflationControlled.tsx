import React from 'react';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';

/**
 * Controlled component for managing variable inflation rates by year.
 * Shows inflation entries with delete buttons and add button.
 * CRUD operations are handled by parent hook functions.
 *
 * @example
 * ```tsx
 * <VariableInflationControlled
 *   variableInflationRates={variableInflationRates}
 *   onAdd={() => handleAddInflationRate()}
 *   onUpdate={(id, updates) => handleUpdateInflationRate(id, updates)}
 *   onDelete={(id) => handleRemoveInflationRate(id)}
 * />
 * ```
 */
export const VariableInflationControlled: React.FC<{
  variableInflationRates?: Array<{ id: string; age: number; rate: number }>;
  inflationRate: number; // Base inflation rate for display in helper text
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<{ age: number; rate: number }>) => void;
  onDelete: (id: string) => void;
}> = ({ variableInflationRates = [], inflationRate, onAdd, onUpdate, onDelete }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
        Variable Inflation Rates by Year
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
        Override the base inflation rate ({inflationRate}%) for specific years. Leave blank to use the base rate.
        This is useful for modeling high-inflation periods or economic scenarios.
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" size="small" onClick={onAdd}>
          + Add Year Entry
        </Button>
      </Box>

      {variableInflationRates.length === 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No custom inflation rates set. All years will use the base rate of {inflationRate}%.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {variableInflationRates.map((entry) => (
            <Paper key={entry.id} elevation={1} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Age {entry.age}</Typography>

                  <Box sx={{ mt: 1, display: 'flex' }}>
                    <Typography variant="subtitle2" sx={{ mr: 2 }}>Age</Typography>
                    <input
                      type="number"
                      value={entry.age}
                      onChange={(e) => onUpdate?.(entry.id, { age: parseInt(e.target.value, 10) })}
                      style={{ width: 50, padding: 4, fontSize: 12 }}
                    />
                  </Box>

                  <Box sx={{ mt: 1, display: 'flex' }}>
                    <Typography variant="subtitle2" sx={{ mr: 2 }}>Custom Inflation Rate (%)</Typography>
                    <input
                      type="number"
                      value={entry.rate}
                      onChange={(e) => onUpdate?.(entry.id, { rate: parseFloat(e.target.value) })}
                      style={{ width: 70, padding: 4, fontSize: 12 }}
                      step={0.1}
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Overrides base rate of {inflationRate}% for this year
                  </Typography>
                </Box>

                {/* Remove button */}
                <IconButton size="small" onClick={() => onDelete?.(entry.id)} color="error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {variableInflationRates.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
          Tip: Use this to model recession inflation spikes or unexpected economic events.
        </Typography>
      )}
    </Box>
  );
};
