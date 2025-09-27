/*
 * MergeUtils Tests
 * Unit tests for deep object merging utilities
 */

import { describe, expect, it } from 'vitest';
import MergeUtils, { mergeDeep } from '../MergeUtils.js';

describe('MergeUtils', () => {
  describe('mergeDeep function', () => {
    it('should merge simple objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { c: 3, d: 4 };
      const result = mergeDeep(obj1, obj2);

      expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 });
    });

    it('should overwrite primitive values', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3, c: 4 };
      const result = mergeDeep(obj1, obj2);

      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should merge nested objects', () => {
      const obj1 = {
        a: 1,
        nested: { x: 1, y: 2 },
      };
      const obj2 = {
        b: 2,
        nested: { y: 3, z: 4 },
      };
      const result = mergeDeep(obj1, obj2);

      expect(result).toEqual({
        a: 1,
        b: 2,
        nested: { x: 1, y: 3, z: 4 },
      });
    });

    it('should concatenate arrays', () => {
      const obj1 = { arr: [1, 2] };
      const obj2 = { arr: [3, 4] };
      const result = mergeDeep(obj1, obj2);

      expect(result).toEqual({ arr: [1, 2, 3, 4] });
    });

    it('should handle mixed array and object merging', () => {
      const obj1 = {
        data: [1, 2],
        config: { a: 1 },
      };
      const obj2 = {
        data: [3, 4],
        config: { b: 2 },
      };
      const result = mergeDeep(obj1, obj2);

      expect(result).toEqual({
        data: [1, 2, 3, 4],
        config: { a: 1, b: 2 },
      });
    });

    it('should handle null and undefined values', () => {
      const obj1 = { a: 1, b: null };
      const obj2 = { b: 2, c: undefined };
      const result = mergeDeep(obj1, obj2);

      expect(result).toEqual({ a: 1, b: 2, c: undefined });
    });

    it('should merge multiple objects', () => {
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };
      const obj3 = { c: 3 };
      const result = mergeDeep(obj1, obj2, obj3);

      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should not modify original objects (immutable)', () => {
      const obj1 = { a: 1, nested: { x: 1 } };
      const obj2 = { b: 2, nested: { y: 2 } };
      const result = mergeDeep(obj1, obj2);

      // Original objects should not be modified
      expect(obj1).toEqual({ a: 1, nested: { x: 1 } });
      expect(obj2).toEqual({ b: 2, nested: { y: 2 } });

      // Result should contain merged data
      expect(result).toEqual({
        a: 1,
        b: 2,
        nested: { x: 1, y: 2 },
      });
    });

    it('should handle empty objects', () => {
      const obj1 = {};
      const obj2 = { a: 1 };
      const result = mergeDeep(obj1, obj2);

      expect(result).toEqual({ a: 1 });
    });

    it('should handle deeply nested structures', () => {
      const obj1 = {
        level1: {
          level2: {
            level3: {
              value: 1,
            },
          },
        },
      };
      const obj2 = {
        level1: {
          level2: {
            level3: {
              otherValue: 2,
            },
            otherLevel3: {
              value: 3,
            },
          },
        },
      };
      const result = mergeDeep(obj1, obj2);

      expect(result).toEqual({
        level1: {
          level2: {
            level3: {
              value: 1,
              otherValue: 2,
            },
            otherLevel3: {
              value: 3,
            },
          },
        },
      });
    });
  });

  describe('MergeUtils class', () => {
    it('should provide backward compatible static method', () => {
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };
      const result = MergeUtils.mergeDeep(obj1, obj2);

      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should produce same results as standalone function', () => {
      const obj1 = { a: 1, nested: { x: 1 } };
      const obj2 = { b: 2, nested: { y: 2 } };

      const functionResult = mergeDeep(obj1, obj2);
      const classResult = MergeUtils.mergeDeep(obj1, obj2);

      expect(functionResult).toEqual(classResult);
    });
  });
});
