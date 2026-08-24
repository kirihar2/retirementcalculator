## Purpose

Provides a secure backend API for plan data access using Cloud Functions, Firebase Admin SDK, and Firestore, with ID token verification, user-scoped data isolation, offline-safe reads, and dual-write local/remote storage reconciliation.

## Requirements

### Requirement: Cloud Functions backend mediates all plan data access
The system SHALL expose HTTPS Cloud Functions endpoints that perform all Firestore reads and writes for plan data. The client SHALL NOT access Firestore directly.

#### Scenario: Backend handles every plan mutation
- **WHEN** an authenticated user saves their plan
- **THEN** the client calls `PUT /api/plan` with the plan payload and an `Authorization: Bearer <id-token>` header
- **AND** the backend verifies the ID token with the Firebase Admin SDK
- **AND** writes the plan to `users/{uid}/plans/primary` using the Admin SDK
- **AND** returns a success response

#### Scenario: Backend handles every plan read
- **WHEN** an authenticated user loads their plan
- **THEN** the client calls `GET /api/plan` with the ID token header
- **AND** the backend verifies the ID token
- **AND** reads `users/{uid}/plans/primary` using the Admin SDK
- **AND** returns the plan document or 404 if none exists

#### Scenario: Client never initializes Firestore
- **WHEN** the client app loads
- **THEN** the client bundle does NOT import or initialize the Firestore SDK
- **AND** all plan data access goes through the `userData` service which calls the backend

### Requirement: ID token verification middleware
The system SHALL include a backend middleware function that extracts the Firebase ID token from the `Authorization: Bearer` header and verifies it using `admin.auth().verifyIdToken`. Handlers SHALL receive the decoded UID via the request context, never from client-supplied fields.

#### Scenario: Valid ID token is accepted
- **WHEN** a request arrives with a valid, unexpired Firebase ID token in the `Authorization` header
- **THEN** the middleware verifies the token
- **AND** attaches the decoded UID to the request context
- **AND** the handler proceeds

#### Scenario: Missing or invalid ID token is rejected
- **WHEN** a request arrives without an `Authorization` header, or with an invalid/expired token
- **THEN** the middleware rejects the request with HTTP 401
- **AND** no Firestore operation is performed

#### Scenario: Handlers do not trust client-supplied UIDs
- **WHEN** a handler processes a request
- **THEN** the handler reads the UID from the verified request context
- **AND** ignores any `userId` field in the request body or query params

### Requirement: User-scoped Firestore data model
The system SHALL store plan data under a per-user path `users/{uid}/plans/{planId}` in Firestore, where `{uid}` is the verified UID from the ID token. The backend uses the Firebase Admin SDK which bypasses security rules, but rules are maintained as defense-in-depth.

#### Scenario: Write a plan for the authenticated user
- **WHEN** the backend receives a valid `PUT /api/plan` request from a user with UID `abc123`
- **THEN** the backend writes the plan document to `users/abc123/plans/primary`
- **AND** the document contains the plan fields plus `updatedAt` and `createdBy` metadata

#### Scenario: Read a plan for the authenticated user
- **WHEN** the backend receives a valid `GET /api/plan` request from a user with UID `abc123`
- **THEN** the backend reads from `users/abc123/plans/primary`
- **AND** returns the document or 404

#### Scenario: Backend uses Admin SDK to bypass rules
- **WHEN** the backend performs Firestore operations
- **THEN** it uses `admin.firestore()` (Admin SDK) which has privileged access
- **AND** does not rely on the client's ID token for Firestore authorization

### Requirement: Firestore security rules as defense-in-depth
The system SHALL ship a `firestore.rules` file that restricts reads and writes under `users/{uid}` to the authenticated user whose UID matches `{uid}`, even though the backend bypasses rules via the Admin SDK.

#### Scenario: Matching UID is allowed (defense-in-depth)
- **WHEN** an authenticated user with UID `abc123` issues a direct read or write against `users/abc123/plans/primary` (e.g., via the Firebase console or a misconfigured client)
- **THEN** the security rules allow the operation

#### Scenario: Mismatched UID is denied (defense-in-depth)
- **WHEN** an authenticated user with UID `abc123` issues a direct read or write against `users/other456/plans/primary`
- **THEN** the security rules deny the operation with a permission-denied error

#### Scenario: Unauthenticated direct access is denied (defense-in-depth)
- **WHEN** any client without a valid auth token issues a direct read or write against `users/*`
- **THEN** the security rules deny the operation

### Requirement: User-data service client facade
The system SHALL expose a `userData` service module that wraps all backend API calls for plan data. The service reads the current user's ID token from Firebase Auth and attaches it to every request.

#### Scenario: Service exposes load and save operations
- **WHEN** a caller invokes `userData.savePlan(plan)` while authenticated
- **THEN** the service calls `PUT /api/plan` with the plan payload
- **AND** includes the current user's ID token in the `Authorization` header
- **AND** returns a promise that resolves on success or rejects with a typed error

#### Scenario: Service rejects operations when unauthenticated
- **WHEN** a caller invokes `userData.savePlan(plan)` while no user is signed in
- **THEN** the service rejects with an `unauthenticated` error without making an HTTP request

#### Scenario: Service refreshes ID token on every request
- **WHEN** the service makes a backend call
- **THEN** it calls `currentUser.getIdToken()` to get a fresh token (the SDK handles refresh)
- **AND** includes that token in the request header

