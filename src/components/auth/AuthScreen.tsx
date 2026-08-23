/**
 * Auth screen with tabbed Sign-In / Register views.
 *
 * Renders a centered card with MUI tabs switching between the two flows.
 * Form validation is shared; error messages are driven by the typed
 * `AuthError` codes returned by `useAuth`.
 */
import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Link,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

type TabValue = 'signin' | 'register';

interface TabPanelProps {
  value: TabValue;
  current: TabValue;
  children: React.ReactNode;
}

function TabPanel({ value, current, children }: TabPanelProps) {
  if (value !== current) return null;
  return <Box role="tabpanel" sx={{ pt: 2 }}>{children}</Box>;
}

export function AuthScreen() {
  const { signIn, signUp, signInWithGoogle, signInWithApple, resetPassword, error, clearError } = useAuth();
  const [tab, setTab] = useState<TabValue>('signin');
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);

  // Sign-in form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInFieldError, setSignInFieldError] = useState<{ email?: string; password?: string }>({});

  // Register form state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regFieldError, setRegFieldError] = useState<{ email?: string; password?: string; confirm?: string }>({});

  // Forgot-password mode
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotFieldError, setForgotFieldError] = useState<string | undefined>();

  const handleGoogle = async () => {
    clearError();
    setSocialLoading('google');
    try {
      await signInWithGoogle();
    } catch {
      // error set via useAuth
    } finally {
      setSocialLoading(null);
    }
  };

  const handleApple = async () => {
    clearError();
    setSocialLoading('apple');
    try {
      await signInWithApple();
    } catch {
      // error set via useAuth
    } finally {
      setSocialLoading(null);
    }
  };

  const switchTab = (_: React.SyntheticEvent, value: TabValue) => {
    setTab(value);
    clearError();
    setSignInFieldError({});
    setRegFieldError({});
    setForgotMode(false);
    setForgotSent(false);
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required.';
    if (password.length < 8) return 'Password should be at least 8 characters.';
    if (!/\d/.test(password)) return 'Password must contain at least one number.';
    return undefined;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const emailErr = validateEmail(signInEmail);
    const passwordErr = signInPassword ? undefined : 'Password is required.';
    if (emailErr || passwordErr) {
      setSignInFieldError({ email: emailErr, password: passwordErr });
      return;
    }
    setSignInFieldError({});
    setSignInLoading(true);
    try {
      await signIn(signInEmail.trim(), signInPassword);
    } catch {
      // `error` from useAuth is set; form stays open.
    } finally {
      setSignInLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const emailErr = validateEmail(regEmail);
    const passwordErr = validatePassword(regPassword);
    const confirmErr =
      !regConfirm ? 'Please confirm your password.' : regConfirm !== regPassword ? 'Passwords do not match.' : undefined;
    if (emailErr || passwordErr || confirmErr) {
      setRegFieldError({ email: emailErr, password: passwordErr, confirm: confirmErr });
      return;
    }
    setRegFieldError({});
    setRegLoading(true);
    try {
      await signUp(regEmail.trim(), regPassword);
    } catch {
      // `error` from useAuth is set; form stays open.
    } finally {
      setRegLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const emailErr = validateEmail(forgotEmail);
    if (emailErr) {
      setForgotFieldError(emailErr);
      return;
    }
    setForgotFieldError(undefined);
    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail.trim());
      setForgotSent(true);
    } catch {
      // error set via useAuth; stay on form.
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Card sx={{ maxWidth: 440, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            🔥 FIRE Calculator
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Sign in to sync your plan across devices.
          </Typography>

          {forgotMode ? (
            <>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Reset your password
              </Typography>
              {forgotSent ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  If an account exists for that email, a reset link has been sent.
                </Alert>
              ) : (
                <Box component="form" onSubmit={handleForgotSubmit}>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    error={Boolean(forgotFieldError)}
                    helperText={forgotFieldError}
                    disabled={forgotLoading}
                    sx={{ mb: 2 }}
                    autoFocus
                  />
                  <Button type="submit" variant="contained" fullWidth disabled={forgotLoading}>
                    {forgotLoading ? 'Sending…' : 'Send reset link'}
                  </Button>
                </Box>
              )}
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link component="button" type="button" underline="hover" onClick={() => { setForgotMode(false); setForgotSent(false); }}>
                  Back to sign in
                </Link>
              </Box>
            </>
          ) : (
            <>
              <Tabs value={tab} onChange={switchTab} variant="fullWidth" sx={{ mb: 1 }}>
                <Tab value="signin" label="Sign in" />
                <Tab value="register" label="Create account" />
              </Tabs>
              <Divider />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }} onClose={clearError}>
                  {error.message}
                </Alert>
              )}

              <TabPanel value="signin" current={tab}>
                <Box component="form" onSubmit={handleSignIn}>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    error={Boolean(signInFieldError.email)}
                    helperText={signInFieldError.email}
                    disabled={signInLoading}
                    sx={{ mb: 2 }}
                    autoFocus
                  />
                  <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    error={Boolean(signInFieldError.password)}
                    helperText={signInFieldError.password}
                    disabled={signInLoading}
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ textAlign: 'right', mb: 2 }}>
                    <Link component="button" type="button" variant="body2" underline="hover" onClick={() => setForgotMode(true)}>
                      Forgot password?
                    </Link>
                  </Box>
                  <Button type="submit" variant="contained" fullWidth disabled={signInLoading}>
                    {signInLoading ? 'Signing in…' : 'Sign in'}
                  </Button>
                </Box>
              </TabPanel>

              <TabPanel value="register" current={tab}>
                <Box component="form" onSubmit={handleRegister}>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    error={Boolean(regFieldError.email)}
                    helperText={regFieldError.email}
                    disabled={regLoading}
                    sx={{ mb: 2 }}
                    autoFocus
                  />
                  <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    error={Boolean(regFieldError.password)}
                    helperText={regFieldError.password ?? 'At least 8 characters, with one number.'}
                    disabled={regLoading}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Confirm password"
                    type="password"
                    fullWidth
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    error={Boolean(regFieldError.confirm)}
                    helperText={regFieldError.confirm}
                    disabled={regLoading}
                    sx={{ mb: 2 }}
                  />
                  <Button type="submit" variant="contained" fullWidth disabled={regLoading}>
                    {regLoading ? 'Creating account…' : 'Create account'}
                  </Button>
                </Box>
              </TabPanel>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2 }}>
                <Divider sx={{ flex: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  or continue with
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleGoogle}
                  disabled={socialLoading !== null}
                  startIcon={
                    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                      <path fill="#fff" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 15.14 0 7.52 5.15 3.79 12.57l7.97 6.21C13.65 13.82 18.49 9.5 24 9.5z"/>
                      <path fill="#fff" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#fff" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.21C.92 16.51 0 20.15 0 24c0 3.85.92 7.49 2.56 10.77l7.97-6.18z"/>
                      <path fill="#fff" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-4.82 0-8.91-3.26-10.37-7.67l-7.97 6.19C9.89 42.96 16.32 48 24 48z"/>
                    </svg>
                  }
                  sx={{
                    textTransform: 'none',
                    py: 1,
                    bgcolor: '#1a73e8',
                    '&:hover': { bgcolor: '#1557b0' },
                    '&:disabled': { bgcolor: 'rgba(26, 115, 232, 0.5)' },
                  }}
                >
                  {socialLoading === 'google' ? 'Connecting…' : 'Continue with Google'}
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleApple}
                  disabled={socialLoading !== null}
                  startIcon={
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                  }
                  sx={{
                    textTransform: 'none',
                    py: 1,
                    bgcolor: '#000',
                    color: '#fff',
                    '&:hover': { bgcolor: '#222' },
                    '&:disabled': { bgcolor: 'rgba(0, 0, 0, 0.5)', color: 'rgba(255,255,255,0.6)' },
                  }}
                >
                  {socialLoading === 'apple' ? 'Connecting…' : 'Continue with Apple'}
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
