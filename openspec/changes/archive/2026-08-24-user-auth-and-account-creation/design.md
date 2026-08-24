## Context

The Retirement Dashboard is a React + TypeScript + Vite SPA. Today it persists plan data only in the browser (localStorage-backed) and already imports the Firebase v12 SDK without using Auth or Firestore. Users have expressed the need to (a) create an account, (b) sign in from multiple devices, and (c) have their plan data follow them.

**Why a backend?** Exposing Firestore security rules to the browser means exposing the Firebase Web API key there too. While Firebase's Web API key is designed to be public, putting the authorization model in client-reachable Firestore rules invites subtle misconfiguration. A thin Cloud Functions backend gives us:

- A single trust boundary: the Admin SDK runs server-side with a service account that never leaves the server.
- Authorization logic expressed in TypeScript code (reviewable, testable, debuggable) rather than in a declarative rules DSL.
- A clean place to aggregate the app's flat localStorage shape into a proper `Plan` document.
- Room to add non-Firebase integrations later (email notifications, billing) without rearchitecting.

The client still uses the Firebase Auth JS SDK for sign-in/up/password-reset — that is the correct, intended use of the public web API key and cannot be moved server-side without inventing a custom auth protocol.

Key constraints:
- The app must remain a static SPA deployable to any CDN/edge; the backend is a separate deployable (Cloud Functions).
- Existing calculator/simulation logic must remain untouched; only the data-source layer changes.
- Existing anonymous users must not lose their local plan on upgrade.

## Goals / Non-Goals

**Goals:**
- Let users create an account (email + password) and sign in/out, with persisted sessions across reloads.
- Mediate every plan read/write through a Cloud Functions backend that validates Firebase ID tokens.
- Scope all plan data to an authenticated user's UID via Firestore writes performed by the Admin SDK.
- Preserve the anonymous, offline experience for visitors who don't sign in.
- Migrate an anonymous visitor's local plan into their new account on first sign-in ("claim plan"), via a backend call.
- Provide a minimal account page (view identity, change password, delete account).

**Non-Goals:**
- OAuth / social providers (Google, Apple) — deferred; email/password is sufficient for v1.
- Multi-user sharing of a single plan (advisor/spouse read access) — deferred.
- Moving Firebase Auth itself to the backend (it is explicitly a client-side SDK).
- Plan versioning / history / undo across devices.
- Admin console or user management dashboard.

## Decisions

### D1: Firebase Auth (email/password) for identity
**Choice:** Firebase Authentication with the email/password provider.
**Rationale:** The Firebase SDK is already installed; Firebase gives us password hashing, email verification, session persistence, and password reset for free. The client SDK's use of the web API key is the intended design and is safe when combined with server-side authorization.
**Alternatives considered:**
- Auth0 / Clerk — viable, but introduces a new vendor when Firebase is already present.
- Custom auth with our own backend — forces us to build password hashing, session management, reset-email delivery, etc.

### D2: Go backend on Cloud Run as the only path to Firestore
**Choice:** All plan reads and writes go through a Go HTTP server deployed to Cloud Run (`/api/plan`, `/api/account`, `/api/claim-anonymous-plan`). The client never initializes Firestore.
**Rationale:** The backend validates Firebase ID tokens with the Admin SDK and performs Firestore operations with admin privileges. This means:
- Firestore security rules become defense-in-depth (still worth having) rather than the primary authorization mechanism.
- The authorization logic lives in Go code we can unit-test and code-review like anything else.
- The client bundle no longer includes Firestore — smaller bundle, simpler dependency surface.
- Go gives us a small static binary, fast cold starts (~50-200ms), and a single-file deploy artifact — cheaper and simpler than Node for this workload.
**Alternatives considered:**
- Client-direct Firestore with security rules — works but puts the trust boundary in a rules DSL the user was uncomfortable with.
- TypeScript on Cloud Functions — viable but the user prefers Go; Cloud Run gives us the same serverless model for any language.
- Express/Fastify on a separate host — adds a second deployable outside the GCP project.
- Next.js — would force a structural rewrite of the Vite SPA.

### D3: ID-token auth middleware on every backend request
**Choice:** A middleware function extracts the `Authorization: Bearer <id-token>` header, calls `admin.auth().verifyIdToken(idToken)`, and attaches the decoded UID to the request context. Handlers read the UID from context; they never trust client-supplied user IDs.
**Rationale:** Firebase ID tokens are short-lived JWTs (1 hour) that the client SDK refreshes automatically. Verifying them server-side gives us a tamper-proof binding between request and user.
**Alternatives considered:**
- Long-lived session cookies — more infrastructure, no security benefit for this use case.
- Trusting a client-supplied UID header — trivially spoofable, rejected.

