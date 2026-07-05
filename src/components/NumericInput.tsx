import { Box, TextField, Typography } from '@mui/material';

interface NumericInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  helperText?: string;
}

export function NumericInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  helperText,
}: NumericInputProps) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <TextField
        label={label}
        type="number"
        size="small"
        fullWidth
        value={value}
        onChange={(e) => {
          const parsed = parseFloat(e.target.value);
          if (!isNaN(parsed)) onChange(parsed);
        }}
        inputProps={{ min, max, step, style: { textAlign: 'right' } }}
        InputProps={{
          startAdornment: prefix ? (
            <Typography variant="body2" sx={{ mr: 0.5, color: 'text.secondary' }}>
              {prefix}
            </Typography>
          ) : undefined,
          endAdornment: suffix ? (
            <Typography variant="body2" sx={{ ml: 0.5, color: 'text.secondary' }}>
              {suffix}
            </Typography>
          ) : undefined,
        }}
        helperText={helperText}
        variant="outlined"
      />
    </Box>
  );
}
