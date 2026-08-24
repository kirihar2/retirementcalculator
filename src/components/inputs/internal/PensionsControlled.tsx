import React from 'react';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';


/**
 * Controlled component for managing pensions list display.
 * Shows pension cards with delete buttons and add button.
 * CRUD operations are handled by parent hook functions.
 *
 * @example
 * ```tsx
 * <PensionsControlled
 *   pensions={pensions}
 *   onAdd={() => handleAddPension()}
 *   onUpdate={(id, updates) => handleUpdatePension(id, updates)}
 *   onDelete={(id) => handleRemovePension(id)}
 * />
 * ```
 */
export const PensionsControlled: React.FC<{
  pensions: any[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<Pick<any, 'name' | 'currentAnnualPayout' | 'startAge' | 'endAge'>>) => boolean;
  onDelete: (id: string) => void;
}> = ({ pensions, onAdd, onUpdate, onDelete }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
        Pensions
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
        Traditional pensions provide annuity-style income. Click "Add Pension" to create one.
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" size="small" onClick={onAdd}>
          + Add Pension
        </Button>
      </Box>

      {pensions.length === 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No pensions yet. Click "Add Pension" to add one.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {pensions.map((pension) => (
            <Paper key={pension.id} elevation={1} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {pension.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Typography variant="caption">Annual: ${pension.currentAnnualPayout.toLocaleString()}</Typography>
                    <Typography variant="caption">Starts at Age {pension.startAge || 'N/A'}</Typography>
                  </Box>
                  {pension.endAge !== null && pension.endAge !== undefined && (
                    <Typography variant="caption" color="text.secondary">
                      Ends at age {pension.endAge}
                    </Typography>
                  )}
                </Box>

                {/* Remove button */}
                <IconButton size="small" onClick={() => onDelete?.(pension.id)} color="error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </IconButton>
              </Box>

              {/* Inline edit form */}
              <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Edit Pension Details
                </Typography>

                <Box sx={{ mb: 1, display: 'flex' }}>
                  <Typography variant="subtitle2" sx={{ mr: 2 }}>Name</Typography>
                  <input
                    type="text"
                    value={pension.name || ''}
                    onChange={(e) => onUpdate?.(pension.id, { name: e.target.value })}
                    style={{ width: 150, padding: 4, fontSize: 12 }}
                  />
                </Box>

                <Box sx={{ mb: 1, display: 'flex' }}>
                  <Typography variant="subtitle2" sx={{ mr: 2 }}>Annual Payout ($)</Typography>
                  <input
                    type="number"
                    value={pension.currentAnnualPayout || 0}
                    onChange={(e) => onUpdate?.(pension.id, { currentAnnualPayout: parseInt(e.target.value, 10) })}
                    style={{ width: 120, padding: 4, fontSize: 12 }}
                  />
                </Box>

                <Box sx={{ mb: 1, display: 'flex' }}>
                  <Typography variant="subtitle2" sx={{ mr: 2 }}>Start Age</Typography>
                  <input
                    type="number"
                    value={pension.startAge || 0}
                    onChange={(e) => onUpdate?.(pension.id, { startAge: parseInt(e.target.value, 10) })}
                    style={{ width: 70, padding: 4, fontSize: 12 }}
                  />
                </Box>

                <Box sx={{ display: 'flex' }}>
                  <Typography variant="subtitle2" sx={{ mr: 2 }}>End Age (leave empty for continuous)</Typography>
                  <input
                    type="number"
                    value={pension.endAge || ''}
                    onChange={(e) => onUpdate?.(pension.id, { endAge: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                    style={{ width: 70, padding: 4, fontSize: 12 }}
                  />
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};
