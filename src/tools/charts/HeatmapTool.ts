/*
 * HeatmapTool - Modern TypeScript implementation
 * Renders heatmap visualization for time-series or grid data
 */

import { svg, type SVGTemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { Position, ToolConfig } from '../../types/SakTypes.js';
import { styleMap } from '../../utils/StyleUtils.js';
import { BaseTool } from '../base/BaseTool.js';

export interface HeatmapCell {
  x: number;
  y: number;
  value: number;
  label?: string;
  timestamp?: Date;
}

export interface HeatmapToolConfig extends ToolConfig {
  position: Position & {
    width: number;
    height: number;
    cell_size?: number;
    gap?: number;
  };
  data: HeatmapCell[];
  scale?: {
    min: number;
    max: number;
    colors?: string[]; // Color gradient
  };
  grid?: {
    rows: number;
    columns: number;
  };
  heatmap?: {
    border_radius?: number;
    opacity?: number;
  };
  labels?: {
    show?: boolean;
    font_size?: number;
    color?: string;
  };
  classes?: {
    tool?: Record<string, boolean>;
    cell?: Record<string, boolean>;
    label?: Record<string, boolean>;
  };
  styles?: {
    tool?: Record<string, string | number>;
    cell?: Record<string, string | number>;
    label?: Record<string, string | number>;
  };
}

@customElement('sak-heatmap-tool')
export class HeatmapTool extends BaseTool {
  declare config: HeatmapToolConfig;

  // Additional properties
  protected toolId = Math.random().toString(36).substr(2, 9);
  protected dev = { debug: false };
  protected minValue = 0;
  protected maxValue = 100;

  static get defaultConfig(): Partial<HeatmapToolConfig> {
    return {
      position: {
        cx: 50,
        cy: 50,
        width: 80,
        height: 40,
        cell_size: 4,
        gap: 1,
      },
      data: [],
      scale: {
        min: 0,
        max: 100,
        colors: ['#e3f2fd', '#2196f3', '#0d47a1'], // Light blue to dark blue
      },
      grid: {
        rows: 7,
        columns: 24, // 24 hours for daily heatmap
      },
      heatmap: {
        border_radius: 1,
        opacity: 1,
      },
      labels: {
        show: false,
        font_size: 8,
        color: 'var(--primary-text-color)',
      },
    };
  }

  getToolType(): string {
    return 'heatmap';
  }

  protected initializeTool(): void {
    super.initializeTool();

    // Merge default config with provided config
    this.config = this.mergeConfig(HeatmapTool.defaultConfig, this.config);

    // Initialize classes and styles
    this.initializeClasses();
    this.initializeStyles();

    // Calculate value range
    this.calculateValueRange();

    if (this.dev?.debug) {
      // eslint-disable-next-line no-console
      console.log('HeatmapTool initialized', this.config);
    }
  }

  private initializeClasses(): void {
    if (!this.config.classes) {
      this.config.classes = {};
    }
    if (!this.config.classes.tool) {
      this.config.classes.tool = { 'sak-heatmap': true, hover: true };
    }
    if (!this.config.classes.cell) {
      this.config.classes.cell = { 'sak-heatmap__cell': true };
    }
    if (!this.config.classes.label) {
      this.config.classes.label = { 'sak-heatmap__label': true };
    }
  }

  private initializeStyles(): void {
    if (!this.config.styles) {
      this.config.styles = {};
    }
    ['tool', 'cell', 'label'].forEach(key => {
      if (!this.config.styles![key]) {
        this.config.styles![key] = {};
      }
    });
  }

  private mergeConfig(defaultConfig: any, userConfig: any): HeatmapToolConfig {
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
    return merged as HeatmapToolConfig;
  }

  private calculateValueRange(): void {
    if (this.config.data.length === 0) {
      this.minValue = this.config.scale?.min || 0;
      this.maxValue = this.config.scale?.max || 100;
      return;
    }

    const values = this.config.data.map(cell => cell.value);
    this.minValue = this.config.scale?.min ?? Math.min(...values);
    this.maxValue = this.config.scale?.max ?? Math.max(...values);
  }

  private getColorForValue(value: number): string {
    const colors = this.config.scale?.colors || ['#e3f2fd', '#2196f3', '#0d47a1'];

    if (this.maxValue === this.minValue) {
      return colors[0];
    }

    const normalizedValue = (value - this.minValue) / (this.maxValue - this.minValue);
    const colorIndex = Math.min(
      Math.floor(normalizedValue * (colors.length - 1)),
      colors.length - 2
    );
    const colorProgress = normalizedValue * (colors.length - 1) - colorIndex;

    // Simple linear interpolation between colors
    if (colorProgress === 0) {
      return colors[colorIndex];
    }

    // For now, return the nearest color (could be enhanced with true color interpolation)
    return colorProgress > 0.5 ? colors[colorIndex + 1] : colors[colorIndex];
  }

  private renderCells(): SVGTemplateResult[] {
    if (this.config.data.length === 0) {
      return this.renderEmptyGrid();
    }

    const cellSize = this.config.position.cell_size || 4;
    const gap = this.config.position.gap || 1;
    const startX = this.config.position.cx - this.config.position.width / 2;
    const startY = this.config.position.cy - this.config.position.height / 2;

    return this.config.data.map((cell, index) => {
      const x = startX + cell.x * (cellSize + gap);
      const y = startY + cell.y * (cellSize + gap);
      const color = this.getColorForValue(cell.value);

      const cellStyles = {
        ...this.config.styles?.cell,
        fill: color,
        opacity: this.config.heatmap?.opacity || 1,
      };

      return svg`
        <rect
          id="cell-${this.toolId}-${index}"
          class="sak-heatmap__cell"
          x="${x}%"
          y="${y}%"
          width="${cellSize}"
          height="${cellSize}"
          rx="${this.config.heatmap?.border_radius || 0}"
          style="${styleMap(cellStyles)}"
          @click=${() => this.handleCellClick(cell, index)}
        />
      `;
    });
  }

  private renderEmptyGrid(): SVGTemplateResult[] {
    // Render empty grid when no data
    const rows = this.config.grid?.rows || 7;
    const columns = this.config.grid?.columns || 24;
    const cellSize = this.config.position.cell_size || 4;
    const gap = this.config.position.gap || 1;
    const startX = this.config.position.cx - this.config.position.width / 2;
    const startY = this.config.position.cy - this.config.position.height / 2;

    const cells: SVGTemplateResult[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const x = startX + col * (cellSize + gap);
        const y = startY + row * (cellSize + gap);

        const cellStyles = {
          ...this.config.styles?.cell,
          fill: this.config.scale?.colors?.[0] || '#f5f5f5',
          opacity: 0.3,
        };

        cells.push(svg`
          <rect
            class="sak-heatmap__cell sak-heatmap__cell--empty"
            x="${x}%"
            y="${y}%"
            width="${cellSize}"
            height="${cellSize}"
            rx="${this.config.heatmap?.border_radius || 0}"
            style="${styleMap(cellStyles)}"
          />
        `);
      }
    }

    return cells;
  }

  private handleCellClick(cell: HeatmapCell, index: number): void {
    // Emit custom event for cell interaction
    this.dispatchEvent(
      new CustomEvent('cell-click', {
        detail: { cell, index, value: cell.value },
        bubbles: true,
      })
    );

    if (this.dev?.debug) {
      // eslint-disable-next-line no-console
      console.log('Heatmap cell clicked:', cell, index);
    }
  }

  // Generate sample data for demonstration
  generateSampleData(type: 'daily' | 'weekly' | 'random' = 'daily'): void {
    const rows = this.config.grid?.rows || 7;
    const columns = this.config.grid?.columns || 24;
    const data: HeatmapCell[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        let value: number;

        switch (type) {
          case 'daily':
            // Simulate daily activity pattern
            value = Math.sin((col / 24) * Math.PI * 2) * 30 + 50 + Math.random() * 20;
            break;
          case 'weekly':
            // Simulate weekly pattern
            value = (row < 5 ? 60 : 30) + Math.random() * 40; // Weekdays vs weekends
            break;
          default:
            value = Math.random() * 100;
        }

        data.push({
          x: col,
          y: row,
          value: Math.max(0, Math.min(100, value)),
          timestamp: new Date(Date.now() - (row * 24 + col) * 60 * 60 * 1000),
        });
      }
    }

    this.config.data = data;
    this.calculateValueRange();
    this.requestUpdate();
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

  render(): SVGTemplateResult {
    this.updateDynamicStyles();

    const toolStyles = {
      ...this.config.styles?.tool,
      overflow: 'visible',
    };

    return svg`
      <g
        id="heatmap-${this.toolId || 'unknown'}"
        class="sak-heatmap"
        style="${styleMap(toolStyles)}"
        @click=${this.handleClick}
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
      >
        ${this.renderCells()}
      </g>
    `;
  }
}

// Export for use in toolset registry
export default HeatmapTool;
