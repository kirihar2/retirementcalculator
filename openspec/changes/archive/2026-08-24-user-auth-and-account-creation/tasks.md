## 1. Firebase project setup and client configuration

- [x] 1.1 Enable Firebase Authentication (email/password provider) and Cloud Functions in the Firebase console for the project referenced by `VITE_FIREBASE_PROJECT_ID`
- [x] 1.2 Enable Firestore in the Firebase console and select the production-region closest to the user base
- [x] 1.3 Verify `.env.example` documents every required env var (including `VITE_FIREBASE_APP_ID` and `VITE_ENABLE_AUTH`); document each variable's purpose
- [x] 1.4 Create `src/services/firebase.ts` that initializes only the Firebase Auth SDK (no Firestore import on the client) and exports `getAuthInstance()`, `isFirebaseEnabled()`, and `getApiBaseUrl()`
- [ ] 1.5 Harden the public API key: in Google Cloud Console → Credentials, restrict the web API key to HTTP referrers matching the production domain(s). Document the steps in `docs/firebase-setup.md`
- [ ] 1.6 Enable Firebase App Check (reCAPTCHA v3 provider) in the Firebase console; document the site key in `docs/firebase-setup.md`

## 2. Go backend scaffolding

- [x] 2.1 Create `backend/` directory at repo root with its own `go.mod` (module `github.com/retirementdashboard/backend`, Go 1.22, dependencies: `firebase.google.com/go/v4`, `github.com/go-chi/chi/v5`, `github.com/go-chi/cors`, `google.golang.org/api`, `cloud.google.com/go/firestore`)
- [x] 2.2 Add `Dockerfile` for Cloud Run deployment: multi-stage build (golang:1.22-alpine → alpine:3.20) producing a static binary
- [x] 2.3 Add `backend/.dockerignore` excluding build artifacts, test artifacts, IDE files, and OS metadata
- [x] 2.4 Create `backend/main.go` that initializes the Firebase Admin SDK, wires up the chi router with CORS and middleware, and exposes the HTTP server on `$PORT`
- [x] 2.5 Add `backend/README.md` documenting local development, Cloud Run deployment, and configuration
- [x] 2.6 Add `.gitignore` entries for `backend/backend` (binary), `backend/backend.exe`, `backend/vendor/`
- [ ] 2.7 Install Go locally if not present (>=1.22); confirm `go version` works; document the setup steps in `docs/firebase-setup.md`
- [ ] 2.8 Build the binary (`cd backend && go build .`) and run it locally with `GOOGLE_APPLICATION_CREDENTIALS` pointing at a service account key file

## 3. ID-token verification middleware

- [x] 3.1 Create `backend/internal/auth/middleware.go` exporting a `RequireAuth` middleware that extracts `Authorization: Bearer <id-token>` and calls `admin.auth().VerifyIDToken`
- [x] 3.2 On success, attach the UID to the request context; handlers read it via `auth.UIDFrom(r.Context())`
- [x] 3.3 On missing header, malformed token, or expired token, respond with HTTP 401 and a JSON error body; do not call next
- [ ] 3.4 Write unit tests for the middleware using a stubbed `VerifyIDToken` — cover valid token, missing header, malformed token, expired token

## 4. Plan CRUD handlers (Go)

- [x] 4.1 Implement `GET /api/plan` in `backend/internal/plan/handlers.go`: verify auth, read `users/{uid}/plans/primary`, return 200 + the plan doc or 404 if absent
- [x] 4.2 Implement `PUT /api/plan`: verify auth, decode the request body into a Plan struct, write to `users/{uid}/plans/primary` with `updatedAt` and `createdBy: uid` metadata, return 200
- [x] 4.3 Define a `Plan` Go type in `backend/internal/types/types.go` (and mirror in `src/types/plan.ts` on the client) — a single document aggregating inputs, pensions, life events, debt payments, milestones, actuals, coasting mode, variable inflation rates, strategy preset, withdrawal strategy
- [x] 4.4 Implement `POST /api/claim-anonymous-plan`: verify auth, accept a plan payload, use a Firestore transaction to write to `users/{uid}/plans/primary` only if the doc does not already exist. Return `{ claimed: true, updatedAt }` or `{ claimed: false, existingPlan: {...} }`
- [x] 4.5 Implement `DELETE /api/account` in `backend/internal/account/handlers.go`: verify auth, delete `users/{uid}/plans/primary`, then call `auth.DeleteUser`. If the Auth delete fails after Firestore delete succeeds, return 500 (partial-failure signal per spec)
- [x] 4.6 Wire all handlers into `backend/main.go` using chi with the `RequireAuth` middleware applied to every plan/account endpoint (health endpoint is the only public one)
- [x] 4.7 Add input validation with clear error messages for malformed payloads (400) and use structured error responses `{ error: { code, message } }` so the client can map them

