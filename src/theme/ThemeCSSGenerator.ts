/*
 * ThemeCSSGenerator - Generates CSS from theme definitions
 * Creates optimized CSS custom properties and responsive rules
 */

import type { ThemeDefinition } from './AdvancedThemeManager.js';

export class ThemeCSSGenerator {
  // Generate complete CSS for a theme
  static generateThemeCSS(theme: ThemeDefinition): string {
    const css: string[] = [];

    // Theme comment header
    css.push(`/* ${theme.displayName} Theme */`);
    css.push(`/* ${theme.description || 'Custom SAK theme'} */`);
    css.push('');

    // Main theme variables
    css.push(`:root[data-theme="${theme.name}"], .sak-theme-${theme.name} {`);
    Object.entries(theme.variables).forEach(([property, value]) => {
      css.push(`  --${property}: ${value};`);
    });
    css.push('}');
    css.push('');

    // Light/dark mode variants
    if (theme.baseTheme === 'auto') {
      css.push(this.generateModeVariants(theme));
    }

    // Responsive variants
    if (theme.responsive) {
      css.push(this.generateResponsiveCSS(theme));
    }

    // Tool-specific overrides
    if (theme.tools) {
      css.push(this.generateToolOverrides(theme));
    }

    return css.join('\n');
  }

  // Generate CSS for multiple themes
  static generateMultipleThemes(themes: ThemeDefinition[]): string {
    return themes.map(theme => this.generateThemeCSS(theme)).join('\n\n');
  }

  // Generate mode variants for auto themes
  private static generateModeVariants(theme: ThemeDefinition): string {
    const css: string[] = [];

    // Light mode
    css.push(`@media (prefers-color-scheme: light) {`);
    css.push(`  :root[data-theme="${theme.name}"], .sak-theme-${theme.name} {`);
    css.push(`    color-scheme: light;`);
    // Add light-specific variables if needed
    css.push(`  }`);
    css.push(`}`);
    css.push('');

    // Dark mode
    css.push(`@media (prefers-color-scheme: dark) {`);
    css.push(`  :root[data-theme="${theme.name}"], .sak-theme-${theme.name} {`);
    css.push(`    color-scheme: dark;`);
    // Add dark-specific variables if needed
    css.push(`  }`);
    css.push(`}`);

    return css.join('\n');
  }

  // Generate responsive CSS
  private static generateResponsiveCSS(theme: ThemeDefinition): string {
    const css: string[] = [];

    if (theme.responsive?.mobile) {
      css.push(`@media (max-width: 767px) {`);
      css.push(`  .sak-theme-${theme.name} {`);
      Object.entries(theme.responsive.mobile).forEach(([property, value]) => {
        css.push(`    --${property}: ${value};`);
      });
      css.push(`  }`);
      css.push(`}`);
      css.push('');
    }

    if (theme.responsive?.tablet) {
      css.push(`@media (min-width: 768px) and (max-width: 1023px) {`);
      css.push(`  .sak-theme-${theme.name} {`);
      Object.entries(theme.responsive.tablet).forEach(([property, value]) => {
        css.push(`    --${property}: ${value};`);
      });
      css.push(`  }`);
      css.push(`}`);
      css.push('');
    }

    if (theme.responsive?.desktop) {
      css.push(`@media (min-width: 1024px) {`);
      css.push(`  .sak-theme-${theme.name} {`);
      Object.entries(theme.responsive.desktop).forEach(([property, value]) => {
        css.push(`    --${property}: ${value};`);
      });
      css.push(`  }`);
      css.push(`}`);
    }

    return css.join('\n');
  }

  // Generate tool-specific overrides
  private static generateToolOverrides(theme: ThemeDefinition): string {
    const css: string[] = [];

    css.push(`/* Tool-specific overrides for ${theme.displayName} */`);

    Object.entries(theme.tools!).forEach(([toolType, variables]) => {
      css.push(`.sak-theme-${theme.name} .sak-${toolType} {`);
      Object.entries(variables).forEach(([property, value]) => {
        css.push(`  --${property}: ${value};`);
      });
      css.push(`}`);
      css.push('');
    });

    return css.join('\n');
  }

  // Generate minimal CSS for performance
  static generateMinimalCSS(theme: ThemeDefinition): string {
    const essential = [
      'sak-primary-color',
      'sak-background-color',
      'sak-text-color',
      'sak-card-background-color',
    ];

    const css: string[] = [];
    css.push(`.sak-theme-${theme.name} {`);

    essential.forEach(property => {
      if (theme.variables[property]) {
        css.push(`  --${property}: ${theme.variables[property]};`);
      }
    });

    css.push(`}`);

    return css.join('\n');
  }

  // Generate CSS custom property declarations
  static generateCustomProperties(variables: Record<string, string>): string {
    return Object.entries(variables)
      .map(([property, value]) => `  --${property}: ${value};`)
      .join('\n');
  }

  // Generate theme preview CSS for UI
  static generatePreviewCSS(theme: ThemeDefinition): string {
    const primaryColor = theme.variables['sak-primary-color'] || '#2196F3';
    const backgroundColor = theme.variables['sak-background-color'] || '#FFFFFF';
    const textColor = theme.variables['sak-text-color'] || '#000000';

    return `
      .theme-preview-${theme.name} {
        background: ${backgroundColor};
        color: ${textColor};
        border: 2px solid ${primaryColor};
        border-radius: 8px;
        padding: 12px;
        min-height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .theme-preview-${theme.name}::before {
        content: '';
        position: absolute;
        top: 4px;
        right: 4px;
        width: 12px;
        height: 12px;
        background: ${primaryColor};
        border-radius: 50%;
      }
    `.trim();
  }

  // Utility methods
  static injectThemeCSS(css: string, id?: string): void {
    const styleId = id || 'sak-theme-styles';

    // Remove existing style element
    const existing = document.getElementById(styleId);
    if (existing) {
      existing.remove();
    }

    // Create new style element
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = css;
    document.head.appendChild(style);
  }

  static removeThemeCSS(id = 'sak-theme-styles'): void {
    const existing = document.getElementById(id);
    if (existing) {
      existing.remove();
    }
  }

  // Generate theme bundle for distribution
  static generateThemeBundle(themes: ThemeDefinition[]): {
    css: string;
    metadata: {
      themes: string[];
      version: string;
      generated: string;
    };
  } {
    const css = this.generateMultipleThemes(themes);

    return {
      css,
      metadata: {
        themes: themes.map(t => t.name),
        version: '3.0.0',
        generated: new Date().toISOString(),
      },
    };
  }
}

export default ThemeCSSGenerator;
