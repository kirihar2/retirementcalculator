## ADDED Requirements

### Requirement: User can model Roth conversion strategy
The system SHALL allow users to model Roth conversion amounts for years before RMD age (73/75) and show the tax cost and long-term benefit.

#### Scenario: User enters Roth conversion amount
- **WHEN** user is age 62 and navigates to tax optimization
- **THEN** system displays an input field for "Roth Conversion Amount" for each year from current age to RMD age

#### Scenario: User sees tax cost of conversion
- **WHEN** user enters $20,000 Roth conversion for a year
- **THEN** system calculates and displays the additional federal and state tax owed on the conversion amount

#### Scenario: User sees long-term benefit
- **WHEN** user models Roth conversions
- **THEN** system shows the reduced RMD amounts in future years and the tax savings from tax-free Roth withdrawals

### Requirement: System shows tax-efficient withdrawal order
The system SHALL recommend a tax-efficient withdrawal order: Taxable accounts first (capital gains rates), then Traditional (ordinary income), then Roth (tax-free).

#### Scenario: User needs $50,000 withdrawal
- **WHEN** user has $30,000 Taxable, $40,000 Traditional, $20,000 Roth
- **THEN** system recommends withdrawing $30,000 from Taxable, $20,000 from Traditional, $0 from Roth

#### Scenario: User overrides withdrawal order
- **WHEN** user manually adjusts withdrawal amounts
- **THEN** system recalculates taxes based on the user's custom withdrawal order

### Requirement: System shows effective tax rate comparison
The system SHALL display the effective tax rate with and without Roth conversion strategy to help users evaluate the benefit.

#### Scenario: User compares scenarios
- **WHEN** user views tax optimization
- **THEN** system displays a comparison showing:
  - "Without Roth Conversion: X% effective tax rate over retirement"
  - "With Roth Conversion: Y% effective tax rate over retirement"
  - "Tax savings: $Z over retirement"
