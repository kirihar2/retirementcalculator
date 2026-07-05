import React from 'react';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import { Chip } from '@mui/material';

/**
 * Controlled component for managing life events list display.
 * Shows event cards with delete buttons and add button.
 * CRUD operations are handled by parent hook functions.
 *
 * @example
 * ```tsx
 * <LifeEventsControlled
 *   lifeEvents={lifeEvents}
 *   onAdd={() => handleAddLifeEvent()}
 *   onUpdate={(id, updates) => handleUpdateLifeEvent(id, updates)}
 *   onDelete={(id) => handleRemoveLifeEvent(id)}
 * />
 * ```
 */
export const LifeEventsControlled: React.FC<{
  lifeEvents: any[];
  onAdd: () => void;
  onUpdate: (id: string, updates: any) => boolean;
  onDelete: (id: string) => void;
}> = ({ lifeEvents, onAdd, onUpdate, onDelete }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
        Life Events
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
        Track temporary expenses like daycare, college savings, or special events.
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" size="small" onClick={onAdd}>
          + Add Event
        </Button>
      </Box>

      {lifeEvents.length === 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No life events yet. Click "Add Event" to create one.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {lifeEvents.map((event) => (
            <Paper key={event.id} elevation={1} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {event.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                    {event.description || 'No description'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip label={event.type.toUpperCase()} size="small" color={event.type === 'one-time' ? 'error' : 'primary'} />
                    <Typography variant="caption">Age {event.startAge} - {event.endAge || 'N/A'}</Typography>
                  </Box>
                </Box>

                {/* Remove button */}
                <IconButton size="small" onClick={() => onDelete?.(event.id)} color="error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </IconButton>
              </Box>

              {/* Inline edit form */}
              <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Edit Life Event Details
                </Typography>

                <Box sx={{ mb: 1, display: 'flex' }}>
                  <Typography variant="subtitle2" sx={{ mr: 2 }}>Name</Typography>
                  <input
                    type="text"
                    value={event.name || ''}
                    onChange={(e) => onUpdate?.(event.id, { name: e.target.value })}
                    style={{ width: 140, padding: 4, fontSize: 12 }}
                  />
                </Box>

                <Box sx={{ mb: 1, display: 'flex' }}>
                  <Typography variant="subtitle2" sx={{ mr: 2 }}>Type</Typography>
                  <select
                    value={event.type}
                    onChange={(e) => onUpdate?.(event.id, { type: e.target.value as any })}
                    style={{ width: 100, padding: 4, fontSize: 12 }}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="limited">Limited (range)</option>
                    <option value="one-time">One-time</option>
                  </select>
                </Box>

                <Box sx={{ mb: 1, display: 'flex' }}>
                  <Typography variant="subtitle2" sx={{ mr: 2 }}>Amount ($)</Typography>
                  <input
                    type="number"
                    value={event.amount || 0}
                    onChange={(e) => onUpdate?.(event.id, { amount: parseInt(e.target.value, 10) })}
                    style={{ width: 100, padding: 4, fontSize: 12 }}
                  />
                </Box>

                <Box sx={{ mb: 1, display: 'flex' }}>
                  <Typography variant="subtitle2" sx={{ mr: 2 }}>Start Age</Typography>
                  <input
                    type="number"
                    value={event.startAge || 0}
                    onChange={(e) => onUpdate?.(event.id, { startAge: parseInt(e.target.value, 10) })}
                    style={{ width: 70, padding: 4, fontSize: 12 }}
                  />
                </Box>

                <Box sx={{ mb: 1, display: 'flex' }}>
                  <Typography variant="subtitle2" sx={{ mr: 2 }}>End Age (leave empty for ongoing)</Typography>
                  <input
                    type="number"
                    value={event.endAge || ''}
                    onChange={(e) => onUpdate?.(event.id, { endAge: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                    style={{ width: 70, padding: 4, fontSize: 12 }}
                  />
                </Box>

                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" sx={{ mr: 2 }}>Description</Typography>
                  <input
                    type="text"
                    value={event.description || ''}
                    onChange={(e) => onUpdate?.(event.id, { description: e.target.value })}
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
