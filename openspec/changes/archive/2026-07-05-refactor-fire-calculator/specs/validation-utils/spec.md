## ADDED Requirements

### Requirement: validateLifeEvents returns typed error messages
The `validateLifeEvents` function SHALL accept an array of `LifeEvent` and return an array of error strings for each invalid event.

#### Scenario: Invalid age range
- **WHEN** life event has `startAge: 50, endAge: 40` (invalid range)
- **THEN** validator returns error message: "End age must be >= start age"
- **AND** validation includes other fields (amount > 0, valid name length)

#### Scenario: Missing required fields
- **WHEN** life event has empty `name` field
- **THEN** validator returns error: "Event name is required"
- **AND** description becomes optional (no error if empty)

### Requirement: validatePensions validates pension array integrity
The `validatePensions` function SHALL check that each pension in the array meets requirements.

#### Scenario: Pension with negative payout
- **WHEN** pension has `currentAnnualPayout: -5000`
- **THEN** validator returns error: "Annual payout must be >= 0"
- **AND** startAge validation occurs (null is valid for continuous pensions)

#### Scenario: Pension endAge before startAge
- **WHEN** pension has `startAge: 65, endAge: 62`
- **THEN** validator returns error: "End age must be >= start age"

### Requirement: validateMilestone checks milestone validity
The `validateMilestone` function SHALL return a single error string (or null if valid).

#### Scenario: Milestone in past
- **WHEN** milestone has `age: 25` but currentAge is 35
- **THEN** validator returns error: "Cannot add milestone in the past"
- **AND** minimum age validation applies (e.g., >= currentAge - 10)

#### Scenario: Duplicate milestones at same age
- **WHEN** two milestones exist with `age: 42` and different categories
- **THEN** validator returns error: "Only one milestone per age allowed"

### Requirement: validateProjectionYears checks year-by-year consistency
The `validateProjectionYears` function SHALL verify that projected years have valid data.

#### Scenario: Missing portfolio value
- **WHEN** projection year has `portfolio: NaN` or negative value
- **THEN** validator returns error: "Portfolio must be a non-negative number"

#### Scenario: Invalid return rate
- **WHEN** projection year has `annualReturn: -15` (below realistic range)
- **THEN** validator warns: "Return rate is below typical range (< 0%)"
- **AND** does not reject negative returns if intentionally modeled

### Requirement: validation functions are independent and composable
Each validation function SHALL not depend on results from other validators.

#### Scenario: Combined validation in UI
- **WHEN** form submit triggers both `validateLifeEvents` and `validatePensions`
- **THEN** errors from both arrays are combined and displayed
- **AND** one validation failure does not skip the other

### Requirement: Validation accepts partial data for incremental checking
Each validation function SHALL accept partial input objects with undefined fields.

#### Scenario: Partial pension validation
- **WHEN** `validatePensions([{ currentAnnualPayout: 50000, startAge: 62 }])` is called
- **THEN** only provided fields are validated
- **AND** missing `endAge` is treated as null (valid)

### Requirement: Validation provides helpful error messages
Each error message SHALL be user-friendly and specific about the problem.

#### Scenario: Amount too large
- **WHEN** spending amount is 999999999999
- **THEN** error says: "Amount exceeds maximum allowed value"
- **AND** specifies what the maximum is (e.g., 10 million)
