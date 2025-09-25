/*
 * ConfigService - Manages configuration validation and processing
 * Handles config validation, sanitization, and merging
 */

import type { SakConfig, ValidationResult } from '../types/SakTypes.js';

export class ConfigService {
  private config: SakConfig | null = null;

  constructor() {
    // Initialize service
  }

  // Public API
  validateConfig(config: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic structure validation
    if (!config) {
      errors.push('Configuration is required');
      return { isValid: false, errors, warnings };
    }

    if (typeof config !== 'object') {
      errors.push('Configuration must be an object');
      return { isValid: false, errors, warnings };
    }

    // Layout validation
    if (!config.layout) {
      errors.push('Layout configuration is required');
    } else {
      this.validateLayout(config.layout, errors, warnings);
    }

    // Entities validation
    if (!config.entities || !Array.isArray(config.entities)) {
      errors.push('Entities configuration is required and must be an array');
    } else {
      this.validateEntities(config.entities, errors, warnings);
    }

    // Optional validations
    if (config.aspectratio && typeof config.aspectratio !== 'string') {
      warnings.push('Aspect ratio should be a string (e.g., "1/1")');
    }

    if (config.theme && typeof config.theme !== 'string') {
      warnings.push('Theme should be a string');
    }

    if (config.styles && typeof config.styles !== 'object') {
      warnings.push('Styles should be an object');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  sanitizeConfig(config: any): SakConfig {
    // Deep clone to avoid modifying original
    const sanitized = JSON.parse(JSON.stringify(config));

    // Ensure required properties exist
    if (!sanitized.entities) {
      sanitized.entities = [];
    }

    if (!sanitized.layout) {
      sanitized.layout = { toolsets: [] };
    }

    // Sanitize entities
    sanitized.entities = sanitized.entities.map((entity: any) => this.sanitizeEntity(entity));

    // Sanitize layout
    sanitized.layout = this.sanitizeLayout(sanitized.layout);

    // Set defaults
    sanitized.aspectratio = sanitized.aspectratio || '1/1';
    sanitized.dev = sanitized.dev || {};

    this.config = sanitized;
    return sanitized;
  }

  mergeConfigs(base: SakConfig, override: Partial<SakConfig>): SakConfig {
    return this.deepMerge(base, override);
  }

  getConfig(): SakConfig | null {
    return this.config;
  }

  // Private validation methods
  private validateLayout(layout: any, errors: string[], warnings: string[]): void {
    if (!layout.toolsets || !Array.isArray(layout.toolsets)) {
      errors.push('Layout must contain a toolsets array');
      return;
    }

    layout.toolsets.forEach((toolset: any, index: number) => {
      this.validateToolset(toolset, index, errors, warnings);
    });
  }

  private validateToolset(toolset: any, index: number, errors: string[], warnings: string[]): void {
    if (!toolset.toolset || typeof toolset.toolset !== 'string') {
      errors.push(`Toolset ${index}: toolset name is required`);
    }

    if (!toolset.position || typeof toolset.position !== 'object') {
      errors.push(`Toolset ${index}: position is required`);
    } else {
      this.validatePosition(toolset.position, `Toolset ${index}`, errors, warnings);
    }

    if (!toolset.tools || !Array.isArray(toolset.tools)) {
      errors.push(`Toolset ${index}: tools array is required`);
    } else {
      toolset.tools.forEach((tool: any, toolIndex: number) => {
        this.validateTool(tool, `${index}.${toolIndex}`, errors, warnings);
      });
    }
  }

  private validatePosition(position: any, context: string, errors: string[], warnings: string[]): void {
    if (typeof position.cx !== 'number' || typeof position.cy !== 'number') {
      errors.push(`${context}: position must have numeric cx and cy values`);
    }

    if (position.cx < 0 || position.cx > 100) {
      warnings.push(`${context}: cx should be between 0 and 100`);
    }

    if (position.cy < 0 || position.cy > 100) {
      warnings.push(`${context}: cy should be between 0 and 100`);
    }
  }

  private validateTool(tool: any, context: string, errors: string[], warnings: string[]): void {
    if (!tool.type || typeof tool.type !== 'string') {
      errors.push(`Tool ${context}: type is required`);
    }

    if (!tool.id || typeof tool.id !== 'string') {
      errors.push(`Tool ${context}: id is required`);
    }

    if (!tool.position || typeof tool.position !== 'object') {
      errors.push(`Tool ${context}: position is required`);
    } else {
      this.validatePosition(tool.position, `Tool ${context}`, errors, warnings);
    }

    if (typeof tool.entity_index !== 'number' || tool.entity_index < 0) {
      errors.push(`Tool ${context}: entity_index must be a non-negative number`);
    }
  }

  private validateEntities(entities: any[], errors: string[], warnings: string[]): void {
    if (entities.length === 0) {
      warnings.push('No entities configured');
      return;
    }

    entities.forEach((entity: any, index: number) => {
      this.validateEntity(entity, index, errors, warnings);
    });
  }

  private validateEntity(entity: any, index: number, errors: string[], warnings: string[]): void {
    if (!entity.entity || typeof entity.entity !== 'string') {
      errors.push(`Entity ${index}: entity ID is required`);
    }

    if (entity.name && typeof entity.name !== 'string') {
      warnings.push(`Entity ${index}: name should be a string`);
    }

    if (entity.icon && typeof entity.icon !== 'string') {
      warnings.push(`Entity ${index}: icon should be a string`);
    }

    if (entity.unit && typeof entity.unit !== 'string') {
      warnings.push(`Entity ${index}: unit should be a string`);
    }

    if (entity.attribute && typeof entity.attribute !== 'string') {
      warnings.push(`Entity ${index}: attribute should be a string`);
    }

    if (entity.secondary_info && typeof entity.secondary_info !== 'string') {
      warnings.push(`Entity ${index}: secondary_info should be a string`);
    }
  }

  // Private sanitization methods
  private sanitizeEntity(entity: any): any {
    return {
      entity: entity.entity || '',
      name: entity.name || '',
      icon: entity.icon || '',
      unit: entity.unit || '',
      attribute: entity.attribute || '',
      secondary_info: entity.secondary_info || ''
    };
  }

  private sanitizeLayout(layout: any): any {
    return {
      aspectratio: layout.aspectratio || '1/1',
      styles: layout.styles || {},
      toolsets: (layout.toolsets || []).map((toolset: any) => this.sanitizeToolset(toolset))
    };
  }

  private sanitizeToolset(toolset: any): any {
    return {
      toolset: toolset.toolset || '',
      position: this.sanitizePosition(toolset.position),
      scale: toolset.scale ? this.sanitizeScale(toolset.scale) : undefined,
      rotation: toolset.rotation ? this.sanitizeRotation(toolset.rotation) : undefined,
      tools: (toolset.tools || []).map((tool: any) => this.sanitizeTool(tool))
    };
  }

  private sanitizePosition(position: any): any {
    return {
      cx: typeof position.cx === 'number' ? position.cx : 50,
      cy: typeof position.cy === 'number' ? position.cy : 50,
      x: position.x,
      y: position.y
    };
  }

  private sanitizeScale(scale: any): any {
    return {
      x: typeof scale.x === 'number' ? scale.x : 1,
      y: typeof scale.y === 'number' ? scale.y : 1
    };
  }

  private sanitizeRotation(rotation: any): any {
    return {
      angle: typeof rotation.angle === 'number' ? rotation.angle : 0,
      cx: rotation.cx,
      cy: rotation.cy
    };
  }

  private sanitizeTool(tool: any): any {
    return {
      type: tool.type || 'circle',
      id: tool.id || '',
      position: this.sanitizePosition(tool.position),
      entity_index: typeof tool.entity_index === 'number' ? tool.entity_index : 0,
      color: tool.color || '#000000',
      size: typeof tool.size === 'number' ? tool.size : 10,
      width: tool.width,
      height: tool.height,
      radius: tool.radius,
      stroke_width: tool.stroke_width,
      opacity: tool.opacity,
      animation: tool.animation,
      tap_action: tool.tap_action,
      hold_action: tool.hold_action,
      double_tap_action: tool.double_tap_action
    };
  }

  // Utility methods
  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }
}
