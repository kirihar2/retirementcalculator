import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

interface DisplayModeToggleProps {
  displayMode: 'real' | 'nominal';
  onChange: (mode: 'real' | 'nominal') => void;
}

export function DisplayModeToggle({ displayMode, onChange }: DisplayModeToggleProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <Typography variant="body2" color="text.secondary">
        Display:
      </Typography>
      <ToggleButtonGroup
        value={displayMode}
        exclusive
        onChange={(_, value) => { if (value) onChange(value); }}
        size="small"
      >
        <ToggleButton value="real">
          Real (Today's $)
        </ToggleButton>
        <ToggleButton value="nominal">
          Nominal (Future $)
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
