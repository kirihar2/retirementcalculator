import { AppBar, Box, Toolbar, Typography } from '@mui/material';

export function Header() {
  return (
    <AppBar position="static" color="primary" elevation={1} sx={{ mb: 3 }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
            🔥 FIRE Calculator
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Financial Independence, Retire Early
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
