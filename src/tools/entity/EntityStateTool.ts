/*
 * EntityStateTool - Modern TypeScript implementation
 * Renders entity state with formatting, units, and styling
 */

import { svg, type SVGTemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { Position, ToolConfig } from '../../types/SakTypes.js';
import { styleMap } from '../../utils/StyleUtils.js';
import { BaseTool } from '../base/BaseTool.js';

export interface EntityStateToolConfig extends ToolConfig {
  position: Position;
  show?: {
    uom?: 'end' | 'bottom' | 'none';
  };
  format?: string;
  precision?: number;
  font_size?: number | string;
  font_family?: string;
  font_weight?: string | number;
  text_anchor?: 'start' | 'middle' | 'end';
  dominant_baseline?: 'auto' | 'middle' | 'hanging' | 'central' | 'text-top' | 'text-bottom';
  state_styles?: {
    fill?: string;
    stroke?: string;
    stroke_width?: number;
    opacity?: number;
  };
  uom_styles?: {
    fill?: string;
    stroke?: string;
    stroke_width?: number;
    opacity?: number;
    font_size?: number | string;
  };
  classes?: {
    tool?: Record<string, boolean>;
    state?: Record<string, boolean>;
    uom?: Record<string, boolean>;
  };
  styles?: {
    tool?: Record<string, string | number>;
    state?: Record<string, string | number>;
    uom?: Record<string, string | number>;
  };
}

@customElement('sak-entity-state-tool')
export class EntityStateTool extends BaseTool {
  declare config: EntityStateToolConfig;

  // Additional properties
  protected toolId = Math.random().toString(36).substr(2, 9);
  protected dev = { debug: false };
  protected formattedState = '';
  protected unitOfMeasurement = '';

  static get defaultConfig(): Partial<EntityStateToolConfig> {
    return {
      position: {
        cx: 50,
        cy: 50,
      },
      show: {
        uom: 'end',
      },
      font_size: 12,
      font_family: 'var(--primary-font-family, sans-serif)',
      font_weight: 'normal',
      text_anchor: 'middle',
      dominant_baseline: 'central',
      precision: 1,
      state_styles: {
        fill: 'var(--primary-text-color)',
        stroke: 'none',
        stroke_width: 0,
        opacity: 1,
      },
      uom_styles: {
        fill: 'var(--secondary-text-color)',
        stroke: 'none',
        stroke_width: 0,
        opacity: 0.8,
        font_size: '0.8em',
      },
    };
  }

  getToolType(): string {
    return 'entity_state';
  }

  protected initializeTool(): void {
    super.initializeTool();

    // Merge default config with provided config
    this.config = this.mergeConfig(EntityStateTool.defaultConfig, this.config);

    // Initialize classes and styles
    this.initializeClasses();
    this.initializeStyles();

    // Set initial state values
    this.updateStateValues();

    if (this.dev?.debug) {
      // eslint-disable-next-line no-console
      console.log('EntityStateTool initialized', this.config);
    }
  }

  private initializeClasses(): void {
    // Initialize default classes
    if (!this.config.classes) {
      this.config.classes = {};
    }
    if (!this.config.classes.tool) {
      this.config.classes.tool = { 'sak-state': true, hover: true };
    }
    if (!this.config.classes.state) {
      this.config.classes.state = { 'sak-state__value': true };
    }
    if (!this.config.classes.uom) {
      this.config.classes.uom = { 'sak-state__uom': true };
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
    if (!this.config.styles.state) {
      this.config.styles.state = {};
    }
    if (!this.config.styles.uom) {
      this.config.styles.uom = {};
    }
  }

  private mergeConfig(defaultConfig: any, userConfig: any): EntityStateToolConfig {
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

    return merged as EntityStateToolConfig;
  }

  private updateStateValues(): void {
    if (!this.entityState) {
      this.formattedState = 'unavailable';
      this.unitOfMeasurement = '';
      return;
    }

    // Format the state value
    this.formattedState = this.formatStateValue(this.entityState.state);

    // Get unit of measurement
    this.unitOfMeasurement = this.entityState.attributes?.unit_of_measurement || '';
  }

  private formatStateValue(state: string | number): string {
    if (state === null || state === undefined) return 'unavailable';
    if (state === 'unknown') return 'unknown';
    if (state === 'unavailable') return 'unavailable';

    // Handle numeric values with precision
    if (typeof state === 'number' || !isNaN(Number(state))) {
      const numValue = Number(state);
      const precision = this.config.precision ?? 1;
      return numValue.toFixed(precision);
    }

    // Handle string states
    return String(state);
  }

  private renderState(): SVGTemplateResult {
    // Apply dynamic styling based on entity state
    this.updateDynamicStyles();
    this.updateStateValues();

    const stateStyles = {
      ...this.config.styles?.state,
      ...this.getDynamicStateStyles(),
    };

    const showUom = this.config.show?.uom !== 'none';
    const uomPosition = this.config.show?.uom || 'end';

    return svg`
      <text>
        <tspan
          class="sak-state__value"
          x="${this.config.position.cx}%"
          y="${this.config.position.cy}%"
          style="${styleMap(stateStyles)}"
        >
          ${this.formattedState}${
            showUom && uomPosition === 'end' && this.unitOfMeasurement
              ? ` ${this.unitOfMeasurement}`
              : ''
          }
        </tspan>
        ${
          showUom && uomPosition === 'bottom' && this.unitOfMeasurement
            ? svg`
            <tspan
              class="sak-state__uom"
              x="${this.config.position.cx}%"
              y="${this.config.position.cy + 15}%"
              style="${styleMap(this.getDynamicUomStyles())}"
            >
              ${this.unitOfMeasurement}
            </tspan>`
            : ''
        }
      </text>
    `;
  }

  private getDynamicStateStyles(): Record<string, string | number> {
    const styles: Record<string, string | number> = {};

    // Apply typography styles
    if (this.config.font_size) {
      styles['font-size'] =
        typeof this.config.font_size === 'number'
          ? `${this.config.font_size}px`
          : this.config.font_size;
    }
    if (this.config.font_family) {
      styles['font-family'] = this.config.font_family;
    }
    if (this.config.font_weight) {
      styles['font-weight'] = this.config.font_weight;
    }
    if (this.config.text_anchor) {
      styles['text-anchor'] = this.config.text_anchor;
    }
    if (this.config.dominant_baseline) {
      styles['dominant-baseline'] = this.config.dominant_baseline;
    }

    // Apply base state styles
    if (this.config.state_styles?.fill) {
      styles.fill = this.config.state_styles.fill;
    }
    if (this.config.state_styles?.stroke) {
      styles.stroke = this.config.state_styles.stroke;
    }
    if (this.config.state_styles?.stroke_width) {
      styles['stroke-width'] = this.config.state_styles.stroke_width;
    }
    if (this.config.state_styles?.opacity !== undefined) {
      styles.opacity = this.config.state_styles.opacity;
    }

    // Apply hover effects
    if (this.isHovered) {
      styles.opacity = Number(styles.opacity || 1) * 0.8;
    }

    return styles;
  }

  private getDynamicUomStyles(): Record<string, string | number> {
    const styles: Record<string, string | number> = {};

    // Apply UOM-specific styles
    if (this.config.uom_styles?.font_size) {
      styles['font-size'] =
        typeof this.config.uom_styles.font_size === 'number'
          ? `${this.config.uom_styles.font_size}px`
          : this.config.uom_styles.font_size;
    }
    if (this.config.uom_styles?.fill) {
      styles.fill = this.config.uom_styles.fill;
    }
    if (this.config.uom_styles?.stroke) {
      styles.stroke = this.config.uom_styles.stroke;
    }
    if (this.config.uom_styles?.stroke_width) {
      styles['stroke-width'] = this.config.uom_styles.stroke_width;
    }
    if (this.config.uom_styles?.opacity !== undefined) {
      styles.opacity = this.config.uom_styles.opacity;
    }

    // Apply typography styles from main config if not overridden
    if (!styles['font-family'] && this.config.font_family) {
      styles['font-family'] = this.config.font_family;
    }
    if (!styles['text-anchor'] && this.config.text_anchor) {
      styles['text-anchor'] = this.config.text_anchor;
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

  // Override to update state when entity changes
  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has('entityState')) {
      this.updateStateValues();
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
        id="entity-state-${this.toolId || 'unknown'}"
        class="sak-state"
        style="${styleMap(toolStyles)}"
        @click=${this.handleClick}
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
        @touchstart=${this.handleTouchStart}
        @touchend=${this.handleTouchEnd}
      >
        ${this.renderState()}
      </g>
    `;
  }
}

// Export for use in toolset registry
export default EntityStateTool;
