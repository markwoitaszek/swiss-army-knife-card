/*
 * PieChartTool - Modern TypeScript implementation
 * Renders pie and donut charts for data visualization
 */

import { svg, type SVGTemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { Position, ToolConfig } from '../../types/SakTypes.js';
import { styleMap } from '../../utils/StyleUtils.js';
import { BaseTool } from '../base/BaseTool.js';

export interface PieChartSegment {
  value: number;
  label?: string;
  color?: string;
  entity_index?: number;
}

export interface PieChartToolConfig extends ToolConfig {
  position: Position & {
    radius: number;
    inner_radius?: number; // For donut charts
  };
  segments: PieChartSegment[];
  chart?: {
    type?: 'pie' | 'donut';
    start_angle?: number; // Starting angle in degrees
    stroke_width?: number;
    gap?: number; // Gap between segments in degrees
  };
  labels?: {
    show?: boolean;
    position?: 'inside' | 'outside' | 'none';
    font_size?: number;
    color?: string;
  };
  legend?: {
    show?: boolean;
    position?: 'right' | 'bottom' | 'left' | 'top';
  };
  classes?: {
    tool?: Record<string, boolean>;
    segment?: Record<string, boolean>;
    label?: Record<string, boolean>;
    legend?: Record<string, boolean>;
  };
  styles?: {
    tool?: Record<string, string | number>;
    segment?: Record<string, string | number>;
    label?: Record<string, string | number>;
    legend?: Record<string, string | number>;
  };
}

interface SegmentData {
  startAngle: number;
  endAngle: number;
  value: number;
  percentage: number;
  color: string;
  label?: string;
}

@customElement('sak-pie-chart-tool')
export class PieChartTool extends BaseTool {
  declare config: PieChartToolConfig;

  // Additional properties
  protected toolId = Math.random().toString(36).substr(2, 9);
  protected dev = { debug: false };
  protected segmentData: SegmentData[] = [];
  protected totalValue = 0;

  static get defaultConfig(): Partial<PieChartToolConfig> {
    return {
      position: {
        cx: 50,
        cy: 50,
        radius: 40,
        inner_radius: 0,
      },
      segments: [],
      chart: {
        type: 'pie',
        start_angle: -90, // Start at top
        stroke_width: 1,
        gap: 0,
      },
      labels: {
        show: false,
        position: 'outside',
        font_size: 10,
        color: 'var(--primary-text-color)',
      },
      legend: {
        show: false,
        position: 'right',
      },
    };
  }

  getToolType(): string {
    return 'pie_chart';
  }

  protected initializeTool(): void {
    super.initializeTool();

    // Merge default config with provided config
    this.config = this.mergeConfig(PieChartTool.defaultConfig, this.config);

    // Initialize classes and styles
    this.initializeClasses();
    this.initializeStyles();

    // Calculate segment data
    this.calculateSegments();

    if (this.dev?.debug) {
      // eslint-disable-next-line no-console
      console.log('PieChartTool initialized', this.config);
    }
  }

  private initializeClasses(): void {
    if (!this.config.classes) {
      this.config.classes = {};
    }
    if (!this.config.classes.tool) {
      this.config.classes.tool = { 'sak-pie-chart': true, hover: true };
    }
    if (!this.config.classes.segment) {
      this.config.classes.segment = { 'sak-pie-chart__segment': true };
    }
    if (!this.config.classes.label) {
      this.config.classes.label = { 'sak-pie-chart__label': true };
    }
    if (!this.config.classes.legend) {
      this.config.classes.legend = { 'sak-pie-chart__legend': true };
    }
  }

  private initializeStyles(): void {
    if (!this.config.styles) {
      this.config.styles = {};
    }
    ['tool', 'segment', 'label', 'legend'].forEach(key => {
      if (!this.config.styles![key]) {
        this.config.styles![key] = {};
      }
    });
  }

  private mergeConfig(defaultConfig: any, userConfig: any): PieChartToolConfig {
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
    return merged as PieChartToolConfig;
  }

  private calculateSegments(): void {
    this.segmentData = [];
    this.totalValue = 0;

    // Calculate total value
    this.config.segments.forEach(segment => {
      this.totalValue += Math.abs(segment.value);
    });

    if (this.totalValue === 0) return;

    // Calculate angles for each segment
    let currentAngle = this.config.chart?.start_angle || -90;
    const gap = this.config.chart?.gap || 0;

    this.config.segments.forEach((segment, index) => {
      const percentage = Math.abs(segment.value) / this.totalValue;
      const segmentAngle = (360 - this.config.segments.length * gap) * percentage;

      this.segmentData.push({
        startAngle: currentAngle,
        endAngle: currentAngle + segmentAngle,
        value: segment.value,
        percentage,
        color: segment.color || this.getDefaultColor(index),
        label: segment.label,
      });

      currentAngle += segmentAngle + gap;
    });
  }

  private getDefaultColor(index: number): string {
    const defaultColors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E9',
    ];
    return defaultColors[index % defaultColors.length];
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

  private createArcPath(
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    innerRadius = 0
  ): string {
    const start = this.polarToCartesian(centerX, centerY, radius, endAngle);
    const end = this.polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    if (innerRadius > 0) {
      // Donut chart path
      const innerStart = this.polarToCartesian(centerX, centerY, innerRadius, endAngle);
      const innerEnd = this.polarToCartesian(centerX, centerY, innerRadius, startAngle);

      return `
        M ${start.x} ${start.y} 
        A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}
        L ${innerEnd.x} ${innerEnd.y}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y}
        Z
      `.trim();
    } else {
      // Pie chart path
      return `
        M ${centerX} ${centerY}
        L ${start.x} ${start.y}
        A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}
        Z
      `.trim();
    }
  }

  private renderSegments(): SVGTemplateResult[] {
    if (this.segmentData.length === 0) {
      return [];
    }

    const centerX = this.config.position.cx;
    const centerY = this.config.position.cy;
    const radius = this.config.position.radius;
    const innerRadius = this.config.position.inner_radius || 0;

    return this.segmentData.map((segment, index) => {
      const path = this.createArcPath(
        centerX,
        centerY,
        radius,
        segment.startAngle,
        segment.endAngle,
        innerRadius
      );

      const segmentStyles = {
        ...this.config.styles?.segment,
        fill: segment.color,
        stroke: 'var(--card-background-color)',
        'stroke-width': this.config.chart?.stroke_width || 1,
        opacity: this.isHovered ? 0.8 : 1,
        cursor: 'pointer',
      };

      return svg`
        <path
          id="segment-${this.toolId}-${index}"
          class="sak-pie-chart__segment"
          d="${path}"
          style="${styleMap(segmentStyles)}"
          @click=${() => this.handleSegmentClick(segment, index)}
          @mouseenter=${() => this.handleSegmentHover(segment, index)}
        />
      `;
    });
  }

  private renderLabels(): SVGTemplateResult[] {
    if (!this.config.labels?.show || this.segmentData.length === 0) {
      return [];
    }

    const centerX = this.config.position.cx;
    const centerY = this.config.position.cy;
    const radius = this.config.position.radius;
    const labelPosition = this.config.labels.position || 'outside';
    const labelRadius = labelPosition === 'inside' ? radius * 0.7 : radius * 1.2;

    return this.segmentData.map((segment, index) => {
      const midAngle = (segment.startAngle + segment.endAngle) / 2;
      const labelPos = this.polarToCartesian(centerX, centerY, labelRadius, midAngle);

      const labelStyles = {
        ...this.config.styles?.label,
        'font-size': `${this.config.labels?.font_size || 10}px`,
        fill: this.config.labels?.color || 'var(--primary-text-color)',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
      };

      const labelText = segment.label || `${(segment.percentage * 100).toFixed(1)}%`;

      return svg`
        <text
          id="label-${this.toolId}-${index}"
          class="sak-pie-chart__label"
          x="${labelPos.x}%"
          y="${labelPos.y}%"
          style="${styleMap(labelStyles)}"
        >
          ${labelText}
        </text>
      `;
    });
  }

  private handleSegmentClick(segment: SegmentData, index: number): void {
    // Emit custom event for segment interaction
    this.dispatchEvent(
      new CustomEvent('segment-click', {
        detail: { segment, index, value: segment.value },
        bubbles: true,
      })
    );

    if (this.dev?.debug) {
      // eslint-disable-next-line no-console
      console.log('PieChart segment clicked:', segment, index);
    }
  }

  private handleSegmentHover(segment: SegmentData, index: number): void {
    // Emit custom event for segment hover
    this.dispatchEvent(
      new CustomEvent('segment-hover', {
        detail: { segment, index, value: segment.value },
        bubbles: true,
      })
    );
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

  // Update chart when entity states change
  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has('entityState')) {
      // Recalculate segments if entity data changes
      this.calculateSegments();
      this.requestUpdate();
    }
  }

  render(): SVGTemplateResult {
    this.updateDynamicStyles();

    const toolStyles = {
      ...this.config.styles?.tool,
      overflow: 'visible',
    };

    return svg`
      <g
        id="pie-chart-${this.toolId || 'unknown'}"
        class="sak-pie-chart"
        style="${styleMap(toolStyles)}"
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
      >
        ${this.renderSegments()}
        ${this.renderLabels()}
      </g>
    `;
  }
}

// Export for use in toolset registry
export default PieChartTool;
