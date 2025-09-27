/*
 * EntityAreaTool - Modern TypeScript implementation
 * Displays entity area information with enhanced type safety and features
 */

import { html, svg } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseTool } from '../base/BaseTool.js';
import type { EntityState, ToolConfig } from '../../types/SakTypes.js';

/**
 * Configuration interface for EntityAreaTool
 */
export interface EntityAreaConfig extends ToolConfig {
  type: 'entity_area';
  area?: string;
  area_template?: string;
  fallback_area?: string;
  font_size?: number;
  font_weight?: string | number;
  font_family?: string;
  color?: string;
  text_anchor?: 'start' | 'middle' | 'end';
  alignment_baseline?: 'auto' | 'baseline' | 'middle' | 'central' | 'hanging';
  x?: number;
  y?: number;
  dx?: number;
  dy?: number;
  rotate?: number;
  opacity?: number;
  visibility?: 'visible' | 'hidden';
}

/**
 * EntityAreaTool - Modern TypeScript implementation
 * Displays entity area information with comprehensive styling options
 */
@customElement('sak-entity-area-tool')
export class EntityAreaTool extends BaseTool {
  declare config: EntityAreaConfig;

  /**
   * Get the tool type identifier
   */
  getToolType(): string {
    return 'entity_area';
  }

  /**
   * Get the display area for the entity
   * Prioritizes: config.area → entity.area_id → fallback
   */
  private getDisplayArea(): string {
    // Use explicit area from config if provided
    if (this.config.area) {
      return this.config.area;
    }

    // Use entity area_id if available
    if (this.entityState?.attributes?.area_id) {
      return this.entityState.attributes.area_id;
    }

    // Use fallback area if provided
    if (this.config.fallback_area) {
      return this.config.fallback_area;
    }

    // Final fallback
    return 'Unknown Area';
  }

  /**
   * Get text styling based on configuration
   */
  private getTextStyles(): Record<string, string | number> {
    const styles: Record<string, string | number> = {};

    if (this.config.font_size !== undefined) {
      styles['font-size'] = `${this.config.font_size}px`;
    }

    if (this.config.font_weight !== undefined) {
      styles['font-weight'] = this.config.font_weight;
    }

    if (this.config.font_family) {
      styles['font-family'] = this.config.font_family;
    }

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
   * Render the entity area text element
   */
  render() {
    if (!this.isVisible) {
      return html``;
    }

    const displayArea = this.getDisplayArea();
    const styles = this.getTextStyles();
    const styleString = this.stylesToString(styles);

    // Get position values
    const x = this.config.x !== undefined ? this.config.x : (this.position?.cx || 0);
    const y = this.config.y !== undefined ? this.config.y : (this.position?.cy || 0);
    const dx = this.config.dx !== undefined ? this.config.dx : 0;
    const dy = this.config.dy !== undefined ? this.config.dy : 0;
    const textAnchor = this.config.text_anchor || 'middle';
    const alignmentBaseline = this.config.alignment_baseline || 'central';
    const transform = this.config.rotate ? `rotate(${this.config.rotate})` : '';
    const visibility = this.config.visibility || 'visible';

    return svg`
      <text
        class="sak-entity-area"
        style="${styleString}"
        x="${x}"
        y="${y}"
        dx="${dx}"
        dy="${dy}"
        text-anchor="${textAnchor}"
        alignment-baseline="${alignmentBaseline}"
        transform="${transform}"
        visibility="${visibility}"
        @click="${this.handleClick}"
        @mouseenter="${this.handleMouseEnter}"
        @mouseleave="${this.handleMouseLeave}"
        @touchstart="${this.handleTouchStart}"
        @touchend="${this.handleTouchEnd}"
      >
        ${displayArea}
      </text>
    `;
  }

  /**
   * Update entity state and trigger re-render if area changed
   */
  updateEntityState(newState: EntityState): void {
    const oldArea = this.getDisplayArea();
    super.updateEntityState(newState);
    const newArea = this.getDisplayArea();

    // Only trigger update if the display area actually changed
    if (oldArea !== newArea) {
      this.requestUpdate();
    }
  }
}

// Export for registration
export default EntityAreaTool;
