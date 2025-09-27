/*
 * Constants - Core constants and mathematical utilities
 * Modern TypeScript implementation of core SAK constants
 */

// Core SVG dimensions and scaling
const SCALE_DIMENSIONS = 2;
export const SVG_DEFAULT_DIMENSIONS = 200 * SCALE_DIMENSIONS;
export const SVG_DEFAULT_DIMENSIONS_HALF = SVG_DEFAULT_DIMENSIONS / 2;
export const SVG_VIEW_BOX = SVG_DEFAULT_DIMENSIONS;
export const FONT_SIZE = SVG_DEFAULT_DIMENSIONS / 100;

/**
 * Clamp a number between minimum and maximum values
 * @param min - Minimum allowed value
 * @param num - Number to clamp
 * @param max - Maximum allowed value
 * @returns Clamped number between min and max
 */
export const clamp = (min: number, num: number, max: number): number =>
  Math.min(Math.max(num, min), max);

/**
 * Round to nearest value between two options
 * @param min - First option
 * @param num - Number to compare
 * @param max - Second option
 * @returns The closer value (min or max)
 */
export const round = (min: number, num: number, max: number): number =>
  Math.abs(num - min) > Math.abs(max - num) ? max : min;

/**
 * Force angle between 0 and 360 degrees, or handle negative angles
 * @param start - Start angle
 * @param angle - Current angle
 * @param end - End angle
 * @returns Normalized angle
 */
export const angle360 = (start: number, angle: number, end: number): number =>
  start < 0 || end < 0 ? angle + 360 : angle;

/**
 * Calculate range (absolute difference) between two values
 * @param value1 - First value
 * @param value2 - Second value
 * @returns Absolute difference between values
 */
export const range = (value1: number, value2: number): number => Math.abs(value1 - value2);

// Export all constants and utilities as default for backward compatibility
export default {
  SCALE_DIMENSIONS,
  SVG_DEFAULT_DIMENSIONS,
  SVG_DEFAULT_DIMENSIONS_HALF,
  SVG_VIEW_BOX,
  FONT_SIZE,
  clamp,
  round,
  angle360,
  range,
};
