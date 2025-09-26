import { describe, it, expect, beforeEach } from 'vitest';

import { CircleTool } from '../CircleTool.js';
import type { CircleToolConfig } from '../CircleTool.js';

describe('CircleTool', () => {
  let element: CircleTool;
  let config: CircleToolConfig;

  beforeEach(() => {
    config = {
      type: 'circle',
      position: {
        cx: 50,
        cy: 50,
        radius: 25,
      },
      circle: {
        fill: '#ff0000',
        stroke: '#000000',
        stroke_width: 2,
      },
    };

    element = new CircleTool();
    element.config = config;
    document.body.appendChild(element);
  });

  it('should create a circle tool instance', () => {
    expect(element).toBeInstanceOf(CircleTool);
  });

  it('should have correct tool type', () => {
    expect(element.getToolType()).toBe('circle');
  });

  it('should render a circle element', async () => {
    await element.updateComplete;
    const circle = element.shadowRoot?.querySelector('circle');
    expect(circle).toBeTruthy();
  });

  it('should apply correct position attributes', async () => {
    await element.updateComplete;
    const circle = element.shadowRoot?.querySelector('circle');
    expect(circle?.getAttribute('cx')).toBe('50%');
    expect(circle?.getAttribute('cy')).toBe('50%');
    expect(circle?.getAttribute('r')).toBe('25');
  });

  it('should merge default config with user config', () => {
    expect(element.config.position.cx).toBe(50);
    expect(element.config.position.cy).toBe(50);
    expect(element.config.position.radius).toBe(25);
    expect(element.config.circle?.fill).toBe('#ff0000');
  });
});
