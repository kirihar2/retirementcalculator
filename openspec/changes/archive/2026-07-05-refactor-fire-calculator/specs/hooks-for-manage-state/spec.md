## ADDED Requirements

### Requirement: usePensions hook manages pension CRUD operations
The `usePensions` hook SHALL provide functions for adding, updating, and removing pensions with proper typing.

#### Scenario: Add new pension
- **WHEN** user clicks "Add Pension" button
- **THEN** `addPension()` is called which creates a new pension with unique ID
- **AND** default values are used: name="New Pension", payout=0, startAge=null, endAge=null

#### Scenario: Update existing pension
- **WHEN** user edits "Current Annual Payout" from 50000 to 75000
- **THEN** `updatePension(id, { currentAnnualPayout: 75000 })` is called
- **AND** component re-renders with updated value

#### Scenario: Remove pension
- **WHEN** user clicks delete button on pension row
- **THEN** `removePension(id)` is called and pension array excludes that ID

### Requirement: useLifeEvents hook manages life event state
The `useLifeEvents` hook SHALL manage an array of `LifeEvent` objects with full CRUD operations.

#### Scenario: Add new life event
- **WHEN** user clicks "Add Life Event" button
- **THEN** `addLifeEvent()` creates event with: id=UUID, name="New Event", type='monthly', amount=1000, startAge=currentAge, endAge=currentAge+10

#### Scenario: Update life event
- **WHEN** user changes "Amount" from 2000 to 3500
- **THEN** `updateLifeEvent(id, { amount: 3500 })` is called
- **AND** description field can be updated independently

### Requirement: useDebtPayments hook manages debt payment state
The `useDebtPayments` hook SHALL manage an array of `DebtPayment` objects with full CRUD operations.

#### Scenario: Add new debt payment
- **WHEN** user clicks "Add Debt Payment" button
- **THEN** `addDebtPayment()` creates payment with: id=UUID, name="New Debt", monthlyPayment=1000, startAge=currentAge, endAge=currentAge+10

#### Scenario: Update debt payment range
- **WHEN** user changes "End Age" from 58 to 62
- **THEN** `updateDebtPayment(id, { endAge: 62 })` is called

### Requirement: useMilestones hook manages projected milestone state
The `useMilestones` hook SHALL manage an array of `ProjectedMilestone` objects with full CRUD operations.

#### Scenario: Add new milestone
- **WHEN** user clicks "Add Milestone" button
- **THEN** `addMilestone()` creates milestone with: id=UUID, age=currentAge+5, event="New Milestone", category='event', description=''

#### Scenario: Update milestone category
- **WHEN** user changes category from 'growth' to 'income'
- **THEN** `updateMilestone(id, { category: 'income' })` is called
- **AND** UI badge updates to show new category

### Requirement: useActuals hook manages annual actuals data
The `useActuals` hook SHALL manage an array of `AnnualActuals` objects for tracking past year performance.

#### Scenario: Add actual entry
- **WHEN** user clicks "Add Actual" button at age 30
- **THEN** `addActual(30)` creates entry with: age=30, portfolio=0, savings=0, spending=0

#### Scenario: Update actual entry
- **WHEN** user changes portfolio from 0 to 500000
- **THEN** `updateActual(30, { portfolio: 500000 })` is called

### Requirement: Hooks are pure functions except for state mutation
Each hook function SHALL not have side effects outside of state mutations in the parent component.

#### Scenario: Hook validation
- **WHEN** `usePensions.addPension()` is called with invalid inputs
- **THEN** it does NOT mutate any external state
- **AND** returns appropriate error or default behavior

### Requirement: Hooks accept optional cleanup functions
Each hook function MAY return a cleanup function for use in React useEffect cleanup.

#### Scenario: Cleanup on unmount
- **WHEN** component using hook unmounts
- **THEN** cleanup function (if provided) removes event listeners or stops intervals
