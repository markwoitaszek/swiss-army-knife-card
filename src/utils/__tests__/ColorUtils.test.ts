/*
 * ColorUtils Tests
 * Unit tests for color management and theme processing
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import ColorUtils, { type HSLColor, type ThemeConfig } from '../ColorUtils.js';

describe('ColorUtils', () => {
  beforeEach(() => {
    // Clear color cache before each test
    ColorUtils.clearColorCache();

    // Mock DOM elements
    document.body.innerHTML = '';
  });

  describe('setElement', () => {
    it('should set the element for color calculations', () => {
      const element = document.createElement('div');
      ColorUtils.setElement(element);

      // We can't directly test the private element, but we can test it indirectly
      expect(() => ColorUtils.setElement(element)).not.toThrow();
    });
  });

  describe('processTheme', () => {
    it('should process theme without modes', () => {
      const theme: ThemeConfig = {
        'primary-color': '#ff0000',
        'secondary-color': '#00ff00',
      };

      const result = ColorUtils.processTheme(theme);

      expect(result).toEqual({
        themeLight: {},
        themeDark: {},
      });
    });

    it('should process theme with light and dark modes', () => {
      const theme: ThemeConfig = {
        'base-color': '#888888',
        modes: {
          light: {
            'primary-color': '#ff0000',
            'text-color': '#000000',
          },
          dark: {
            'primary-color': '#cc0000',
            'text-color': '#ffffff',
          },
        },
      };

      const result = ColorUtils.processTheme(theme);

      expect(result).toEqual({
        themeLight: {
          '--base-color': '#888888',
          '--primary-color': '#ff0000',
          '--text-color': '#000000',
        },
        themeDark: {
          '--base-color': '#888888',
          '--primary-color': '#cc0000',
          '--text-color': '#ffffff',
        },
      });
    });

    it('should handle empty theme', () => {
      const theme: ThemeConfig = {};
      const result = ColorUtils.processTheme(theme);

      expect(result).toEqual({
        themeLight: {},
        themeDark: {},
      });
    });
  });

  describe('processPalette', () => {
    it('should process palette with multiple swatches', () => {
      const palette = {
        swatch1: {
          'color-1': '#ff0000',
          'color-2': '#00ff00',
        },
        swatch2: {
          'color-3': '#0000ff',
          modes: {
            light: { 'color-4': '#ffff00' },
            dark: { 'color-4': '#ff00ff' },
          },
        },
      };

      const result = ColorUtils.processPalette(palette);

      expect(result.paletteLight).toEqual({
        '--color-1': '#ff0000',
        '--color-2': '#00ff00',
        '--color-3': '#0000ff',
        '--color-4': '#ffff00',
      });

      expect(result.paletteDark).toEqual({
        '--color-1': '#ff0000',
        '--color-2': '#00ff00',
        '--color-3': '#0000ff',
        '--color-4': '#ff00ff',
      });
    });

    it('should handle empty palette', () => {
      const result = ColorUtils.processPalette({});

      expect(result).toEqual({
        paletteLight: {},
        paletteDark: {},
      });
    });
  });

  describe('calculateColor', () => {
    it('should return exact color for exact stop match', () => {
      const stops = { 0: '#ff0000', 50: '#00ff00', 100: '#0000ff' };

      expect(ColorUtils.calculateColor(0, stops)).toBe('#ff0000');
      expect(ColorUtils.calculateColor(50, stops)).toBe('#00ff00');
      expect(ColorUtils.calculateColor(100, stops)).toBe('#0000ff');
    });

    it('should return boundary colors for out-of-range values', () => {
      const stops = { 10: '#ff0000', 90: '#0000ff' };

      expect(ColorUtils.calculateColor(-5, stops)).toBe('#ff0000');
      expect(ColorUtils.calculateColor(150, stops)).toBe('#0000ff');
    });

    it('should return step color when gradient is disabled', () => {
      const stops = { 0: '#ff0000', 100: '#0000ff' };

      expect(ColorUtils.calculateColor(25, stops, false)).toBe('#ff0000');
      expect(ColorUtils.calculateColor(75, stops, false)).toBe('#ff0000');
    });

    it('should calculate gradient color when gradient is enabled', () => {
      const stops = { 0: '#ff0000', 100: '#0000ff' };

      // Mock colorToRGBA to return predictable values
      vi.spyOn(ColorUtils, 'colorToRGBA')
        .mockReturnValueOnce([255, 0, 0, 255]) // #ff0000
        .mockReturnValueOnce([0, 0, 255, 255]); // #0000ff

      const result = ColorUtils.calculateColor(50, stops, true);

      // Should be a gradient between red and blue
      expect(result).toMatch(/^#[0-9a-f]{8}$/i);
    });
  });

  describe('calculateValueBetween', () => {
    it('should calculate correct fractional values', () => {
      expect(ColorUtils.calculateValueBetween(0, 10, 5)).toBe(0.5);
      expect(ColorUtils.calculateValueBetween(10, 20, 15)).toBe(0.5);
      expect(ColorUtils.calculateValueBetween(0, 100, 25)).toBe(0.25);
    });

    it('should clamp values to range', () => {
      expect(ColorUtils.calculateValueBetween(0, 10, -5)).toBe(0);
      expect(ColorUtils.calculateValueBetween(0, 10, 15)).toBe(1);
    });
  });

  describe('getColorVariable', () => {
    it('should extract CSS variable name and get computed style', () => {
      const mockElement = document.createElement('div');
      ColorUtils.setElement(mockElement);

      // Mock getComputedStyle
      const mockGetComputedStyle = vi.fn().mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue('#ff0000'),
      });
      vi.stubGlobal('getComputedStyle', mockGetComputedStyle);

      const result = ColorUtils.getColorVariable('var(--primary-color)');

      expect(result).toBe('#ff0000');
      expect(mockGetComputedStyle).toHaveBeenCalledWith(mockElement);
    });

    it('should return original color if no element set', () => {
      // Clear any previously set element
      ColorUtils.setElement(undefined as any);
      const result = ColorUtils.getColorVariable('var(--primary-color)');
      expect(result).toBe('var(--primary-color)');
    });
  });

  describe('colorToRGBA', () => {
    beforeEach(() => {
      // Mock canvas and context
      const mockCanvas = {
        width: 1,
        height: 1,
        getContext: vi.fn().mockReturnValue({
          clearRect: vi.fn(),
          fillRect: vi.fn(),
          getImageData: vi.fn().mockReturnValue({
            data: new Uint8ClampedArray([255, 0, 0, 255]), // Red color
          }),
          fillStyle: '',
        }),
      };

      vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas as any);
    });

    it('should convert color to RGBA array', () => {
      const result = ColorUtils.colorToRGBA('#ff0000');
      expect(result).toEqual([255, 0, 0, 255]);
    });

    it('should cache color results', () => {
      const color = '#ff0000';

      // First call
      const result1 = ColorUtils.colorToRGBA(color);

      // Second call should return cached result
      const result2 = ColorUtils.colorToRGBA(color);

      expect(result1).toEqual(result2);
      expect(ColorUtils.getColorCacheSize()).toBe(1);
    });

    it('should handle CSS variable colors', () => {
      const mockElement = document.createElement('div');
      ColorUtils.setElement(mockElement);

      vi.spyOn(ColorUtils, 'getColorVariable').mockReturnValue('#00ff00');

      const result = ColorUtils.colorToRGBA('var(--secondary-color)');
      expect(result).toEqual([255, 0, 0, 255]); // Mock canvas returns red
    });
  });

  describe('hslToRgb', () => {
    it('should convert HSL to RGB correctly', () => {
      // Red color
      const red: HSLColor = { h: 0, s: 100, l: 50 };
      const rgbRed = ColorUtils.hslToRgb(red);
      expect(rgbRed.r).toBeCloseTo(255);
      expect(rgbRed.g).toBeCloseTo(0);
      expect(rgbRed.b).toBeCloseTo(0);

      // Green color
      const green: HSLColor = { h: 120, s: 100, l: 50 };
      const rgbGreen = ColorUtils.hslToRgb(green);
      expect(rgbGreen.r).toBeCloseTo(0);
      expect(rgbGreen.g).toBeCloseTo(255);
      expect(rgbGreen.b).toBeCloseTo(0);

      // Blue color
      const blue: HSLColor = { h: 240, s: 100, l: 50 };
      const rgbBlue = ColorUtils.hslToRgb(blue);
      expect(rgbBlue.r).toBeCloseTo(0);
      expect(rgbBlue.g).toBeCloseTo(0);
      expect(rgbBlue.b).toBeCloseTo(255);
    });

    it('should handle achromatic colors (no saturation)', () => {
      const gray: HSLColor = { h: 0, s: 0, l: 50 };
      const rgbGray = ColorUtils.hslToRgb(gray);

      expect(rgbGray.r).toBeCloseTo(127.5);
      expect(rgbGray.g).toBeCloseTo(127.5);
      expect(rgbGray.b).toBeCloseTo(127.5);
    });

    it('should handle white and black', () => {
      const white: HSLColor = { h: 0, s: 0, l: 100 };
      const rgbWhite = ColorUtils.hslToRgb(white);
      expect(rgbWhite.r).toBe(255);
      expect(rgbWhite.g).toBe(255);
      expect(rgbWhite.b).toBe(255);

      const black: HSLColor = { h: 0, s: 0, l: 0 };
      const rgbBlack = ColorUtils.hslToRgb(black);
      expect(rgbBlack.r).toBe(0);
      expect(rgbBlack.g).toBe(0);
      expect(rgbBlack.b).toBe(0);
    });
  });

  describe('color cache management', () => {
    it('should clear color cache', () => {
      // Add something to cache
      ColorUtils.colorToRGBA('#ff0000');
      expect(ColorUtils.getColorCacheSize()).toBeGreaterThan(0);

      ColorUtils.clearColorCache();
      expect(ColorUtils.getColorCacheSize()).toBe(0);
    });

    it('should report correct cache size', () => {
      expect(ColorUtils.getColorCacheSize()).toBe(0);

      ColorUtils.colorToRGBA('#ff0000');
      expect(ColorUtils.getColorCacheSize()).toBe(1);

      ColorUtils.colorToRGBA('#00ff00');
      expect(ColorUtils.getColorCacheSize()).toBe(2);
    });
  });

  describe('getGradientValue', () => {
    beforeEach(() => {
      // Mock colorToRGBA for predictable results
      vi.spyOn(ColorUtils, 'colorToRGBA').mockImplementation((color: string) => {
        if (color === '#ff0000') return [255, 0, 0, 255];
        if (color === '#0000ff') return [0, 0, 255, 255];
        return [0, 0, 0, 255];
      });
    });

    it('should interpolate between two colors', () => {
      const result = ColorUtils.getGradientValue('#ff0000', '#0000ff', 0.5);

      // Should be halfway between red and blue
      expect(result).toMatch(/^#[0-9a-f]{8}$/i);

      // At 50%, should be roughly #7f007fff (127, 0, 127, 255)
      expect(result.toLowerCase()).toBe('#7f007fff');
    });

    it('should return first color at 0 interpolation', () => {
      const result = ColorUtils.getGradientValue('#ff0000', '#0000ff', 0);
      expect(result.toLowerCase()).toBe('#ff0000ff');
    });

    it('should return second color at 1 interpolation', () => {
      const result = ColorUtils.getGradientValue('#ff0000', '#0000ff', 1);
      expect(result.toLowerCase()).toBe('#0000ffff');
    });
  });
});
