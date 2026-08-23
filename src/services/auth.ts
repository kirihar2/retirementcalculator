/**
 * Authentication service.
 *
 * Thin facade over Firebase Auth that normalizes errors into a typed
 * `AuthError` union and enforces that every operation fails fast when
 * Firebase is disabled (so callers can branch on the result rather than
 * sprinkle `isFirebaseEnabled()` checks everywhere).
 *
 * Password change uses Firebase's `EmailAuthProvider` to re-authenticate
 * the current user before the update — required by Firebase's security
 * model for sensitive operations.
 */
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  type Auth,
  type User,
  type UserCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { getAuthInstance, getApiBaseUrl, isFirebaseEnabled } from './firebase';

// === Error types ===

export type AuthErrorCode =
  | 'invalid-email'
  | 'weak-password'
  | 'email-in-use'
  | 'invalid-credential'
  | 'user-not-found'
  | 'requires-recent-login'
  | 'network-error'
  | 'disabled'
  | 'unknown';

export class AuthError extends Error {
  readonly code: AuthErrorCode;
  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

/**
 * Map a Firebase Auth error code to a typed AuthErrorCode.
 * Firebase error codes are documented at:
 * https://firebase.google.com/docs/auth/admin/errors
 */
function mapFirebaseErrorCode(firebaseCode: string | undefined): AuthErrorCode {
  switch (firebaseCode) {
    case 'auth/invalid-email':
      return 'invalid-email';
    case 'auth/weak-password':
      return 'weak-password';
    case 'auth/email-already-in-use':
      return 'email-in-use';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-disabled':
      return 'invalid-credential';
    case 'auth/user-not-found':
      return 'user-not-found';
    case 'auth/requires-recent-login':
      return 'requires-recent-login';
    case 'auth/network-request-failed':
      return 'network-error';
    default:
      return 'unknown';
  }
}

function humanMessage(code: AuthErrorCode): string {
  switch (code) {
    case 'invalid-email':
      return 'Please enter a valid email address.';
    case 'weak-password':
      return 'Password should be at least 8 characters.';
    case 'email-in-use':
      return 'An account with this email already exists — try signing in instead.';
    case 'invalid-credential':
      return 'Invalid email or password.';
    case 'user-not-found':
      return 'No account found for that email.';
    case 'requires-recent-login':
      return 'Please sign in again to complete this action.';
    case 'network-error':
      return 'Network error. Please check your connection and try again.';
    case 'disabled':
      return 'Authentication is not enabled for this app.';
    case 'unknown':
    default:
      return 'Something went wrong. Please try again.';
  }
}

function wrapError(err: unknown): AuthError {
  // Our own AuthError passes through unchanged.
  if (err instanceof AuthError) return err;
  const code = (err as { code?: string })?.code;
  const mapped = mapFirebaseErrorCode(code);
  return new AuthError(mapped, humanMessage(mapped));
}

function requireAuth(): Auth {
  const a = getAuthInstance();
  if (!a) {
    throw new AuthError('disabled', humanMessage('disabled'));
  }
  return a;
}

// === Public API ===

export async function signUp(email: string, password: string): Promise<UserCredential> {
  try {
    const auth = requireAuth();
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    throw wrapError(err);
  }
}

export async function signIn(email: string, password: string): Promise<UserCredential> {
  try {
    const auth = requireAuth();
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    throw wrapError(err);
  }
}

/**
 * Sign in with Google via a popup. Firebase handles the OAuth dance; on
 * success the returned UserCredential carries the same ID-token shape as
 * email/password so the backend doesn't care which provider was used.
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    const auth = requireAuth();
    const provider = new GoogleAuthProvider();
    // Prefer the account-picker prompt even if the user is already signed
    // in to Google in this browser — avoids silently picking the wrong
    // Google account.
    provider.setCustomParameters({ prompt: 'select_account' });
    return await signInWithPopup(auth, provider);
  } catch (err) {
    throw wrapError(err);
  }
}

/**
 * Sign in with Apple via a popup. Firebase handles the OAuth dance; the
 * first sign-in may prompt the user to share or hide their email
 * (Apple's privacy feature). Either way, Firebase creates or links the
 * account based on the Apple subject identifier.
 */
export async function signInWithApple(): Promise<UserCredential> {
  try {
    const auth = requireAuth();
    const provider = new OAuthProvider('apple.com');
    // Request email scope; name is optional and rarely returned by Apple.
    provider.addScope('email');
    provider.addScope('name');
    return await signInWithPopup(auth, provider);
  } catch (err) {
    throw wrapError(err);
  }
}

export async function signOut(): Promise<void> {
  try {
    const auth = requireAuth();
    await firebaseSignOut(auth);
  } catch (err) {
    throw wrapError(err);
  }
}

export async function sendResetEmail(email: string): Promise<void> {
  try {
    const auth = requireAuth();
    await sendPasswordResetEmail(auth, email);
  } catch (err) {
    throw wrapError(err);
  }
}

/**
 * Change the current user's password. Requires the current password for
 * re-authentication — Firebase rejects password updates on stale sessions.
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  try {
    const auth = requireAuth();
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new AuthError('requires-recent-login', humanMessage('requires-recent-login'));
    }
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  } catch (err) {
    throw wrapError(err);
  }
}

/**
 * Delete the current user's account. Calls the backend's DELETE /api/account
 * endpoint which deletes Firestore data AND the Firebase Auth user server-side.
 * If the backend call fails, local state is preserved and the user can retry.
 */
export async function deleteAccount(): Promise<void> {
  const auth = requireAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new AuthError('requires-recent-login', humanMessage('requires-recent-login'));
  }
  const idToken = await user.getIdToken();
  const response = await fetch(`${getApiBaseUrl()}/api/account`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${idToken}`,
    },
  });
  if (!response.ok) {
    throw new AuthError('unknown', 'Account deletion failed. Please try again.');
  }
  // Backend handled both Firestore delete and Auth user delete.
  // Sign out locally to clear the session.
  await firebaseSignOut(auth);
}

export function getCurrentUser(): User | null {
  const auth = getAuthInstance();
  return auth?.currentUser ?? null;
}
