/*
 * AdvancedThemeManager - Enhanced theme system for SAK cards
 * Provides comprehensive theming with CSS custom properties and inheritance
 */

import type { ThemeState } from '../types/SakTypes.js';

export interface ThemeDefinition {
  name: string;
  displayName: string;
  description?: string;
  author?: string;
  version?: string;
  baseTheme?: 'light' | 'dark' | 'auto';
  variables: Record<string, string>;
  tools?: Record<string, Record<string, string>>; // Tool-specific overrides
  responsive?: {
    mobile?: Record<string, string>;
    tablet?: Record<string, string>;
    desktop?: Record<string, string>;
  };
}

export interface ThemeConfig {
  theme?: string; // Theme name
  customVariables?: Record<string, string>;
  toolOverrides?: Record<string, Record<string, string>>;
  autoMode?: boolean; // Auto light/dark detection
}

export class AdvancedThemeManager {
  private themes: Map<string, ThemeDefinition> = new Map();
  private currentTheme: ThemeDefinition | null = null;
  private currentMode: 'light' | 'dark' = 'light';
  private customVariables: Record<string, string> = {};
  private element: HTMLElement | null = null;

  constructor(element?: HTMLElement) {
    this.element = element || null;
    this.registerDefaultThemes();
    this.setupModeDetection();
  }

  // Public API
  registerTheme(theme: ThemeDefinition): void {
    this.themes.set(theme.name, theme);
  }

  getTheme(name: string): ThemeDefinition | undefined {
    return this.themes.get(name);
  }

  getAllThemes(): ThemeDefinition[] {
    return Array.from(this.themes.values());
  }

  getThemesByBase(baseTheme: 'light' | 'dark'): ThemeDefinition[] {
    return this.getAllThemes().filter(theme => theme.baseTheme === baseTheme);
  }

  applyTheme(themeName: string, config?: ThemeConfig): boolean {
    const theme = this.getTheme(themeName);
    if (!theme) {
      console.warn(`Theme '${themeName}' not found`);
      return false;
    }

    this.currentTheme = theme;
    this.customVariables = config?.customVariables || {};

    // Apply theme to element
    this.applyThemeToElement();

    return true;
  }

  setMode(mode: 'light' | 'dark'): void {
    this.currentMode = mode;
    this.applyThemeToElement();
  }

  getMode(): 'light' | 'dark' {
    return this.currentMode;
  }

  // Theme application
  private applyThemeToElement(): void {
    if (!this.element || !this.currentTheme) return;

    const variables = this.calculateFinalVariables();

    // Apply CSS custom properties
    Object.entries(variables).forEach(([property, value]) => {
      this.element!.style.setProperty(`--${property}`, value);
    });

    // Add theme class
    this.element.classList.remove('sak-theme-light', 'sak-theme-dark');
    this.element.classList.add(`sak-theme-${this.currentMode}`);
    this.element.classList.add(`sak-theme-${this.currentTheme.name}`);
  }

  private calculateFinalVariables(): Record<string, string> {
    if (!this.currentTheme) return {};

    const variables: Record<string, string> = {};

    // Start with base theme variables
    Object.assign(variables, this.currentTheme.variables);

    // Apply mode-specific overrides
    const modeTheme =
      this.currentMode === 'dark' ? this.getTheme('sak-dark') : this.getTheme('sak-light');

    if (modeTheme && modeTheme !== this.currentTheme) {
      Object.assign(variables, modeTheme.variables);
    }

    // Apply responsive overrides based on screen size
    const breakpoint = this.getCurrentBreakpoint();
    if (this.currentTheme.responsive?.[breakpoint]) {
      Object.assign(variables, this.currentTheme.responsive[breakpoint]);
    }

    // Apply custom variables (highest priority)
    Object.assign(variables, this.customVariables);

    return variables;
  }

  private getCurrentBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  // Mode detection
  private setupModeDetection(): void {
    if (typeof window !== 'undefined') {
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', this.handleModeChange.bind(this));

      // Set initial mode
      this.currentMode = mediaQuery.matches ? 'dark' : 'light';
    }
  }

