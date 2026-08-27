## ADDED Requirements

### Requirement: System calculates RMD starting age
The system SHALL calculate Required Minimum Distributions starting at age 73 for users born before 1960, and age 75 for users born in 1960 or later (effective 2033).

#### Scenario: User born in 1955 reaches RMD age
- **WHEN** user born in 1955 reaches age 73
- **THEN** system begins calculating RMDs for that year

#### Scenario: User born in 1965 reaches RMD age
- **WHEN** user born in 1965 reaches age 75
- **THEN** system begins calculating RMDs for that year

### Requirement: System uses IRS Uniform Lifetime Table
The system SHALL use the IRS Uniform Lifetime Table (Publication 590-B) to calculate the distribution period divisor for RMD calculations.

#### Scenario: User age 73 calculates RMD
- **WHEN** user is age 73 and has $100,000 in Traditional balance
- **THEN** system divides $100,000 by the Uniform Lifetime Table divisor for age 73 (26.5) to get RMD of $3,773.58

#### Scenario: User age 80 calculates RMD
- **WHEN** user is age 80 and has $200,000 in Traditional balance
- **THEN** system divides $200,000 by the divisor for age 80 (20.2) to get RMD of $9,900.99

### Requirement: System applies RMD only to Traditional accounts
The system SHALL calculate RMDs only on Traditional (pre-tax) account balances, excluding Roth, Taxable, and HSA balances.

#### Scenario: User has mixed account types
- **WHEN** user has $100,000 Traditional, $50,000 Roth, $30,000 Taxable
- **THEN** system calculates RMD using only the $100,000 Traditional balance

### Requirement: System displays RMD schedule
The system SHALL display a year-by-year RMD schedule showing the required distribution amount and remaining Traditional balance.

#### Scenario: User views RMD schedule
- **WHEN** user navigates to the RMD tab
- **THEN** system displays a table with columns: Year, Age, RMD Amount, Traditional Balance After RMD

#### Scenario: User sees RMD impact on taxes
- **WHEN** user views RMD schedule
- **THEN** system shows the RMD amount included in taxable income for that year

### Requirement: System models RMD tax impact
The system SHALL include RMD amounts in the tax calculation for each year, treating them as ordinary income.

#### Scenario: User has RMD and other income
- **WHEN** user has $10,000 RMD and $20,000 pension income
- **THEN** system calculates federal tax on $30,000 of ordinary income

#### Scenario: RMD pushes user into higher bracket
- **WHEN** user's income without RMD is in the 12% bracket but RMD pushes total into 22% bracket
- **THEN** system calculates tax using the higher bracket for the portion of income in that range
