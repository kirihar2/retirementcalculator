import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const page = await browser.newPage();

  console.log('=== TAX FEATURES VERIFICATION ===\n');
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');

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

  // Expand Account Breakdown
  await page.getByText('Account Breakdown').first().click();
  await page.waitForTimeout(500);

  // Take screenshot
  await page.screenshot({ path: '/tmp/account-expanded.png' });
  console.log('✓ Screenshot: /tmp/account-expanded.png');

  // Find Traditional Balance input - look for input near the "Traditional Balance" text
  const traditionalLabel = page.getByText('Traditional Balance').first();
  await traditionalLabel.scrollIntoViewIfNeeded();

  // The input is the sibling after the label
  const traditionalInput = page.locator('input').filter({ hasText: /Traditional/i }).first();

  // Try to find it by navigating from the heading
  const traditionalHeading = page.getByRole('heading', { name: /Traditional 401k/IRA/i }).first();
  await traditionalHeading.scrollIntoViewIfNeeded();

  // Find the input that comes after this heading
  const box = await traditionalHeading.boundingBox();
  if (box) {
    // Click near the input area (to the right of the heading)
    await page.mouse.click(box.x + 200, box.y + 50);
    await page.waitForTimeout(300);

    // Select all and type
    await page.keyboard.press('Control+a');
    await page.keyboard.type('500000');
    console.log('✓ Attempted to fill Traditional Balance');
  }

  await page.waitForTimeout(500);

  // Check total
  const totalText = await page.getByText('Total Portfolio:').first().textContent();
  console.log(`Total Portfolio: ${totalText}`);

  await page.waitForTimeout(2000);
  await browser.close();
})();
