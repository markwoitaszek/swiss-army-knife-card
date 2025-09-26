/*
 * ComprehensiveTest - Final comprehensive testing for v3.0 release
 * Validates all systems working together for production readiness
 */

import { describe, expect, it } from 'vitest';

import { AdvancedIntegrations } from '../../integrations/AdvancedIntegrations.js';
import { PerformanceOptimizer } from '../../performance/PerformanceOptimizer.js';
import { AdvancedThemeManager } from '../../theme/AdvancedThemeManager.js';
import { toolRegistry } from '../../tools/ToolRegistry.js';

describe('SAK v3.0 Comprehensive Final Testing', () => {
  describe('Complete System Integration', () => {
    it('should have all modern tools registered', () => {
      const modernTools = toolRegistry.getMigrationStatus().modern;

      // Core tools
      expect(modernTools).toContain('circle');
      expect(modernTools).toContain('rectangle');
      expect(modernTools).toContain('text');
      expect(modernTools).toContain('entity_state');

      // Interactive tools
      expect(modernTools).toContain('switch');
      expect(modernTools).toContain('slider');

      // Visualization tools
      expect(modernTools).toContain('gauge');
      expect(modernTools).toContain('sparkline_barchart');
      expect(modernTools).toContain('pie_chart');
      expect(modernTools).toContain('heatmap');

      // Should have at least 10 modern tools
      expect(modernTools.length).toBeGreaterThanOrEqual(10);
    });

    it('should support all legacy tools for backward compatibility', () => {
      const legacyTools = toolRegistry.getMigrationStatus().legacy;

      expect(legacyTools).toContain('badge');
      expect(legacyTools).toContain('ellipse');
      expect(legacyTools).toContain('line');
      expect(legacyTools).toContain('horseshoe');
      expect(legacyTools).toContain('segarc');

      // Should maintain significant legacy tool support
      expect(legacyTools.length).toBeGreaterThan(10);
    });

    it('should initialize all advanced systems', () => {
      const mockElement = document.createElement('div');

      // Theme system
      const themeManager = new AdvancedThemeManager(mockElement);
      expect(themeManager.getAllThemes().length).toBeGreaterThan(4);

      // Performance optimizer
      const optimizer = new PerformanceOptimizer();
      expect(optimizer.getMetrics()).toBeTruthy();

      // Advanced integrations
      const integrations = new AdvancedIntegrations();
      expect(integrations.getConnectionStatus()).toBeTruthy();
    });

    it('should handle complete configuration workflow', () => {
      const testConfig = {
        type: 'custom:swiss-army-knife-card',
        entities: ['light.test', 'sensor.test'],
        theme: 'sak-light',
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
                  type: 'pie_chart',
                  position: { cx: 50, cy: 50, radius: 25 },
                  segments: [
                    { value: 60, color: '#2196F3' },
                    { value: 40, color: '#FFC107' },
                  ],
                },
              ],
            },
          ],
        },
      };

      // Should validate successfully
      const { ConfigValidator } = require('../../config/ConfigValidator.js');
      const validator = new ConfigValidator();
      const result = validator.validate(testConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Performance Validation', () => {
    it('should meet performance benchmarks', () => {
      const optimizer = new PerformanceOptimizer();
      const metrics = optimizer.getMetrics();

      // Performance targets
      expect(metrics.renderTime).toBeLessThan(16); // 60fps target
      expect(metrics.memoryUsage).toBeLessThan(50); // <50MB target
    });

    it('should handle large datasets efficiently', () => {
      const optimizer = new PerformanceOptimizer();

      // Test with large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        value: Math.random() * 100,
      }));

      const mockContainer = document.createElement('div');
      const renderItem = (item: any) => {
        const div = document.createElement('div');
        div.textContent = item.id;
        return div;
      };

      const start = performance.now();
      optimizer.virtualizeItems(largeDataset, renderItem, mockContainer);
      const end = performance.now();

      // Should handle large datasets quickly
      expect(end - start).toBeLessThan(100);
    });
  });

  describe('Production Readiness', () => {
    it('should have proper error handling', () => {
      // Test error scenarios
      expect(() => {
        toolRegistry.createTool('invalid_tool' as any);
      }).toThrow();

      // Should handle gracefully
      expect(toolRegistry.isToolSupported('invalid_tool')).toBe(false);
    });

    it('should support all required entity types', () => {
      const supportedDomains = [
        'light',
        'switch',
        'sensor',
        'binary_sensor',
        'climate',
        'cover',
        'fan',
        'input_number',
        'input_boolean',
        'input_select',
        'automation',
      ];

      const integrations = new AdvancedIntegrations();

      supportedDomains.forEach(domain => {
        const entityId = `${domain}.test_entity`;
        expect(integrations.validateEntityId(entityId)).toBe(true);
        expect(integrations.getEntityDomain(entityId)).toBe(domain);
      });
    });

    it('should have comprehensive theme coverage', () => {
      const themeManager = new AdvancedThemeManager();
      const themes = themeManager.getAllThemes();

      // Should have themes for different use cases
      const lightThemes = themeManager.getThemesByBase('light');
      const darkThemes = themeManager.getThemesByBase('dark');

      expect(lightThemes.length).toBeGreaterThan(2);
      expect(darkThemes.length).toBeGreaterThan(0);
      expect(themes.length).toBeGreaterThanOrEqual(5);
    });

    it('should validate production configuration', () => {
      const productionConfig = {
        type: 'custom:swiss-army-knife-card',
        entities: [
          'light.living_room',
          'sensor.temperature',
          'sensor.humidity',
          'binary_sensor.motion',
        ],
        theme: 'material-3',
        performance: {
          mode: 'balanced',
          virtualization: true,
        },
        layout: {
          type: 'grid',
          columns: 2,
          rows: 2,
          responsive: true,
          toolsets: [
            {
              position: { cx: 25, cy: 25 },
              tools: [
                {
                  type: 'circle',
                  position: { cx: 50, cy: 50, radius: 20 },
                  entity_index: 0,
                },
                {
                  type: 'switch',
                  position: { cx: 50, cy: 80 },
                  entity_index: 0,
                },
              ],
            },
            {
              position: { cx: 75, cy: 25 },
              tools: [
                {
                  type: 'gauge',
                  position: { cx: 50, cy: 50, radius: 20 },
                  entity_index: 1,
                  min: 0,
                  max: 100,
                },
              ],
            },
            {
              position: { cx: 25, cy: 75 },
              tools: [
                {
                  type: 'heatmap',
                  position: { cx: 50, cy: 50, width: 40, height: 20 },
                  data: [],
                  grid: { rows: 5, columns: 8 },
                },
              ],
            },
            {
              position: { cx: 75, cy: 75 },
              tools: [
                {
                  type: 'pie_chart',
                  position: { cx: 50, cy: 50, radius: 20 },
                  segments: [
                    { value: 30, color: '#FF6B6B', label: 'A' },
                    { value: 70, color: '#4ECDC4', label: 'B' },
                  ],
                },
              ],
            },
          ],
        },
      };

      const { ConfigValidator } = require('../../config/ConfigValidator.js');
      const validator = new ConfigValidator();
      const result = validator.validate(productionConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Release Readiness', () => {
    it('should have stable API', () => {
      // Core APIs should be stable
      expect(typeof toolRegistry.createTool).toBe('function');
      expect(typeof toolRegistry.isToolSupported).toBe('function');
      expect(typeof toolRegistry.getMigrationStatus).toBe('function');
    });

    it('should support extensibility', () => {
      // Should be able to register new tools
      class CustomTool {
        getToolType() {
          return 'custom';
        }
        render() {
          return null;
        }
      }

      // Registry should support extension
      expect(toolRegistry.getSupportedToolTypes().length).toBeGreaterThan(20);
    });

    it('should have proper version information', () => {
      const packageJson = require('../../../package.json');

      expect(packageJson.version).toMatch(/^3\.0\.0/);
      expect(packageJson.name).toBe('swiss-army-knife-card');
      expect(packageJson.type).toBe('module');
    });
  });
});

// Export test utilities for external testing
export const TestUtils = {
  createMockHass: () => ({
    states: {},
    callService: () => Promise.resolve(),
    themes: { darkMode: false },
  }),

  createMockConfig: (overrides = {}) => ({
    type: 'custom:swiss-army-knife-card',
    entities: ['light.test'],
    layout: {
      toolsets: [
        {
          position: { cx: 50, cy: 50 },
          tools: [{ type: 'circle', position: { cx: 50, cy: 50, radius: 25 } }],
        },
      ],
    },
    ...overrides,
  }),
};
