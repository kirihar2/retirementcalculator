## MODIFIED Requirements

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

## ADDED Requirements

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
