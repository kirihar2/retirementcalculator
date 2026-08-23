/**
 * Account management page.
 *
 * Shows the authenticated user's email and account creation date, a
 * "change password" form, and a "delete account" button with a
 * confirmation dialog.
 */
import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

export function AccountPage() {
  const { user, changePassword, deleteAccount, signOut, error, clearError } = useAuth();

  // Change-password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordFieldError, setPasswordFieldError] = useState<{ current?: string; new?: string; confirm?: string }>({});

  // Delete-account dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  if (!user) return null;

  const createdAt = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : null;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setPasswordSuccess(false);

    const errors: typeof passwordFieldError = {};
    if (!currentPassword) errors.current = 'Current password is required.';
    if (!newPassword) errors.new = 'New password is required.';
    else if (newPassword.length < 8) errors.new = 'Password should be at least 8 characters.';
    else if (!/\d/.test(newPassword)) errors.new = 'Password must contain at least one number.';
    if (!confirmPassword) errors.confirm = 'Please confirm your new password.';
    else if (confirmPassword !== newPassword) errors.confirm = 'Passwords do not match.';

    if (Object.keys(errors).length > 0) {
      setPasswordFieldError(errors);
      return;
    }
    setPasswordFieldError({});
    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      // error set via useAuth
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteAccount();
      // Session is cleared by the auth service; App.tsx redirects to sign-in.
    } catch {
      // error set via useAuth; dialog stays open.
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', py: 4, px: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            Your account
          </Typography>
          <Typography variant="body1">
            <strong>Email:</strong> {user.email}
          </Typography>
          {createdAt && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Member since {createdAt}
            </Typography>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 1 }}>
            Change password
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
              {error.message}
            </Alert>
          )}
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Password updated successfully.
            </Alert>
          )}
          <Box component="form" onSubmit={handlePasswordSubmit}>
            <TextField
              label="Current password"
              type="password"
              fullWidth
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={Boolean(passwordFieldError.current)}
              helperText={passwordFieldError.current}
              disabled={passwordLoading}
              sx={{ mb: 2 }}
            />
            <TextField
              label="New password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={Boolean(passwordFieldError.new)}
              helperText={passwordFieldError.new ?? 'At least 8 characters, with one number.'}
              disabled={passwordLoading}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Confirm new password"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={Boolean(passwordFieldError.confirm)}
              helperText={passwordFieldError.confirm}
              disabled={passwordLoading}
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" disabled={passwordLoading}>
              {passwordLoading ? <CircularProgress size={20} /> : 'Update password'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 1 }} color="error">
            Danger zone
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Deleting your account is permanent. All plan data stored in the cloud will be erased.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" color="inherit" onClick={() => signOut()}>
              Sign out
            </Button>
            <Button variant="outlined" color="error" onClick={() => setDeleteDialogOpen(true)}>
              Delete account
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onClose={() => !deleteLoading && setDeleteDialogOpen(false)}>
        <DialogTitle>Delete your account?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete your account and all plan data stored in the cloud. Your
            local browser data will also be cleared. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={20} /> : 'Delete account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