### D4: Plan document aggregation on the server
**Choice:** The backend accepts and returns a single `Plan` document per user, stored at `users/{uid}/plans/primary`. The client aggregates its flat localStorage keys (`fire_input_state`, `fire_pensions`, `fire_life_events`, …) into this shape before calling the backend, and unpacks the response back into localStorage.
**Rationale:** The server should own the canonical data shape. The client's localStorage structure is an implementation detail of the SPA and should not dictate the storage model.
**Alternatives considered:**
- Mirror each localStorage key as a separate Firestore document — couples the database to the SPA's internal shape and makes future UI changes breaking.

### D5: Local-first reads, backend writes
**Choice:** Reads come from localStorage (fast, offline-safe). On every local mutation, the `userData` service calls the backend asynchronously to persist. On sign-in, the client fetches the latest plan from the backend and reconciles with localStorage.
**Rationale:** Keeps the app responsive offline, preserves the current UX for anonymous users, and avoids making every keystroke wait on a network round-trip.
**Alternatives considered:**
- Backend-only reads — breaks offline use.
- Real-time subscriptions (Firestore listener via a streaming function) — premature; the data is small and users rarely edit across devices simultaneously.

### D6: "Claim anonymous plan" as a dedicated backend endpoint
**Choice:** `POST /api/claim-anonymous-plan` accepts the aggregated plan payload and writes it to `users/{uid}/plans/primary` only if that document does not already exist. Returns `{ claimed: true }` or `{ claimed: false, existingPlan: {...} }`. The client calls this on first sign-in.
**Rationale:** Making this an explicit endpoint (rather than overloading `PUT /api/plan`) makes the semantic clear — it's a one-time migration, not an overwrite. The backend enforces "write-if-absent" atomically via Firestore transactions.
**Alternatives considered:**
- Client checks existence then writes — race-prone; two devices could race on first sign-in.

### D7: Firestore security rules kept as defense-in-depth
**Choice:** Ship `firestore.rules` that restrict `users/{uid}/**` to matching UIDs, even though the backend uses the Admin SDK (which bypasses rules).
**Rationale:** If the backend is ever misconfigured or a new function is added without the auth middleware, the rules provide a second line of defense. Rules also make the data model visible in the Firebase console's Rules Playground.

## Risks / Trade-offs

- **[Firebase lock-in]** → Mitigation: the `userData` client service and the Cloud Functions handlers are the only modules that touch Firebase; swapping providers later is a contained change.
- **[Email/password is a weak phish vector]** → Mitigation: surface "enable MFA" as a follow-up; for v1, email verification on sign-up is sufficient.
- **[Backend cold starts]** → Mitigation: Cloud Functions have cold-start latency (1-3s) on first invocation after idle. The client shows a sync indicator, not a blocking spinner. Minimize function memory/size to reduce cold-start time.
- **[Backend cost at scale]** → Mitigation: invocations are infrequent (plan save on user action, not per-keystroke). Free tier is generous; monitor with Cloud Monitoring alerts.
- **[ID token expiry during long sessions]** → Mitigation: the Firebase client SDK auto-refreshes tokens. The `userData` service reads `currentUser.getIdToken()` fresh on every backend call, so stale tokens are not sent.
- **[Rules misconfiguration]** → Mitigation: even though the backend bypasses rules via Admin SDK, keep rules correct as defense-in-depth; review in PRs.
- **[Bundle size: Firebase Auth JS SDK]** → Mitigation: the client still imports the Auth SDK. Tree-shaking via modular Firebase v12 keeps this ~30KB gzipped. Firestore is no longer in the client bundle.

## Migration Plan

1. Enable Firebase Auth (email/password), Firestore, and Cloud Functions in the Firebase console; populate `.env` with real credentials.
2. Stand up the `functions/` directory with a `/api/health` endpoint and the ID-token middleware; deploy to the Firebase emulator for local testing.
3. Land the auth service, `useAuth` hook, `<AuthScreen>`, and `<ProtectedRoute>` behind a feature flag (`VITE_ENABLE_AUTH=true`). Default off in production for one release so we can dogfood.
4. Implement `PUT /api/plan` and `GET /api/plan`; wire the client's `userData` service to call them with the ID token header.
5. Implement `POST /api/claim-anonymous-plan` and wire the client-side claim flow.
6. Implement `DELETE /api/account`.
7. Flip the flag on for all users. Anonymous visitors continue to see the dashboard; signed-in users see their cloud-synced plan.
8. Remove the flag in a follow-up once metrics (signups, sync errors, cold-start latency) are clean.

**Rollback:** Flipping `VITE_ENABLE_AUTH=false` at the CDN level restores the old anonymous-only behavior. Firestore data is untouched and the Cloud Functions stay deployed but uninvoked. The claim flag in localStorage is idempotent.

## Open Questions

- Should we require email verification before the plan is written to Firestore, or allow unverified users to sync immediately? (Leaning toward: sync immediately, nag to verify.)
- Do we want to rate-limit account creation at the backend level beyond Firebase's built-in rate limits?
- Should the backend also expose a streaming endpoint (Server-Sent Events) for real-time sync across devices, or defer that until users ask for it?
