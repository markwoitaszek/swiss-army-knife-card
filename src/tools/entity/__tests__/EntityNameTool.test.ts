/*
 * EntityNameTool Tests
 * Unit tests for the modern EntityNameTool implementation
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mockHass } from '../../../test/mocks/hassMock.js';
import type { EntityState } from '../../../types/SakTypes.js';
import { EntityNameTool, type EntityNameConfig } from '../EntityNameTool.js';

describe('EntityNameTool', () => {
  let tool: EntityNameTool;
  let mockConfig: EntityNameConfig;
  let mockEntityState: EntityState;
  let mockHassInstance: any;

  beforeEach(() => {
    mockHassInstance = mockHass();

    mockConfig = {
      type: 'entity_name',
      id: 'test-entity-name',
      position: { cx: 50, cy: 50 },
      entity_index: 0,
    };

    mockEntityState = {
      entity_id: 'sensor.test_temperature',
      state: '21.5',
      attributes: {
        friendly_name: 'Test Temperature Sensor',
        unit_of_measurement: '°C',
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
    (mockCard as any).hass = mockHassInstance;
    document.body.appendChild(mockCard);

    tool = new EntityNameTool();
    tool.config = mockConfig;
    tool.entityState = mockEntityState;
    tool.hass = mockHassInstance;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    it('should initialize with correct tool type', () => {
      expect(tool.getToolType()).toBe('entity_name');
    });

    it('should initialize with provided config', () => {
      expect(tool.config).toEqual(mockConfig);
    });

    it('should initialize with entity state', () => {
      expect(tool.entityState).toEqual(mockEntityState);
    });
  });

  describe('Display Name Logic', () => {
    it('should use explicit name from config when provided', () => {
      tool.config.name = 'Custom Name';
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      
      expect(resultString).toContain('Custom Name');
    });

    it('should use entity friendly_name when no explicit name', () => {
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      
      expect(resultString).toContain('Test Temperature Sensor');
    });

    it('should fall back to entity_id when no friendly_name', () => {
      tool.entityState = {
        ...mockEntityState,
        attributes: { ...mockEntityState.attributes, friendly_name: undefined },
      };
      
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      
      expect(resultString).toContain('sensor.test_temperature');
    });

    it('should use fallback_name when entity has no friendly_name or entity_id', () => {
      tool.config.fallback_name = 'Fallback Name';
      tool.entityState = {
        ...mockEntityState,
        entity_id: '',
        attributes: { ...mockEntityState.attributes, friendly_name: undefined },
      };
      
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      
      expect(resultString).toContain('Fallback Name');
    });

    it('should use "Unknown Entity" as final fallback', () => {
      tool.entityState = {
        ...mockEntityState,
        entity_id: '',
        attributes: { ...mockEntityState.attributes, friendly_name: undefined },
      };
      
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      
      expect(resultString).toContain('Unknown Entity');
    });
  });

  describe('Text Styling', () => {
    it('should apply font size styling', () => {
      tool.config.font_size = 16;
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      
      // Check that font-size is applied in the style attribute
      expect(resultString).toContain('font-size: 16px');
    });

    it('should apply font weight styling', () => {
      tool.config.font_weight = 'bold';
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      
      expect(resultString).toContain('font-weight: bold');
    });

    it('should apply font family styling', () => {
      tool.config.font_family = 'Arial, sans-serif';
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      
      expect(resultString).toContain('font-family: Arial, sans-serif');
    });

    it('should apply color styling', () => {
      tool.config.color = '#ff0000';
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      
      expect(resultString).toContain('fill: #ff0000');
    });

    it('should apply opacity styling', () => {
      tool.config.opacity = 0.8;
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      
      expect(resultString).toContain('opacity: 0.8');
    });
  });

  describe('Text Positioning', () => {
    it('should use configured x and y positions', () => {
      tool.config.x = 100;
      tool.config.y = 200;
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      
      expect(resultString).toContain('x="100"');
      expect(resultString).toContain('y="200"');
    });

    it('should fall back to position cx/cy when x/y not specified', () => {
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      
      expect(resultString).toContain('x="50"'); // position.cx
      expect(resultString).toContain('y="50"'); // position.cy
    });

    it('should apply text anchor', () => {
      tool.config.text_anchor = 'start';
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      
      expect(resultString).toContain('text-anchor="start"');
    });

    it('should apply alignment baseline', () => {
      tool.config.alignment_baseline = 'hanging';
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      
      expect(resultString).toContain('alignment-baseline="hanging"');
    });

    it('should apply rotation transform', () => {
      tool.config.rotate = 45;
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      
      expect(resultString).toContain('transform="rotate(45)"');
    });

    it('should apply visibility', () => {
      tool.config.visibility = 'hidden';
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      
      expect(resultString).toContain('visibility="hidden"');
    });
  });

  describe('Entity State Updates', () => {
    it('should update display when entity friendly_name changes', () => {
      const initialRender = tool.render();
      const initialString = initialRender.strings.join('') + initialRender.values.join('');
      expect(initialString).toContain('Test Temperature Sensor');

      // Update entity state with new friendly name
      const newEntityState: EntityState = {
        ...mockEntityState,
        attributes: {
          ...mockEntityState.attributes,
          friendly_name: 'Updated Sensor Name',
        },
      };

      tool.updateEntityState(newEntityState);
      const updatedRender = tool.render();
      const updatedString = updatedRender.strings.join('') + updatedRender.values.join('');
      expect(updatedString).toContain('Updated Sensor Name');
    });

    it('should not trigger unnecessary updates when name unchanged', () => {
      // Reset any previous calls
      tool.updateEntityState(mockEntityState);
      
      const updateSpy = vi.spyOn(tool, 'requestUpdate');
      
      // Update with same entity state
      tool.updateEntityState(mockEntityState);
      
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should trigger update when name actually changes', () => {
      const updateSpy = vi.spyOn(tool, 'requestUpdate');
      
      const newEntityState: EntityState = {
        ...mockEntityState,
        attributes: {
          ...mockEntityState.attributes,
          friendly_name: 'Different Name',
        },
      };

      tool.updateEntityState(newEntityState);
      
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  describe('Rendering', () => {
    it('should render SVG text element', () => {
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      
      expect(resultString).toContain('<text');
      expect(resultString).toContain('class="sak-entity-name"');
    });

    it('should include event handlers', () => {
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      
      expect(resultString).toContain('@click');
      expect(resultString).toContain('@mouseenter');
      expect(resultString).toContain('@mouseleave');
      expect(resultString).toContain('@touchstart');
      expect(resultString).toContain('@touchend');
    });

    it('should return empty when not visible', () => {
      tool.isVisible = false;
      const result = tool.render();
      
      expect(result.strings.join('').trim()).toBe('');
    });

    it('should apply default text-anchor and alignment-baseline', () => {
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      
      expect(resultString).toContain('text-anchor="middle"');
      expect(resultString).toContain('alignment-baseline="central"');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing entity state gracefully', () => {
      tool.entityState = undefined;
      
      expect(() => tool.render()).not.toThrow();
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      expect(resultString).toContain('Unknown Entity');
    });

    it('should handle empty entity attributes', () => {
      tool.entityState = {
        ...mockEntityState,
        attributes: {},
      };
      
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      expect(resultString).toContain('sensor.test_temperature');
    });

    it('should handle numeric font weight', () => {
      tool.config.font_weight = 600;
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      
      expect(resultString).toContain('font-weight: 600');
    });

    it('should handle zero values for positioning', () => {
      tool.config.x = 0;
      tool.config.y = 0;
      tool.config.opacity = 0;
      
      const result = tool.render();
      const resultString = result.strings.join('') + result.values.join('');
      
      expect(resultString).toContain('x="0"');
      expect(resultString).toContain('y="0"');
      expect(resultString).toContain('opacity: 0');
    });
  });
});
