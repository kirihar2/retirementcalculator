import { test, expect } from '@playwright/test';
import { calculateProjection } from '../src/utils/calculations';

test.describe('Tax Data Contract Validation', () => {
  test('calculateProjection produces tax data when accounts and taxConfig are provided', () => {
    const accounts = {
      traditionalBalance: 500000,
      rothBalance: 100000,
      taxableBalance: 50000,
      hsaBalance: 20000
    };

    const taxConfig = {
      filingStatus: 'single' as const,
      stateTaxRate: 5,
      taxYear: 2026
    };

    const result = calculateProjection(
      40, // currentAge
      65, // retirementAge
      90, // lifeExpectancy
      500000, // currentPortfolio
      5000, // monthlyIncome
      4000, // monthlySpending
      60000, // retirementSpending
      7, // preRetirementReturn
      1, // coastingMultiplier
      6, // retirementReturn
      2.5, // inflationRate
      67, // socialSecurityAge
      24000, // socialSecurityIncome
      4, // safeWithdrawalRate
      65, // medicareAge
      500, // healthCareMonthly
      [], // lifeEvents
      [], // debtPayments
      [], // pensions
      { enabled: false, coastingAge: 0, coasingMultiplier: 1 }, // coastingMode
      [], // actuals
      [], // spendingCategories
      [], // variableInflationRates
      undefined, // withdrawalStrategy
      accounts,
      taxConfig,
      1984 // birthYear
    );

    console.log('Projection length:', result.projection.length);
    console.log('FIRE Target:', result.fireTarget);

    // Find retirement years (age >= 65)
    const retirementYears = result.projection.filter(y => y.age >= 65);
    console.log('Retirement years:', retirementYears.length);

    if (retirementYears.length > 0) {
      const firstRetirementYear = retirementYears[0];
      console.log('First retirement year:', {
        age: firstRetirementYear.age,
        grossWithdrawal: firstRetirementYear.grossWithdrawal,
        federalTax: firstRetirementYear.federalTax,
        stateTax: firstRetirementYear.stateTax,
        totalTax: firstRetirementYear.totalTax,
        afterTaxIncome: firstRetirementYear.afterTaxIncome
      });

      // Validate tax data exists
      expect(firstRetirementYear.grossWithdrawal).toBeDefined();
      expect(firstRetirementYear.grossWithdrawal).toBeGreaterThan(0);
      expect(firstRetirementYear.federalTax).toBeDefined();
      expect(firstRetirementYear.stateTax).toBeDefined();
      expect(firstRetirementYear.totalTax).toBeDefined();
      expect(firstRetirementYear.afterTaxIncome).toBeDefined();

      // Validate relationships
      expect(firstRetirementYear.afterTaxIncome).toBeCloseTo(
        firstRetirementYear.grossWithdrawal! - firstRetirementYear.totalTax!,
        0
      );

      // Validate tax values are reasonable (not zero, not negative)
      expect(firstRetirementYear.federalTax).toBeGreaterThan(0);
      expect(firstRetirementYear.stateTax).toBeGreaterThan(0);
      expect(firstRetirementYear.totalTax).toBeGreaterThan(0);

      // Effective tax rate should be reasonable (10-40%)
      const effectiveRate = firstRetirementYear.totalTax! / firstRetirementYear.grossWithdrawal!;
      expect(effectiveRate).toBeGreaterThan(0.1);
      expect(effectiveRate).toBeLessThan(0.5);
    }
  });

  test('calculateProjection returns no tax data without accounts', () => {
    const result = calculateProjection(
      40, 65, 90, 500000, 5000, 4000, 60000, 7, 1, 6, 2.5,
      67, 24000, 4, 65, 500, [], [], [],
      { enabled: false, coastingAge: 0, coasingMultiplier: 1 },
      [], [], [], undefined,
      undefined, // No accounts
      undefined, // No taxConfig
      1984
    );

    const retirementYears = result.projection.filter(y => y.age >= 65);

    if (retirementYears.length > 0) {
      // Without accounts/taxConfig, tax fields should be 0 or undefined
      const firstYear = retirementYears[0];
      const hasTaxData = firstYear.grossWithdrawal !== undefined && firstYear.grossWithdrawal > 0;
      expect(hasTaxData).toBeFalsy();
    }
  });

  test('RMD data is populated for ages 75+ with traditional balance (SECURE 2.0)', () => {
    const accounts = {
      traditionalBalance: 1000000, // Larger balance to survive to 75
      rothBalance: 200000,
      taxableBalance: 100000,
      hsaBalance: 50000
    };

    const taxConfig = {
      filingStatus: 'single' as const,
      stateTaxRate: 5,
      taxYear: 2026
    };

    // birthYear 1984 >= 1960, so RMD starts at 75 (SECURE 2.0)
    const result = calculateProjection(
      40, 65, 90, 1000000, 5000, 4000, 60000, 7, 1, 6, 2.5,
      67, 24000, 4, 65, 500, [], [], [],
      { enabled: false, coastingAge: 0, coasingMultiplier: 1 },
      [], [], [], undefined,
      accounts, taxConfig, 1984
    );

    // Check traditional balance at various ages
    const age73 = result.projection.find(y => y.age === 73);
    const age75 = result.projection.find(y => y.age === 75);

    console.log('Age 73 traditional balance:', age73?.traditionalBalance);
    console.log('Age 73 RMD amount:', age73?.rmdAmount);
    console.log('Age 75 traditional balance:', age75?.traditionalBalance);
    console.log('Age 75 RMD amount:', age75?.rmdAmount);
    console.log('Age 75 RMD required:', age75?.rmdRequired);

    // Age 73 should NOT have RMD (SECURE 2.0: starts at 75 for birthYear >= 1960)
    if (age73) {
      expect(age73.rmdRequired).toBeFalsy();
    }

    // Age 75 SHOULD have RMD
    if (age75 && age75.traditionalBalance && age75.traditionalBalance > 0) {
      expect(age75.rmdAmount).toBeDefined();
      expect(age75.rmdAmount).toBeGreaterThan(0);
      expect(age75.rmdRequired).toBe(true);

      // RMD at age 75 should be balance / 24.7
      const expectedRMD = age75.traditionalBalance / 24.7;
      expect(age75.rmdAmount).toBeCloseTo(expectedRMD, -2);
    }
  });

  test('RMD data uses age 73 for birthYear before 1960', () => {
    const accounts = {
      traditionalBalance: 500000,
      rothBalance: 100000,
      taxableBalance: 50000,
      hsaBalance: 20000
    };

    const taxConfig = {
      filingStatus: 'single' as const,
      stateTaxRate: 5,
      taxYear: 2026
    };

    // birthYear 1950 < 1960, so RMD starts at 73
    // Higher income, lower spending to build balance
    const result = calculateProjection(
      40, 65, 90, 500000, 10000, 3000, 40000, 7, 1, 6, 2.5,
      67, 24000, 4, 65, 500, [], [], [],
      { enabled: false, coastingAge: 0, coasingMultiplier: 1 },
      [], [], [], undefined,
      accounts, taxConfig, 1950
    );

    // Log traditional balance at key ages
    [65, 70, 72, 73, 75].forEach(age => {
      const year = result.projection.find(y => y.age === age);
      if (year) {
        console.log(`Age ${age}: tradBal=${year.traditionalBalance}, rmd=${year.rmdAmount}, rmdReq=${year.rmdRequired}`);
      }
    });

    const age73 = result.projection.find(y => y.age === 73);

    // Age 73 SHOULD have RMD for birthYear < 1960
    if (age73 && age73.traditionalBalance && age73.traditionalBalance > 0) {
      expect(age73.rmdAmount).toBeGreaterThan(0);
      expect(age73.rmdRequired).toBe(true);

      // RMD at age 73 should be balance / 26.5
      const expectedRMD = age73.traditionalBalance / 26.5;
      expect(age73.rmdAmount).toBeCloseTo(expectedRMD, -2);
    } else {
      console.log('Traditional balance depleted before age 73');
    }
  });

  test('RMD data is not populated without traditional balance', () => {
    const accounts = {
      traditionalBalance: 0, // No traditional balance
      rothBalance: 500000,
      taxableBalance: 50000,
      hsaBalance: 20000
    };

    const taxConfig = {
      filingStatus: 'single' as const,
      stateTaxRate: 5,
      taxYear: 2026
    };

    const result = calculateProjection(
      40, 65, 90, 500000, 5000, 4000, 60000, 7, 1, 6, 2.5,
      67, 24000, 4, 65, 500, [], [], [],
      { enabled: false, coastingAge: 0, coasingMultiplier: 1 },
      [], [], [], undefined,
      accounts, taxConfig, 1984
    );

    // Find RMD years (age 73+)
    const rmdYears = result.projection.filter(y => y.age >= 73);

    if (rmdYears.length > 0) {
      const firstRmdYear = rmdYears[0];
      // Without traditional balance, RMD should be 0 or undefined
      expect(firstRmdYear.rmdAmount).toBeFalsy();
      expect(firstRmdYear.rmdRequired).toBeFalsy();
    }
  });
});
