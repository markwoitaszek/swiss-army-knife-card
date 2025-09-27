/*
 * TemplateUtils - Template processing and JavaScript evaluation utilities
 * Modern TypeScript implementation of SAK template system
 */

/**
 * Interface for template configuration
 */
export interface TemplateConfig {
  template: {
    type: string;
    defaults?: Record<string, any>[];
  };
  [key: string]: any;
}

/**
 * Interface for tool configuration (for template evaluation context)
 */
export interface ToolConfig {
  entity_index?: number;
  [key: string]: any;
}

/**
 * Interface for entity configuration
 */
export interface EntityConfig {
  [key: string]: any;
}

/**
 * Interface for card context (for template evaluation)
 */
export interface CardContext {
  _hass: {
    states: Record<string, any>;
    user: any;
    [key: string]: any;
  };
  entities: any[];
  config: {
    entities: EntityConfig[];
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * TemplateUtils class providing template processing and JavaScript evaluation
 * for the Swiss Army Knife Card
 */
export default class TemplateUtils {
  /**
   * Replace variables in template with provided values
   * Processes template variables and merges with defaults
   *
   * @param argVariables - Array of variable objects to replace
   * @param argTemplate - Template configuration object
   * @returns Processed template with variables replaced
   */
  static replaceVariables3(
    argVariables: Record<string, any>[] | undefined,
    argTemplate: TemplateConfig
  ): any {
    // If no variables specified, return template contents
    if (!argVariables && !argTemplate.template.defaults) {
      return argTemplate[argTemplate.template.type];
    }

    let variableArray = argVariables?.slice(0) ?? [];

    // Merge given variables and defaults
    if (argTemplate.template.defaults) {
      variableArray = variableArray.concat(argTemplate.template.defaults);
    }

    let jsonConfig = JSON.stringify(argTemplate[argTemplate.template.type]);

    // Replace each variable in the template
    variableArray.forEach(variable => {
      const key = Object.keys(variable)[0];
      const value = Object.values(variable)[0];

      if (typeof value === 'number' || typeof value === 'boolean') {
        // Replace quoted placeholders for numbers and booleans
        const rxp2 = new RegExp(`"\\[\\[${key}\\]\\]"`, 'gm');
        jsonConfig = jsonConfig.replace(rxp2, String(value));
      } else if (typeof value === 'object' && value !== null) {
        // Replace quoted placeholders for objects
        const rxp2 = new RegExp(`"\\[\\[${key}\\]\\]"`, 'gm');
        const valueString = JSON.stringify(value);
        jsonConfig = jsonConfig.replace(rxp2, valueString);
      } else {
        // Replace unquoted placeholders for strings
        const rxp = new RegExp(`\\[\\[${key}\\]\\]`, 'gm');
        jsonConfig = jsonConfig.replace(rxp, String(value));
      }
    });

    return JSON.parse(jsonConfig);
  }

  /**
   * Process JavaScript templates or return values as-is
   * Recursively processes objects and evaluates JavaScript templates
   *
   * @param argTool - Tool configuration for context
   * @param argEntities - Entities configuration for context
   * @param argValue - Value to process (may contain JS templates)
   * @returns Processed value with JS templates evaluated
   */
  static getJsTemplateOrValueConfig(argTool: ToolConfig, argEntities: any[], argValue: any): any {
    // Check for 'undefined' or 'null'
    if (argValue == null) return argValue;

    // Check for primitive data types
    if (['number', 'boolean', 'bigint', 'symbol'].includes(typeof argValue)) {
      return argValue;
    }

    // Handle objects recursively
    if (typeof argValue === 'object') {
      const processedObject: any = Array.isArray(argValue) ? [] : {};
      Object.keys(argValue).forEach(key => {
        processedObject[key] = TemplateUtils.getJsTemplateOrValueConfig(
          argTool,
          argEntities,
          argValue[key]
        );
      });
      return processedObject;
    }

    // Handle strings (potential JS templates)
    if (typeof argValue === 'string') {
      const trimmedValue = argValue.trim();
      if (trimmedValue.substring(0, 4) === '[[[[' && trimmedValue.slice(-4) === ']]]]') {
        return TemplateUtils.evaluateJsTemplateConfig(
          argTool,
          argEntities,
          trimmedValue.slice(4, -4)
        );
      }
    }

    return argValue;
  }

  /**
   * Evaluate JavaScript template in configuration context
   * Provides tool_config and entities_config as context
   *
   * @param argTool - Tool configuration
   * @param argEntities - Entities configuration
   * @param jsTemplate - JavaScript template string to evaluate
   * @returns Result of JavaScript evaluation
   */
  static evaluateJsTemplateConfig(
    argTool: ToolConfig,
    argEntities: any[],
    jsTemplate: string
  ): any {
    try {
      // Create a new Function with tool_config and entities_config context
      // eslint-disable-next-line no-new-func
      return new Function('tool_config', 'entities_config', `'use strict'; ${jsTemplate}`).call(
        null,
        argTool,
        argEntities
      );
    } catch (error) {
      const enhancedError = error as Error;
      enhancedError.name = 'Sak-evaluateJsTemplateConfig-Error';
      enhancedError.message = `Template evaluation failed: ${enhancedError.message}`;
      throw enhancedError;
    }
  }

  /**
   * Process JavaScript templates or return values as-is (runtime version)
   * Recursively processes objects and evaluates JavaScript templates with runtime context
   *
   * @param argTool - Tool instance for context
   * @param argState - Current entity state
   * @param argValue - Value to process (may contain JS templates)
   * @returns Processed value with JS templates evaluated
   */
  static getJsTemplateOrValue(argTool: any, argState: any, argValue: any): any {
    // Check for 'undefined' or 'null'
    if (argValue == null) return argValue;

    // Check for primitive data types
    if (['number', 'boolean', 'bigint', 'symbol'].includes(typeof argValue)) {
      return argValue;
    }

    // Handle objects recursively
    if (typeof argValue === 'object') {
      const processedObject: any = Array.isArray(argValue) ? [] : {};
      Object.keys(argValue).forEach(key => {
        processedObject[key] = TemplateUtils.getJsTemplateOrValue(argTool, argState, argValue[key]);
      });
      return processedObject;
    }

    // Handle strings (potential JS templates)
    if (typeof argValue === 'string') {
      const trimmedValue = argValue.trim();
      if (trimmedValue.substring(0, 3) === '[[[' && trimmedValue.slice(-3) === ']]]') {
        return TemplateUtils.evaluateJsTemplate(argTool, argState, trimmedValue.slice(3, -3));
      }
    }

    return argValue;
  }

  /**
   * Evaluate JavaScript template with full runtime context
   * Provides comprehensive context including state, states, entity, user, hass, etc.
   *
   * @param argTool - Tool instance with card context
   * @param state - Current entity state
   * @param jsTemplate - JavaScript template string to evaluate
   * @returns Result of JavaScript evaluation
   */
  static evaluateJsTemplate(argTool: any, state: any, jsTemplate: string): any {
    try {
      // Extract context from tool
      const cardContext = argTool._card as CardContext;
      const hasEntityIndex = argTool.config?.hasOwnProperty('entity_index');
      const entityIndex = argTool.config?.entity_index;

      // Prepare evaluation context
      const entity = hasEntityIndex ? cardContext.entities[entityIndex] : undefined;
      const entityConfig = hasEntityIndex ? cardContext.config.entities[entityIndex] : undefined;

      // Create a new Function with comprehensive context
      // eslint-disable-next-line no-new-func
      return new Function(
        'state',
        'states',
        'entity',
        'user',
        'hass',
        'tool_config',
        'entity_config',
        `'use strict'; ${jsTemplate}`
      ).call(
        null,
        state,
        cardContext._hass.states,
        entity,
        cardContext._hass.user,
        cardContext._hass,
        argTool.config,
        entityConfig
      );
    } catch (error) {
      const enhancedError = error as Error;
      enhancedError.name = 'Sak-evaluateJsTemplate-Error';
      enhancedError.message = `Template evaluation failed: ${enhancedError.message}`;
      throw enhancedError;
    }
  }

  /**
   * Safely evaluate JavaScript template with error handling
   * Wraps template evaluation with comprehensive error handling
   *
   * @param template - JavaScript template string
   * @param context - Evaluation context object
   * @returns Result of evaluation or null if error
   */
  static safeEvaluateTemplate(template: string, context: Record<string, any> = {}): any {
    try {
      // Create context variables for the function
      const contextKeys = Object.keys(context);
      const contextValues = Object.values(context);

      // eslint-disable-next-line no-new-func
      const evaluationFunction = new Function(...contextKeys, `'use strict'; ${template}`);

      return evaluationFunction.apply(null, contextValues);
    } catch (error) {
      // Log error for debugging but don't throw
      console.warn('Template evaluation failed:', error);
      return null;
    }
  }

  /**
   * Check if a string contains a JavaScript template
   * @param value - String value to check
   * @returns True if value contains a JS template
   */
  static isJavaScriptTemplate(value: string): boolean {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    return (
      (trimmed.startsWith('[[[') && trimmed.endsWith(']]]')) ||
      (trimmed.startsWith('[[[[') && trimmed.endsWith(']]]]'))
    );
  }

  /**
   * Extract JavaScript template content from template string
   * @param template - Template string with delimiters
   * @returns JavaScript code without delimiters
   */
  static extractTemplateContent(template: string): string {
    const trimmed = template.trim();
    if (trimmed.startsWith('[[[[') && trimmed.endsWith(']]]]')) {
      return trimmed.slice(4, -4);
    }
    if (trimmed.startsWith('[[[') && trimmed.endsWith(']]]')) {
      return trimmed.slice(3, -3);
    }
    return template;
  }
}
