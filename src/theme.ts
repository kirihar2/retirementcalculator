import { createTheme } from '@mui/material/styles';

/**
 * Modern Financial Theme
 *
 * Clean, trustworthy, data-forward aesthetic inspired by Robinhood/Vanguard.
 * - Card-based layout with subtle elevation
 * - Generous whitespace
 * - Color-coded sections for visual hierarchy
 * - Large typography for key numbers
 */

// Section color palette - each section has a distinct identity
export const sectionColors = {
  inputs: {
    main: '#1976d2',      // Blue - trust, stability
    light: '#e3f2fd',
    dark: '#0d47a1',
  },
  projections: {
    main: '#2e7d32',      // Green - growth, money
    light: '#e8f5e9',
    dark: '#1b5e20',
  },
  risk: {
    main: '#ed6c02',      // Orange/amber - caution, analysis
    light: '#fff3e0',
    dark: '#e65100',
  },
  actuals: {
    main: '#0288d1',      // Teal/cyan - tracking, progress
    light: '#e1f5fe',
    dark: '#01579b',
  },
} as const;

// Core palette
const palette = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#6b7280',
    light: '#9ca3af',
    dark: '#4b5563',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff',
  },
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    disabled: '#9ca3af',
  },
  divider: '#e5e7eb',
};

// Custom shadows - subtle, modern elevation
const shadows = [
  'none',
  '0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 3px 0 rgb(0 0 0 / 0.05)',      // xs - subtle cards
  '0 2px 4px 0 rgb(0 0 0 / 0.04), 0 3px 6px 0 rgb(0 0 0 / 0.06)',      // sm - default cards
  '0 4px 8px 0 rgb(0 0 0 / 0.05), 0 6px 12px 0 rgb(0 0 0 / 0.07)',     // md - elevated cards
  '0 8px 16px 0 rgb(0 0 0 / 0.06), 0 12px 24px 0 rgb(0 0 0 / 0.08)',   // lg - hero sections
  '0 12px 24px 0 rgb(0 0 0 / 0.08), 0 16px 32px 0 rgb(0 0 0 / 0.10)',  // xl - modals/drawers
];

// Typography scale
const typography = {
  fontFamily: '"DM Mono", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '3rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '2.25rem',
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.875rem',
    fontWeight: 700,
    lineHeight: 1.3,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.35,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
    color: palette.text.secondary,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
    color: palette.text.secondary,
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.5,
    color: palette.text.secondary,
  },
  // Custom variant for KPI numbers
  kpi: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    fontFamily: '"DM Mono", monospace',
  },
  kpiSmall: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.2,
    fontFamily: '"DM Mono", monospace',
  },
};

// Shape
const shape = {
  borderRadius: 12,     // Cards
  borderRadiusSm: 8,    // Buttons, inputs
  borderRadiusLg: 16,   // Large sections
};

// Spacing scale (MUI default is 8px)
const spacing = 8;

// Component overrides for consistent defaults
const components = {
  MuiPaper: {
    defaultProps: {
      elevation: 1,
    },
    styleOverrides: {
      root: {
        borderRadius: shape.borderRadius,
        backgroundImage: 'none', // Disable gradient overlay
      },
    },
  },
  MuiCard: {
    defaultProps: {
      elevation: 1,
    },
    styleOverrides: {
      root: {
        borderRadius: shape.borderRadius,
        border: `1px solid ${palette.divider}`,
        backgroundImage: 'none',
      },
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: shape.borderRadiusSm,
        textTransform: 'none' as const,
        fontWeight: 500,
        padding: '8px 16px',
      },
      contained: {
        boxShadow: shadows[1],
        '&:hover': {
          boxShadow: shadows[2],
        },
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined' as const,
      size: 'small' as const,
    },
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: shape.borderRadiusSm,
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: shape.borderRadiusSm,
        fontWeight: 500,
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderColor: palette.divider,
        padding: '12px 16px',
      },
      head: {
        fontWeight: 600,
        backgroundColor: palette.background.default,
      },
    },
  },
  MuiAccordion: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        borderRadius: `${shape.borderRadius}px !important`,
        border: `1px solid ${palette.divider}`,
        '&:before': {
          display: 'none',
        },
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: shape.borderRadiusSm,
        height: 8,
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRadius: 0,
        border: 'none',
        boxShadow: shadows[5],
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      indicator: {
        height: 3,
        borderRadius: '3px 3px 0 0',
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none' as const,
        fontWeight: 500,
        minWidth: 120,
      },
    },
  },
};

// Gradients for hero sections
export const gradients = {
  primary: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
  primaryLight: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
  success: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
  scoreboard: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 50%, #1565c0 100%)',
};

// Create and export the theme
const theme = createTheme({
  palette,
  shadows: shadows as any,
  typography,
  shape,
  spacing,
  components,
});

export default theme;

// Helper: get section color by name
export function getSectionColor(section: keyof typeof sectionColors) {
  return sectionColors[section];
}
