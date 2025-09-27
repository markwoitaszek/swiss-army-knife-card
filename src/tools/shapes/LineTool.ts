/*
 * LineTool - Modern TypeScript implementation
 * Draws lines and connectors with enhanced type safety and features
 */

import { html, svg } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseTool } from '../base/BaseTool.js';
import type { ToolConfig } from '../../types/SakTypes.js';

/**
 * Configuration interface for LineTool
 */
export interface LineConfig extends ToolConfig {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke?: string;
  stroke_width?: number;
  stroke_dasharray?: string;
  stroke_linecap?: 'butt' | 'round' | 'square';
  stroke_linejoin?: 'miter' | 'round' | 'bevel';
  opacity?: number;
  visibility?: 'visible' | 'hidden';
}

/**
 * LineTool - Modern TypeScript implementation
 * Draws lines with comprehensive styling options
 */
@customElement('sak-line-tool')
export class LineTool extends BaseTool {
  declare config: LineConfig;

  /**
   * Get the tool type identifier
   */
  getToolType(): string {
    return 'line';
  }

  /**
   * Get line styling based on configuration
   */
  private getLineStyles(): Record<string, string | number> {
    const styles: Record<string, string | number> = {};

    if (this.config.stroke) {
      styles.stroke = this.config.stroke;
    }

    if (this.config.stroke_width !== undefined) {
      styles['stroke-width'] = this.config.stroke_width;
    }

    if (this.config.stroke_dasharray) {
      styles['stroke-dasharray'] = this.config.stroke_dasharray;
    }

    if (this.config.stroke_linecap) {
      styles['stroke-linecap'] = this.config.stroke_linecap;
    }

    if (this.config.stroke_linejoin) {
      styles['stroke-linejoin'] = this.config.stroke_linejoin;
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
   * Render the line element
   */
  render() {
    if (!this.isVisible) {
      return html``;
    }

    const styles = this.getLineStyles();
    const styleString = this.stylesToString(styles);
    const visibility = this.config.visibility || 'visible';

    return svg`
      <line
        class="sak-line"
        style="${styleString}"
        x1="${this.config.x1}"
        y1="${this.config.y1}"
        x2="${this.config.x2}"
        y2="${this.config.y2}"
        visibility="${visibility}"
        @click="${this.handleClick}"
        @mouseenter="${this.handleMouseEnter}"
        @mouseleave="${this.handleMouseLeave}"
        @touchstart="${this.handleTouchStart}"
        @touchend="${this.handleTouchEnd}"
      />
    `;
  }
}

// Export for registration
export default LineTool;
