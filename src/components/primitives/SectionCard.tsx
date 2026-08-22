import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { sectionColors } from '../../theme';

/**
 * SectionCard - Reusable card primitive for all dashboard sections
 *
 * Provides consistent card styling with:
 * - Colored left border for section identity
 * - Title with optional icon
 * - Content area
 * - Configurable elevation and padding
 */
export interface SectionCardProps {
  title?: string;
  icon?: React.ReactNode;
  color?: keyof typeof sectionColors | string;  // Section name or custom color
  children: React.ReactNode;
  elevation?: number;
  padding?: number;
  sx?: object;
}

export function SectionCard({
  title,
  icon,
  color = 'inputs',
  children,
  elevation = 1,
  padding = 2,
  sx = {},
}: SectionCardProps) {
  // Resolve color - either from section palette or custom
  const resolvedColor = typeof color === 'string' && color in sectionColors
    ? sectionColors[color as keyof typeof sectionColors].main
    : color;

  return (
    <Card
      elevation={elevation}
      sx={{
        borderLeft: `4px solid ${resolvedColor}`,
        position: 'relative',
        ...sx,
      }}
    >
      {title && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: padding,
            pt: padding,
            pb: title ? 1 : 0,
          }}
        >
          {icon && (
            <Box sx={{ color: resolvedColor, display: 'flex' }}>
              {icon}
            </Box>
          )}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            {title}
          </Typography>
        </Box>
      )}
      <CardContent sx={{ px: padding, pt: title ? 1 : padding, pb: padding }}>
        {children}
      </CardContent>
    </Card>
  );
}
