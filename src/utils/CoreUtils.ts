/*
 * CoreUtils - Core utility functions for calculations and DOM access
 * Modern TypeScript implementation of core SAK utilities
 */

import { SVG_DEFAULT_DIMENSIONS, SVG_DEFAULT_DIMENSIONS_HALF } from '../constants/Constants.js';

/**
 * CoreUtils class providing essential utility functions
 * for SVG calculations and Home Assistant integration
 */
export default class CoreUtils {
  /**
   * Calculate fractional value between start and end based on current value
   * Clips the val value between start and end, and returns the between value
   * Returned value is a fractional value between 0 and 1
   * 
   * @param argStart - Start value of range
   * @param argEnd - End value of range  
   * @param argVal - Current value to calculate fraction for
   * @returns Fractional value between 0 and 1
   */
  static calculateValueBetween(argStart: number, argEnd: number, argVal: number): number {
    // Check for valid argVal values and return 0 if invalid
    if (isNaN(argVal)) return 0;
    if (!argVal && argVal !== 0) return 0; // Handle null, undefined, false but allow 0

    // Valid argVal value: calculate fraction between 0 and 1
    return (Math.min(Math.max(argVal, argStart), argEnd) - argStart) / (argEnd - argStart);
  }

  /**
   * Calculate SVG coordinate relative to centered toolset position
   * Tool coordinates are percentages that need to be converted to SVG units
   * 
   * @param argOwn - Tool's own coordinate as percentage (0-100)
   * @param argToolset - Toolset's position in SVG coordinates
   * @returns Calculated SVG coordinate
   */
  static calculateSvgCoordinate(argOwn: number, argToolset: number): number {
    return (argOwn / 100) * SVG_DEFAULT_DIMENSIONS + (argToolset - SVG_DEFAULT_DIMENSIONS_HALF);
  }

  /**
   * Translate tool dimension like length or width to actual SVG dimension
   * Converts percentage-based dimensions to SVG units
   * 
   * @param argDimension - Dimension as percentage (0-100)
   * @returns SVG dimension in actual units
   */
  static calculateSvgDimension(argDimension: number): number {
    return (argDimension / 100) * SVG_DEFAULT_DIMENSIONS;
  }

  /**
   * Get Lovelace instance from Home Assistant DOM
   * Navigates through the shadow DOM to find the Lovelace instance
   * 
   * @returns Lovelace instance or null if not found
   */
  static getLovelace(): any | null {
    try {
      let root: any = window.document.querySelector('home-assistant');
      root = root?.shadowRoot;
      root = root?.querySelector('home-assistant-main');
      root = root?.shadowRoot;
      root = root?.querySelector(
        'app-drawer-layout partial-panel-resolver, ha-drawer partial-panel-resolver'
      );
      root = root?.shadowRoot || root;
      root = root?.querySelector('ha-panel-lovelace');
      root = root?.shadowRoot;
      root = root?.querySelector('hui-root');
      
      if (root) {
        const ll = root.lovelace;
        if (ll) {
          ll.current_view = root.___curView;
          return ll;
        }
      }
      return null;
    } catch (error) {
      // Silently handle DOM navigation errors
      return null;
    }
  }
}

// Export individual functions for modern usage
export const {
  calculateValueBetween,
  calculateSvgCoordinate, 
  calculateSvgDimension,
  getLovelace
} = CoreUtils;
