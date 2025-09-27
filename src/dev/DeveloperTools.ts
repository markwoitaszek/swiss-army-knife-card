/*
 * DeveloperTools - Enhanced development experience utilities
 * Provides tools and utilities to improve contributor and maintainer experience
 */

/**
 * Interface for development configuration
 */
export interface DeveloperConfig {
  debug: boolean;
  performance: boolean;
  verbose: boolean;
  showTypeInfo: boolean;
}

/**
 * Interface for type information
 */
export interface TypeInfo {
  toolType: string;
  configInterface: string;
  requiredProps: string[];
  optionalProps: string[];
  examples: Record<string, any>;
}

/**
 * DeveloperTools class providing enhanced development experience
 */
export class DeveloperTools {
  private static config: DeveloperConfig = {
    debug: false,
    performance: false,
    verbose: false,
    showTypeInfo: false,
  };

  /**
   * Configure developer tools
   * @param config - Developer configuration
   */
  static configure(config: Partial<DeveloperConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Enhanced console logging with context
   * @param level - Log level
   * @param context - Context information
   * @param message - Log message
   * @param data - Additional data
   */
  static log(level: 'debug' | 'info' | 'warn' | 'error', context: string, message: string, data?: any): void {
    if (!this.config.debug && level === 'debug') return;
    if (!this.config.verbose && level === 'info') return;

    const timestamp = new Date().toISOString();
    const contextStr = `[SAK:${context}]`;
    const fullMessage = `${timestamp} ${contextStr} ${message}`;

    switch (level) {
      case 'debug':
        console.debug(fullMessage, data);
        break;
      case 'info':
        console.info(fullMessage, data);
        break;
      case 'warn':
        console.warn(fullMessage, data);
        break;
      case 'error':
        console.error(fullMessage, data);
        break;
    }
  }

  /**
   * Get type information for a tool
   * @param toolType - Tool type to analyze
   * @returns Type information and examples
   */
  static getToolTypeInfo(toolType: string): TypeInfo | null {
    const typeInfoMap: Record<string, TypeInfo> = {
      circle: {
        toolType: 'circle',
        configInterface: 'CircleConfig',
        requiredProps: ['type', 'position'],
        optionalProps: ['radius', 'fill', 'stroke', 'stroke_width'],
        examples: {
          basic: { type: 'circle', position: { cx: 50, cy: 50 }, radius: 20 },
          styled: { type: 'circle', position: { cx: 50, cy: 50 }, radius: 20, fill: '#ff0000', stroke: '#000000' },
        },
      },
      rectangle: {
        toolType: 'rectangle',
        configInterface: 'RectangleConfig',
        requiredProps: ['type', 'position'],
        optionalProps: ['width', 'height', 'fill', 'stroke', 'stroke_width', 'rx', 'ry'],
        examples: {
          basic: { type: 'rectangle', position: { cx: 50, cy: 50 }, width: 40, height: 20 },
          rounded: { type: 'rectangle', position: { cx: 50, cy: 50 }, width: 40, height: 20, rx: 5, ry: 5 },
        },
      },
      text: {
        toolType: 'text',
        configInterface: 'TextConfig',
        requiredProps: ['type', 'position'],
        optionalProps: ['text', 'font_size', 'font_weight', 'font_family', 'fill'],
        examples: {
          basic: { type: 'text', position: { cx: 50, cy: 50 }, text: 'Hello World' },
          styled: { type: 'text', position: { cx: 50, cy: 50 }, text: 'Styled Text', font_size: 16, fill: '#ff0000' },
        },
      },
      entity_state: {
        toolType: 'entity_state',
        configInterface: 'EntityStateConfig',
        requiredProps: ['type', 'position', 'entity_index'],
        optionalProps: ['unit', 'decimals', 'font_size', 'fill'],
        examples: {
          basic: { type: 'entity_state', position: { cx: 50, cy: 50 }, entity_index: 0 },
          formatted: { type: 'entity_state', position: { cx: 50, cy: 50 }, entity_index: 0, decimals: 1, unit: '°C' },
        },
      },
    };

    return typeInfoMap[toolType] || null;
  }

  /**
   * Validate tool configuration
   * @param toolType - Tool type
   * @param config - Configuration to validate
   * @returns Validation result with errors and warnings
   */
  static validateToolConfig(toolType: string, config: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const typeInfo = this.getToolTypeInfo(toolType);
    if (!typeInfo) {
      errors.push(`Unknown tool type: ${toolType}`);
      return { isValid: false, errors, warnings, suggestions };
    }

    // Check required properties
    typeInfo.requiredProps.forEach(prop => {
      if (!(prop in config)) {
        errors.push(`Missing required property: ${prop}`);
      }
    });

    // Check for common mistakes
    if (toolType === 'entity_state' && typeof config.entity_index !== 'number') {
      warnings.push('entity_index should be a number');
    }

    if (config.position && (!config.position.cx || !config.position.cy)) {
      warnings.push('Position should include both cx and cy coordinates');
    }

    // Provide suggestions
    if (typeInfo.optionalProps.length > 0) {
      suggestions.push(`Available optional properties: ${typeInfo.optionalProps.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Generate tool documentation
   * @param toolType - Tool type to document
   * @returns Markdown documentation string
   */
  static generateToolDocumentation(toolType: string): string {
    const typeInfo = this.getToolTypeInfo(toolType);
    if (!typeInfo) {
      return `# Unknown Tool: ${toolType}\n\nTool type not found.`;
    }

    let doc = `# ${toolType.charAt(0).toUpperCase() + toolType.slice(1)} Tool\n\n`;
    doc += `**Interface**: \`${typeInfo.configInterface}\`\n\n`;
    
    doc += '## Required Properties\n\n';
    typeInfo.requiredProps.forEach(prop => {
      doc += `- \`${prop}\`\n`;
    });
    
    doc += '\n## Optional Properties\n\n';
    typeInfo.optionalProps.forEach(prop => {
      doc += `- \`${prop}\`\n`;
    });
    
    doc += '\n## Examples\n\n';
    Object.entries(typeInfo.examples).forEach(([name, example]) => {
      doc += `### ${name.charAt(0).toUpperCase() + name.slice(1)} Example\n\n`;
      doc += '```yaml\n';
      doc += JSON.stringify(example, null, 2);
      doc += '\n```\n\n';
    });

    return doc;
  }

  /**
   * Performance debugging helper
   * @param toolType - Tool being debugged
   * @param operation - Operation being performed
   * @param fn - Function to execute and measure
   * @returns Result of function execution
   */
  static debugPerformance<T>(toolType: string, operation: string, fn: () => T): T {
    if (!this.config.performance) {
      return fn();
    }

    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;

    this.log('debug', 'Performance', `${toolType}.${operation}: ${duration.toFixed(2)}ms`);

    if (duration > 16) {
      this.log('warn', 'Performance', `Slow operation: ${toolType}.${operation} took ${duration.toFixed(2)}ms`);
    }

    return result;
  }

  /**
   * Get development statistics
   * @returns Development and usage statistics
   */
  static getDevelopmentStats(): {
    modernToolsCount: number;
    legacyToolsCount: number;
    migrationProgress: number;
    performanceStatus: string;
    recommendedActions: string[];
  } {
    // This would integrate with actual tool registry in real implementation
    const modernToolsCount = 14; // Current count
    const legacyToolsCount = 12; // Remaining legacy tools
    const totalTools = modernToolsCount + legacyToolsCount;
    const migrationProgress = (modernToolsCount / totalTools) * 100;

    const recommendedActions: string[] = [];
    
    if (migrationProgress < 80) {
      recommendedActions.push('Continue tool migration to reach 80% target');
    }
    
    if (migrationProgress > 50) {
      recommendedActions.push('Consider performance optimization for dual implementations');
    }

    return {
      modernToolsCount,
      legacyToolsCount,
      migrationProgress,
      performanceStatus: migrationProgress > 50 ? 'good' : 'needs_improvement',
      recommendedActions,
    };
  }
}
