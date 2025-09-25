import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/lit';
import { afterEach } from 'vitest';

// Mock Home Assistant
global.hass = {
  states: {},
  themes: {
    darkMode: false,
    themes: {},
    defaultTheme: 'default'
  },
  config: {
    unit_system: 'metric',
    time_zone: 'UTC',
    language: 'en'
  },
  callService: vi.fn(),
  callApi: vi.fn(),
  // Add other HA properties as needed
} as any;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

afterEach(() => {
  cleanup();
});
