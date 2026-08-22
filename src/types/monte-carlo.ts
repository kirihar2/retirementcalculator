/**
 * Monte Carlo Simulation Types and Utilities
 *
 * Implements a parametric Monte Carlo simulation for retirement planning.
 * Uses a normal distribution for annual returns with configurable mean and volatility.
 * Models sequence-of-returns risk by sampling a new return each year.
 */

export interface MonteCarloSimulationParams {
  initialPortfolio: number;
  retirementAge: number;
  lifeExpectancy: number;
  monthlyWithdrawal: number;
  annualReturnDistribution?: number[];      // Array of possible return rates (e.g., [-5%, 0%, 5%])
  defaultAnnualReturn?: number;             // Expected annual return (mean) - e.g. 0.07 for 7%
  annualReturnVolatility?: number;          // Standard deviation of returns - e.g. 0.15 for 15%
  currentAge?: number;                      // Current age (for pre-retirement accumulation)
  preRetirementReturn?: number;             // Return during accumulation phase
  annualSavings?: number;                   // Annual savings added before retirement
}

export interface MonteCarloSimulationResult {
  uuid: string;
  successProbability: number;               // % chance of lasting until death age (0-100)
  maxPortfolioValue: number;
  portfolioAgeAtDeath?: number;             // Age when money runs out (if not in retirement)
  finalWithdrawalMultiple: number;          // Multiple of FIRE target withdrawn at end
  medianFinalPortfolio: number;             // Median final portfolio value
  percentile10: number;                     // 10th percentile final portfolio
  percentile90: number;                     // 90th percentile final portfolio
}

/**
 * Box-Muller transform: generates a standard normal random variate.
 * Converts two uniform random numbers into a normally distributed value.
 */
