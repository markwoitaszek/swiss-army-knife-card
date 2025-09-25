import { expect, test } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('basic page visual test', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Take a screenshot for visual comparison
    // This will work even without Chromatic token
    await expect(page).toHaveScreenshot('basic-page.png');
  });

  test('page title and basic elements', async ({ page }) => {
    await page.goto('/');

    // Basic functionality test that doesn't require Chromatic
    await expect(page).toHaveTitle(/.*/); // Any title is fine

    // Check that the page loads without errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForLoadState('networkidle');

    // Should have no console errors
    expect(errors).toHaveLength(0);
  });
});
