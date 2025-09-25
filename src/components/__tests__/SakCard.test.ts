/*
 * SakCard Component Tests
 * Comprehensive unit tests for the main SAK card component
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { html, render } from 'lit';
import { SakCard } from '../SakCard.js';
import type { SakConfig } from '../../types/SakTypes.js';
import { mockHass } from '../../test/mocks/hassMock.js';

// Mock the services
vi.mock('../../services/EntityService.js', () => ({
  EntityService: vi.fn().mockImplementation(() => ({
    initialize: vi.fn(),
    updateEntities: vi.fn().mockReturnValue(false),
    getEntities: vi.fn().mockReturnValue([]),
    disconnect: vi.fn(),
  })),
}));

vi.mock('../../services/ThemeService.js', () => ({
  ThemeService: vi.fn().mockImplementation(() => ({
    initialize: vi.fn(),
    updateTheme: vi.fn().mockReturnValue(false),
    getTheme: vi.fn().mockReturnValue(null),
    disconnect: vi.fn(),
  })),
}));

vi.mock('../../services/ConfigService.js', () => ({
  ConfigService: vi.fn().mockImplementation(() => ({
    validateConfig: vi.fn().mockReturnValue({ isValid: true, errors: [], warnings: [] }),
    sanitizeConfig: vi.fn().mockImplementation((config) => config),
  })),
}));

vi.mock('../../toolsets/ToolsetManager.js', () => ({
  ToolsetManager: vi.fn().mockImplementation(() => ({
    initialize: vi.fn(),
    updateEntities: vi.fn(),
    updateTheme: vi.fn(),
    render: vi.fn().mockReturnValue(html``),
  })),
}));

vi.mock('../../utils/BrowserDetection.js', () => ({
  BrowserDetection: vi.fn().mockImplementation(() => ({
    isSafari: false,
    isiOS: false,
    isChrome: true,
    isFirefox: false,
    isEdge: false,
  })),
}));

describe('SakCard', () => {
  let card: SakCard;
  let container: HTMLElement;

  const basicConfig: SakConfig = {
    entities: [
      {
        entity: 'sensor.test_temperature',
        name: 'Test Temperature',
        icon: 'mdi:thermometer',
        unit: '°C',
      },
    ],
    layout: {
      toolsets: [
        {
          toolset: 'test-toolset',
          position: { cx: 50, cy: 50 },
          tools: [
            {
              type: 'circle',
              id: 'test-circle',
              position: { cx: 50, cy: 50 },
              entity_index: 0,
              color: '#ff0000',
              size: 20,
            },
          ],
        },
      ],
    },
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    card = new SakCard();
  });

  afterEach(() => {
    document.body.removeChild(container);
    card.remove();
  });

  describe('Component Initialization', () => {
    it('should create SakCard instance', () => {
      expect(card).toBeInstanceOf(SakCard);
      expect(card.tagName.toLowerCase()).toBe('swiss-army-knife-card');
    });

    it('should initialize with default values', () => {
      expect(card.config).toBeNull();
      expect(card.connected).toBe(false);
      expect(card.cardId).toBeTruthy();
    });

    it('should generate unique card ID', () => {
      const card2 = new SakCard();
      expect(card.cardId).not.toBe(card2.cardId);
      card2.remove();
    });
  });

  describe('Configuration', () => {
    it('should accept valid configuration', () => {
      expect(() => {
        card.setConfig(basicConfig);
      }).not.toThrow();

      expect(card.config).toEqual(basicConfig);
    });

    it('should reject invalid configuration', () => {
      const invalidConfig = { entities: [] } as any;

      // Mock validation to return invalid
      const ConfigService = require('../../services/ConfigService.js').ConfigService;
      const mockInstance = new ConfigService();
      mockInstance.validateConfig.mockReturnValue({
        isValid: false,
        errors: ['Missing layout configuration'],
        warnings: [],
      });

      expect(() => {
        card.setConfig(invalidConfig);
      }).toThrow('Invalid configuration: Missing layout configuration');
    });

    it('should handle configuration with development settings', () => {
      const configWithDev = {
        ...basicConfig,
        dev: {
          debug: true,
          performance: true,
          m3: false,
        },
      };

      card.setConfig(configWithDev);
      expect(card.config?.dev).toEqual(configWithDev.dev);
    });
  });

  describe('Home Assistant Integration', () => {
    beforeEach(() => {
      card.setConfig(basicConfig);
    });

    it('should handle hass updates when connected', () => {
      card.connected = true;
      const hass = mockHass();

      expect(() => {
        card.hass = hass;
      }).not.toThrow();
    });

    it('should ignore hass updates when not connected', () => {
      card.connected = false;
      const hass = mockHass();

      // Should not throw or process updates
      expect(() => {
        card.hass = hass;
      }).not.toThrow();
    });

    it('should ignore hass updates when no config', () => {
      card.connected = true;
      card.config = null;
      const hass = mockHass();

      // Should not throw or process updates
      expect(() => {
        card.hass = hass;
      }).not.toThrow();
    });
  });

  describe('Rendering', () => {
    it('should render error message when no config', () => {
      const result = card.render();
      expect(result).toBeTruthy();
    });

    it('should render card with configuration', () => {
      card.setConfig(basicConfig);
      const result = card.render();
      expect(result).toBeTruthy();
    });

    it('should handle rendering errors gracefully', () => {
      // Mock toolset manager to throw error
      const ToolsetManager = require('../../toolsets/ToolsetManager.js').ToolsetManager;
      const mockInstance = new ToolsetManager();
      mockInstance.render.mockImplementation(() => {
        throw new Error('Render error');
      });

      card.setConfig(basicConfig);
      
      // Should not throw, but handle error gracefully
      expect(() => {
        card.render();
      }).not.toThrow();
    });
  });

  describe('Lifecycle', () => {
    it('should handle connection lifecycle', () => {
      expect(card.connected).toBe(false);
      
      card.connectedCallback();
      expect(card.connected).toBe(true);
      
      card.disconnectedCallback();
      expect(card.connected).toBe(false);
    });

    it('should cleanup services on disconnect', () => {
      const EntityService = require('../../services/EntityService.js').EntityService;
      const ThemeService = require('../../services/ThemeService.js').ThemeService;
      
      const mockEntityService = new EntityService();
      const mockThemeService = new ThemeService();
      
      card.entityService = mockEntityService;
      card.themeService = mockThemeService;
      
      card.disconnectedCallback();
      
      expect(mockEntityService.disconnect).toHaveBeenCalled();
      expect(mockThemeService.disconnect).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle configuration errors', () => {
      const invalidConfig = { invalid: 'config' } as any;
      
      // Mock validation to fail
      const ConfigService = require('../../services/ConfigService.js').ConfigService;
      const mockInstance = new ConfigService();
      mockInstance.validateConfig.mockReturnValue({
        isValid: false,
        errors: ['Invalid configuration'],
        warnings: [],
      });

      expect(() => {
        card.setConfig(invalidConfig);
      }).toThrow('Invalid configuration: Invalid configuration');
    });

    it('should handle service initialization errors', () => {
      // Mock service to throw error
      const EntityService = require('../../services/EntityService.js').EntityService;
      EntityService.mockImplementation(() => {
        throw new Error('Service initialization error');
      });

      expect(() => {
        new SakCard();
      }).toThrow('Service initialization error');
    });
  });

  describe('Development Mode', () => {
    it('should enable debug logging when dev.debug is true', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const configWithDebug = {
        ...basicConfig,
        dev: { debug: true, performance: false, m3: false },
      };
      
      card.setConfig(configWithDebug);
      card.connected = true;
      card.hass = mockHass();
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should not log when dev.debug is false', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      card.setConfig(basicConfig);
      card.connected = true;
      card.hass = mockHass();
      
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
