import React from 'react';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import { Chip } from '@mui/material';

/**
 * Controlled component for managing projected milestones list display.
 * Shows milestone cards with delete buttons and add button.
 * CRUD operations are handled by parent hook functions.
 *
 * @example
 * ```tsx
 * <MilestonesControlled
 *   projectedMilestones={projectedMilestones}
 *   onAdd={() => handleAddProjectedMilestone()}
 *   onUpdate={(id, updates) => handleUpdateProjectedMilestone(id, updates)}
 *   onDelete={(id) => handleRemoveProjectedMilestone(id)}
 * />
 * ```
 */
export const MilestonesControlled: React.FC<{
  projectedMilestones: any[];
  onAdd: () => void;
  onUpdate: (id: string, updates: any) => boolean;
  onDelete: (id: string) => void;
}> = ({ projectedMilestones, onAdd, onUpdate, onDelete }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
        Projected Milestones
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
        Track important goals and events at specific ages in your retirement journey.
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" size="small" onClick={onAdd}>
          + Add Milestone
        </Button>
      </Box>

      {projectedMilestones.length === 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No milestones yet. Click "Add Milestone" to create one.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {projectedMilestones.map((milestone) => (
            <Paper key={milestone.id} elevation={1} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {milestone.event}
                  </Typography>
                  {milestone.description && (
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                      {milestone.description}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip label={`Age ${milestone.age}`} size="small" color="primary" />
                    <Chip label={milestone.category.toUpperCase()} size="small" color="primary" />
                    {milestone.targetValue !== undefined && (
                      <Typography variant="caption">Target: ${milestone.targetValue.toLocaleString()}</Typography>
                    )}
                  </Box>
                </Box>

                {/* Remove button */}
                <IconButton size="small" onClick={() => onDelete?.(milestone.id)} color="error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </IconButton>
              </Box>

              {/* Inline edit form */}
              <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Edit Milestone Details
                </Typography>

                <Box sx={{ mb: 1, display: 'flex' }}>
                  <Typography variant="subtitle2" sx={{ mr: 2 }}>Event Name</Typography>
                  <input
                    type="text"
                    value={milestone.event || ''}
                    onChange={(e) => onUpdate?.(milestone.id, { event: e.target.value })}
                    style={{ width: '100%', padding: 4, fontSize: 12 }}
                  />
                </Box>

                <Box sx={{ mb: 1, display: 'flex' }}>
                  <Typography variant="subtitle2" sx={{ mr: 2 }}>Age</Typography>
                  <input
                    type="number"
                    value={milestone.age || 0}
                    onChange={(e) => onUpdate?.(milestone.id, { age: parseInt(e.target.value, 10) })}
                    style={{ width: 70, padding: 4, fontSize: 12 }}
                  />
                </Box>

                <Box sx={{ mb: 1, display: 'flex' }}>
                  <Typography variant="subtitle2" sx={{ mr: 2 }}>Category</Typography>
                  <select
                    value={milestone.category}
                    onChange={(e) => onUpdate?.(milestone.id, { category: e.target.value as any })}
                    style={{ width: '100%', padding: 4, fontSize: 12 }}
                  >
                    <option value="growth">Growth</option>
                    <option value="income">Income</option>
                    <option value="event">Event</option>
                    <option value="health">Health</option>
                  </select>
                </Box>

                <Box sx={{ mb: 1, display: 'flex' }}>
                  <Typography variant="subtitle2" sx={{ mr: 2 }}>Target Value ($)</Typography>
                  <input
                    type="number"
                    value={milestone.targetValue || ''}
                    onChange={(e) => onUpdate?.(milestone.id, { targetValue: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                    style={{ width: '100%', padding: 4, fontSize: 12 }}
                    placeholder="Leave empty to remove"
                  />
                </Box>

                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" sx={{ mr: 2 }}>Description</Typography>
                  <input
                    type="text"
                    value={milestone.description || ''}
                    onChange={(e) => onUpdate?.(milestone.id, { description: e.target.value })}
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
