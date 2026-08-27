## ADDED Requirements

### Requirement: User can input portfolio by account type
The system SHALL allow users to specify their portfolio balance broken down by account type: Traditional (pre-tax 401k/IRA), Roth (post-tax Roth 401k/IRA), Taxable (brokerage), and HSA (Health Savings Account).

#### Scenario: User enters account breakdown
- **WHEN** user navigates to the portfolio input section
- **THEN** system displays four input fields: Traditional Balance, Roth Balance, Taxable Balance, HSA Balance

#### Scenario: Total portfolio equals sum of accounts
- **WHEN** user enters values for all account types
- **THEN** system displays the total portfolio balance as the sum of all account types

#### Scenario: User leaves some accounts empty
- **WHEN** user enters a value for Traditional Balance but leaves other accounts at 0
- **THEN** system treats unentered accounts as 0 and calculates taxes accordingly

### Requirement: Account balances persist to storage
The system SHALL persist account type balances to localStorage and sync to Firestore when the user saves.

#### Scenario: User refreshes the page
- **WHEN** user enters account balances and refreshes the browser
- **THEN** system restores the previously entered account balances

#### Scenario: User saves to cloud
- **WHEN** user clicks the Save button
- **THEN** system persists account balances to Firestore as part of the plan document

### Requirement: System accepts future Plaid integration
The system SHALL design the account balance data structure to accept either manual user input or automated data from Plaid API.

#### Scenario: Data structure supports both sources
- **WHEN** system loads account balances
- **THEN** data structure includes fields for `manual` (user input) and `plaid` (API data) with UI preferring `plaid` when available
