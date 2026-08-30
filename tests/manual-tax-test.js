const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  
  // Dismiss onboarding
  const skipBtn = page.getByRole('button', { name: /Skip/i });
  if (await skipBtn.isVisible({ timeout: 3000 })) {
    await skipBtn.click();
  }
  
  console.log('✓ Page loaded and onboarding dismissed');
  
  // Open inputs drawer
  await page.locator('button[aria-label="Edit Inputs"]').first().click();
  await page.waitForTimeout(1000);
  console.log('✓ Opened inputs drawer');
  
  // Expand Account Breakdown
  await page.getByText('Account Breakdown').first().click();
  await page.waitForTimeout(500);
  console.log('✓ Expanded Account Breakdown section');
  
  // Find account balance inputs
  const inputs = page.locator('input[type="number"]');
  const count = await inputs.count();
  console.log(`Found ${count} number inputs`);
  
  // Fill traditional balance (find input with min="0" and no/low max)
  for (let i = 0; i < count; i++) {
    const input = inputs.nth(i);
    const min = await input.getAttribute('min');
    const max = await input.getAttribute('max');
    if (min === '0' && (max === null || parseInt(max) > 1000)) {
      await input.fill('500000');
      console.log('✓ Filled Traditional balance: $500,000');
      break;
    }
  }
  
  await page.waitForTimeout(500);
  
  // Check total
  const totalText = await page.getByText('Total Portfolio:').first().textContent();
  console.log(`Total Portfolio display: ${totalText}`);
  
  // Expand Tax Settings
  await page.getByText('Tax Settings').first().click();
  await page.waitForTimeout(500);
  console.log('✓ Expanded Tax Settings section');
  
  // Select Single
  await page.locator('label').filter({ hasText: 'Single' }).locator('input[type="radio"]').check();
  console.log('✓ Selected Single filing status');
  
  // Set state tax rate
  const lastInput = inputs.last();
  await lastInput.fill('5');
  console.log('✓ Set state tax rate: 5%');
  
  // Close drawer
  const closeBtn = page.locator('button[aria-label="Close"]').first();
  if (await closeBtn.isVisible({ timeout: 2000 })) {
    await closeBtn.click();
  }
  await page.waitForTimeout(1000);
  console.log('✓ Closed inputs drawer');
  
  // Click Tax Projections tab
  await page.getByRole('tab', { name: /Tax Projections/i }).click();
  await page.waitForTimeout(1000);
  console.log('✓ Clicked Tax Projections tab');
  
  // Check table
  const table = page.locator('table').first();
  if (await table.isVisible({ timeout: 3000 })) {
    console.log('✓ Tax projection table is visible');
    
    const rows = await page.locator('tbody tr').count();
    console.log(`Table has ${rows} data rows`);
    
    // Get headers
    const headers = await page.locator('thead th').allTextContents();
    console.log('Table headers:', headers.join(' | '));
    
    // Get first 3 rows
    for (let i = 0; i < Math.min(3, rows); i++) {
      const row = page.locator('tbody tr').nth(i);
      const cells = await row.locator('td').allTextContents();
      console.log(`Row ${i + 1}:`, cells.join(' | '));
    }
  } else {
    console.log('✗ Tax projection table not visible');
  }
  
  // Click RMD Schedule tab
  await page.getByRole('tab', { name: /RMD Schedule/i }).click();
  await page.waitForTimeout(1000);
  console.log('\n✓ Clicked RMD Schedule tab');
  
  const rmdTable = page.locator('table').first();
  if (await rmdTable.isVisible({ timeout: 3000 })) {
    console.log('✓ RMD schedule table is visible');
    const rmdRows = await page.locator('tbody tr').count();
    console.log(`RMD table has ${rmdRows} data rows`);
    
    const rmdHeaders = await page.locator('thead th').allTextContents();
    console.log('RMD headers:', rmdHeaders.join(' | '));
    
    for (let i = 0; i < Math.min(3, rmdRows); i++) {
      const row = page.locator('tbody tr').nth(i);
      const cells = await row.locator('td').allTextContents();
      console.log(`RMD Row ${i + 1}:`, cells.join(' | '));
    }
  }
  
  await page.waitForTimeout(3000);
  await browser.close();
  console.log('\n✓ Test completed successfully');
})();
