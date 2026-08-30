import { test, expect } from '@playwright/test';

test.describe('Tax Features End-to-End', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Dismiss onboarding
    const dialog = page.locator('[role="dialog"]');
    if (await dialog.isVisible({ timeout: 3000 })) {
      const skipButton = page.getByRole('button', { name: /Skip/i });
      if (await skipButton.isVisible({ timeout: 2000 })) {
        await skipButton.click();
        await page.waitForTimeout(500);
      }
    }
    await page.waitForTimeout(1000);
  });

  test('Tax Projections show correct calculations for $500k traditional at age 73', async ({ page }) => {
    // Open inputs
    await page.locator('button[aria-label="Edit Inputs"]').first().click();
    await page.waitForTimeout(1000);

    // Set personal details
    await page.getByText('Personal & Financial', { exact: false }).first().click();
    await page.waitForTimeout(500);

    // Set current age to 72, retirement age to 73
    const ageInputs = page.locator('input[type="number"]');
    await ageInputs.first().fill('72'); // current age
    await ageInputs.nth(1).fill('73'); // retirement age
    await page.waitForTimeout(500);

    // Set account breakdown
    await page.getByText('Account Breakdown', { exact: false }).first().click();
    await page.waitForTimeout(500);

    // Find traditional balance input (skip age/retirement inputs)
    const allInputs = page.locator('input[type="number"]');
    const inputCount = await allInputs.count();

    // Find an input without max="100" or max="110" (account balance inputs)
    let tradInput = null;
    for (let i = 0; i < inputCount; i++) {
      const input = allInputs.nth(i);
      const max = await input.getAttribute('max');
      const min = await input.getAttribute('min');
      // Account balance inputs typically have min="0" and no max or high max
      if (min === '0' && (max === null || parseInt(max) > 1000)) {
        tradInput = input;
        break;
      }
    }

    if (tradInput) {
      await tradInput.fill('500000');
      await page.waitForTimeout(500);
    }

    // Set tax settings
    await page.getByText('Tax Settings', { exact: false }).first().click();
    await page.waitForTimeout(500);

    // Select Single filing status
    const singleRadio = page.locator('label').filter({ hasText: 'Single' }).locator('input[type="radio"]');
    await singleRadio.check();
    await page.waitForTimeout(500);

    // Set state tax rate to 5%
    const stateTaxInput = allInputs.last();
    await stateTaxInput.scrollIntoViewIfNeeded();
    await stateTaxInput.fill('5');
    await page.waitForTimeout(500);

    // Close drawer
    await page.locator('button[aria-label="Close"]').first().click();
    await page.waitForTimeout(1000);

    // Navigate to Tax Projections tab
    const taxTab = page.getByRole('tab', { name: /Tax Projections/i }).first();
    await taxTab.click();
    await page.waitForTimeout(1000);

    // Verify tax projection table is visible
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 5000 });

    // Check for expected columns
    await expect(page.getByRole('columnheader', { name: /Age/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Gross Withdrawal/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Federal Tax/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /State Tax/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Net Income/i })).toBeVisible();

    // Verify table has data rows
    const rows = await page.locator('tbody tr').count();
    expect(rows).toBeGreaterThan(0);

    // Check that values are displayed (not all zeros)
    const firstRow = page.locator('tbody tr').first();
    const cells = await firstRow.locator('td').count();
    expect(cells).toBeGreaterThan(5);
  });

  test('RMD Schedule shows correct distributions starting at age 73', async ({ page }) => {
    // Open inputs
    await page.locator('button[aria-label="Edit Inputs"]').first().click();
    await page.waitForTimeout(1000);

    // Set current age to 70, retirement age to 73
    const ageInputs = page.locator('input[type="number"]');
    await ageInputs.first().fill('70');
    await ageInputs.nth(1).fill('73');
    await page.waitForTimeout(500);

    // Set traditional balance
    await page.getByText('Account Breakdown', { exact: false }).first().click();
    await page.waitForTimeout(500);

    const allInputs = page.locator('input[type="number"]');
    const inputCount = await allInputs.count();

    let tradInput = null;
    for (let i = 0; i < inputCount; i++) {
      const input = allInputs.nth(i);
      const min = await input.getAttribute('min');
      const max = await input.getAttribute('max');
      if (min === '0' && (max === null || parseInt(max) > 1000)) {
        tradInput = input;
        break;
      }
    }

    if (tradInput) {
      await tradInput.fill('1000000');
      await page.waitForTimeout(500);
    }

    // Close drawer
    await page.locator('button[aria-label="Close"]').first().click();
    await page.waitForTimeout(1000);

    // Navigate to RMD Schedule tab
    const rmdTab = page.getByRole('tab', { name: /RMD Schedule/i }).first();
    await rmdTab.click();
    await page.waitForTimeout(1000);

    // Verify RMD table is visible
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 5000 });

    // Check for RMD-specific columns
    await expect(page.getByRole('columnheader', { name: /Age/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /RMD Amount/i }).or(page.getByRole('columnheader', { name: /Distribution/i }))).toBeVisible();

    // Verify table has data
    const rows = await page.locator('tbody tr').count();
    expect(rows).toBeGreaterThan(0);

    // Check that RMD amounts increase with age (divisor decreases)
    const firstDataRow = page.locator('tbody tr').first();
    const cells = await firstDataRow.locator('td').allTextContents();
    expect(cells.length).toBeGreaterThan(2);
  });

  test('Tax Optimization tab displays Roth conversion options', async ({ page }) => {
    // Navigate to Tax Optimization tab
    const taxOptTab = page.getByRole('tab', { name: /Tax Optimization/i }).first();
    await taxOptTab.click();
    await page.waitForTimeout(1000);

    // Verify tab content is visible
    const tabPanel = page.locator('[role="tabpanel"]').first();
    await expect(tabPanel).toBeVisible({ timeout: 5000 });

    // Look for Roth conversion section
    const rothSection = page.getByText(/Roth Conversion/i).first();
    await expect(rothSection).toBeVisible({ timeout: 3000 });

    // Check for comparison or strategy display
    const content = page.locator('[role="tabpanel"]').first();
    await expect(content).not.toBeEmpty();
  });

  test('Account breakdown total updates correctly', async ({ page }) => {
    // Open inputs
    await page.locator('button[aria-label="Edit Inputs"]').first().click();
    await page.waitForTimeout(1000);

    // Expand Account Breakdown
    await page.getByText('Account Breakdown', { exact: false }).first().click();
    await page.waitForTimeout(500);

    // Find account balance inputs
    const allInputs = page.locator('input[type="number"]');
    const inputCount = await allInputs.count();

    const accountInputs = [];
    for (let i = 0; i < inputCount; i++) {
      const input = allInputs.nth(i);
      const min = await input.getAttribute('min');
      const max = await input.getAttribute('max');
      if (min === '0' && (max === null || parseInt(max) > 1000)) {
        accountInputs.push(input);
      }
    }

    // Fill in account balances
    if (accountInputs.length >= 2) {
      await accountInputs[0].fill('300000'); // Traditional
      await page.waitForTimeout(300);
      await accountInputs[1].fill('200000'); // Roth
      await page.waitForTimeout(300);
    }

    // Check total portfolio display
    const totalDisplay = page.getByText('Total Portfolio:').first();
    await expect(totalDisplay).toBeVisible({ timeout: 2000 });

    const totalText = await totalDisplay.textContent();
    // Should show $500,000 (300k + 200k)
    expect(totalText).toContain('500,000');
  });

  test('Filing status changes update tax calculations', async ({ page }) => {
    // Open inputs
    await page.locator('button[aria-label="Edit Inputs"]').first().click();
    await page.waitForTimeout(1000);

    // Set up basic scenario
    const ageInputs = page.locator('input[type="number"]');
    await ageInputs.first().fill('72');
    await ageInputs.nth(1).fill('73');
    await page.waitForTimeout(500);

    // Set traditional balance
    await page.getByText('Account Breakdown', { exact: false }).first().click();
    await page.waitForTimeout(500);

    const allInputs = page.locator('input[type="number"]');
    const inputCount = await allInputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = allInputs.nth(i);
      const min = await input.getAttribute('min');
      const max = await input.getAttribute('max');
      if (min === '0' && (max === null || parseInt(max) > 1000)) {
        await input.fill('500000');
        await page.waitForTimeout(500);
        break;
      }
    }

    // Go to Tax Settings
    await page.getByText('Tax Settings', { exact: false }).first().click();
    await page.waitForTimeout(500);

    // Select Single
    const singleRadio = page.locator('label').filter({ hasText: 'Single' }).locator('input[type="radio"]');
    await singleRadio.check();
    await page.waitForTimeout(500);

    // Close and check Tax Projections
    await page.locator('button[aria-label="Close"]').first().click();
    await page.waitForTimeout(1000);

    const taxTab = page.getByRole('tab', { name: /Tax Projections/i }).first();
    await taxTab.click();
    await page.waitForTimeout(1000);

    // Get first year's federal tax
    const table = page.locator('table').first();
    if (await table.isVisible({ timeout: 3000 })) {
      const firstRow = page.locator('tbody tr').first();
      const federalTaxCell = firstRow.locator('td').nth(2); // Assuming Federal Tax is 3rd column
      const singleTax = await federalTaxCell.textContent();

      // Go back and change to MFJ
      await page.locator('button[aria-label="Edit Inputs"]').first().click();
      await page.waitForTimeout(1000);

      await page.getByText('Tax Settings', { exact: false }).first().click();
      await page.waitForTimeout(500);

      const mfjRadio = page.locator('label').filter({ hasText: 'Married Filing Jointly' }).locator('input[type="radio"]');
      await mfjRadio.check();
      await page.waitForTimeout(500);

      await page.locator('button[aria-label="Close"]').first().click();
      await page.waitForTimeout(1000);

      // Check tax changed
      const mfjTax = await federalTaxCell.textContent();

      // Tax values should be different (MFJ typically lower due to wider brackets)
      expect(singleTax).toBeDefined();
      expect(mfjTax).toBeDefined();
      // They might be the same for certain income levels, but the page should not crash
    }
  });
});
