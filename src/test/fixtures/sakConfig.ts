import { SakConfig } from '../../types/SakTypes';

export const basicConfig: SakConfig = {
  entities: [
    { entity: 'sensor.temperature' },
    { entity: 'sensor.humidity' }
  ],
  layout: {
    toolsets: [
      {
        toolset: 'main',
        position: { cx: 50, cy: 50 },
        tools: [
          {
            type: 'circle',
            id: 'temp',
            position: { cx: 50, cy: 50, radius: 20 },
            entity_index: 0
          }
        ]
      }
    ]
  }
};

export const complexConfig: SakConfig = {
  entities: [
    { entity: 'sensor.temperature', name: 'Temperature' },
    { entity: 'sensor.humidity', name: 'Humidity' },
    { entity: 'sensor.pressure', name: 'Pressure' },
    { entity: 'light.living_room', name: 'Living Room Light' }
  ],
  layout: {
    aspectratio: '16:9',
    styles: {
      '--sak-primary-color': '#1976d2',
      '--sak-secondary-color': '#dc004e'
    },
    toolsets: [
      {
        toolset: 'main',
        position: { cx: 50, cy: 50 },
        tools: [
          {
            type: 'circle',
            id: 'temp',
            position: { cx: 30, cy: 30, radius: 15 },
            entity_index: 0,
            color: 'blue'
          },
          {
            type: 'circle',
            id: 'humidity',
            position: { cx: 70, cy: 30, radius: 15 },
            entity_index: 1,
            color: 'green'
          },
          {
            type: 'rectangle',
            id: 'pressure',
            position: { cx: 30, cy: 70, width: 20, height: 10 },
            entity_index: 2,
            color: 'orange'
          },
          {
            type: 'switch',
            id: 'light',
            position: { cx: 70, cy: 70, width: 20, height: 10 },
            entity_index: 3
          }
        ]
      }
    ]
  }
};

export const invalidConfig = {
  // Missing required fields
  entities: [],
  layout: {
    toolsets: []
  }
};