function randomNormal(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Sample a single year's return from a normal distribution
 * with the given mean and standard deviation.
 */
function sampleAnnualReturn(mean: number, stdDev: number): number {
  return mean + stdDev * randomNormal();
}

/**
 * Monte Carlo simulation utilities
 */
export const MonteCarloUtils = {
  /**
   * Run a Monte Carlo simulation with parametric return distributions.
   *
   * For each iteration:
   * - If currentAge < retirementAge: accumulate savings with pre-retirement returns
   * - From retirementAge to lifeExpectancy: withdraw annually, apply random returns
   * - Track if portfolio survives to lifeExpectancy
   * - Track max portfolio value and depletion age
   */
  runSimulation(
    params: MonteCarloSimulationParams,
    iterations = 1000
  ): MonteCarloSimulationResult[] {
    const {
      initialPortfolio,
      retirementAge,
      lifeExpectancy,
      monthlyWithdrawal,
      defaultAnnualReturn = 0.07,
      annualReturnVolatility = 0.15,
      currentAge,
      preRetirementReturn,
      annualSavings = 0,
    } = params;

    const annualWithdrawal = monthlyWithdrawal * 12;
    const results: MonteCarloSimulationResult[] = [];

    // FIRE target used for withdrawal multiple calculation (constant across iterations)
    const fireTarget = annualWithdrawal / (defaultAnnualReturn > 0 ? defaultAnnualReturn : 0.04);

    // Track per-iteration outcomes for aggregation
    const successFlags: boolean[] = [];
    const maxValues: number[] = [];
    const depletionAges: (number | undefined)[] = [];
    const finalPortfolios: number[] = [];
    const totalWithdrawns: number[] = [];

    for (let i = 0; i < iterations; i++) {
      let portfolio = initialPortfolio;
      let maxValue = initialPortfolio;
      let depletedAge: number | undefined;
      let totalWithdrawn = 0;

      // Phase 1: Accumulation (current age to retirement age)
      if (currentAge !== undefined && currentAge < retirementAge) {
        const accumReturn = preRetirementReturn ?? defaultAnnualReturn;
        for (let age = currentAge; age < retirementAge; age++) {
          // Apply return and add savings
          const yearReturn = sampleAnnualReturn(accumReturn, annualReturnVolatility);
          portfolio = portfolio * (1 + yearReturn) + annualSavings;
          maxValue = Math.max(maxValue, portfolio);
        }
      }

      // Phase 2: Retirement (retirement age to life expectancy)
      for (let age = retirementAge; age <= lifeExpectancy; age++) {
        // Determine actual withdrawal (can't withdraw more than available)
        const actualWithdrawal = Math.min(annualWithdrawal, Math.max(0, portfolio));
        portfolio -= actualWithdrawal;
        totalWithdrawn += actualWithdrawal;

        if (portfolio <= 0) {
          depletedAge = age;
          portfolio = 0;
          break;
        }

        // Apply return for the year
        const yearReturn = sampleAnnualReturn(defaultAnnualReturn, annualReturnVolatility);
        portfolio = portfolio * (1 + yearReturn);
        maxValue = Math.max(maxValue, portfolio);
      }

      const survived = depletedAge === undefined;

      successFlags.push(survived);
      maxValues.push(maxValue);
      depletionAges.push(depletedAge);
      finalPortfolios.push(portfolio);
      totalWithdrawns.push(totalWithdrawn);
    }

    // Aggregate results
    const successCount = successFlags.filter(Boolean).length;
    const successProbability = (successCount / iterations) * 100;

    // Calculate percentiles for final portfolios (only for successful iterations)
    const successfulFinals = finalPortfolios.filter((_, i) => successFlags[i]).sort((a, b) => a - b);
    const allFinals = [...finalPortfolios].sort((a, b) => a - b);

    const percentile = (arr: number[], p: number): number => {
      if (arr.length === 0) return 0;
      const idx = (p / 100) * (arr.length - 1);
      const lower = Math.floor(idx);
      const upper = Math.ceil(idx);
      if (lower === upper) return arr[lower];
      return arr[lower] + (arr[upper] - arr[lower]) * (idx - lower);
    };

    // Calculate average depletion age (only for failed iterations)
    const failedDepletionAges = depletionAges.filter((a): a is number => a !== undefined);
    const avgDepletionAge = failedDepletionAges.length > 0
      ? failedDepletionAges.reduce((sum, a) => sum + a, 0) / failedDepletionAges.length
      : undefined;

    // Calculate average withdrawal multiple
    const withdrawalMultiples = totalWithdrawns.map(tw => fireTarget > 0 ? tw / fireTarget : 0);
    const avgWithdrawalMultiple = withdrawalMultiples.reduce((s, v) => s + v, 0) / iterations;

    // Build aggregate result
    const result: MonteCarloSimulationResult = {
      uuid: `sim-batch-${Date.now()}`,
      successProbability: Math.round(successProbability * 10) / 10,
      maxPortfolioValue: Math.max(...maxValues),
      portfolioAgeAtDeath: avgDepletionAge,
      finalWithdrawalMultiple: Math.round(avgWithdrawalMultiple * 100) / 100,
      medianFinalPortfolio: percentile(successfulFinals.length > 0 ? successfulFinals : allFinals, 50),
      percentile10: percentile(successfulFinals.length > 0 ? successfulFinals : allFinals, 10),
      percentile90: percentile(successfulFinals.length > 0 ? successfulFinals : allFinals, 90),
    };

    results.push(result);
    return results;
  },

  /**
   * Get average success probability from simulation results.
   * Uses the first result (aggregate) if available.
   */
  getAverageSuccessProbability(sims: MonteCarloSimulationResult[]): number {
    if (sims.length === 0) return 0;
    // First result is the aggregate batch result
    if (sims[0].uuid.startsWith('sim-batch')) {
      return sims[0].successProbability;
    }
    const sum = sims.reduce((acc, sim) => acc + sim.successProbability, 0);
    return Math.round((sum / sims.length) * 10) / 10;
  },

  /**
   * Get best-case success probability from simulation results.
   */
  getBestCaseSuccessProbability(sims: MonteCarloSimulationResult[]): number {
    return Math.max(...sims.map(sim => sim.successProbability));
  },

  /**
   * Get the aggregate batch result from simulation results.
   */
  getAggregateResult(sims: MonteCarloSimulationResult[]): MonteCarloSimulationResult | null {
    return sims.find(s => s.uuid.startsWith('sim-batch')) || null;
  },
};
