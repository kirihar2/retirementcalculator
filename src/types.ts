export interface Pension {
  id: string;
  name: string;
  currentAnnualPayout: number;
  startAge: number;
  endAge?: number | null; // null = until death
}

export interface PensionSummary {
  totalAnnualPensionIncome: number;
  activePensions: Pension[];
}

// Aggregate pension income from all active pensions
// NOTE: Moved to calculations.ts - this function is now exported for type safety but not used here;

export interface AnnualActuals {
  age: number;
  portfolio: number;
  savings: number;
  spending: number;
}

export interface LifeEvent {
  id: string;
  name: string;
  type: 'monthly' | 'one-time' | 'limited';
  amount: number;
  startAge: number;
  endAge?: number;
  description: string;
}

export interface DebtPayment {
  id: string;
  name: string;
  monthlyPayment: number;
  startAge: number;
  endAge: number;
  description: string;
}

export interface ProjectionYear {
  age: number;
  portfolio: number; // Portfolio before inflation adjustment (real dollars - today's purchasing power)
  portfolioAfterInflation: number; // Portfolio after applying inflation factor (nominal dollars)
  annualContribution: number;
  annualSpending: number; // Spending in real dollars (today's purchasing power)
  annualSpendingNominal: number | null; // Spending in nominal dollars (null when displayMode is 'real')
  annualReturn: number;
  ssIncome: number;
  pensionIncome?: number; // Traditional pension annuity-style income (taxable)
  healthCareCost?: number;
  annualDebtPayments?: number; // Added for debt payments column in ProjectionTable
  isCoasting?: boolean; // Flag to indicate coasting period (working with reduced income)
  inflationRate: number; // The inflation rate applied this year (for variable inflation support)
}

export interface CoastingMode {
  enabled: boolean;
  coastingAge: number; // Age when transitioning from normal work to coasting mode
  coasingMultiplier: number; // Multiplier for income/contributions during coasting (e.g., 0.7 = 70% of normal)
}

// Spending categories - allows tracking specific expense types that may have different inflation rates
export interface SpendingCategory {
  id: string;
  name: string;           // e.g., 'Travel', 'Housing', 'Food', 'Healthcare'
  baseAmount: number;    // Monthly amount in today's dollars (real terms)
  startAge: number;      // Age when this expense begins
  endAge?: number | null;// null = continues until death/age limit
  inflationRate?: number;// Inflation rate for this category (null = uses global inflation rate)
                         // e.g., null = 3% (global), 6% for travel, 0% for fixed-rate mortgage
}

export interface CoastingModeProps {
  enabled: boolean;
  coastingAge: number;
  coasingMultiplier: number;
  onEnabledChange: (enabled: boolean) => void;
  onCoastingAgeChange: (age: number) => void;
  onCoastingMultiplierChange: (multiplier: number) => void;
}

export interface ProjectedMilestone {
  id: string;
  age: number;
  event: string;
  description?: string;
  targetValue?: number; // e.g., portfolio goal in dollars
  currentValue?: number; // Optional: actual projection value at that age
  category: 'growth' | 'income' | 'event' | 'health';
}

export interface MilestoneState {
  projectedMilestones: ProjectedMilestone[];
}

// Consolidated input state - all scalar fields in one object (Phase 1)
export interface InputState {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentPortfolio: number;
  monthlyIncome: number;
  monthlySpending: number; // Total monthly spending (deprecated, use spendingCategories)
  retirementSpending: number;
  preRetirementReturn: number;
  coastingReturn: number;
  retirementReturn: number;
  inflationRate: number; // Base inflation rate (default for all years)
  socialSecurityAge: number;
  socialSecurityIncome: number;
  safeWithdrawalRate: number;
  medicareAge: number;
  healthCareMonthly: number;
  coastingMode: CoastingMode;
  spendingCategories?: SpendingCategory[]; // Optional: Track specific expense categories (e.g., Travel, Housing)
}

// Variable inflation rates by year (optional, can be undefined for years using base rate)
export interface YearInflation {
  id: string;
  age: number;
  rate: number; // Inflation rate percentage for this age
}

// Initial actuals for the past year (not consolidated - kept as array state per plan)
export interface ActualsInitialState {
  portfolio: number;
  savings: number;
  spending: number;
}

// Consolidated input state types for FIRECalculator
export interface InputState {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentPortfolio: number;
  monthlyIncome: number;
  monthlySpending: number;
  retirementSpending: number;
  preRetirementReturn: number;
  coastingReturn: number;
  retirementReturn: number;
  inflationRate: number;
  socialSecurityAge: number;
  socialSecurityIncome: number;
  safeWithdrawalRate: number;
  medicareAge: number;
  healthCareMonthly: number;
  coastingMode: CoastingMode;
}

export interface ActualsInitialState {
  portfolio: number;
  savings: number;
  spending: number;
}
