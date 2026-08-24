## ADDED Requirements

### Requirement: Export current test data to JSON fixture
The system SHALL provide a script or mechanism to export the current hardcoded default values to a JSON fixture file at `test-data/sample-plan.json` in the same format as the existing Plan wire format.

#### Scenario: Export test data fixture
- **WHEN** the export mechanism is run
- **THEN** the system creates `test-data/sample-plan.json` containing all current hardcoded defaults (currentAge: 32, retirementAge: 52, lifeExpectancy: 95, currentPortfolio: 480000, monthlyIncome: 22500, monthlySpending: 4000, retirementSpending: 15000, preRetirementReturn: 10, retirementReturn: 6, inflationRate: 3, socialSecurityAge: 65, socialSecurityIncome: 60000, safeWithdrawalRate: 3.5, medicareAge: 65, healthCareMonthly: 2000, plus default pensions, life events, debt payments, coasting mode, variable inflation rates, strategy preset, withdrawal strategy)
- **AND** the JSON structure matches the Plan wire format used by the existing export/import feature

#### Scenario: Load test data fixture via import
- **WHEN** a user imports `test-data/sample-plan.json` using the existing import feature
- **THEN** the system restores all the sample data into localStorage
- **AND** the dashboard renders with the sample values

### Requirement: Fixture file is git-tracked
The system SHALL commit `test-data/sample-plan.json` to the repository so it's available for development and testing.

#### Scenario: Fixture available in fresh clone
- **WHEN** a developer clones the repository
- **THEN** `test-data/sample-plan.json` exists and contains the sample data
- **AND** the file can be loaded via the import feature for testing
