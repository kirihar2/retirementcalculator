/**
 * Withdrawal Strategy Definitions & Calculations
 *
 * Implements four withdrawal strategies for retirement planning:
 * - Classic 4% Rule (Trinity study approach)
 * - Bogleheads Fixed + Variable (guardrails approach)
 * - Bucket Strategy (3-5-10 time-segmented buckets)
 * - Dynamic Rate (performance-adjusted withdrawals)
 */

export interface WithdrawalStrategy {
  id: string;
  name: string;
  description: string;
  baseWithdrawalRate: number;        // % of FIRE target in first year
  annualAdjustmentRate?: number;     // Rate of inflation adjustment (%)
  isConservative?: boolean;
  initialWithdrawalPercent?: number; // Override initial rate (for Bogleheads etc)
  maxAnnualIncreasePercent?: number; // Cap on annual withdrawal increase
  minWithdrawalPercent?: number;     // Floor withdrawal rate
}

export interface WithdrawalComparisonResult {
  strategyId: string;
  strategyName: string;
  description: string;
  portfolioAtAge80: number;
  portfolioAtAge90: number;
  portfolioAtAge100: number;
  portfolioDepletedAt: number | null; // Age when money runs out (null = survives)
  totalWithdrawn: number;
  successRate: number;                // % of scenarios where portfolio survives
}

export interface WithdrawalProjection {
  age: number;
  portfolio: number;
  withdrawal: number;
  year: number;
}

/**
 * Classic 4% Rule - Traditional Trinity study approach
 * Withdraw 4% of initial portfolio, adjust for inflation each year
 */
export const classic4PercentStrategy: WithdrawalStrategy = {
  id: 'classic-4percent',
  name: 'Classic 4%',
  description: 'Withdraw 4% of FIRE portfolio target annually, adjusted for inflation.',
  baseWithdrawalRate: 4.0,
  annualAdjustmentRate: 3.0,
  isConservative: false,
};

/**
 * Bogleheads Fixed + Variable - Modern guardrails approach
 * Start with 3%, adjust based on portfolio performance
 */
export const bogleheadsStrategy: WithdrawalStrategy = {
  id: 'bogleheads-fixed-variable',
  name: 'Fixed + Variable',
  description: 'Start with 3%, add last years portfolio return. Never withdraw more than needed.',
  baseWithdrawalRate: 3.0,
  isConservative: true,
  maxAnnualIncreasePercent: 5.0,
  minWithdrawalPercent: 2.5,
};

/**
 * Bucket Strategy - Sequential withdrawal from buckets
 * Cash (years 1-3), intermediate bonds (years 4-10), growth assets (year 11+)
 */
export const bucketStrategy: WithdrawalStrategy = {
  id: 'bucket-3510',
  name: 'Bucket Strategy (3-5-10)',
  description: 'Three buckets: cash (years 1-3), intermediate bonds (years 4-10), growth assets (year 11+)',
  baseWithdrawalRate: 4.0,
  isConservative: false,
};

/**
 * Dynamic Withdrawal Rate - Adjusts based on portfolio performance
 * Start with 3%, adjust by performance
 */
export const dynamicStrategy: WithdrawalStrategy = {
  id: 'dynamic-withdrawal',
  name: 'Dynamic Rate',
  description: 'Start with 3%, increase by inflation if portfolio grows, decrease by 1/2% if it declines.',
  baseWithdrawalRate: 3.0,
  annualAdjustmentRate: 3.0,
  isConservative: true,
};

/**
 * Safe Withdrawal Rate Calculator
 */
