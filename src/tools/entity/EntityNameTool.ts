/*
 * EntityNameTool - Modern TypeScript implementation
 * Displays entity friendly names with enhanced type safety and features
 */

import { html, svg } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { EntityState, ToolConfig } from '../../types/SakTypes.js';
import { BaseTool } from '../base/BaseTool.js';

/**
 * Configuration interface for EntityNameTool
 */
export interface EntityNameConfig extends ToolConfig {
  type: 'entity_name';
  name?: string;
  name_template?: string;
  fallback_name?: string;
  font_size?: number;
  font_weight?: string | number;
  font_family?: string;
  color?: string;
  text_anchor?: 'start' | 'middle' | 'end';
  alignment_baseline?:
    | 'auto'
    | 'baseline'
    | 'before-edge'
    | 'text-before-edge'
    | 'middle'
    | 'central'
    | 'after-edge'
    | 'text-after-edge'
    | 'ideographic'
    | 'alphabetic'
    | 'hanging'
    | 'mathematical'
    | 'inherit';
  x?: number;
  y?: number;
  dx?: number;
  dy?: number;
  rotate?: number;
  opacity?: number;
  visibility?: 'visible' | 'hidden';
}

/**
 * EntityNameTool - Modern TypeScript implementation
 * Displays entity friendly names with comprehensive styling options
 */
@customElement('sak-entity-name-tool')
export class EntityNameTool extends BaseTool {
  declare config: EntityNameConfig;

  /**
   * Get the tool type identifier
   */
  getToolType(): string {
    return 'entity_name';
  }

  /**
   * Get the display name for the entity
   * Prioritizes: config.name → entity.friendly_name → entity.entity_id → fallback
   */
  private getDisplayName(): string {
    // Use explicit name from config if provided
    if (this.config.name) {
      return this.config.name;
    }

    // Use entity friendly name if available
    if (this.entityState?.attributes?.friendly_name) {
      return this.entityState.attributes.friendly_name;
    }

    // Fall back to entity_id if available
    if (this.entityState?.entity_id) {
      return this.entityState.entity_id;
    }

    // Use fallback name if provided
    if (this.config.fallback_name) {
      return this.config.fallback_name;
    }

    // Final fallback
    return 'Unknown Entity';
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
   * Get text positioning attributes
   */
  private getTextAttributes(): Record<string, string | number> {
    const attrs: Record<string, string | number> = {};

    if (this.config.x !== undefined) {
      attrs.x = this.config.x;
    }

    if (this.config.y !== undefined) {
      attrs.y = this.config.y;
    }

    if (this.config.dx !== undefined) {
      attrs.dx = this.config.dx;
    }

    if (this.config.dy !== undefined) {
      attrs.dy = this.config.dy;
    }

    if (this.config.text_anchor) {
      attrs['text-anchor'] = this.config.text_anchor;
    }

    if (this.config.alignment_baseline) {
      attrs['alignment-baseline'] = this.config.alignment_baseline;
    }

    if (this.config.rotate !== undefined) {
      attrs.transform = `rotate(${this.config.rotate})`;
    }

    if (this.config.visibility) {
      attrs.visibility = this.config.visibility;
    }

    return attrs;
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
   * Render the entity name text element
   */
  render() {
    if (!this.isVisible) {
      return html``;
    }

    const displayName = this.getDisplayName();
    const styles = this.getTextStyles();
    const attributes = this.getTextAttributes();
    const styleString = this.stylesToString(styles);

    // Get position values
    const x = attributes.x !== undefined ? attributes.x : this.position?.cx || 0;
    const y = attributes.y !== undefined ? attributes.y : this.position?.cy || 0;
    const dx = attributes.dx !== undefined ? attributes.dx : 0;
    const dy = attributes.dy !== undefined ? attributes.dy : 0;
    const textAnchor = attributes['text-anchor'] || 'middle';
    const alignmentBaseline = attributes['alignment-baseline'] || 'central';
    const transform = attributes.transform || '';
    const visibility = attributes.visibility || 'visible';

    return svg`
      <text
        class="sak-entity-name"
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
        ${displayName}
      </text>
    `;
  }

  /**
   * Update entity state and trigger re-render if name changed
   */
  updateEntityState(newState: EntityState): void {
    const oldName = this.getDisplayName();
    super.updateEntityState(newState);
    const newName = this.getDisplayName();

    // Only trigger update if the display name actually changed
    if (oldName !== newName) {
      this.requestUpdate();
    }
  }
}

// Export for registration
export default EntityNameTool;
