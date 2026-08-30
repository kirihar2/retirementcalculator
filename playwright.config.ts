import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    headless: false,
    video: 'on',
    screenshot: 'on',
    viewport: { width: 1280, height: 720 },
  },
  timeout: 30000,
  retries: 0,
});
