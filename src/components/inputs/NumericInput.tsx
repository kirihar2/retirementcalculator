import { Box, TextField, Typography } from '@mui/material';

interface NumericInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  helperText?: string;
  inline?: boolean;
  testId?: string;
}

export function NumericInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  helperText,
  inline = false,
  testId,
}: NumericInputProps) {
  if (inline) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Typography variant="body2" sx={{ minWidth: 140, color: 'text.secondary' }}>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {prefix && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {prefix}
            </Typography>
          )}
          <TextField
            type="number"
            size="small"
            value={value}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              if (!isNaN(parsed)) onChange(parsed);
            }}
            inputProps={{ min, max, step, style: { textAlign: 'right', width: '100px', fontSize: '0.95rem' }, 'data-testid': testId }}
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { width: '130px' } }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {prefix && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {prefix}
            </Typography>
          )}
          <TextField
            type="number"
            size="small"
            value={value}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              if (!isNaN(parsed)) onChange(parsed);
            }}
            inputProps={{ min, max, step, style: { textAlign: 'right', fontSize: '0.95rem' }, 'data-testid': testId }}
            variant="outlined"
            sx={{ width: '150px' }}
          />
        </Box>
      </Box>
      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
}
