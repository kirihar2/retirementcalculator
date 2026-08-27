/**
 * Tax Engine - Calculates federal, state, and capital gains taxes on retirement income.
 *
 * This module provides pure functions for tax calculations based on 2026 tax brackets.
 * It supports Single and Married Filing Jointly filing statuses.
 */

import {
  FilingStatus,
  getCapitalGainsBrackets,
  getNIITRate,
  getNIITThreshold,
  getStandardDeduction,
  getTaxBrackets,
  TaxBracket,
} from './taxConfig';

export interface TaxBreakdown {
  federalTax: number;
  stateTax: number;
  capitalGainsTax: number;
  niit: number; // Net Investment Income Tax (3.8%)
  totalTax: number;
  effectiveTaxRate: number; // As a percentage (e.g., 22.5 for 22.5%)
}

/**
 * Calculate federal income tax on ordinary income using progressive tax brackets.
 *
 * @param ordinaryIncome - Taxable ordinary income (after standard deduction)
 * @param filingStatus - Single or Married Filing Jointly
 * @returns Federal tax amount
 */
export function calculateFederalIncomeTax(ordinaryIncome: number, filingStatus: FilingStatus): number {
  if (ordinaryIncome <= 0) return 0;

  const brackets = getTaxBrackets(filingStatus);
  let tax = 0;

  for (const bracket of brackets) {
    if (ordinaryIncome <= bracket.min) break;

    const taxableInBracket = Math.min(ordinaryIncome, bracket.max) - bracket.min;
    if (taxableInBracket > 0) {
      tax += taxableInBracket * bracket.rate;
    }
  }

  return tax;
}

/**
 * Calculate long-term capital gains tax based on total taxable income.
 *
 * Capital gains rates (0%, 15%, 20%) depend on where the gains fall in the
 * taxpayer's overall income. The brackets are based on taxable income including
 * the capital gains.
 *
 * @param capitalGains - Amount of long-term capital gains
 * @param totalTaxableIncome - Total taxable income including capital gains (ordinary income + capital gains)
 * @param filingStatus - Single or Married Filing Jointly
 * @returns Capital gains tax amount
 */
export function calculateCapitalGainsTax(
  capitalGains: number,
  totalTaxableIncome: number,
  filingStatus: FilingStatus
): number {
  if (capitalGains <= 0 || totalTaxableIncome <= 0) return 0;

  const brackets = getCapitalGainsBrackets(filingStatus);

  // Find the rate for the taxpayer's income level
  // Capital gains are taxed at the rate corresponding to the taxpayer's taxable income bracket
  let rate = 0;
  for (const bracket of brackets) {
    if (totalTaxableIncome >= bracket.min && totalTaxableIncome <= bracket.max) {
      rate = bracket.rate;
      break;
    }
    // If income exceeds the max of the last bracket, use that rate
    if (bracket.max === Infinity && totalTaxableIncome > bracket.min) {
      rate = bracket.rate;
    }
  }

  return capitalGains * rate;
}

/**
 * Calculate state tax on taxable withdrawals.
 *
 * @param taxableWithdrawals - Total taxable withdrawals (ordinary income + capital gains)
 * @param stateTaxRate - State tax rate as a percentage (e.g., 5 for 5%)
 * @returns State tax amount
 */
export function calculateStateTax(taxableWithdrawals: number, stateTaxRate: number): number {
  if (taxableWithdrawals <= 0 || stateTaxRate <= 0) return 0;
  return taxableWithdrawals * (stateTaxRate / 100);
}

/**
 * Calculate Net Investment Income Tax (NIIT) - 3.8% on investment income above threshold.
 *
 * NIIT applies to the lesser of:
 * - Net investment income, or
 * - Modified AGI above the threshold ($200k single, $250k MFJ)
 *
 * @param investmentIncome - Net investment income (capital gains, dividends, etc.)
 * @param modifiedAGI - Modified adjusted gross income
 * @param filingStatus - Single or Married Filing Jointly
 * @returns NIIT amount
 */
export function calculateNIIT(
  investmentIncome: number,
  modifiedAGI: number,
  filingStatus: FilingStatus
): number {
  if (investmentIncome <= 0) return 0;

  const threshold = getNIITThreshold(filingStatus);
  const excessAGI = Math.max(0, modifiedAGI - threshold);

  // NIIT applies to the lesser of investment income or excess AGI
  const taxableAmount = Math.min(investmentIncome, excessAGI);

  return taxableAmount * getNIITRate();
}

/**
 * Calculate total tax breakdown for retirement income.
 *
 * This function combines federal income tax, capital gains tax, state tax, and NIIT
 * to provide a complete tax picture for a given year.
 *
 * @param ordinaryIncome - Ordinary income (Traditional withdrawals, RMDs, pensions)
 * @param capitalGains - Long-term capital gains (from taxable account withdrawals)
 * @param stateTaxRate - State tax rate as a percentage
 * @param filingStatus - Single or Married Filing Jointly
 * @returns Complete tax breakdown with federal, state, capital gains, NIIT, and totals
 */
export function calculateTotalTax(
  ordinaryIncome: number,
  capitalGains: number,
  stateTaxRate: number,
  filingStatus: FilingStatus
): TaxBreakdown {
  // Apply standard deduction to ordinary income
  const standardDeduction = getStandardDeduction(filingStatus);
  const taxableOrdinaryIncome = Math.max(0, ordinaryIncome - standardDeduction);

  // Calculate federal income tax on ordinary income
  const federalTax = calculateFederalIncomeTax(taxableOrdinaryIncome, filingStatus);

  // Calculate capital gains tax
  // Total taxable income for capital gains bracket determination includes both ordinary and capital gains
  const totalTaxableIncome = taxableOrdinaryIncome + capitalGains;
  const capitalGainsTax = calculateCapitalGainsTax(capitalGains, totalTaxableIncome, filingStatus);

  // Calculate state tax on total taxable withdrawals
  const totalTaxableWithdrawals = ordinaryIncome + capitalGains;
  const stateTax = calculateStateTax(totalTaxableWithdrawals, stateTaxRate);

  // Calculate NIIT on investment income (capital gains)
  // For simplicity, we use total income as modified AGI
  const modifiedAGI = totalTaxableWithdrawals;
  const niit = calculateNIIT(capitalGains, modifiedAGI, filingStatus);

  // Calculate totals
  const totalTax = federalTax + capitalGainsTax + stateTax + niit;
  const grossIncome = ordinaryIncome + capitalGains;
  const effectiveTaxRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0;

  return {
    federalTax,
    stateTax,
    capitalGainsTax,
    niit,
    totalTax,
    effectiveTaxRate,
  };
}

/**
 * Calculate after-tax income from gross withdrawal.
 *
 * @param grossWithdrawal - Total withdrawal amount before taxes
 * @param taxBreakdown - Tax breakdown from calculateTotalTax
 * @returns After-tax (net) income
 */
export function calculateAfterTaxIncome(grossWithdrawal: number, taxBreakdown: TaxBreakdown): number {
  return Math.max(0, grossWithdrawal - taxBreakdown.totalTax);
}
