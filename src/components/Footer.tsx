import { Box, Typography } from '@mui/material';

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#fafafa',
        textAlign: 'center',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        FIRE Calculator — For educational purposes only. Not financial advice.
      </Typography>
    </Box>
  );
}
