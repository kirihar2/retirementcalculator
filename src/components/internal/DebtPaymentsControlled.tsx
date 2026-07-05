import React from 'react';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';

/**
 * Controlled component for managing debt payments list display.
 * Shows debt cards with delete buttons and add button.
 * CRUD operations are handled by parent hook functions.
 *
 * @example
 * ```tsx
 * <DebtPaymentsControlled
 *   debtPayments={debtPayments}
 *   onAdd={() => handleAddDebtPayment()}
 *   onUpdate={(id, updates) => handleUpdateDebtPayment(id, updates)}
 *   onDelete={(id) => handleRemoveDebtPayment(id)}
 * />
 * ```
 */
export const DebtPaymentsControlled: React.FC<{
  debtPayments: any[];
  onAdd: () => void;
  onUpdate: (id: string, updates: any) => boolean;
  onDelete: (id: string) => void;
}> = ({ debtPayments, onAdd, onUpdate, onDelete }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
        Debt Payments
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
        Track mortgages, loans, and other debt obligations with age ranges.
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" size="small" onClick={onAdd}>
          + Add Debt Payment
        </Button>
      </Box>

      {debtPayments.length === 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No debt payments yet. Click "Add Debt Payment" to create one.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {debtPayments.map((debt) => (
            <Paper key={debt.id} elevation={1} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {debt.name}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                    ${debt.monthlyPayment.toLocaleString()} / month
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Typography variant="caption">Age {debt.startAge} - {debt.endAge}</Typography>
                  </Box>
                </Box>

                {/* Remove button */}
                <IconButton size="small" onClick={() => onDelete?.(debt.id)} color="error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </IconButton>
              </Box>

              {/* Inline edit form */}
              <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Edit Debt Payment Details
                </Typography>

                <Box sx={{ mb: 1, display: 'flex' }}>
                  <Typography variant="subtitle2" sx={{ mr: 2 }}>Name</Typography>
                  <input
                    type="text"
                    value={debt.name || ''}
                    onChange={(e) => onUpdate?.(debt.id, { name: e.target.value })}
                    style={{ width: 140, padding: 4, fontSize: 12 }}
                  />
                </Box>

                <Box sx={{ mb: 1, display: 'flex' }}>
                  <Typography variant="subtitle2" sx={{ mr: 2 }}>Monthly Payment ($)</Typography>
                  <input
                    type="number"
                    value={debt.monthlyPayment || 0}
                    onChange={(e) => onUpdate?.(debt.id, { monthlyPayment: parseInt(e.target.value, 10) })}
                    style={{ width: 120, padding: 4, fontSize: 12 }}
                  />
                </Box>

                <Box sx={{ mb: 1, display: 'flex' }}>
                  <Typography variant="subtitle2" sx={{ mr: 2 }}>Start Age</Typography>
                  <input
                    type="number"
                    value={debt.startAge || 0}
                    onChange={(e) => onUpdate?.(debt.id, { startAge: parseInt(e.target.value, 10) })}
                    style={{ width: 70, padding: 4, fontSize: 12 }}
                  />
                </Box>

                <Box sx={{ mb: 1, display: 'flex' }}>
                  <Typography variant="subtitle2" sx={{ mr: 2 }}>End Age</Typography>
                  <input
                    type="number"
                    value={debt.endAge || ''}
                    onChange={(e) => onUpdate?.(debt.id, { endAge: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                    style={{ width: 70, padding: 4, fontSize: 12 }}
                  />
                </Box>

                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" sx={{ mr: 2 }}>Description</Typography>
                  <input
                    type="text"
                    value={debt.description || ''}
                    onChange={(e) => onUpdate?.(debt.id, { description: e.target.value })}
                    style={{ width: '100%', padding: 4, fontSize: 12 }}
                    placeholder="Optional description"
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
