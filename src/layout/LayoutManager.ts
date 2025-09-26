/*
 * LayoutManager - Modern layout system for SAK cards
 * Provides grid-based, responsive, and flexible tool positioning
 */

import type { TemplateResult } from 'lit';
import { html } from 'lit';
import type { Position } from '../types/SakTypes.js';
import { styleMap } from '../utils/StyleUtils.js';

export interface GridLayoutConfig {
  type: 'grid';
  columns: number;
  rows: number;
  gap?: number;
  padding?: number;
  alignment?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
}

export interface AbsoluteLayoutConfig {
  type: 'absolute';
  bounds?: {
    width: number;
    height: number;
  };
}

export interface ResponsiveLayoutConfig {
  type: 'responsive';
  breakpoints: {
    mobile?: LayoutConfig;
    tablet?: LayoutConfig;
    desktop?: LayoutConfig;
  };
}

export type LayoutConfig = GridLayoutConfig | AbsoluteLayoutConfig | ResponsiveLayoutConfig;

export interface LayoutItem {
  id: string;
  position: Position;
  size?: {
    width: number;
    height: number;
  };
  gridArea?: {
    column: number;
    row: number;
    columnSpan?: number;
    rowSpan?: number;
  };
  responsive?: {
    mobile?: Partial<LayoutItem>;
    tablet?: Partial<LayoutItem>;
    desktop?: Partial<LayoutItem>;
  };
}

export interface LayoutGroup {
  id: string;
  items: LayoutItem[];
  transform?: {
    scale?: number;
    rotate?: number;
    translate?: { x: number; y: number };
  };
}

export class LayoutManager {
  private config: LayoutConfig;
  private items: Map<string, LayoutItem> = new Map();
  private groups: Map<string, LayoutGroup> = new Map();
  private currentBreakpoint: 'mobile' | 'tablet' | 'desktop' = 'desktop';

  constructor(config: LayoutConfig) {
    this.config = config;
    this.setupResponsiveListeners();
  }

  // Public API
  addItem(item: LayoutItem): void {
    this.items.set(item.id, item);
  }

  removeItem(id: string): void {
    this.items.delete(id);
  }

  getItem(id: string): LayoutItem | undefined {
    return this.items.get(id);
  }

  addGroup(group: LayoutGroup): void {
    this.groups.set(group.id, group);
  }

  removeGroup(id: string): void {
    this.groups.delete(id);
  }

  updateLayout(config: LayoutConfig): void {
    this.config = config;
  }

  // Layout calculation methods
  calculateGridPosition(item: LayoutItem): Position {
    if (this.config.type !== 'grid' || !item.gridArea) {
      return item.position;
    }

    const gridConfig = this.config as GridLayoutConfig;
    const { column, row, columnSpan = 1, rowSpan = 1 } = item.gridArea;

    // Calculate cell dimensions
    const cellWidth = 100 / gridConfig.columns;
    const cellHeight = 100 / gridConfig.rows;

    // Calculate position based on grid
    const cx = (column - 1) * cellWidth + (cellWidth * columnSpan) / 2;
    const cy = (row - 1) * cellHeight + (cellHeight * rowSpan) / 2;

    return { cx, cy };
  }

  calculateResponsivePosition(item: LayoutItem): Position {
    const responsiveConfig = item.responsive?.[this.currentBreakpoint];
    if (responsiveConfig?.position) {
      return responsiveConfig.position;
    }
    return item.position;
  }

  // Template generation
  generateLayoutTemplate(templateName: string): LayoutConfig {
    const templates: Record<string, LayoutConfig> = {
      'simple-card': {
        type: 'grid',
        columns: 3,
        rows: 3,
        gap: 2,
        alignment: 'center',
        justify: 'center',
      },
      'dashboard-tile': {
        type: 'grid',
        columns: 4,
        rows: 4,
        gap: 1,
        alignment: 'stretch',
        justify: 'space-between',
      },
      'compact-info': {
        type: 'absolute',
        bounds: {
          width: 100,
          height: 50,
        },
      },
      'responsive-card': {
        type: 'responsive',
        breakpoints: {
          mobile: {
            type: 'grid',
            columns: 2,
            rows: 4,
            gap: 3,
          },
          tablet: {
            type: 'grid',
            columns: 3,
            rows: 3,
            gap: 2,
          },
          desktop: {
            type: 'grid',
            columns: 4,
            rows: 2,
            gap: 1,
          },
        },
      },
    };

    return templates[templateName] || templates['simple-card'];
  }

