## 1. Export Current Test Data to Fixture

- [x] 1.1 Create `test-data/` directory at repo root
- [x] 1.2 Create `test-data/sample-plan.json` containing all current hardcoded defaults from FIRECalculator.tsx (ages, portfolio, income, spending, returns, SS, healthcare, coasting mode, strategy preset, withdrawal strategy)
- [x] 1.3 Add the default pension entries (if any) to the fixture in the Plan wire format
- [x] 1.4 Add the default life event entries (daycare, college, travel, etc.) to the fixture
- [x] 1.5 Add the default debt payment entries (mortgage, auto, student loans) to the fixture
- [x] 1.6 Verify the fixture can be loaded via the existing import feature

## 2. Clear Hardcoded Defaults (Clean Slate)

- [x] 2.1 Update FIRECalculator.tsx initialState: all numeric inputs to 0 (currentAge, retirementAge, lifeExpectancy, currentPortfolio, monthlyIncome, monthlySpending, retirementSpending, preRetirementReturn, coastingReturn, retirementReturn, inflationRate, socialSecurityAge, socialSecurityIncome, safeWithdrawalRate, medicareAge, healthCareMonthly)
- [x] 2.2 Update pension initialization: default to empty array `[]` instead of hardcoded sample pensions
- [x] 2.3 Update life events initialization: default to empty array `[]` instead of 8 hardcoded events
- [x] 2.4 Update debt payments initialization: default to empty array `[]` instead of 3 hardcoded debts
- [x] 2.5 Update milestones initialization: default to empty array `[]`
- [x] 2.6 Update actuals initialization: default to empty array `[]`
- [x] 2.7 Update coasting mode defaults: `{ enabled: false, coastingAge: 0, coasingMultiplier: 1 }`
- [x] 2.8 Update strategy preset default to empty string `''`
- [x] 2.9 Update withdrawal strategy default to empty string `''`
- [x] 2.10 Update variable inflation rates default to empty array `[]`

## 3. Guard Empty State in Calculations

- [x] 3.1 Add guard in `calculateProjection` (or useEffect in FIRECalculator.tsx): skip calculation when critical inputs are 0 (currentAge, retirementAge, currentPortfolio), set `fireTarget` and `fireAgeAchieved` to null
- [x] 3.2 Update Scoreboard component: show "Enter your details" placeholder when fireTarget is null/0
- [x] 3.3 Update PortfolioChart: show empty state message when no projection data available
- [x] 3.4 Update AnalysisTabs: show placeholder text in each tab when data is empty/zero
- [x] 3.5 Verify no division-by-zero or negative-age errors with all-zero inputs

## 4. Cloud Sync Empty State Guard

- [x] 4.1 Add `isEmptyPlan(plan)` helper in userData.ts that returns true when all numeric inputs are 0 and all arrays are empty
- [x] 4.2 Update useCloudSync.ts: skip `savePlan` call when `isEmptyPlan(aggregatedPlan)` is true
- [x] 4.3 Update useCloudSync.ts: on first login with empty local state and no remote plan, show onboarding instead of error
- [x] 4.4 Verify existing users with non-empty data still sync normally

## 5. Onboarding Walkthrough Component

- [x] 5.1 Create `src/components/OnboardingWalkthrough.tsx` with MUI Dialog-based step overlay
- [x] 5.2 Implement step 1: Welcome message explaining the app's purpose
- [x] 5.3 Implement step 2: Highlight inputs drawer with explanation of accordion sections
- [x] 5.4 Implement step 3: Highlight scoreboard with explanation of KPI cards
- [x] 5.5 Implement step 4: Highlight charts and analysis tabs
- [x] 5.6 Implement step 5: "Get Started" closing step with encouragement to enter details
- [x] 5.7 Add "Next" and "Skip" buttons to each step
- [x] 5.8 Persist `fire_has_seen_onboarding` flag to localStorage on completion or skip
- [x] 5.9 Wire OnboardingWalkthrough into FIRECalculator.tsx: show when `fire_has_seen_onboarding` is absent/false

## 6. Integration and Edge Cases

- [x] 6.1 Update `resetAllData` to also clear `fire_has_seen_onboarding` flag
- [x] 6.2 Verify existing users with localStorage data are unaffected (their data loads, walkthrough doesn't show)
- [x] 6.3 Verify fresh clone with no localStorage shows empty state + walkthrough
- [x] 6.4 Verify import of `test-data/sample-plan.json` populates all fields correctly
- [x] 6.5 Run `npm run build` to verify no TypeScript errors
- [x] 6.6 Test authenticated user flow: sign in with empty local state, verify no empty push to backend
