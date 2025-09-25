/*
 * ThemeService - Manages theme state and styling
 * Handles theme detection, color processing, and style generation
 */

import type { SakConfig, ThemeState } from '../types/SakTypes.js';

export class ThemeService {
  private theme: ThemeState | null = null;
  private hass: any = null;
  private config: SakConfig | null = null;
  private updateCallbacks: Set<(theme: ThemeState) => void> = new Set();
  private lastThemeMode: boolean | null = null;

  constructor() {
    // Initialize service
  }

  // Public API
  initialize(config: SakConfig, hass: any): void {
    this.hass = hass;
    this.config = config;
    this.updateTheme(hass, config);
  }

  updateTheme(hass: any, config: SakConfig): boolean {
    if (!hass) {
      return false;
    }

    const themeModeChanged = this.lastThemeMode !== hass.themes.darkMode;
    this.lastThemeMode = hass.themes.darkMode;

    this.hass = hass;
    this.config = config;

    // Create or update theme state
    const newTheme: ThemeState = {
      isDark: hass.themes.darkMode,
      primaryColor: this.getThemeVariable('primary-color'),
      accentColor: this.getThemeVariable('accent-color'),
      backgroundColor: this.getThemeVariable('background-color'),
      textColor: this.getThemeVariable('primary-text-color'),
      cardBackgroundColor: this.getThemeVariable('card-background-color'),
      primaryTextColor: this.getThemeVariable('primary-text-color'),
      secondaryTextColor: this.getThemeVariable('secondary-text-color'),
    };

    const themeChanged = !this.theme || this.theme.isDark !== newTheme.isDark;
    this.theme = newTheme;

    // Process custom theme if specified
    if (config.theme && hass.themes.themes[config.theme]) {
      this.processCustomTheme(hass.themes.themes[config.theme]);
    }

    // Process palette if specified
    if (config.palette) {
      this.processPalette(config.palette);
    }

    // Notify subscribers if theme changed
    if (themeChanged || themeModeChanged) {
      this.notifySubscribers();
    }

    return themeChanged || themeModeChanged;
  }

  getTheme(): ThemeState | null {
    return this.theme;
  }

  isDarkMode(): boolean {
    return this.theme?.isDark || false;
  }

  // Theme variable access
  getThemeVariable(name: string): string {
    if (!this.hass) {
      return '';
    }

    // Try to get from current theme
    const value = this.hass.themes.darkMode
      ? this.hass.themes.themes[this.hass.themes.selected_theme]?.dark?.[name]
      : this.hass.themes.themes[this.hass.themes.selected_theme]?.light?.[name];

    if (value) {
      return value;
    }

    // Fallback to default theme variables
    return this.getDefaultThemeVariable(name);
  }

  private getDefaultThemeVariable(name: string): string {
    const defaultVariables: Record<string, string> = {
      'primary-color': '#1976d2',
      'accent-color': '#ff4081',
      'background-color': '#fafafa',
      'text-color': '#212121',
      'card-background-color': '#ffffff',
      'primary-text-color': '#212121',
      'secondary-text-color': '#757575',
    };

    return defaultVariables[name] || '';
  }

  // Custom theme processing
  private processCustomTheme(theme: any): void {
    if (!theme || !this.theme) {
      return;
    }

    // Process light theme
    if (theme.light) {
      Object.assign(this.theme, theme.light);
    }

    // Process dark theme
    if (theme.dark && this.theme.isDark) {
      Object.assign(this.theme, theme.dark);
    }
  }

  // Palette processing
  private processPalette(palette: any): void {
    if (!palette || !this.theme) {
      return;
    }

    // Process palette colors
    // This would integrate with the existing Colors.js functionality
    // For now, we'll store the palette for later processing
    (this.theme as any).palette = palette;
  }

  // Color utilities
  getColorForMode(colorName: string): string {
    if (!this.theme) {
      return '';
    }

    // Try to get color from current theme mode
    const mode = this.theme.isDark ? 'dark' : 'light';
    return (this.theme as any)[mode]?.[colorName] || this.getThemeVariable(colorName);
  }

  getContrastColor(backgroundColor: string): string {
    // Simple contrast calculation
    // In a real implementation, this would use proper color contrast algorithms
    const rgb = this.hexToRgb(backgroundColor);
    if (!rgb) {
      return this.theme?.isDark ? '#ffffff' : '#000000';
    }

    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  // Style generation
  generateCardStyles(): Record<string, string> {
    if (!this.theme) {
      return {};
    }

    return {
      '--sak-primary-color': this.theme.primaryColor,
      '--sak-accent-color': this.theme.accentColor,
      '--sak-background-color': this.theme.backgroundColor,
      '--sak-text-color': this.theme.textColor,
      '--sak-card-background-color': this.theme.cardBackgroundColor,
      '--sak-primary-text-color': this.theme.primaryTextColor,
      '--sak-secondary-text-color': this.theme.secondaryTextColor,
    };
  }

  // Subscription management
  subscribe(callback: (theme: ThemeState) => void): () => void {
    this.updateCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.updateCallbacks.delete(callback);
    };
  }

  private notifySubscribers(): void {
    if (!this.theme) {
      return;
    }

    this.updateCallbacks.forEach(callback => {
      try {
        callback(this.theme!);
      } catch (error) {
        console.error('ThemeService: Error in subscriber callback', error);
      }
    });
  }

  // Cleanup
  disconnect(): void {
    this.updateCallbacks.clear();
    this.theme = null;
    this.hass = null;
    this.config = null;
    this.lastThemeMode = null;
  }
}
