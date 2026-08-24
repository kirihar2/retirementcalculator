## Why

The Retirement Dashboard currently runs entirely in the browser with data stored locally. Users cannot access their plans from multiple devices, share plans with a spouse or advisor, or have their data survive a browser reset. Adding user accounts and a server-side API layer unlocks cloud sync, multi-device access, and future collaboration features. A backend is required so that Firebase credentials (Admin SDK service account) and all data-access authorization decisions live server-side — the browser never talks to Firestore directly.

## What Changes

- Introduce user registration (email/password) and sign-in flows backed by Firebase Authentication (client-side SDK — this is the correct use of the public web API key).
- Add session management (login, logout, password reset, persisted sessions) wired into the app shell.
- Guard the existing dashboard behind an authenticated route so plan data is tied to a user identity.
- Add a **Go HTTP backend deployed to Cloud Run** that mediates every plan read/write. The client sends Firebase ID tokens in `Authorization: Bearer` headers; the backend verifies them with the Firebase Admin SDK and performs Firestore operations with admin privileges.
- Expose a thin API: `GET /api/plan`, `PUT /api/plan`, `DELETE /api/account`. The backend aggregates the flat localStorage shape into a single `Plan` document per user.
- Migrate the current anonymous/local plan into the authenticated user's account on first sign-in via a backend `POST /api/claim-anonymous-plan` call.
- Add a protected account/profile page where users can view their identity, change their password, and delete their account.

## Capabilities

### New Capabilities
- `user-auth`: Firebase Authentication setup, login/register/password-reset screens, auth state hook, protected-route wrapper, and account management UI.
- `user-data-api`: Cloud Functions backend that validates ID tokens and performs all Firestore reads/writes for plan data, plus the thin client-side `userData` service that calls the backend.

### Modified Capabilities
<!-- None -- the existing specs (monte-carlo-simulation, withdrawal-strategies-comparison, etc.) keep their requirements unchanged. Only the storage/sync transport changes, which is an implementation detail, not a spec-level requirement change. -->

## Impact

- **Code (client)**: New `src/services/auth.ts`, `src/services/userData.ts`, new `src/services/firebase.ts` (auth-only init), new `src/components/auth/*` screens, new `src/hooks/useAuth.ts`, new protected-route component, and a small top-level auth gate in `App.tsx`. Existing components stay untouched.
- **Code (backend)**: New `backend/` directory with a Go HTTP server (using `chi` router, Firebase Admin Go SDK), deployed to Cloud Run. Includes a token-verification middleware and plan/account CRUD handlers.
- **APIs**: The app's "API" is the Go backend's HTTPS endpoints on Cloud Run. Firestore is no longer accessed from the browser; it's accessed only by the Admin SDK in the backend.
- **Dependencies**: Firebase v12.18.0 is already a client dependency. The backend adds Go modules (`firebase.google.com/go/v4`, `chi`, etc.) in `backend/go.mod`.
- **Systems**: Requires a Firebase project with Auth and Firestore enabled, plus a Google Cloud project with Cloud Run enabled for the Go backend. CI/local dev must have Firebase credentials for the backend (service account) and the client (web API key).
- **Users**: Existing anonymous users see a "sign in to keep your plan in the cloud" prompt on first load after the change ships; their local plan is preserved either way.