## 5. Auth service and `useAuth` hook (client)

- [x] 5.1 Create `src/services/auth.ts` wrapping Firebase Auth: `signUp`, `signIn`, `signOut`, `sendResetEmail`, `changePassword`, `deleteAccount`, `getCurrentUser`. `deleteAccount` calls `DELETE /api/account` (not the Firebase client SDK directly)
- [x] 5.2 Map Firebase error codes to a typed `AuthError` union (`invalid-email`, `weak-password`, `email-in-use`, `invalid-credential`, `user-not-found`, `requires-recent-login`, `network-error`, `disabled`, `unknown`) with human-readable messages
- [x] 5.3 Create `src/hooks/useAuth.ts` exposing `{ user, loading, error, signIn, signUp, signOut, resetPassword, changePassword, deleteAccount, clearError }`, subscribing to `onAuthStateChanged` and cleaning up on unmount
- [x] 5.4 Ensure `loading` stays `true` until Firebase has resolved the persisted session (avoid flicker to the sign-in screen on reload)
- [x] 5.5 Memoize the action methods so consumers don't re-render on unrelated state changes

## 6. User-data service client (client)

- [x] 6.1 Create `src/services/userData.ts` exposing `loadPlan()`, `savePlan(plan)`, `claimAnonymousPlan(plan)`, `deleteAccount()` — all of which call the Cloud Functions backend via `fetch()` with the ID token header
- [x] 6.2 Read the current user's ID token via `currentUser.getIdToken()` fresh on every call (the SDK handles refresh); attach as `Authorization: Bearer`
- [x] 6.3 Refuse to make any call when no user is signed in — reject with an `unauthenticated` UserDataError
- [x] 6.4 Map backend error responses (401 → `unauthenticated`, 400 → `validation-error`, 500 → `server-error`, network failures → `network-error`) to a typed `UserDataError` union
- [x] 6.5 Define a client-side `Plan` type (mirroring the backend type) and helper functions `aggregateLocalPlan()` (collects localStorage keys into a `Plan`) and `applyRemotePlan(plan)` (writes a `Plan` back into localStorage keys)
- [x] 6.6 Add a small offline queue: if a `savePlan` call fails with a network error, push the pending write to an in-memory queue and flush on `navigator.onLine` transitions or on next sign-in

## 7. Firestore security rules (defense-in-depth)

- [x] 7.1 Add `firestore.rules` at repo root allowing read/write on `users/{uid}/**` only when `request.auth.uid == uid`, with a comment header explaining the rules are defense-in-depth (backend uses Admin SDK)
- [x] 7.2 Document in `docs/firebase-setup.md` that the Firebase console is the source of truth for deployed rules, and the file is for review/CI reference
- [ ] 7.3 Verify with the Firebase console's Rules Playground that matching-UID reads/writes succeed and mismatched-UID and unauthenticated access fail

## 8. Dual-write and reconciliation (client)

- [x] 8.1 Update `FIRECalculator.tsx` so every existing localStorage-save `useEffect` also triggers an async `userData.savePlan(aggregateLocalPlan())` call when a user is authenticated; keep the local write synchronous
- [x] 8.2 Implement reconciliation on sign-in: fetch via `userData.loadPlan()`; compare `updatedAt` with the local aggregate; the newer wins and overwrites the other; surface a one-time "We merged your plan from another device" banner via a small toast mechanism
- [x] 8.3 On a fresh device with no localStorage entry, fetch from the backend and write the result into localStorage via `applyRemotePlan(plan)`
- [x] 8.4 Add a subtle "offline" indicator in the header when `navigator.onLine` is false, gated on the user being authenticated

## 9. Claim-anonymous-plan flow (client)

- [x] 9.1 On successful sign-up or sign-in, check whether `localStorage.claimedAnonymousPlan` is set AND `GET /api/plan` returns 404; if so, call `userData.claimAnonymousPlan(aggregateLocalPlan())` and set the flag
- [x] 9.2 If both local and remote plans exist at first sign-in, run the standard reconciliation from task 8.2 and display the banner explaining that the cloud plan was kept
- [x] 9.3 Ensure the claim runs exactly once per UID (the flag is keyed by UID so signing in with a different account re-evaluates)

## 10. Auth UI screens (client)

