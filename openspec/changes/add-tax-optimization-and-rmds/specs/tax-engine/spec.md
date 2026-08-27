## ADDED Requirements

### Requirement: User can configure filing status
The system SHALL allow users to select their tax filing status: Single or Married Filing Jointly.

#### Scenario: User selects filing status
- **WHEN** user navigates to tax settings
- **THEN** system displays radio buttons or dropdown with "Single" and "Married Filing Jointly" options

#### Scenario: Filing status affects tax brackets
- **WHEN** user selects "Married Filing Jointly"
- **THEN** system uses the MFJ tax bracket thresholds instead of Single thresholds

### Requirement: User can input state tax rate
The system SHALL allow users to specify their state tax rate as a percentage.

#### Scenario: User enters state tax rate
- **WHEN** user navigates to tax settings
- **THEN** system displays an input field labeled "State Tax Rate (%)"

#### Scenario: State tax rate persists
- **WHEN** user enters a state tax rate and saves
- **THEN** system persists the rate to localStorage and Firestore

#### Scenario: User in no-income-tax state
- **WHEN** user enters 0 for state tax rate
- **THEN** system calculates 0 state tax on withdrawals

### Requirement: System calculates federal income tax
The system SHALL calculate federal income tax using 2026 tax brackets based on filing status, applied to ordinary income (Traditional withdrawals, RMDs, pension income).

#### Scenario: Single filer with $50,000 ordinary income
- **WHEN** user has $50,000 in ordinary income and filing status is Single
- **THEN** system calculates federal tax using 2026 Single brackets (10% up to $11,925, 12% from $11,926 to $48,475, 22% from $48,476 to $50,000)

#### Scenario: Married filer with $100,000 ordinary income
- **WHEN** user has $100,000 in ordinary income and filing status is MFJ
- **THEN** system calculates federal tax using 2026 MFJ brackets

### Requirement: System calculates capital gains tax
The system SHALL calculate capital gains tax on taxable account withdrawals using 2026 long-term capital gains rates (0%, 15%, 20%) based on taxable income.

#### Scenario: User withdraws from taxable account with low income
- **WHEN** user's total taxable income is below the 0% capital gains threshold ($48,350 for Single, $96,700 for MFJ)
- **THEN** system applies 0% capital gains tax to taxable account withdrawals

#### Scenario: User withdraws from taxable account with moderate income
- **WHEN** user's total taxable income is between 0% and 15% thresholds
- **THEN** system applies 15% capital gains tax to taxable account withdrawals

#### Scenario: User withdraws from taxable account with high income
- **WHEN** user's total taxable income exceeds the 15% threshold ($533,400 for Single, $600,050 for MFJ)
- **THEN** system applies 20% capital gains tax to taxable account withdrawals

### Requirement: System calculates state tax
The system SHALL calculate state tax on all taxable withdrawals using the user-provided state tax rate.

#### Scenario: User with 5% state tax rate
- **WHEN** user has $50,000 in taxable withdrawals and state tax rate is 5%
- **THEN** system calculates $2,500 in state tax

#### Scenario: User with 0% state tax rate
- **WHEN** user has 0% state tax rate
- **THEN** system calculates $0 in state tax regardless of withdrawal amount

### Requirement: System displays tax breakdown by year
The system SHALL display a year-by-year breakdown showing gross withdrawals, federal tax, state tax, capital gains tax, and net after-tax income.

#### Scenario: User views tax projections
- **WHEN** user navigates to the tax projections tab
- **THEN** system displays a table with columns: Year, Age, Gross Withdrawal, Federal Tax, State Tax, Capital Gains Tax, Net Income, Effective Tax Rate

#### Scenario: User sees effective tax rate
- **WHEN** user views a specific year in tax projections
- **THEN** system displays the effective tax rate as (Total Tax / Gross Withdrawal) * 100
