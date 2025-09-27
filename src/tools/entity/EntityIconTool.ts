/*
 * EntityIconTool - Modern TypeScript implementation
 * Displays entity icons with state-based styling and enhanced features
 */

import { html, svg } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { EntityState, ToolConfig } from '../../types/SakTypes.js';
import { BaseTool } from '../base/BaseTool.js';

/**
 * Configuration interface for EntityIconTool
 */
export interface EntityIconConfig extends ToolConfig {
  type: 'entity_icon';
  icon?: string;
  icon_template?: string;
  fallback_icon?: string;
  size?: number;
  color?: string;
  opacity?: number;
  visibility?: 'visible' | 'hidden';
  x?: number;
  y?: number;
  rotate?: number;
  scale?: number;
}

/**
 * EntityIconTool - Modern TypeScript implementation
 * Displays entity icons with comprehensive styling and state integration
 */
@customElement('sak-entity-icon-tool')
export class EntityIconTool extends BaseTool {
  declare config: EntityIconConfig;

  /**
   * Get the tool type identifier
   */
  getToolType(): string {
    return 'entity_icon';
  }

  /**
   * Get the icon to display for the entity
   * Prioritizes: config.icon → entity.icon → entity.default_icon → fallback
   */
  private getDisplayIcon(): string {
    // Use explicit icon from config if provided
    if (this.config.icon) {
      return this.config.icon;
    }

    // Use entity icon if available
    if (this.entityState?.attributes?.icon) {
      return this.entityState.attributes.icon;
    }

    // Use entity default icon based on domain
    if (this.entityState?.entity_id) {
      const domain = this.entityState.entity_id.split('.')[0];
      const defaultIcons: Record<string, string> = {
        light: 'mdi:lightbulb',
        switch: 'mdi:toggle-switch',
        sensor: 'mdi:eye',
        binary_sensor: 'mdi:radiobox-blank',
        climate: 'mdi:thermostat',
        cover: 'mdi:window-shutter',
        fan: 'mdi:fan',
        lock: 'mdi:lock',
        media_player: 'mdi:play',
        person: 'mdi:account',
        vacuum: 'mdi:robot-vacuum',
        camera: 'mdi:camera',
        alarm_control_panel: 'mdi:shield-home',
      };

      if (defaultIcons[domain]) {
        return defaultIcons[domain];
      }
    }

    // Use fallback icon if provided
    if (this.config.fallback_icon) {
      return this.config.fallback_icon;
    }

    // Final fallback
    return 'mdi:help-circle';
  }

  /**
   * Get icon styling based on configuration and entity state
   */
  private getIconStyles(): Record<string, string | number> {
    const styles: Record<string, string | number> = {};

    if (this.config.color) {
      styles.fill = this.config.color;
    }

    if (this.config.opacity !== undefined) {
      styles.opacity = this.config.opacity;
    }

    return styles;
  }

  /**
   * Convert styles object to CSS string
   */
  private stylesToString(styles: Record<string, string | number>): string {
    return Object.entries(styles)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
  }

  /**
   * Get transform string for positioning and scaling
   */
  private getTransform(): string {
    const transforms: string[] = [];

    if (this.config.rotate !== undefined) {
      transforms.push(`rotate(${this.config.rotate})`);
    }

    if (this.config.scale !== undefined) {
      transforms.push(`scale(${this.config.scale})`);
    }

    return transforms.join(' ');
  }

  /**
   * Render the entity icon element
   */
  render() {
    if (!this.isVisible) {
      return html``;
    }

    const iconName = this.getDisplayIcon();
    const styles = this.getIconStyles();
    const styleString = this.stylesToString(styles);
    const transform = this.getTransform();

    // Get position values
    const x = this.config.x !== undefined ? this.config.x : this.position?.cx || 0;
    const y = this.config.y !== undefined ? this.config.y : this.position?.cy || 0;
    const size = this.config.size || 24;
    const visibility = this.config.visibility || 'visible';

    // For now, render as text showing icon name (in real implementation, this would be an actual icon)
    // In a full implementation, this would integrate with Home Assistant's icon system
    return svg`
      <text
        class="sak-entity-icon"
        style="${styleString}"
        x="${x}"
        y="${y}"
        text-anchor="middle"
        alignment-baseline="central"
        font-size="${size}px"
        font-family="Material Design Icons"
        transform="${transform}"
        visibility="${visibility}"
        @click="${this.handleClick}"
        @mouseenter="${this.handleMouseEnter}"
        @mouseleave="${this.handleMouseLeave}"
        @touchstart="${this.handleTouchStart}"
        @touchend="${this.handleTouchEnd}"
      >
        ${iconName}
      </text>
    `;
  }

  /**
   * Update entity state and trigger re-render if icon changed
   */
  updateEntityState(newState: EntityState): void {
    const oldIcon = this.getDisplayIcon();
    super.updateEntityState(newState);
    const newIcon = this.getDisplayIcon();

    // Only trigger update if the display icon actually changed
    if (oldIcon !== newIcon) {
      this.requestUpdate();
    }
  }
}

// Export for registration
export default EntityIconTool;
