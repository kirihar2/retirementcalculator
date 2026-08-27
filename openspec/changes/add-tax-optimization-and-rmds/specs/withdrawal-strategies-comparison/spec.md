## MODIFIED Requirements

### Requirement: Withdrawal strategies account for tax impact
Withdrawal strategies SHALL calculate after-tax income by applying the tax engine to each strategy's withdrawal amounts.

#### Scenario: User compares withdrawal strategies
- **WHEN** user views the withdrawal strategies comparison
- **THEN** system displays both gross withdrawal and after-tax income for each strategy

#### Scenario: Strategy with lower gross but better tax treatment
- **WHEN** one strategy withdraws more from Roth (tax-free) and another withdraws more from Traditional (taxed)
- **THEN** system shows the after-tax income for each, which may favor the Roth-heavy strategy

### Requirement: Withdrawal strategies respect RMD requirements
Withdrawal strategies SHALL ensure that RMD amounts are withdrawn from Traditional accounts in years when the user is subject to RMDs.

#### Scenario: User subject to RMD selects a withdrawal strategy
- **WHEN** user is age 73+ and selects a withdrawal strategy
- **THEN** system ensures the strategy withdraws at least the RMD amount from Traditional accounts

#### Scenario: Strategy tries to withdraw less than RMD
- **WHEN** user selects a strategy that would withdraw less than the RMD from Traditional accounts
- **THEN** system overrides the strategy to withdraw the RMD amount and displays a warning
