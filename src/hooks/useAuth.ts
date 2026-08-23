/**
 * Auth state hook.
 *
 * Subscribes to Firebase Auth's `onAuthStateChanged` and exposes a stable
 * `{ user, loading, error }` snapshot plus memoized action methods.
 *
 * The `loading` flag stays `true` until Firebase resolves its persisted
 * session — this prevents the UI from flickering to the sign-in screen
 * on page reload for users who are already signed in.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import {
  AuthError,
  changePassword as authChangePassword,
  deleteAccount as authDeleteAccount,
  sendResetEmail,
  signIn as authSignIn,
  signInWithApple as authSignInWithApple,
  signInWithGoogle as authSignInWithGoogle,
  signOut as authSignOut,
  signUp as authSignUp,
} from '../services/auth';
import { getAuthInstance, isFirebaseEnabled } from '../services/firebase';

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    // When Firebase is disabled, skip the subscription entirely so the UI
    // can render the anonymous experience without a loading delay.
    if (!isFirebaseEnabled()) {
      setLoading(false);
      return;
    }
    const auth = getAuthInstance();
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await authSignIn(email, password);
    } catch (err) {
      setError(err instanceof AuthError ? err : new AuthError('unknown', 'Sign-in failed.'));
      throw err;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await authSignUp(email, password);
    } catch (err) {
      setError(err instanceof AuthError ? err : new AuthError('unknown', 'Sign-up failed.'));
      throw err;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      await authSignInWithGoogle();
    } catch (err) {
      setError(err instanceof AuthError ? err : new AuthError('unknown', 'Google sign-in failed.'));
      throw err;
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    setError(null);
    try {
      await authSignInWithApple();
    } catch (err) {
      setError(err instanceof AuthError ? err : new AuthError('unknown', 'Apple sign-in failed.'));
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await authSignOut();
    } catch (err) {
      setError(err instanceof AuthError ? err : new AuthError('unknown', 'Sign-out failed.'));
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    try {
      await sendResetEmail(email);
    } catch (err) {
      setError(err instanceof AuthError ? err : new AuthError('unknown', 'Password reset failed.'));
      throw err;
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setError(null);
    try {
      await authChangePassword(currentPassword, newPassword);
    } catch (err) {
      setError(err instanceof AuthError ? err : new AuthError('unknown', 'Password change failed.'));
      throw err;
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    setError(null);
    try {
      await authDeleteAccount();
    } catch (err) {
      setError(err instanceof AuthError ? err : new AuthError('unknown', 'Account deletion failed.'));
      throw err;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return useMemo(
    () => ({
      user,
      loading,
      error,
      signIn,
      signUp,
      signInWithGoogle,
      signInWithApple,
      signOut,
      resetPassword,
      changePassword,
      deleteAccount,
      clearError,
    }),
    [user, loading, error, signIn, signUp, signInWithGoogle, signInWithApple, signOut, resetPassword, changePassword, deleteAccount, clearError]
  );
}
