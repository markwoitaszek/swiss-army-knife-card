import { beforeEach, describe, expect, it } from 'vitest';

import type { TextToolConfig } from '../TextTool.js';
import { TextTool } from '../TextTool.js';

describe('TextTool', () => {
  let element: TextTool;
  let config: TextToolConfig;

  beforeEach(() => {
    config = {
      type: 'text',
      position: {
        cx: 50,
        cy: 50,
      },
      text: 'Hello World',
      font_size: 16,
      font_family: 'Arial',
      font_weight: 'bold',
      text_anchor: 'middle',
      dominant_baseline: 'central',
      text_styles: {
        fill: '#333333',
        opacity: 0.9,
      },
    };

    element = new TextTool();
    element.config = config;
    document.body.appendChild(element);
  });

  it('should create a text tool instance', () => {
    expect(element).toBeInstanceOf(TextTool);
  });

  it('should have correct tool type', () => {
    expect(element.getToolType()).toBe('text');
  });

  it('should render a text element', async () => {
    await element.updateComplete;
    const text = element.shadowRoot?.querySelector('text');
    expect(text).toBeTruthy();
  });

  it('should render tspan with correct content', async () => {
    await element.updateComplete;
    const tspan = element.shadowRoot?.querySelector('tspan');
    expect(tspan?.textContent?.trim()).toBe('Hello World');
  });

  it('should apply correct position attributes', async () => {
    await element.updateComplete;
    const tspan = element.shadowRoot?.querySelector('tspan');
    expect(tspan?.getAttribute('x')).toBe('50%');
    expect(tspan?.getAttribute('y')).toBe('50%');
  });

  it('should apply typography styles', async () => {
    await element.updateComplete;
    const tspan = element.shadowRoot?.querySelector('tspan');
    const style = tspan?.getAttribute('style');
    expect(style).toContain('font-size: 16px');
    expect(style).toContain('font-family: Arial');
    expect(style).toContain('font-weight: bold');
    expect(style).toContain('text-anchor: middle');
    expect(style).toContain('dominant-baseline: central');
  });

  it('should apply text color and opacity styles', async () => {
    await element.updateComplete;
    const tspan = element.shadowRoot?.querySelector('tspan');
    const style = tspan?.getAttribute('style');
    expect(style).toContain('fill: #333333');
    expect(style).toContain('opacity: 0.9');
  });

  it('should handle different text anchoring', async () => {
    const leftConfig: TextToolConfig = {
      type: 'text',
      position: { cx: 25, cy: 25 },
      text: 'Left Text',
      text_anchor: 'start',
    };

    element.config = leftConfig;
    await element.updateComplete;

    const tspan = element.shadowRoot?.querySelector('tspan');
    const style = tspan?.getAttribute('style');
    expect(style).toContain('text-anchor: start');
    expect(tspan?.textContent?.trim()).toBe('Left Text');
  });

  it('should handle text decoration and transform', async () => {
    const decoratedConfig: TextToolConfig = {
      type: 'text',
      position: { cx: 50, cy: 50 },
      text: 'decorated text',
      text_decoration: 'underline',
      text_transform: 'uppercase',
    };

    element.config = decoratedConfig;
    await element.updateComplete;

    const tspan = element.shadowRoot?.querySelector('tspan');
    const style = tspan?.getAttribute('style');
    expect(style).toContain('text-decoration: underline');
    expect(style).toContain('text-transform: uppercase');
  });

  it('should handle letter spacing and line height', async () => {
    const spacingConfig: TextToolConfig = {
      type: 'text',
      position: { cx: 50, cy: 50 },
      text: 'Spaced Text',
      letter_spacing: 2,
      line_height: 1.5,
    };

    element.config = spacingConfig;
    await element.updateComplete;

    const tspan = element.shadowRoot?.querySelector('tspan');
    const style = tspan?.getAttribute('style');
    expect(style).toContain('letter-spacing: 2px');
    expect(style).toContain('line-height: 1.5');
  });

  it('should process entity state templates', async () => {
    const templateConfig: TextToolConfig = {
      type: 'text',
      position: { cx: 50, cy: 50 },
      text: 'State: [[entity.state]]',
    };

    element.config = templateConfig;
    element.entityState = {
      state: 'on',
      attributes: { temperature: '22°C' },
    } as any;

    await element.updateComplete;

    const tspan = element.shadowRoot?.querySelector('tspan');
    expect(tspan?.textContent?.trim()).toBe('State: on');
  });

  it('should process attribute templates', async () => {
    const attrConfig: TextToolConfig = {
      type: 'text',
      position: { cx: 50, cy: 50 },
      text: 'Temp: [[entity.attributes.temperature]]',
    };

    element.config = attrConfig;
    element.entityState = {
      state: 'on',
      attributes: { temperature: '22°C' },
    } as any;

    await element.updateComplete;

    const tspan = element.shadowRoot?.querySelector('tspan');
    expect(tspan?.textContent?.trim()).toBe('Temp: 22°C');
  });

  it('should handle hover effects', async () => {
    await element.updateComplete;

    // Simulate hover
    element.dispatchEvent(new MouseEvent('mouseenter'));
    await element.updateComplete;

    const tspan = element.shadowRoot?.querySelector('tspan');
    const style = tspan?.getAttribute('style');
    // Opacity should be reduced during hover (0.9 * 0.8 = 0.72)
    expect(style).toContain('opacity: 0.72');
  });

  it('should handle empty text gracefully', async () => {
    const emptyConfig: TextToolConfig = {
      type: 'text',
      position: { cx: 50, cy: 50 },
      text: '',
    };

    element.config = emptyConfig;
    await element.updateComplete;

    const tspan = element.shadowRoot?.querySelector('tspan');
    expect(tspan?.textContent?.trim()).toBe('');
  });

  it('should merge default config with user config', () => {
    expect(element.config.position.cx).toBe(50);
    expect(element.config.position.cy).toBe(50);
    expect(element.config.text).toBe('Hello World');
    expect(element.config.font_size).toBe(16);
    expect(element.config.text_anchor).toBe('middle');
  });

  it('should handle font size as string', async () => {
    const stringFontConfig: TextToolConfig = {
      type: 'text',
      position: { cx: 50, cy: 50 },
      text: 'String Font',
      font_size: '1.2em',
    };

    element.config = stringFontConfig;
    await element.updateComplete;

    const tspan = element.shadowRoot?.querySelector('tspan');
    const style = tspan?.getAttribute('style');
    expect(style).toContain('font-size: 1.2em');
  });
});
