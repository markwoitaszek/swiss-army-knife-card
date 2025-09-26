/*
 * SparklineBarChartTool - Modern TypeScript implementation
 * Renders bar chart visualization for historical entity data
 */

import { svg, type SVGTemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { Position, ToolConfig } from '../../types/SakTypes.js';
import { styleMap } from '../../utils/StyleUtils.js';
import { BaseTool } from '../base/BaseTool.js';

export interface SparklineBarChartToolConfig extends ToolConfig {
  position: Position & {
    width: number;
    height: number;
    margin?: number;
    orientation?: 'vertical' | 'horizontal';
  };
  hours?: number;
  barhours?: number;
  color?: string;
  show?: {
    style?: 'fixedcolor' | 'colorstops' | 'minmaxgradient';
  };
  colorstops?: Array<{
    stop: number;
    color: string;
  }>;
  bar_styles?: {
    stroke?: string;
    stroke_width?: number;
    opacity?: number;
  };
  classes?: {
    tool?: Record<string, boolean>;
    bar?: Record<string, boolean>;
    line?: Record<string, boolean>;
  };
  styles?: {
    tool?: Record<string, string | number>;
    bar?: Record<string, string | number>;
    line?: Record<string, string | number>;
  };
}

interface BarData {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  value: number;
}

interface ScaleData {
  min: number;
  max: number;
  size: number;
}

@customElement('sak-sparkline-barchart-tool')
export class SparklineBarChartTool extends BaseTool {
  declare config: SparklineBarChartToolConfig;

  // Additional properties
  protected toolId = Math.random().toString(36).substr(2, 9);
  protected dev = { debug: false };
  protected _data: number[] = [];
  protected _bars: BarData[] = [];
  protected _series: number[] = [];
  protected _scale: ScaleData = { min: 0, max: 0, size: 0 };
  protected _needsRendering = false;

  static get defaultConfig(): Partial<SparklineBarChartToolConfig> {
    return {
      position: {
        cx: 50,
        cy: 50,
        width: 50,
        height: 25,
        margin: 0.5,
        orientation: 'vertical',
      },
      hours: 24,
      barhours: 1,
      color: 'var(--primary-color)',
      show: {
        style: 'fixedcolor',
      },
      colorstops: [],
      bar_styles: {
        stroke: 'var(--primary-color)',
        stroke_width: 1,
        opacity: 1,
      },
    };
  }

  getToolType(): string {
    return 'sparkline_barchart';
  }

  protected initializeTool(): void {
    super.initializeTool();

    // Merge default config with provided config
    this.config = this.mergeConfig(SparklineBarChartTool.defaultConfig, this.config);

    // Initialize classes and styles
    this.initializeClasses();
    this.initializeStyles();

    // Calculate bar dimensions
    this.calculateBarDimensions();

    if (this.dev?.debug) {
      // eslint-disable-next-line no-console
      console.log('SparklineBarChartTool initialized', this.config);
    }
  }

  private initializeClasses(): void {
    if (!this.config.classes) {
      this.config.classes = {};
    }
    if (!this.config.classes.tool) {
      this.config.classes.tool = { 'sak-barchart': true, hover: true };
    }
    if (!this.config.classes.bar) {
      this.config.classes.bar = {};
    }
    if (!this.config.classes.line) {
      this.config.classes.line = { 'sak-barchart__line': true, hover: true };
    }
  }

  private initializeStyles(): void {
    if (!this.config.styles) {
      this.config.styles = {};
    }
    if (!this.config.styles.tool) {
      this.config.styles.tool = {};
    }
    if (!this.config.styles.bar) {
      this.config.styles.bar = {};
    }
    if (!this.config.styles.line) {
      this.config.styles.line = {};
    }
  }

  private mergeConfig(defaultConfig: any, userConfig: any): SparklineBarChartToolConfig {
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
    return merged as SparklineBarChartToolConfig;
  }

  private calculateBarDimensions(): void {
    const margin = this.config.position.margin || 0.5;
    const orientation = this.config.position.orientation || 'vertical';
    const hours = this.config.hours || 24;
    const barhours = this.config.barhours || 1;

    const theWidth =
      orientation === 'vertical' ? this.config.position.width : this.config.position.height;

    // Calculate bar width based on available space and margins
    const numBars = hours / barhours;
    const totalMarginSpace = (numBars - 1) * margin;
    const availableSpace = theWidth - totalMarginSpace;

    // Store calculated dimensions for rendering
    this._barWidth = availableSpace / numBars;
  }

  private _barWidth = 0;

  /**
   * Set historical data for the bar chart
   */
  setData(data: number[]): void {
    this._data = [...data];
    this._series = [...data];
    this.computeMinMax();
    this.calculateBars();
    this._needsRendering = true;
    this.requestUpdate();
  }

  private computeMinMax(): void {
    if (this._series.length === 0) {
      this._scale = { min: 0, max: 0, size: 0 };
      return;
    }

    let min = this._series[0];
    let max = this._series[0];

    for (let i = 1; i < this._series.length; i++) {
      const v = this._series[i];
      min = v < min ? v : min;
      max = v > max ? v : max;
    }

    this._scale.min = min;
    this._scale.max = max;
    this._scale.size = max - min;

    // Add 5% padding to the scale
    if (this._scale.size > 0) {
      const padding = this._scale.size * 0.05;
      this._scale.min -= padding;
      this._scale.size += padding * 2;
    }
  }

  private calculateBars(): void {
    this._bars = [];

    if (this._series.length === 0) return;

    const orientation = this.config.position.orientation || 'vertical';
    const margin = this.config.position.margin || 0.5;

    // Calculate base position (top-left corner of chart area)
    const baseX = this.config.position.cx - this.config.position.width / 2;
    const baseY = this.config.position.cy - this.config.position.height / 2;

    this._series.forEach((value, index) => {
      if (orientation === 'vertical') {
        // Vertical bars
        const x = baseX + index * (this._barWidth + margin);
        const barHeight =
          this._scale.size > 0
            ? ((value - this._scale.min) / this._scale.size) * this.config.position.height
            : 0;

        this._bars.push({
          x1: x,
          x2: x,
          y1: baseY + this.config.position.height,
          y2: baseY + this.config.position.height - barHeight,
          value,
        });
      } else {
        // Horizontal bars
        const y = baseY + index * (this._barWidth + margin);
        const barWidth =
          this._scale.size > 0
            ? ((value - this._scale.min) / this._scale.size) * this.config.position.width
            : 0;

        this._bars.push({
          x1: baseX,
          x2: baseX + barWidth,
          y1: y,
          y2: y,
          value,
        });
      }
    });
  }

  private getColorFromState(value: number): string {
    const showStyle = this.config.show?.style || 'fixedcolor';

    switch (showStyle) {
      case 'fixedcolor':
        return this.config.color || 'var(--primary-color)';

      case 'colorstops':
        return this.getColorFromColorStops(value);

      case 'minmaxgradient':
        return this.getColorFromMinMaxGradient(value);

      default:
        return this.config.color || 'var(--primary-color)';
    }
  }

  private getColorFromColorStops(value: number): string {
    const colorstops = this.config.colorstops || [];
    if (colorstops.length === 0) {
      return this.config.color || 'var(--primary-color)';
    }

    // Find the appropriate color stop
    for (let i = 0; i < colorstops.length; i++) {
      if (value <= colorstops[i].stop) {
        return colorstops[i].color;
      }
    }

    // Return last color if value exceeds all stops
    return colorstops[colorstops.length - 1].color;
  }

  private getColorFromMinMaxGradient(value: number): string {
    if (this._scale.size === 0) {
      return this.config.color || 'var(--primary-color)';
    }

    // Calculate position in range (0-1)
    const position = (value - this._scale.min) / this._scale.size;

    // Simple gradient from blue (low) to red (high)
    const red = Math.round(position * 255);
    const blue = Math.round((1 - position) * 255);

    return `rgb(${red}, 0, ${blue})`;
  }

  private renderBars(): SVGTemplateResult[] {
    if (this._bars.length === 0) {
      return [];
    }

    return this._bars.map((bar, index) => {
      const strokeColor = this.getColorFromState(bar.value);
      const barStyles = {
        ...this.config.styles?.bar,
        stroke: strokeColor,
        'stroke-width': this.config.bar_styles?.stroke_width || 1,
        opacity: this.config.bar_styles?.opacity || 1,
      };

      return svg`
        <line
          id="bar-${this.toolId}-${index}"
          class="sak-barchart__line"
          x1="${bar.x1}%"
          x2="${bar.x2}%"
          y1="${bar.y1}%"
          y2="${bar.y2}%"
          style="${styleMap(barStyles)}"
        />
      `;
    });
  }

  private updateDynamicStyles(): void {
    if (this.entityState) {
      this.applyEntityStateColors();
    }
    this.applyAnimationClasses();
  }

  private applyEntityStateColors(): void {
    // Implementation for entity state-based coloring
    if (this.config.entity_index !== undefined && this.entityState) {
      // TODO: Implement color mapping logic from original
    }
  }

  private applyAnimationClasses(): void {
    if (this.config.animation) {
      // TODO: Implement animation class logic
    }
  }

  // Override to update chart when entity state changes
  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has('entityState')) {
      // In a real implementation, this would fetch historical data
      // For now, we'll generate sample data
      this.generateSampleData();
      this.requestUpdate();
    }
  }

  private generateSampleData(): void {
    // Generate sample data for demonstration
    // In real implementation, this would come from Home Assistant history
    const hours = this.config.hours || 24;
    const sampleData: number[] = [];

    for (let i = 0; i < hours; i++) {
      // Generate realistic sample data
      sampleData.push(Math.random() * 100 + Math.sin(i / 4) * 20 + 50);
    }

    this.setData(sampleData);
  }

  render(): SVGTemplateResult {
    this.updateDynamicStyles();

    const toolStyles = {
      ...this.config.styles?.tool,
      overflow: 'visible',
    };

    return svg`
      <g
        id="sparkline-barchart-${this.toolId || 'unknown'}"
        class="sak-barchart"
        style="${styleMap(toolStyles)}"
        @click=${this.handleClick}
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
        @touchstart=${this.handleTouchStart}
        @touchend=${this.handleTouchEnd}
      >
        ${this.renderBars()}
      </g>
    `;
  }
}

// Export for use in toolset registry
export default SparklineBarChartTool;
