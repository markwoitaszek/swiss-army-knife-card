/*
 * Constants Tests
 * Unit tests for core constants and mathematical utilities
 */

import { describe, expect, it } from 'vitest';
import {
  FONT_SIZE,
  SVG_DEFAULT_DIMENSIONS,
  SVG_DEFAULT_DIMENSIONS_HALF,
  SVG_VIEW_BOX,
  angle360,
  clamp,
  range,
  round,
} from '../Constants.js';

describe('Constants', () => {
  describe('Core Constants', () => {
    it('should have correct SVG dimensions', () => {
      expect(SVG_DEFAULT_DIMENSIONS).toBe(400); // 200 * 2
      expect(SVG_DEFAULT_DIMENSIONS_HALF).toBe(200); // 400 / 2
      expect(SVG_VIEW_BOX).toBe(400);
      expect(FONT_SIZE).toBe(4); // 400 / 100
    });

    it('should maintain consistent relationships', () => {
      expect(SVG_DEFAULT_DIMENSIONS_HALF).toBe(SVG_DEFAULT_DIMENSIONS / 2);
      expect(SVG_VIEW_BOX).toBe(SVG_DEFAULT_DIMENSIONS);
      expect(FONT_SIZE).toBe(SVG_DEFAULT_DIMENSIONS / 100);
    });
  });

  describe('clamp function', () => {
    it('should clamp values within range', () => {
      expect(clamp(0, 5, 10)).toBe(5);
      expect(clamp(0, -5, 10)).toBe(0);
      expect(clamp(0, 15, 10)).toBe(10);
    });

    it('should handle edge cases', () => {
      expect(clamp(5, 5, 10)).toBe(5);
      expect(clamp(5, 10, 10)).toBe(10);
      expect(clamp(-10, -5, 0)).toBe(-5);
    });

    it('should work with decimal values', () => {
      expect(clamp(0.1, 0.5, 0.9)).toBe(0.5);
      expect(clamp(0.1, 0.05, 0.9)).toBe(0.1);
      expect(clamp(0.1, 1.5, 0.9)).toBe(0.9);
    });
  });

  describe('round function', () => {
    it('should return closer value', () => {
      expect(round(0, 3, 10)).toBe(0); // 3 is closer to 0
      expect(round(0, 7, 10)).toBe(10); // 7 is closer to 10
      expect(round(0, 5, 10)).toBe(0); // Equal distance, returns min (Math.abs(5-0) === Math.abs(10-5), but condition checks > so returns min)
    });

    it('should handle negative values', () => {
      expect(round(-10, -3, 0)).toBe(0); // -3 is closer to 0
      expect(round(-10, -8, 0)).toBe(-10); // -8 is closer to -10
    });

    it('should work with decimal values', () => {
      expect(round(0.1, 0.3, 0.9)).toBe(0.1); // 0.3 is closer to 0.1
      expect(round(0.1, 0.7, 0.9)).toBe(0.9); // 0.7 is closer to 0.9
    });
  });

  describe('angle360 function', () => {
    it('should handle positive angles', () => {
      expect(angle360(0, 45, 90)).toBe(45);
      expect(angle360(10, 180, 270)).toBe(180);
    });

    it('should add 360 for negative start or end', () => {
      expect(angle360(-10, 45, 90)).toBe(405); // 45 + 360
      expect(angle360(0, 45, -10)).toBe(405); // 45 + 360
      expect(angle360(-10, 45, -20)).toBe(405); // 45 + 360
    });

    it('should handle zero angles', () => {
      expect(angle360(0, 0, 90)).toBe(0);
      expect(angle360(-10, 0, 90)).toBe(360);
    });
  });

  describe('range function', () => {
    it('should calculate absolute difference', () => {
      expect(range(0, 10)).toBe(10);
      expect(range(10, 0)).toBe(10);
      expect(range(-5, 5)).toBe(10);
      expect(range(5, -5)).toBe(10);
    });

    it('should handle equal values', () => {
      expect(range(5, 5)).toBe(0);
      expect(range(-3, -3)).toBe(0);
    });

    it('should work with decimal values', () => {
      expect(range(0.1, 0.9)).toBeCloseTo(0.8);
      expect(range(1.5, 2.7)).toBeCloseTo(1.2);
    });
  });
});
