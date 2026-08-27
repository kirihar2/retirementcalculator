import type {
  AnnualActuals,
  CoastingMode,
  DebtPayment,
  LifeEvent,
  Pension,
  PensionSummary,
  ProjectionYear,
  SpendingCategory,
  AccountBalances,
  TaxConfig,
} from '../types';
import type { WithdrawalStrategy } from '../types/withdrawal-strategies';
import { WithdrawalUtils } from '../types/withdrawal-strategies';
import { calculateTotalTax } from './taxEngine';
import { calculateRMD, getRMDStartYear } from './rmdCalculator';

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
  variableInflationRates: Array<{ age: number; rate: number }>,
  withdrawalStrategy?: WithdrawalStrategy,
  accounts?: AccountBalances,
  taxConfig?: TaxConfig,
  birthYear?: number
): ProjectionResult {
  // FIRE target: how much portfolio needed at retirement to sustain spending
  const annualRetirementSpending = retirementSpending * 12;
  const fireTarget = safeWithdrawalRate > 0
    ? annualRetirementSpending / (safeWithdrawalRate / 100)
    : 0;

  const projection: ProjectionYear[] = [];
  let portfolioNominal = currentPortfolio; // Nominal dollars
  let cumulativeInflation = 1.0;           // tracks price level growth
  let fireAgeAchieved: number | null = null;
  let retirementYear = 0;                  // tracks years into retirement for strategy calculations
  let priorYearWithdrawal = 0;             // for strategy withdrawal calculations
  let priorYearReturn = 0;                 // for strategy withdrawal calculations

  // Account balance tracking for tax calculations
  // If accounts are provided but all are 0, assume all is traditional
  const hasAccountBreakdown = accounts && (
    accounts.traditionalBalance > 0 ||
    accounts.rothBalance > 0 ||
    accounts.taxableBalance > 0 ||
    accounts.hsaBalance > 0
  );

  let traditionalBal = hasAccountBreakdown ? accounts.traditionalBalance : currentPortfolio;
  let rothBal = hasAccountBreakdown ? accounts.rothBalance : 0;
  let taxableBal = hasAccountBreakdown ? accounts.taxableBalance : 0;
  let hsaBal = hasAccountBreakdown ? accounts.hsaBalance : 0;

  // RMD calculation setup
  const rmdStartYear = birthYear ? getRMDStartYear(birthYear) : currentAge + 73;
  const enableTaxCalculations = !!accounts && !!taxConfig;

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
      // Post-retirement: withdraw based on strategy or fixed spending
      let strategyWithdrawal: number;
      if (withdrawalStrategy) {
        // Use the selected withdrawal strategy to determine annual withdrawal
        strategyWithdrawal = WithdrawalUtils.calculateAnnualWithdrawal(
          withdrawalStrategy,
          fireTarget,
          retirementYear,
          yearInflationRate / 100,
          priorYearWithdrawal,
          priorYearReturn,
        );
      } else {
        strategyWithdrawal = annualRetirementSpending;
      }

      // Calculate RMD if applicable
      const currentYear = new Date().getFullYear();
      const ageYear = currentYear + (age - currentAge);
      const rmdRequired = enableTaxCalculations && ageYear >= rmdStartYear && traditionalBal > 0;
      let rmdAmount = 0;
      if (rmdRequired && birthYear) {
        const rmdResult = calculateRMD(age, traditionalBal);
        rmdAmount = rmdResult.rmdAmount;
      }

      // Ensure withdrawal covers RMD if required
      const annualWithdrawal = Math.max(
        strategyWithdrawal - ssIncome - pensionIncome + healthCareCost + lifeEventCost,
        rmdAmount
      );
      annualContribution = -Math.max(0, annualWithdrawal); // negative = withdrawal
      annualSpendingNominal = strategyWithdrawal + healthCareCost + lifeEventCost;

      // Calculate taxes on withdrawals if enabled
      let grossWithdrawal = 0;
      let federalTax = 0;
      let stateTax = 0;
      let capitalGainsTax = 0;
      let niit = 0;
      let totalTax = 0;
      let afterTaxIncome = 0;
      let effectiveTaxRate = 0;

      if (enableTaxCalculations && taxConfig && annualWithdrawal > 0) {
        grossWithdrawal = annualWithdrawal;

        // Determine withdrawal sources (simplified: Traditional first for RMD, then proportional)
        let traditionalWithdrawal = 0;
        let rothWithdrawal = 0;
        let taxableWithdrawal = 0;
        let hsaWithdrawal = 0;

        if (rmdRequired && rmdAmount > 0) {
          // RMD must come from Traditional
          traditionalWithdrawal = Math.min(rmdAmount, traditionalBal);
          const remaining = annualWithdrawal - traditionalWithdrawal;
          if (remaining > 0) {
            // Distribute remaining proportionally
            const totalNonTraditional = rothBal + taxableBal + hsaBal;
            if (totalNonTraditional > 0) {
              rothWithdrawal = (rothBal / totalNonTraditional) * remaining;
              taxableWithdrawal = (taxableBal / totalNonTraditional) * remaining;
              hsaWithdrawal = (hsaBal / totalNonTraditional) * remaining;
            }
          }
        } else {
          // No RMD - distribute proportionally across all accounts
          const totalAccounts = traditionalBal + rothBal + taxableBal + hsaBal;
          if (totalAccounts > 0) {
            traditionalWithdrawal = (traditionalBal / totalAccounts) * annualWithdrawal;
            rothWithdrawal = (rothBal / totalAccounts) * annualWithdrawal;
            taxableWithdrawal = (taxableBal / totalAccounts) * annualWithdrawal;
            hsaWithdrawal = (hsaBal / totalAccounts) * annualWithdrawal;
          }
        }

        // Calculate taxes
        // Traditional withdrawals are ordinary income
        // Roth withdrawals are tax-free
        // Taxable withdrawals are capital gains (simplified: assume all gains)
        // HSA withdrawals for medical are tax-free, otherwise ordinary income (simplified: assume medical)
        const ordinaryIncome = traditionalWithdrawal + pensionIncome + ssIncome;
        const capitalGains = taxableWithdrawal; // Simplified: assume all taxable withdrawals are gains

        const taxBreakdown = calculateTotalTax(
          ordinaryIncome,
          capitalGains,
          taxConfig.stateTaxRate,
          taxConfig.filingStatus
        );

        federalTax = taxBreakdown.federalTax;
        stateTax = taxBreakdown.stateTax;
        capitalGainsTax = taxBreakdown.capitalGainsTax;
        niit = taxBreakdown.niit;
        totalTax = taxBreakdown.totalTax;
        afterTaxIncome = grossWithdrawal - totalTax;
        effectiveTaxRate = taxBreakdown.effectiveTaxRate;

        // Update account balances
        traditionalBal = Math.max(0, traditionalBal - traditionalWithdrawal + (traditionalBal * returnRate));
        rothBal = Math.max(0, rothBal - rothWithdrawal + (rothBal * returnRate));
        taxableBal = Math.max(0, taxableBal - taxableWithdrawal + (taxableBal * returnRate));
        hsaBal = Math.max(0, hsaBal - hsaWithdrawal + (hsaBal * returnRate));
      }

      // Track for next year's strategy calculation
      priorYearWithdrawal = strategyWithdrawal;
      priorYearReturn = returnRate;
      retirementYear++;

      // Store tax data for projection output (will be added below)
      (projection as any).pendingTaxData = {
        grossWithdrawal,
        federalTax,
        stateTax,
        capitalGainsTax,
        niit,
        totalTax,
        afterTaxIncome,
        effectiveTaxRate,
        rmdAmount,
        rmdRequired,
        traditionalBalance: traditionalBal,
        rothBalance: rothBal,
        taxableBalance: taxableBal,
        hsaBalance: hsaBal,
      };
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

    // Retrieve tax data if it was calculated this year
    const taxData = (projection as any).pendingTaxData;

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
      // Tax-related fields
      grossWithdrawal: taxData ? Math.round(taxData.grossWithdrawal) : undefined,
      federalTax: taxData ? Math.round(taxData.federalTax) : undefined,
      stateTax: taxData ? Math.round(taxData.stateTax) : undefined,
      capitalGainsTax: taxData ? Math.round(taxData.capitalGainsTax) : undefined,
      niit: taxData ? Math.round(taxData.niit) : undefined,
      totalTax: taxData ? Math.round(taxData.totalTax) : undefined,
      afterTaxIncome: taxData ? Math.round(taxData.afterTaxIncome) : undefined,
      effectiveTaxRate: taxData ? Math.round(taxData.effectiveTaxRate * 10) / 10 : undefined,
      rmdAmount: taxData ? Math.round(taxData.rmdAmount) : undefined,
      rmdRequired: taxData?.rmdRequired || undefined,
      traditionalBalance: taxData ? Math.round(taxData.traditionalBalance) : undefined,
      rothBalance: taxData ? Math.round(taxData.rothBalance) : undefined,
      taxableBalance: taxData ? Math.round(taxData.taxableBalance) : undefined,
      hsaBalance: taxData ? Math.round(taxData.hsaBalance) : undefined,
    });

    // Clear pending tax data for next iteration
    (projection as any).pendingTaxData = null;
  }

  return { projection, fireTarget, fireAgeAchieved };
}
