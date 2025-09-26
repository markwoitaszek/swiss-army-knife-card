import { beforeEach, describe, expect, it } from 'vitest';

import type { HeatmapToolConfig } from '../HeatmapTool.js';
import { HeatmapTool } from '../HeatmapTool.js';

describe('HeatmapTool', () => {
  let element: HeatmapTool;
  let config: HeatmapToolConfig;

  beforeEach(() => {
    config = {
      type: 'heatmap',
      position: {
        cx: 50,
        cy: 50,
        width: 80,
        height: 30,
        cell_size: 3,
        gap: 0.5,
      },
      data: [
        { x: 0, y: 0, value: 10 },
        { x: 1, y: 0, value: 50 },
        { x: 2, y: 0, value: 90 },
        { x: 0, y: 1, value: 30 },
        { x: 1, y: 1, value: 70 },
        { x: 2, y: 1, value: 20 },
      ],
      scale: {
        min: 0,
        max: 100,
        colors: ['#e3f2fd', '#2196f3', '#0d47a1'],
      },
      grid: {
        rows: 2,
        columns: 3,
      },
      labels: {
        show: false,
      },
    };

    element = new HeatmapTool();
    element.config = config;
    document.body.appendChild(element);
  });

  it('should create a heatmap tool instance', () => {
    expect(element).toBeInstanceOf(HeatmapTool);
  });

  it('should have correct tool type', () => {
    expect(element.getToolType()).toBe('heatmap');
  });

  it('should render a group element', async () => {
    await element.updateComplete;
    const group = element.shadowRoot?.querySelector('g');
    expect(group).toBeTruthy();
    expect(group?.getAttribute('class')).toBe('sak-heatmap');
  });

  it('should render correct number of cells', async () => {
    await element.updateComplete;
    const cells = element.shadowRoot?.querySelectorAll('.sak-heatmap__cell');
    expect(cells?.length).toBe(6); // 2 rows × 3 columns
  });

  it('should apply correct cell positioning', async () => {
    await element.updateComplete;
    const cells = element.shadowRoot?.querySelectorAll('.sak-heatmap__cell');

    // First cell should be at calculated position
    const firstCell = cells?.[0];
    expect(firstCell?.getAttribute('width')).toBe('3');
    expect(firstCell?.getAttribute('height')).toBe('3');
  });

  it('should apply colors based on values', async () => {
    await element.updateComplete;
    const cells = element.shadowRoot?.querySelectorAll('.sak-heatmap__cell');

    // Different values should have different colors
    const colors = Array.from(cells || []).map(
      cell => cell.getAttribute('style')?.match(/fill: ([^;]+)/)?.[1]
    );

    // Should have at least some different colors
    const uniqueColors = new Set(colors.filter(Boolean));
    expect(uniqueColors.size).toBeGreaterThan(1);
  });

  it('should handle empty data with grid fallback', async () => {
    element.config.data = [];
    await element.updateComplete;

    const cells = element.shadowRoot?.querySelectorAll('.sak-heatmap__cell');
    expect(cells?.length).toBe(6); // Should render empty grid (2×3)

    // Empty cells should have empty class
    const emptyCells = element.shadowRoot?.querySelectorAll('.sak-heatmap__cell--empty');
    expect(emptyCells?.length).toBe(6);
  });

  it('should emit events on cell click', async () => {
    let clickedCell: any = null;
    element.addEventListener('cell-click', (event: any) => {
      clickedCell = event.detail;
    });

    await element.updateComplete;

    const firstCell = element.shadowRoot?.querySelector('.sak-heatmap__cell');
    firstCell?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(clickedCell).toBeTruthy();
    expect(clickedCell.value).toBe(10);
  });

  it('should generate sample data correctly', () => {
    element.generateSampleData('daily');
    expect(element.config.data.length).toBeGreaterThan(0);

    // Should have data for grid dimensions
    const expectedCells = (element.config.grid?.rows || 7) * (element.config.grid?.columns || 24);
    expect(element.config.data.length).toBe(expectedCells);

    // All values should be within range
    element.config.data.forEach(cell => {
      expect(cell.value).toBeGreaterThanOrEqual(0);
      expect(cell.value).toBeLessThanOrEqual(100);
    });
  });

  it('should handle different sample data types', () => {
    element.generateSampleData('weekly');
    const weeklyData = [...element.config.data];

    element.generateSampleData('random');
    const randomData = [...element.config.data];

    element.generateSampleData('daily');
    const dailyData = [...element.config.data];

    // Should generate different patterns
    expect(weeklyData.length).toBe(dailyData.length);
    expect(randomData.length).toBe(dailyData.length);
  });

  it('should calculate value range from data', async () => {
    element.config.data = [
      { x: 0, y: 0, value: 5 },
      { x: 1, y: 0, value: 95 },
    ];
    element.config.scale = {}; // No explicit min/max

    (element as any).calculateValueRange();

    expect((element as any).minValue).toBe(5);
    expect((element as any).maxValue).toBe(95);
  });

  it('should use explicit scale when provided', async () => {
    element.config.scale = { min: 10, max: 90 };

    (element as any).calculateValueRange();

    expect((element as any).minValue).toBe(10);
    expect((element as any).maxValue).toBe(90);
  });

  it('should handle border radius', async () => {
    element.config.heatmap = { border_radius: 2 };
    await element.updateComplete;

    const cells = element.shadowRoot?.querySelectorAll('.sak-heatmap__cell');
    cells?.forEach(cell => {
      expect(cell.getAttribute('rx')).toBe('2');
    });
  });

  it('should apply opacity settings', async () => {
    element.config.heatmap = { opacity: 0.7 };
    await element.updateComplete;

    const cells = element.shadowRoot?.querySelectorAll('.sak-heatmap__cell');
    cells?.forEach(cell => {
      const style = cell.getAttribute('style');
      expect(style).toContain('opacity: 0.7');
    });
  });

  it('should merge default config with user config', () => {
    expect(element.config.position.cx).toBe(50);
    expect(element.config.position.cy).toBe(50);
    expect(element.config.position.width).toBe(80);
    expect(element.config.grid?.rows).toBe(2);
    expect(element.config.data.length).toBe(6);
  });

  it('should handle large datasets efficiently', () => {
    // Generate large dataset
    const largeData = [];
    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 20; y++) {
        largeData.push({ x, y, value: Math.random() * 100 });
      }
    }

    element.config.data = largeData;
    element.config.grid = { rows: 20, columns: 50 };

    const start = performance.now();
    (element as any).calculateValueRange();
    const end = performance.now();

    // Should calculate quickly even with large datasets
    expect(end - start).toBeLessThan(50);
    expect(element.config.data.length).toBe(1000);
  });
});
