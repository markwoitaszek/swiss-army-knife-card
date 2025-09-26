import { beforeEach, describe, expect, it } from 'vitest';

import type { SparklineBarChartToolConfig } from '../SparklineBarChartTool.js';
import { SparklineBarChartTool } from '../SparklineBarChartTool.js';

describe('SparklineBarChartTool', () => {
  let element: SparklineBarChartTool;
  let config: SparklineBarChartToolConfig;

  beforeEach(() => {
    config = {
      type: 'sparkline_barchart',
      position: {
        cx: 50,
        cy: 50,
        width: 80,
        height: 30,
        margin: 1,
        orientation: 'vertical',
      },
      hours: 12,
      barhours: 1,
      color: '#ff6600',
      show: {
        style: 'fixedcolor',
      },
      bar_styles: {
        stroke_width: 2,
        opacity: 0.8,
      },
    };

    element = new SparklineBarChartTool();
    element.config = config;
    document.body.appendChild(element);
  });

  it('should create a sparkline bar chart tool instance', () => {
    expect(element).toBeInstanceOf(SparklineBarChartTool);
  });

  it('should have correct tool type', () => {
    expect(element.getToolType()).toBe('sparkline_barchart');
  });

  it('should render a group element', async () => {
    await element.updateComplete;
    const group = element.shadowRoot?.querySelector('g');
    expect(group).toBeTruthy();
    expect(group?.getAttribute('class')).toBe('sak-barchart');
  });

  it('should handle empty data gracefully', async () => {
    element.setData([]);
    await element.updateComplete;

    const lines = element.shadowRoot?.querySelectorAll('line');
    expect(lines?.length).toBe(0);
  });

  it('should render bars for data', async () => {
    const testData = [10, 20, 15, 25, 30];
    element.setData(testData);
    await element.updateComplete;

    const lines = element.shadowRoot?.querySelectorAll('line');
    expect(lines?.length).toBe(5);
  });

  it('should apply correct bar positioning for vertical orientation', async () => {
    const testData = [10, 20];
    element.setData(testData);
    await element.updateComplete;

    const lines = element.shadowRoot?.querySelectorAll('line');
    expect(lines?.length).toBe(2);

    // Check that bars are positioned vertically
    const firstBar = lines?.[0];
    const x1 = firstBar?.getAttribute('x1');
    const x2 = firstBar?.getAttribute('x2');
    expect(x1).toBe(x2); // Vertical line should have same x coordinates
  });

  it('should handle horizontal orientation', async () => {
    element.config.position.orientation = 'horizontal';
    const testData = [10, 20];
    element.setData(testData);
    await element.updateComplete;

    const lines = element.shadowRoot?.querySelectorAll('line');
    const firstBar = lines?.[0];
    const y1 = firstBar?.getAttribute('y1');
    const y2 = firstBar?.getAttribute('y2');
    expect(y1).toBe(y2); // Horizontal line should have same y coordinates
  });

  it('should apply fixed color styling', async () => {
    const testData = [10, 20, 30];
    element.setData(testData);
    await element.updateComplete;

    const lines = element.shadowRoot?.querySelectorAll('line');
    lines?.forEach(line => {
      const style = line.getAttribute('style');
      expect(style).toContain('stroke: #ff6600');
      expect(style).toContain('stroke-width: 2');
      expect(style).toContain('opacity: 0.8');
    });
  });

  it('should handle colorstops styling', async () => {
    element.config.show = { style: 'colorstops' };
    element.config.colorstops = [
      { stop: 15, color: '#00ff00' },
      { stop: 25, color: '#ffff00' },
      { stop: 35, color: '#ff0000' },
    ];

    const testData = [10, 20, 30];
    element.setData(testData);
    await element.updateComplete;

    const lines = element.shadowRoot?.querySelectorAll('line');
    expect(lines?.length).toBe(3);

    // First bar (value 10) should be green (below 15)
    expect(lines?.[0]?.getAttribute('style')).toContain('stroke: #00ff00');
    // Second bar (value 20) should be yellow (between 15-25)
    expect(lines?.[1]?.getAttribute('style')).toContain('stroke: #ffff00');
    // Third bar (value 30) should be red (between 25-35)
    expect(lines?.[2]?.getAttribute('style')).toContain('stroke: #ff0000');
  });

  it('should handle minmaxgradient styling', async () => {
    element.config.show = { style: 'minmaxgradient' };

    const testData = [0, 50, 100];
    element.setData(testData);
    await element.updateComplete;

    const lines = element.shadowRoot?.querySelectorAll('line');
    expect(lines?.length).toBe(3);

    // Should generate RGB colors based on min/max gradient
    lines?.forEach(line => {
      const style = line.getAttribute('style');
      expect(style).toMatch(/stroke: rgb\(\d+, 0, \d+\)/);
    });
  });

  it('should scale bars correctly relative to min/max', async () => {
    const testData = [10, 50, 90]; // Range: 10-90
    element.setData(testData);
    await element.updateComplete;

    const lines = element.shadowRoot?.querySelectorAll('line');
    expect(lines?.length).toBe(3);

    // Middle value should be roughly in the middle height
    const middleBar = lines?.[1];
    const y1 = parseFloat(middleBar?.getAttribute('y1') || '0');
    const y2 = parseFloat(middleBar?.getAttribute('y2') || '0');
    const barHeight = Math.abs(y1 - y2);

    // Should be roughly half the total height (accounting for padding)
    expect(barHeight).toBeGreaterThan(10);
    expect(barHeight).toBeLessThan(25);
  });

  it('should handle single data point', async () => {
    const testData = [42];
    element.setData(testData);
    await element.updateComplete;

    const lines = element.shadowRoot?.querySelectorAll('line');
    expect(lines?.length).toBe(1);

    const bar = lines?.[0];
    expect(bar?.getAttribute('style')).toContain('stroke: #ff6600');
  });

  it('should handle zero values', async () => {
    const testData = [0, 0, 0];
    element.setData(testData);
    await element.updateComplete;

    const lines = element.shadowRoot?.querySelectorAll('line');
    expect(lines?.length).toBe(3);

    // All bars should render (even if height is minimal)
    lines?.forEach(line => {
      expect(line.getAttribute('style')).toContain('stroke:');
    });
  });

  it('should merge default config with user config', () => {
    expect(element.config.position.cx).toBe(50);
    expect(element.config.position.cy).toBe(50);
    expect(element.config.position.width).toBe(80);
    expect(element.config.position.height).toBe(30);
    expect(element.config.hours).toBe(12);
    expect(element.config.color).toBe('#ff6600');
  });

  it('should calculate bar dimensions correctly', async () => {
    // Test with known configuration
    element.config.hours = 4;
    element.config.barhours = 1;
    element.config.position.width = 40;
    element.config.position.margin = 2;

    const testData = [10, 20, 30, 40];
    element.setData(testData);
    await element.updateComplete;

    const lines = element.shadowRoot?.querySelectorAll('line');
    expect(lines?.length).toBe(4);

    // Check spacing between bars
    const bar1X = parseFloat(lines?.[0]?.getAttribute('x1') || '0');
    const bar2X = parseFloat(lines?.[1]?.getAttribute('x1') || '0');
    const spacing = bar2X - bar1X;

    // Should include bar width + margin
    expect(spacing).toBeGreaterThan(5); // At least some spacing
  });
});
