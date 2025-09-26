/*
 * CircleTool - Modern TypeScript implementation
 * Renders a circle SVG element with configurable styling and animations
 */

import { svg, type SVGTemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

import { BaseTool } from '../base/BaseTool.js';
import type { ToolConfig, Position } from '../../types/SakTypes.js';
import { styleMap } from '../../utils/StyleUtils.js';

export interface CircleToolConfig extends ToolConfig {
  position: Position & {
    radius: number;
  };
  circle?: {
    fill?: string;
    stroke?: string;
    stroke_width?: number;
    opacity?: number;
  };
  classes?: {
    tool?: Record<string, boolean>;
    circle?: Record<string, boolean>;
  };
  styles?: {
    tool?: Record<string, string | number>;
    circle?: Record<string, string | number>;
  };
}

@customElement('sak-circle-tool')
export class CircleTool extends BaseTool {
  declare config: CircleToolConfig;

  // Additional properties
  protected toolId = Math.random().toString(36).substr(2, 9);
  protected dev = { debug: false };

  static get defaultConfig(): Partial<CircleToolConfig> {
    return {
      position: {
        cx: 50,
        cy: 50,
        radius: 25,
      },
      circle: {
        fill: 'var(--primary-color)',
        stroke: 'none',
        stroke_width: 0,
        opacity: 1,
      },
    };
  }

  getToolType(): string {
    return 'circle';
  }

  protected initializeTool(): void {
    super.initializeTool();

    // Merge default config with provided config
    this.config = this.mergeConfig(CircleTool.defaultConfig, this.config);

    // Initialize classes and styles
    this.initializeClasses();
    this.initializeStyles();

    if (this.dev?.debug) {
      // eslint-disable-next-line no-console
      console.log('CircleTool initialized', this.config);
    }
  }

  private initializeClasses(): void {
    // Initialize default classes
    if (!this.config.classes) {
      this.config.classes = {};
    }
    if (!this.config.classes.tool) {
      this.config.classes.tool = { 'sak-circle': true, hover: true };
    }
    if (!this.config.classes.circle) {
      this.config.classes.circle = { 'sak-circle__circle': true };
    }
  }

  private initializeStyles(): void {
    // Initialize default styles
    if (!this.config.styles) {
      this.config.styles = {};
    }
    if (!this.config.styles.tool) {
      this.config.styles.tool = {};
    }
    if (!this.config.styles.circle) {
      this.config.styles.circle = {};
    }
  }

  private mergeConfig(defaultConfig: any, userConfig: any): CircleToolConfig {
    // Simple deep merge implementation
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

    return merged as CircleToolConfig;
  }

  private renderCircle(): SVGTemplateResult {
    // Apply dynamic styling based on entity state
    this.updateDynamicStyles();

    const circleStyles = {
      ...this.config.styles?.circle,
      ...this.getDynamicCircleStyles(),
    };

    return svg`
      <circle 
        class="sak-circle__circle"
        cx="${this.config.position.cx}%" 
        cy="${this.config.position.cy}%" 
        r="${this.config.position.radius}"
        style="${styleMap(circleStyles)}"
      />
    `;
  }

  private getDynamicCircleStyles(): Record<string, string | number> {
    const styles: Record<string, string | number> = {};

    // Apply base circle styles
    if (this.config.circle?.fill) {
      styles.fill = this.config.circle.fill;
    }
    if (this.config.circle?.stroke) {
      styles.stroke = this.config.circle.stroke;
    }
    if (this.config.circle?.stroke_width) {
      styles['stroke-width'] = this.config.circle.stroke_width;
    }
    if (this.config.circle?.opacity !== undefined) {
      styles.opacity = this.config.circle.opacity;
    }

    // Apply hover effects
    if (this.isHovered) {
      styles.opacity = Number(styles.opacity || 1) * 0.8;
    }

    return styles;
  }

  private updateDynamicStyles(): void {
    // Update styles based on entity state
    if (this.entityState) {
      // Apply color based on entity state if configured
      this.applyEntityStateColors();
    }

    // Apply animation classes if configured
    this.applyAnimationClasses();
  }

  private applyEntityStateColors(): void {
    // Implementation for entity state-based coloring
    // This would be expanded based on the original logic
    if (this.config.entity_index !== undefined && this.entityState) {
      // Apply colors based on entity state
      // TODO: Implement color mapping logic from original
    }
  }

  private applyAnimationClasses(): void {
    // Apply animation classes based on configuration
    if (this.config.animation) {
      // TODO: Implement animation class logic
    }
  }

  render(): SVGTemplateResult {
    const toolStyles = {
      ...this.config.styles?.tool,
      overflow: 'visible',
      'transform-origin': `${this.config.position.cx}% ${this.config.position.cy}%`,
    };

    return svg`
      <g 
        id="circle-${this.toolId || 'unknown'}"
        class="sak-circle"
        style="${styleMap(toolStyles)}"
        @click=${this.handleClick}
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
        @touchstart=${this.handleTouchStart}
        @touchend=${this.handleTouchEnd}
      >
        ${this.renderCircle()}
      </g>
    `;
  }
}

// Export for use in toolset registry
export default CircleTool;
