/*
 * ThemeService Tests
 * Unit tests for theme management service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeService } from '../ThemeService.js';
import type { SakConfig } from '../../types/SakTypes.js';
import { mockHass } from '../../test/mocks/hassMock.js';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockConfig: SakConfig;
  let mockHassInstance: any;

  beforeEach(() => {
    service = new ThemeService();
    mockHassInstance = mockHass();
    
    mockConfig = {
      entities: [
        {
          entity: 'sensor.test_temperature',
          name: 'Test Temperature',
        },
      ],
      layout: {
        toolsets: [],
      },
    };
  });

  describe('Initialization', () => {
    it('should initialize with null theme', () => {
      expect(service.getTheme()).toBeNull();
      expect(service.isDarkMode()).toBe(false);
    });

    it('should initialize with configuration', () => {
      service.initialize(mockConfig, mockHassInstance);
      
      expect(service.getTheme()).toBeTruthy();
    });
  });

  describe('Theme Updates', () => {
    beforeEach(() => {
      service.initialize(mockConfig, mockHassInstance);
    });

    it('should update theme when hass changes', () => {
      const result = service.updateTheme(mockHassInstance, mockConfig);
      
      expect(result).toBe(true);
      expect(service.getTheme()).toBeTruthy();
    });

    it('should detect theme mode changes', () => {
      // First update
      service.updateTheme(mockHassInstance, mockConfig);
      
      // Change theme mode
      const lightModeHass = {
        ...mockHassInstance,
        themes: {
          ...mockHassInstance.themes,
          darkMode: false,
        },
      };
      
      const result = service.updateTheme(lightModeHass, mockConfig);
      expect(result).toBe(true);
      expect(service.isDarkMode()).toBe(false);
    });

    it('should handle missing hass gracefully', () => {
      expect(() => {
        service.updateTheme(null, mockConfig);
      }).not.toThrow();
    });

    it('should process custom theme if specified', () => {
      const configWithTheme = {
        ...mockConfig,
        theme: 'custom-theme',
      };
      
      const hassWithCustomTheme = {
        ...mockHassInstance,
        themes: {
          ...mockHassInstance.themes,
          themes: {
            'custom-theme': {
              light: {
                'primary-color': '#custom-light-primary',
              },
              dark: {
                'primary-color': '#custom-dark-primary',
              },
            },
          },
        },
      };
      
      expect(() => {
        service.updateTheme(hassWithCustomTheme, configWithTheme);
      }).not.toThrow();
    });

    it('should process palette if specified', () => {
      const configWithPalette = {
        ...mockConfig,
        palette: {
          light: {
            'primary': '#palette-light-primary',
          },
          dark: {
            'primary': '#palette-dark-primary',
          },
        },
      };
      
      expect(() => {
        service.updateTheme(mockHassInstance, configWithPalette);
      }).not.toThrow();
    });
  });

  describe('Theme Variable Access', () => {
    beforeEach(() => {
      service.initialize(mockConfig, mockHassInstance);
      service.updateTheme(mockHassInstance, mockConfig);
    });

    it('should get theme variable', () => {
      const primaryColor = service.getThemeVariable('primary-color');
      expect(primaryColor).toBeTruthy();
    });

    it('should return empty string for non-existent variable', () => {
      const nonExistent = service.getThemeVariable('non-existent-variable');
      expect(nonExistent).toBe('');
    });

    it('should get default theme variable when not in theme', () => {
      const primaryColor = service.getThemeVariable('primary-color');
      expect(primaryColor).toBe('#1976d2'); // Default value
    });
  });

  describe('Color Utilities', () => {
    beforeEach(() => {
      service.initialize(mockConfig, mockHassInstance);
      service.updateTheme(mockHassInstance, mockConfig);
    });

    it('should get color for current mode', () => {
      const color = service.getColorForMode('primary-color');
      expect(color).toBeTruthy();
    });

    it('should return empty string for non-existent color', () => {
      const color = service.getColorForMode('non-existent-color');
      expect(color).toBe('');
    });

    it('should get contrast color for light background', () => {
      const contrastColor = service.getContrastColor('#ffffff');
      expect(contrastColor).toBe('#000000');
    });

    it('should get contrast color for dark background', () => {
      const contrastColor = service.getContrastColor('#000000');
      expect(contrastColor).toBe('#ffffff');
    });

    it('should handle invalid hex color', () => {
      const contrastColor = service.getContrastColor('invalid-color');
      expect(contrastColor).toBe('#000000'); // Default fallback
    });
  });

  describe('Style Generation', () => {
    beforeEach(() => {
      service.initialize(mockConfig, mockHassInstance);
      service.updateTheme(mockHassInstance, mockConfig);
    });

    it('should generate card styles', () => {
      const styles = service.generateCardStyles();
      
      expect(styles).toHaveProperty('--sak-primary-color');
      expect(styles).toHaveProperty('--sak-accent-color');
      expect(styles).toHaveProperty('--sak-background-color');
      expect(styles).toHaveProperty('--sak-text-color');
      expect(styles).toHaveProperty('--sak-card-background-color');
      expect(styles).toHaveProperty('--sak-primary-text-color');
      expect(styles).toHaveProperty('--sak-secondary-text-color');
    });

    it('should return empty object when no theme', () => {
      service['theme'] = null;
      const styles = service.generateCardStyles();
      expect(styles).toEqual({});
    });
  });

  describe('Subscriptions', () => {
    it('should subscribe to theme updates', () => {
      const callback = vi.fn();
      const unsubscribe = service.subscribe(callback);
      
      expect(typeof unsubscribe).toBe('function');
      
      // Trigger update
      service.updateTheme(mockHassInstance, mockConfig);
      
      expect(callback).toHaveBeenCalled();
    });

    it('should unsubscribe from theme updates', () => {
      const callback = vi.fn();
      const unsubscribe = service.subscribe(callback);
      
      unsubscribe();
      
      // Trigger update
      service.updateTheme(mockHassInstance, mockConfig);
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });
      
      service.subscribe(errorCallback);
      
      // Should not throw
      expect(() => {
        service.updateTheme(mockHassInstance, mockConfig);
      }).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    it('should disconnect and cleanup', () => {
      service.initialize(mockConfig, mockHassInstance);
      service.subscribe(vi.fn());
      
      service.disconnect();
      
      expect(service.getTheme()).toBeNull();
      expect(service['hass']).toBeNull();
      expect(service['config']).toBeNull();
      expect(service['lastThemeMode']).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle hass without themes', () => {
      const hassWithoutThemes = {
        ...mockHassInstance,
        themes: null,
      };
      
      expect(() => {
        service.updateTheme(hassWithoutThemes, mockConfig);
      }).not.toThrow();
    });

    it('should handle theme without light/dark modes', () => {
      const hassWithIncompleteTheme = {
        ...mockHassInstance,
        themes: {
          darkMode: true,
          selected_theme: 'incomplete-theme',
          themes: {
            'incomplete-theme': {
              // Missing light/dark properties
            },
          },
        },
      };
      
      expect(() => {
        service.updateTheme(hassWithIncompleteTheme, mockConfig);
      }).not.toThrow();
    });

    it('should handle null theme state', () => {
      service['theme'] = null;
      
      expect(service.isDarkMode()).toBe(false);
      expect(service.getColorForMode('primary-color')).toBe('');
      expect(service.generateCardStyles()).toEqual({});
    });
  });
});