#### Scenario: Service maps backend errors to typed errors
- **WHEN** the backend returns HTTP 401
- **THEN** the service rejects with a typed `unauthenticated` error
- **WHEN** the backend returns HTTP 500
- **THEN** the service rejects with a typed `server-error` error

### Requirement: Dual-write local and remote storage
The system SHALL write plan data to both localStorage and the backend when a user is authenticated, and handle empty initial state gracefully.

#### Scenario: Save plan with empty initial state
- **WHEN** a user is authenticated and all inputs are zero/empty
- **THEN** the system does NOT push the empty plan to the backend
- **AND** the system does NOT overwrite an existing remote plan with empty data
- **AND** localStorage remains empty or reflects the empty state

#### Scenario: Save plan with meaningful data
- **WHEN** a user is authenticated and at least one meaningful input is non-zero (e.g., currentAge > 0, currentPortfolio > 0)
- **THEN** the system writes the plan to localStorage
- **AND** the system writes the plan to the backend via `PUT /api/plan`
- **AND** the backend stores the plan under `users/{uid}/plans/primary`

#### Scenario: Load plan on first login with empty local state
- **WHEN** a user signs in for the first time on a device with no localStorage data
- **AND** the backend has an existing plan for that user
- **THEN** the system fetches the remote plan via `GET /api/plan`
- **AND** writes the remote plan into localStorage via `applyRemotePlan(plan)`
- **AND** the dashboard renders with the remote data

#### Scenario: Load plan on first login with empty remote state
- **WHEN** a user signs in for the first time on a device with no localStorage data
- **AND** the backend returns 404 (no existing plan)
- **THEN** the system displays the empty state
- **AND** the onboarding walkthrough shows
- **AND** the user can begin entering data

### Requirement: Empty state guard prevents remote overwrite
The system SHALL check if the local plan is empty (all zeros/empty arrays) before pushing to the backend, to prevent overwriting a remote plan with empty data.

#### Scenario: Empty local state does not overwrite remote
- **WHEN** a user is authenticated
- **AND** the local plan has all numeric inputs at 0 and all arrays empty
- **AND** the system attempts to sync
- **THEN** the system skips the `PUT /api/plan` call
- **AND** the remote plan remains unchanged

#### Scenario: Non-empty local state syncs normally
- **WHEN** a user is authenticated
- **AND** the local plan has at least one non-zero numeric input or non-empty array
- **AND** the system attempts to sync
- **THEN** the system calls `PUT /api/plan` with the aggregated plan
- **AND** the remote plan is updated

### Requirement: Claim anonymous plan via backend endpoint
The system SHALL expose a `POST /api/claim-anonymous-plan` endpoint that accepts an aggregated plan payload and writes it to `users/{uid}/plans/primary` only if that document does not already exist. The client calls this on first sign-in.

#### Scenario: First sign-in with an existing anonymous plan and no remote plan
- **WHEN** a user signs in and localStorage holds an anonymous plan (flag `claimedAnonymousPlan` is not set) and the backend returns 404 for `GET /api/plan`
- **THEN** the client aggregates the localStorage data into a plan payload
- **AND** calls `POST /api/claim-anonymous-plan` with the payload
- **AND** the backend writes the plan to `users/{uid}/plans/primary` (write-if-absent)
- **AND** the client sets `claimedAnonymousPlan=true` in localStorage

#### Scenario: First sign-in with an existing anonymous plan and an existing remote plan
- **WHEN** a user signs in and localStorage holds an anonymous plan and `GET /api/plan` returns an existing plan
- **THEN** the client does NOT call the claim endpoint
- **AND** reconciles by `updatedAt` timestamp per the dual-write rule
- **AND** shows a banner explaining that the existing cloud plan was kept

#### Scenario: First sign-in with no anonymous plan
- **WHEN** a user signs in and localStorage has no anonymous plan
- **THEN** the client does not perform a claim and proceeds with normal reconciliation

### Requirement: Delete user data via backend endpoint
The system SHALL expose a `DELETE /api/account` endpoint that deletes all data under `users/{uid}` in Firestore and deletes the Firebase Auth user. The client calls this when the user confirms account deletion.

#### Scenario: Account deletion
- **WHEN** the authenticated user confirms account deletion
- **THEN** the client calls `DELETE /api/account`
- **AND** the backend deletes the document at `users/{uid}/plans/primary` (and any other documents under `users/{uid}`)
- **AND** deletes the Firebase Auth user via the Admin SDK
- **AND** returns a success response
- **AND** the client clears localStorage and the session
- **AND** redirects to the sign-in screen

#### Scenario: Partial failure during account deletion
- **WHEN** the Firestore delete succeeds but the Firebase Auth delete fails
- **THEN** the backend returns an error
- **AND** the client surfaces the error and does NOT clear local state
- **AND** retries the failed step on next attempt

### Requirement: Offline-safe reads
The system SHALL render the dashboard using localStorage data even when the backend is unreachable, so that authenticated users can continue working offline.

#### Scenario: Read while offline
- **WHEN** an authenticated user loads the dashboard while offline
- **THEN** the system renders the plan from localStorage
- **AND** shows a subtle "offline" indicator
- **AND** queues any subsequent writes for later flush

#### Scenario: Read on fresh device with no localStorage
- **WHEN** an authenticated user loads the dashboard on a device with no localStorage entry
- **THEN** the system calls `GET /api/plan` to fetch the plan from the backend
- **AND** writes it into localStorage for subsequent offline reads
