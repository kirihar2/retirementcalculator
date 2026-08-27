## Context

The retirement calculator currently models portfolio growth with pre-tax projections but lacks awareness of tax implications. Users cannot see:
- How much of their withdrawals will go to taxes
- When RMDs kick in and their tax impact
- Optimization strategies like Roth conversions

The existing data model treats the portfolio as a single balance without distinguishing account types. Tax configuration is absent.

## Goals / Non-Goals

**Goals:**
- Track portfolio by account type (Traditional, Roth, Taxable, HSA)
- Calculate federal and state taxes on retirement withdrawals
- Model RMDs starting at age 73 (75 after 2032) using IRS life expectancy tables
- Show year-by-year tax burden and after-tax income
- Support Roth conversion strategy modeling
- Design for future Plaid integration to auto-populate account balances

**Non-Goals:**
- Complex tax scenarios (AMT, state-specific deductions, multi-state residency)
- Automatic tax-loss harvesting or rebalancing recommendations
- Real-time tax law updates (brackets hardcoded per deployment year)
- Integration with tax preparation software

## Decisions

### 1. Account Type Model

**Decision**: Split portfolio into four account categories with distinct tax treatment:
- `traditionalBalance`: Pre-tax 401k/IRA (taxed on withdrawal)
- `rothBalance`: Post-tax Roth 401k/IRA (tax-free withdrawal)
- `taxableBalance`: Brokerage (capital gains tax on appreciation)
- `hsaBalance`: Health Savings Account (tax-free for medical, taxed otherwise)

**Rationale**: This matches how the IRS treats these accounts and aligns with how users think about their retirement savings. Four categories cover >95% of retirement accounts.

**Alternative considered**: Single "tax-deferred" vs "tax-free" split. Rejected because taxable brokerage accounts have different tax treatment (capital gains vs ordinary income) and users need to track all three.

### 2. Tax Configuration Approach

**Decision**: Tax brackets hardcoded in a `taxConfig.ts` file per deployment year. Users input filing status (single/MFJ) and state tax rate. Tax year is implicit (the deployment's target year).

**Rationale**: 
- Simple for users (no tax year selection)
- Easy to update (new deployment for new tax year)
- Avoids complexity of historical tax rates

**Alternative considered**: Configurable tax year with historical bracket database. Rejected as over-engineered; users plan for current/future tax environment, not historical analysis.

### 3. RMD Calculation

**Decision**: Use IRS Uniform Lifetime Table (Publication 590-B) for RMD calculations. Apply only to `traditionalBalance`. Start at age 73 (75 for those born after 1959, effective 2033).

**Rationale**: Standard approach used by all retirement calculators. Uniform Lifetime Table is the default for most retirees (exceptions: spouse is sole beneficiary, which is rare).

**Alternative considered**: Allow users to select from multiple IRS tables (Uniform, Joint Life, Single). Rejected as too complex; 95%+ of users use Uniform Lifetime.

### 4. Tax Engine Architecture

**Decision**: Build a pure function `calculateTaxes(income, config) => { federal, state, capitalGains, total }` that takes taxable income and returns tax breakdown. Called for each projection year with:
- RMD amounts (ordinary income)
- Withdrawals from Traditional accounts (ordinary income)
- Withdrawals from Taxable accounts (capital gains on appreciation)
- Social Security income (partially taxable based on provisional income)

**Rationale**: Pure function is testable, composable, and easy to extend. Separating tax calculation from projection logic keeps concerns isolated.

**Alternative considered**: Integrate tax calculation into the main projection loop. Rejected because it would make the projection logic harder to test and modify.

### 5. Roth Conversion Strategy

**Decision**: Model Roth conversions as an optional strategy that converts Traditional → Roth in years before RMD age (73) to fill low tax brackets. Show the tax cost now vs tax savings later.

**Rationale**: Roth conversion ladder is the most common tax optimization strategy for retirees. Modeling it helps users make informed decisions about early retirement years.

**Alternative considered**: Automatic optimization to find the "best" conversion strategy. Rejected as too complex; users should explore scenarios manually.

### 6. Plaid Integration Architecture

**Decision**: Design account inputs to accept either manual entry or Plaid data. The `AccountBalances` interface has optional fields: `manual` (user input) and `plaid` (from API). UI shows whichever is available, preferring Plaid.

**Rationale**: Allows gradual migration from manual input to automated data without breaking existing functionality.

**Alternative considered**: Build Plaid integration first, then add manual fallback. Rejected because Plaid requires backend infrastructure and business agreements; manual input is needed for launch.

## Risks / Trade-offs

**[Risk] Tax law changes require manual updates** → Mitigation: Clear documentation on which file to update; CI/CD pipeline for easy deployments.

**[Risk] RMD rules may change (SECURE 3.0)** → Mitigation: Age threshold configurable in tax config file; abstract RMD calculation to isolate changes.

**[Risk] State tax rates vary widely and change frequently** → Mitigation: User-provided rate (not a lookup table); clearly labeled as user responsibility.

**[Trade-off] Hardcoded tax year vs flexible** → Chose simplicity over flexibility. Users can update to new deployment for new tax year.

**[Trade-off] Four account types vs more granular** → Chose 80/20 solution. Edge cases (529 plans, ESPP, etc.) deferred to future iterations.

## Migration Plan

1. **Phase 1**: Add account type fields to data model (default all to current portfolio balance)
2. **Phase 2**: Add tax configuration UI (filing status, state rate)
3. **Phase 3**: Implement tax engine and RMD calculator
4. **Phase 4**: Add tax projection UI tabs
5. **Phase 5**: Add Roth conversion strategy modeling
6. **Phase 6**: (Future) Plaid integration

**Rollback**: No data migration needed; new fields are additive. Existing users see their full portfolio in `traditionalBalance` by default.
