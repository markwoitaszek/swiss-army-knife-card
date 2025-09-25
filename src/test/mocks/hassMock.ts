import { HomeAssistant } from 'home-assistant-js-websocket';

export const mockHass: Partial<HomeAssistant> = {
  states: {
    'sensor.temperature': {
      entity_id: 'sensor.temperature',
      state: '20',
      attributes: {
        unit_of_measurement: '°C',
        friendly_name: 'Temperature',
        device_class: 'temperature'
      },
      last_changed: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      context: {
        id: 'test-context',
        user_id: 'test-user',
        parent_id: null
      }
    },
    'sensor.humidity': {
      entity_id: 'sensor.humidity',
      state: '60',
      attributes: {
        unit_of_measurement: '%',
        friendly_name: 'Humidity',
        device_class: 'humidity'
      },
      last_changed: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      context: {
        id: 'test-context',
        user_id: 'test-user',
        parent_id: null
      }
    },
    'light.living_room': {
      entity_id: 'light.living_room',
      state: 'on',
      attributes: {
        friendly_name: 'Living Room Light',
        brightness: 255,
        color_temp: 370,
        rgb_color: [255, 255, 255]
      },
      last_changed: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      context: {
        id: 'test-context',
        user_id: 'test-user',
        parent_id: null
      }
    }
  },
  themes: {
    darkMode: false,
    themes: {
      default: {
        'primary-color': '#1976d2',
        'accent-color': '#dc004e',
        'card-background-color': '#ffffff',
        'primary-text-color': '#000000'
      }
    },
    defaultTheme: 'default'
  },
  config: {
    unit_system: 'metric',
    time_zone: 'UTC',
    language: 'en',
    country: 'US',
    currency: 'USD',
    elevation: 0,
    latitude: 0,
    longitude: 0,
    location_name: 'Home',
    version: '2024.1.0',
    config_source: 'storage'
  },
  callService: vi.fn(),
  callApi: vi.fn(),
  sendWS: vi.fn(),
  connection: {
    close: vi.fn(),
    sendMessage: vi.fn(),
    subscribeEvents: vi.fn(),
    subscribeMessage: vi.fn()
  } as any
};
