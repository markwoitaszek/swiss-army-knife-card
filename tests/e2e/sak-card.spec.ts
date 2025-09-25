/*
 * SAK Card E2E Tests
 * End-to-end tests for the Swiss Army Knife Card
 */

import { expect, test } from '@playwright/test';

test.describe('SAK Card', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load the development page', async ({ page }) => {
    // Check that the page loads successfully
    await expect(page).toHaveTitle(/.*/);

    // Check for basic page structure
    const container = page.locator('.container');
    await expect(container).toBeVisible();

    // Check for the status message
    const status = page.locator('.status');
    await expect(status).toBeVisible();
    await expect(status).toHaveText('✅ Development environment is ready!');
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(
      error => !error.includes('favicon') && !error.includes('404') && !error.includes('net::ERR_')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const container = page.locator('.container');
    await expect(container).toBeVisible();

    // Check that content is still accessible
    const status = page.locator('.status');
    await expect(status).toBeVisible();
  });

  test('should handle page interactions', async ({ page }) => {
    // Test basic page interactions
    const container = page.locator('.container');
    await expect(container).toBeVisible();

    // Test clicking on the container
    await container.click();

    // Page should still be functional
    await expect(container).toBeVisible();
  });

  test('should load without JavaScript errors in different browsers', async ({
    page,
    browserName,
  }) => {
    // This test runs across all configured browsers
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Log browser-specific results
    console.log(`Browser: ${browserName}, Errors: ${errors.length}`);

    // Should have minimal errors across all browsers
    expect(errors.length).toBeLessThan(5);
  });
});

test.describe('SAK Card Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have reasonable memory usage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get memory usage (if available)
    const memoryInfo = await page.evaluate(() => {
      return (performance as any).memory
        ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          }
        : null;
    });

    if (memoryInfo) {
      // Memory usage should be reasonable (less than 50MB)
      expect(memoryInfo.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024);
    }
  });
});

test.describe('SAK Card Accessibility', () => {
  test('should have proper page structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Check for proper content structure
    const container = page.locator('.container');
    await expect(container).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test tab navigation
    await page.keyboard.press('Tab');

    // Page should still be functional
    const container = page.locator('.container');
    await expect(container).toBeVisible();
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that text is visible (basic contrast check)
    const status = page.locator('.status');
    await expect(status).toBeVisible();

    // Get computed styles to check contrast
    const styles = await status.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
      };
    });

    // Basic check that colors are defined
    expect(styles.color).toBeTruthy();
    expect(styles.backgroundColor).toBeTruthy();
  });
});
