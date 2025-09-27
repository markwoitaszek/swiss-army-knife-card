/*
 * ColorUtils - Color management, theme processing, and color calculations
 * Modern TypeScript implementation of SAK color system
 */

/**
 * Interface for theme configuration with optional light/dark modes
 */
export interface ThemeConfig {
  modes?: {
    light?: Record<string, string>;
    dark?: Record<string, string>;
  };
  [key: string]: any;
}

/**
 * Interface for processed theme results
 */
export interface ProcessedTheme {
  themeLight: Record<string, string>;
  themeDark: Record<string, string>;
}

/**
 * Interface for processed palette results
 */
export interface ProcessedPalette {
  paletteLight: Record<string, string>;
  paletteDark: Record<string, string>;
}

/**
 * Interface for HSL color values
 */
export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

/**
 * Interface for RGB color values
 */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * ColorUtils class providing comprehensive color management functionality
 * for the Swiss Army Knife Card
 */
export default class ColorUtils {
  // Static properties for color caching and element reference
  private static colorCache: Record<string, number[]> = {};
  private static element: HTMLElement | undefined;

  /**
   * Set the HTML element (the custom card) to work with for getting colors
   * @param argElement - The HTML element to use for color calculations
   */
  static setElement(argElement: HTMLElement): void {
    ColorUtils.element = argElement;
  }

  /**
   * Prefix all keys with '--' to make them CSS Variables
   * @param argColors - The colors to prefix with '--'
   * @returns Object with prefixed keys
   */
  private static _prefixKeys(argColors: Record<string, any>): Record<string, string> {
    const prefixedColors: Record<string, string> = {};

    Object.keys(argColors).forEach(key => {
      const prefixedKey = `--${key}`;
      const value = String(argColors[key]);
      prefixedColors[prefixedKey] = value;
    });

    return prefixedColors;
  }

  /**
   * Load and process theme configuration for dark and light modes
   * @param argTheme - The theme configuration to load
   * @returns Processed theme with light and dark mode variations
   */
  static processTheme(argTheme: ThemeConfig): ProcessedTheme {
    let combinedLight: Record<string, any> = {};
    let combinedDark: Record<string, any> = {};

    const { modes, ...themeBase } = argTheme;

    // Apply theme vars for the specific mode if available
    if (modes) {
      combinedDark = { ...themeBase, ...modes.dark };
      combinedLight = { ...themeBase, ...modes.light };
    }

    // Add CSS variable prefix '--' to keys
    const themeLight = ColorUtils._prefixKeys(combinedLight);
    const themeDark = ColorUtils._prefixKeys(combinedDark);

    return { themeLight, themeDark };
  }

  /**
   * Load swatches defined for the palette and combine them into light and dark modes
   * @param argPalette - The palette configuration to load
   * @returns Processed palette with light and dark mode variations
   */
  static processPalette(argPalette: Record<string, any>): ProcessedPalette {
    let combinedBase: Record<string, any> = {};
    let combinedLight: Record<string, any> = {};
    let combinedDark: Record<string, any> = {};

    // Iterate over palette swatches
    Object.values(argPalette).forEach(swatch => {
      const { modes, ...swatchBase } = swatch as any;

      // Apply swatch vars for all modes and specific modes
      combinedBase = { ...combinedBase, ...swatchBase };
      combinedLight = { ...combinedLight, ...swatchBase };
      combinedDark = { ...combinedDark, ...swatchBase };

      if (modes) {
        if (modes.light) {
          combinedLight = { ...combinedLight, ...modes.light };
        }
        if (modes.dark) {
          combinedDark = { ...combinedDark, ...modes.dark };
        }
      }
    });

    // Add CSS variable prefix '--' to keys
    const paletteLight = ColorUtils._prefixKeys(combinedLight);
    const paletteDark = ColorUtils._prefixKeys(combinedDark);

    return { paletteLight, paletteDark };
  }

  /**
   * Calculate color based on state value and color stops
   * @param argState - Current state value
   * @param argStops - Color stops configuration
   * @param argIsGradient - Whether to use gradient interpolation
   * @returns Calculated color value
   */
  static calculateColor(
    argState: number,
    argStops: Record<number, string>,
    argIsGradient: boolean = false
  ): string {
    const sortedStops = Object.keys(argStops)
      .map(n => Number(n))
      .sort((a, b) => a - b);

    const l = sortedStops.length;

    if (argState <= sortedStops[0]) {
      return argStops[sortedStops[0]];
    } else if (argState >= sortedStops[l - 1]) {
      return argStops[sortedStops[l - 1]];
    } else {
      for (let i = 0; i < l - 1; i++) {
        const s1 = sortedStops[i];
        const s2 = sortedStops[i + 1];
        if (argState >= s1 && argState < s2) {
          const start = argStops[s1];
          const end = argStops[s2];
          if (!argIsGradient) {
            return start;
          }
          const val = ColorUtils.calculateValueBetween(s1, s2, argState);
          return ColorUtils.getGradientValue(start, end, val);
        }
      }
    }
    return argStops[sortedStops[0]];
  }

