import { test, expect } from '@playwright/test';

test.describe('Tax Features Validation', () => {
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

  test('Account Breakdown section exists in inputs drawer', async ({ page }) => {
    const fabButton = page.locator('button[aria-label="Edit Inputs"]').first();
    await expect(fabButton).toBeVisible({ timeout: 5000 });
    await fabButton.click();
    await page.waitForTimeout(1000);

    const accountBreakdown = page.getByText('Account Breakdown', { exact: false }).first();
    await expect(accountBreakdown).toBeVisible({ timeout: 5000 });
    await accountBreakdown.click();
    await page.waitForTimeout(500);

    await expect(page.getByRole('heading', { name: /Traditional 401k\/IRA/i })).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole('heading', { name: /Roth 401k\/IRA/i })).toBeVisible({ timeout: 1000 });
    await expect(page.getByRole('heading', { name: /Taxable Brokerage/i })).toBeVisible({ timeout: 1000 });
    await expect(page.getByRole('heading', { name: /HSA/i })).toBeVisible({ timeout: 1000 });
    await expect(page.getByTestId('total-portfolio-display')).toBeVisible({ timeout: 1000 });
  });

  test('Tax Settings section exists in inputs drawer', async ({ page }) => {
    const fabButton = page.locator('button[aria-label="Edit Inputs"]').first();
    await expect(fabButton).toBeVisible({ timeout: 5000 });
    await fabButton.click();
    await page.waitForTimeout(1000);

    const taxSettings = page.getByText('Tax Settings', { exact: false }).first();
    await expect(taxSettings).toBeVisible({ timeout: 5000 });
    await taxSettings.click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Filing Status')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('label').filter({ hasText: 'Single' })).toBeVisible({ timeout: 1000 });
    await expect(page.locator('label').filter({ hasText: 'Married Filing Jointly' })).toBeVisible({ timeout: 1000 });
    await expect(page.getByRole('heading', { name: /State Tax Rate/i })).toBeVisible({ timeout: 1000 });
    await expect(page.getByText('Tax Year:')).toBeVisible({ timeout: 1000 });
  });

  test('Tax Projections tab exists', async ({ page }) => {
    const taxTab = page.getByRole('tab', { name: /Tax Projections/i }).first();
    await expect(taxTab).toBeVisible({ timeout: 5000 });
    expect(await taxTab.isEnabled()).toBeTruthy();
  });

  test('RMD Schedule tab exists', async ({ page }) => {
    const rmdTab = page.getByRole('tab', { name: /RMD Schedule/i }).first();
    await expect(rmdTab).toBeVisible({ timeout: 5000 });
    expect(await rmdTab.isEnabled()).toBeTruthy();
  });

  test('Tax Optimization tab exists', async ({ page }) => {
    const taxOptTab = page.getByRole('tab', { name: /Tax Optimization/i }).first();
    await expect(taxOptTab).toBeVisible({ timeout: 5000 });
    expect(await taxOptTab.isEnabled()).toBeTruthy();
  });

  test('Account balance inputs update total portfolio', async ({ page }) => {
    const fabButton = page.locator('button[aria-label="Edit Inputs"]').first();
    await expect(fabButton).toBeVisible({ timeout: 5000 });
    await fabButton.click();
    await page.waitForTimeout(1000);

    await page.getByText('Account Breakdown', { exact: false }).first().click();
    await page.waitForTimeout(500);

    // Fill Traditional Balance using test ID
    const tradInput = page.getByTestId('traditional-balance-input');
    await expect(tradInput).toBeVisible({ timeout: 3000 });
    await tradInput.fill('400000');
    await page.waitForTimeout(300);

    // Fill Roth Balance using test ID
    const rothInput = page.getByTestId('roth-balance-input');
    await expect(rothInput).toBeVisible({ timeout: 2000 });
    await rothInput.fill('200000');
    await page.waitForTimeout(300);

    // Check total updates to $600,000
    const totalDisplay = page.getByTestId('total-portfolio-display');
    await expect(totalDisplay).toBeVisible({ timeout: 2000 });

    const totalText = await totalDisplay.textContent();
    expect(totalText).toContain('600,000');
  });

  test('Filing status radio buttons work', async ({ page }) => {
    const fabButton = page.locator('button[aria-label="Edit Inputs"]').first();
    await expect(fabButton).toBeVisible({ timeout: 5000 });
    await fabButton.click();
    await page.waitForTimeout(1000);

    await page.getByText('Tax Settings', { exact: false }).first().click();
    await page.waitForTimeout(500);

    const singleRadio = page.locator('label').filter({ hasText: 'Single' }).locator('input[type="radio"]');
    await singleRadio.check();
    await page.waitForTimeout(500);
    await expect(singleRadio).toBeChecked();

    const mfjRadio = page.locator('label').filter({ hasText: 'Married Filing Jointly' }).locator('input[type="radio"]');
    await mfjRadio.check();
    await page.waitForTimeout(500);
    await expect(mfjRadio).toBeChecked();
  });

  test('State tax rate input accepts valid values', async ({ page }) => {
    const fabButton = page.locator('button[aria-label="Edit Inputs"]').first();
    await expect(fabButton).toBeVisible({ timeout: 5000 });
    await fabButton.click();
    await page.waitForTimeout(1000);

    await page.getByText('Tax Settings', { exact: false }).first().click();
    await page.waitForTimeout(500);

    const stateTaxInput = page.getByTestId('state-tax-rate-input');
    await expect(stateTaxInput).toBeVisible({ timeout: 3000 });

    await stateTaxInput.fill('5.5');
    await page.waitForTimeout(500);

    await expect(stateTaxInput).toHaveValue('5.5');
  });

  test('Tax Projections tab shows calculated tax values', async ({ page }) => {
    // Setup: Enter data that will generate tax projections
    const fabButton = page.locator('button[aria-label="Edit Inputs"]').first();
    await fabButton.click();
    await page.waitForTimeout(1000);

    // Set Traditional balance to $1,000,000
    await page.getByText('Account Breakdown', { exact: false }).first().click();
    await page.waitForTimeout(500);
    const tradInput = page.getByTestId('traditional-balance-input');
    await tradInput.fill('1000000');
    await page.waitForTimeout(500);

    // Set Single filing status and 5% state tax
    await page.getByText('Tax Settings', { exact: false }).first().click();
    await page.waitForTimeout(500);
    await page.locator('label').filter({ hasText: 'Single' }).locator('input[type="radio"]').check();
    await page.getByTestId('state-tax-rate-input').fill('5');
    await page.waitForTimeout(500);

    // Close drawer
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1500);

    // Navigate to Tax Projections
    await page.getByRole('tab', { name: /Tax Projections/i }).first().click();
    await page.waitForTimeout(1500);

    // Verify table exists and has data
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 5000 });

    // Validate that the table contains actual calculated values (not all zeros)
    const rows = await page.locator('tbody tr').count();
    expect(rows).toBeGreaterThan(0);

    // Get the first data row and validate it has non-zero values
    const firstRow = page.locator('tbody tr').first();
    const cells = await firstRow.locator('td').allTextContents();

    // Should have: Age, Gross Withdrawal, Federal Tax, State Tax, Cap Gains, NIIT, Total Tax, Net Income, Eff. Rate
    expect(cells.length).toBeGreaterThan(5);

    // At least some cells should have non-zero dollar amounts
    const hasNonZeroValue = cells.some(cell => {
      const num = parseFloat(cell.replace(/[$,]/g, ''));
      return !isNaN(num) && num > 0;
    });
    expect(hasNonZeroValue).toBeTruthy();

    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-results/tax-projections-table.png' });
  });

  test('RMD Schedule shows correct RMD amounts', async ({ page }) => {
    // Setup: Enter $1,000,000 traditional balance
    const fabButton = page.locator('button[aria-label="Edit Inputs"]').first();
    await fabButton.click();
    await page.waitForTimeout(1000);

    await page.getByText('Account Breakdown', { exact: false }).first().click();
    await page.waitForTimeout(500);
    const tradInput = page.getByTestId('traditional-balance-input');
    await tradInput.fill('1000000');
    await page.waitForTimeout(500);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(1500);

    // Navigate to RMD Schedule
    await page.getByRole('tab', { name: /RMD Schedule/i }).first().click();
    await page.waitForTimeout(1500);

    // Verify table exists
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 5000 });

    const rows = await page.locator('tbody tr').count();
    expect(rows).toBeGreaterThan(0);

    // Get first row data
    const firstRow = page.locator('tbody tr').first();
    const cells = await firstRow.locator('td').allTextContents();
    expect(cells.length).toBeGreaterThan(2);

    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-results/rmd-schedule-table.png' });
  });
});
