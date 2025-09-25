/*
 * Basic Tests
 * Simple tests for existing functionality without dependencies
 */

import { describe, it, expect } from 'vitest';

describe('Basic Functionality', () => {
  it('should pass basic arithmetic', () => {
    expect(1 + 1).toBe(2);
    expect(2 * 3).toBe(6);
    expect(10 - 5).toBe(5);
  });

  it('should handle string operations', () => {
    const str = 'Hello World';
    expect(str.length).toBe(11);
    expect(str.toUpperCase()).toBe('HELLO WORLD');
    expect(str.includes('World')).toBe(true);
  });

  it('should handle array operations', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr.length).toBe(5);
    expect(arr.includes(3)).toBe(true);
    expect(arr.filter(n => n > 3)).toEqual([4, 5]);
  });

  it('should handle object operations', () => {
    const obj = { name: 'test', value: 42 };
    expect(obj.name).toBe('test');
    expect(obj.value).toBe(42);
    expect(Object.keys(obj)).toEqual(['name', 'value']);
  });

  it('should handle async operations', async () => {
    const promise = Promise.resolve('test');
    const result = await promise;
    expect(result).toBe('test');
  });

  it('should handle error cases', () => {
    expect(() => {
      throw new Error('Test error');
    }).toThrow('Test error');
  });
});

describe('TypeScript Support', () => {
  it('should support type annotations', () => {
    const add = (a: number, b: number): number => a + b;
    expect(add(2, 3)).toBe(5);
  });

  it('should support interfaces', () => {
    interface TestInterface {
      id: number;
      name: string;
    }

    const obj: TestInterface = { id: 1, name: 'test' };
    expect(obj.id).toBe(1);
    expect(obj.name).toBe('test');
  });

  it('should support generics', () => {
    const identity = <T>(arg: T): T => arg;
    expect(identity(42)).toBe(42);
    expect(identity('hello')).toBe('hello');
  });
});

describe('DOM Operations', () => {
  it('should create DOM elements', () => {
    const div = document.createElement('div');
    div.textContent = 'test';
    expect(div.textContent).toBe('test');
    expect(div.tagName).toBe('DIV');
  });

  it('should handle event listeners', () => {
    const button = document.createElement('button');
    let clicked = false;
    
    button.addEventListener('click', () => {
      clicked = true;
    });
    
    button.click();
    expect(clicked).toBe(true);
  });

  it('should handle CSS classes', () => {
    const element = document.createElement('div');
    element.classList.add('test-class');
    expect(element.classList.contains('test-class')).toBe(true);
    
    element.classList.remove('test-class');
    expect(element.classList.contains('test-class')).toBe(false);
  });
});

describe('Math Operations', () => {
  it('should handle basic math', () => {
    expect(Math.PI).toBeCloseTo(3.14159, 4);
    expect(Math.sqrt(16)).toBe(4);
    expect(Math.pow(2, 3)).toBe(8);
  });

  it('should handle rounding', () => {
    expect(Math.round(3.7)).toBe(4);
    expect(Math.floor(3.7)).toBe(3);
    expect(Math.ceil(3.2)).toBe(4);
  });

  it('should handle random numbers', () => {
    const random = Math.random();
    expect(random).toBeGreaterThanOrEqual(0);
    expect(random).toBeLessThan(1);
  });
});

describe('Date Operations', () => {
  it('should handle date creation', () => {
    const date = new Date(2023, 0, 1); // Year, Month (0-based), Day
    expect(date.getFullYear()).toBe(2023);
    expect(date.getMonth()).toBe(0); // January is 0
    expect(date.getDate()).toBe(1);
  });

  it('should handle date formatting', () => {
    const date = new Date('2023-01-01T12:00:00Z');
    const isoString = date.toISOString();
    expect(isoString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});

describe('JSON Operations', () => {
  it('should handle JSON serialization', () => {
    const obj = { name: 'test', value: 42 };
    const json = JSON.stringify(obj);
    expect(json).toBe('{"name":"test","value":42}');
  });

  it('should handle JSON parsing', () => {
    const json = '{"name":"test","value":42}';
    const obj = JSON.parse(json);
    expect(obj.name).toBe('test');
    expect(obj.value).toBe(42);
  });
});
