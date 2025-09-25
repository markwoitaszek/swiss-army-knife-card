/*
 * ConfigService Tests
 * Unit tests for configuration validation and processing service
 */

import { beforeEach, describe, expect, it } from 'vitest';
import type { SakConfig } from '../../types/SakTypes.js';
import { ConfigService } from '../ConfigService.js';

describe('ConfigService', () => {
  let service: ConfigService;
  let validConfig: SakConfig;

  beforeEach(() => {
    service = new ConfigService();

    validConfig = {
      entities: [
        {
          entity: 'sensor.test_temperature',
          name: 'Test Temperature',
          icon: 'mdi:thermometer',
          unit: '°C',
        },
      ],
      layout: {
        toolsets: [
          {
            toolset: 'test-toolset',
            position: { cx: 50, cy: 50 },
            tools: [
              {
                type: 'circle',
                id: 'test-circle',
                position: { cx: 50, cy: 50 },
                entity_index: 0,
                color: '#ff0000',
                size: 20,
              },
            ],
          },
        ],
      },
    };
  });

  describe('Configuration Validation', () => {
    it('should validate correct configuration', () => {
      const result = service.validateConfig(validConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should reject null configuration', () => {
      const result = service.validateConfig(null);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Configuration is required');
    });

    it('should reject non-object configuration', () => {
      const result = service.validateConfig('invalid');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Configuration must be an object');
    });

    it('should reject configuration without layout', () => {
      const configWithoutLayout = {
        entities: [{ entity: 'sensor.test' }],
      };

      const result = service.validateConfig(configWithoutLayout);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Layout configuration is required');
    });

    it('should reject configuration without entities', () => {
      const configWithoutEntities = {
        layout: { toolsets: [] },
      };

      const result = service.validateConfig(configWithoutEntities);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Entities configuration is required and must be an array');
    });

    it('should reject non-array entities', () => {
      const configWithInvalidEntities = {
        entities: 'invalid',
        layout: { toolsets: [] },
      };

      const result = service.validateConfig(configWithInvalidEntities);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Entities configuration is required and must be an array');
    });

    it('should validate toolset configuration', () => {
      const configWithInvalidToolset = {
        entities: [{ entity: 'sensor.test' }],
        layout: {
          toolsets: [
            {
              // Missing required properties
            },
          ],
        },
      };

      const result = service.validateConfig(configWithInvalidToolset);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('toolset name is required'))).toBe(true);
    });

    it('should validate tool configuration', () => {
      const configWithInvalidTool = {
        entities: [{ entity: 'sensor.test' }],
        layout: {
          toolsets: [
            {
              toolset: 'test',
              position: { cx: 50, cy: 50 },
              tools: [
                {
                  // Missing required properties
                },
              ],
            },
          ],
        },
      };

      const result = service.validateConfig(configWithInvalidTool);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('type is required'))).toBe(true);
    });

    it('should validate position configuration', () => {
      const configWithInvalidPosition = {
        entities: [{ entity: 'sensor.test' }],
        layout: {
          toolsets: [
            {
              toolset: 'test',
              position: { cx: 'invalid', cy: 50 },
              tools: [],
            },
          ],
        },
      };

      const result = service.validateConfig(configWithInvalidPosition);

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(error => error.includes('position must have numeric cx and cy values'))
      ).toBe(true);
    });

    it('should validate entity configuration', () => {
      const configWithInvalidEntity = {
        entities: [
          {
            // Missing required entity property
            name: 'Test',
          },
        ],
        layout: { toolsets: [] },
      };

      const result = service.validateConfig(configWithInvalidEntity);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('entity ID is required'))).toBe(true);
    });

    it('should generate warnings for optional properties', () => {
      const configWithWarnings = {
        entities: [{ entity: 'sensor.test' }],
        layout: { toolsets: [] },
        aspectratio: 123, // Should be string
        theme: 456, // Should be string
        styles: 'invalid', // Should be object
      };

      const result = service.validateConfig(configWithWarnings);

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(
        result.warnings.some(warning => warning.includes('Aspect ratio should be a string'))
      ).toBe(true);
    });
  });

  describe('Configuration Sanitization', () => {
    it('should sanitize valid configuration', () => {
      const sanitized = service.sanitizeConfig(validConfig);

      expect(sanitized).toEqual(validConfig);
      expect(service.getConfig()).toEqual(validConfig);
    });

    it('should add default values for missing properties', () => {
      const incompleteConfig = {
        entities: [],
        layout: { toolsets: [] },
      };

      const sanitized = service.sanitizeConfig(incompleteConfig);

      expect(sanitized.aspectratio).toBe('1/1');
      expect(sanitized.dev).toEqual({});
    });

    it('should sanitize entity properties', () => {
      const configWithIncompleteEntity = {
        entities: [
          {
            entity: 'sensor.test',
            // Missing optional properties
          },
        ],
        layout: { toolsets: [] },
      };

      const sanitized = service.sanitizeConfig(configWithIncompleteEntity);

      expect(sanitized.entities[0]).toEqual({
        entity: 'sensor.test',
        name: '',
        icon: '',
        unit: '',
        attribute: '',
        secondary_info: '',
      });
    });

    it('should sanitize toolset properties', () => {
      const configWithIncompleteToolset = {
        entities: [{ entity: 'sensor.test' }],
        layout: {
          toolsets: [
            {
              toolset: 'test',
              position: { cx: '50', cy: '50' }, // String values
              tools: [],
            },
          ],
        },
      };

      const sanitized = service.sanitizeConfig(configWithIncompleteToolset);

      expect(sanitized.layout.toolsets[0].position).toEqual({
        cx: 50,
        cy: 50,
        x: undefined,
        y: undefined,
      });
    });

    it('should sanitize tool properties', () => {
      const configWithIncompleteTool = {
        entities: [{ entity: 'sensor.test' }],
        layout: {
          toolsets: [
            {
              toolset: 'test',
              position: { cx: 50, cy: 50 },
              tools: [
                {
                  type: 'circle',
                  id: 'test',
                  position: { cx: '50', cy: '50' },
                  entity_index: '0', // String value
                },
              ],
            },
          ],
        },
      };

      const sanitized = service.sanitizeConfig(configWithIncompleteTool);

      expect(sanitized.layout.toolsets[0].tools[0]).toEqual({
        type: 'circle',
        id: 'test',
        position: { cx: 50, cy: 50, x: undefined, y: undefined },
        entity_index: 0,
        color: '#000000',
        size: 10,
        width: undefined,
        height: undefined,
        radius: undefined,
        stroke_width: undefined,
        opacity: undefined,
        animation: undefined,
        tap_action: undefined,
        hold_action: undefined,
        double_tap_action: undefined,
      });
    });

    it('should handle null/undefined values gracefully', () => {
      const configWithNulls = {
        entities: null,
        layout: null,
      };

      const sanitized = service.sanitizeConfig(configWithNulls);

      expect(sanitized.entities).toEqual([]);
      expect(sanitized.layout).toEqual({ toolsets: [] });
    });
  });

  describe('Configuration Merging', () => {
    it('should merge configurations', () => {
      const baseConfig = {
        entities: [{ entity: 'sensor.base' }],
        layout: { toolsets: [] },
        aspectratio: '1/1',
      };

      const overrideConfig = {
        aspectratio: '16/9',
        theme: 'custom-theme',
      };

      const merged = service.mergeConfigs(baseConfig, overrideConfig);

      expect(merged).toEqual({
        entities: [{ entity: 'sensor.base' }],
        layout: { toolsets: [] },
        aspectratio: '16/9',
        theme: 'custom-theme',
      });
    });

    it('should handle deep merging', () => {
      const baseConfig = {
        entities: [{ entity: 'sensor.base', name: 'Base' }],
        layout: { toolsets: [] },
      };

      const overrideConfig = {
        entities: [{ entity: 'sensor.override', name: 'Override' }],
      };

      const merged = service.mergeConfigs(baseConfig, overrideConfig);

      expect(merged.entities).toEqual([{ entity: 'sensor.override', name: 'Override' }]);
    });

    it('should handle empty override', () => {
      const baseConfig = {
        entities: [{ entity: 'sensor.base' }],
        layout: { toolsets: [] },
      };

      const merged = service.mergeConfigs(baseConfig, {});

      expect(merged).toEqual(baseConfig);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty configuration object', () => {
      const result = service.validateConfig({});

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle configuration with empty arrays', () => {
      const configWithEmptyArrays = {
        entities: [],
        layout: { toolsets: [] },
      };

      const result = service.validateConfig(configWithEmptyArrays);

      expect(result.isValid).toBe(true);
      expect(result.warnings.some(warning => warning.includes('No entities configured'))).toBe(
        true
      );
    });

    it('should handle configuration with nested null values', () => {
      const configWithNulls = {
        entities: [{ entity: 'sensor.test', name: null }],
        layout: { toolsets: [] },
      };

      const sanitized = service.sanitizeConfig(configWithNulls);

      expect(sanitized.entities[0].name).toBe('');
    });

    it('should handle very large configuration', () => {
      const largeConfig = {
        entities: Array.from({ length: 100 }, (_, i) => ({
          entity: `sensor.test_${i}`,
          name: `Test ${i}`,
        })),
        layout: {
          toolsets: Array.from({ length: 10 }, (_, i) => ({
            toolset: `toolset_${i}`,
            position: { cx: 50, cy: 50 },
            tools: Array.from({ length: 5 }, (_, j) => ({
              type: 'circle',
              id: `tool_${i}_${j}`,
              position: { cx: 50, cy: 50 },
              entity_index: 0,
            })),
          })),
        },
      };

      const result = service.validateConfig(largeConfig);
      expect(result.isValid).toBe(true);

      const sanitized = service.sanitizeConfig(largeConfig);
      expect(sanitized.entities).toHaveLength(100);
      expect(sanitized.layout.toolsets).toHaveLength(10);
    });
  });
});