  private handleModeChange(event: MediaQueryListEvent): void {
    this.currentMode = event.matches ? 'dark' : 'light';
    this.applyThemeToElement();
  }

  // Default themes registration
  private registerDefaultThemes(): void {
    // Light theme
    this.registerTheme({
      name: 'sak-light',
      displayName: 'SAK Light',
      description: 'Default light theme for SAK cards',
      baseTheme: 'light',
      variables: {
        'sak-primary-color': '#2196F3',
        'sak-accent-color': '#FF9800',
        'sak-background-color': '#FAFAFA',
        'sak-card-background-color': '#FFFFFF',
        'sak-text-color': '#212121',
        'sak-secondary-text-color': '#757575',
        'sak-disabled-text-color': '#BDBDBD',
        'sak-border-color': '#E0E0E0',
        'sak-shadow-color': 'rgba(0, 0, 0, 0.12)',
        'sak-success-color': '#4CAF50',
        'sak-warning-color': '#FF9800',
        'sak-error-color': '#F44336',
        'sak-info-color': '#2196F3',
      },
    });

    // Dark theme
    this.registerTheme({
      name: 'sak-dark',
      displayName: 'SAK Dark',
      description: 'Default dark theme for SAK cards',
      baseTheme: 'dark',
      variables: {
        'sak-primary-color': '#90CAF9',
        'sak-accent-color': '#FFB74D',
        'sak-background-color': '#121212',
        'sak-card-background-color': '#1E1E1E',
        'sak-text-color': '#FFFFFF',
        'sak-secondary-text-color': '#B0B0B0',
        'sak-disabled-text-color': '#616161',
        'sak-border-color': '#333333',
        'sak-shadow-color': 'rgba(0, 0, 0, 0.24)',
        'sak-success-color': '#81C784',
        'sak-warning-color': '#FFB74D',
        'sak-error-color': '#E57373',
        'sak-info-color': '#64B5F6',
      },
    });

    // Material Design 3 inspired theme
    this.registerTheme({
      name: 'material-3',
      displayName: 'Material Design 3',
      description: 'Modern Material Design 3 inspired theme',
      baseTheme: 'auto',
      variables: {
        'sak-primary-color': '#6750A4',
        'sak-accent-color': '#7D5260',
        'sak-background-color': '#FEF7FF',
        'sak-card-background-color': '#FFFFFF',
        'sak-text-color': '#1D1B20',
        'sak-secondary-text-color': '#49454F',
        'sak-disabled-text-color': '#C4C7C5',
        'sak-border-color': '#CAC4D0',
        'sak-shadow-color': 'rgba(103, 80, 164, 0.15)',
        'sak-success-color': '#146C2E',
        'sak-warning-color': '#B3261E',
        'sak-error-color': '#BA1A1A',
        'sak-info-color': '#0F4C75',
      },
      responsive: {
        mobile: {
          'sak-card-padding': '12px',
          'sak-tool-spacing': '8px',
        },
        tablet: {
          'sak-card-padding': '16px',
          'sak-tool-spacing': '12px',
        },
        desktop: {
          'sak-card-padding': '20px',
          'sak-tool-spacing': '16px',
        },
      },
    });

    // High contrast theme for accessibility
    this.registerTheme({
      name: 'high-contrast',
      displayName: 'High Contrast',
      description: 'High contrast theme for accessibility',
      baseTheme: 'light',
      variables: {
        'sak-primary-color': '#000000',
        'sak-accent-color': '#0000FF',
        'sak-background-color': '#FFFFFF',
        'sak-card-background-color': '#FFFFFF',
        'sak-text-color': '#000000',
        'sak-secondary-text-color': '#333333',
        'sak-disabled-text-color': '#666666',
        'sak-border-color': '#000000',
        'sak-shadow-color': 'rgba(0, 0, 0, 0.5)',
        'sak-success-color': '#008000',
        'sak-warning-color': '#FF8000',
        'sak-error-color': '#FF0000',
        'sak-info-color': '#0000FF',
      },
    });

    // Neumorphic theme
    this.registerTheme({
      name: 'neumorphic',
      displayName: 'Neumorphic',
      description: 'Soft neumorphic design theme',
      baseTheme: 'light',
      variables: {
        'sak-primary-color': '#667eea',
        'sak-accent-color': '#764ba2',
        'sak-background-color': '#e0e5ec',
        'sak-card-background-color': '#e0e5ec',
        'sak-text-color': '#2c3e50',
        'sak-secondary-text-color': '#7f8c8d',
        'sak-disabled-text-color': '#bdc3c7',
        'sak-border-color': 'transparent',
        'sak-shadow-color': 'rgba(163, 177, 198, 0.6)',
        'sak-shadow-inset': 'rgba(255, 255, 255, 0.5)',
        'sak-border-radius': '20px',
        'sak-tool-shadow':
          '9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.5)',
      },
    });
  }

