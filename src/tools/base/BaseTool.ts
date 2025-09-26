/*
 * BaseTool - Abstract base class for all SAK tools
 * Provides common functionality and interface for tool implementations
 */

import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

// Import types
import type { EntityState, Position, Rotation, Scale, ToolConfig } from '../../types/SakTypes.js';

@customElement('sak-base-tool')
export abstract class BaseTool extends LitElement {
  // Properties
  @property({ attribute: false }) config: ToolConfig;
  @property({ type: Number }) entityIndex: number = 0;
  @property({ attribute: false }) entityState?: EntityState;
  @property({ attribute: false }) position: Position;
  @property({ attribute: false }) scale?: Scale;
  @property({ attribute: false }) rotation?: Rotation;

  // State
  @state() protected isActive = false;
  @state() protected isVisible = true;
  @state() protected isHovered = false;

  // Internal state
  protected cardElement: HTMLElement;
  protected hass: any;

  constructor() {
    super();
    this.cardElement = this.closest('swiss-army-knife-card') as HTMLElement;
    this.hass = (this.cardElement as any)?.hass;
  }

  connectedCallback() {
    super.connectedCallback();
    this.initializeTool();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupTool();
  }

  // Abstract methods that must be implemented by subclasses
  abstract render(): any;
  abstract getToolType(): string;

  // Common initialization
  protected initializeTool(): void {
    if (!this.config) {
      console.error('BaseTool: No configuration provided');
      return;
    }

    // Set up event listeners
    this.addEventListener('click', this.handleClick);
    this.addEventListener('mouseenter', this.handleMouseEnter);
    this.addEventListener('mouseleave', this.handleMouseLeave);
    this.addEventListener('touchstart', this.handleTouchStart);
    this.addEventListener('touchend', this.handleTouchEnd);
  }

  // Common cleanup
  protected cleanupTool(): void {
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('mouseenter', this.handleMouseEnter);
    this.removeEventListener('mouseleave', this.handleMouseLeave);
    this.removeEventListener('touchstart', this.handleTouchStart);
    this.removeEventListener('touchend', this.handleTouchEnd);
  }

  // Event handlers
  protected handleClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.config.tap_action && this.config.tap_action.action !== 'none') {
      this.executeAction(this.config.tap_action);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected handleMouseEnter(event: Event): void {
    this.isHovered = true;
    this.requestUpdate();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected handleMouseLeave(event: Event): void {
    this.isHovered = false;
    this.requestUpdate();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected handleTouchStart(event: Event): void {
    // Handle touch start for mobile devices
    this.isHovered = true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected handleTouchEnd(event: Event): void {
    // Handle touch end for mobile devices
    this.isHovered = false;
  }

  // Action execution
  protected executeAction(action: any): void {
    if (!this.hass) {
      console.error('BaseTool: No Home Assistant connection available');
      return;
    }

    switch (action.action) {
      case 'toggle':
        this.toggleEntity();
        break;
      case 'call-service':
        this.callService(action.service, action.service_data);
        break;
      case 'navigate':
        this.navigate(action.navigation_path);
        break;
      case 'url':
        this.openUrl(action.url_path);
        break;
      case 'more-info':
        this.showMoreInfo();
        break;
      default:
        console.warn('BaseTool: Unknown action type', action.action);
    }
  }

  // Action implementations
  protected toggleEntity(): void {
    if (!this.entityState) return;

    this.hass.callService('homeassistant', 'toggle', {
      entity_id: this.entityState.entity_id,
    });
  }

  protected callService(service: string, serviceData?: any): void {
    if (!service) return;

    const [domain, serviceName] = service.split('.');
    this.hass.callService(domain, serviceName, serviceData);
  }

  protected navigate(path: string): void {
    if (!path) return;

    // Navigate using Home Assistant's navigation
    (this.hass as any).callService('browser_mod', 'navigate', { path });
  }

  protected openUrl(url: string): void {
    if (!url) return;

    window.open(url, '_blank');
  }

  protected showMoreInfo(): void {
    if (!this.entityState) return;

    // Show more info dialog
    (this.hass as any).callService('browser_mod', 'more_info', {
      entity_id: this.entityState.entity_id,
    });
  }

  // Utility methods
  protected getEntityValue(): any {
    return this.entityState?.state;
  }

  protected getEntityAttribute(attribute: string): any {
    return this.entityState?.attributes?.[attribute];
  }

  protected getEntityIcon(): string {
    return this.entityState?.attributes?.icon || 'mdi:help-circle';
  }

  protected getEntityName(): string {
    return this.entityState?.attributes?.friendly_name || this.entityState?.entity_id || 'Unknown';
  }

  // Position and transform utilities
  protected getTransform(): string {
    let transform = '';

    if (this.position) {
      transform += `translate(${this.position.cx}, ${this.position.cy})`;
    }

    if (this.scale) {
      transform += ` scale(${this.scale.x}, ${this.scale.y})`;
    }

    if (this.rotation) {
      const cx = this.rotation.cx || this.position?.cx || 0;
      const cy = this.rotation.cy || this.position?.cy || 0;
      transform += ` rotate(${this.rotation.angle} ${cx} ${cy})`;
    }

    return transform;
  }

  // Color utilities
  protected getColor(): string {
    if (!this.config.color) return '#000000';

    if (typeof this.config.color === 'string') {
      return this.config.color;
    }

    // Handle ColorConfig object
    switch (this.config.color.type) {
      case 'fixed':
        return this.config.color.color || '#000000';
      case 'entity':
        return this.getEntityAttribute(this.config.color.attribute || '') || '#000000';
      default:
        return '#000000';
    }
  }

  // Animation utilities
  protected getAnimationClasses(): string {
    if (!this.config.animation || this.config.animation.type === 'none') {
      return '';
    }

    const classes = ['animated'];

    if (this.config.animation.type) {
      classes.push(`animation-${this.config.animation.type}`);
    }

    return classes.join(' ');
  }

  // Visibility utilities
  protected shouldShow(): boolean {
    if (!this.isVisible) return false;

    // Add any tool-specific visibility logic here
    return true;
  }

  // Update methods
  updateEntityState(entityState: EntityState): void {
    this.entityState = entityState;
    this.requestUpdate();
  }

  updatePosition(position: Position): void {
    this.position = position;
    this.requestUpdate();
  }

  updateScale(scale: Scale): void {
    this.scale = scale;
    this.requestUpdate();
  }

  updateRotation(rotation: Rotation): void {
    this.rotation = rotation;
    this.requestUpdate();
  }
}
