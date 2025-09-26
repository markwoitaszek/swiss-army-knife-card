/*
 * RectangleTool - Modern TypeScript implementation
 * Renders a rectangle SVG element with configurable styling and animations
 */

import { svg, type SVGTemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { Position, ToolConfig } from '../../types/SakTypes.js';
import { styleMap } from '../../utils/StyleUtils.js';
import { BaseTool } from '../base/BaseTool.js';

export interface RectangleToolConfig extends ToolConfig {
  position: Position & {
    width: number;
    height: number;
    rx?: number; // Border radius
  };
  rectangle?: {
    fill?: string;
    stroke?: string;
    stroke_width?: number;
    opacity?: number;
  };
  classes?: {
    tool?: Record<string, boolean>;
    rectangle?: Record<string, boolean>;
  };
  styles?: {
    tool?: Record<string, string | number>;
    rectangle?: Record<string, string | number>;
  };
}

@customElement('sak-rectangle-tool')
export class RectangleTool extends BaseTool {
  declare config: RectangleToolConfig;

  // Additional properties
  protected toolId = Math.random().toString(36).substr(2, 9);
  protected dev = { debug: false };

  static get defaultConfig(): Partial<RectangleToolConfig> {
    return {
      position: {
        cx: 50,
        cy: 50,
        width: 50,
        height: 50,
        rx: 0,
      },
      rectangle: {
        fill: 'var(--primary-color)',
        stroke: 'none',
        stroke_width: 0,
        opacity: 1,
      },
    };
  }

  getToolType(): string {
    return 'rectangle';
  }

  protected initializeTool(): void {
    super.initializeTool();

    // Merge default config with provided config
    this.config = this.mergeConfig(RectangleTool.defaultConfig, this.config);

    // Initialize classes and styles
    this.initializeClasses();
    this.initializeStyles();

    if (this.dev?.debug) {
      // eslint-disable-next-line no-console
      console.log('RectangleTool initialized', this.config);
    }
  }

  private initializeClasses(): void {
    // Initialize default classes
    if (!this.config.classes) {
      this.config.classes = {};
    }
    if (!this.config.classes.tool) {
      this.config.classes.tool = { 'sak-rectangle': true, hover: true };
    }
    if (!this.config.classes.rectangle) {
      this.config.classes.rectangle = { 'sak-rectangle__rectangle': true };
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
    if (!this.config.styles.rectangle) {
      this.config.styles.rectangle = {};
    }
  }

  private mergeConfig(defaultConfig: any, userConfig: any): RectangleToolConfig {
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

    return merged as RectangleToolConfig;
  }

  private renderRectangle(): SVGTemplateResult {
    // Apply dynamic styling based on entity state
    this.updateDynamicStyles();

    const rectangleStyles = {
      ...this.config.styles?.rectangle,
      ...this.getDynamicRectangleStyles(),
    };

    // Calculate rectangle position (top-left corner)
    const x = this.config.position.cx - this.config.position.width / 2;
    const y = this.config.position.cy - this.config.position.height / 2;

    return svg`
      <rect
        class="sak-rectangle__rectangle"
        x="${x}%"
        y="${y}%"
        width="${this.config.position.width}"
        height="${this.config.position.height}"
        rx="${this.config.position.rx || 0}"
        style="${styleMap(rectangleStyles)}"
      />
    `;
  }

  private getDynamicRectangleStyles(): Record<string, string | number> {
    const styles: Record<string, string | number> = {};

    // Apply base rectangle styles
    if (this.config.rectangle?.fill) {
      styles.fill = this.config.rectangle.fill;
    }
    if (this.config.rectangle?.stroke) {
      styles.stroke = this.config.rectangle.stroke;
    }
    if (this.config.rectangle?.stroke_width) {
      styles['stroke-width'] = this.config.rectangle.stroke_width;
    }
    if (this.config.rectangle?.opacity !== undefined) {
      styles.opacity = this.config.rectangle.opacity;
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
        id="rectangle-${this.toolId || 'unknown'}"
        class="sak-rectangle"
        style="${styleMap(toolStyles)}"
        @click=${this.handleClick}
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
        @touchstart=${this.handleTouchStart}
        @touchend=${this.handleTouchEnd}
      >
        ${this.renderRectangle()}
      </g>
    `;
  }
}

// Export for use in toolset registry
export default RectangleTool;
