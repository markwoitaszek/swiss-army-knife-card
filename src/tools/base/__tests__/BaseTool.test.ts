/*
 * BaseTool Tests
 * Unit tests for the abstract base tool class
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockHass } from '../../../test/mocks/hassMock.js';
import type {
  EntityState,
  Position,
  Rotation,
  Scale,
  ToolConfig,
} from '../../../types/SakTypes.js';
import { BaseTool } from '../BaseTool.js';

// Create a concrete implementation of BaseTool for testing
class TestTool extends BaseTool {
  render(): any {
    return null;
  }

  getToolType(): string {
    return 'test';
  }
}

describe('BaseTool', () => {
  let tool: TestTool;
  let mockConfig: ToolConfig;
  let mockEntityState: EntityState;
  let mockHassInstance: any;

  beforeEach(() => {
    mockHassInstance = mockHass();

    mockConfig = {
      type: 'circle',
      id: 'test-tool',
      position: { cx: 50, cy: 50 },
      entity_index: 0,
      color: '#ff0000',
      size: 20,
    };

    mockEntityState = {
      entity_id: 'sensor.test_temperature',
      state: '21.5',
      attributes: {
        unit_of_measurement: '°C',
        friendly_name: 'Test Temperature',
        icon: 'mdi:thermometer',
      },
      last_changed: '2023-01-01T00:00:00Z',
      last_updated: '2023-01-01T00:00:00Z',
      context: {
        id: 'test-context',
        user_id: null,
        parent_id: null,
      },
    };

    // Create a mock card element
    const mockCard = document.createElement('swiss-army-knife-card');
    mockCard.hass = mockHassInstance;
    document.body.appendChild(mockCard);

    tool = new TestTool();
    tool.config = mockConfig;
    tool.entityState = mockEntityState;
    tool.hass = mockHassInstance;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    it('should create tool instance', () => {
      expect(tool).toBeInstanceOf(BaseTool);
      expect(tool.tagName.toLowerCase()).toBe('sak-base-tool');
    });

    it('should initialize with default state', () => {
      expect(tool.isActive).toBe(false);
      expect(tool.isVisible).toBe(true);
      expect(tool.isHovered).toBe(false);
    });

    it('should set up event listeners on connection', () => {
      const addEventListenerSpy = vi.spyOn(tool, 'addEventListener');

      tool.connectedCallback();

      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
    });

    it('should cleanup event listeners on disconnection', () => {
      const removeEventListenerSpy = vi.spyOn(tool, 'removeEventListener');

      tool.connectedCallback();
      tool.disconnectedCallback();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      tool.connectedCallback();
    });

    it('should handle click events', () => {
      const mockEvent = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = vi.spyOn(mockEvent, 'preventDefault');
      const stopPropagationSpy = vi.spyOn(mockEvent, 'stopPropagation');

      tool.dispatchEvent(mockEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should handle mouse enter events', () => {
      const mockEvent = new MouseEvent('mouseenter');

      tool.dispatchEvent(mockEvent);

      expect(tool.isHovered).toBe(true);
    });

    it('should handle mouse leave events', () => {
      const mockEvent = new MouseEvent('mouseleave');

      tool.dispatchEvent(mockEvent);

      expect(tool.isHovered).toBe(false);
    });

    it('should handle touch start events', () => {
      const mockEvent = new TouchEvent('touchstart');

      tool.dispatchEvent(mockEvent);

      expect(tool.isHovered).toBe(true);
    });

    it('should handle touch end events', () => {
      const mockEvent = new TouchEvent('touchend');

      tool.dispatchEvent(mockEvent);

      expect(tool.isHovered).toBe(false);
    });
  });

  describe('Action Execution', () => {
    beforeEach(() => {
      tool.connectedCallback();
    });

    it('should execute toggle action', () => {
      const callServiceSpy = vi.spyOn(tool.hass, 'callService');
      tool.config.tap_action = { action: 'toggle' };

      tool.dispatchEvent(new MouseEvent('click'));

      expect(callServiceSpy).toHaveBeenCalledWith('homeassistant', 'toggle', {
        entity_id: 'sensor.test_temperature',
      });
    });

    it('should execute call-service action', () => {
      const callServiceSpy = vi.spyOn(tool.hass, 'callService');
      tool.config.tap_action = {
        action: 'call-service',
        service: 'light.turn_on',
        service_data: { brightness: 255 },
      };

      tool.dispatchEvent(new MouseEvent('click'));

      expect(callServiceSpy).toHaveBeenCalledWith('light', 'turn_on', { brightness: 255 });
    });

    it('should execute navigate action', () => {
      const callServiceSpy = vi.spyOn(tool.hass, 'callService');
      tool.config.tap_action = {
        action: 'navigate',
        navigation_path: '/lovelace/dashboard',
      };

      tool.dispatchEvent(new MouseEvent('click'));

      expect(callServiceSpy).toHaveBeenCalledWith('browser_mod', 'navigate', {
        path: '/lovelace/dashboard',
      });
    });

    it('should execute url action', () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      tool.config.tap_action = {
        action: 'url',
        url_path: 'https://example.com',
      };

      tool.dispatchEvent(new MouseEvent('click'));

      expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank');
    });

    it('should execute more-info action', () => {
      const callServiceSpy = vi.spyOn(tool.hass, 'callService');
      tool.config.tap_action = { action: 'more-info' };

      tool.dispatchEvent(new MouseEvent('click'));

      expect(callServiceSpy).toHaveBeenCalledWith('browser_mod', 'more_info', {
        entity_id: 'sensor.test_temperature',
      });
    });

    it('should handle unknown action gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      tool.config.tap_action = { action: 'unknown-action' as any };

      tool.dispatchEvent(new MouseEvent('click'));

      expect(consoleSpy).toHaveBeenCalledWith('BaseTool: Unknown action type', 'unknown-action');
    });

    it('should not execute action when none specified', () => {
      const callServiceSpy = vi.spyOn(tool.hass, 'callService');
      tool.config.tap_action = { action: 'none' };

      tool.dispatchEvent(new MouseEvent('click'));

      expect(callServiceSpy).not.toHaveBeenCalled();
    });
  });

  describe('Entity Utilities', () => {
    it('should get entity value', () => {
      const value = tool.getEntityValue();
      expect(value).toBe('21.5');
    });

    it('should get entity attribute', () => {
      const unit = tool.getEntityAttribute('unit_of_measurement');
      expect(unit).toBe('°C');
    });

    it('should get entity icon', () => {
      const icon = tool.getEntityIcon();
      expect(icon).toBe('mdi:thermometer');
    });

    it('should get entity name', () => {
      const name = tool.getEntityName();
      expect(name).toBe('Test Temperature');
    });

    it('should handle missing entity state', () => {
      tool.entityState = undefined;

      expect(tool.getEntityValue()).toBeUndefined();
      expect(tool.getEntityAttribute('unit_of_measurement')).toBeUndefined();
      expect(tool.getEntityIcon()).toBe('mdi:help-circle');
      expect(tool.getEntityName()).toBe('Unknown');
    });
  });

  describe('Transform Utilities', () => {
    it('should generate transform string with position', () => {
      const position: Position = { cx: 100, cy: 200 };
      tool.position = position;

      const transform = tool.getTransform();
      expect(transform).toBe('translate(100, 200)');
    });

    it('should generate transform string with scale', () => {
      const position: Position = { cx: 50, cy: 50 };
      const scale: Scale = { x: 2, y: 1.5 };
      tool.position = position;
      tool.scale = scale;

      const transform = tool.getTransform();
      expect(transform).toBe('translate(50, 50) scale(2, 1.5)');
    });

    it('should generate transform string with rotation', () => {
      const position: Position = { cx: 50, cy: 50 };
      const rotation: Rotation = { angle: 45, cx: 25, cy: 25 };
      tool.position = position;
      tool.rotation = rotation;

      const transform = tool.getTransform();
      expect(transform).toBe('translate(50, 50) rotate(45 25 25)');
    });

    it('should generate complete transform string', () => {
      const position: Position = { cx: 50, cy: 50 };
      const scale: Scale = { x: 2, y: 2 };
      const rotation: Rotation = { angle: 90 };
      tool.position = position;
      tool.scale = scale;
      tool.rotation = rotation;

      const transform = tool.getTransform();
      expect(transform).toBe('translate(50, 50) scale(2, 2) rotate(90 50 50)');
    });
  });

  describe('Color Utilities', () => {
    it('should get string color', () => {
      tool.config.color = '#ff0000';

      const color = tool.getColor();
      expect(color).toBe('#ff0000');
    });

    it('should get fixed color from ColorConfig', () => {
      tool.config.color = {
        type: 'fixed',
        color: '#00ff00',
      };

      const color = tool.getColor();
      expect(color).toBe('#00ff00');
    });

    it('should get entity color from ColorConfig', () => {
      tool.config.color = {
        type: 'entity',
        attribute: 'unit_of_measurement',
      };

      const color = tool.getColor();
      expect(color).toBe('°C');
    });

    it('should return default color when no color specified', () => {
      tool.config.color = undefined;

      const color = tool.getColor();
      expect(color).toBe('#000000');
    });

    it('should return default color for unknown ColorConfig type', () => {
      tool.config.color = {
        type: 'unknown' as any,
      };

      const color = tool.getColor();
      expect(color).toBe('#000000');
    });
  });

  describe('Animation Utilities', () => {
    it('should get animation classes for pulse animation', () => {
      tool.config.animation = {
        type: 'pulse',
        duration: 1000,
      };

      const classes = tool.getAnimationClasses();
      expect(classes).toBe('animated animation-pulse');
    });

    it('should get animation classes for rotate animation', () => {
      tool.config.animation = {
        type: 'rotate',
        duration: 2000,
      };

      const classes = tool.getAnimationClasses();
      expect(classes).toBe('animated animation-rotate');
    });

    it('should return empty string for no animation', () => {
      tool.config.animation = { type: 'none' };

      const classes = tool.getAnimationClasses();
      expect(classes).toBe('');
    });

    it('should return empty string when no animation config', () => {
      tool.config.animation = undefined;

      const classes = tool.getAnimationClasses();
      expect(classes).toBe('');
    });
  });

  describe('Visibility Utilities', () => {
    it('should show when visible', () => {
      tool.isVisible = true;

      const shouldShow = tool.shouldShow();
      expect(shouldShow).toBe(true);
    });

    it('should not show when not visible', () => {
      tool.isVisible = false;

      const shouldShow = tool.shouldShow();
      expect(shouldShow).toBe(false);
    });
  });

  describe('Update Methods', () => {
    it('should update entity state', () => {
      const newEntityState: EntityState = {
        ...mockEntityState,
        state: '25.0',
      };

      tool.updateEntityState(newEntityState);

      expect(tool.entityState).toBe(newEntityState);
    });

    it('should update position', () => {
      const newPosition: Position = { cx: 100, cy: 200 };

      tool.updatePosition(newPosition);

      expect(tool.position).toBe(newPosition);
    });

    it('should update scale', () => {
      const newScale: Scale = { x: 2, y: 2 };

      tool.updateScale(newScale);

      expect(tool.scale).toBe(newScale);
    });

    it('should update rotation', () => {
      const newRotation: Rotation = { angle: 180 };

      tool.updateRotation(newRotation);

      expect(tool.rotation).toBe(newRotation);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing configuration gracefully', () => {
      tool.config = undefined as any;

      expect(() => {
        tool.connectedCallback();
      }).not.toThrow();
    });

    it('should handle missing hass connection', () => {
      tool.hass = null;

      expect(() => {
        tool.dispatchEvent(new MouseEvent('click'));
      }).not.toThrow();
    });

    it('should handle service call errors', () => {
      const callServiceSpy = vi
        .spyOn(tool.hass, 'callService')
        .mockRejectedValue(new Error('Service error'));
      tool.config.tap_action = { action: 'toggle' };

      expect(() => {
        tool.dispatchEvent(new MouseEvent('click'));
      }).not.toThrow();
      
      expect(callServiceSpy).toHaveBeenCalled();
    });
  });
});
