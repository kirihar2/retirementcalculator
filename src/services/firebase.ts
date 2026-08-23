/**
 * Firebase client initialization.
 *
 * Owns the Firebase app instance and the Auth SDK handle used throughout
 * the client. Firestore is NOT initialized here — all plan data reads and
 * writes go through the Cloud Functions backend, so the client never
 * needs a Firestore handle or security rules.
 *
 * The app is only considered enabled when every required variable is
 * present AND the `VITE_ENABLE_AUTH` feature flag is on. Call
 * `isFirebaseEnabled()` to branch behavior so the app still works in
 * fully offline / unconfigured environments.
 */
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const env = import.meta.env as Record<string, string | undefined>;

const config: FirebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: env.VITE_FIREBASE_APP_ID ?? '',
};

/**
 * True when every required Firebase env var is populated AND the
 * `VITE_ENABLE_AUTH` feature flag is on. The app continues to work
 * anonymously when this is false.
 */
export function isFirebaseEnabled(): boolean {
  const flag = env.VITE_ENABLE_AUTH;
  if (flag === 'false' || flag === '0' || flag === '') return false;
  return Boolean(
    config.apiKey &&
      config.authDomain &&
      config.projectId &&
      config.storageBucket &&
      config.messagingSenderId &&
      config.appId
  );
}

/** Base URL for the Cloud Functions backend. Reads from Vite env with a
 *  sensible local-dev default; production will point at the deployed
 *  functions URL (see docs/auth-rollout.md). */
export function getApiBaseUrl(): string {
  return env.VITE_API_BASE_URL ?? 'http://127.0.0.1:5001';
}

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;

/** Returns the initialized Firebase app, or null when disabled. */
export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseEnabled()) return null;
  if (!app) {
    app = initializeApp(config);
  }
  return app;
}

/** Returns the Firebase Auth handle, or null when Firebase is disabled. */
export function getAuthInstance(): Auth | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!authInstance) {
    authInstance = getAuth(firebaseApp);
  }
  return authInstance;
}
