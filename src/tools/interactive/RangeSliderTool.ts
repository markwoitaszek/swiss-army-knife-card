/*
 * RangeSliderTool - Modern TypeScript implementation
 * Interactive range slider for controlling Home Assistant numeric entities
 */

import { svg, type SVGTemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import type { Position, ToolConfig } from '../../types/SakTypes.js';
import { styleMap } from '../../utils/StyleUtils.js';
import { BaseTool } from '../base/BaseTool.js';

export interface RangeSliderToolConfig extends ToolConfig {
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
    };
    active?: {
      width: number;
      height: number;
      radius: number;
    };
  };
  scale?: {
    min: number;
    max: number;
    step?: number;
  };
  value?: number;
  show?: {
    uom?: 'end' | 'none';
    active?: boolean;
    label?: boolean;
  };
  slider?: {
    track_color?: string;
    active_color?: string;
    thumb_color?: string;
    opacity?: number;
  };
  classes?: {
    tool?: Record<string, boolean>;
    track?: Record<string, boolean>;
    active?: Record<string, boolean>;
    thumb?: Record<string, boolean>;
    label?: Record<string, boolean>;
  };
  styles?: {
    tool?: Record<string, string | number>;
    track?: Record<string, string | number>;
    active?: Record<string, string | number>;
    thumb?: Record<string, string | number>;
    label?: Record<string, string | number>;
  };
}

@customElement('sak-range-slider-tool')
export class RangeSliderTool extends BaseTool {
  declare config: RangeSliderToolConfig;

  // Additional properties
  protected toolId = Math.random().toString(36).substr(2, 9);
  protected dev = { debug: false };

  @state() private currentValue = 0;
  @state() private isDragging = false;
  @state() protected isActiveSlider = false;

  private startDragValue = 0;
  private trackElement?: SVGElement;

  static get defaultConfig(): Partial<RangeSliderToolConfig> {
    return {
      position: {
        cx: 50,
        cy: 50,
        orientation: 'horizontal',
        track: {
          width: 50,
          height: 4,
          radius: 2,
        },
        thumb: {
          width: 12,
          height: 12,
          radius: 6,
        },
        active: {
          width: 0,
          height: 4,
          radius: 2,
        },
      },
      scale: {
        min: 0,
        max: 100,
        step: 1,
      },
      value: 0,
      show: {
        uom: 'end',
        active: true,
        label: true,
      },
      slider: {
        track_color: 'var(--disabled-text-color)',
        active_color: 'var(--primary-color)',
        thumb_color: 'var(--card-background-color)',
        opacity: 1,
      },
    };
  }

  getToolType(): string {
    return 'range_slider';
  }

  protected initializeTool(): void {
    super.initializeTool();

    // Merge default config with provided config
    this.config = this.mergeConfig(RangeSliderTool.defaultConfig, this.config);

    // Initialize classes and styles
    this.initializeClasses();
    this.initializeStyles();

    // Set initial value
    this.updateSliderValue();

    // Add interaction event listeners
    this.setupInteractionListeners();

    if (this.dev?.debug) {
      // eslint-disable-next-line no-console
      console.log('RangeSliderTool initialized', this.config);
    }
  }

  private initializeClasses(): void {
    if (!this.config.classes) {
      this.config.classes = {};
    }
    if (!this.config.classes.tool) {
      this.config.classes.tool = { 'sak-slider': true, hover: true };
    }
    if (!this.config.classes.track) {
      this.config.classes.track = { 'sak-slider__track': true };
    }
    if (!this.config.classes.active) {
      this.config.classes.active = { 'sak-slider__active': true };
    }
    if (!this.config.classes.thumb) {
      this.config.classes.thumb = { 'sak-slider__thumb': true };
    }
    if (!this.config.classes.label) {
      this.config.classes.label = { 'sak-slider__label': true };
    }
  }

  private initializeStyles(): void {
    if (!this.config.styles) {
      this.config.styles = {};
    }
    ['tool', 'track', 'active', 'thumb', 'label'].forEach(key => {
      if (!this.config.styles![key]) {
        this.config.styles![key] = {};
      }
    });
  }

  private mergeConfig(defaultConfig: any, userConfig: any): RangeSliderToolConfig {
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
    return merged as RangeSliderToolConfig;
  }

