## ADDED Requirements

### Requirement: Monte Carlo simulation engine with configurable parameters
The system SHALL provide a Monte Carlo simulation engine that accepts initial portfolio value, retirement age, life expectancy, monthly withdrawal amount, expected annual return, and return volatility as inputs.

#### Scenario: Run simulation with default parameters
- **WHEN** user triggers Monte Carlo simulation with initial portfolio $500,000, retirement age 60, life expectancy 90, monthly withdrawal $4,000, expected return 7%, volatility 15%
- **THEN** system runs 1,000 simulation iterations by default
- **AND** returns array of simulation results with success probability, max portfolio value, and depletion age for each iteration

#### Scenario: Run simulation with custom iteration count
- **WHEN** user sets iteration count to 5,000 and triggers simulation
- **THEN** system runs exactly 5,000 iterations
- **AND** returns results with higher statistical confidence

### Requirement: Parametric return distribution modeling
The system SHALL generate annual returns for each simulation year using a normal distribution with configurable mean (expected return) and standard deviation (volatility).

#### Scenario: Generate returns with normal distribution
- **WHEN** simulation runs with expected return 7% and volatility 15%
- **THEN** each year's return is sampled from normal distribution with μ=0.07, σ=0.15
- **AND** returns can be negative (market downturns)

#### Scenario: Apply sequence of returns risk
- **WHEN** simulation iterates through retirement years
- **THEN** each year uses a new randomly sampled return
- **AND** portfolio value compounds based on actual sequence (not average)

### Requirement: Success probability calculation
The system SHALL calculate the percentage of simulation iterations where the portfolio survives until the user's life expectancy age.

#### Scenario: Calculate success rate
- **WHEN** 1,000 iterations complete and 850 iterations have positive portfolio balance at life expectancy age
- **THEN** system reports success probability as 85%
- **AND** displays result with confidence interval

#### Scenario: Handle edge case of all failures
- **WHEN** 0 iterations survive to life expectancy
- **THEN** system reports 0% success probability
- **AND** shows warning that plan is unsustainable

### Requirement: Portfolio depletion age tracking
The system SHALL record the age at which the portfolio reaches zero for each simulation iteration where depletion occurs.

#### Scenario: Track depletion age when portfolio runs out
- **WHEN** simulation iteration reaches year where portfolio balance < 0
- **THEN** system records depletion age as current age
- **AND** marks iteration as failed

#### Scenario: Handle iteration that survives to life expectancy
- **WHEN** simulation iteration completes with positive balance at life expectancy age
- **THEN** system records depletion age as null/undefined
- **AND** marks iteration as successful

### Requirement: Maximum portfolio value tracking
The system SHALL track the peak portfolio value reached during each simulation iteration.

#### Scenario: Track peak portfolio value
- **WHEN** simulation iteration runs through all years
- **THEN** system records the maximum portfolio balance achieved
- **AND** returns max value in simulation result

### Requirement: Monte Carlo results aggregation
The system SHALL provide utility functions to aggregate simulation results into summary statistics.

#### Scenario: Calculate average success probability
- **WHEN** user requests average success probability from simulation results
- **THEN** system returns mean of all iteration success rates
- **AND** formats as percentage with 1 decimal place

#### Scenario: Calculate best-case scenario
- **WHEN** user requests best-case success probability
- **THEN** system returns maximum success rate across all iterations
- **AND** identifies which iteration achieved it

### Requirement: Monte Carlo UI integration
The system SHALL provide a user interface to configure and run Monte Carlo simulations, displaying results in a summary view.

#### Scenario: User configures simulation parameters
- **WHEN** user opens Monte Carlo simulation panel
- **THEN** system shows inputs for initial portfolio, retirement age, life expectancy, monthly withdrawal, expected return, volatility, and iteration count
- **AND** pre-fills with current calculator values where applicable

#### Scenario: User runs simulation and views results
- **WHEN** user clicks "Run Simulation" button
- **THEN** system displays progress indicator during computation
- **AND** shows summary: success probability (with confidence interval), average max portfolio value, median depletion age (for failed iterations)

#### Scenario: Handle insufficient data
- **WHEN** user attempts simulation with missing required inputs
- **THEN** system disables "Run Simulation" button
- **AND** shows validation error messages for missing fields

### Requirement: Monte Carlo performance optimization
The system SHALL execute Monte Carlo simulations without blocking the UI thread for extended periods.

#### Scenario: Run 1,000 iterations without UI freeze
- **WHEN** user runs simulation with 1,000 iterations
- **THEN** UI remains responsive during computation
- **AND** completes within 5 seconds on modern hardware

#### Scenario: Run 10,000 iterations with progress feedback
- **WHEN** user runs simulation with 10,000 iterations
- **THEN** system shows progress indicator (e.g., "Running iteration 5,000 of 10,000...")
- **AND** UI remains responsive
- **AND** completes within 30 seconds

### Requirement: Monte Carlo result caching
The system SHALL cache simulation results based on input parameters to avoid redundant computation.

#### Scenario: Cache results for unchanged inputs
- **WHEN** user runs simulation, then runs again with identical inputs
- **THEN** system returns cached results immediately
- **AND** does not re-run simulation

#### Scenario: Invalidate cache on input change
- **WHEN** user modifies any simulation input parameter
- **THEN** system clears cached results
- **AND** requires re-running simulation to get updated results
