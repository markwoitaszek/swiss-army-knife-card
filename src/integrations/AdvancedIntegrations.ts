/*
 * AdvancedIntegrations - Enhanced Home Assistant integration system
 * Provides advanced entity handling, service calls, and real-time updates
 */

export interface EntitySubscription {
  entityId: string;
  callback: (state: any) => void;
  throttleMs?: number;
}

export interface ServiceCallConfig {
  domain: string;
  service: string;
  data?: Record<string, any>;
  target?: {
    entity_id?: string | string[];
    area_id?: string | string[];
    device_id?: string | string[];
  };
}

export class AdvancedIntegrations {
  private hass: any = null;
  private subscriptions: Map<string, EntitySubscription> = new Map();
  private websocketConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(hass?: any) {
    this.hass = hass;
    this.setupWebSocketConnection();
  }

  // Public API
  setHass(hass: any): void {
    this.hass = hass;
    this.websocketConnected = true;
    this.reconnectAttempts = 0;
  }

  // Entity subscriptions
  subscribeToEntity(subscription: EntitySubscription): void {
    this.subscriptions.set(subscription.entityId, subscription);

    if (this.hass) {
      this.setupEntityListener(subscription);
    }
  }

  unsubscribeFromEntity(entityId: string): void {
    this.subscriptions.delete(entityId);
  }

  private setupEntityListener(subscription: EntitySubscription): void {
    if (!this.hass) return;

    let lastUpdate = 0;
    const throttleMs = subscription.throttleMs || 100;

    const handleStateChange = (newState: any) => {
      const now = Date.now();
      if (now - lastUpdate < throttleMs) return;

      lastUpdate = now;
      subscription.callback(newState);
    };

    // In a real implementation, this would use Home Assistant's WebSocket API
    // For now, we'll simulate the subscription
    if (this.hass.states[subscription.entityId]) {
      handleStateChange(this.hass.states[subscription.entityId]);
    }
  }

  // Enhanced service calls
  async callService(config: ServiceCallConfig): Promise<any> {
    if (!this.hass || !this.websocketConnected) {
      throw new Error('Home Assistant connection not available');
    }

    try {
      const result = await this.hass.callService(
        config.domain,
        config.service,
        config.data || {},
        config.target
      );

      return result;
    } catch (error) {
      console.error('Service call failed:', config, error);
      throw error;
    }
  }

  // Batch service calls for performance
  async batchServiceCalls(configs: ServiceCallConfig[]): Promise<any[]> {
    const promises = configs.map(config => this.callService(config));
    return Promise.allSettled(promises);
  }

  // Entity state caching
  private entityCache: Map<string, { state: any; timestamp: number }> = new Map();
  private cacheExpiryMs = 30000; // 30 seconds

  getCachedEntityState(entityId: string): any | null {
    const cached = this.entityCache.get(entityId);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.cacheExpiryMs;
    if (isExpired) {
      this.entityCache.delete(entityId);
      return null;
    }

    return cached.state;
  }

  setCachedEntityState(entityId: string, state: any): void {
    this.entityCache.set(entityId, {
      state,
      timestamp: Date.now(),
    });
  }

  // WebSocket connection management
  private setupWebSocketConnection(): void {
    if (!this.hass) return;

    // Monitor connection status
    this.websocketConnected = true;

    // Setup reconnection logic
    window.addEventListener('online', this.handleReconnect.bind(this));
    window.addEventListener('offline', this.handleDisconnect.bind(this));
  }

  private handleReconnect(): void {
    if (!this.websocketConnected && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;

      setTimeout(
        () => {
          this.attemptReconnection();
        },
        Math.pow(2, this.reconnectAttempts) * 1000
      ); // Exponential backoff
    }
  }

  private handleDisconnect(): void {
    this.websocketConnected = false;
  }

  private attemptReconnection(): void {
    // In a real implementation, this would attempt to reconnect to Home Assistant
    console.log(`Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
  }

  // Advanced entity queries
  async queryEntityHistory(entityId: string, startTime: Date, endTime?: Date): Promise<any[]> {
    if (!this.hass) {
      throw new Error('Home Assistant connection not available');
    }

    const endDate = endTime || new Date();

    try {
      // This would use the Home Assistant history API
      const history = await this.hass.callApi('GET', `history/period/${startTime.toISOString()}`, {
        filter_entity_id: entityId,
        end_time: endDate.toISOString(),
      });

      return history[0] || [];
    } catch (error) {
      console.error('Failed to query entity history:', error);
      return [];
    }
  }

  // Real-time entity updates
  startRealTimeUpdates(): void {
    this.subscriptions.forEach((subscription, entityId) => {
      this.setupEntityListener(subscription);
    });
  }

  stopRealTimeUpdates(): void {
    // Stop all entity listeners
    this.subscriptions.clear();
  }

  // Connection status
  isConnected(): boolean {
    return this.websocketConnected && this.hass !== null;
  }

  getConnectionStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    lastUpdate: number;
  } {
    return {
      connected: this.websocketConnected,
      reconnectAttempts: this.reconnectAttempts,
      lastUpdate: Date.now(),
    };
  }

  // Utility methods
  validateEntityId(entityId: string): boolean {
    const pattern = /^[a-z_]+\.[a-z0-9_]+$/;
    return pattern.test(entityId);
  }

  getEntityDomain(entityId: string): string {
    return entityId.split('.')[0];
  }

  // Cleanup
  destroy(): void {
    this.stopRealTimeUpdates();
    this.entityCache.clear();

    window.removeEventListener('online', this.handleReconnect.bind(this));
    window.removeEventListener('offline', this.handleDisconnect.bind(this));
  }
}

export default AdvancedIntegrations;