  private updateSliderValue(): void {
    if (this.entityState && !isNaN(Number(this.entityState.state))) {
      this.currentValue = Number(this.entityState.state);
    } else {
      this.currentValue = this.config.value || 0;
    }

    // Clamp value to scale range
    const min = this.config.scale?.min || 0;
    const max = this.config.scale?.max || 100;
    this.currentValue = Math.max(min, Math.min(max, this.currentValue));
  }

  private setupInteractionListeners(): void {
    // Add mouse and touch event listeners for dragging
    this.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.addEventListener('touchstart', this.handleTouchStart.bind(this));

    // Global listeners for drag operations
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    document.addEventListener('touchmove', this.handleTouchMove.bind(this));
    document.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  private handleMouseDown(event: MouseEvent): void {
    this.startDrag(event.clientX, event.clientY);
  }

  private handleTouchStart(event: TouchEvent): void {
    if (event.touches.length > 0) {
      this.startDrag(event.touches[0].clientX, event.touches[0].clientY);
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      this.updateDrag(event.clientX, event.clientY);
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    if (this.isDragging && event.touches.length > 0) {
      this.updateDrag(event.touches[0].clientX, event.touches[0].clientY);
    }
  }

  private handleMouseUp(): void {
    this.endDrag();
  }

  private handleTouchEnd(): void {
    this.endDrag();
  }

  private startDrag(clientX: number, clientY: number): void {
    this.isDragging = true;
    this.isActiveSlider = true;
    this.startDragValue = this.currentValue;

    // Update value based on initial click position
    this.updateValueFromPosition(clientX, clientY);
  }

  private updateDrag(clientX: number, clientY: number): void {
    this.updateValueFromPosition(clientX, clientY);
  }

  private endDrag(): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.isActiveSlider = false;

      // Send value to Home Assistant
      this.sendValueToHA();
    }
  }

  private updateValueFromPosition(clientX: number, clientY: number): void {
    // Convert screen coordinates to slider value
    const rect = this.getBoundingClientRect();
    const orientation = this.config.position.orientation || 'horizontal';

    let percentage: number;

    if (orientation === 'horizontal') {
      const relativeX = clientX - rect.left;
      percentage = relativeX / rect.width;
    } else {
      const relativeY = clientY - rect.top;
      percentage = 1 - relativeY / rect.height; // Invert for vertical
    }

    // Clamp percentage
    percentage = Math.max(0, Math.min(1, percentage));

    // Convert to value
    const min = this.config.scale?.min || 0;
    const max = this.config.scale?.max || 100;
    const step = this.config.scale?.step || 1;

    let newValue = min + (max - min) * percentage;
    newValue = Math.round(newValue / step) * step;
    newValue = Math.max(min, Math.min(max, newValue));

    this.currentValue = newValue;
    this.requestUpdate();
  }

  private async sendValueToHA(): Promise<void> {
    if (!this.entityState || this.config.entity_index === undefined) {
      return;
    }

    try {
      const entityId = this.getEntityId();
      if (!entityId) return;

      const domain = entityId.split('.')[0];

      // Determine service based on domain
      let service = 'set_value';
      const serviceData: any = { entity_id: entityId };

      switch (domain) {
        case 'light':
          service = 'turn_on';
          serviceData.brightness = Math.round((this.currentValue / 100) * 255);
          break;
        case 'climate':
          service = 'set_temperature';
          serviceData.temperature = this.currentValue;
          break;
        case 'input_number':
          service = 'set_value';
          serviceData.value = this.currentValue;
          break;
        default:
          // Generic numeric entity
          serviceData.value = this.currentValue;
      }

      await this.callHAService(domain, service, serviceData);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('RangeSliderTool: Failed to send value to HA', error);
    }
  }

  private getEntityId(): string | null {
    // Placeholder for entity ID retrieval
    return null;
  }

  private async callHAService(domain: string, service: string, data: any): Promise<void> {
    if (this.dev?.debug) {
      // eslint-disable-next-line no-console
      console.log(`RangeSliderTool: Calling ${domain}.${service}`, data);
    }
  }

