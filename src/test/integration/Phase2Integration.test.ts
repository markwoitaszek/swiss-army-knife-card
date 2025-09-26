import { beforeEach, describe, expect, it } from 'vitest';

import type { SakConfig } from '../../types/SakTypes.js';
import { toolRegistry } from '../../tools/ToolRegistry.js';
import { ToolsetManager } from '../../toolsets/ToolsetManager.js';
import { ConfigValidator } from '../../config/ConfigValidator.js';
import { LayoutManager } from '../../layout/LayoutManager.js';

describe('Phase 2 Integration Tests', () => {
  let mockHass: any;
  let testConfig: SakConfig;

  beforeEach(() => {
    mockHass = {
      states: {
        'light.living_room': {
          state: 'on',
          attributes: {
            brightness: 128,
            friendly_name: 'Living Room Light',
          },
        },
        'sensor.temperature': {
          state: '22.5',
          attributes: {
            unit_of_measurement: '°C',
            friendly_name: 'Temperature',
          },
        },
      },
      callService: vitest.fn(),
    };

    testConfig = {
      type: 'custom:swiss-army-knife-card',
      entities: ['light.living_room', 'sensor.temperature'],
      layout: {
        aspectratio: '1/1',
        toolsets: [
          {
            position: { cx: 50, cy: 50 },
            tools: [
              {
                type: 'circle',
                position: { cx: 50, cy: 50, radius: 30 },
                entity_index: 0,
              },
              {
                type: 'text',
                position: { cx: 50, cy: 40 },
                text: 'Living Room',
              },
              {
                type: 'entity_state',
                position: { cx: 50, cy: 60 },
                entity_index: 1,
              },
              {
                type: 'switch',
                position: { cx: 50, cy: 80 },
                entity_index: 0,
              },
            ],
          },
        ],
      },
    };
  });

  describe('ToolRegistry Integration', () => {
    it('should support all modern TypeScript tools', () => {
      expect(toolRegistry.isToolSupported('circle')).toBe(true);
      expect(toolRegistry.isToolSupported('rectangle')).toBe(true);
      expect(toolRegistry.isToolSupported('text')).toBe(true);
      expect(toolRegistry.isToolSupported('entity_state')).toBe(true);
      expect(toolRegistry.isToolSupported('switch')).toBe(true);
      expect(toolRegistry.isToolSupported('gauge')).toBe(true);
      expect(toolRegistry.isToolSupported('sparkline_barchart')).toBe(true);
    });

    it('should maintain backward compatibility with legacy tools', () => {
      expect(toolRegistry.isToolSupported('badge')).toBe(true);
      expect(toolRegistry.isToolSupported('ellipse')).toBe(true);
      expect(toolRegistry.isToolSupported('line')).toBe(true);
      expect(toolRegistry.isToolSupported('horseshoe')).toBe(true);
    });

    it('should prioritize modern tools over legacy', () => {
      const migrationStatus = toolRegistry.getMigrationStatus();
      expect(migrationStatus.modern).toContain('circle');
      expect(migrationStatus.modern).toContain('text');
      expect(migrationStatus.modern).toContain('entity_state');
      expect(migrationStatus.modern).toContain('switch');
    });
  });

  describe('Configuration Validation Integration', () => {
    it('should validate complete SAK configuration', () => {
      const validator = new ConfigValidator();
      const result = validator.validate(testConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect configuration errors', () => {
      const invalidConfig = {
        ...testConfig,
        layout: {
          ...testConfig.layout,
          toolsets: [
            {
              position: { cx: 50, cy: 50 },
              tools: [
                {
                  type: 'invalid_tool' as any,
                  position: { cx: 50, cy: 50 },
                },
              ],
            },
          ],
        },
      };

      const validator = new ConfigValidator();
      const result = validator.validate(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'UNSUPPORTED_TOOL_TYPE')).toBe(true);
    });

    it('should provide quick validation', () => {
      expect(ConfigValidator.validateQuick(testConfig)).toBe(true);

      const summary = ConfigValidator.getValidationSummary(testConfig);
      expect(summary).toBe('Configuration is valid ✅');
    });
  });

  describe('Layout System Integration', () => {
    it('should create layout manager from configuration', () => {
      const layoutConfig = {
        type: 'grid' as const,
        columns: 3,
        rows: 3,
        gap: 2,
      };

      const layoutManager = new LayoutManager(layoutConfig);
      expect(layoutManager).toBeInstanceOf(LayoutManager);
    });

    it('should calculate grid positions for tools', () => {
      const layoutConfig = {
        type: 'grid' as const,
        columns: 3,
        rows: 3,
      };

      const layoutManager = new LayoutManager(layoutConfig);
      const item = {
        id: 'test-tool',
        position: { cx: 0, cy: 0 },
        gridArea: { column: 2, row: 2 },
      };

      const position = layoutManager.calculateGridPosition(item);
      expect(position.cx).toBeCloseTo(50, 1); // Center of 3x3 grid
      expect(position.cy).toBeCloseTo(50, 1);
    });

    it('should validate layout constraints', () => {
      const layoutConfig = {
        type: 'grid' as const,
        columns: 2,
        rows: 2,
      };

      const layoutManager = new LayoutManager(layoutConfig);

      // Add item that exceeds grid
      layoutManager.addItem({
        id: 'overflow-item',
        position: { cx: 50, cy: 50 },
        gridArea: { column: 2, row: 2, columnSpan: 2 }, // Would exceed 2 columns
      });

      const validation = layoutManager.validateLayout();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Item overflow-item exceeds grid columns');
    });
  });

  describe('ToolsetManager Integration', () => {
    it('should create toolset manager with configuration', () => {
      const manager = new ToolsetManager();
      manager.initialize(testConfig, mockHass);

      expect(manager).toBeInstanceOf(ToolsetManager);
      expect(manager.getToolsets()).toHaveLength(1);
    });

    it('should handle entity updates', () => {
      const manager = new ToolsetManager();
      manager.initialize(testConfig, mockHass);

      const newEntities = [
        {
          entity_id: 'light.living_room',
          state: 'off',
          attributes: { brightness: 0 },
        },
      ];

      manager.updateEntities(newEntities as any);
      // Should not throw errors
      expect(manager.getToolsets()).toHaveLength(1);
    });
  });

  describe('End-to-End Configuration Flow', () => {
    it('should process complete configuration from validation to rendering', () => {
      // Step 1: Validate configuration
      const validator = new ConfigValidator();
      const validation = validator.validate(testConfig);
      expect(validation.isValid).toBe(true);

      // Step 2: Create layout manager
      const layoutConfig = {
        type: 'grid' as const,
        columns: 3,
        rows: 3,
      };
      const layoutManager = new LayoutManager(layoutConfig);
      expect(layoutManager).toBeInstanceOf(LayoutManager);

      // Step 3: Create toolset manager
      const toolsetManager = new ToolsetManager();
      toolsetManager.initialize(testConfig, mockHass);
      expect(toolsetManager.getToolsets()).toHaveLength(1);

      // Step 4: Verify all tools are supported
      testConfig.layout.toolsets[0].tools.forEach(tool => {
        expect(toolRegistry.isToolSupported(tool.type)).toBe(true);
      });
    });

    it('should handle mixed modern and legacy tool configurations', () => {
      const mixedConfig = {
        ...testConfig,
        layout: {
          ...testConfig.layout,
          toolsets: [
            {
              position: { cx: 50, cy: 50 },
              tools: [
                // Modern tools
                { type: 'circle', position: { cx: 25, cy: 25, radius: 10 } },
                { type: 'rectangle', position: { cx: 75, cy: 25, width: 20, height: 10 } },
                { type: 'gauge', position: { cx: 25, cy: 75, radius: 15 } },
                // Legacy tools
                { type: 'badge', position: { cx: 75, cy: 75 } },
                { type: 'ellipse', position: { cx: 50, cy: 50 } },
              ],
            },
          ],
        },
      };

      const validator = new ConfigValidator();
      const result = validator.validate(mixedConfig);
      expect(result.isValid).toBe(true);

      // All tools should be supported
      mixedConfig.layout.toolsets[0].tools.forEach(tool => {
        expect(toolRegistry.isToolSupported(tool.type)).toBe(true);
      });
    });

    it('should provide comprehensive error reporting for invalid configurations', () => {
      const brokenConfig = {
        // Missing type
        entities: ['invalid-entity-format'],
        layout: {
          toolsets: [
            {
              // Missing position
              tools: [
                {
                  type: 'unknown_tool',
                  // Missing position
                },
              ],
            },
          ],
        },
      } as any;

      const validator = new ConfigValidator();
      const result = validator.validate(brokenConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3);

      // Should have specific error codes
      const errorCodes = result.errors.map(e => e.code);
      expect(errorCodes).toContain('INVALID_TYPE');
      expect(errorCodes).toContain('INVALID_ENTITY_ID');
      expect(errorCodes).toContain('UNSUPPORTED_TOOL_TYPE');
    });
  });

  describe('Performance Integration', () => {
    it('should handle large configurations efficiently', () => {
      const largeConfig = {
        ...testConfig,
        entities: Array.from({ length: 50 }, (_, i) => `sensor.test_${i}`),
        layout: {
          ...testConfig.layout,
          toolsets: Array.from({ length: 10 }, (_, i) => ({
            position: { cx: 50, cy: 50 },
            tools: Array.from({ length: 5 }, (_, j) => ({
              type: 'circle',
              position: { cx: i * 10 + j * 2, cy: 50, radius: 5 },
              entity_index: (i * 5 + j) % 50,
            })),
          })),
        },
      };

      const start = performance.now();
      const validator = new ConfigValidator();
      const result = validator.validate(largeConfig);
      const end = performance.now();

      // Should validate quickly (under 100ms for large config)
      expect(end - start).toBeLessThan(100);
      expect(result.isValid).toBe(true);
    });
  });
});
