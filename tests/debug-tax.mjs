import { chromium } from 'playwright';

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
  
  await page.waitForTimeout(1000);
  
  // Take screenshot before opening drawer
  await page.screenshot({ path: '/tmp/before-drawer.png' });
  console.log('✓ Screenshot: /tmp/before-drawer.png');
  
  // Open inputs drawer
  await page.locator('button[aria-label="Edit Inputs"]').first().click();
  await page.waitForTimeout(1500);
  
  // Take screenshot with drawer open
  await page.screenshot({ path: '/tmp/drawer-open.png' });
  console.log('✓ Screenshot: /tmp/drawer-open.png');
  
  // Expand Account Breakdown
  await page.getByText('Account Breakdown').first().click();
  await page.waitForTimeout(500);
  
  // Take screenshot with account breakdown expanded
  await page.screenshot({ path: '/tmp/account-breakdown.png' });
  console.log('✓ Screenshot: /tmp/account-breakdown.png');
  
  // List all inputs
  const inputs = page.locator('input');
  const count = await inputs.count();
  console.log(`\nTotal inputs on page: ${count}`);
  
  for (let i = 0; i < Math.min(count, 20); i++) {
    const input = inputs.nth(i);
    const type = await input.getAttribute('type');
    const label = await input.getAttribute('aria-label');
    const id = await input.getAttribute('id');
    const visible = await input.isVisible();
    console.log(`Input ${i}: type=${type}, label=${label}, id=${id}, visible=${visible}`);
  }
  
  // Check if tabs are visible
  const tabs = page.locator('[role="tab"]');
  const tabCount = await tabs.count();
  console.log(`\nTabs visible: ${tabCount}`);
  
  for (let i = 0; i < tabCount; i++) {
    const tab = tabs.nth(i);
    const text = await tab.textContent();
    console.log(`Tab ${i}: ${text}`);
  }
  
  await page.waitForTimeout(3000);
  await browser.close();
})();
