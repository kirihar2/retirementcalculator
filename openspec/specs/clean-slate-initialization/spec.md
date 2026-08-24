## ADDED Requirements

### Requirement: Empty initial state for new users
The system SHALL initialize all inputs to zero/empty values when no localStorage data exists, instead of hardcoded sample data.

#### Scenario: New user sees empty state
- **WHEN** a user visits the app for the first time with no localStorage data
- **THEN** all numeric inputs (currentAge, retirementAge, lifeExpectancy, currentPortfolio, monthlyIncome, monthlySpending, retirementSpending, preRetirementReturn, coastingReturn, retirementReturn, inflationRate, socialSecurityAge, socialSecurityIncome, safeWithdrawalRate, medicareAge, healthCareMonthly) default to 0
- **AND** all array inputs (pensions, lifeEvents, debtPayments, projectedMilestones, actuals, variableInflationRates, spendingCategories) default to empty arrays
- **AND** strategyPreset defaults to empty string or null
- **AND** withdrawalStrategy defaults to empty string or null
- **AND** coastingMode defaults to { enabled: false, coastingAge: 0, coasingMultiplier: 1 }

#### Scenario: Existing user keeps their data
- **WHEN** a user has existing localStorage data
- **THEN** the system loads their saved data from localStorage
- **AND** the empty defaults are not applied

### Requirement: Graceful handling of empty state
The system SHALL handle empty/zero inputs gracefully without crashes or nonsensical calculations.

#### Scenario: Projection calculation with zero inputs
- **WHEN** all numeric inputs are 0 and arrays are empty
- **THEN** the calculation logic does not crash or throw errors
- **AND** the UI displays a helpful message like "Enter your details to see projections" instead of charts with invalid data
- **AND** no division-by-zero or negative-age errors occur

#### Scenario: Empty arrays render empty sections
- **WHEN** pensions, lifeEvents, debtPayments, or other arrays are empty
- **THEN** the corresponding sections render with no items
- **AND** display a prompt like "No pensions added yet" instead of crashing or showing undefined

### Requirement: Clear all data resets to empty state
The system SHALL reset all localStorage keys to empty/zero values when the user triggers "Clear All Data", not just remove keys.

#### Scenario: Clear all data resets to empty
- **WHEN** the user clicks "Clear All Data" and confirms
- **THEN** all localStorage keys are cleared
- **AND** the page reloads with empty/zero defaults
- **AND** the onboarding walkthrough shows again (fire_has_seen_onboarding is cleared)
