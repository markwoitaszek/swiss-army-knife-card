/*
 * LazyToolLoader - Dynamic tool loading for performance optimization
 * Implements code splitting and lazy loading for advanced tools
 */

import type { BaseTool } from './base/BaseTool.js';

/**
 * Interface for lazy loadable tool modules
 */
interface LazyToolModule {
  default: new (...args: any[]) => BaseTool;
}

/**
 * LazyToolLoader class for dynamic tool loading
 */
export class LazyToolLoader {
  private static loadedTools = new Map<string, new (...args: any[]) => BaseTool>();

  /**
   * Dynamically load an advanced tool
   * @param toolType - Type of tool to load
   * @returns Promise resolving to tool constructor
   */
  static async loadAdvancedTool(toolType: string): Promise<(new (...args: any[]) => BaseTool) | null> {
    // Check if already loaded
    if (this.loadedTools.has(toolType)) {
      return this.loadedTools.get(toolType)!;
    }

    try {
      let module: LazyToolModule;

      switch (toolType) {
        case 'gauge':
          module = await import('./charts/GaugeTool.js');
          break;
        case 'pie_chart':
          module = await import('./charts/PieChartTool.js');
          break;
        case 'heatmap':
          module = await import('./charts/HeatmapTool.js');
          break;
        default:
          return null;
      }

      const ToolConstructor = module.default;
      this.loadedTools.set(toolType, ToolConstructor);
      return ToolConstructor;
    } catch (error) {
      console.error(`Failed to load tool ${toolType}:`, error);
      return null;
    }
  }

  /**
   * Check if a tool type should be lazy loaded
   * @param toolType - Tool type to check
   * @returns True if tool should be lazy loaded
   */
  static isLazyLoadable(toolType: string): boolean {
    const lazyLoadableTools = ['gauge', 'pie_chart', 'heatmap'];
    return lazyLoadableTools.includes(toolType);
  }

  /**
   * Preload commonly used tools
   * @param toolTypes - Array of tool types to preload
   */
  static async preloadTools(toolTypes: string[]): Promise<void> {
    const preloadPromises = toolTypes
      .filter(type => this.isLazyLoadable(type))
      .map(type => this.loadAdvancedTool(type));

    await Promise.all(preloadPromises);
  }

  /**
   * Get loading statistics
   * @returns Loading statistics
   */
  static getLoadingStats(): {
    loadedCount: number;
    availableLazyTools: string[];
    loadedTools: string[];
  } {
    return {
      loadedCount: this.loadedTools.size,
      availableLazyTools: ['gauge', 'pie_chart', 'heatmap'],
      loadedTools: Array.from(this.loadedTools.keys()),
    };
  }

  /**
   * Clear loaded tool cache
   */
  static clearCache(): void {
    this.loadedTools.clear();
  }
}