- [x] 10.1 Create `src/components/auth/AuthScreen.tsx` with tabbed Sign-In / Register views sharing form validation logic
- [x] 10.2 Build the sign-in form: email field, password field, submit button, "Forgot password?" link, inline error display
- [x] 10.3 Build the register form: email field, password field, password confirmation field, client-side validation (email format, password strength ≥ 8 chars with at least one number), submit button, inline error display
- [x] 10.4 Create `src/components/auth/ForgotPasswordScreen.tsx` with the email-submission flow and the uniform "reset link sent" confirmation message
- [x] 10.5 Wire the forms to `useAuth` actions and show field-level errors mapped from `AuthError` types
- [x] 10.6 Add a loading state to the submit button while the Firebase call is in flight; disable other form interactions during submission
- [x] 10.7 Add Google and Apple sign-in buttons to the AuthScreen (above the email/password tabs, separated by an "or" divider)
- [x] 10.8 Add `signInWithGoogle` and `signInWithApple` methods to `src/services/auth.ts` using Firebase's `GoogleAuthProvider` and `OAuthProvider('apple.com')`
- [x] 10.9 Expose `signInWithGoogle` and `signInWithApple` through the `useAuth` hook
- [ ] 10.10 Enable Google and Apple providers in the Firebase console (manual step — see docs/firebase-setup.md)

## 11. Protected routing and app gate (client)

- [x] 11.1 Create a state-based auth gate in `App.tsx` that reads `useAuth` and swaps between `<AuthScreen>` and `<FIRECalculator>` based on auth state (no router dependency)
- [x] 11.2 Render a full-page loading state while `useAuth.loading` is true instead of flipping to the sign-in screen
- [x] 11.3 Add a sign-out control to the existing `Header` component that appears only when a user is signed in, showing their email
- [x] 11.4 Ensure that when the `VITE_ENABLE_AUTH` flag is off, the gate is bypassed and the dashboard renders unconditionally

## 12. Account management page (client)

- [x] 12.1 Create `src/components/auth/AccountPage.tsx` showing the user's email and (when available from Firebase `user.metadata`) account creation date
- [x] 12.2 Add a "Change password" form: current password, new password, confirmation; validates strength client-side and calls `auth.changePassword` (which re-authenticates via Firebase `EmailAuthProvider` before update)
- [x] 12.3 Add a "Delete account" button with a confirmation dialog (re-prompt for password to confirm); on confirm, the backend's `DELETE /api/account` handles Firestore + Auth deletion; the client clears localStorage and redirects
- [x] 12.4 Handle partial failures (backend returns 500 after Firestore delete succeeded) by surfacing a clear error and NOT clearing local state, per the spec

## 13. Feature flag and rollout

- [x] 13.1 Add `VITE_ENABLE_AUTH` to `.env.example` (default `false`); wrap the auth gate, protected route, user-data service, and backend calls in a feature-flag check that falls back to the anonymous-only behavior when disabled
- [x] 13.2 Document the rollout plan in `docs/auth-rollout.md`: flag off in production for the first release (dogfood), flag on for beta users, flag on for all, flag removal in a follow-up
- [x] 13.3 Ensure that when the flag is off, the dashboard and all existing calculator/simulation features behave identically to today (no regressions)

## 14. Verification and manual QA

- [ ] 14.1 Run the backend locally via `firebase emulators:start` and verify: `/api/health` returns 200; `/api/plan` returns 401 without a token; a valid test token (via the Auth emulator) can read/write a plan
- [ ] 14.2 Run the app locally with `VITE_ENABLE_AUTH=true` and verify: new sign-up creates a Firestore doc at `users/{uid}/plans/primary` (inspect via emulator UI); reload keeps the session; sign-out clears the session and redirects
- [ ] 14.3 Verify the anonymous-plan claim: create a plan as an anonymous user, register, confirm the plan appears in Firestore under the new UID, and the `claimedAnonymousPlan` flag is set
- [ ] 14.4 Verify reconciliation: modify the Firestore plan directly (emulator UI), reload the app signed in, confirm the banner shows and the newer value wins
- [ ] 14.5 Verify the security rules by attempting a direct read/write against another UID's path (via the Firebase console or a one-off script) and confirming permission-denied
- [ ] 14.6 Verify account deletion: Firestore data gone, Firebase Auth user gone, localStorage cleared, user redirected to sign-in
- [x] 14.7 Run the existing build (`npm run build`) and ensure no TypeScript errors; confirm the client bundle no longer includes Firestore (~savings) and the Firebase Auth SDK is ~30KB gzipped
