import React from 'react';
import { Paper, Typography, Box, Chip, IconButton } from '@mui/material';
import { formatCurrency } from '../utils/formatting';

interface MilestoneItem {
  id?: string;
  age: number;
  event: string;
  detail: string;
  type: 'fire' | 'income' | 'event';
}

interface ProjectedMilestoneItem {
  id: string;
  age: number;
  event: string;
  description?: string;
  category: 'growth' | 'income' | 'event' | 'health';
  targetValue?: number;
  currentValue?: number;
}

interface MilestonesProps {
  retirementAge: number;
  socialSecurityAge: number;
  socialSecurityIncome: number;
  medicareAge?: number;
  projectedMilestones?: ProjectedMilestoneItem[];
  onUpdateMilestone?: (id: string, updates: Partial<ProjectedMilestoneItem>) => void;
  onRemoveMilestone?: (id: string) => void;
  getProjectedValueAtAge?: (age: number) => number | undefined;
}

export const Milestones: React.FC<MilestonesProps> = ({
  retirementAge,
  socialSecurityAge,
  socialSecurityIncome,
  medicareAge = 65,
  projectedMilestones = [],
  onUpdateMilestone,
  onRemoveMilestone,
  getProjectedValueAtAge,
}) => {
  // Create local closures for handlers to prevent stale closures in map callback
  const handleUpdateMilestone = onUpdateMilestone;
  const handleRemoveMilestone = onRemoveMilestone;

  const milestones: MilestoneItem[] = [];

  if (retirementAge) {
    milestones.push({
      id: `auto-retirement-${Date.now()}`,
      age: retirementAge,
      event: 'Retirement Target',
      detail: 'Stop working and begin drawing from portfolio',
      type: 'fire',
    });
  }

  if (socialSecurityAge) {
    milestones.push({
      id: `auto-ss-${Date.now()}`,
      age: socialSecurityAge,
      event: 'Social Security Begins',
      detail: `${formatCurrency(socialSecurityIncome)}/yr offset spending needs`,
      type: 'income',
    });
  }

  if (medicareAge !== undefined && medicareAge > retirementAge) {
    milestones.push({
      id: `auto-medicare-${Date.now()}`,
      age: medicareAge,
      event: 'Medicare Eligibility',
      detail: 'Enroll in Medicare Part A/B (premium-free)',
      type: 'event',
    });
  }

  const getChipColor = (type: string): 'primary' | 'success' | 'warning' | 'info' => {
    switch (type) {
      case 'fire':
        return 'warning';
      case 'income':
        return 'info';
      case 'event':
        return 'success';
      default:
        return 'primary';
    }
  };

  const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Automatic Milestones
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {milestones.map((milestone) => (
          <Box
            key={milestone.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr auto',
              gap: 2,
              alignItems: 'start',
              paddingBottom: 2,
              borderBottom: '1px solid #e0e0e0',
              '&:last-child': { borderBottom: 'none' },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: 'text.secondary',
              }}
            >
              {milestone.age}
            </Typography>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {milestone.event}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {milestone.detail}
              </Typography>
            </Box>
            <Chip
              label={milestone.type.toUpperCase()}
              size="small"
              color={getChipColor(milestone.type)}
              variant="outlined"
            />
          </Box>
        ))}

        {/* Projected Milestones Section */}
        {projectedMilestones.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 2, mb: 2, fontWeight: 'bold' }}>
              Your Milestones
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {projectedMilestones.map((milestone) => {
                // Generate unique ID if not provided
                const safeId = milestone.id || `ms-${milestone.age}-${Math.random().toString(36).substr(2, 9)}`;
                const currentValue = getProjectedValueAtAge ? getProjectedValueAtAge(milestone.age) : undefined;

                return (
                  <Paper key={safeId} elevation={1} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {milestone.event}
                          </Typography>
                          {/* Edit button - opens edit dialog */}
                          {handleUpdateMilestone && (
                            <IconButton size="small" onClick={() => handleUpdateMilestone(milestone.id, {})}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4" />
                              </svg>
                            </IconButton>
                          )}
                        </Box>
                        {/* Remove button */}
                        {handleRemoveMilestone && (
                          <IconButton size="small" onClick={() => handleRemoveMilestone(milestone.id)} color="error">
                            <CloseIcon />
                          </IconButton>
                        )}
                      </Box>

                      {milestone.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          {milestone.description}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Age {milestone.age}</Typography>

                        {milestone.targetValue && currentValue !== undefined ? (
                          <Typography variant="caption" color="text.secondary">
                            Current projection: {formatCurrency(currentValue)}
                          </Typography>
                        ) : milestone.targetValue ? (
                          <Typography variant="caption" color="text.secondary">
                            Target: {formatCurrency(milestone.targetValue)}
                          </Typography>
                        ) : null}
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </>
        )}

      </Box>
    </Paper>
  );
};

