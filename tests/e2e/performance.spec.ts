/*
 * Performance Tests
 * Performance and load testing for the SAK Card
 */

import { expect, test } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should meet performance budgets', async ({ page }) => {
    // Start performance measurement
    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      return {
        // Load time metrics
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,

        // Paint metrics
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,

        // Resource metrics
        resourceCount: performance.getEntriesByType('resource').length,
        resourceSize: performance.getEntriesByType('resource').reduce((total, resource) => {
          return total + (resource.transferSize || 0);
        }, 0),
      };
    });

    // Performance assertions
    expect(metrics.domContentLoaded).toBeLessThan(1000); // DOM ready in < 1s
    expect(metrics.loadComplete).toBeLessThan(2000); // Full load in < 2s
    expect(metrics.totalLoadTime).toBeLessThan(3000); // Total load in < 3s
    expect(metrics.firstPaint).toBeLessThan(1000); // First paint in < 1s
    expect(metrics.firstContentfulPaint).toBeLessThan(1500); // FCP in < 1.5s

    // Resource efficiency
    expect(metrics.resourceCount).toBeLessThan(20); // Reasonable number of resources
    expect(metrics.resourceSize).toBeLessThan(1024 * 1024); // Less than 1MB total
  });

  test('should handle rapid interactions without performance degradation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const container = page.locator('.container');

    // Measure performance during rapid interactions
    const startTime = Date.now();

    // Perform rapid clicks
    for (let i = 0; i < 10; i++) {
      await container.click();
      await page.waitForTimeout(10); // Small delay between clicks
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Should handle rapid interactions efficiently
    expect(totalTime).toBeLessThan(1000); // All interactions in < 1s
  });

  test('should maintain performance across page reloads', async ({ page }) => {
    const loadTimes: number[] = [];

    // Test multiple page loads
    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;
      loadTimes.push(loadTime);

      // Small delay between loads
      await page.waitForTimeout(100);
    }

    // Calculate performance consistency
    const avgLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
    const maxLoadTime = Math.max(...loadTimes);
    const minLoadTime = Math.min(...loadTimes);

    // Performance should be consistent
    expect(avgLoadTime).toBeLessThan(2000); // Average load time < 2s
    expect(maxLoadTime - minLoadTime).toBeLessThan(1000); // Variation < 1s
  });

  test('should handle memory efficiently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory
        ? {
            used: (performance as any).memory.usedJSHeapSize,
            total: (performance as any).memory.totalJSHeapSize,
            limit: (performance as any).memory.jsHeapSizeLimit,
          }
        : null;
    });

    if (initialMemory) {
      // Memory usage should be reasonable
      expect(initialMemory.used).toBeLessThan(50 * 1024 * 1024); // < 50MB
      expect(initialMemory.total).toBeLessThan(100 * 1024 * 1024); // < 100MB

      // Memory usage should be well within limits
      expect(initialMemory.used / initialMemory.limit).toBeLessThan(0.1); // < 10% of limit
    }

    // Test memory stability over time
    await page.waitForTimeout(1000);

    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory
        ? {
            used: (performance as any).memory.usedJSHeapSize,
            total: (performance as any).memory.totalJSHeapSize,
          }
        : null;
    });

    if (initialMemory && finalMemory) {
      // Memory usage should be stable
      const memoryIncrease = finalMemory.used - initialMemory.used;
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // < 10MB increase
    }
  });

  test('should handle concurrent operations efficiently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const startTime = Date.now();

    // Perform concurrent operations
    const operations = [
      page.locator('.container').click(),
      page.locator('.status').textContent(),
      page.evaluate(() => document.title),
      page.locator('h1').textContent(),
    ];

    await Promise.all(operations);

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Concurrent operations should be efficient
    expect(totalTime).toBeLessThan(500); // All operations in < 500ms
  });

  test('should handle large content efficiently', async ({ page }) => {
    // Create a page with more content to test scalability
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Add more content dynamically
    await page.evaluate(() => {
      const container = document.querySelector('.container');
      if (container) {
        // Add multiple elements to test rendering performance
        for (let i = 0; i < 100; i++) {
          const div = document.createElement('div');
          div.textContent = `Test element ${i}`;
          div.className = 'test-element';
          container.appendChild(div);
        }
      }
    });

    // Measure rendering performance
    const startTime = Date.now();

    // Wait for all elements to be rendered
    await page.waitForSelector('.test-element:nth-child(100)');

    const endTime = Date.now();
    const renderTime = endTime - startTime;

    // Should handle large content efficiently
    expect(renderTime).toBeLessThan(1000); // Render 100 elements in < 1s
  });

  test('should handle network conditions gracefully', async ({ page, context }) => {
    // Simulate slow network
    await context.route('**/*', route => {
      // Add delay to simulate slow network
      setTimeout(() => route.continue(), 100);
    });

    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should still load within reasonable time even with slow network
    expect(loadTime).toBeLessThan(5000); // < 5s with slow network

    // Page should still be functional
    const container = page.locator('.container');
    await expect(container).toBeVisible();
  });
});
