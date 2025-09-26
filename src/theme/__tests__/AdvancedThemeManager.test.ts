import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdvancedThemeManager, DEFAULT_THEMES } from '../AdvancedThemeManager.js';
import type { ThemeDefinition } from '../AdvancedThemeManager.js';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('AdvancedThemeManager', () => {
  let themeManager: AdvancedThemeManager;
  let mockElement: HTMLElement;

  beforeEach(() => {
    // Create mock element
    mockElement = document.createElement('div');
    mockElement.style.setProperty = vi.fn();
    mockElement.classList = {
      add: vi.fn(),
      remove: vi.fn(),
    } as any;

    themeManager = new AdvancedThemeManager(mockElement);
  });

  it('should create theme manager instance', () => {
    expect(themeManager).toBeInstanceOf(AdvancedThemeManager);
  });

  it('should register default themes', () => {
    const themes = themeManager.getAllThemes();
    expect(themes.length).toBeGreaterThan(0);

    expect(themeManager.getTheme(DEFAULT_THEMES.LIGHT)).toBeTruthy();
    expect(themeManager.getTheme(DEFAULT_THEMES.DARK)).toBeTruthy();
    expect(themeManager.getTheme(DEFAULT_THEMES.MATERIAL_3)).toBeTruthy();
    expect(themeManager.getTheme(DEFAULT_THEMES.HIGH_CONTRAST)).toBeTruthy();
    expect(themeManager.getTheme(DEFAULT_THEMES.NEUMORPHIC)).toBeTruthy();
  });

  it('should register custom themes', () => {
    const customTheme: ThemeDefinition = {
      name: 'custom-test',
      displayName: 'Custom Test Theme',
      baseTheme: 'light',
      variables: {
        'sak-primary-color': '#FF5722',
        'sak-background-color': '#FFFFFF',
        'sak-text-color': '#000000',
      },
    };

    themeManager.registerTheme(customTheme);
    const retrieved = themeManager.getTheme('custom-test');

    expect(retrieved).toEqual(customTheme);
  });

  it('should filter themes by base theme', () => {
    const lightThemes = themeManager.getThemesByBase('light');
    const darkThemes = themeManager.getThemesByBase('dark');

    expect(lightThemes.length).toBeGreaterThan(0);
    expect(darkThemes.length).toBeGreaterThan(0);

    lightThemes.forEach(theme => {
      expect(theme.baseTheme).toBe('light');
    });

    darkThemes.forEach(theme => {
      expect(theme.baseTheme).toBe('dark');
    });
  });

  it('should apply themes to element', () => {
    const success = themeManager.applyTheme(DEFAULT_THEMES.LIGHT);
    expect(success).toBe(true);

    // Should call setProperty for each variable
    expect(mockElement.style.setProperty).toHaveBeenCalled();

    // Should add theme classes
    expect(mockElement.classList.add).toHaveBeenCalledWith('sak-theme-light');
    expect(mockElement.classList.add).toHaveBeenCalledWith(`sak-theme-${DEFAULT_THEMES.LIGHT}`);
  });

  it('should handle unknown themes gracefully', () => {
    const success = themeManager.applyTheme('unknown-theme');
    expect(success).toBe(false);
  });

  it('should validate theme definitions', () => {
    const validTheme: ThemeDefinition = {
      name: 'valid-theme',
      displayName: 'Valid Theme',
      baseTheme: 'light',
      variables: {
        'sak-primary-color': '#2196F3',
        'sak-background-color': '#FFFFFF',
        'sak-text-color': '#000000',
      },
    };

    const validation = themeManager.validateTheme(validTheme);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should detect invalid theme definitions', () => {
    const invalidTheme: ThemeDefinition = {
      name: '',
      displayName: '',
      baseTheme: 'light',
      variables: {
        'sak-primary-color': 'invalid-color',
      },
    };

    const validation = themeManager.validateTheme(invalidTheme);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);

    expect(validation.errors.some(e => e.includes('Theme name is required'))).toBe(true);
    expect(validation.errors.some(e => e.includes('display name is required'))).toBe(true);
    expect(validation.errors.some(e => e.includes('Invalid color format'))).toBe(true);
  });

  it('should generate themes from colors', () => {
    const generated = themeManager.generateThemeFromColors(
      'generated-test',
      'Generated Test',
      '#E91E63',
      'light'
    );

    expect(generated.name).toBe('generated-test');
    expect(generated.displayName).toBe('Generated Test');
    expect(generated.variables['sak-primary-color']).toBe('#E91E63');
    expect(generated.baseTheme).toBe('light');

    // Should have all required variables
    expect(generated.variables['sak-background-color']).toBeTruthy();
    expect(generated.variables['sak-text-color']).toBeTruthy();
  });

  it('should create theme variants', () => {
    const variant = themeManager.createThemeVariant(
      DEFAULT_THEMES.LIGHT,
      'light-blue',
      'Light Blue Variant',
      {
        'sak-primary-color': '#2196F3',
        'sak-accent-color': '#03DAC6',
      }
    );

    expect(variant).toBeTruthy();
    expect(variant!.name).toBe('light-blue');
    expect(variant!.displayName).toBe('Light Blue Variant');
    expect(variant!.variables['sak-primary-color']).toBe('#2196F3');
    expect(variant!.variables['sak-accent-color']).toBe('#03DAC6');

    // Should inherit other variables from base theme
    const baseTheme = themeManager.getTheme(DEFAULT_THEMES.LIGHT);
    expect(variant!.variables['sak-background-color']).toBe(
      baseTheme!.variables['sak-background-color']
    );
  });

  it('should export and import themes', () => {
    const lightTheme = themeManager.getTheme(DEFAULT_THEMES.LIGHT);
    const exported = themeManager.exportTheme(DEFAULT_THEMES.LIGHT);

    expect(exported).toBeTruthy();
    expect(exported).toContain(lightTheme!.name);
    expect(exported).toContain(lightTheme!.displayName);

    // Should be able to import back
    const imported = themeManager.importTheme(exported!);
    expect(imported).toBe(true);
  });

  it('should handle invalid theme imports', () => {
    const invalidJson = '{ invalid json }';
    const imported = themeManager.importTheme(invalidJson);
    expect(imported).toBe(false);
  });

  it('should set and get mode correctly', () => {
    themeManager.setMode('dark');
    expect(themeManager.getMode()).toBe('dark');

    themeManager.setMode('light');
    expect(themeManager.getMode()).toBe('light');
  });

  it('should handle custom variables', () => {
    themeManager.applyTheme(DEFAULT_THEMES.LIGHT);

    themeManager.setCustomVariable('sak-custom-color', '#FF5722');
    // Custom variable should be applied
    expect(mockElement.style.setProperty).toHaveBeenCalledWith('--sak-custom-color', '#FF5722');

    themeManager.removeCustomVariable('sak-custom-color');
    // Should trigger re-application without the custom variable
  });

  it('should validate color formats', () => {
    const validColors = [
      '#FF5722',
      '#fff',
      '#FF572299',
      'rgb(255, 87, 34)',
      'rgba(255, 87, 34, 0.5)',
      'hsl(14, 100%, 57%)',
      'var(--primary-color)',
      'transparent',
    ];

    validColors.forEach(color => {
      expect((themeManager as any).isValidColor(color)).toBe(true);
    });

    const invalidColors = [
      'invalid',
      '#gg5722',
      'rgb(300, 87, 34)', // Invalid RGB values would need more complex validation
      'not-a-color',
    ];

    invalidColors.forEach(color => {
      expect((themeManager as any).isValidColor(color)).toBe(false);
    });
  });

  it('should handle responsive theme variables', () => {
    const responsiveTheme: ThemeDefinition = {
      name: 'responsive-test',
      displayName: 'Responsive Test',
      baseTheme: 'light',
      variables: {
        'sak-primary-color': '#2196F3',
        'sak-background-color': '#FFFFFF',
        'sak-text-color': '#000000',
      },
      responsive: {
        mobile: {
          'sak-font-size': '12px',
        },
        desktop: {
          'sak-font-size': '16px',
        },
      },
    };

    themeManager.registerTheme(responsiveTheme);
    themeManager.applyTheme('responsive-test');

    // Should apply responsive variables based on screen size
    expect(mockElement.style.setProperty).toHaveBeenCalled();
  });

  it('should update from Home Assistant theme state', () => {
    const mockThemeState = {
      isDark: true,
      primaryColor: '#BB86FC',
      accentColor: '#03DAC6',
      backgroundColor: '#121212',
      cardBackgroundColor: '#1F1F1F',
      textColor: '#FFFFFF',
      primaryTextColor: '#FFFFFF',
      secondaryTextColor: '#B0B0B0',
    };

    themeManager.updateFromThemeState(mockThemeState);

    expect(themeManager.getMode()).toBe('dark');
    expect(themeManager.getTheme('ha-dynamic')).toBeTruthy();

    const dynamicTheme = themeManager.getTheme('ha-dynamic');
    expect(dynamicTheme!.variables['sak-primary-color']).toBe('#BB86FC');
  });

  it('should handle theme preview with timeout', async () => {
    themeManager.applyTheme(DEFAULT_THEMES.LIGHT);

    // Start preview
    themeManager.previewTheme(DEFAULT_THEMES.DARK, 100);

    // Should immediately switch to dark theme
    expect(mockElement.classList.add).toHaveBeenCalledWith('sak-theme-dark');

    // Wait for preview to end
    await new Promise(resolve => setTimeout(resolve, 150));

    // Should switch back to light theme
    expect(mockElement.classList.add).toHaveBeenCalledWith('sak-theme-light');
  });
});
