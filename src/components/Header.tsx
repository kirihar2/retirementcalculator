import { useEffect, useState } from 'react';
import { AppBar, Box, Button, Chip, Toolbar, Typography } from '@mui/material';
import { CloudOff as CloudOffIcon, WifiOff as WifiOffIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { isFirebaseEnabled } from '../services/firebase';

export function Header() {
  const { user, signOut } = useAuth();
  const authEnabled = isFirebaseEnabled();
  const [offline, setOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return (
    <AppBar position="static" color="primary" elevation={1} sx={{ mb: 3 }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
            🔥 FIRE Calculator
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
            Financial Independence, Retire Early
          </Typography>
        </Box>
        {authEnabled && user && offline && (
          <Chip
            icon={<WifiOffIcon sx={{ color: 'inherit' }} />}
            label="Offline"
            size="small"
            sx={{ mr: 1, color: 'rgba(255,255,255,0.9)', borderColor: 'rgba(255,255,255,0.5)' }}
            variant="outlined"
          />
        )}
        {authEnabled && user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              {user.email}
            </Typography>
            <Button color="inherit" size="small" onClick={signOut}>
              Sign out
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
