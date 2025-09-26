import { describe, expect, it } from 'vitest';

import type { SakConfig } from '../../types/SakTypes.js';
import { ConfigValidator } from '../ConfigValidator.js';

describe('ConfigValidator', () => {
  it('should validate a complete valid configuration', () => {
    const validConfig: SakConfig = {
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
                position: { cx: 50, cy: 50, radius: 25 },
              },
              {
                type: 'text',
                position: { cx: 50, cy: 50 },
                text: 'Hello',
              },
            ],
          },
        ],
      },
    };

    const validator = new ConfigValidator();
    const result = validator.validate(validConfig);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect missing required fields', () => {
    const invalidConfig = {} as SakConfig;

    const validator = new ConfigValidator();
    const result = validator.validate(invalidConfig);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_TYPE')).toBe(true);
    expect(result.errors.some(e => e.code === 'ENTITIES_REQUIRED')).toBe(true);
    expect(result.errors.some(e => e.code === 'LAYOUT_REQUIRED')).toBe(true);
  });

  it('should validate entity ID formats', () => {
    const configWithInvalidEntities: SakConfig = {
      type: 'custom:swiss-army-knife-card',
      entities: ['invalid-entity', 'light.valid_entity', 'INVALID.CAPS'],
      layout: {
        toolsets: [
          {
            position: { cx: 50, cy: 50 },
            tools: [],
          },
        ],
      },
    };

    const validator = new ConfigValidator();
    const result = validator.validate(configWithInvalidEntities);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_ENTITY_ID')).toBe(true);
  });

  it('should validate tool types', () => {
    const configWithInvalidTool: SakConfig = {
      type: 'custom:swiss-army-knife-card',
      entities: ['light.test'],
      layout: {
        toolsets: [
          {
            position: { cx: 50, cy: 50 },
            tools: [
              {
                type: 'invalid_tool_type' as any,
                position: { cx: 50, cy: 50 },
              },
            ],
          },
        ],
      },
    };

    const validator = new ConfigValidator();
    const result = validator.validate(configWithInvalidTool);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'UNSUPPORTED_TOOL_TYPE')).toBe(true);
  });

  it('should validate tool positions', () => {
    const configWithInvalidPosition: SakConfig = {
      type: 'custom:swiss-army-knife-card',
      entities: ['light.test'],
      layout: {
        toolsets: [
          {
            position: { cx: 50, cy: 50 },
            tools: [
              {
                type: 'circle',
                position: { cx: 150, cy: -50 } as any, // Invalid coordinates
              },
            ],
          },
        ],
      },
    };

    const validator = new ConfigValidator();
    const result = validator.validate(configWithInvalidPosition);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_CX')).toBe(true);
    expect(result.errors.some(e => e.code === 'INVALID_CY')).toBe(true);
  });

  it('should validate circle-specific configuration', () => {
    const configWithInvalidCircle: SakConfig = {
      type: 'custom:swiss-army-knife-card',
      entities: ['light.test'],
      layout: {
        toolsets: [
          {
            position: { cx: 50, cy: 50 },
            tools: [
              {
                type: 'circle',
                position: { cx: 50, cy: 50 }, // Missing radius
              },
            ],
          },
        ],
      },
    };

    const validator = new ConfigValidator();
    const result = validator.validate(configWithInvalidCircle);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'CIRCLE_RADIUS_REQUIRED')).toBe(true);
  });

  it('should validate rectangle-specific configuration', () => {
    const configWithInvalidRectangle: SakConfig = {
      type: 'custom:swiss-army-knife-card',
      entities: ['light.test'],
      layout: {
        toolsets: [
          {
            position: { cx: 50, cy: 50 },
            tools: [
              {
                type: 'rectangle',
                position: { cx: 50, cy: 50 }, // Missing width and height
              },
            ],
          },
        ],
      },
    };

    const validator = new ConfigValidator();
    const result = validator.validate(configWithInvalidRectangle);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'RECTANGLE_WIDTH_REQUIRED')).toBe(true);
    expect(result.errors.some(e => e.code === 'RECTANGLE_HEIGHT_REQUIRED')).toBe(true);
  });

  it('should validate entity tool requirements', () => {
    const configWithoutEntityIndex: SakConfig = {
      type: 'custom:swiss-army-knife-card',
      entities: ['light.test'],
      layout: {
        toolsets: [
          {
            position: { cx: 50, cy: 50 },
            tools: [
              {
                type: 'entity_state',
                position: { cx: 50, cy: 50 },
                // Missing entity_index
              },
            ],
          },
        ],
      },
    };

    const validator = new ConfigValidator();
    const result = validator.validate(configWithoutEntityIndex);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.code === 'ENTITY_INDEX_REQUIRED')).toBe(true);
  });

  it('should provide warnings for missing recommended fields', () => {
    const configWithMissingText: SakConfig = {
      type: 'custom:swiss-army-knife-card',
      entities: ['light.test'],
      layout: {
        toolsets: [
          {
            position: { cx: 50, cy: 50 },
            tools: [
              {
                type: 'text',
                position: { cx: 50, cy: 50 },
                // Missing text content
              },
            ],
          },
        ],
      },
    };

    const validator = new ConfigValidator();
    const result = validator.validate(configWithMissingText);

    expect(result.isValid).toBe(true); // Should be valid but with warnings
    expect(result.warnings.some(w => w.code === 'TEXT_CONTENT_RECOMMENDED')).toBe(true);
  });

  it('should use static validation methods', () => {
    const validConfig: SakConfig = {
      type: 'custom:swiss-army-knife-card',
      entities: ['light.test'],
      layout: {
        toolsets: [
          {
            position: { cx: 50, cy: 50 },
            tools: [
              {
                type: 'circle',
                position: { cx: 50, cy: 50, radius: 25 },
              },
            ],
          },
        ],
      },
    };

    expect(ConfigValidator.validateQuick(validConfig)).toBe(true);
    expect(ConfigValidator.getValidationSummary(validConfig)).toBe('Configuration is valid ✅');
  });

  it('should provide detailed error summary', () => {
    const invalidConfig = {} as SakConfig;
    const summary = ConfigValidator.getValidationSummary(invalidConfig);

    expect(summary).toContain('Configuration issues');
    expect(summary).toContain('error(s)');
  });

  it('should validate aspect ratio formats', () => {
    const validator = new ConfigValidator();

    // Valid aspect ratios
    expect((validator as any).isValidAspectRatio('16/9')).toBe(true);
    expect((validator as any).isValidAspectRatio('4:3')).toBe(true);
    expect((validator as any).isValidAspectRatio('1.5/1')).toBe(true);

    // Invalid aspect ratios
    expect((validator as any).isValidAspectRatio('16x9')).toBe(false);
    expect((validator as any).isValidAspectRatio('invalid')).toBe(false);
    expect((validator as any).isValidAspectRatio('')).toBe(false);
  });

  it('should validate entity ID formats correctly', () => {
    const validator = new ConfigValidator();

    // Valid entity IDs
    expect((validator as any).isValidEntityId('light.living_room')).toBe(true);
    expect((validator as any).isValidEntityId('sensor.temperature_01')).toBe(true);
    expect((validator as any).isValidEntityId('switch.bedroom_fan')).toBe(true);

    // Invalid entity IDs
    expect((validator as any).isValidEntityId('invalid-format')).toBe(false);
    expect((validator as any).isValidEntityId('CAPS.not_allowed')).toBe(false);
    expect((validator as any).isValidEntityId('spaces not allowed.entity')).toBe(false);
    expect((validator as any).isValidEntityId('')).toBe(false);
  });
});
