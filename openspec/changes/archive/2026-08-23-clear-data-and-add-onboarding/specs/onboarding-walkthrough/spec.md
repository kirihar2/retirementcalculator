## ADDED Requirements

### Requirement: First-time user onboarding walkthrough
The system SHALL display a step-by-step onboarding walkthrough for first-time users to introduce key features and guide initial setup.

#### Scenario: First-time user sees walkthrough
- **WHEN** a user visits the app and `fire_has_seen_onboarding` is not set or is false
- **THEN** the system displays an onboarding walkthrough overlay
- **AND** the walkthrough contains 4-5 steps explaining: inputs drawer, scoreboard, charts, analysis tabs
- **AND** each step has a brief description and "Next" / "Skip" buttons

#### Scenario: User completes walkthrough
- **WHEN** the user completes all walkthrough steps
- **THEN** the system sets `fire_has_seen_onboarding` to true in localStorage
- **AND** the walkthrough does not show again on subsequent visits

#### Scenario: User skips walkthrough
- **WHEN** the user clicks "Skip" at any step
- **THEN** the system sets `fire_has_seen_onboarding` to true in localStorage
- **AND** the walkthrough closes immediately
- **AND** the walkthrough does not show again on subsequent visits

### Requirement: Walkthrough content and structure
The system SHALL provide a walkthrough with the following steps in order:

#### Scenario: Walkthrough step 1 - Welcome
- **WHEN** the walkthrough starts
- **THEN** step 1 displays a welcome message explaining the app's purpose (retirement planning calculator)
- **AND** provides context on what the user will accomplish

#### Scenario: Walkthrough step 2 - Inputs drawer
- **WHEN** the user advances to step 2
- **THEN** the walkthrough highlights the inputs drawer (right-side panel)
- **AND** explains that users enter their age, income, portfolio, and other financial details here
- **AND** mentions the accordion sections for organizing inputs

#### Scenario: Walkthrough step 3 - Scoreboard
- **WHEN** the user advances to step 3
- **THEN** the walkthrough highlights the scoreboard (top KPI cards)
- **AND** explains that these cards show FIRE target, current portfolio, annual savings, and FIRE age
- **AND** mentions these update automatically as inputs change

#### Scenario: Walkthrough step 4 - Charts and analysis
- **WHEN** the user advances to step 4
- **THEN** the walkthrough highlights the main portfolio chart
- **AND** explains the analysis tabs below (projection table, Monte Carlo, withdrawal comparison, milestones, actuals)
- **AND** mentions these provide detailed insights into the retirement plan

#### Scenario: Walkthrough step 5 - Next steps
- **WHEN** the user advances to step 5
- **THEN** the walkthrough encourages the user to start by entering their current age and financial details
- **AND** provides a "Get Started" button that closes the walkthrough

### Requirement: Walkthrough only shows once per user
The system SHALL persist the `fire_has_seen_onboarding` flag in localStorage and only show the walkthrough once.

#### Scenario: Returning user does not see walkthrough
- **WHEN** a user has previously completed or skipped the walkthrough
- **THEN** `fire_has_seen_onboarding` is true in localStorage
- **AND** the walkthrough does not display on subsequent visits

#### Scenario: Clearing data resets walkthrough flag
- **WHEN** the user clears all data
- **THEN** `fire_has_seen_onboarding` is also cleared
- **AND** the walkthrough shows again on next visit
