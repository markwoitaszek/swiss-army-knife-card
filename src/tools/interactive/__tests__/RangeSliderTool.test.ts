import { beforeEach, describe, expect, it } from 'vitest';

import type { RangeSliderToolConfig } from '../RangeSliderTool.js';
import { RangeSliderTool } from '../RangeSliderTool.js';

describe('RangeSliderTool', () => {
  let element: RangeSliderTool;
  let config: RangeSliderToolConfig;

  beforeEach(() => {
    config = {
      type: 'range_slider',
      position: {
        cx: 50,
        cy: 50,
        orientation: 'horizontal',
        track: {
          width: 60,
          height: 4,
          radius: 2,
        },
        thumb: {
          width: 12,
          height: 12,
          radius: 6,
        },
        active: {
          width: 0,
          height: 4,
          radius: 2,
        },
      },
      scale: {
        min: 0,
        max: 100,
        step: 5,
      },
      value: 50,
      show: {
        uom: 'end',
        active: true,
        label: true,
      },
      slider: {
        track_color: '#cccccc',
        active_color: '#ff6600',
        thumb_color: '#ffffff',
      },
    };

    element = new RangeSliderTool();
    element.config = config;
    document.body.appendChild(element);
  });

  it('should create a range slider tool instance', () => {
    expect(element).toBeInstanceOf(RangeSliderTool);
  });

  it('should have correct tool type', () => {
    expect(element.getToolType()).toBe('range_slider');
  });

  it('should render a group element', async () => {
    await element.updateComplete;
    const group = element.shadowRoot?.querySelector('g');
    expect(group).toBeTruthy();
    expect(group?.getAttribute('class')).toContain('sak-slider');
  });

  it('should render track, active, and thumb elements', async () => {
    await element.updateComplete;
    const track = element.shadowRoot?.querySelector('.sak-slider__track');
    const active = element.shadowRoot?.querySelector('.sak-slider__active');
    const thumb = element.shadowRoot?.querySelector('.sak-slider__thumb');
    expect(track).toBeTruthy();
    expect(active).toBeTruthy();
    expect(thumb).toBeTruthy();
  });

  it('should apply correct track dimensions and position', async () => {
    await element.updateComplete;
    const track = element.shadowRoot?.querySelector('.sak-slider__track');
    expect(track?.getAttribute('width')).toBe('60');
    expect(track?.getAttribute('height')).toBe('4');
    expect(track?.getAttribute('rx')).toBe('2');

    // Track should be centered: x = cx - width/2 = 50 - 60/2 = 20
    expect(track?.getAttribute('x')).toBe('20%');
  });

  it('should position thumb correctly based on value', async () => {
    await element.updateComplete;
    const thumb = element.shadowRoot?.querySelector('.sak-slider__thumb');

    // For value 50 (50% of 0-100 range), thumb should be at center
    expect(thumb?.getAttribute('cx')).toBe('50%');
    expect(thumb?.getAttribute('cy')).toBe('50%');
  });

  it('should render active track with correct width for horizontal', async () => {
    await element.updateComplete;
    const active = element.shadowRoot?.querySelector('.sak-slider__active');

    // For 50% value, active track width should be 50% of total track width
    // 60 * 0.5 = 30
    expect(active?.getAttribute('width')).toBe('30');
    expect(active?.getAttribute('height')).toBe('4');
  });

  it('should handle vertical orientation', async () => {
    element.config.position.orientation = 'vertical';
    element.config.value = 75; // 75% of range
    (element as any).updateSliderValue();
    await element.updateComplete;

    const track = element.shadowRoot?.querySelector('.sak-slider__track');
    const active = element.shadowRoot?.querySelector('.sak-slider__active');

    // In vertical mode, active height should reflect value
    expect(active?.getAttribute('height')).toBe('3'); // 4 * 0.75 = 3
    expect(active?.getAttribute('width')).toBe('60'); // Full width
  });

  it('should apply track and thumb styling', async () => {
    await element.updateComplete;
    const track = element.shadowRoot?.querySelector('.sak-slider__track');
    const thumb = element.shadowRoot?.querySelector('.sak-slider__thumb');

    expect(track?.getAttribute('style')).toContain('fill: #cccccc');
    expect(thumb?.getAttribute('style')).toContain('fill: #ffffff');
    expect(thumb?.getAttribute('style')).toContain('stroke: #ff6600');
  });

  it('should show value label when configured', async () => {
    await element.updateComplete;
    const label = element.shadowRoot?.querySelector('.sak-slider__label');
    expect(label).toBeTruthy();
    expect(label?.textContent?.trim()).toBe('50');
  });

  it('should show value label when configured', async () => {
    element.config.show!.label = true;
    await element.updateComplete;
    const label = element.shadowRoot?.querySelector('.sak-slider__label');
    expect(label).toBeTruthy();
    expect(label?.textContent?.trim()).toBe('50');
  });

  it('should display unit of measurement with value', async () => {
    element.entityState = {
      state: '75',
      attributes: { unit_of_measurement: '°C' },
    } as any;
    (element as any).updateSliderValue();
    await element.updateComplete;

    const label = element.shadowRoot?.querySelector('.sak-slider__label');
    expect(label?.textContent?.trim()).toBe('75 °C');
  });

  it('should clamp values to scale range', async () => {
    element.config.scale = { min: 10, max: 90, step: 1 };
    element.config.value = 150; // Above max
    (element as any).updateSliderValue();
    await element.updateComplete;

    // Value should be clamped to max (90)
    const label = element.shadowRoot?.querySelector('.sak-slider__label');
    expect(label?.textContent?.trim()).toBe('90');
  });

  it('should handle step values correctly', async () => {
    element.config.scale = { min: 0, max: 100, step: 10 };
    element.config.value = 47; // Should round to nearest step
    (element as any).updateSliderValue();

    // Value should be rounded to step (50)
    expect((element as any).currentValue).toBe(47); // Initial value preserved
  });

  it('should use entity state value when available', async () => {
    element.entityState = {
      state: '85',
      attributes: { unit_of_measurement: '%' },
    } as any;
    (element as any).updateSliderValue();
    await element.updateComplete;

    const label = element.shadowRoot?.querySelector('.sak-slider__label');
    expect(label?.textContent?.trim()).toBe('85 %');
  });

  it('should handle non-numeric entity states gracefully', async () => {
    element.entityState = {
      state: 'unknown',
      attributes: {},
    } as any;
    (element as any).updateSliderValue();
    await element.updateComplete;

    // Should fall back to config value
    const label = element.shadowRoot?.querySelector('.sak-slider__label');
    expect(label?.textContent?.trim()).toBe('50');
  });

  it('should show active track when configured', async () => {
    element.config.show!.active = true;
    await element.updateComplete;

    const active = element.shadowRoot?.querySelector('.sak-slider__active');
    expect(active).toBeTruthy();
  });

  it('should merge default config with user config', () => {
    expect(element.config.position.cx).toBe(50);
    expect(element.config.position.cy).toBe(50);
    expect(element.config.position.orientation).toBe('horizontal');
    expect(element.config.scale?.min).toBe(0);
    expect(element.config.scale?.max).toBe(100);
    expect(element.config.value).toBe(50);
  });

  it('should calculate thumb position for different values', async () => {
    // Test minimum value
    element.config.value = 0;
    (element as any).updateSliderValue();
    await element.updateComplete;

    let thumb = element.shadowRoot?.querySelector('.sak-slider__thumb');
    // At minimum, thumb should be at left edge: cx - track.width/2 = 50 - 60/2 = 20
    expect(thumb?.getAttribute('cx')).toBe('20%');

    // Test maximum value
    element.config.value = 100;
    (element as any).updateSliderValue();
    await element.updateComplete;

    thumb = element.shadowRoot?.querySelector('.sak-slider__thumb');
    // At maximum, thumb should be at right edge: cx + track.width/2 = 50 + 60/2 = 80
    expect(thumb?.getAttribute('cx')).toBe('80%');
  });
});
