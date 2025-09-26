import { beforeEach, describe, expect, it } from 'vitest';

import type { RectangleToolConfig } from '../RectangleTool.js';
import { RectangleTool } from '../RectangleTool.js';

describe('RectangleTool', () => {
  let element: RectangleTool;
  let config: RectangleToolConfig;

  beforeEach(() => {
    config = {
      type: 'rectangle',
      position: {
        cx: 50,
        cy: 50,
        width: 40,
        height: 20,
        rx: 5,
      },
      rectangle: {
        fill: '#00ff00',
        stroke: '#ff0000',
        stroke_width: 3,
        opacity: 0.8,
      },
    };

    element = new RectangleTool();
    element.config = config;
    document.body.appendChild(element);
  });

  it('should create a rectangle tool instance', () => {
    expect(element).toBeInstanceOf(RectangleTool);
  });

  it('should have correct tool type', () => {
    expect(element.getToolType()).toBe('rectangle');
  });

  it('should render a rectangle element', async () => {
    await element.updateComplete;
    const rect = element.shadowRoot?.querySelector('rect');
    expect(rect).toBeTruthy();
  });

  it('should apply correct position and dimensions', async () => {
    await element.updateComplete;
    const rect = element.shadowRoot?.querySelector('rect');

    // Rectangle should be positioned with top-left corner calculated from center
    // x = cx - width/2 = 50 - 40/2 = 30
    // y = cy - height/2 = 50 - 20/2 = 40
    expect(rect?.getAttribute('x')).toBe('30%');
    expect(rect?.getAttribute('y')).toBe('40%');
    expect(rect?.getAttribute('width')).toBe('40');
    expect(rect?.getAttribute('height')).toBe('20');
    expect(rect?.getAttribute('rx')).toBe('5');
  });

  it('should apply configuration styles', async () => {
    await element.updateComplete;
    const rect = element.shadowRoot?.querySelector('rect');
    const style = rect?.getAttribute('style');
    expect(style).toContain('fill: rgb(0, 255, 0)');
    expect(style).toContain('stroke: rgb(255, 0, 0)');
    expect(style).toContain('stroke-width: 3');
    expect(style).toContain('opacity: 0.8');
  });

  it('should handle rectangles without border radius', async () => {
    const configNoBorder: RectangleToolConfig = {
      type: 'rectangle',
      position: {
        cx: 25,
        cy: 25,
        width: 50,
        height: 30,
      },
    };

    element.config = configNoBorder;
    await element.updateComplete;

    const rect = element.shadowRoot?.querySelector('rect');
    expect(rect?.getAttribute('rx')).toBe('0');
  });

  it('should apply hover effects', async () => {
    await element.updateComplete;

    // Simulate hover
    element.dispatchEvent(new MouseEvent('mouseenter'));
    await element.updateComplete;

    const rect = element.shadowRoot?.querySelector('rect');
    const style = rect?.getAttribute('style');
    // Opacity should be reduced during hover (0.8 * 0.8 = 0.64)
    expect(style).toContain('opacity: 0.64');
  });

  it('should calculate position correctly for different dimensions', async () => {
    const largeConfig: RectangleToolConfig = {
      type: 'rectangle',
      position: {
        cx: 75,
        cy: 25,
        width: 100,
        height: 50,
      },
    };

    element.config = largeConfig;
    await element.updateComplete;

    const rect = element.shadowRoot?.querySelector('rect');
    // x = 75 - 100/2 = 25, y = 25 - 50/2 = 0
    expect(rect?.getAttribute('x')).toBe('25%');
    expect(rect?.getAttribute('y')).toBe('0%');
    expect(rect?.getAttribute('width')).toBe('100');
    expect(rect?.getAttribute('height')).toBe('50');
  });

  it('should merge default config with user config', () => {
    expect(element.config.position.cx).toBe(50);
    expect(element.config.position.cy).toBe(50);
    expect(element.config.position.width).toBe(40);
    expect(element.config.position.height).toBe(20);
    expect(element.config.position.rx).toBe(5);
    expect(element.config.rectangle?.fill).toBe('#00ff00');
  });

  it('should handle square rectangles', async () => {
    const squareConfig: RectangleToolConfig = {
      type: 'rectangle',
      position: {
        cx: 50,
        cy: 50,
        width: 30,
        height: 30,
      },
    };

    element.config = squareConfig;
    await element.updateComplete;

    const rect = element.shadowRoot?.querySelector('rect');
    expect(rect?.getAttribute('width')).toBe('30');
    expect(rect?.getAttribute('height')).toBe('30');
    // Should be centered: x = y = 50 - 30/2 = 35
    expect(rect?.getAttribute('x')).toBe('35%');
    expect(rect?.getAttribute('y')).toBe('35%');
  });
});
