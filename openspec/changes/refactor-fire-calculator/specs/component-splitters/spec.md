## ADDED Requirements

### Requirement: InputPanel uses controlled children pattern
The `InputPanel` component SHALL accept a single `child` prop that determines which internal section renders, replacing the 35+ individual props.

#### Scenario: Personal details rendering
- **WHEN** `child === 'personal-details'`
- **THEN** `InputPanel` renders `PersonalDetailsControlled`, `FinancialDetailsControlled`, `RetirementPlanControlled` components

#### Scenario: Pensions rendering
- **WHEN** `child === 'pensions'`
- **THEN** `InputPanel` renders `PensionsControlled` component with stateless props passed via parent context

#### Scenario: Life events rendering  
- **WHEN** `child === 'life-events'`
- **THEN** `InputPanel` renders `LifeEventsControlled` component

### Requirement: Each input section is a controlled component
Each internal component (`PersonalDetailsControlled`, `FinancialDetailsControlled`, etc.) SHALL:
- Accept state as read-only props (e.g., `currentAge: number`)
- Accept update callback as prop (e.g., `onCurrentAgeChange: (age: number) => void`)
- Have no internal state except form-local UI state (expanded/collapsed sections)

#### Scenario: Personal details component updates age
- **WHEN** user changes "Current Age" input from 32 to 35
- **THEN** `onCurrentAgeChange` callback is invoked with value 35
- **AND** component does not internally mutate `currentAge` state

### Requirement: InputPanel accepts child configuration map
The `InputPanel` SHALL accept an optional `childrenConfig` prop that maps child names to their enabled states.

#### Scenario: Selective section rendering
- **WHEN** `childrenConfig === { 'personal-details': true, 'financial-details': false }`
- **THEN** `InputPanel` renders only the personal details sections
- **AND** renders "Financial Details" divider as placeholder if `child` prop specifies it

### Requirement: Component separation follows single responsibility
Each component SHALL implement exactly one UI concern:
- `PersonalDetailsControlled`: Only personal details (age, retirement age, life expectancy)
- `FinancialDetailsControlled`: Only current finances (portfolio, income, spending)
- `RetirementPlanControlled`: Only retirement plan fields (SS, withdrawal rate)
- `HealthCareControlled`: Only health care before Medicare
- `ReturnsAndInflationControlled`: Only return rates and inflation

#### Scenario: Component receives only related props
- **WHEN** `PersonalDetailsControlled` is rendered
- **THEN** it only accepts props for age fields
- **AND** it does not accept financial or retirement plan props
