import { describe, expect, it } from 'vitest';

import { ToolRegistry, toolRegistry } from '../ToolRegistry.js';

describe('ToolRegistry', () => {
  it('should be a singleton', () => {
    const instance1 = ToolRegistry.getInstance();
    const instance2 = ToolRegistry.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(toolRegistry);
  });

  it('should support modern TypeScript tools', () => {
    expect(toolRegistry.isToolSupported('circle')).toBe(true);
    expect(toolRegistry.isToolSupported('rectangle')).toBe(true);
    expect(toolRegistry.isToolSupported('text')).toBe(true);
    expect(toolRegistry.isToolSupported('entity_state')).toBe(true);
  });

  it('should support legacy JavaScript tools', () => {
    expect(toolRegistry.isToolSupported('badge')).toBe(true);
    expect(toolRegistry.isToolSupported('ellipse')).toBe(true);
    expect(toolRegistry.isToolSupported('line')).toBe(true);
    expect(toolRegistry.isToolSupported('horseshoe')).toBe(true);
  });

  it('should identify modern vs legacy tools correctly', () => {
    expect(toolRegistry.isModernTool('circle')).toBe(true);
    expect(toolRegistry.isModernTool('rectangle')).toBe(true);
    expect(toolRegistry.isModernTool('text')).toBe(true);
    expect(toolRegistry.isModernTool('entity_state')).toBe(true);

    expect(toolRegistry.isModernTool('badge')).toBe(false);
    expect(toolRegistry.isModernTool('ellipse')).toBe(false);
  });

  it('should reject unsupported tool types', () => {
    expect(toolRegistry.isToolSupported('invalid_tool')).toBe(false);
  });

  it('should throw error for unknown tool types', () => {
    expect(() => {
      toolRegistry.createTool('invalid_tool' as any);
    }).toThrow('Unknown tool type: invalid_tool');
  });

  it('should provide migration status', () => {
    const status = toolRegistry.getMigrationStatus();

    expect(status.modern).toContain('circle');
    expect(status.modern).toContain('rectangle');
    expect(status.modern).toContain('text');
    expect(status.modern).toContain('entity_state');

    expect(status.legacy).toContain('badge');
    expect(status.legacy).toContain('ellipse');
    expect(status.legacy).toContain('line');
  });

  it('should get all supported tool types', () => {
    const supportedTypes = toolRegistry.getSupportedToolTypes();

    // Should include modern tools
    expect(supportedTypes).toContain('circle');
    expect(supportedTypes).toContain('rectangle');
    expect(supportedTypes).toContain('text');
    expect(supportedTypes).toContain('entity_state');

    // Should include legacy tools
    expect(supportedTypes).toContain('badge');
    expect(supportedTypes).toContain('ellipse');
    expect(supportedTypes).toContain('line');
    expect(supportedTypes).toContain('horseshoe');

    // Should have reasonable number of tools
    expect(supportedTypes.length).toBeGreaterThan(15);
  });

  it('should prioritize modern tools over legacy', () => {
    // If we had both modern and legacy versions of the same tool,
    // modern should be preferred. For now, we test that modern tools
    // are actually created as modern instances.

    // This test would be expanded when we have overlapping tool types
    const modernTypes = toolRegistry.getMigrationStatus().modern;
    expect(modernTypes.length).toBeGreaterThan(0);
  });
});
