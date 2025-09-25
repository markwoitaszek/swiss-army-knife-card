/*
 * Test Helpers and Utilities
 * Common utilities for testing the SAK Card
 */

import type { EntityState, SakConfig, ToolConfig, ToolsetConfig } from '../../types/SakTypes.js';
import { mockHass } from '../mocks/hassMock.js';

/**
 * Create a basic SAK configuration for testing
 */
export function createBasicConfig(): SakConfig {
  return {
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
}

/**
 * Create a complex SAK configuration for testing
 */
export function createComplexConfig(): SakConfig {
  return {
    entities: [
      {
        entity: 'sensor.test_temperature',
        name: 'Test Temperature',
        icon: 'mdi:thermometer',
        unit: '°C',
      },
      {
        entity: 'light.test_light',
        name: 'Test Light',
        icon: 'mdi:lightbulb',
      },
      {
        entity: 'switch.test_switch',
        name: 'Test Switch',
        icon: 'mdi:toggle-switch',
      },
    ],
    layout: {
      toolsets: [
        {
          toolset: 'temperature-toolset',
          position: { cx: 25, cy: 25 },
          scale: { x: 1.5, y: 1.5 },
          tools: [
            {
              type: 'circle',
              id: 'temp-circle',
              position: { cx: 50, cy: 50 },
              entity_index: 0,
              color: '#ff0000',
              size: 30,
            },
            {
              type: 'text',
              id: 'temp-text',
              position: { cx: 50, cy: 50 },
              entity_index: 0,
              color: '#000000',
              size: 14,
            },
          ],
        },
        {
          toolset: 'light-toolset',
          position: { cx: 75, cy: 25 },
          rotation: { angle: 45 },
          tools: [
            {
              type: 'rectangle',
              id: 'light-rect',
              position: { cx: 50, cy: 50 },
              entity_index: 1,
              color: '#ffff00',
              width: 40,
              height: 20,
            },
          ],
        },
        {
          toolset: 'switch-toolset',
          position: { cx: 50, cy: 75 },
          tools: [
            {
              type: 'switch',
              id: 'test-switch',
              position: { cx: 50, cy: 50 },
              entity_index: 2,
              color: '#00ff00',
              size: 25,
            },
          ],
        },
      ],
    },
    aspectratio: '16/9',
    theme: 'custom-theme',
    dev: {
      debug: true,
      performance: true,
      m3: false,
    },
  };
}

/**
 * Create a minimal SAK configuration for testing
 */
export function createMinimalConfig(): SakConfig {
  return {
    entities: [
      {
        entity: 'sensor.minimal',
      },
    ],
    layout: {
      toolsets: [],
    },
  };
}

/**
 * Create an invalid SAK configuration for testing error handling
 */
export function createInvalidConfig(): any {
  return {
    // Missing required properties
    entities: 'invalid',
    layout: null,
  };
}

/**
 * Create a tool configuration for testing
 */
export function createToolConfig(overrides: Partial<ToolConfig> = {}): ToolConfig {
  return {
    type: 'circle',
    id: 'test-tool',
    position: { cx: 50, cy: 50 },
    entity_index: 0,
    color: '#ff0000',
    size: 20,
    ...overrides,
  };
}

/**
 * Create a toolset configuration for testing
 */
export function createToolsetConfig(overrides: Partial<ToolsetConfig> = {}): ToolsetConfig {
  return {
    toolset: 'test-toolset',
    position: { cx: 50, cy: 50 },
    tools: [createToolConfig()],
    ...overrides,
  };
}

/**
 * Create entity states for testing
 */
export function createEntityStates(): EntityState[] {
  return [
    {
      entity_id: 'sensor.test_temperature',
      state: '21.5',
      attributes: {
        unit_of_measurement: '°C',
        friendly_name: 'Test Temperature',
        icon: 'mdi:thermometer',
      },
      last_changed: '2023-01-01T00:00:00Z',
      last_updated: '2023-01-01T00:00:00Z',
      context: {
        id: 'test-context-1',
        user_id: null,
        parent_id: null,
      },
    },
    {
      entity_id: 'light.test_light',
      state: 'on',
      attributes: {
        brightness: 255,
        friendly_name: 'Test Light',
        icon: 'mdi:lightbulb',
      },
      last_changed: '2023-01-01T00:00:00Z',
      last_updated: '2023-01-01T00:00:00Z',
      context: {
        id: 'test-context-2',
        user_id: null,
        parent_id: null,
      },
    },
    {
      entity_id: 'switch.test_switch',
      state: 'off',
      attributes: {
        friendly_name: 'Test Switch',
        icon: 'mdi:toggle-switch',
      },
      last_changed: '2023-01-01T00:00:00Z',
      last_updated: '2023-01-01T00:00:00Z',
      context: {
        id: 'test-context-3',
        user_id: null,
        parent_id: null,
      },
    },
  ];
}

/**
 * Create a mock Home Assistant instance for testing
 */
export function createMockHass(overrides: any = {}) {
  return {
    ...mockHass(),
    ...overrides,
  };
}

/**
 * Wait for a condition to be true
 */
export function waitFor(condition: () => boolean, timeout: number = 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Timeout waiting for condition after ${timeout}ms`));
      } else {
        setTimeout(check, 10);
      }
    };

    check();
  });
}

/**
 * Create a mock DOM element for testing
 */
export function createMockElement(
  tagName: string = 'div',
  attributes: Record<string, string> = {}
): HTMLElement {
  const element = document.createElement(tagName);

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
}

/**
 * Create a mock event for testing
 */
export function createMockEvent(type: string, options: any = {}): Event {
  const event = new Event(type, {
    bubbles: true,
    cancelable: true,
    ...options,
  });

  // Add any additional properties
  Object.assign(event, options);

  return event;
}

/**
 * Create a mock mouse event for testing
 */
export function createMockMouseEvent(type: string, options: any = {}): MouseEvent {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options,
  });
}

/**
 * Create a mock touch event for testing
 */
export function createMockTouchEvent(type: string, options: any = {}): TouchEvent {
  return new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options,
  });
}

/**
 * Mock console methods for testing
 */
export function mockConsole() {
  const originalConsole = { ...console };

  const mockConsole = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };

  Object.assign(console, mockConsole);

  return {
    mockConsole,
    restore: () => Object.assign(console, originalConsole),
  };
}

/**
 * Create a test environment with all necessary mocks
 */
export function createTestEnvironment() {
  const mockConsoleInstance = mockConsole();

  return {
    config: createBasicConfig(),
    complexConfig: createComplexConfig(),
    minimalConfig: createMinimalConfig(),
    invalidConfig: createInvalidConfig(),
    entityStates: createEntityStates(),
    hass: createMockHass(),
    mockConsole: mockConsoleInstance.mockConsole,
    cleanup: () => {
      mockConsoleInstance.restore();
    },
  };
}

/**
 * Assert that a function throws an error with a specific message
 */
export function expectToThrow(fn: () => void, expectedMessage?: string): void {
  try {
    fn();
    throw new Error('Expected function to throw an error');
  } catch (error) {
    if (expectedMessage && !error.message.includes(expectedMessage)) {
      throw new Error(
        `Expected error message to contain "${expectedMessage}", but got "${error.message}"`
      );
    }
  }
}

/**
 * Assert that a promise rejects with a specific message
 */
export async function expectToReject(
  promise: Promise<any>,
  expectedMessage?: string
): Promise<void> {
  try {
    await promise;
    throw new Error('Expected promise to reject');
  } catch (error) {
    if (expectedMessage && !error.message.includes(expectedMessage)) {
      throw new Error(
        `Expected error message to contain "${expectedMessage}", but got "${error.message}"`
      );
    }
  }
}

/**
 * Create a test fixture with common setup
 */
export function createTestFixture() {
  let container: HTMLElement;

  const setup = () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    return container;
  };

  const teardown = () => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  return {
    setup,
    teardown,
    getContainer: () => container,
  };
}

// Import vi for mocking (if using Vitest)
declare const vi: any;
