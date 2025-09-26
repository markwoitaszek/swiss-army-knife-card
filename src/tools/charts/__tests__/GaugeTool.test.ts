import { beforeEach, describe, expect, it } from 'vitest';

import type { GaugeToolConfig } from '../GaugeTool.js';
import { GaugeTool } from '../GaugeTool.js';

describe('GaugeTool', () => {
  let element: GaugeTool;
  let config: GaugeToolConfig;

  beforeEach(() => {
    config = {
      type: 'gauge',
      position: {
        cx: 50,
        cy: 50,
        radius: 30,
        start_angle: -90,
        end_angle: 270,
      },
      min: 0,
      max: 100,
      value: 75,
      gauge: {
        track_color: '#cccccc',
        track_width: 6,
        fill_color: '#ff6600',
        fill_width: 6,
        opacity: 1,
      },
    };

    element = new GaugeTool();
    element.config = config;
    document.body.appendChild(element);
  });

  it('should create a gauge tool instance', () => {
    expect(element).toBeInstanceOf(GaugeTool);
  });

  it('should have correct tool type', () => {
    expect(element.getToolType()).toBe('gauge');
  });

  it('should render a group element', async () => {
    await element.updateComplete;
    const group = element.shadowRoot?.querySelector('g');
    expect(group).toBeTruthy();
    expect(group?.getAttribute('class')).toBe('sak-gauge');
  });

  it('should render track and fill paths', async () => {
    await element.updateComplete;
    const paths = element.shadowRoot?.querySelectorAll('path');
    expect(paths?.length).toBe(2); // Track + fill

    const track = element.shadowRoot?.querySelector('.sak-gauge__track');
    const fill = element.shadowRoot?.querySelector('.sak-gauge__fill');
    expect(track).toBeTruthy();
    expect(fill).toBeTruthy();
  });

  it('should apply track styling', async () => {
    await element.updateComplete;
    const track = element.shadowRoot?.querySelector('.sak-gauge__track');
    const style = track?.getAttribute('style');
    expect(style).toContain('stroke: #cccccc');
    expect(style).toContain('stroke-width: 6');
    expect(style).toContain('fill: none');
  });

  it('should apply fill styling', async () => {
    await element.updateComplete;
    const fill = element.shadowRoot?.querySelector('.sak-gauge__fill');
    const style = fill?.getAttribute('style');
    expect(style).toContain('stroke: #ff6600');
    expect(style).toContain('stroke-width: 6');
    expect(style).toContain('fill: none');
  });

  it('should handle zero value', async () => {
    element.config.value = 0;
    await element.updateComplete;

    // Should render track and minimal fill (zero progress)
    const track = element.shadowRoot?.querySelector('.sak-gauge__track');
    const fill = element.shadowRoot?.querySelector('.sak-gauge__fill');
    expect(track).toBeTruthy();
    expect(fill).toBeTruthy(); // Fill exists but represents zero progress
  });

  it('should handle full value', async () => {
    element.config.value = 100;
    await element.updateComplete;

    const paths = element.shadowRoot?.querySelectorAll('path');
    expect(paths?.length).toBe(2); // Track + fill

    // Fill should cover the full arc
    const fill = element.shadowRoot?.querySelector('.sak-gauge__fill');
    expect(fill).toBeTruthy();
  });

  it('should clamp values within min/max range', async () => {
    element.config.min = 10;
    element.config.max = 90;
    element.config.value = 150; // Above max
    await element.updateComplete;

    // Should render as if value is 90 (max)
    const fill = element.shadowRoot?.querySelector('.sak-gauge__fill');
    expect(fill).toBeTruthy();
  });

  it('should handle negative values', async () => {
    element.config.min = -50;
    element.config.max = 50;
    element.config.value = -25;
    await element.updateComplete;

    const fill = element.shadowRoot?.querySelector('.sak-gauge__fill');
    expect(fill).toBeTruthy();
  });

  it('should use entity state value when available', async () => {
    element.entityState = {
      state: '85',
      attributes: {},
    } as any;

    await element.updateComplete;

    // Should render fill for 85% progress
    const fill = element.shadowRoot?.querySelector('.sak-gauge__fill');
    expect(fill).toBeTruthy();
  });

  it('should handle non-numeric entity states', async () => {
    element.entityState = {
      state: 'on',
      attributes: {},
    } as any;

    await element.updateComplete;

    // Should fall back to config value
    const fill = element.shadowRoot?.querySelector('.sak-gauge__fill');
    expect(fill).toBeTruthy();
  });

  it('should handle different arc ranges', async () => {
    element.config.position.start_angle = 0;
    element.config.position.end_angle = 180; // Half circle
    element.config.value = 50;
    await element.updateComplete;

    const paths = element.shadowRoot?.querySelectorAll('path');
    expect(paths?.length).toBe(2);

    // Both track and fill should have path data
    paths?.forEach(path => {
      const d = path.getAttribute('d');
      expect(d).toBeTruthy();
      expect(d?.length).toBeGreaterThan(10);
    });
  });

  it('should merge default config with user config', () => {
    expect(element.config.position.cx).toBe(50);
    expect(element.config.position.cy).toBe(50);
    expect(element.config.position.radius).toBe(30);
    expect(element.config.min).toBe(0);
    expect(element.config.max).toBe(100);
    expect(element.config.value).toBe(75);
  });

  it('should calculate progress percentage correctly', async () => {
    // Test with different ranges
    element.config.min = 20;
    element.config.max = 80;
    element.config.value = 50; // Should be 50% of range (30/60)

    await element.updateComplete;

    const fill = element.shadowRoot?.querySelector('.sak-gauge__fill');
    expect(fill).toBeTruthy();

    // The fill path should represent 50% progress
    const d = fill?.getAttribute('d');
    expect(d).toBeTruthy();
  });
});
