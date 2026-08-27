## 1. Data Model Extensions

- [x] 1.1 Add `AccountBalances` interface to `types.ts` with fields: `traditionalBalance`, `rothBalance`, `taxableBalance`, `hsaBalance`
- [x] 1.2 Add `TaxConfig` interface to `types.ts` with fields: `filingStatus` ('single' | 'mfj'), `stateTaxRate` (number), `taxYear` (number)
- [x] 1.3 Extend `Plan` interface in `types/plan.ts` to include `accounts: AccountBalances` and `taxConfig: TaxConfig`
- [x] 1.4 Update `InputState` interface to include account balances and tax configuration fields
- [x] 1.5 Update backend `types.go` Plan struct to include `Accounts` and `TaxConfig` fields

## 2. Tax Configuration Module

- [x] 2.1 Create `src/utils/taxConfig.ts` with 2026 federal tax brackets for Single and MFJ filing statuses
- [x] 2.2 Add 2026 long-term capital gains tax brackets (0%, 15%, 20%) for Single and MFJ to `taxConfig.ts`
- [x] 2.3 Add IRS Uniform Lifetime Table (age 73-115+) to `taxConfig.ts` as a lookup array
- [x] 2.4 Export `getTaxBrackets(filingStatus)` and `getCapitalGainsBrackets(filingStatus)` functions
- [x] 2.5 Export `getRMDivisor(age)` function that returns the Uniform Lifetime Table divisor

## 3. Tax Engine Implementation

- [x] 3.1 Create `src/utils/taxEngine.ts` with `calculateFederalIncomeTax(ordinaryIncome, filingStatus)` function
- [x] 3.2 Implement `calculateCapitalGainsTax(gains, totalTaxableIncome, filingStatus)` function
- [x] 3.3 Implement `calculateStateTax(taxableWithdrawals, stateTaxRate)` function
- [x] 3.4 Implement `calculateTotalTax(ordinaryIncome, capitalGains, stateTaxRate, filingStatus)` function that returns breakdown
- [ ] 3.5 Write unit tests for tax engine covering Single and MFJ scenarios at various income levels

## 4. RMD Calculator Implementation

- [x] 4.1 Create `src/utils/rmdCalculator.ts` with `calculateRMD(age, traditionalBalance)` function
- [x] 4.2 Implement RMD age threshold logic (73 for born before 1960, 75 for born 1960+)
- [x] 4.3 Implement `isSubjectToRMD(birthYear, currentYear)` function to determine if user must take RMD
- [ ] 4.4 Write unit tests for RMD calculator covering edge cases (age 72, 73, 74, 75+)

## 5. Account Type UI Components

- [x] 5.1 Create `src/components/inputs/AccountBreakdown.tsx` with four input fields for account types
- [x] 5.2 Display total portfolio as sum of all account types
- [x] 5.3 Wire `AccountBreakdown` to `InputState.accounts` with change handlers
- [x] 5.4 Add `AccountBreakdown` component to `InputsDrawer.tsx` in a new "Account Breakdown" accordion

## 6. Tax Configuration UI Components

- [x] 6.1 Create `src/components/inputs/TaxSettings.tsx` with filing status radio buttons and state tax rate input
- [x] 6.2 Wire `TaxSettings` to `InputState.taxConfig` with change handlers
- [x] 6.3 Add `TaxSettings` component to `InputsDrawer.tsx` in a new "Tax Settings" accordion
- [x] 6.4 Ensure state tax rate persists to localStorage via existing persistence hooks

## 7. Projection Engine Updates

- [x] 7.1 Update `calculateProjection` in `utils/calculations.ts` to accept `AccountBalances` instead of single portfolio balance
- [x] 7.2 Modify projection logic to track each account type separately through retirement years
- [x] 7.3 Add RMD calculation to projection loop for years when user is age 73+
- [x] 7.4 Add tax calculation to projection loop using `calculateTotalTax` for each year
- [x] 7.5 Update projection output to include after-tax income and tax breakdown by year

## 8. Tax Projection UI

- [x] 8.1 Create `src/components/analysis/TaxProjectionTable.tsx` displaying year-by-year tax breakdown
- [x] 8.2 Display columns: Year, Age, Gross Withdrawal, Federal Tax, State Tax, Capital Gains Tax, Net Income, Effective Tax Rate
- [x] 8.3 Add "Tax Projections" tab to `AnalysisTabs.tsx` rendering `TaxProjectionTable`

## 9. RMD Schedule UI

- [x] 9.1 Create `src/components/analysis/RMDScheduleTable.tsx` displaying RMD amounts by year
- [x] 9.2 Display columns: Year, Age, RMD Amount, Traditional Balance After RMD
- [x] 9.3 Add "RMD Schedule" tab to `AnalysisTabs.tsx` rendering `RMDScheduleTable`

## 10. Tax Optimization UI

- [x] 10.1 Create `src/components/inputs/RothConversionInput.tsx` with yearly Roth conversion amount inputs
- [x] 10.2 Implement Roth conversion tax cost calculation (additional tax on converted amount)
- [x] 10.3 Display comparison: "Without Roth Conversion" vs "With Roth Conversion" effective tax rates
- [x] 10.4 Add "Tax Optimization" tab to `AnalysisTabs.tsx` with Roth conversion modeling

## 11. Withdrawal Strategy Updates

- [x] 11.1 Update withdrawal strategy calculations to use after-tax income instead of gross
- [x] 11.2 Add RMD enforcement: ensure strategies withdraw at least RMD from Traditional accounts
- [x] 11.3 Display both gross and after-tax income in withdrawal strategy comparison table

## 12. Persistence and Cloud Sync

- [x] 12.1 Update `aggregateLocalPlan` in `services/userData.ts` to include `accounts` and `taxConfig`
- [x] 12.2 Update `applyRemotePlan` to restore `accounts` and `taxConfig` from Firestore
- [x] 12.3 Update `isEmptyPlan` to check account balances and tax config
- [x] 12.4 Verify backward compatibility: old plans without accounts load with full balance as Traditional

## 13. Integration Testing

- [x] 13.1 Test end-to-end flow: enter account balances, configure tax settings, view tax projections
- [x] 13.2 Test RMD calculations at various ages (72, 73, 75) with mixed account types
- [x] 13.3 Test Roth conversion modeling: enter conversions, verify tax cost and future RMD reduction
- [x] 13.4 Test cloud sync: save plan with accounts/tax config, reload on another device

## 14. Documentation and Polish

- [x] 14.1 Add tooltips explaining account types and tax implications
- [x] 14.2 Add help text for Roth conversion strategy
- [x] 14.3 Update onboarding walkthrough to mention new tax features
- [x] 14.4 Add "Tax Year: 2026" label to tax settings to clarify brackets are hardcoded
