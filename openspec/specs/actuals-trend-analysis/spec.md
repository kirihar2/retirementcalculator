## Purpose

Analyzes trends in actual portfolio data using rolling averages, linear regression, and gap calculations to help users understand their retirement progress trajectory.

## Requirements

### Requirement: Rolling average calculation for actuals
The system SHALL calculate a rolling 3-year average of actual portfolio balance, savings, and spending to smooth out market volatility.

#### Scenario: Calculate 3-year rolling average with sufficient data
- **WHEN** user has actual data for ages 40, 41, 42, 43, 44
- **THEN** system calculates rolling average for age 44 as average of ages 42, 43, 44
- **AND** displays rolling average alongside actual values

#### Scenario: Handle insufficient data for rolling average
- **WHEN** user has only 2 years of actual data (ages 40, 41)
- **THEN** system displays simple average of available years
- **AND** shows note: "Rolling average requires 3+ years of data"

### Requirement: Trend direction detection via linear regression
The system SHALL use linear regression slope to determine if actual values are improving, declining, or stable compared to projections.

#### Scenario: Detect improving trend
- **WHEN** variance has been consistently improving over 3+ years (e.g., -5%, -2%, +3%, +8%)
- **THEN** system classifies trend as "Improving"
- **AND** displays upward trend arrow (↑)
- **AND** shows green color indicator

#### Scenario: Detect declining trend
- **WHEN** variance has been consistently declining over 3+ years (e.g., +10%, +5%, -2%, -8%)
- **THEN** system classifies trend as "Declining"
- **AND** displays downward trend arrow (↓)
- **AND** shows red color indicator

#### Scenario: Detect stable trend
- **WHEN** variance fluctuates within ±3% over 3+ years
- **THEN** system classifies trend as "Stable"
- **AND** displays horizontal arrow (→)
- **AND** shows gray color indicator

### Requirement: Catch-up gap calculation
The system SHALL calculate the absolute and percentage gap between current actual portfolio and projected portfolio at current age.

#### Scenario: Calculate catch-up gap when behind projection
- **WHEN** current actual portfolio is $300,000 at age 45
- **AND** projected portfolio at age 45 is $350,000
- **THEN** system calculates gap as -$50,000 and -14.3%
- **AND** displays "You are $50,000 behind your projection"

#### Scenario: Calculate surplus when ahead of projection
- **WHEN** current actual portfolio is $400,000 at age 45
- **AND** projected portfolio at age 45 is $350,000
- **THEN** system calculates surplus as +$50,000 and +14.3%
- **AND** displays "You are $50,000 ahead of your projection"

### Requirement: Catch-up action recommendations
The system SHALL provide actionable recommendations to close the gap when user is behind projection.

#### Scenario: Recommend increased savings to close gap
- **WHEN** user is 15% behind projection with 20 years to retirement
- **THEN** system calculates additional annual savings needed to close gap
- **AND** displays recommendation: "Increase annual savings by $X to reach projection"

#### Scenario: Recommend retirement age adjustment
- **WHEN** gap is too large to close with reasonable savings increase
- **THEN** system suggests: "Consider delaying retirement by X years to reach goal"
- **AND** shows impact of 1, 2, 3 year delays

### Requirement: Trend analysis summary display
The system SHALL provide a summary view showing overall trend status and key metrics.

#### Scenario: Display trend analysis summary
- **WHEN** user has 3+ years of actual data
- **THEN** system shows summary panel with:
  - Overall trend (Improving/Declining/Stable) with arrow
  - Average variance percentage
  - Current gap (ahead/behind)
  - Rolling 3-year average portfolio balance
- **AND** applies color coding based on trend

#### Scenario: Display insufficient data message
- **WHEN** user has < 3 years of actual data
- **THEN** system shows: "Add more years of actual data to see trend analysis"
- **AND** displays simple average variance for available years

### Requirement: Trend analysis for multiple metrics
The system SHALL calculate trend analysis separately for portfolio balance, annual savings, and annual spending.

#### Scenario: Calculate trend for portfolio balance
- **WHEN** analyzing portfolio balance trend
- **THEN** system uses portfolio balance actuals vs projections
- **AND** calculates rolling average and trend direction

#### Scenario: Calculate trend for annual savings
- **WHEN** analyzing savings trend
- **THEN** system uses annual savings actuals vs projections
- **AND** identifies if savings rate is improving or declining

#### Scenario: Calculate trend for annual spending
- **WHEN** analyzing spending trend
- **THEN** system uses annual spending actuals vs projections
- **AND** identifies if spending is above or below plan

### Requirement: Trend visualization on charts
The system SHALL optionally display trend lines on charts showing rolling averages and trend direction.

#### Scenario: Display rolling average line on PortfolioChart
- **WHEN** user has 3+ years of actual data
- **THEN** system shows rolling 3-year average as smooth line on chart
- **AND** uses distinct color from actual and projected lines
- **AND** includes in chart legend

#### Scenario: Display trend arrow in chart tooltip
- **WHEN** user hovers over actual data point on chart
- **THEN** tooltip shows: actual value, variance from projection, trend arrow
- **AND** formats as: "$220,000 (+10%, ↑ Improving)"

### Requirement: Trend analysis with inflation adjustment
The system SHALL adjust historical projections for inflation when calculating trends.

#### Scenario: Adjust historical projections for trend calculation
- **WHEN** calculating trend for years 2020-2024
- **THEN** system adjusts each year's projection for cumulative inflation from base year
- **AND** compares actual to inflation-adjusted projection
- **AND** calculates trend based on adjusted values

### Requirement: Trend analysis performance
The system SHALL calculate trend analysis without blocking UI or causing noticeable delays.

#### Scenario: Calculate trend for 20 years of data
- **WHEN** user has 20 years of actual data
- **THEN** system calculates rolling averages, regression slope, and gap within 100ms
- **AND** UI remains responsive

### Requirement: Trend analysis with gaps in data
The system SHALL handle cases where user has missing years in actual data.

#### Scenario: Calculate trend with missing years
- **WHEN** user has data for ages 40, 41, 43, 45 (missing 42, 44)
- **THEN** system calculates trend using available data points
- **AND** notes in UI: "Trend calculated with gaps in data"
- **AND** does not include missing years in rolling average

### Requirement: Year-over-year change tracking
The system SHALL track and display year-over-year change in portfolio balance, savings, and spending.

#### Scenario: Display year-over-year portfolio change
- **WHEN** portfolio grew from $200,000 at age 40 to $220,000 at age 41
- **THEN** system calculates YoY change as +$20,000 and +10%
- **AND** displays in trend analysis view

#### Scenario: Display year-over-year savings change
- **WHEN** savings increased from $15,000 to $18,000
- **THEN** system shows "+$3,000 (+20%)" for YoY savings change
- **AND** indicates improvement
