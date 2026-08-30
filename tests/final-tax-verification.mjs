import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const page = await browser.newPage();

  console.log('=== TAX FEATURES VERIFICATION ===\n');
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  console.log('✓ Page loaded');

  // Dismiss onboarding
  const skipBtn = page.getByRole('button', { name: /Skip/i });
  if (await skipBtn.isVisible({ timeout: 3000 })) {
    await skipBtn.click();
  }
  await page.waitForTimeout(1000);

  // Open inputs drawer
  await page.locator('button[aria-label="Edit Inputs"]').first().click();
  await page.waitForTimeout(1000);
  console.log('✓ Opened inputs drawer');

  // Set ages
  const ageInputs = page.locator('input[type="number"]:visible');
  await ageInputs.first().fill('72');
  await ageInputs.nth(1).fill('73');
  console.log('✓ Set ages: current=72, retirement=73');

  // Expand Account Breakdown
  await page.getByText('Account Breakdown').first().click();
  await page.waitForTimeout(500);
  console.log('✓ Expanded Account Breakdown');

  // Find visible number inputs and fill the first one (Traditional Balance)
  const visibleInputs = page.locator('input[type="number"]:visible');
  const visibleCount = await visibleInputs.count();
  console.log(`Visible inputs: ${visibleCount}`);

  // Fill Traditional Balance (should be around input index 6-8 after age inputs)
  let filled = false;
  for (let i = 0; i < visibleCount; i++) {
    const input = visibleInputs.nth(i);
    const id = await input.getAttribute('id');
    // Skip age inputs (they have low IDs)
    if (id && (id.includes('rb:') || id.includes('rd:'))) continue;

    await input.scrollIntoViewIfNeeded();
    await input.fill('500000');
    console.log(`✓ Filled Traditional Balance: $500,000 (input ${i})`);
    filled = true;
    break;
  }

  if (!filled) {
    console.log('✗ Could not find Traditional Balance input');
  }

  await page.waitForTimeout(500);

  // Check total
  const totalText = await page.getByText('Total Portfolio:').first().textContent();
  console.log(`Total Portfolio: ${totalText}`);

  // Expand Tax Settings
  await page.getByText('Tax Settings').first().click();
  await page.waitForTimeout(500);

  // Select Single
  const singleRadio = page.locator('input[type="radio"]:visible').first();
  await singleRadio.check();
  console.log('✓ Selected Single filing status');

  // Set state tax rate (find a visible input near Tax Settings)
  const taxInputs = page.locator('input[type="number"]:visible');
  const lastTaxInput = taxInputs.last();
  await lastTaxInput.fill('5');
  console.log('✓ Set state tax rate: 5%');

  await page.waitForTimeout(500);

  // Close drawer
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  console.log('✓ Closed drawer');

  // Check Tax Projections tab
  console.log('\n=== TAX PROJECTIONS ===');
  const taxTab = page.getByRole('tab', { name: /Tax Projections/i });
  await taxTab.click();
  await page.waitForTimeout(1000);
  console.log('✓ Clicked Tax Projections tab');

  const table = page.locator('table:visible').first();
  if (await table.isVisible({ timeout: 3000 })) {
    console.log('✓ Tax projection table visible');

    const headers = await page.locator('thead th').allTextContents();
    console.log('Headers:', headers.join(' | '));

    const rows = await page.locator('tbody tr').count();
    console.log(`Data rows: ${rows}`);

    if (rows > 0) {
      console.log('\nFirst 3 rows:');
      for (let i = 0; i < Math.min(3, rows); i++) {
        const row = page.locator('tbody tr').nth(i);
        const cells = await row.locator('td').allTextContents();
        console.log(`  ${i + 1}:`, cells.join(' | '));
      }
    }
  } else {
    console.log('✗ Tax projection table not visible');
    console.log('  (May need more input data to show projections)');
  }

  // Check RMD Schedule
  console.log('\n=== RMD SCHEDULE ===');
  const rmdTab = page.getByRole('tab', { name: /RMD Schedule/i });
  await rmdTab.click();
  await page.waitForTimeout(1000);
  console.log('✓ Clicked RMD Schedule tab');

  const rmdTable = page.locator('table:visible').first();
  if (await rmdTable.isVisible({ timeout: 3000 })) {
    console.log('✓ RMD schedule table visible');

    const rmdHeaders = await page.locator('thead th').allTextContents();
    console.log('Headers:', rmdHeaders.join(' | '));

    const rmdRows = await page.locator('tbody tr').count();
    console.log(`Data rows: ${rmdRows}`);

    if (rmdRows > 0) {
      console.log('\nFirst 3 rows:');
      for (let i = 0; i < Math.min(3, rmdRows); i++) {
        const row = page.locator('tbody tr').nth(i);
        const cells = await row.locator('td').allTextContents();
        console.log(`  ${i + 1}:`, cells.join(' | '));
      }

      console.log('\nExpected at age 73:');
      console.log('  RMD: $18,867.92 ($500k / 26.5)');
    }
  } else {
    console.log('✗ RMD schedule table not visible');
  }

  console.log('\n✓ Verification complete');
  await page.waitForTimeout(3000);
  await browser.close();
})();
