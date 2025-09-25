/*
 * EntityService Tests
 * Unit tests for entity state management service
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockHass } from '../../test/mocks/hassMock.js';
import type { SakConfig } from '../../types/SakTypes.js';
import { EntityService } from '../EntityService.js';

describe('EntityService', () => {
  let service: EntityService;
  let mockConfig: SakConfig;
  let mockHassInstance: any;

  beforeEach(() => {
    service = new EntityService();
    mockHassInstance = mockHass();

    mockConfig = {
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
      ],
      layout: {
        toolsets: [],
      },
    };
  });

  describe('Initialization', () => {
    it('should initialize with empty state', () => {
      expect(service.getEntities()).toEqual([]);
      expect(service.getEntityConfigs()).toEqual([]);
    });

    it('should initialize with configuration', () => {
      service.initialize(mockConfig, mockHassInstance);

      expect(service.getEntityConfigs()).toEqual(mockConfig.entities);
    });
  });

  describe('Entity Updates', () => {
    beforeEach(() => {
      service.initialize(mockConfig, mockHassInstance);
    });

    it('should update entities when hass changes', () => {
      const result = service.updateEntities(mockHassInstance, mockConfig);

      expect(result).toBe(true);
      expect(service.getEntities()).toHaveLength(2);
    });

    it('should not update if no changes detected', () => {
      // First update
      service.updateEntities(mockHassInstance, mockConfig);

      // Second update should return false (no changes)
      const result = service.updateEntities(mockHassInstance, mockConfig);
      expect(result).toBe(false);
    });

    it('should handle missing entities gracefully', () => {
      const configWithMissingEntity = {
        ...mockConfig,
        entities: [
          {
            entity: 'sensor.nonexistent',
            name: 'Nonexistent',
          },
        ],
      };

      expect(() => {
        service.updateEntities(mockHassInstance, configWithMissingEntity);
      }).not.toThrow();
    });

    it('should throttle updates', async () => {
      const startTime = Date.now();

      // Multiple rapid updates
      service.updateEntities(mockHassInstance, mockConfig);
      service.updateEntities(mockHassInstance, mockConfig);
      service.updateEntities(mockHassInstance, mockConfig);

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(200); // Should be throttled
    });
  });

  describe('Entity Access', () => {
    beforeEach(() => {
      service.initialize(mockConfig, mockHassInstance);
      service.updateEntities(mockHassInstance, mockConfig);
    });

    it('should get entity by ID', () => {
      const entity = service.getEntity('sensor.test_temperature');
      expect(entity).toBeTruthy();
      expect(entity?.entity_id).toBe('sensor.test_temperature');
    });

    it('should return undefined for non-existent entity', () => {
      const entity = service.getEntity('sensor.nonexistent');
      expect(entity).toBeUndefined();
    });

    it('should get entity by index', () => {
      const entity = service.getEntityByIndex(0);
      expect(entity).toBeTruthy();
      expect(entity?.entity_id).toBe('sensor.test_temperature');
    });

    it('should return undefined for invalid index', () => {
      const entity = service.getEntityByIndex(999);
      expect(entity).toBeUndefined();
    });

    it('should get all entities', () => {
      const entities = service.getEntities();
      expect(entities).toHaveLength(2);
      expect(entities[0].entity_id).toBe('sensor.test_temperature');
      expect(entities[1].entity_id).toBe('light.test_light');
    });
  });

  describe('Entity Utilities', () => {
    beforeEach(() => {
      service.initialize(mockConfig, mockHassInstance);
      service.updateEntities(mockHassInstance, mockConfig);
    });

    it('should get entity value', () => {
      const value = service.getEntityValue('sensor.test_temperature');
      expect(value).toBe('21.5');
    });

    it('should get entity attribute', () => {
      const unit = service.getEntityAttribute('sensor.test_temperature', 'unit_of_measurement');
      expect(unit).toBe('°C');
    });

    it('should get entity icon', () => {
      const icon = service.getEntityIcon('sensor.test_temperature');
      expect(icon).toBe('mdi:thermometer');
    });

    it('should get entity name', () => {
      const name = service.getEntityName('sensor.test_temperature');
      expect(name).toBe('Test Temperature');
    });

    it('should get entity unit', () => {
      const unit = service.getEntityUnit('sensor.test_temperature');
      expect(unit).toBe('°C');
    });

    it('should check entity availability', () => {
      expect(service.isEntityAvailable('sensor.test_temperature')).toBe(true);
      expect(service.isEntityAvailable('sensor.nonexistent')).toBe(false);
    });

    it('should check entity state', () => {
      expect(service.isEntityOn('light.test_light')).toBe(true);
      expect(service.isEntityOff('sensor.test_temperature')).toBe(false);
    });

    it('should get entity domain', () => {
      expect(service.getEntityDomain('sensor.test_temperature')).toBe('sensor');
      expect(service.getEntityDomain('light.test_light')).toBe('light');
    });

    it('should check entity domain', () => {
      expect(service.isEntityDomain('sensor.test_temperature', 'sensor')).toBe(true);
      expect(service.isEntityDomain('light.test_light', 'sensor')).toBe(false);
    });
  });

  describe('State Formatting', () => {
    beforeEach(() => {
      service.initialize(mockConfig, mockHassInstance);
      service.updateEntities(mockHassInstance, mockConfig);
    });

    it('should format entity state', () => {
      const formatted = service.formatEntityState('sensor.test_temperature');
      expect(formatted).toBe('21.5');
    });

    it('should format entity state with custom attribute', () => {
      const configWithAttribute = {
        ...mockConfig,
        entities: [
          {
            entity: 'sensor.test_temperature',
            attribute: 'unit_of_measurement',
          },
        ],
      };

      service.initialize(configWithAttribute, mockHassInstance);
      service.updateEntities(mockHassInstance, configWithAttribute);

      const formatted = service.formatEntityState(
        'sensor.test_temperature',
        configWithAttribute.entities[0]
      );
      expect(formatted).toBe('°C');
    });

    it('should format entity state with secondary info', () => {
      const configWithSecondaryInfo = {
        ...mockConfig,
        entities: [
          {
            entity: 'sensor.test_temperature',
            secondary_info: 'unit_of_measurement',
          },
        ],
      };

      service.initialize(configWithSecondaryInfo, mockHassInstance);
      service.updateEntities(mockHassInstance, configWithSecondaryInfo);

      const formatted = service.formatEntityState(
        'sensor.test_temperature',
        configWithSecondaryInfo.entities[0]
      );
      expect(formatted).toBe('°C');
    });

    it('should handle undefined values', () => {
      const formatted = service.formatEntityState('sensor.nonexistent');
      expect(formatted).toBe('Unknown');
    });
  });

  describe('Service Calls', () => {
    beforeEach(() => {
      service.initialize(mockConfig, mockHassInstance);
    });

    it('should call service', async () => {
      const mockCallService = vi.fn().mockResolvedValue(undefined);
      service['hass'] = { callService: mockCallService };

      await service.callService('homeassistant', 'toggle', { entity_id: 'light.test_light' });

      expect(mockCallService).toHaveBeenCalledWith('homeassistant', 'toggle', {
        entity_id: 'light.test_light',
      });
    });

    it('should toggle entity', async () => {
      const mockCallService = vi.fn().mockResolvedValue(undefined);
      service['hass'] = { callService: mockCallService };

      await service.toggleEntity('light.test_light');

      expect(mockCallService).toHaveBeenCalledWith('homeassistant', 'toggle', {
        entity_id: 'light.test_light',
      });
    });

    it('should turn on entity', async () => {
      const mockCallService = vi.fn().mockResolvedValue(undefined);
      service['hass'] = { callService: mockCallService };

      await service.turnOnEntity('light.test_light', { brightness: 255 });

      expect(mockCallService).toHaveBeenCalledWith('light', 'turn_on', {
        entity_id: 'light.test_light',
        brightness: 255,
      });
    });

    it('should turn off entity', async () => {
      const mockCallService = vi.fn().mockResolvedValue(undefined);
      service['hass'] = { callService: mockCallService };

      await service.turnOffEntity('light.test_light');

      expect(mockCallService).toHaveBeenCalledWith('light', 'turn_off', {
        entity_id: 'light.test_light',
      });
    });

    it('should handle service call errors', async () => {
      const mockCallService = vi.fn().mockRejectedValue(new Error('Service error'));
      service['hass'] = { callService: mockCallService };

      await expect(service.callService('homeassistant', 'toggle')).rejects.toThrow('Service error');
    });

    it('should throw error when no hass connection', async () => {
      service['hass'] = null;

      await expect(service.callService('homeassistant', 'toggle')).rejects.toThrow(
        'No Home Assistant connection available'
      );
    });
  });

  describe('Subscriptions', () => {
    it('should subscribe to entity updates', () => {
      const callback = vi.fn();
      const unsubscribe = service.subscribe(callback);

      expect(typeof unsubscribe).toBe('function');

      // Trigger update
      service.updateEntities(mockHassInstance, mockConfig);

      expect(callback).toHaveBeenCalled();
    });

    it('should unsubscribe from entity updates', () => {
      const callback = vi.fn();
      const unsubscribe = service.subscribe(callback);

      unsubscribe();

      // Trigger update
      service.updateEntities(mockHassInstance, mockConfig);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });

      service.subscribe(errorCallback);

      // Should not throw
      expect(() => {
        service.updateEntities(mockHassInstance, mockConfig);
      }).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    it('should disconnect and cleanup', () => {
      service.initialize(mockConfig, mockHassInstance);
      service.subscribe(vi.fn());

      service.disconnect();

      expect(service.getEntities()).toEqual([]);
      expect(service.getEntityConfigs()).toEqual([]);
      expect(service['hass']).toBeNull();
    });
  });
});
