import type {
  AnnualActuals,
  CoastingMode,
  DebtPayment,
  LifeEvent,
  Pension,
  PensionSummary,
  ProjectionYear,
  SpendingCategory,
} from '../types';

export interface ProjectionResult {
  projection: ProjectionYear[];
  fireTarget: number;
  fireAgeAchieved: number | null;
}

/**
 * Aggregate pension income from all active pensions.
 */
export function aggregatePensions(pensions: Pension[]): PensionSummary {
  const activePensions = pensions.filter(p => p.currentAnnualPayout > 0);
  const totalAnnualPensionIncome = activePensions.reduce((sum, p) => sum + p.currentAnnualPayout, 0);
  return { totalAnnualPensionIncome, activePensions };
}

/**
 * Get the effective inflation rate for a given age.
 */
function getInflationRate(
  age: number,
  baseInflationRate: number,
  variableInflationRates: Array<{ age: number; rate: number }>
): number {
  const override = variableInflationRates.find(v => v.age === age);
  return override ? override.rate : baseInflationRate;
}

/**
 * Calculate annual life event costs for a given age.
 * Returns total monthly amount * 12 for limited/monthly events, or one-time amount.
 */
function calcLifeEventCost(lifeEvents: LifeEvent[], age: number): number {
  let total = 0;
  for (const event of lifeEvents) {
    if (event.type === 'one-time') {
      if (event.startAge === age) total += event.amount;
    } else if (event.type === 'monthly') {
      const endAge = event.endAge ?? Infinity;
      if (age >= event.startAge && age <= endAge) total += event.amount * 12;
    } else if (event.type === 'limited') {
      const endAge = event.endAge ?? event.startAge;
      if (age >= event.startAge && age <= endAge) total += event.amount * 12;
    }
  }
  return total;
}

/**
 * Calculate annual debt payment total for a given age.
 */
function calcDebtPayments(debtPayments: DebtPayment[], age: number): number {
  return debtPayments
    .filter(d => age >= d.startAge && age <= d.endAge)
    .reduce((sum, d) => sum + d.monthlyPayment * 12, 0);
}

/**
 * Calculate annual pension income for a given age.
 */
function calcPensionIncome(pensions: Pension[], age: number): number {
  return pensions
    .filter(p => age >= p.startAge && (p.endAge == null || age <= p.endAge))
    .reduce((sum, p) => sum + p.currentAnnualPayout, 0);
}

/**
 * Main projection calculator for the FIRE dashboard.
 *
 * Returns real-dollar (today's purchasing power) portfolio values and nominal values.
 * Real = nominal / cumulativeInflationFactor
 */
