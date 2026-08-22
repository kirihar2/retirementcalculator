import React from 'react';
import { Box, Typography } from '@mui/material';
import { sectionColors } from '../../theme';

/**
 * StatCard - KPI display card for scoreboard and summaries
 *
 * Large bold value with label and optional subtitle.
 * Used for displaying key metrics like FIRE target, age, surplus.
 */
export interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  color?: keyof typeof sectionColors | string;
  icon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  sx?: object;
}

export function StatCard({
  label,
  value,
  subtitle,
  color = 'inputs',
  icon,
  size = 'medium',
  sx = {},
}: StatCardProps) {
  // Resolve color
  const resolvedColor = typeof color === 'string' && color in sectionColors
    ? sectionColors[color as keyof typeof sectionColors].main
    : color;

  // Size variants
  const sizes = {
    small: {
      value: 'kpiSmall',
      padding: 1.5,
    },
    medium: {
      value: 'kpiSmall',
      padding: 2,
    },
    large: {
      value: 'kpi',
      padding: 3,
    },
  };

  const sizeConfig = sizes[size];

  return (
    <Box
      sx={{
        p: sizeConfig.padding,
        borderRadius: 2,
        bgcolor: `${resolvedColor}08`,
        border: `1px solid ${resolvedColor}22`,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        position: 'relative',
        ...sx,
      }}
    >
      {icon && (
        <Box sx={{ color: resolvedColor, mb: 0.5, display: 'flex' }}>
          {icon}
        </Box>
      )}
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          fontSize: '0.65rem',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant={sizeConfig.value as any}
        sx={{
          color: resolvedColor,
          fontWeight: 700,
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>
      {subtitle && (
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontSize: '0.75rem',
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
