/**
 * App root.
 *
 * Top-level auth gate: renders the auth screen for anonymous visitors,
 * a loading state while Firebase resolves the persisted session, and
 * the dashboard for authenticated users. When the `VITE_ENABLE_AUTH`
 * feature flag is off, the dashboard renders unconditionally so the
 * existing anonymous/offline behavior is preserved.
 */
import { Box, CircularProgress, Typography } from '@mui/material';
import FIRECalculator from './FIRECalculator';
import { AuthScreen } from './components/auth/AuthScreen';
import { useAuth } from './hooks/useAuth';
import { isFirebaseEnabled } from './services/firebase';

function LoadingScreen() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Loading your session…
      </Typography>
    </Box>
  );
}

function App() {
  const auth = useAuth();
  const authEnabled = isFirebaseEnabled();

  // When the feature flag is off, render the dashboard unconditionally
  // — anonymous/offline behavior identical to pre-auth.
  if (!authEnabled) {
    return <FIRECalculator />;
  }

  if (auth.loading) {
    return <LoadingScreen />;
  }

  if (!auth.user) {
    return <AuthScreen />;
  }

  return <FIRECalculator />;
}

export default App;
