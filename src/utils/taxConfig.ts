/**
 * Tax configuration for 2026 tax year.
 *
 * Tax brackets are hardcoded and updated via new deployments when tax laws change.
 * Supports Single and Married Filing Jointly (MFJ) filing statuses.
 */

export type FilingStatus = 'single' | 'mfj';

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

// 2026 Federal Income Tax Brackets
// Source: IRS Revenue Procedure 2025-40 (inflation-adjusted for 2026)
const FEDERAL_BRACKETS_SINGLE: TaxBracket[] = [
  { min: 0, max: 11925, rate: 0.10 },
  { min: 11926, max: 48475, rate: 0.12 },
  { min: 48476, max: 103350, rate: 0.22 },
  { min: 103351, max: 197300, rate: 0.24 },
  { min: 197301, max: 250525, rate: 0.32 },
  { min: 250526, max: 626350, rate: 0.35 },
  { min: 626351, max: Infinity, rate: 0.37 },
];

const FEDERAL_BRACKETS_MFJ: TaxBracket[] = [
  { min: 0, max: 23850, rate: 0.10 },
  { min: 23851, max: 96950, rate: 0.12 },
  { min: 96951, max: 206700, rate: 0.22 },
  { min: 206701, max: 394600, rate: 0.24 },
  { min: 394601, max: 501050, rate: 0.32 },
  { min: 501051, max: 751600, rate: 0.35 },
  { min: 751601, max: Infinity, rate: 0.37 },
];

// 2026 Long-Term Capital Gains Tax Brackets
// Source: IRS Revenue Procedure 2025-40
const CAPITAL_GAINS_BRACKETS_SINGLE: TaxBracket[] = [
  { min: 0, max: 48350, rate: 0.00 },
  { min: 48351, max: 533400, rate: 0.15 },
  { min: 533401, max: Infinity, rate: 0.20 },
];

const CAPITAL_GAINS_BRACKETS_MFJ: TaxBracket[] = [
  { min: 0, max: 96700, rate: 0.00 },
  { min: 96701, max: 600050, rate: 0.15 },
  { min: 600051, max: Infinity, rate: 0.20 },
];

// Net Investment Income Tax (NIIT) - 3.8% on investment income above threshold
const NIIT_THRESHOLD_SINGLE = 200000;
const NIIT_THRESHOLD_MFJ = 250000;
const NIIT_RATE = 0.038;

// Standard Deduction 2026
const STANDARD_DEDUCTION_SINGLE = 15000;
const STANDARD_DEDUCTION_MFJ = 30000;

/**
 * Get federal income tax brackets for the specified filing status.
 */
export function getTaxBrackets(filingStatus: FilingStatus): TaxBracket[] {
  return filingStatus === 'mfj' ? FEDERAL_BRACKETS_MFJ : FEDERAL_BRACKETS_SINGLE;
}

/**
 * Get long-term capital gains tax brackets for the specified filing status.
 */
export function getCapitalGainsBrackets(filingStatus: FilingStatus): TaxBracket[] {
  return filingStatus === 'mfj' ? CAPITAL_GAINS_BRACKETS_MFJ : CAPITAL_GAINS_BRACKETS_SINGLE;
}

/**
 * Get the standard deduction for the specified filing status.
 */
export function getStandardDeduction(filingStatus: FilingStatus): number {
  return filingStatus === 'mfj' ? STANDARD_DEDUCTION_MFJ : STANDARD_DEDUCTION_SINGLE;
}

/**
 * Get the NIIT (Net Investment Income Tax) threshold for the specified filing status.
 */
export function getNIITThreshold(filingStatus: FilingStatus): number {
  return filingStatus === 'mfj' ? NIIT_THRESHOLD_MFJ : NIIT_THRESHOLD_SINGLE;
}

/**
 * Get the NIIT rate (3.8%).
 */
export function getNIITRate(): number {
  return NIIT_RATE;
}

// IRS Uniform Lifetime Table (Publication 590-B)
// Used for calculating Required Minimum Distributions (RMDs)
// Index 0 = age 73, Index 1 = age 74, etc.
// For ages beyond 115, use the last value (1.9)
const UNIFORM_LIFETIME_TABLE: number[] = [
  // Age 73-82
  26.5, 25.6, 24.7, 23.8, 22.9, 22.0, 21.1, 20.2, 19.4, 18.5,
  // Age 83-92
  17.7, 16.8, 16.0, 15.2, 14.4, 13.7, 12.9, 12.2, 11.5, 10.8,
  // Age 93-102
  10.1, 9.5, 8.9, 8.4, 7.8, 7.3, 6.8, 6.4, 6.0, 5.5,
  // Age 103-112
  5.1, 4.7, 4.3, 4.0, 3.7, 3.4, 3.1, 2.9, 2.7, 2.5,
  // Age 113-115+
  2.3, 2.1, 1.9,
];

/**
 * Get the RMD divisor from the IRS Uniform Lifetime Table for the specified age.
 * Returns the divisor for ages 73-115+. For ages below 73, returns 0 (no RMD required).
 * For ages above 115, returns the last value in the table (1.9).
 */
export function getRMDivisor(age: number): number {
  if (age < 73) return 0;
  const index = age - 73;
  if (index >= UNIFORM_LIFETIME_TABLE.length) {
    return UNIFORM_LIFETIME_TABLE[UNIFORM_LIFETIME_TABLE.length - 1];
  }
  return UNIFORM_LIFETIME_TABLE[index];
}

/**
 * Get the RMD starting age based on birth year.
 * - Born before 1960: RMD starts at age 73
 * - Born 1960 or later: RMD starts at age 75 (SECURE 2.0 Act)
 */
export function getRMDStartingAge(birthYear: number): number {
  return birthYear >= 1960 ? 75 : 73;
}

/**
 * Check if a person is subject to RMDs based on birth year and current year.
 */
export function isSubjectToRMD(birthYear: number, currentYear: number): boolean {
  const age = currentYear - birthYear;
  const rmdAge = getRMDStartingAge(birthYear);
  return age >= rmdAge;
}

/**
 * Get the current tax year (hardcoded to 2026 for this deployment).
 */
export function getTaxYear(): number {
  return 2026;
}