  /**
   * Calculate color based on state value and nested color stops
   * @param argState - Current state value
   * @param argStops - Nested color stops configuration
   * @param argPart - Part of the configuration to extract
   * @param argProperty - Property to extract
   * @param argIsGradient - Whether to use gradient interpolation
   * @returns Calculated color value
   */
  static calculateColor2(
    argState: number,
    argStops: Record<number, any>,
    argPart: string,
    argProperty: string,
    argIsGradient: boolean = false
  ): string {
    const sortedStops = Object.keys(argStops)
      .map(n => Number(n))
      .sort((a, b) => a - b);

    const l = sortedStops.length;

    if (argState <= sortedStops[0]) {
      return argStops[sortedStops[0]];
    } else if (argState >= sortedStops[l - 1]) {
      return argStops[sortedStops[l - 1]];
    } else {
      for (let i = 0; i < l - 1; i++) {
        const s1 = sortedStops[i];
        const s2 = sortedStops[i + 1];
        if (argState >= s1 && argState < s2) {
          const start = argStops[s1].styles[argPart][argProperty];
          const end = argStops[s2].styles[argPart][argProperty];
          if (!argIsGradient) {
            return start;
          }
          const val = ColorUtils.calculateValueBetween(s1, s2, argState);
          return ColorUtils.getGradientValue(start, end, val);
        }
      }
    }
    return argStops[sortedStops[0]];
  }

  /**
   * Calculate fractional value between start and end
   * @param argStart - Start value
   * @param argEnd - End value
   * @param argValue - Current value
   * @returns Fractional value between 0 and 1
   */
  static calculateValueBetween(argStart: number, argEnd: number, argValue: number): number {
    return (Math.min(Math.max(argValue, argStart), argEnd) - argStart) / (argEnd - argStart);
  }

  /**
   * Get value of CSS color variable
   * @param argColor - CSS variable color (e.g., "var(--color-value)")
   * @returns Computed color value
   */
  static getColorVariable(argColor: string): string {
    const newColor = argColor.substr(4, argColor.length - 5);

    if (!ColorUtils.element) {
      return argColor;
    }

    const returnColor = window.getComputedStyle(ColorUtils.element).getPropertyValue(newColor);
    return returnColor;
  }

  /**
   * Get gradient value between two colors
   * @param argColorA - First color
   * @param argColorB - Second color
   * @param argValue - Interpolation value (0-1)
   * @returns Interpolated color as hex string
   */
  static getGradientValue(argColorA: string, argColorB: string, argValue: number): string {
    const resultColorA = ColorUtils.colorToRGBA(argColorA);
    const resultColorB = ColorUtils.colorToRGBA(argColorB);

    // Calculate interpolated color
    const v1 = 1 - argValue;
    const v2 = argValue;
    const rDec = Math.floor(resultColorA[0] * v1 + resultColorB[0] * v2);
    const gDec = Math.floor(resultColorA[1] * v1 + resultColorB[1] * v2);
    const bDec = Math.floor(resultColorA[2] * v1 + resultColorB[2] * v2);
    const aDec = Math.floor(resultColorA[3] * v1 + resultColorB[3] * v2);

    // Convert to hex
    const rHex = ColorUtils.padZero(rDec.toString(16));
    const gHex = ColorUtils.padZero(gDec.toString(16));
    const bHex = ColorUtils.padZero(bDec.toString(16));
    const aHex = ColorUtils.padZero(aDec.toString(16));

    return `#${rHex}${gHex}${bHex}${aHex}`;
  }

  /**
   * Pad hex value with zero if needed
   * @param argValue - Hex string value
   * @returns Padded hex string (2 characters)
   */
  private static padZero(argValue: string): string {
    if (argValue.length < 2) {
      argValue = `0${argValue}`;
    }
    return argValue.substr(0, 2);
  }

  /**
   * Convert color to RGBA array
   * @param argColor - Color in various formats
   * @returns RGBA values as array [r, g, b, a]
   */
  static colorToRGBA(argColor: string): number[] {
    // Return cached color if available
    const cachedColor = ColorUtils.colorCache[argColor];
    if (cachedColor) return cachedColor;

    let theColor = argColor;

    // Check for CSS variable colors
    if (argColor.substr(0, 3) === 'var') {
      theColor = ColorUtils.getColorVariable(argColor);
    }

    // Use canvas to get RGBA values
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return [0, 0, 0, 255]; // Default to black if canvas context fails
    }

    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = theColor;
    ctx.fillRect(0, 0, 1, 1);
    const outColor = Array.from(ctx.getImageData(0, 0, 1, 1).data);

    // Cache the result
    ColorUtils.colorCache[argColor] = outColor;

    return outColor;
  }

  /**
   * Convert HSL color to RGB
   * @param hsl - HSL color object
   * @returns RGB color object
   */
  static hslToRgb(hsl: HSLColor): RGBColor {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    let r: number;
    let g: number;
    let b: number;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: r * 255,
      g: g * 255,
      b: b * 255,
    };
  }

  /**
   * Clear the color cache
   */
  static clearColorCache(): void {
    ColorUtils.colorCache = {};
  }

  /**
   * Get the current color cache size
   * @returns Number of cached colors
   */
  static getColorCacheSize(): number {
    return Object.keys(ColorUtils.colorCache).length;
  }
}
