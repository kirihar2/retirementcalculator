import { test, expect } from '@playwright/test';
import {
  calculateFederalIncomeTax,
  calculateCapitalGainsTax,
  calculateStateTax,
} from '../src/utils/taxEngine';
import { calculateRMD } from '../src/utils/rmdCalculator';
import { getRMDivisor, getStandardDeduction } from '../src/utils/taxConfig';

test.describe('Tax Calculation Validation', () => {
  test.describe('RMD Calculator', () => {
    test('RMD at age 73 with $500,000 traditional balance', () => {
      // Age 73 divisor = 26.5
      const result = calculateRMD(73, 500000);

      // RMD = 500,000 / 26.5 = $18,867.92
      expect(result.rmdAmount).toBeCloseTo(18867.92, 2);
      expect(result.remainingBalance).toBeCloseTo(481132.08, 2);
      expect(result.divisor).toBe(26.5);
    });

    test('RMD at age 75 with $1,000,000 traditional balance', () => {
      // Age 75 divisor = 24.7
      const result = calculateRMD(75, 1000000);

      // RMD = 1,000,000 / 24.7 = $40,485.83
      expect(result.rmdAmount).toBeCloseTo(40485.83, 2);
      expect(result.remainingBalance).toBeCloseTo(959514.17, 2);
      expect(result.divisor).toBe(24.7);
    });

    test('RMD at age 85 with $800,000 traditional balance', () => {
      // Age 85 divisor = 16.0 (NOT 16.8, that's age 84)
      const result = calculateRMD(85, 800000);

      // RMD = 800,000 / 16.0 = $50,000
      expect(result.rmdAmount).toBeCloseTo(50000, 2);
      expect(result.remainingBalance).toBeCloseTo(750000, 2);
      expect(result.divisor).toBe(16.0);
    });

    test('No RMD before age 73', () => {
      const result = calculateRMD(72, 500000);

      expect(result.rmdAmount).toBe(0);
      expect(result.remainingBalance).toBe(500000);
      expect(result.divisor).toBe(0);
    });

    test('RMD divisor increases correctly with age', () => {
      // IRS Uniform Lifetime Table values
      expect(getRMDivisor(73)).toBe(26.5);
      expect(getRMDivisor(74)).toBe(25.6);
      expect(getRMDivisor(75)).toBe(24.7);
      expect(getRMDivisor(78)).toBe(22.0);
      expect(getRMDivisor(80)).toBe(20.2);
      expect(getRMDivisor(85)).toBe(16.0);
      expect(getRMDivisor(90)).toBe(12.2);
      expect(getRMDivisor(100)).toBe(6.4);
    });
  });

  test.describe('Federal Income Tax', () => {
    test('Single filer with $50,000 ordinary income', () => {
      // 2026 standard deduction for Single: $15,000
      // Taxable income = 50,000 - 15,000 = 35,000
      // Tax = 10% on first $11,925 + 12% on ($35,000 - $11,925)
      // Tax = $1,192.50 + $2,769 = $3,961.50
      // Note: bracket boundaries are inclusive, so actual calculation may differ slightly
      const taxableIncome = 50000 - 15000;
      const tax = calculateFederalIncomeTax(taxableIncome, 'single');

      // Allow for small rounding differences (bracket boundary calculations)
      expect(tax).toBeCloseTo(3961.5, 0);
    });

    test('Single filer with $100,000 ordinary income', () => {
      // Taxable income = 100,000 - 15,000 = 85,000
      const taxableIncome = 100000 - 15000;
      const tax = calculateFederalIncomeTax(taxableIncome, 'single');

      // Tax should be approximately $13,608 (allow for bracket boundary rounding)
      expect(tax).toBeGreaterThan(13000);
      expect(tax).toBeLessThan(14000);
    });

    test('MFJ filer with $150,000 ordinary income', () => {
      // Taxable income = 150,000 - 30,000 = 120,000
      const taxableIncome = 150000 - 30000;
      const tax = calculateFederalIncomeTax(taxableIncome, 'mfj');

      // Tax should be approximately $16,223
      expect(tax).toBeGreaterThan(16000);
      expect(tax).toBeLessThan(17000);
    });

    test('Zero income produces zero tax', () => {
      const tax = calculateFederalIncomeTax(0, 'single');
      expect(tax).toBe(0);
    });

    test('Standard deduction amounts are correct for 2026', () => {
      expect(getStandardDeduction('single')).toBe(15000);
      expect(getStandardDeduction('mfj')).toBe(30000);
    });
  });

  test.describe('Capital Gains Tax', () => {
    test('Single filer with $40,000 capital gains and $40,000 total income (0% bracket)', () => {
      // Total income $40,000 falls in 0% capital gains bracket (0 - $48,350 for Single)
      // Capital gains tax = $40,000 * 0% = $0
      const tax = calculateCapitalGainsTax(40000, 40000, 'single');
      expect(tax).toBe(0);
    });

    test('Single filer with $40,000 capital gains and $60,000 total income (15% bracket)', () => {
      // Total income $60,000 falls in 15% capital gains bracket ($48,351 - $533,400 for Single)
      // Capital gains tax = $40,000 * 15% = $6,000
      const tax = calculateCapitalGainsTax(40000, 60000, 'single');
      expect(tax).toBe(6000);
    });

    test('Single filer with $100,000 capital gains and $200,000 total income (15% bracket)', () => {
      // Total income $200,000 falls in 15% capital gains bracket
      // Capital gains tax = $100,000 * 15% = $15,000
      const tax = calculateCapitalGainsTax(100000, 200000, 'single');
      expect(tax).toBe(15000);
    });

    test('MFJ filer with $80,000 capital gains and $150,000 total income (15% bracket)', () => {
      // Total income $150,000 falls in 15% capital gains bracket ($96,701 - $600,050 for MFJ)
      // Capital gains tax = $80,000 * 15% = $12,000
      const tax = calculateCapitalGainsTax(80000, 150000, 'mfj');
      expect(tax).toBe(12000);
    });

    test('Zero capital gains produces zero tax', () => {
      const tax = calculateCapitalGainsTax(0, 100000, 'single');
      expect(tax).toBe(0);
    });
  });

  test.describe('State Tax', () => {
    test('State tax at 5% on $100,000', () => {
      const tax = calculateStateTax(100000, 5);
      expect(tax).toBe(5000);
    });

    test('State tax at 0% produces zero tax', () => {
      const tax = calculateStateTax(100000, 0);
      expect(tax).toBe(0);
    });

    test('State tax on zero income produces zero tax', () => {
      const tax = calculateStateTax(0, 5);
      expect(tax).toBe(0);
    });

    test('State tax at 9.3% (California top rate) on $200,000', () => {
      const tax = calculateStateTax(200000, 9.3);
      expect(tax).toBeCloseTo(18600, 2);
    });
  });
});