export function calculateProjection(
  currentAge: number,
  retirementAge: number,
  lifeExpectancy: number,
  currentPortfolio: number,
  monthlyIncome: number,
  monthlySpending: number,
  retirementSpending: number,
  preRetirementReturn: number,
  coastingReturn: number,   // income multiplier during coasting (0.5 - 1.0)
  retirementReturn: number,
  inflationRate: number,
  socialSecurityAge: number,
  socialSecurityIncome: number,
  safeWithdrawalRate: number,
  medicareAge: number,
  healthCareMonthly: number,
  lifeEvents: LifeEvent[],
  debtPayments: DebtPayment[],
  pensions: Pension[],
  coastingMode: CoastingMode,
  actuals: AnnualActuals[],
  spendingCategories: SpendingCategory[] | undefined,
  variableInflationRates: Array<{ age: number; rate: number }>
): ProjectionResult {
  // FIRE target: how much portfolio needed at retirement to sustain spending
  const annualRetirementSpending = retirementSpending * 12;
  const fireTarget = annualRetirementSpending / (safeWithdrawalRate / 100);

  const projection: ProjectionYear[] = [];
  let portfolioNominal = currentPortfolio; // Nominal dollars
  let cumulativeInflation = 1.0;           // tracks price level growth
  let fireAgeAchieved: number | null = null;

  for (let age = currentAge; age <= lifeExpectancy; age++) {
    const yearInflationRate = getInflationRate(age, inflationRate, variableInflationRates);
    const inflationFactor = 1 + yearInflationRate / 100;

    // Determine phase
    const isRetired = age >= retirementAge;
    const isCoasting = coastingMode.enabled && !isRetired && age >= coastingMode.coastingAge;
    const hasSSIncome = age >= socialSecurityAge;
    const hasHealthCareCost = !isRetired ? false : age < medicareAge; // healthcare gap only post-retirement pre-Medicare
    // Actually healthcare cost applies whenever before medicare, but especially matters post retirement
    const healthCareCost = age >= retirementAge && age < medicareAge ? healthCareMonthly * 12 : 0;

    // Annual debt payments
    const annualDebtPayments = calcDebtPayments(debtPayments, age);

    // Annual pension income
    const pensionIncome = calcPensionIncome(pensions, age);

    // Annual life event costs
    const lifeEventCost = calcLifeEventCost(lifeEvents, age);

    // SS income
    const ssIncome = hasSSIncome ? socialSecurityIncome : 0;

    // Return rate for this year
    let returnRate: number;
    if (isRetired) {
      returnRate = retirementReturn / 100;
    } else {
      returnRate = preRetirementReturn / 100;
    }

    // Investment return on portfolio this year
    const annualReturn = portfolioNominal * returnRate;

    // Contributions / withdrawals
    let annualContribution = 0;
    let annualSpendingNominal: number;

    if (!isRetired) {
      // Pre-retirement: save the surplus
      const effectiveMonthlyIncome = isCoasting
        ? monthlyIncome * coastingMode.coasingMultiplier
        : monthlyIncome;
      const annualIncome = effectiveMonthlyIncome * 12;
      const annualBaseSpending = monthlySpending * 12;
      annualContribution = annualIncome - annualBaseSpending - annualDebtPayments - lifeEventCost;
      annualSpendingNominal = annualBaseSpending + annualDebtPayments + lifeEventCost;
    } else {
      // Post-retirement: withdraw what we need
      const annualWithdrawal = annualRetirementSpending - ssIncome - pensionIncome + healthCareCost + lifeEventCost;
      annualContribution = -Math.max(0, annualWithdrawal); // negative = withdrawal
      annualSpendingNominal = annualRetirementSpending + healthCareCost + lifeEventCost;
    }

    // Check actuals - use actual portfolio if available
    const actual = actuals.find(a => a.age === age);
    if (actual) {
      portfolioNominal = actual.portfolio;
    } else {
      portfolioNominal = portfolioNominal * (1 + returnRate) + annualContribution;
      portfolioNominal = Math.max(0, portfolioNominal);
    }

    // Apply inflation for next year
    cumulativeInflation *= inflationFactor;

    // Real dollars = nominal / cumulative inflation (base year = currentAge)
    const portfolioReal = portfolioNominal / cumulativeInflation;
    const annualSpendingReal = annualSpendingNominal / cumulativeInflation;

    // Check FIRE achievement (in real terms)
    if (!isRetired && fireAgeAchieved === null && portfolioReal >= fireTarget / cumulativeInflation) {
      fireAgeAchieved = age;
    }
    // Also check nominal
    if (!isRetired && fireAgeAchieved === null && portfolioNominal >= fireTarget) {
      fireAgeAchieved = age;
    }

    projection.push({
      age,
      portfolio: Math.round(portfolioReal),
      portfolioAfterInflation: Math.round(portfolioNominal),
      annualContribution: Math.round(annualContribution),
      annualSpending: Math.round(annualSpendingReal),
      annualSpendingNominal: Math.round(annualSpendingNominal),
      annualReturn: Math.round(annualReturn),
      ssIncome: Math.round(ssIncome),
      pensionIncome: pensionIncome > 0 ? Math.round(pensionIncome) : undefined,
      healthCareCost: healthCareCost > 0 ? Math.round(healthCareCost) : undefined,
      annualDebtPayments: annualDebtPayments > 0 ? Math.round(annualDebtPayments) : undefined,
      isCoasting: isCoasting || undefined,
      inflationRate: yearInflationRate,
    });
  }

  return { projection, fireTarget, fireAgeAchieved };
}