export const WithdrawalUtils = {
  /**
   * Calculate annual withdrawal for a given strategy and year.
   *
   * @param strategy The withdrawal strategy to use
   * @param fireTarget The FIRE target (initial portfolio at retirement)
   * @param year Number of years into retirement (0 = first year)
   * @param inflationRate Annual inflation rate (e.g. 0.03 for 3%)
   * @param priorYearWithdrawal Previous years withdrawal amount (for adjustments)
   * @param priorYearReturn Prior years portfolio return rate (for performance-based)
   */
  calculateAnnualWithdrawal(
    strategy: WithdrawalStrategy,
    fireTarget: number,
    year: number,
    inflationRate = 0.03,
    priorYearWithdrawal = 0,
    priorYearReturn = 0,
  ): number {
    const baseRate = strategy.baseWithdrawalRate / 100;

    // Classic 4%: fixed rate, inflation-adjusted
    if (strategy.id === 'classic-4percent') {
      if (year === 0) return fireTarget * baseRate;
      return priorYearWithdrawal * (1 + inflationRate);
    }

    // Bogleheads: performance-adjusted, capped
    if (strategy.id === 'bogleheads-fixed-variable') {
      if (year === 0) return fireTarget * baseRate;

      const maxIncrease = (strategy.maxAnnualIncreasePercent ?? 5) / 100;
      const minRate = (strategy.minWithdrawalPercent ?? 2.5) / 100;
      const minWithdrawal = fireTarget * minRate;

      // Adjust based on prior year return: increase by return, capped
      const adjustment = Math.min(priorYearReturn, maxIncrease);
      let newWithdrawal = priorYearWithdrawal * (1 + adjustment);

      // Floor at minimum rate
      return Math.max(newWithdrawal, minWithdrawal);
    }

    // Bucket: simplified as fixed rate with inflation adjustment
    if (strategy.id === 'bucket-3510') {
      if (year === 0) return fireTarget * baseRate;
      return priorYearWithdrawal * (1 + inflationRate);
    }

    // Dynamic: adjust by performance, half up / half down
    if (strategy.id === 'dynamic-withdrawal') {
      if (year === 0) return fireTarget * baseRate;

      if (priorYearReturn > inflationRate) {
        // Positive real return: increase by inflation
        return priorYearWithdrawal * (1 + inflationRate);
      } else {
        // Negative real return: decrease by 0.5%
        return priorYearWithdrawal * (1 - 0.005);
      }
    }

    // Default: inflation-adjusted from base
    if (year === 0) return fireTarget * baseRate;
    return priorYearWithdrawal * (1 + (strategy.annualAdjustmentRate ?? inflationRate * 100) / 100);
  },

  /**
   * Project portfolio forward using a specific withdrawal strategy.
   * Returns year-by-year portfolio values.
   */
  projectWithStrategy(
    strategy: WithdrawalStrategy,
    initialPortfolio: number,
    retirementAge: number,
    lifeExpectancy: number,
    expectedReturn = 0.07,
    inflationRate = 0.03,
  ): WithdrawalProjection[] {
    const projections: WithdrawalProjection[] = [];
    let portfolio = initialPortfolio;
    let priorWithdrawal = 0;
    let priorReturn = 0;

    for (let year = 0; year <= lifeExpectancy - retirementAge; year++) {
      const age = retirementAge + year;

      // Calculate withdrawal for this year
      const withdrawal = this.calculateAnnualWithdrawal(
        strategy,
        initialPortfolio,
        year,
        inflationRate,
        priorWithdrawal,
        priorReturn,
      );

      // Check if portfolio can cover withdrawal
      if (portfolio <= 0) {
        projections.push({ age, portfolio: 0, withdrawal: 0, year });
        continue;
      }

      // Withdraw at start of year
      portfolio -= withdrawal;

      // Apply return for the year
      const returnRate = expectedReturn;
      portfolio = portfolio * (1 + returnRate);

      projections.push({
        age,
        portfolio: Math.max(0, portfolio),
        withdrawal,
        year,
      });

      priorWithdrawal = withdrawal;
      priorReturn = returnRate;
    }

    return projections;
  },

  /**
   * Compare all strategies side-by-side at key ages.
   */
  compareStrategies(
    initialPortfolio: number,
    retirementAge: number,
    lifeExpectancy: number,
    expectedReturn = 0.07,
    inflationRate = 0.03,
  ): WithdrawalComparisonResult[] {
    const strategies = [
      classic4PercentStrategy,
      bogleheadsStrategy,
      bucketStrategy,
      dynamicStrategy,
    ];

    return strategies.map(strategy => {
      const projections = this.projectWithStrategy(
        strategy,
        initialPortfolio,
        retirementAge,
        lifeExpectancy,
        expectedReturn,
        inflationRate,
      );

      // Find portfolio at key ages
      const getValueAtAge = (age: number): number => {
        const p = projections.find(p => p.age === age);
        return p ? p.portfolio : 0;
      };

      // Find depletion age (first year with portfolio <= 0 after starting)
      const depletionEntry = projections.find((p, i) => i > 0 && p.portfolio <= 0);
      const depletedAt = depletionEntry ? depletionEntry.age : null;

      // Total withdrawn
      const totalWithdrawn = projections.reduce((sum, p) => sum + p.withdrawal, 0);

      return {
        strategyId: strategy.id,
        strategyName: strategy.name,
        description: strategy.description,
        portfolioAtAge80: getValueAtAge(80),
        portfolioAtAge90: getValueAtAge(90),
        portfolioAtAge100: getValueAtAge(100),
        portfolioDepletedAt: depletedAt,
        totalWithdrawn,
        successRate: depletedAt === null ? 100 : 0,
      };
    });
  },
};