  private calculateThumbPosition(): { x: number; y: number } {
    const min = this.config.scale?.min || 0;
    const max = this.config.scale?.max || 100;
    const progress = (this.currentValue - min) / (max - min);

    const track = this.config.position.track!;
    const orientation = this.config.position.orientation || 'horizontal';

    if (orientation === 'horizontal') {
      const trackStartX = this.config.position.cx - track.width / 2;
      const thumbX = trackStartX + progress * track.width;
      return {
        x: thumbX,
        y: this.config.position.cy,
      };
    } else {
      const trackStartY = this.config.position.cy - track.height / 2;
      const thumbY = trackStartY + (1 - progress) * track.height; // Invert for vertical
      return {
        x: this.config.position.cx,
        y: thumbY,
      };
    }
  }

  private renderSlider(): SVGTemplateResult {
    this.updateSliderValue();
    this.updateDynamicStyles();

    const track = this.config.position.track!;
    const thumb = this.config.position.thumb!;
    const active = this.config.position.active!;
    const orientation = this.config.position.orientation || 'horizontal';

    // Calculate positions
    const trackX = this.config.position.cx - track.width / 2;
    const trackY = this.config.position.cy - track.height / 2;
    const thumbPos = this.calculateThumbPosition();

    // Calculate active track (filled portion)
    const min = this.config.scale?.min || 0;
    const max = this.config.scale?.max || 100;
    const progress = (this.currentValue - min) / (max - min);

    const trackStyles = {
      ...this.config.styles?.track,
      fill: this.config.slider?.track_color || 'var(--disabled-text-color)',
      opacity: this.config.slider?.opacity || 1,
    };

    const activeStyles = {
      ...this.config.styles?.active,
      fill: this.config.slider?.active_color || 'var(--primary-color)',
      opacity: this.config.slider?.opacity || 1,
    };

    const thumbStyles = {
      ...this.config.styles?.thumb,
      fill: this.config.slider?.thumb_color || 'var(--card-background-color)',
      stroke: this.config.slider?.active_color || 'var(--primary-color)',
      'stroke-width': 2,
      opacity: this.config.slider?.opacity || 1,
      cursor: 'pointer',
    };

    return svg`
      <!-- Track (background) -->
      <rect
        class="sak-slider__track"
        x="${trackX}%"
        y="${trackY}%"
        width="${track.width}"
        height="${track.height}"
        rx="${track.radius}"
        style="${styleMap(trackStyles)}"
      />

      <!-- Active track (filled portion) -->
      ${
        this.config.show?.active !== false
          ? svg`
        <rect
          class="sak-slider__active"
          x="${trackX}%"
          y="${trackY}%"
          width="${orientation === 'horizontal' ? track.width * progress : track.width}"
          height="${orientation === 'vertical' ? track.height * progress : track.height}"
          rx="${active.radius || track.radius}"
          style="${styleMap(activeStyles)}"
        />
      `
          : ''
      }

      <!-- Thumb -->
      <circle
        class="sak-slider__thumb"
        cx="${thumbPos.x}%"
        cy="${thumbPos.y}%"
        r="${thumb.radius}"
        style="${styleMap(thumbStyles)}"
      />

      <!-- Value label -->
      ${
        this.config.show?.label !== false
          ? svg`
        <text
          class="sak-slider__label"
          x="${thumbPos.x}%"
          y="${thumbPos.y - 15}%"
          text-anchor="middle"
          style="font-size: 10px; fill: var(--primary-text-color);"
        >
          ${this.currentValue}${
            this.config.show?.uom === 'end' && this.entityState?.attributes?.unit_of_measurement
              ? ` ${this.entityState.attributes.unit_of_measurement}`
              : ''
          }
        </text>
      `
          : ''
      }
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

  protected handleClick(event: Event): void {
    // Don't call parent click handler for sliders - we handle interaction differently
    event.preventDefault();
    event.stopPropagation();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has('entityState')) {
      this.updateSliderValue();
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
        id="range-slider-${this.toolId || 'unknown'}"
        class="sak-slider ${this.isDragging ? 'sak-slider--dragging' : ''} ${this.isActiveSlider ? 'sak-slider--active' : ''}"
        style="${styleMap(toolStyles)}"
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
      >
        ${this.renderSlider()}
      </g>
    `;
  }
}

// Export for use in toolset registry
export default RangeSliderTool;
