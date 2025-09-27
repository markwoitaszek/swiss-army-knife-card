/*
 * TemplateUtils Tests
 * Unit tests for template processing and JavaScript evaluation
 */

import { describe, expect, it, vi } from 'vitest';
import TemplateUtils, {
  type EntityConfig,
  type TemplateConfig,
  type ToolConfig,
} from '../TemplateUtils.js';

describe('TemplateUtils', () => {
  describe('replaceVariables3', () => {
    it('should return template content when no variables provided', () => {
      const template: TemplateConfig = {
        template: { type: 'toolset' },
        toolset: { position: { cx: 50, cy: 50 } },
      };

      const result = TemplateUtils.replaceVariables3(undefined, template);
      expect(result).toEqual({ position: { cx: 50, cy: 50 } });
    });

    it('should replace string variables', () => {
      const template: TemplateConfig = {
        template: { type: 'toolset' },
        toolset: { name: '[[name]]', color: '[[color]]' },
      };
      const variables = [{ name: 'test-tool' }, { color: '#ff0000' }];

      const result = TemplateUtils.replaceVariables3(variables, template);
      expect(result).toEqual({ name: 'test-tool', color: '#ff0000' });
    });

    it('should replace number and boolean variables', () => {
      const template: TemplateConfig = {
        template: { type: 'toolset' },
        toolset: { size: '"[[size]]"', enabled: '"[[enabled]]"' },
      };
      const variables = [{ size: 42 }, { enabled: true }];

      const result = TemplateUtils.replaceVariables3(variables, template);
      expect(result).toEqual({ size: 42, enabled: true });
    });

    it('should replace object variables', () => {
      const template: TemplateConfig = {
        template: { type: 'toolset' },
        toolset: { position: '"[[position]]"' },
      };
      const variables = [{ position: { cx: 50, cy: 50 } }];

      const result = TemplateUtils.replaceVariables3(variables, template);
      expect(result).toEqual({ position: { cx: 50, cy: 50 } });
    });

    it('should merge variables with defaults', () => {
      const template: TemplateConfig = {
        template: {
          type: 'toolset',
          defaults: [{ color: '#000000' }, { size: 20 }],
        },
        toolset: { name: '[[name]]', color: '[[color]]', size: '"[[size]]"' },
      };
      const variables = [{ name: 'test-tool' }];

      const result = TemplateUtils.replaceVariables3(variables, template);
      expect(result).toEqual({ name: 'test-tool', color: '#000000', size: 20 });
    });
  });

  describe('getJsTemplateOrValueConfig', () => {
    const mockTool: ToolConfig = { entity_index: 0 };
    const mockEntities = [{ entity_id: 'sensor.test' }];

    it('should return primitive values as-is', () => {
      expect(TemplateUtils.getJsTemplateOrValueConfig(mockTool, mockEntities, 42)).toBe(42);
      expect(TemplateUtils.getJsTemplateOrValueConfig(mockTool, mockEntities, true)).toBe(true);
      expect(TemplateUtils.getJsTemplateOrValueConfig(mockTool, mockEntities, 'string')).toBe(
        'string'
      );
    });

    it('should return null/undefined as-is', () => {
      expect(TemplateUtils.getJsTemplateOrValueConfig(mockTool, mockEntities, null)).toBeNull();
      expect(TemplateUtils.getJsTemplateOrValueConfig(mockTool, mockEntities, undefined)).toBeUndefined();
    });

    it('should process objects recursively', () => {
      const input = {
        a: 1,
        b: { c: 2, d: '[[[[return 3;]]]]' },
        arr: [1, '[[[[return 2;]]]]'],
      };

      vi.spyOn(TemplateUtils, 'evaluateJsTemplateConfig')
        .mockReturnValueOnce(3)
        .mockReturnValueOnce(2);

      const result = TemplateUtils.getJsTemplateOrValueConfig(mockTool, mockEntities, input);
      expect(result).toEqual({
        a: 1,
        b: { c: 2, d: 3 },
        arr: [1, 2],
      });
    });

    it('should evaluate JavaScript templates', () => {
      const template = '[[[[return tool_config.entity_index + 1;]]]]';
      
      vi.spyOn(TemplateUtils, 'evaluateJsTemplateConfig').mockReturnValue(1);

      const result = TemplateUtils.getJsTemplateOrValueConfig(mockTool, mockEntities, template);
      expect(result).toBe(1);
      expect(TemplateUtils.evaluateJsTemplateConfig).toHaveBeenCalledWith(
        mockTool,
        mockEntities,
        'return tool_config.entity_index + 1;'
      );
    });
  });

  describe('evaluateJsTemplateConfig', () => {
    it('should evaluate JavaScript with tool and entities context', () => {
      const tool: ToolConfig = { entity_index: 0, name: 'test' };
      const entities = [{ entity_id: 'sensor.test' }];
      const template = 'return tool_config.name + "_" + entities_config[0].entity_id;';

      const result = TemplateUtils.evaluateJsTemplateConfig(tool, entities, template);
      expect(result).toBe('test_sensor.test');
    });

    it('should throw enhanced error on evaluation failure', () => {
      const tool: ToolConfig = {};
      const entities: any[] = [];
      const template = 'return undefined_variable;';

      expect(() => {
        TemplateUtils.evaluateJsTemplateConfig(tool, entities, template);
      }).toThrow('Sak-evaluateJsTemplateConfig-Error');
    });
  });

  describe('getJsTemplateOrValue', () => {
    const mockTool = {
      config: { entity_index: 0 },
      _card: {
        _hass: {
          states: { 'sensor.test': { state: '25' } },
          user: { name: 'test-user' },
        },
        entities: [{ entity_id: 'sensor.test' }],
        config: { entities: [{ entity_id: 'sensor.test' }] },
      },
    };
    const mockState = { state: '25', entity_id: 'sensor.test' };

    it('should return primitive values as-is', () => {
      expect(TemplateUtils.getJsTemplateOrValue(mockTool, mockState, 42)).toBe(42);
      expect(TemplateUtils.getJsTemplateOrValue(mockTool, mockState, true)).toBe(true);
      expect(TemplateUtils.getJsTemplateOrValue(mockTool, mockState, 'string')).toBe('string');
    });

    it('should process objects recursively', () => {
      const input = {
        a: 1,
        b: { c: 2, d: '[[[return parseFloat(state.state);]]]' },
      };

      vi.spyOn(TemplateUtils, 'evaluateJsTemplate').mockReturnValue(25);

      const result = TemplateUtils.getJsTemplateOrValue(mockTool, mockState, input);
      expect(result).toEqual({
        a: 1,
        b: { c: 2, d: 25 },
      });
    });

    it('should evaluate JavaScript templates', () => {
      const template = '[[[return parseFloat(state.state) + 5;]]]';
      
      vi.spyOn(TemplateUtils, 'evaluateJsTemplate').mockReturnValue(30);

      const result = TemplateUtils.getJsTemplateOrValue(mockTool, mockState, template);
      expect(result).toBe(30);
    });
  });

  describe('evaluateJsTemplate', () => {
    const mockTool = {
      config: { entity_index: 0 },
      _card: {
        _hass: {
          states: { 'sensor.test': { state: '25' } },
          user: { name: 'test-user' },
        },
        entities: [{ entity_id: 'sensor.test' }],
        config: { entities: [{ entity_id: 'sensor.test' }] },
      },
    };

    it('should evaluate JavaScript with full context', () => {
      const state = { state: '25', entity_id: 'sensor.test' };
      const template = 'return parseFloat(state.state) + (entity ? 1 : 0);';

      const result = TemplateUtils.evaluateJsTemplate(mockTool, state, template);
      expect(result).toBe(26); // 25 + 1 (entity exists)
    });

    it('should handle tools without entity_index', () => {
      const toolWithoutEntity = {
        config: {},
        _card: mockTool._card,
      };
      const state = { state: '25' };
      const template = 'return entity ? "has_entity" : "no_entity";';

      const result = TemplateUtils.evaluateJsTemplate(toolWithoutEntity, state, template);
      expect(result).toBe('no_entity');
    });

    it('should throw enhanced error on evaluation failure', () => {
      const state = { state: '25' };
      const template = 'return undefined_variable;';

      expect(() => {
        TemplateUtils.evaluateJsTemplate(mockTool, state, template);
      }).toThrow('Sak-evaluateJsTemplate-Error');
    });
  });

  describe('safeEvaluateTemplate', () => {
    it('should evaluate template with provided context', () => {
      const template = 'return value * 2;';
      const context = { value: 21 };

      const result = TemplateUtils.safeEvaluateTemplate(template, context);
      expect(result).toBe(42);
    });

    it('should return null on evaluation error', () => {
      const template = 'return undefined_variable;';
      const context = {};

      // Mock console.warn to avoid test output
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = TemplateUtils.safeEvaluateTemplate(template, context);
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should work without context', () => {
      const template = 'return 42;';

      const result = TemplateUtils.safeEvaluateTemplate(template);
      expect(result).toBe(42);
    });
  });

  describe('isJavaScriptTemplate', () => {
    it('should identify JavaScript templates', () => {
      expect(TemplateUtils.isJavaScriptTemplate('[[[return 42;]]]')).toBe(true);
      expect(TemplateUtils.isJavaScriptTemplate('[[[[return 42;]]]]')).toBe(true);
      expect(TemplateUtils.isJavaScriptTemplate('  [[[return 42;]]]  ')).toBe(true);
    });

    it('should reject non-templates', () => {
      expect(TemplateUtils.isJavaScriptTemplate('regular string')).toBe(false);
      expect(TemplateUtils.isJavaScriptTemplate('[[[incomplete')).toBe(false);
      expect(TemplateUtils.isJavaScriptTemplate('incomplete]]]')).toBe(false);
      expect(TemplateUtils.isJavaScriptTemplate(42 as any)).toBe(false);
    });
  });

  describe('extractTemplateContent', () => {
    it('should extract content from templates', () => {
      expect(TemplateUtils.extractTemplateContent('[[[return 42;]]]')).toBe('return 42;');
      expect(TemplateUtils.extractTemplateContent('[[[[return 42;]]]]')).toBe('return 42;');
      expect(TemplateUtils.extractTemplateContent('  [[[return 42;]]]  ')).toBe('return 42;');
    });

    it('should return original string for non-templates', () => {
      expect(TemplateUtils.extractTemplateContent('regular string')).toBe('regular string');
      expect(TemplateUtils.extractTemplateContent('[[[incomplete')).toBe('[[[incomplete');
    });
  });
});
