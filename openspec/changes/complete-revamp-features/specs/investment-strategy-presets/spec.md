## ADDED Requirements

### Requirement: Conservative strategy preset definition
The system SHALL provide a Conservative strategy preset with 40% US stocks and 60% bonds allocation, targeting 5-6% expected return.

#### Scenario: Apply Conservative preset
- **WHEN** user selects "Conservative" strategy preset
- **THEN** system sets stock allocation to 40%
- **AND** sets bond allocation to 60%
- **AND** sets expected return to 5.5% (midpoint of 5-6% range)

#### Scenario: Display Conservative preset description
- **WHEN** user views strategy presets
- **THEN** Conservative preset shows description: "40% US Stocks / 60% Bonds - Lower risk, ~5-6% expected return"

### Requirement: Moderate strategy preset definition
The system SHALL provide a Moderate strategy preset with 70% US stocks and 30% bonds allocation, targeting 7% expected return.

#### Scenario: Apply Moderate preset
- **WHEN** user selects "Moderate" strategy preset
- **THEN** system sets stock allocation to 70%
- **AND** sets bond allocation to 30%
- **AND** sets expected return to 7%

#### Scenario: Display Moderate preset description
- **WHEN** user views strategy presets
- **THEN** Moderate preset shows description: "70% US Stocks / 30% Bonds - Balanced risk, ~7% expected return"

### Requirement: Aggressive strategy preset definition
The system SHALL provide an Aggressive strategy preset with 85% US stocks and 15% bonds allocation, targeting 8-9% expected return.

#### Scenario: Apply Aggressive preset
- **WHEN** user selects "Aggressive" strategy preset
- **THEN** system sets stock allocation to 85%
- **AND** sets bond allocation to 15%
- **AND** sets expected return to 8.5% (midpoint of 8-9% range)

#### Scenario: Display Aggressive preset description
- **WHEN** user views strategy presets
- **THEN** Aggressive preset shows description: "85% US Stocks / 15% Bonds - Higher growth potential, ~8-9% return"

### Requirement: Strategy preset UI component
The system SHALL provide a StrategySelector component displaying all preset options as clickable buttons with visual indication of currently selected preset.

#### Scenario: Display strategy preset buttons
- **WHEN** user views strategy selector
- **THEN** system shows three buttons: Conservative, Moderate, Aggressive
- **AND** each button displays strategy name and description

#### Scenario: Highlight selected preset
- **WHEN** user has selected "Moderate" preset
- **THEN** Moderate button shows as "contained" (filled) style
- **AND** other buttons show as "outlined" style

#### Scenario: Show tip text
- **WHEN** user views strategy selector
- **THEN** system displays tip: "Tip: Choose a strategy for quick allocation, then customize as needed. The expected return is calculated based on historical averages."

### Requirement: Strategy preset integration with calculator inputs
The system SHALL apply selected preset values to the calculator's existing allocation and return rate inputs.

#### Scenario: Preset updates allocation inputs
- **WHEN** user selects "Conservative" preset
- **THEN** calculator's stock allocation input updates to 40%
- **AND** bond allocation input updates to 60%
- **AND** projection recalculates with new allocation

#### Scenario: Preset updates expected return
- **WHEN** user selects "Aggressive" preset
- **THEN** calculator's expected return input updates to 8.5%
- **AND** projection recalculates with new return rate

#### Scenario: Allow customization after preset selection
- **WHEN** user selects "Moderate" preset, then manually changes stock allocation to 75%
- **THEN** system accepts manual override
- **AND** does not revert to preset value
- **AND** visually indicates preset is no longer active (optional)

### Requirement: Strategy preset persistence
The system SHALL persist the selected strategy preset to localStorage and restore on page load.

#### Scenario: Save preset selection
- **WHEN** user selects "Aggressive" preset
- **THEN** system saves selection to localStorage under key 'fire_strategy_preset'
- **AND** value stored is 'aggressive'

#### Scenario: Restore preset on load
- **WHEN** page loads and localStorage contains 'fire_strategy_preset' = 'moderate'
- **THEN** system restores Moderate preset
- **AND** applies preset values to inputs
- **AND** highlights Moderate button as selected

#### Scenario: Handle missing preset in localStorage
- **WHEN** page loads and no preset is saved
- **THEN** system defaults to "Moderate" preset
- **AND** applies Moderate values to inputs

### Requirement: Strategy preset custom expected return calculation
The system SHALL calculate expected return based on stock/bond allocation using historical averages when user customizes allocation.

#### Scenario: Calculate expected return for custom allocation
- **WHEN** user sets stock allocation to 60% and bond allocation to 40%
- **THEN** system calculates expected return as weighted average: (60% × 9%) + (40% × 3%) = 6.6%
- **AND** updates expected return input to 6.6%

#### Scenario: Use historical averages for calculation
- **WHEN** calculating expected return from allocation
- **THEN** system uses 9% average for stocks (historical US market average)
- **AND** uses 3% average for bonds (historical US bond average)

### Requirement: Strategy preset validation
The system SHALL validate that allocation percentages sum to 100% and expected return is within reasonable bounds.

#### Scenario: Validate allocation sums to 100%
- **WHEN** user sets stock allocation to 70% and bond allocation to 40%
- **THEN** system shows validation error: "Allocations must sum to 100%"
- **AND** prevents saving until corrected

#### Scenario: Warn on unrealistic expected return
- **WHEN** expected return is set above 12% or below 2%
- **THEN** system shows warning: "Expected return is outside historical range"
- **AND** allows override but requires confirmation
