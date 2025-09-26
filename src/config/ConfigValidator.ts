/*
 * ConfigValidator - Configuration validation and management system
 * Provides comprehensive validation for SAK card configurations
 */

import type { SakConfig, ToolConfig, ToolsetConfig } from '../types/SakTypes.js';
import { toolRegistry } from '../tools/ToolRegistry.js';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  code: string;
  severity: 'error';
}

export interface ValidationWarning {
  path: string;
  message: string;
  code: string;
  severity: 'warning';
}

export type ValidationIssue = ValidationError | ValidationWarning;

export class ConfigValidator {
  private errors: ValidationError[] = [];
  private warnings: ValidationWarning[] = [];

  validate(config: SakConfig): ValidationResult {
    this.errors = [];
    this.warnings = [];

    // Validate top-level configuration
    this.validateTopLevel(config);

    // Validate entities
    this.validateEntities(config);

    // Validate layout
    this.validateLayout(config);

    // Validate toolsets
    this.validateToolsets(config);

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  private validateTopLevel(config: SakConfig): void {
    if (!config) {
      this.addError('', 'Configuration is required', 'CONFIG_REQUIRED');
      return;
    }

    if (!config.type || config.type !== 'custom:swiss-army-knife-card') {
      this.addError('type', 'Invalid card type', 'INVALID_TYPE');
    }

    if (!config.entities || !Array.isArray(config.entities)) {
      this.addError('entities', 'Entities array is required', 'ENTITIES_REQUIRED');
    }

    if (!config.layout) {
      this.addError('layout', 'Layout configuration is required', 'LAYOUT_REQUIRED');
    }
  }

  private validateEntities(config: SakConfig): void {
    if (!config.entities) return;

    config.entities.forEach((entity, index) => {
      const path = `entities[${index}]`;

      if (typeof entity === 'string') {
        if (!this.isValidEntityId(entity)) {
          this.addError(`${path}`, 'Invalid entity ID format', 'INVALID_ENTITY_ID');
        }
      } else if (typeof entity === 'object') {
        if (!entity.entity) {
          this.addError(`${path}.entity`, 'Entity ID is required', 'ENTITY_ID_REQUIRED');
        } else if (!this.isValidEntityId(entity.entity)) {
          this.addError(`${path}.entity`, 'Invalid entity ID format', 'INVALID_ENTITY_ID');
        }
      } else {
        this.addError(`${path}`, 'Entity must be string or object', 'INVALID_ENTITY_FORMAT');
      }
    });
  }

  private validateLayout(config: SakConfig): void {
    if (!config.layout) return;

    const layout = config.layout;

    // Validate aspect ratio
    if (layout.aspectratio && !this.isValidAspectRatio(layout.aspectratio)) {
      this.addWarning('layout.aspectratio', 'Invalid aspect ratio format', 'INVALID_ASPECT_RATIO');
    }

    // Validate toolsets
    if (!layout.toolsets || !Array.isArray(layout.toolsets)) {
      this.addError('layout.toolsets', 'Toolsets array is required', 'TOOLSETS_REQUIRED');
    }
  }

  private validateToolsets(config: SakConfig): void {
    if (!config.layout?.toolsets) return;

    config.layout.toolsets.forEach((toolset, index) => {
      const path = `layout.toolsets[${index}]`;
      this.validateToolset(toolset, path);
    });
  }

  private validateToolset(toolset: ToolsetConfig, path: string): void {
    if (!toolset.position) {
      this.addError(`${path}.position`, 'Toolset position is required', 'POSITION_REQUIRED');
    } else {
      this.validatePosition(toolset.position, `${path}.position`);
    }

    if (!toolset.tools || !Array.isArray(toolset.tools)) {
      this.addError(`${path}.tools`, 'Tools array is required', 'TOOLS_REQUIRED');
      return;
    }

    toolset.tools.forEach((tool, toolIndex) => {
      const toolPath = `${path}.tools[${toolIndex}]`;
      this.validateTool(tool, toolPath);
    });
  }

  private validateTool(tool: ToolConfig, path: string): void {
    if (!tool.type) {
      this.addError(`${path}.type`, 'Tool type is required', 'TOOL_TYPE_REQUIRED');
      return;
    }

    if (!toolRegistry.isToolSupported(tool.type)) {
      this.addError(`${path}.type`, `Unsupported tool type: ${tool.type}`, 'UNSUPPORTED_TOOL_TYPE');
    }

    if (!tool.position) {
      this.addError(`${path}.position`, 'Tool position is required', 'TOOL_POSITION_REQUIRED');
    } else {
      this.validatePosition(tool.position, `${path}.position`);
    }

    // Validate tool-specific configuration
    this.validateToolSpecificConfig(tool, path);
  }

  private validatePosition(position: any, path: string): void {
    if (typeof position !== 'object') {
      this.addError(path, 'Position must be an object', 'INVALID_POSITION_TYPE');
      return;
    }

    if (typeof position.cx !== 'number' || position.cx < 0 || position.cx > 100) {
      this.addError(`${path}.cx`, 'cx must be a number between 0 and 100', 'INVALID_CX');
    }

    if (typeof position.cy !== 'number' || position.cy < 0 || position.cy > 100) {
      this.addError(`${path}.cy`, 'cy must be a number between 0 and 100', 'INVALID_CY');
    }
  }

  private validateToolSpecificConfig(tool: ToolConfig, path: string): void {
    switch (tool.type) {
      case 'circle':
        if (tool.position && typeof (tool.position as any).radius !== 'number') {
          this.addError(
            `${path}.position.radius`,
            'Circle radius is required',
            'CIRCLE_RADIUS_REQUIRED'
          );
        }
        break;

      case 'rectangle':
        const rectPos = tool.position as any;
        if (!rectPos.width || typeof rectPos.width !== 'number') {
          this.addError(
            `${path}.position.width`,
            'Rectangle width is required',
            'RECTANGLE_WIDTH_REQUIRED'
          );
        }
        if (!rectPos.height || typeof rectPos.height !== 'number') {
          this.addError(
            `${path}.position.height`,
            'Rectangle height is required',
            'RECTANGLE_HEIGHT_REQUIRED'
          );
        }
        break;

      case 'text':
        if (!(tool as any).text) {
          this.addWarning(
            `${path}.text`,
            'Text content is recommended',
            'TEXT_CONTENT_RECOMMENDED'
          );
        }
        break;

      case 'entity_state':
        if (tool.entity_index === undefined) {
          this.addError(
            `${path}.entity_index`,
            'Entity index is required for entity tools',
            'ENTITY_INDEX_REQUIRED'
          );
        }
        break;

      case 'switch':
      case 'slider':
        if (tool.entity_index === undefined) {
          this.addError(
            `${path}.entity_index`,
            'Entity index is required for interactive tools',
            'ENTITY_INDEX_REQUIRED'
          );
        }
        break;
    }
  }

  private isValidEntityId(entityId: string): boolean {
    // Entity ID format: domain.entity_name
    const pattern = /^[a-z_]+\.[a-z0-9_]+$/;
    return pattern.test(entityId);
  }

  private isValidAspectRatio(aspectRatio: string): boolean {
    // Aspect ratio format: number/number or number:number
    const pattern = /^\d+(\.\d+)?[/:]\d+(\.\d+)?$/;
    return pattern.test(aspectRatio);
  }

  private addError(path: string, message: string, code: string): void {
    this.errors.push({
      path,
      message,
      code,
      severity: 'error',
    });
  }

  private addWarning(path: string, message: string, code: string): void {
    this.warnings.push({
      path,
      message,
      code,
      severity: 'warning',
    });
  }

  // Static validation methods for quick checks
  static validateQuick(config: SakConfig): boolean {
    const validator = new ConfigValidator();
    const result = validator.validate(config);
    return result.isValid;
  }

  static getValidationSummary(config: SakConfig): string {
    const validator = new ConfigValidator();
    const result = validator.validate(config);

    if (result.isValid) {
      return 'Configuration is valid ✅';
    }

    const summary = [
      `❌ ${result.errors.length} error(s)`,
      result.warnings.length > 0 ? `⚠️ ${result.warnings.length} warning(s)` : null,
    ]
      .filter(Boolean)
      .join(', ');

    return `Configuration issues: ${summary}`;
  }
}

// Export for easy use
export default ConfigValidator;
