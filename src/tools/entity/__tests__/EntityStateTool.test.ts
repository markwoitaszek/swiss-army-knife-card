import { beforeEach, describe, expect, it } from 'vitest';

import type { EntityStateToolConfig } from '../EntityStateTool.js';
import { EntityStateTool } from '../EntityStateTool.js';

describe('EntityStateTool', () => {
  let element: EntityStateTool;
  let config: EntityStateToolConfig;

  beforeEach(() => {
    config = {
      type: 'entity_state',
      position: {
        cx: 50,
        cy: 50,
      },
      entity_index: 0,
      show: {
        uom: 'end',
      },
      font_size: 14,
      precision: 1,
      state_styles: {
        fill: '#000000',
        opacity: 1,
      },
    };

    element = new EntityStateTool();
    element.config = config;
    document.body.appendChild(element);
  });

  it('should create an entity state tool instance', () => {
    expect(element).toBeInstanceOf(EntityStateTool);
  });

  it('should have correct tool type', () => {
    expect(element.getToolType()).toBe('entity_state');
  });

  it('should render a text element', async () => {
    await element.updateComplete;
    const text = element.shadowRoot?.querySelector('text');
    expect(text).toBeTruthy();
  });

  it('should display unavailable when no entity state', async () => {
    await element.updateComplete;
    const tspan = element.shadowRoot?.querySelector('tspan');
    expect(tspan?.textContent?.trim()).toBe('unavailable');
  });

  it('should display entity state with unit', async () => {
    element.entityState = {
      state: '22.5',
      attributes: {
        unit_of_measurement: '°C',
      },
    } as any;

    await element.updateComplete;
    const tspan = element.shadowRoot?.querySelector('tspan');
    expect(tspan?.textContent?.trim()).toBe('22.5 °C');
  });

  it('should format numeric values with precision', async () => {
    element.config.precision = 2;
    element.entityState = {
      state: 22.555,
      attributes: {
        unit_of_measurement: '°C',
      },
    } as any;

    await element.updateComplete;
    const tspan = element.shadowRoot?.querySelector('tspan');
    expect(tspan?.textContent?.trim()).toBe('22.55 °C');
  });

  it('should handle string states', async () => {
    element.entityState = {
      state: 'on',
      attributes: {},
    } as any;

    await element.updateComplete;
    const tspan = element.shadowRoot?.querySelector('tspan');
    expect(tspan?.textContent?.trim()).toBe('on');
  });

  it('should hide unit of measurement when configured', async () => {
    element.config.show = { uom: 'none' };
    element.entityState = {
      state: '22.5',
      attributes: {
        unit_of_measurement: '°C',
      },
    } as any;

    await element.updateComplete;
    const tspan = element.shadowRoot?.querySelector('tspan');
    expect(tspan?.textContent?.trim()).toBe('22.5');
  });

  it('should display unit below state when configured', async () => {
    element.config.show = { uom: 'bottom' };
    element.entityState = {
      state: '22.5',
      attributes: {
        unit_of_measurement: '°C',
      },
    } as any;

    await element.updateComplete;
    const tspans = element.shadowRoot?.querySelectorAll('tspan');
    expect(tspans?.length).toBe(2);
    expect(tspans?.[0]?.textContent?.trim()).toBe('22.5');
    expect(tspans?.[1]?.textContent?.trim()).toBe('°C');
  });

  it('should apply typography styles', async () => {
    await element.updateComplete;
    const tspan = element.shadowRoot?.querySelector('tspan');
    const style = tspan?.getAttribute('style');
    expect(style).toContain('font-size: 14px');
    expect(style).toContain('text-anchor: middle');
    expect(style).toContain('dominant-baseline: central');
  });

  it('should apply state styles', async () => {
    await element.updateComplete;
    const tspan = element.shadowRoot?.querySelector('tspan');
    const style = tspan?.getAttribute('style');
    expect(style).toContain('fill: #000000');
    expect(style).toContain('opacity: 1');
  });

  it('should handle unknown state', async () => {
    element.entityState = {
      state: 'unknown',
      attributes: {},
    } as any;

    await element.updateComplete;
    const tspan = element.shadowRoot?.querySelector('tspan');
    expect(tspan?.textContent?.trim()).toBe('unknown');
  });

  it('should handle null state', async () => {
    element.entityState = {
      state: null,
      attributes: {},
    } as any;

    await element.updateComplete;
    const tspan = element.shadowRoot?.querySelector('tspan');
    expect(tspan?.textContent?.trim()).toBe('unavailable');
  });

  it('should apply hover effects', async () => {
    element.entityState = {
      state: '22.5',
      attributes: { unit_of_measurement: '°C' },
    } as any;

    await element.updateComplete;

    // Simulate hover
    element.dispatchEvent(new MouseEvent('mouseenter'));
    await element.updateComplete;

    const tspan = element.shadowRoot?.querySelector('tspan');
    const style = tspan?.getAttribute('style');
    // Opacity should be reduced during hover (1 * 0.8 = 0.8)
    expect(style).toContain('opacity: 0.8');
  });

  it('should merge default config with user config', () => {
    expect(element.config.position.cx).toBe(50);
    expect(element.config.position.cy).toBe(50);
    expect(element.config.show?.uom).toBe('end');
    expect(element.config.font_size).toBe(14);
    expect(element.config.precision).toBe(1);
  });

  it('should handle entities without units', async () => {
    element.entityState = {
      state: 'active',
      attributes: {},
    } as any;

    await element.updateComplete;
    const tspan = element.shadowRoot?.querySelector('tspan');
    expect(tspan?.textContent?.trim()).toBe('active');
  });
});
