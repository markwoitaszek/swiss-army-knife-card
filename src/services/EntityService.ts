/*
 * EntityService - Manages entity state and updates
 * Handles entity data fetching, caching, and change detection
 */

import type { EntityState, SakConfig, EntityConfig } from '../types/SakTypes.js';

export class EntityService {
  private entities: Map<string, EntityState> = new Map();
  private entityConfigs: EntityConfig[] = [];
  private hass: any = null;
  private updateCallbacks: Set<(entities: EntityState[]) => void> = new Set();
  private lastUpdateTime: number = 0;
  private updateInterval: number = 100; // Minimum time between updates (ms)

  constructor() {
    // Initialize service
  }

  // Public API
  initialize(config: SakConfig, hass: any): void {
    this.hass = hass;
    this.entityConfigs = config.entities || [];
    this.updateEntities(hass, config);
  }

  updateEntities(hass: any, config: SakConfig): boolean {
    if (!hass || !config.entities) {
      return false;
    }

    const now = Date.now();
    if (now - this.lastUpdateTime < this.updateInterval) {
      return false; // Throttle updates
    }

    this.lastUpdateTime = now;
    this.hass = hass;
    this.entityConfigs = config.entities;

    let hasChanges = false;

    // Update entity states
    config.entities.forEach((entityConfig, index) => {
      const entityState = hass.states[entityConfig.entity];
      const previousState = this.entities.get(entityConfig.entity);

      if (entityState !== previousState) {
        this.entities.set(entityConfig.entity, entityState);
        hasChanges = true;
      }
    });

    // Notify subscribers if there were changes
    if (hasChanges) {
      this.notifySubscribers();
    }

    return hasChanges;
  }

  getEntity(entityId: string): EntityState | undefined {
    return this.entities.get(entityId);
  }

  getEntities(): EntityState[] {
    return Array.from(this.entities.values());
  }

  getEntityConfigs(): EntityConfig[] {
    return this.entityConfigs;
  }

  getEntityByIndex(index: number): EntityState | undefined {
    if (index < 0 || index >= this.entityConfigs.length) {
      return undefined;
    }
    
    const entityConfig = this.entityConfigs[index];
    return this.getEntity(entityConfig.entity);
  }

  // Subscription management
  subscribe(callback: (entities: EntityState[]) => void): () => void {
    this.updateCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.updateCallbacks.delete(callback);
    };
  }

  private notifySubscribers(): void {
    const entities = this.getEntities();
    this.updateCallbacks.forEach(callback => {
      try {
        callback(entities);
      } catch (error) {
        console.error('EntityService: Error in subscriber callback', error);
      }
    });
  }

  // Entity state utilities
  getEntityValue(entityId: string): any {
    const entity = this.getEntity(entityId);
    return entity?.state;
  }

  getEntityAttribute(entityId: string, attribute: string): any {
    const entity = this.getEntity(entityId);
    return entity?.attributes?.[attribute];
  }

  getEntityIcon(entityId: string): string {
    return this.getEntityAttribute(entityId, 'icon') || 'mdi:help-circle';
  }

  getEntityName(entityId: string): string {
    return this.getEntityAttribute(entityId, 'friendly_name') || entityId;
  }

  getEntityUnit(entityId: string): string {
    return this.getEntityAttribute(entityId, 'unit_of_measurement') || '';
  }

  // Entity state checking
  isEntityAvailable(entityId: string): boolean {
    return this.entities.has(entityId) && this.entities.get(entityId) !== undefined;
  }

  isEntityOn(entityId: string): boolean {
    const state = this.getEntityValue(entityId);
    return state === 'on' || state === 'open' || state === 'active';
  }

  isEntityOff(entityId: string): boolean {
    const state = this.getEntityValue(entityId);
    return state === 'off' || state === 'closed' || state === 'inactive';
  }

  // Entity domain utilities
  getEntityDomain(entityId: string): string {
    return entityId.split('.')[0] || '';
  }

  isEntityDomain(entityId: string, domain: string): boolean {
    return this.getEntityDomain(entityId) === domain;
  }

  // Entity state formatting
  formatEntityState(entityId: string, config?: EntityConfig): string {
    const entity = this.getEntity(entityId);
    if (!entity) return 'Unknown';

    // Use custom attribute if specified
    if (config?.attribute) {
      const value = this.getEntityAttribute(entityId, config.attribute);
      return this.formatValue(value, config);
    }

    // Use secondary info if specified
    if (config?.secondary_info) {
      const value = this.getEntityAttribute(entityId, config.secondary_info);
      return this.formatValue(value, config);
    }

    // Use entity state
    return this.formatValue(entity.state, config);
  }

  private formatValue(value: any, config?: EntityConfig): string {
    if (value === undefined || value === null) {
      return 'Unknown';
    }

    // Handle numeric values
    if (typeof value === 'number') {
      if (config?.unit) {
        return `${value} ${config.unit}`;
      }
      return value.toString();
    }

    // Handle string values
    if (typeof value === 'string') {
      // Check if it's a numeric string
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && config?.unit) {
        return `${value} ${config.unit}`;
      }
      return value;
    }

    // Handle other types
    return String(value);
  }

  // Service calls
  async callService(domain: string, service: string, serviceData?: any): Promise<void> {
    if (!this.hass) {
      throw new Error('No Home Assistant connection available');
    }

    try {
      await this.hass.callService(domain, service, serviceData);
    } catch (error) {
      console.error('EntityService: Service call failed', error);
      throw error;
    }
  }

  async toggleEntity(entityId: string): Promise<void> {
    await this.callService('homeassistant', 'toggle', { entity_id: entityId });
  }

  async turnOnEntity(entityId: string, serviceData?: any): Promise<void> {
    const domain = this.getEntityDomain(entityId);
    await this.callService(domain, 'turn_on', { entity_id: entityId, ...serviceData });
  }

  async turnOffEntity(entityId: string, serviceData?: any): Promise<void> {
    const domain = this.getEntityDomain(entityId);
    await this.callService(domain, 'turn_off', { entity_id: entityId, ...serviceData });
  }

  // Cleanup
  disconnect(): void {
    this.updateCallbacks.clear();
    this.entities.clear();
    this.entityConfigs = [];
    this.hass = null;
  }
}
