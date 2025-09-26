import { beforeEach, describe, expect, it } from 'vitest';

import type { SwitchToolConfig } from '../SwitchTool.js';
import { SwitchTool } from '../SwitchTool.js';

describe('SwitchTool', () => {
  let element: SwitchTool;
  let config: SwitchToolConfig;

  beforeEach(() => {
    config = {
      type: 'switch',
      position: {
        cx: 50,
        cy: 50,
        orientation: 'horizontal',
        track: {
          width: 16,
          height: 7,
          radius: 3.5,
        },
        thumb: {
          width: 9,
          height: 9,
          radius: 4.5,
          offset: 4.5,
        },
      },
      entity_index: 0,
      switch: {
        checked_track_color: '#4CAF50',
        unchecked_track_color: '#cccccc',
        checked_button_color: '#ffffff',
        unchecked_button_color: '#ffffff',
      },
    };

    element = new SwitchTool();
    element.config = config;
    document.body.appendChild(element);
  });

  it('should create a switch tool instance', () => {
    expect(element).toBeInstanceOf(SwitchTool);
  });

  it('should have correct tool type', () => {
    expect(element.getToolType()).toBe('switch');
  });

  it('should render a group element', async () => {
    await element.updateComplete;
    const group = element.shadowRoot?.querySelector('g');
    expect(group).toBeTruthy();
    expect(group?.getAttribute('class')).toContain('sak-switch');
  });

  it('should render track and thumb elements', async () => {
    await element.updateComplete;
    const track = element.shadowRoot?.querySelector('.sak-switch__track');
    const thumb = element.shadowRoot?.querySelector('.sak-switch__thumb');
    expect(track).toBeTruthy();
    expect(thumb).toBeTruthy();
  });

  it('should apply correct track dimensions', async () => {
    await element.updateComplete;
    const track = element.shadowRoot?.querySelector('.sak-switch__track');
    expect(track?.getAttribute('width')).toBe('16');
    expect(track?.getAttribute('height')).toBe('7');
    expect(track?.getAttribute('rx')).toBe('3.5');
  });

  it('should apply correct thumb dimensions', async () => {
    await element.updateComplete;
    const thumb = element.shadowRoot?.querySelector('.sak-switch__thumb');
    expect(thumb?.getAttribute('width')).toBe('9');
    expect(thumb?.getAttribute('height')).toBe('9');
    expect(thumb?.getAttribute('rx')).toBe('4.5');
  });

  it('should show off state by default', async () => {
    await element.updateComplete;
    const group = element.shadowRoot?.querySelector('g');
    expect(group?.getAttribute('class')).not.toContain('sak-switch--checked');

    const track = element.shadowRoot?.querySelector('.sak-switch__track');
    const style = track?.getAttribute('style');
    expect(style).toContain('fill: #cccccc'); // unchecked color
  });

  it('should show on state when entity is on', async () => {
    element.entityState = {
      state: 'on',
      attributes: {},
    } as any;

    // Manually trigger state update since we're setting entityState directly
    (element as any).updateSwitchState();
    await element.updateComplete;

    const group = element.shadowRoot?.querySelector('g');
    expect(group?.getAttribute('class')).toContain('sak-switch--checked');

    const track = element.shadowRoot?.querySelector('.sak-switch__track');
    const style = track?.getAttribute('style');
    expect(style).toContain('fill: #4CAF50'); // checked color
  });

  it('should position thumb correctly for horizontal on state', async () => {
    element.entityState = { state: 'on', attributes: {} } as any;
    (element as any).updateSwitchState();
    await element.updateComplete;

    const thumb = element.shadowRoot?.querySelector('.sak-switch__thumb');
    const x = parseFloat(thumb?.getAttribute('x') || '0');

    // Thumb should be offset to the right when on
    // x = cx - thumb.width/2 + offset = 50 - 9/2 + 4.5 = 50 - 4.5 + 4.5 = 50
    expect(x).toBe(50);
  });

  it('should position thumb correctly for horizontal off state', async () => {
    element.entityState = { state: 'off', attributes: {} } as any;
    (element as any).updateSwitchState();
    await element.updateComplete;

    const thumb = element.shadowRoot?.querySelector('.sak-switch__thumb');
    const x = parseFloat(thumb?.getAttribute('x') || '0');

    // Thumb should be offset to the left when off
    // x = cx - thumb.width/2 - offset = 50 - 9/2 - 4.5 = 50 - 4.5 - 4.5 = 41
    expect(x).toBe(41);
  });

  it('should handle vertical orientation', async () => {
    element.config.position.orientation = 'vertical';
    element.entityState = { state: 'on', attributes: {} } as any;
    (element as any).updateSwitchState();
    await element.updateComplete;

    const thumb = element.shadowRoot?.querySelector('.sak-switch__thumb');
    const y = parseFloat(thumb?.getAttribute('y') || '0');

    // In vertical mode, thumb should move up when on
    // y = cy - thumb.height/2 - offset = 50 - 9/2 - 4.5 = 41
    expect(y).toBe(41);
  });

  it('should handle click events', async () => {
    let clickHandled = false;

    // Mock the toggle function to track calls
    const originalToggle = (element as any).toggleSwitch;
    (element as any).toggleSwitch = async () => {
      clickHandled = true;
    };

    await element.updateComplete;

    // Simulate click
    const group = element.shadowRoot?.querySelector('g');
    group?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(clickHandled).toBe(true);

    // Restore original method
    (element as any).toggleSwitch = originalToggle;
  });

  it('should apply hover effects', async () => {
    await element.updateComplete;

    // Simulate hover
    element.dispatchEvent(new MouseEvent('mouseenter'));
    await element.updateComplete;

    const group = element.shadowRoot?.querySelector('g');
    expect(group?.getAttribute('style')).toContain('cursor: pointer');
  });

  it('should handle different track colors', async () => {
    element.config.switch = {
      checked_track_color: '#ff0000',
      unchecked_track_color: '#0000ff',
      checked_button_color: '#00ff00',
      unchecked_button_color: '#ffff00',
    };

    // Test off state
    element.entityState = { state: 'off', attributes: {} } as any;
    await element.updateComplete;

    let track = element.shadowRoot?.querySelector('.sak-switch__track');
    let thumb = element.shadowRoot?.querySelector('.sak-switch__thumb');
    expect(track?.getAttribute('style')).toContain('fill: #0000ff');
    expect(thumb?.getAttribute('style')).toContain('fill: #ffff00');

    // Test on state
    element.entityState = { state: 'on', attributes: {} } as any;
    await element.updateComplete;

    track = element.shadowRoot?.querySelector('.sak-switch__track');
    thumb = element.shadowRoot?.querySelector('.sak-switch__thumb');
    expect(track?.getAttribute('style')).toContain('fill: #ff0000');
    expect(thumb?.getAttribute('style')).toContain('fill: #00ff00');
  });

  it('should apply transition animations', async () => {
    await element.updateComplete;

    const track = element.shadowRoot?.querySelector('.sak-switch__track');
    const thumb = element.shadowRoot?.querySelector('.sak-switch__thumb');

    expect(track?.getAttribute('style')).toContain('transition: all 0.2s ease');
    expect(thumb?.getAttribute('style')).toContain('transition: all 0.2s ease');
  });

  it('should merge default config with user config', () => {
    expect(element.config.position.cx).toBe(50);
    expect(element.config.position.cy).toBe(50);
    expect(element.config.position.orientation).toBe('horizontal');
    expect(element.config.position.track?.width).toBe(16);
    expect(element.config.position.thumb?.width).toBe(9);
  });

  it('should handle missing entity state gracefully', async () => {
    // No entity state set
    await element.updateComplete;

    const group = element.shadowRoot?.querySelector('g');
    expect(group?.getAttribute('class')).not.toContain('sak-switch--checked');

    // Should still render properly
    const track = element.shadowRoot?.querySelector('.sak-switch__track');
    const thumb = element.shadowRoot?.querySelector('.sak-switch__thumb');
    expect(track).toBeTruthy();
    expect(thumb).toBeTruthy();
  });

  it('should handle unknown entity states', async () => {
    element.entityState = { state: 'unknown', attributes: {} } as any;
    await element.updateComplete;

    // Unknown state should be treated as off
    const group = element.shadowRoot?.querySelector('g');
    expect(group?.getAttribute('class')).not.toContain('sak-switch--checked');
  });
});
