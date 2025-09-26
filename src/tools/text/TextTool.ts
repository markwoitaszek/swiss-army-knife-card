/*
 * TextTool - Modern TypeScript implementation
 * Renders text SVG element with configurable styling, positioning, and dynamic content
 */

import { svg, type SVGTemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { Position, ToolConfig } from '../../types/SakTypes.js';
import { styleMap } from '../../utils/StyleUtils.js';
import { BaseTool } from '../base/BaseTool.js';

export interface TextToolConfig extends ToolConfig {
  position: Position;
  text?: string;
  font_size?: number | string;
  font_family?: string;
  font_weight?: string | number;
  text_anchor?: 'start' | 'middle' | 'end';
  dominant_baseline?: 'auto' | 'middle' | 'hanging' | 'central' | 'text-top' | 'text-bottom';
  text_decoration?: 'none' | 'underline' | 'overline' | 'line-through';
  text_transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  letter_spacing?: number | string;
  line_height?: number | string;
  text_styles?: {
    fill?: string;
    stroke?: string;
    stroke_width?: number;
    opacity?: number;
  };
  classes?: {
    tool?: Record<string, boolean>;
    text?: Record<string, boolean>;
  };
  styles?: {
    tool?: Record<string, string | number>;
    text?: Record<string, string | number>;
  };
}

@customElement('sak-text-tool')
export class TextTool extends BaseTool {
  declare config: TextToolConfig;

  // Additional properties
  protected toolId = Math.random().toString(36).substr(2, 9);
  protected dev = { debug: false };
  protected textContentValue = '';

  static get defaultConfig(): Partial<TextToolConfig> {
    return {
      position: {
        cx: 50,
        cy: 50,
      },
      text: 'Text',
      font_size: 12,
      font_family: 'var(--primary-font-family, sans-serif)',
      font_weight: 'normal',
      text_anchor: 'middle',
      dominant_baseline: 'central',
      text_decoration: 'none',
      text_transform: 'none',
      text_styles: {
        fill: 'var(--primary-text-color)',
        stroke: 'none',
        stroke_width: 0,
        opacity: 1,
      },
    };
  }

  getToolType(): string {
    return 'text';
  }

  protected initializeTool(): void {
    super.initializeTool();

    // Merge default config with provided config
    this.config = this.mergeConfig(TextTool.defaultConfig, this.config);

    // Initialize classes and styles
    this.initializeClasses();
    this.initializeStyles();

    // Set initial text content
    this.updateTextContent();

    if (this.dev?.debug) {
      // eslint-disable-next-line no-console
      console.log('TextTool initialized', this.config);
    }
  }

  private initializeClasses(): void {
    // Initialize default classes
    if (!this.config.classes) {
      this.config.classes = {};
    }
    if (!this.config.classes.tool) {
      this.config.classes.tool = { 'sak-text': true };
    }
    if (!this.config.classes.text) {
      this.config.classes.text = { 'sak-text__text': true, hover: false };
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
    if (!this.config.styles.text) {
      this.config.styles.text = {};
    }
  }

  private mergeConfig(defaultConfig: any, userConfig: any): TextToolConfig {
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

    return merged as TextToolConfig;
  }

  private updateTextContent(): void {
    // Process text content with template support
    this.textContentValue = this.processTextTemplate(this.config.text || '');
  }

  private processTextTemplate(text: string): string {
    // Basic template processing - this would be expanded for full template support
    if (!text || typeof text !== 'string') return '';

    // Handle entity state templates like [[entity.state]]
    if (text.includes('[[') && text.includes(']]') && this.entityState) {
      return text.replace(/\[\[([^\]]+)\]\]/g, (match, template) => {
        // Basic entity state replacement
        if (template === 'entity.state' || template.endsWith('.state')) {
          return this.entityState?.state || '';
        }
        if (template.includes('.attributes.')) {
          const attrName = template.split('.attributes.')[1];
          return this.entityState?.attributes?.[attrName] || '';
        }
        return match; // Return original if no match
      });
    }

    return text;
  }

  private renderText(): SVGTemplateResult {
    // Apply dynamic styling based on entity state
    this.updateDynamicStyles();
    this.updateTextContent();

    const textStyles = {
      ...this.config.styles?.text,
      ...this.getDynamicTextStyles(),
    };

    return svg`
      <text>
        <tspan
          class="sak-text__text"
          x="${this.config.position.cx}%"
          y="${this.config.position.cy}%"
          style="${styleMap(textStyles)}"
        >
          ${this.textContentValue}
        </tspan>
      </text>
    `;
  }

  private getDynamicTextStyles(): Record<string, string | number> {
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
    if (this.config.text_decoration) {
      styles['text-decoration'] = this.config.text_decoration;
    }
    if (this.config.text_transform) {
      styles['text-transform'] = this.config.text_transform;
    }
    if (this.config.letter_spacing) {
      styles['letter-spacing'] =
        typeof this.config.letter_spacing === 'number'
          ? `${this.config.letter_spacing}px`
          : this.config.letter_spacing;
    }
    if (this.config.line_height) {
      styles['line-height'] = this.config.line_height;
    }

    // Apply base text styles
    if (this.config.text_styles?.fill) {
      styles.fill = this.config.text_styles.fill;
    }
    if (this.config.text_styles?.stroke) {
      styles.stroke = this.config.text_styles.stroke;
    }
    if (this.config.text_styles?.stroke_width) {
      styles['stroke-width'] = this.config.text_styles.stroke_width;
    }
    if (this.config.text_styles?.opacity !== undefined) {
      styles.opacity = this.config.text_styles.opacity;
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

  // Override to update text when entity state changes
  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has('entityState')) {
      this.updateTextContent();
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
        id="text-${this.toolId || 'unknown'}"
        class="sak-text"
        style="${styleMap(toolStyles)}"
        @click=${this.handleClick}
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
        @touchstart=${this.handleTouchStart}
        @touchend=${this.handleTouchEnd}
      >
        ${this.renderText()}
      </g>
    `;
  }
}

// Export for use in toolset registry
export default TextTool;