  // Theme validation
  validateTheme(theme: ThemeDefinition): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!theme.name) {
      errors.push('Theme name is required');
    }

    if (!theme.displayName) {
      errors.push('Theme display name is required');
    }

    if (!theme.variables || Object.keys(theme.variables).length === 0) {
      errors.push('Theme must define at least one variable');
    }

    // Validate required variables
    const requiredVariables = ['sak-primary-color', 'sak-background-color', 'sak-text-color'];

    requiredVariables.forEach(variable => {
      if (!theme.variables[variable]) {
        errors.push(`Required variable '${variable}' is missing`);
      }
    });

    // Validate color formats
    Object.entries(theme.variables).forEach(([key, value]) => {
      if (key.includes('color') && !this.isValidColor(value)) {
        errors.push(`Invalid color format for '${key}': ${value}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private isValidColor(color: string): boolean {
    // Basic color validation (hex, rgb, rgba, hsl, var())
    const colorPatterns = [
      /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/, // Hex
      /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/, // RGB
      /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/, // RGBA
      /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/, // HSL
      /^var\(--[\w-]+\)$/, // CSS variable
      /^(transparent|inherit|initial|unset)$/, // CSS keywords
    ];

    return colorPatterns.some(pattern => pattern.test(color));
  }

  // Theme generation utilities
  generateThemeFromColors(
    name: string,
    displayName: string,
    primaryColor: string,
    baseTheme: 'light' | 'dark' = 'light'
  ): ThemeDefinition {
    const isDark = baseTheme === 'dark';

    return {
      name,
      displayName,
      description: `Generated theme based on ${primaryColor}`,
      baseTheme,
      variables: {
        'sak-primary-color': primaryColor,
        'sak-accent-color': this.generateAccentColor(primaryColor),
        'sak-background-color': isDark ? '#121212' : '#FAFAFA',
        'sak-card-background-color': isDark ? '#1E1E1E' : '#FFFFFF',
        'sak-text-color': isDark ? '#FFFFFF' : '#212121',
        'sak-secondary-text-color': isDark ? '#B0B0B0' : '#757575',
        'sak-disabled-text-color': isDark ? '#616161' : '#BDBDBD',
        'sak-border-color': isDark ? '#333333' : '#E0E0E0',
        'sak-shadow-color': isDark ? 'rgba(0, 0, 0, 0.24)' : 'rgba(0, 0, 0, 0.12)',
        'sak-success-color': isDark ? '#81C784' : '#4CAF50',
        'sak-warning-color': isDark ? '#FFB74D' : '#FF9800',
        'sak-error-color': isDark ? '#E57373' : '#F44336',
        'sak-info-color': isDark ? '#64B5F6' : '#2196F3',
      },
    };
  }

  private generateAccentColor(primaryColor: string): string {
    // Simple accent color generation (could be enhanced with color theory)
    if (primaryColor.startsWith('#')) {
      // Convert hex to RGB and shift hue for accent
      const r = parseInt(primaryColor.slice(1, 3), 16);
      const g = parseInt(primaryColor.slice(3, 5), 16);
      const b = parseInt(primaryColor.slice(5, 7), 16);

      // Simple hue shift
      return `rgb(${Math.min(255, r + 30)}, ${Math.max(0, g - 20)}, ${Math.min(255, b + 40)})`;
    }

    return primaryColor; // Fallback to same color
  }

  // Theme inheritance
  createThemeVariant(
    baseName: string,
    variantName: string,
    displayName: string,
    overrides: Record<string, string>
  ): ThemeDefinition | null {
    const baseTheme = this.getTheme(baseName);
    if (!baseTheme) return null;

    return {
      ...baseTheme,
      name: variantName,
      displayName,
      description: `${displayName} (based on ${baseTheme.displayName})`,
      variables: {
        ...baseTheme.variables,
        ...overrides,
      },
    };
  }

  // Theme export/import
  exportTheme(themeName: string): string | null {
    const theme = this.getTheme(themeName);
    if (!theme) return null;

    return JSON.stringify(theme, null, 2);
  }

  importTheme(themeJson: string): boolean {
    try {
      const theme = JSON.parse(themeJson) as ThemeDefinition;
      const validation = this.validateTheme(theme);

      if (!validation.isValid) {
        console.error('Invalid theme:', validation.errors);
        return false;
      }

      this.registerTheme(theme);
      return true;
    } catch (error) {
      console.error('Failed to import theme:', error);
      return false;
    }
  }

  // Theme preview
  previewTheme(themeName: string, duration = 3000): void {
    const originalTheme = this.currentTheme?.name;

    this.applyTheme(themeName);

    setTimeout(() => {
      if (originalTheme) {
        this.applyTheme(originalTheme);
      }
    }, duration);
  }

  // Integration with existing ThemeService
  updateFromThemeState(themeState: ThemeState): void {
    this.currentMode = themeState.isDark ? 'dark' : 'light';

    // Create dynamic theme from Home Assistant theme
    const dynamicTheme: ThemeDefinition = {
      name: 'ha-dynamic',
      displayName: 'Home Assistant Theme',
      description: 'Dynamic theme from Home Assistant',
      baseTheme: themeState.isDark ? 'dark' : 'light',
      variables: {
        'sak-primary-color': themeState.primaryColor || '#2196F3',
        'sak-accent-color': themeState.accentColor || '#FF9800',
        'sak-background-color': themeState.backgroundColor || '#FAFAFA',
        'sak-card-background-color': themeState.cardBackgroundColor || '#FFFFFF',
        'sak-text-color': themeState.textColor || '#212121',
        'sak-secondary-text-color': themeState.secondaryTextColor || '#757575',
      },
    };

    this.registerTheme(dynamicTheme);
    this.applyTheme('ha-dynamic');
  }

  // Utility methods
  getThemeVariable(variable: string): string {
    if (!this.element) return '';

    const computedStyle = getComputedStyle(this.element);
    return computedStyle.getPropertyValue(`--${variable}`).trim();
  }

  setCustomVariable(variable: string, value: string): void {
    this.customVariables[variable] = value;
    this.applyThemeToElement();
  }

  removeCustomVariable(variable: string): void {
    delete this.customVariables[variable];
    this.applyThemeToElement();
  }

  // Theme marketplace support (future enhancement)
  async loadThemeFromUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url);
      const themeJson = await response.text();
      return this.importTheme(themeJson);
    } catch (error) {
      console.error('Failed to load theme from URL:', error);
      return false;
    }
  }
}

// Export theme constants
export const DEFAULT_THEMES = {
  LIGHT: 'sak-light',
  DARK: 'sak-dark',
  MATERIAL_3: 'material-3',
  HIGH_CONTRAST: 'high-contrast',
  NEUMORPHIC: 'neumorphic',
} as const;

export default AdvancedThemeManager;
