## Purpose

Compares multiple retirement withdrawal strategies (Classic 4%, Bogleheads, Bucket, Dynamic) side-by-side to help users choose the optimal approach for their situation.

## Requirements

### Requirement: Classic 4% withdrawal strategy implementation
The system SHALL implement the Classic 4% Rule strategy that withdraws 4% of the FIRE portfolio target annually, adjusted for inflation each year.

#### Scenario: Calculate first-year withdrawal
- **WHEN** FIRE target is $1,000,000
- **THEN** first-year withdrawal is $40,000 (4% of target)

#### Scenario: Adjust withdrawal for inflation
- **WHEN** first-year withdrawal is $40,000 and inflation rate is 3%
- **THEN** second-year withdrawal is $41,200 (4% target × 1.03)
- **AND** each subsequent year increases by inflation rate

### Requirement: Bogleheads Fixed + Variable withdrawal strategy implementation
The system SHALL implement the Bogleheads strategy that starts with 3% withdrawal rate and adjusts annually based on portfolio performance.

#### Scenario: Calculate initial withdrawal
- **WHEN** FIRE target is $1,000,000
- **THEN** first-year withdrawal is $30,000 (3% of target)

#### Scenario: Adjust withdrawal based on portfolio return
- **WHEN** portfolio grew 10% last year and inflation was 3%
- **THEN** next year's withdrawal increases by min(10%, 5%) - 3% = 2% adjustment
- **AND** withdrawal never decreases below prior year's amount

#### Scenario: Cap maximum annual increase
- **WHEN** portfolio grew 20% last year
- **THEN** withdrawal increase is capped at 5% maximum
- **AND** withdrawal does not increase by full portfolio return

### Requirement: Bucket Strategy (3-5-10) implementation
The system SHALL implement the Bucket Strategy that divides portfolio into three buckets: cash (years 1-3), intermediate bonds (years 4-10), and growth assets (year 11+).

#### Scenario: Allocate portfolio into buckets
- **WHEN** total portfolio is $1,000,000 and annual withdrawal is $40,000
- **THEN** cash bucket holds $120,000 (3 years of withdrawals)
- **AND** intermediate bucket holds $280,000 (7 years of withdrawals)
- **AND** growth bucket holds $600,000 (remaining)

#### Scenario: Withdraw from cash bucket first
- **WHEN** year 1 withdrawal is needed
- **THEN** system withdraws $40,000 from cash bucket
- **AND** at end of year 3, rebalances from intermediate bucket

#### Scenario: Rebalance buckets periodically
- **WHEN** cash bucket falls below 2 years of withdrawals
- **THEN** system transfers from intermediate bucket to refill cash to 3 years
- **AND** intermediate bucket refills from growth bucket as needed

### Requirement: Dynamic withdrawal rate implementation
The system SHALL implement the Dynamic Rate strategy that adjusts withdrawal based on portfolio performance relative to expectations.

#### Scenario: Calculate initial withdrawal
- **WHEN** FIRE target is $1,000,000
- **THEN** first-year withdrawal is $30,000 (3% of target)

#### Scenario: Increase withdrawal after positive year
- **WHEN** portfolio return exceeds inflation rate
- **THEN** next year's withdrawal increases by full inflation rate
- **AND** can optionally increase by portion of excess return

#### Scenario: Decrease withdrawal after negative year
- **WHEN** portfolio return is negative or below inflation
- **THEN** next year's withdrawal decreases by 0.5%
- **AND** withdrawal floor is 2.5% of original target

### Requirement: Strategy comparison calculation engine
The system SHALL provide a utility function that compares all withdrawal strategies by projecting portfolio values at key ages (80, 90, 100) and identifying depletion age.

#### Scenario: Compare strategies at key ages
- **WHEN** user requests strategy comparison for $1,000,000 FIRE target
- **THEN** system calculates portfolio value at ages 80, 90, and 100 for each strategy
- **AND** returns array of comparison results with strategy name and values

#### Scenario: Identify depletion age
- **WHEN** strategy causes portfolio to reach zero before age 100
- **THEN** system records depletion age (e.g., "depleted at age 87")
- **AND** shows null/undefined for ages where strategy survives

### Requirement: Withdrawal strategy comparison UI
The system SHALL provide a comparison table showing all strategies side-by-side with portfolio values at key ages, depletion age, and strategy descriptions.

#### Scenario: Display comparison table
- **WHEN** user opens withdrawal strategy comparison view
- **THEN** system shows table with columns: Strategy Name, Description, Portfolio at Age 80, Portfolio at Age 90, Portfolio at Age 100, Depletion Age
- **AND** rows for each strategy (Classic 4%, Bogleheads, Bucket, Dynamic)

#### Scenario: Highlight best-performing strategy
- **WHEN** comparison table is displayed
- **THEN** system highlights the strategy with latest depletion age (or highest portfolio at age 100 if none deplete)
- **AND** marks it as "Recommended" or "Best Outcome"

#### Scenario: Show strategy descriptions
- **WHEN** user views comparison table
- **THEN** each strategy row includes brief description of approach
- **AND** explains key parameters (e.g., "Withdraw 4% annually, adjusted for inflation")

### Requirement: Strategy selection integration
The system SHALL allow users to select a withdrawal strategy from the comparison view and apply it to their retirement plan.

#### Scenario: Select strategy from comparison
- **WHEN** user clicks on a strategy in comparison table
- **THEN** system applies that strategy's withdrawal rate and adjustment rules
- **AND** updates projection calculations to use selected strategy

#### Scenario: Persist strategy selection
- **WHEN** user selects a withdrawal strategy
- **THEN** system saves selection to localStorage
- **AND** restores selection on next page load

### Requirement: Withdrawal strategy custom parameters
The system SHALL allow users to customize key parameters for each withdrawal strategy (e.g., initial withdrawal rate, adjustment caps).

#### Scenario: Customize Classic 4% rate
- **WHEN** user changes Classic 4% withdrawal rate from 4% to 3.5%
- **THEN** system recalculates using 3.5% as base rate
- **AND** updates comparison table with new values

#### Scenario: Customize Bogleheads cap
- **WHEN** user changes Bogleheads maximum annual increase from 5% to 7%
- **THEN** system allows withdrawal to increase by up to 7% in good years
- **AND** updates comparison table with new values

### Requirement: Withdrawal strategy validation
The system SHALL validate withdrawal strategy parameters to prevent unrealistic or dangerous configurations.

#### Scenario: Prevent excessively high withdrawal rate
- **WHEN** user attempts to set withdrawal rate above 6%
- **THEN** system shows warning: "High withdrawal rates may deplete portfolio early"
- **AND** allows override but requires confirmation

#### Scenario: Prevent negative withdrawal rate
- **WHEN** user attempts to set withdrawal rate below 0%
- **THEN** system rejects input
- **AND** shows validation error: "Withdrawal rate must be positive"
