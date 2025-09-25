import '@testing-library/jest-dom';
import { afterEach } from 'vitest';

// Mock Home Assistant
(globalThis as any).hass = {
  states: {},
  themes: {
    darkMode: false,
    themes: {},
    defaultTheme: 'default',
  },
  config: {
    unit_system: 'metric',
    time_zone: 'UTC',
    language: 'en',
  },
  callService: vi.fn(),
  callApi: vi.fn(),
  // Add other HA properties as needed
} as any;

// Mock console methods to reduce noise in tests
(globalThis as any).console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Cleanup after each test
afterEach(() => {
  // Clean up any DOM elements created during tests
  document.body.innerHTML = '';
});
