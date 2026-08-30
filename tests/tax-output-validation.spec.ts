import { test, expect } from '@playwright/test';

test.describe('Tax Output Validation', () => {
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

  test('Tax Projections show non-zero values with complete input data', async ({ page }) => {
    // Open inputs drawer
    const fabButton = page.locator('button[aria-label="Edit Inputs"]').first();
    await fabButton.click();
    await page.waitForTimeout(1000);

    // Expand Personal & Financial using JavaScript
    await page.evaluate(() => {
      const accordions = document.querySelectorAll('.MuiAccordion-root');
      if (accordions[0]) {
        const button = accordions[0].querySelector('button');
        if (button) button.click();
      }
    });
    await page.waitForTimeout(1000);

    // Set current age to 40
    const visibleInputs = page.locator('input[type="number"]:visible');
    await visibleInputs.first().click();
    await visibleInputs.first().type('40');
    await page.waitForTimeout(300);

    // Set retirement age to 65
    await visibleInputs.nth(1).click();
    await visibleInputs.nth(1).type('65');
    await page.waitForTimeout(300);

    // Scroll down to see more inputs
    await page.locator('.MuiAccordionDetails-root').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Find portfolio input by looking for inputs with higher max values
    const allVisibleInputs = page.locator('input[type="number"]:visible');
    const inputCount = await allVisibleInputs.count();

    let portfolioInput = null;
    for (let i = 0; i < inputCount; i++) {
      const input = allVisibleInputs.nth(i);
      const max = await input.getAttribute('max');
      if (max && parseInt(max) > 1000) {
        portfolioInput = input;
        break;
      }
    }

    if (portfolioInput) {
      await portfolioInput.click();
      await portfolioInput.type('500000');
      await page.waitForTimeout(300);
    }

    // Find spending input (monthly spending, typically has lower max)
    const spendingInputs = page.locator('input[type="number"]:visible');
    const spendingCount = await spendingInputs.count();

    for (let i = 0; i < spendingCount; i++) {
      const input = spendingInputs.nth(i);
      const max = await input.getAttribute('max');
      const min = await input.getAttribute('min');
      // Monthly spending typically has min=0 and max around 100000
      if (min === '0' && max && parseInt(max) >= 10000 && parseInt(max) <= 100000) {
        await input.click();
        await input.type('60000');
        await page.waitForTimeout(300);
        break;
      }
    }

    // Set account breakdown
    await page.getByText('Account Breakdown', { exact: false }).first().click();
    await page.waitForTimeout(500);

    const tradInput = page.getByTestId('traditional-balance-input');
    await tradInput.click();
    await tradInput.type('500000');
    await page.waitForTimeout(500);

    // Set tax settings
    await page.getByText('Tax Settings', { exact: false }).first().click();
    await page.waitForTimeout(500);

    const singleRadio = page.locator('label').filter({ hasText: 'Single' }).locator('input[type="radio"]');
    await singleRadio.check();

    const stateTaxInput = page.getByTestId('state-tax-rate-input');
    await stateTaxInput.click();
    await stateTaxInput.type('5');
    await page.waitForTimeout(500);

    // Close drawer
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2000);

    // Navigate to Tax Projections
    const taxTab = page.getByRole('tab', { name: /Tax Projections/i }).first();
    await taxTab.click();
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'test-results/tax-projections-complete.png' });

    // Verify table exists
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 5000 });

    // Get all rows
    const rows = await page.locator('tbody tr').count();
    expect(rows).toBeGreaterThan(0);

    // Get first data row (not the total row)
    const firstDataRow = page.locator('tbody tr').first();
    const cells = await firstDataRow.locator('td').allTextContents();

    console.log('First row cells:', cells);

    // Validate structure: Age, Gross Withdrawal, Federal Tax, State Tax, Cap Gains, NIIT, Total Tax, Net Income, Eff. Rate
    expect(cells.length).toBe(9);

    // Parse values
    const age = parseInt(cells[0]);
    const grossWithdrawal = parseFloat(cells[1].replace(/[$,]/g, ''));
    const federalTax = parseFloat(cells[2].replace(/[$,]/g, ''));
    const stateTax = parseFloat(cells[3].replace(/[$,]/g, ''));
    const totalTax = parseFloat(cells[6].replace(/[$,]/g, ''));
    const netIncome = parseFloat(cells[7].replace(/[$,]/g, ''));

    // Validate non-zero values (projections should have data)
    expect(grossWithdrawal).toBeGreaterThan(0);
    expect(totalTax).toBeGreaterThan(0);
    expect(netIncome).toBeGreaterThan(0);

    // Validate relationships
    // Net income should be gross withdrawal minus total tax
    expect(netIncome).toBeCloseTo(grossWithdrawal - totalTax, 0);

    // Federal tax should be non-zero for typical retirement income
    expect(federalTax).toBeGreaterThan(0);

    // State tax at 5% should be approximately 5% of gross withdrawal
    const expectedStateTax = grossWithdrawal * 0.05;
    expect(stateTax).toBeCloseTo(expectedStateTax, -2); // within $100
  });

  test('RMD Schedule shows correct RMD at age 73', async ({ page }) => {
    // Open inputs
    const fabButton = page.locator('button[aria-label="Edit Inputs"]').first();
    await fabButton.click();
    await page.waitForTimeout(1000);

    // Expand Personal & Financial - click the accordion header
    const personalAccordion = page.locator('[data-testid="personal-financial-accordion"]').first();
    if (await personalAccordion.isVisible({ timeout: 2000 })) {
      await personalAccordion.click();
    } else {
      // Fallback: click on the text
      await page.locator('text=Personal & Financial').first().click();
    }
    await page.waitForTimeout(1000);

    const visibleInputs = page.locator('input[type="number"]:visible');
    await visibleInputs.first().fill('40');
    await visibleInputs.nth(1).fill('65');
    await page.waitForTimeout(300);

    await visibleInputs.nth(2).fill('500000');
    await page.waitForTimeout(300);

    await visibleInputs.nth(3).fill('60000');
    await page.waitForTimeout(300);

    // Set traditional balance
    await page.getByText('Account Breakdown', { exact: false }).first().click();
    await page.waitForTimeout(500);

    const tradInput = page.getByTestId('traditional-balance-input');
    await tradInput.click();
    await tradInput.type('500000');
    await page.waitForTimeout(500);

    // Close drawer
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2000);

    // Navigate to RMD Schedule
    const rmdTab = page.getByRole('tab', { name: /RMD Schedule/i }).first();
    await rmdTab.click();
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'test-results/rmd-schedule-complete.png' });

    // Verify table
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 5000 });

    const rows = await page.locator('tbody tr').count();
    expect(rows).toBeGreaterThan(0);

    // Find the row for age 73 (RMD starting age)
    let rmdAt73 = null;
    for (let i = 0; i < rows; i++) {
      const row = page.locator('tbody tr').nth(i);
      const cells = await row.locator('td').allTextContents();
      if (cells[0] === '73') {
        rmdAt73 = cells;
        break;
      }
    }

    if (rmdAt73) {
      console.log('RMD at age 73:', rmdAt73);

      const rmdAmount = parseFloat(rmdAt73[1].replace(/[$,]/g, ''));

      // Expected RMD at 73: $500,000 / 26.5 = $18,867.92
      const expectedRMD = 500000 / 26.5;
      expect(rmdAmount).toBeCloseTo(expectedRMD, 0); // within $1
    }
  });
});
