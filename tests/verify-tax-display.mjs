import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  console.log('Opening browser...');
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  console.log('✓ Page loaded');

  // Dismiss onboarding
  const skipBtn = page.getByRole('button', { name: /Skip/i });
  if (await skipBtn.isVisible({ timeout: 3000 })) {
    await skipBtn.click();
    console.log('✓ Dismissed onboarding');
  }

  await page.waitForTimeout(1000);

  // Open inputs drawer
  await page.locator('button[aria-label="Edit Inputs"]').first().click();
  await page.waitForTimeout(1000);
  console.log('✓ Opened inputs drawer');

  // Set current age and retirement age
  const ageInputs = page.locator('input[type="number"]');
  await ageInputs.first().fill('72');
  await ageInputs.nth(1).fill('73');
  console.log('✓ Set age: current=72, retirement=73');

  await page.waitForTimeout(500);

  // Expand Account Breakdown
  await page.getByText('Account Breakdown').first().click();
  await page.waitForTimeout(500);
  console.log('✓ Expanded Account Breakdown');

  // Find Traditional Balance input by label
  const traditionalInput = page.getByLabel('Traditional Balance');
  if (await traditionalInput.isVisible({ timeout: 3000 })) {
    await traditionalInput.fill('500000');
    console.log('✓ Set Traditional balance: $500,000');
  } else {
    console.log('✗ Traditional Balance input not found by label');
  }

  await page.waitForTimeout(500);

  // Check total portfolio
  const totalDisplay = page.getByText('Total Portfolio:').first();
  const totalText = await totalDisplay.textContent();
  console.log(`Total Portfolio: ${totalText}`);

  // Expand Tax Settings
  await page.getByText('Tax Settings').first().click();
  await page.waitForTimeout(500);
  console.log('✓ Expanded Tax Settings');

  // Select Single filing status
  const singleRadio = page.locator('label').filter({ hasText: 'Single' }).locator('input[type="radio"]');
  await singleRadio.check();
  console.log('✓ Selected Single filing status');

  // Set state tax rate
  const stateTaxInput = page.getByLabel('State Tax Rate (%)');
  if (await stateTaxInput.isVisible({ timeout: 2000 })) {
    await stateTaxInput.fill('5');
    console.log('✓ Set state tax rate: 5%');
  }

  await page.waitForTimeout(500);

  // Close drawer
  const closeBtn = page.locator('button[aria-label="Close"]').first();
  if (await closeBtn.isVisible({ timeout: 2000 })) {
    await closeBtn.click();
  }
  await page.waitForTimeout(1500);
  console.log('✓ Closed inputs drawer');

  // Navigate to Tax Projections tab
  console.log('\n=== TAX PROJECTIONS ===');
  await page.getByRole('tab', { name: /Tax Projections/i }).click();
  await page.waitForTimeout(1500);

  const table = page.locator('table').first();
  if (await table.isVisible({ timeout: 3000 })) {
    console.log('✓ Tax projection table visible');

    const headers = await page.locator('thead th').allTextContents();
    console.log('Headers:', headers.join(' | '));

    const rows = await page.locator('tbody tr').count();
    console.log(`Data rows: ${rows}`);

    // Show first 5 rows
    for (let i = 0; i < Math.min(5, rows); i++) {
      const row = page.locator('tbody tr').nth(i);
      const cells = await row.locator('td').allTextContents();
      console.log(`Row ${i + 1}:`, cells.join(' | '));
    }

    console.log('\nExpected for age 73 (Single, $500k traditional, 5% state tax):');
    console.log('  Gross: ~$20,000 (4% withdrawal rate)');
    console.log('  Federal: ~$500-$1,500 (on ~$5k taxable after $15k standard deduction)');
    console.log('  State: ~$1,000 (5% of $20k)');
    console.log('  Net: ~$17,500-$18,500');
  } else {
    console.log('✗ Tax projection table not visible');
    console.log('  This might be because no retirement data is entered yet');
  }

  // Navigate to RMD Schedule tab
  console.log('\n=== RMD SCHEDULE ===');
  await page.getByRole('tab', { name: /RMD Schedule/i }).click();
  await page.waitForTimeout(1500);

  const rmdTable = page.locator('table').first();
  if (await rmdTable.isVisible({ timeout: 3000 })) {
    console.log('✓ RMD schedule table visible');

    const rmdHeaders = await page.locator('thead th').allTextContents();
    console.log('Headers:', rmdHeaders.join(' | '));

    const rmdRows = await page.locator('tbody tr').count();
    console.log(`Data rows: ${rmdRows}`);

    for (let i = 0; i < Math.min(5, rmdRows); i++) {
      const row = page.locator('tbody tr').nth(i);
      const cells = await row.locator('td').allTextContents();
      console.log(`Row ${i + 1}:`, cells.join(' | '));
    }

    console.log('\nExpected RMD at age 73:');
    console.log('  Amount: $18,867.92 ($500,000 / 26.5)');
    console.log('  Divisor: 26.5');
  } else {
    console.log('✗ RMD schedule table not visible');
  }

  console.log('\n✓ Manual verification complete');
  await page.waitForTimeout(5000);
  await browser.close();
})();
