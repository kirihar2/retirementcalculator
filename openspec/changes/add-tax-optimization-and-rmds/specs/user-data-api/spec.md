## MODIFIED Requirements

### Requirement: Plan document includes account type breakdown
The Plan document SHALL include an `accounts` object with fields for `traditionalBalance`, `rothBalance`, `taxableBalance`, and `hsaBalance`.

#### Scenario: Plan saved with account breakdown
- **WHEN** user saves a plan with account balances
- **THEN** Firestore document includes `accounts.traditionalBalance`, `accounts.rothBalance`, `accounts.taxableBalance`, `accounts.hsaBalance`

#### Scenario: Plan loaded with account breakdown
- **WHEN** user loads a plan from Firestore
- **THEN** system populates the account balance fields from the `accounts` object

#### Scenario: Backward compatibility with old plans
- **WHEN** user loads a plan saved before account type tracking was added
- **THEN** system treats the entire portfolio as `traditionalBalance` and sets other accounts to 0

### Requirement: Plan document includes tax configuration
The Plan document SHALL include a `taxConfig` object with fields for `filingStatus` (single/mfj), `stateTaxRate` (percentage), and `taxYear` (deployment year).

#### Scenario: Plan saved with tax config
- **WHEN** user saves a plan with tax configuration
- **THEN** Firestore document includes `taxConfig.filingStatus`, `taxConfig.stateTaxRate`, `taxConfig.taxYear`

#### Scenario: Plan loaded with tax config
- **WHEN** user loads a plan from Firestore
- **THEN** system populates the tax configuration fields from the `taxConfig` object
