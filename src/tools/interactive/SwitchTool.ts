/*
 * SwitchTool - Modern TypeScript implementation
 * Interactive switch tool for controlling Home Assistant entities
 */

import { svg, type SVGTemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { Position, ToolConfig } from '../../types/SakTypes.js';
import { styleMap } from '../../utils/StyleUtils.js';
import { BaseTool } from '../base/BaseTool.js';

export interface SwitchToolConfig extends ToolConfig {
  position: Position & {
    orientation?: 'horizontal' | 'vertical';
    track?: {
      width: number;
      height: number;
      radius: number;
    };
    thumb?: {
      width: number;
      height: number;
      radius: number;
      offset: number;
    };
  };
  switch?: {
    checked_track_color?: string;
    unchecked_track_color?: string;
    checked_button_color?: string;
    unchecked_button_color?: string;
    opacity?: number;
  };
  classes?: {
    tool?: Record<string, boolean>;
    track?: Record<string, boolean>;
    thumb?: Record<string, boolean>;
  };
  styles?: {
    tool?: Record<string, string | number>;
    track?: Record<string, string | number>;
    thumb?: Record<string, string | number>;
  };
}

@customElement('sak-switch-tool')
export class SwitchTool extends BaseTool {
  declare config: SwitchToolConfig;

  // Additional properties
  protected toolId = Math.random().toString(36).substr(2, 9);
  protected dev = { debug: false };
  protected isOn = false;

  static get defaultConfig(): Partial<SwitchToolConfig> {
    return {
      position: {
        cx: 50,
        cy: 50,
        orientation: 'horizontal',
        track: {
          width: 16,
          height: 7,
          radius: 3.5,
        },
        thumb: {
          width: 9,
          height: 9,
          radius: 4.5,
          offset: 4.5,
        },
      },
      switch: {
        checked_track_color: 'var(--switch-checked-track-color, #4CAF50)',
        unchecked_track_color: 'var(--switch-unchecked-track-color, #ccc)',
        checked_button_color: 'var(--switch-checked-button-color, #fff)',
        unchecked_button_color: 'var(--switch-unchecked-button-color, #fff)',
        opacity: 1,
      },
    };
  }

  getToolType(): string {
    return 'switch';
  }

  protected initializeTool(): void {
    super.initializeTool();

    // Merge default config with provided config
    this.config = this.mergeConfig(SwitchTool.defaultConfig, this.config);

    // Initialize classes and styles
    this.initializeClasses();
    this.initializeStyles();

    // Set initial state
    this.updateSwitchState();

    if (this.dev?.debug) {
      // eslint-disable-next-line no-console
      console.log('SwitchTool initialized', this.config);
    }
  }

  private initializeClasses(): void {
    if (!this.config.classes) {
      this.config.classes = {};
    }
    if (!this.config.classes.tool) {
      this.config.classes.tool = { 'sak-switch': true, hover: true };
    }
    if (!this.config.classes.track) {
      this.config.classes.track = { 'sak-switch__track': true };
    }
    if (!this.config.classes.thumb) {
      this.config.classes.thumb = { 'sak-switch__thumb': true };
    }
  }

  private initializeStyles(): void {
    if (!this.config.styles) {
      this.config.styles = {};
    }
    if (!this.config.styles.tool) {
      this.config.styles.tool = { overflow: 'visible' };
    }
    if (!this.config.styles.track) {
      this.config.styles.track = {};
    }
    if (!this.config.styles.thumb) {
      this.config.styles.thumb = {};
    }
  }

  private mergeConfig(defaultConfig: any, userConfig: any): SwitchToolConfig {
    const merged = { ...defaultConfig };
    for (const key in userConfig) {
      if (
        userConfig[key] &&
        typeof userConfig[key] === 'object' &&
        !Array.isArray(userConfig[key])
      ) {
        merged[key] = { ...merged[key], ...userConfig[key] };
      } else {
        merged[key] = userConfig[key];
      }
    }
    return merged as SwitchToolConfig;
  }

  private updateSwitchState(): void {
    if (this.entityState) {
      this.isOn = this.entityState.state === 'on';
    }
  }

  private async toggleSwitch(): Promise<void> {
    if (!this.entityState || this.config.entity_index === undefined) {
      return;
    }

    try {
      // Get the entity ID from the card's entity configuration
      const entityId = this.getEntityId();
      if (!entityId) return;

      // Determine the service to call based on current state
      const service = this.isOn ? 'turn_off' : 'turn_on';
      const domain = entityId.split('.')[0];

      // Call Home Assistant service
      await this.callHAService(domain, service, { entity_id: entityId });

      // Optimistically update local state for immediate feedback
      this.isOn = !this.isOn;
      this.requestUpdate();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('SwitchTool: Failed to toggle switch', error);
    }
  }

  private getEntityId(): string | null {
    // This would need to be implemented based on how the card manages entities
    // For now, return null as placeholder
    return null;
  }

  private async callHAService(domain: string, service: string, data: any): Promise<void> {
    // This would need to be implemented based on Home Assistant integration
    // For now, just log the action
    if (this.dev?.debug) {
      // eslint-disable-next-line no-console
      console.log(`SwitchTool: Calling ${domain}.${service}`, data);
    }
  }

  protected handleClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    // Toggle the switch
    this.toggleSwitch();

    // Call parent click handler for any additional actions
    super.handleClick(event);
  }

  private renderSwitch(): SVGTemplateResult {
    this.updateSwitchState();
    this.updateDynamicStyles();

    const track = this.config.position.track!;
    const thumb = this.config.position.thumb!;
    const orientation = this.config.position.orientation || 'horizontal';

    // Calculate track position (centered)
    const trackX = this.config.position.cx - track.width / 2;
    const trackY = this.config.position.cy - track.height / 2;

    // Calculate thumb position based on state and orientation
    let thumbX = this.config.position.cx - thumb.width / 2;
    let thumbY = this.config.position.cy - thumb.height / 2;

    if (orientation === 'horizontal') {
      thumbX += this.isOn ? thumb.offset : -thumb.offset;
    } else {
      thumbY += this.isOn ? -thumb.offset : thumb.offset;
    }

    const trackStyles = {
      ...this.config.styles?.track,
      fill: this.isOn
        ? this.config.switch?.checked_track_color || '#4CAF50'
        : this.config.switch?.unchecked_track_color || '#ccc',
      opacity: this.config.switch?.opacity || 1,
      transition: 'all 0.2s ease',
    };

    const thumbStyles = {
      ...this.config.styles?.thumb,
      fill: this.isOn
        ? this.config.switch?.checked_button_color || '#fff'
        : this.config.switch?.unchecked_button_color || '#fff',
      opacity: this.config.switch?.opacity || 1,
      transition: 'all 0.2s ease',
    };

    return svg`
      <!-- Track -->
      <rect
        class="sak-switch__track"
        x="${trackX}%"
        y="${trackY}%"
        width="${track.width}"
        height="${track.height}"
        rx="${track.radius}"
        style="${styleMap(trackStyles)}"
      />
      
      <!-- Thumb -->
      <rect
        class="sak-switch__thumb"
        x="${thumbX}%"
        y="${thumbY}%"
        width="${thumb.width}"
        height="${thumb.height}"
        rx="${thumb.radius}"
        style="${styleMap(thumbStyles)}"
      />
    `;
  }

  private updateDynamicStyles(): void {
    if (this.entityState) {
      this.applyEntityStateColors();
    }
    this.applyAnimationClasses();
  }

  private applyEntityStateColors(): void {
    if (this.config.entity_index !== undefined && this.entityState) {
      // TODO: Implement color mapping logic from original
    }
  }

  private applyAnimationClasses(): void {
    if (this.config.animation) {
      // TODO: Implement animation class logic
    }
  }

  // Override to update switch when entity state changes
  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has('entityState')) {
      this.updateSwitchState();
      this.requestUpdate();
    }
  }

  render(): SVGTemplateResult {
    const toolStyles = {
      ...this.config.styles?.tool,
      overflow: 'visible',
      cursor: 'pointer',
    };

    return svg`
      <g
        id="switch-${this.toolId || 'unknown'}"
        class="sak-switch ${this.isOn ? 'sak-switch--checked' : ''}"
        style="${styleMap(toolStyles)}"
        @click=${this.handleClick}
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
        @touchstart=${this.handleTouchStart}
        @touchend=${this.handleTouchEnd}
      >
        ${this.renderSwitch()}
      </g>
    `;
  }
}

// Export for use in toolset registry
export default SwitchTool;