  // Responsive handling
  private setupResponsiveListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize.bind(this));
      this.updateBreakpoint();
    }
  }

  private handleResize(): void {
    this.updateBreakpoint();
  }

  private updateBreakpoint(): void {
    const width = window.innerWidth;

    if (width < 768) {
      this.currentBreakpoint = 'mobile';
    } else if (width < 1024) {
      this.currentBreakpoint = 'tablet';
    } else {
      this.currentBreakpoint = 'desktop';
    }
  }

  // Validation
  validateLayout(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.config.type === 'grid') {
      const gridConfig = this.config as GridLayoutConfig;
      if (gridConfig.columns <= 0 || gridConfig.rows <= 0) {
        errors.push('Grid layout must have positive columns and rows');
      }
    }

    // Validate items fit within layout bounds
    this.items.forEach((item, id) => {
      if (this.config.type === 'grid' && item.gridArea) {
        const gridConfig = this.config as GridLayoutConfig;
        const { column, row, columnSpan = 1, rowSpan = 1 } = item.gridArea;

        if (column + columnSpan - 1 > gridConfig.columns) {
          errors.push(`Item ${id} exceeds grid columns`);
        }
        if (row + rowSpan - 1 > gridConfig.rows) {
          errors.push(`Item ${id} exceeds grid rows`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Rendering
  renderLayout(): TemplateResult {
    const layoutStyles = this.getLayoutStyles();

    return html`
      <div class="sak-layout sak-layout--${this.config.type}" style="${styleMap(layoutStyles)}">
        ${this.renderItems()} ${this.renderGroups()}
      </div>
    `;
  }

  private getLayoutStyles(): Record<string, string | number> {
    const baseStyles: Record<string, string | number> = {
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    };

    if (this.config.type === 'grid') {
      const gridConfig = this.config as GridLayoutConfig;
      return {
        ...baseStyles,
        display: 'grid',
        'grid-template-columns': `repeat(${gridConfig.columns}, 1fr)`,
        'grid-template-rows': `repeat(${gridConfig.rows}, 1fr)`,
        gap: `${gridConfig.gap || 0}px`,
        padding: `${gridConfig.padding || 0}px`,
        'align-items': gridConfig.alignment || 'stretch',
        'justify-content': gridConfig.justify || 'stretch',
      };
    }

    return baseStyles;
  }

  private renderItems(): TemplateResult[] {
    return Array.from(this.items.values()).map(item => {
      const position = this.calculateItemPosition(item);
      const styles = this.getItemStyles(item, position);

      return html`
        <div id="layout-item-${item.id}" class="sak-layout-item" style="${styleMap(styles)}">
          <!-- Tool content would be rendered here -->
        </div>
      `;
    });
  }

  private renderGroups(): TemplateResult[] {
    return Array.from(this.groups.values()).map(group => {
      const styles = this.getGroupStyles(group);

      return html`
        <div id="layout-group-${group.id}" class="sak-layout-group" style="${styleMap(styles)}">
          ${group.items.map(item => {
            const position = this.calculateItemPosition(item);
            const itemStyles = this.getItemStyles(item, position);
            return html`
              <div
                id="group-item-${item.id}"
                class="sak-layout-group-item"
                style="${styleMap(itemStyles)}"
              >
                <!-- Tool content would be rendered here -->
              </div>
            `;
          })}
        </div>
      `;
    });
  }

  private calculateItemPosition(item: LayoutItem): Position {
    switch (this.config.type) {
      case 'grid':
        return this.calculateGridPosition(item);
      case 'responsive':
        return this.calculateResponsivePosition(item);
      default:
        return item.position;
    }
  }

  private getItemStyles(item: LayoutItem, position: Position): Record<string, string | number> {
    const styles: Record<string, string | number> = {};

    if (this.config.type === 'grid' && item.gridArea) {
      const { column, row, columnSpan = 1, rowSpan = 1 } = item.gridArea;
      styles['grid-column'] = `${column} / span ${columnSpan}`;
      styles['grid-row'] = `${row} / span ${rowSpan}`;
    } else {
      styles.position = 'absolute';
      styles.left = `${position.cx}%`;
      styles.top = `${position.cy}%`;
      styles.transform = 'translate(-50%, -50%)';
    }

    if (item.size) {
      styles.width = `${item.size.width}px`;
      styles.height = `${item.size.height}px`;
    }

    return styles;
  }

  private getGroupStyles(group: LayoutGroup): Record<string, string | number> {
    const styles: Record<string, string | number> = {
      position: 'relative',
    };

    if (group.transform) {
      const transforms: string[] = [];

      if (group.transform.scale) {
        transforms.push(`scale(${group.transform.scale})`);
      }
      if (group.transform.rotate) {
        transforms.push(`rotate(${group.transform.rotate}deg)`);
      }
      if (group.transform.translate) {
        transforms.push(
          `translate(${group.transform.translate.x}px, ${group.transform.translate.y}px)`
        );
      }

      if (transforms.length > 0) {
        styles.transform = transforms.join(' ');
      }
    }

    return styles;
  }

  // Utility methods
  private styleMap(styles: Record<string, string | number>): string {
    return Object.entries(styles)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
  }
}

// Export layout templates for easy use
export const LayoutTemplates = {
  SIMPLE_CARD: 'simple-card',
  DASHBOARD_TILE: 'dashboard-tile',
  COMPACT_INFO: 'compact-info',
  RESPONSIVE_CARD: 'responsive-card',
} as const;
