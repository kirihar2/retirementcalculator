## Purpose

Provides user authentication and account management via Firebase Auth, including registration, sign-in, persistent sessions, password reset, protected routes, and account lifecycle operations.

## Requirements

### Requirement: User registration with email and password
The system SHALL provide a registration screen that accepts an email address and a password, creates a Firebase Authentication account, and signs the user in on success.

#### Scenario: Successful registration
- **WHEN** the user submits a valid, unregistered email address and a password meeting the minimum strength policy
- **THEN** the system creates a new Firebase Auth user with that email and UID
- **AND** the user's session is persisted locally so reloads keep them signed in
- **AND** the dashboard renders as the authenticated user

#### Scenario: Registration with an already-registered email
- **WHEN** the user submits an email that is already registered
- **THEN** the system displays a clear error ("An account with this email already exists — try signing in instead")
- **AND** no new account is created
- **AND** the user remains on the registration screen

#### Scenario: Registration with a weak password
- **WHEN** the user submits a password shorter than the minimum strength policy
- **THEN** the system rejects the submission client-side with an explanatory error
- **AND** no Firebase Auth call is made

#### Scenario: Registration with a malformed email
- **WHEN** the user submits a value that is not a syntactically valid email address
- **THEN** the system rejects the submission client-side with a validation error
- **AND** no Firebase Auth call is made

### Requirement: User sign-in with email and password
The system SHALL provide a sign-in screen that accepts an email and password and authenticates the user against Firebase Auth.

#### Scenario: Successful sign-in
- **WHEN** the user submits a registered email and the correct password
- **THEN** the system establishes a persisted session
- **AND** the dashboard renders as the authenticated user

#### Scenario: Sign-in with wrong password
- **WHEN** the user submits a registered email with the wrong password
- **THEN** the system displays "Invalid email or password" without revealing which field was wrong
- **AND** the user remains on the sign-in screen

#### Scenario: Sign-in with unregistered email
- **WHEN** the user submits an email that is not registered
- **THEN** the system displays "Invalid email or password" (same wording as wrong password)
- **AND** offers a link to the registration screen

### Requirement: Persistent sessions across reloads
The system SHALL restore the authenticated session on page load if Firebase reports a current user, without prompting the user to sign in again.

#### Scenario: Reload while signed in
- **WHEN** the user reloads the page while signed in
- **THEN** the system restores the authenticated session from Firebase's persisted auth state
- **AND** the dashboard renders as the authenticated user without a sign-in prompt

#### Scenario: Sign out
- **WHEN** the user invokes "Sign out" from the account menu
- **THEN** the system calls Firebase Auth sign-out
- **AND** clears the persisted session
- **AND** redirects to the sign-in screen

### Requirement: Password reset via email
The system SHALL provide a "Forgot password" flow that sends a reset email through Firebase Auth.

#### Scenario: Request password reset for a registered email
- **WHEN** the user submits a registered email on the "Forgot password" screen
- **THEN** the system triggers Firebase's `sendPasswordResetEmail` for that address
- **AND** displays a confirmation message ("If an account exists for that email, a reset link has been sent") regardless of whether the email is actually registered

#### Scenario: Request password reset for an unregistered email
- **WHEN** the user submits an email that is not registered
- **THEN** the system displays the same confirmation message (no information leakage about account existence)

### Requirement: Protected route wrapper
The system SHALL gate the dashboard behind a protected route so that only authenticated users can access it, while unauthenticated visitors are routed to the auth screens.

#### Scenario: Unauthenticated visit to dashboard URL
- **WHEN** an unauthenticated visitor navigates to the dashboard route
- **THEN** the system redirects the visitor to the sign-in screen
- **AND** preserves the originally requested path so the user is returned there after successful sign-in

#### Scenario: Authenticated visit to dashboard URL
- **WHEN** an authenticated user navigates to the dashboard route
- **THEN** the system renders the dashboard normally

#### Scenario: Auth state transitions during session
- **WHEN** the user's auth state changes (e.g., token expires, user deleted from console)
- **THEN** the system redirects to the sign-in screen with an explanatory banner

### Requirement: Account management screen
The system SHALL provide an account page accessible to authenticated users where they can view their identity, change their password, and delete their account.

#### Scenario: View identity
- **WHEN** an authenticated user opens the account page
- **THEN** the system displays their email address and account creation date

#### Scenario: Change password while signed in
- **WHEN** the authenticated user submits a new password that meets the strength policy, with correct current-password confirmation if required
- **THEN** the system updates the password via Firebase Auth
- **AND** displays a success confirmation

#### Scenario: Delete account
- **WHEN** the authenticated user confirms account deletion
- **THEN** the system deletes the Firestore data under `users/{uid}`
- **AND** deletes the Firebase Auth user
- **AND** clears the local session and localStorage
- **AND** redirects to the sign-in screen with a confirmation banner

### Requirement: Auth state observable via a hook
The system SHALL expose a `useAuth` hook that returns the current user (or null), the loading state of the auth initialization, and memoized action methods (`signIn`, `signUp`, `signOut`, `resetPassword`, `deleteAccount`).

#### Scenario: Hook reflects signed-in state
- **WHEN** a component mounts while a user is signed in
- **THEN** `useAuth` returns `{ user: { uid, email, ... }, loading: false, ... }`

#### Scenario: Hook reflects signed-out state
- **WHEN** a component mounts while no user is signed in
- **THEN** `useAuth` returns `{ user: null, loading: false, ... }`

#### Scenario: Hook reflects auth initialization
- **WHEN** the app has just loaded and Firebase has not yet resolved the persisted session
- **THEN** `useAuth` returns `{ user: null, loading: true, ... }`
- **AND** the UI renders a loading state rather than flickering to the sign-in screen
