/*
 * GaugeTool - Modern TypeScript implementation
 * Renders a circular gauge for displaying progress or values
 */

import { svg, type SVGTemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { Position, ToolConfig } from '../../types/SakTypes.js';
import { styleMap } from '../../utils/StyleUtils.js';
import { BaseTool } from '../base/BaseTool.js';

export interface GaugeToolConfig extends ToolConfig {
  position: Position & {
    radius: number;
    start_angle?: number; // Starting angle in degrees (0 = top)
    end_angle?: number; // Ending angle in degrees
  };
  min?: number;
  max?: number;
  value?: number;
  gauge?: {
    track_color?: string;
    track_width?: number;
    fill_color?: string;
    fill_width?: number;
    opacity?: number;
  };
  classes?: {
    tool?: Record<string, boolean>;
    track?: Record<string, boolean>;
    fill?: Record<string, boolean>;
  };
  styles?: {
    tool?: Record<string, string | number>;
    track?: Record<string, string | number>;
    fill?: Record<string, string | number>;
  };
}

@customElement('sak-gauge-tool')
export class GaugeTool extends BaseTool {
  declare config: GaugeToolConfig;

  // Additional properties
  protected toolId = Math.random().toString(36).substr(2, 9);
  protected dev = { debug: false };

  static get defaultConfig(): Partial<GaugeToolConfig> {
    return {
      position: {
        cx: 50,
        cy: 50,
        radius: 40,
        start_angle: -90, // Start at top
        end_angle: 270, // Full circle
      },
      min: 0,
      max: 100,
      value: 0,
      gauge: {
        track_color: 'var(--disabled-text-color)',
        track_width: 4,
        fill_color: 'var(--primary-color)',
        fill_width: 4,
        opacity: 1,
      },
    };
  }

  getToolType(): string {
    return 'gauge';
  }

  protected initializeTool(): void {
    super.initializeTool();

    // Merge default config with provided config
    this.config = this.mergeConfig(GaugeTool.defaultConfig, this.config);

    // Initialize classes and styles
    this.initializeClasses();
    this.initializeStyles();

    if (this.dev?.debug) {
      // eslint-disable-next-line no-console
      console.log('GaugeTool initialized', this.config);
    }
  }

  private initializeClasses(): void {
    if (!this.config.classes) {
      this.config.classes = {};
    }
    if (!this.config.classes.tool) {
      this.config.classes.tool = { 'sak-gauge': true, hover: true };
    }
    if (!this.config.classes.track) {
      this.config.classes.track = { 'sak-gauge__track': true };
    }
    if (!this.config.classes.fill) {
      this.config.classes.fill = { 'sak-gauge__fill': true };
    }
  }

  private initializeStyles(): void {
    if (!this.config.styles) {
      this.config.styles = {};
    }
    if (!this.config.styles.tool) {
      this.config.styles.tool = {};
    }
    if (!this.config.styles.track) {
      this.config.styles.track = {};
    }
    if (!this.config.styles.fill) {
      this.config.styles.fill = {};
    }
  }

  private mergeConfig(defaultConfig: any, userConfig: any): GaugeToolConfig {
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
    return merged as GaugeToolConfig;
  }

  private polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  private describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  }

  private getCurrentValue(): number {
    // Get value from entity state or config
    if (this.entityState && !isNaN(Number(this.entityState.state))) {
      return Number(this.entityState.state);
    }
    return this.config.value || 0;
  }

  private calculateProgress(): number {
    const value = this.getCurrentValue();
    const min = this.config.min || 0;
    const max = this.config.max || 100;

    // Clamp value between min and max
    const clampedValue = Math.max(min, Math.min(max, value));

    // Calculate percentage
    return (clampedValue - min) / (max - min);
  }

  private renderGauge(): SVGTemplateResult {
    this.updateDynamicStyles();

    const centerX = this.config.position.cx;
    const centerY = this.config.position.cy;
    const radius = this.config.position.radius;
    const startAngle = this.config.position.start_angle || -90;
    const endAngle = this.config.position.end_angle || 270;

    const progress = this.calculateProgress();
    const progressAngle = startAngle + (endAngle - startAngle) * progress;

    // Track (background arc)
    const trackPath = this.describeArc(centerX, centerY, radius, startAngle, endAngle);
    const trackStyles = {
      ...this.config.styles?.track,
      fill: 'none',
      stroke: this.config.gauge?.track_color || 'var(--disabled-text-color)',
      'stroke-width': this.config.gauge?.track_width || 4,
      opacity: this.config.gauge?.opacity || 1,
    };

    // Fill (progress arc)
    const fillPath =
      progress > 0 ? this.describeArc(centerX, centerY, radius, startAngle, progressAngle) : '';

    const fillStyles = {
      ...this.config.styles?.fill,
      fill: 'none',
      stroke: this.config.gauge?.fill_color || 'var(--primary-color)',
      'stroke-width': this.config.gauge?.fill_width || 4,
      opacity: this.config.gauge?.opacity || 1,
    };

    return svg`
      <!-- Track (background) -->
      <path
        class="sak-gauge__track"
        d="${trackPath}"
        style="${styleMap(trackStyles)}"
      />
      
      <!-- Fill (progress) -->
      ${
        progress > 0
          ? svg`
        <path
          class="sak-gauge__fill"
          d="${fillPath}"
          style="${styleMap(fillStyles)}"
        />
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

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has('entityState')) {
      this.requestUpdate();
    }
  }

  render(): SVGTemplateResult {
    const toolStyles = {
      ...this.config.styles?.tool,
      overflow: 'visible',
    };

    return svg`
      <g
        id="gauge-${this.toolId || 'unknown'}"
        class="sak-gauge"
        style="${styleMap(toolStyles)}"
        @click=${this.handleClick}
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
        @touchstart=${this.handleTouchStart}
        @touchend=${this.handleTouchEnd}
      >
        ${this.renderGauge()}
      </g>
    `;
  }
}

// Export for use in toolset registry
export default GaugeTool;
