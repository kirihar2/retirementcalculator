## Why

The retirement calculator currently projects portfolio growth and FIRE targets but lacks tax-awareness. Users cannot see the real after-tax impact of withdrawals, Required Minimum Distributions (RMDs), or optimization strategies like Roth conversions. This limits the tool's usefulness for actual retirement planning where taxes are a major expense.

## What Changes

- **Account type tracking**: Users input portfolio balances by account type (Traditional 401k/IRA, Roth 401k/IRA, Taxable brokerage, HSA). Later Plaid integration will auto-populate these.
- **Tax configuration**: Users specify filing status (single/married filing jointly) and state tax rate. Tax brackets are hardcoded per deployment year (2026) and updated via new deployments.
- **Tax engine**: Calculates federal income tax, capital gains tax (0%/15%/20%), and state tax on withdrawals. Distinguishes between ordinary income and preferential capital gains rates.
- **RMD calculator**: Computes Required Minimum Distributions starting at age 73 (75 after 2032) using IRS Uniform Lifetime Table, applied to Traditional account balances only.
- **Tax impact projections**: Shows year-by-year tax burden, effective tax rate, and after-tax retirement income.
- **Optimization strategies**: Roth conversion ladder modeling (fill low tax brackets before RMD age), asset location recommendations.

## Capabilities

### New Capabilities
- `account-type-tracking`: Portfolio breakdown by tax treatment (Traditional, Roth, Taxable, HSA) with user input and future Plaid integration
- `tax-engine`: Federal and state tax calculation with filing status, brackets, capital gains rates, and year-specific configuration
- `rmd-calculator`: Required Minimum Distribution calculations using IRS life expectancy tables with tax impact modeling
- `tax-optimization`: Roth conversion strategies, asset location recommendations, and tax-efficient withdrawal sequencing

### Modified Capabilities
- `user-data-api`: Plan data structure extended to include account type breakdowns and tax configuration
- `withdrawal-strategies-comparison`: Withdrawal strategies now account for tax impact and RMD requirements

## Impact

- **Data model**: `Plan` type extended with `accounts` object (Traditional/Roth/Taxable/HSA balances) and `taxConfig` (filing status, state rate, tax year)
- **UI**: New input sections for account breakdown and tax settings; new analysis tabs for tax projections, RMD schedule, and optimization strategies
- **Calculation engine**: Projection logic updated to model taxes on withdrawals, RMDs after age 73, and after-tax income
- **Persistence**: localStorage and Firestore schema extended to store account types and tax configuration
- **Future integration**: Architecture designed to accept Plaid account data in place of manual inputs
