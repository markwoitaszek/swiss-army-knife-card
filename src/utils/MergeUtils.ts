/*
 * MergeUtils - Deep object merging utilities
 * Modern TypeScript implementation of deep merge functionality
 */

/**
 * Type guard to check if a value is an object
 * @param obj - Value to check
 * @returns True if value is an object (but not array or null)
 */
const isObject = (obj: any): obj is Record<string, any> => 
  obj && typeof obj === 'object' && !Array.isArray(obj);

/**
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 * 
 * @param objects - Objects to merge
 * @returns New object with merged key/values
 */
export const mergeDeep = (...objects: Record<string, any>[]): Record<string, any> => {
  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach(key => {
      const pVal = prev[key];
      const oVal = obj[key];
      
      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        // Concatenate arrays
        // TODO: Consider matching by .id for more sophisticated array merging
        prev[key] = pVal.concat(...oVal);
      } else if (isObject(pVal) && isObject(oVal)) {
        // Recursively merge objects
        prev[key] = mergeDeep(pVal, oVal);
      } else {
        // Overwrite with new value
        prev[key] = oVal;
      }
    });
    return prev;
  }, {});
};

/**
 * MergeUtils class for backward compatibility
 * Provides the same interface as the legacy merge.js
 */
export default class MergeUtils {
  /**
   * Static method for deep merging - maintains backward compatibility
   * @param objects - Objects to merge
   * @returns New object with merged key/values
   */
  static mergeDeep(...objects: Record<string, any>[]): Record<string, any> {
    return mergeDeep(...objects);
  }
}
