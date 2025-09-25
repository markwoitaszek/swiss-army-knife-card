import { expect, test } from '@playwright/test';

test('example e2e test', async ({ page }) => {
  await page.goto('/');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Basic assertion
  expect(await page.title()).toBeTruthy();
});
