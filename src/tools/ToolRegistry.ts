/*
 * ToolRegistry - Modern TypeScript tool registration system
 * Centralized registry for all SAK tools with type safety
 */

import type { BaseTool } from './base/BaseTool.js';

// Import modern TypeScript tools
import { EntityStateTool } from './entity/EntityStateTool.js';
import { CircleTool } from './shapes/CircleTool.js';
import { RectangleTool } from './shapes/RectangleTool.js';
import { TextTool } from './text/TextTool.js';

// Import legacy JavaScript tools (temporarily for compatibility)
import BadgeTool from '../badge-tool.js';
import CircularSliderTool from '../circular-slider-tool.js';
import EllipseTool from '../ellipse-tool.js';
import EntityAreaTool from '../entity-area-tool.js';
import EntityIconTool from '../entity-icon-tool.js';
import EntityNameTool from '../entity-name-tool.js';
import HorseshoeTool from '../horseshoe-tool.js';
import LineTool from '../line-tool.js';
import RangeSliderTool from '../range-slider-tool.js';
import RectangleToolEx from '../rectangle-ex-tool.js';
import RegPolyTool from '../regular-polygon-tool.js';
import SegmentedArcTool from '../segmented-arc-tool.js';
import SparklineBarChartTool from '../sparkline-barchart-tool.js';
import SparklineGraphTool from '../sparkline-graph-tool.js';
import SwitchTool from '../switch-tool.js';
import UserSvgTool from '../user-svg-tool.js';

export type ToolType =
  | 'circle'
  | 'rectangle'
  | 'text'
  | 'entity_state'
  | 'entity_icon'
  | 'entity_name'
  | 'entity_area'
  | 'badge'
  | 'ellipse'
  | 'line'
  | 'horseshoe'
  | 'segarc'
  | 'regpoly'
  | 'rectex'
  | 'slider'
  | 'circslider'
  | 'switch'
  | 'sparkline'
  | 'bar'
  | 'usersvg';

export type ToolConstructor = new (...args: any[]) => BaseTool;

/**
 * Modern TypeScript tool registry
 * Provides type-safe tool creation and management
 */
export class ToolRegistry {
  private static instance: ToolRegistry;
  private readonly modernTools = new Map<ToolType, ToolConstructor>();
  private readonly legacyTools = new Map<ToolType, any>();

  private constructor() {
    this.registerModernTools();
    this.registerLegacyTools();
  }

  static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  private registerModernTools(): void {
    // Register modern TypeScript tools
    this.modernTools.set('circle', CircleTool);
    this.modernTools.set('rectangle', RectangleTool);
    this.modernTools.set('text', TextTool);
    this.modernTools.set('entity_state', EntityStateTool);
  }

  private registerLegacyTools(): void {
    // Register legacy JavaScript tools (for backward compatibility)
    this.legacyTools.set('badge', BadgeTool);
    this.legacyTools.set('circslider', CircularSliderTool);
    this.legacyTools.set('ellipse', EllipseTool);
    this.legacyTools.set('entity_area', EntityAreaTool);
    this.legacyTools.set('entity_icon', EntityIconTool);
    this.legacyTools.set('entity_name', EntityNameTool);
    this.legacyTools.set('horseshoe', HorseshoeTool);
    this.legacyTools.set('line', LineTool);
    this.legacyTools.set('slider', RangeSliderTool);
    this.legacyTools.set('rectex', RectangleToolEx);
    this.legacyTools.set('regpoly', RegPolyTool);
    this.legacyTools.set('segarc', SegmentedArcTool);
    this.legacyTools.set('bar', SparklineBarChartTool);
    this.legacyTools.set('sparkline', SparklineGraphTool);
    this.legacyTools.set('switch', SwitchTool);
    this.legacyTools.set('usersvg', UserSvgTool);
  }

  /**
   * Create a tool instance by type
   * Prefers modern TypeScript tools over legacy JavaScript tools
   */
  createTool(type: ToolType, ...args: any[]): BaseTool | any {
    // Try modern tools first
    const ModernToolClass = this.modernTools.get(type);
    if (ModernToolClass) {
      return new ModernToolClass(...args);
    }

    // Fall back to legacy tools
    const LegacyToolClass = this.legacyTools.get(type);
    if (LegacyToolClass) {
      return new LegacyToolClass(...args);
    }

    throw new Error(`Unknown tool type: ${type}`);
  }

  /**
   * Check if a tool type is supported
   */
  isToolSupported(type: string): type is ToolType {
    return this.modernTools.has(type as ToolType) || this.legacyTools.has(type as ToolType);
  }

  /**
   * Get all supported tool types
   */
  getSupportedToolTypes(): ToolType[] {
    const modernTypes = Array.from(this.modernTools.keys());
    const legacyTypes = Array.from(this.legacyTools.keys());
    return [...modernTypes, ...legacyTypes];
  }

  /**
   * Check if a tool type uses modern TypeScript implementation
   */
  isModernTool(type: ToolType): boolean {
    return this.modernTools.has(type);
  }

  /**
   * Get migration status for all tools
   */
  getMigrationStatus(): { modern: ToolType[]; legacy: ToolType[] } {
    return {
      modern: Array.from(this.modernTools.keys()),
      legacy: Array.from(this.legacyTools.keys()),
    };
  }
}

// Export singleton instance
export const toolRegistry = ToolRegistry.getInstance();

// Export for backward compatibility
export default toolRegistry;
