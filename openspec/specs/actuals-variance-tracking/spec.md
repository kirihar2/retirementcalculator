## Purpose

Tracks and visualizes the variance between projected and actual portfolio values, savings, and spending to help users monitor deviation from their retirement plan.

## Requirements

### Requirement: Portfolio balance variance calculation
The system SHALL calculate the variance between projected and actual portfolio balance for each year where actual data exists.

#### Scenario: Calculate absolute variance
- **WHEN** projected balance for age 45 is $200,000 and actual balance is $220,000
- **THEN** system calculates absolute variance as +$20,000
- **AND** stores variance for display

#### Scenario: Calculate percentage variance
- **WHEN** projected balance is $200,000 and actual is $220,000
- **THEN** system calculates percentage variance as +10% (($220k - $200k) / $200k × 100)
- **AND** formats as "+10.0%"

#### Scenario: Handle negative variance
- **WHEN** projected balance is $200,000 and actual is $180,000
- **THEN** system calculates variance as -$20,000 and -10%
- **AND** formats as "-10.0%"

### Requirement: Savings variance calculation
The system SHALL calculate variance between projected and actual annual savings for each year with actual data.

#### Scenario: Calculate savings variance
- **WHEN** projected annual savings is $20,000 and actual savings is $25,000
- **THEN** system calculates variance as +$5,000 and +25%
- **AND** displays in savings column

### Requirement: Spending variance calculation
The system SHALL calculate variance between projected and actual annual spending for each year with actual data.

#### Scenario: Calculate spending variance
- **WHEN** projected annual spending is $40,000 and actual spending is $38,000
- **THEN** system calculates variance as -$2,000 and -5%
- **AND** displays negative sign to indicate underspend (positive outcome)

### Requirement: Variance visualization in ProjectionTable
The system SHALL display variance indicators in the ProjectionTable with color coding and directional arrows.

#### Scenario: Display positive portfolio variance
- **WHEN** portfolio variance is +10% (ahead of projection)
- **THEN** system displays "+10.0%" in green color
- **AND** shows upward arrow icon (↑)
- **AND** applies light green background to cell

#### Scenario: Display negative portfolio variance
- **WHEN** portfolio variance is -5% (behind projection)
- **THEN** system displays "-5.0%" in red color
- **AND** shows downward arrow icon (↓)
- **AND** applies light red background to cell

#### Scenario: Display zero variance
- **WHEN** variance is 0% (exactly on projection)
- **THEN** system displays "0.0%" in gray color
- **AND** shows no arrow
- **AND** applies neutral background

### Requirement: Variance visualization in PortfolioChart
The system SHALL optionally display a variance line on the PortfolioChart showing projected vs actual divergence over time.

#### Scenario: Display variance line on chart
- **WHEN** user has at least 1 year of actual data
- **THEN** system shows "Variance" line on chart
- **AND** line represents percentage difference between projected and actual
- **AND** uses distinct color (e.g., purple) and dashed style

#### Scenario: Variance line at zero baseline
- **WHEN** variance is 0%
- **THEN** variance line aligns with zero baseline
- **AND** positive variance shows above baseline
- **AND** negative variance shows below baseline

### Requirement: Cumulative variance tracking
The system SHALL track cumulative variance across all years to show overall progress against plan.

#### Scenario: Calculate cumulative portfolio variance
- **WHEN** user has 5 years of actual data
- **THEN** system calculates average percentage variance across all years
- **AND** displays as "Average Variance: +8.5%"
- **AND** shows trend (improving/declining) if applicable

### Requirement: Variance indicators for missing data
The system SHALL handle cases where actual data is not available for certain years.

#### Scenario: Display N/A for missing actuals
- **WHEN** projection exists for age 50 but no actual data
- **THEN** system displays "N/A" in variance column
- **AND** applies gray background
- **AND** does not include in cumulative calculation

#### Scenario: Prompt user to add actuals
- **WHEN** user has no actual data entered
- **THEN** system shows message: "Add actuals to track variance against projections"
- **AND** provides link to add actuals section

### Requirement: Variance color coding consistency
The system SHALL use consistent color coding for variance across all views (table, chart, summary).

#### Scenario: Apply consistent color scheme
- **WHEN** variance is positive (ahead of plan)
- **THEN** system uses green color (#4caf50 or similar) across all views
- **AND** when negative, uses red color (#f44336 or similar)
- **AND** when zero/neutral, uses gray (#9e9e9e)

### Requirement: Variance tracking with inflation adjustment
The system SHALL adjust projected values for inflation when comparing to actual values in historical years.

#### Scenario: Compare inflation-adjusted projection to actual
- **WHEN** comparing actual balance from 2 years ago to projection
- **THEN** system adjusts projected value for 2 years of inflation
- **AND** compares actual to inflation-adjusted projection
- **AND** calculates variance based on adjusted values

### Requirement: Variance tracking performance
The system SHALL calculate and display variance indicators without noticeable performance degradation.

#### Scenario: Calculate variance for 20 years of data
- **WHEN** user has 20 years of actual data
- **THEN** system calculates all variance indicators within 100ms
- **AND** UI remains responsive during calculation

### Requirement: Variance tracking with multiple actuals entries
The system SHALL correctly calculate variance when user has multiple years of actual data entered over time.

#### Scenario: Calculate variance across multiple years
- **WHEN** user has actual data for ages 40, 41, 42, 43, 44
- **THEN** system calculates variance for each year independently
- **AND** displays variance in corresponding row for each year
- **AND** calculates cumulative average across all 5 years
