/**
 * RMD Calculator - Required Minimum Distribution calculations.
 *
 * Calculates RMDs based on IRS Uniform Lifetime Table and models their
 * tax impact. RMDs apply to Traditional (pre-tax) accounts starting at
 * age 73 (born before 1960) or age 75 (born 1960 or later, per SECURE 2.0).
 */

import { getRMDivisor, getRMDStartingAge, isSubjectToRMD } from './taxConfig';

export interface RMDResult {
  rmdAmount: number;
  remainingBalance: number;
  divisor: number;
}

/**
 * Calculate the Required Minimum Distribution for a given year.
 *
 * RMD = Traditional Balance / IRS Uniform Lifetime Table Divisor
 *
 * @param age - Current age of the account owner
 * @param traditionalBalance - Current balance in Traditional (pre-tax) accounts
 * @returns RMD result with amount, remaining balance, and divisor used
 */
export function calculateRMD(age: number, traditionalBalance: number): RMDResult {
  const divisor = getRMDivisor(age);

  if (divisor === 0 || traditionalBalance <= 0) {
    return {
      rmdAmount: 0,
      remainingBalance: traditionalBalance,
      divisor: 0,
    };
  }

  const rmdAmount = traditionalBalance / divisor;
  const remainingBalance = traditionalBalance - rmdAmount;

  return {
    rmdAmount,
    remainingBalance,
    divisor,
  };
}

/**
 * Calculate RMDs for a range of years (e.g., from current age to life expectancy).
 *
 * This function models the RMD schedule assuming:
 * - No investment growth (for simplicity; can be extended)
 * - No additional contributions
 * - Only RMDs are withdrawn from Traditional accounts
 *
 * @param currentAge - Current age of the account owner
 * @param birthYear - Birth year (to determine RMD starting age)
 * @param traditionalBalance - Current Traditional account balance
 * @param lifeExpectancy - Age to project through
 * @returns Array of RMD results by year/age
 */
export function calculateRMDSchedule(
  currentAge: number,
  birthYear: number,
  traditionalBalance: number,
  lifeExpectancy: number
): RMDResult[] {
  const schedule: RMDResult[] = [];
  let balance = traditionalBalance;
  const currentYear = new Date().getFullYear();

  for (let age = currentAge; age <= lifeExpectancy; age++) {
    const year = currentYear + (age - currentAge);
    const subjectToRMD = isSubjectToRMD(birthYear, year);

    if (subjectToRMD && balance > 0) {
      const result = calculateRMD(age, balance);
      schedule.push(result);
      balance = result.remainingBalance;
    } else {
      // No RMD required yet or balance is zero
      schedule.push({
        rmdAmount: 0,
        remainingBalance: balance,
        divisor: 0,
      });
    }
  }

  return schedule;
}

/**
 * Calculate the age at which RMDs begin based on birth year.
 *
 * @param birthYear - Birth year of the account owner
 * @returns Age when RMDs must begin (73 or 75)
 */
export function getRMDStartDate(birthYear: number): number {
  return getRMDStartingAge(birthYear);
}

/**
 * Check if the account owner is currently subject to RMDs.
 *
 * @param birthYear - Birth year of the account owner
 * @returns True if currently subject to RMDs
 */
export function isCurrentlySubjectToRMD(birthYear: number): boolean {
  const currentYear = new Date().getFullYear();
  return isSubjectToRMD(birthYear, currentYear);
}

/**
 * Estimate the year when RMDs will begin.
 *
 * @param birthYear - Birth year of the account owner
 * @returns Calendar year when RMDs begin
 */
export function getRMDStartYear(birthYear: number): number {
  const rmdAge = getRMDStartingAge(birthYear);
  return birthYear + rmdAge;
}
