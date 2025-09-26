/*
 * LayoutTemplates - Pre-defined layout templates for common SAK card patterns
 * Provides ready-to-use layouts for typical use cases
 */

import type { GridLayoutConfig, LayoutItem, ResponsiveLayoutConfig } from './LayoutManager.js';

export interface LayoutTemplate {
  name: string;
  description: string;
  config: GridLayoutConfig | ResponsiveLayoutConfig;
  defaultItems: LayoutItem[];
  preview?: string; // SVG or description for UI
}

/**
 * Collection of pre-defined layout templates
 */
export class LayoutTemplates {
  private static templates: Map<string, LayoutTemplate> = new Map();

  static {
    this.registerDefaultTemplates();
  }

  private static registerDefaultTemplates(): void {
    // Simple centered card layout
    this.register({
      name: 'simple-card',
      description: 'Simple centered layout for basic cards',
      config: {
        type: 'grid',
        columns: 3,
        rows: 3,
        gap: 2,
        alignment: 'center',
        justify: 'center',
      },
      defaultItems: [
        {
          id: 'icon',
          position: { cx: 50, cy: 30 },
          gridArea: { column: 2, row: 1 },
        },
        {
          id: 'name',
          position: { cx: 50, cy: 50 },
          gridArea: { column: 2, row: 2 },
        },
        {
          id: 'state',
          position: { cx: 50, cy: 70 },
          gridArea: { column: 2, row: 3 },
        },
      ],
    });

    // Dashboard tile with multiple elements
    this.register({
      name: 'dashboard-tile',
      description: 'Comprehensive dashboard tile with multiple data points',
      config: {
        type: 'grid',
        columns: 4,
        rows: 3,
        gap: 1,
        alignment: 'stretch',
        justify: 'space-between',
      },
      defaultItems: [
        {
          id: 'icon',
          position: { cx: 25, cy: 25 },
          gridArea: { column: 1, row: 1 },
        },
        {
          id: 'name',
          position: { cx: 75, cy: 25 },
          gridArea: { column: 2, row: 1, columnSpan: 3 },
        },
        {
          id: 'main-value',
          position: { cx: 50, cy: 50 },
          gridArea: { column: 1, row: 2, columnSpan: 2 },
        },
        {
          id: 'secondary-value',
          position: { cx: 75, cy: 50 },
          gridArea: { column: 3, row: 2, columnSpan: 2 },
        },
        {
          id: 'control',
          position: { cx: 50, cy: 75 },
          gridArea: { column: 1, row: 3, columnSpan: 4 },
        },
      ],
    });

    // Compact info card
    this.register({
      name: 'compact-info',
      description: 'Compact horizontal layout for minimal space',
      config: {
        type: 'grid',
        columns: 4,
        rows: 1,
        gap: 1,
        alignment: 'center',
        justify: 'space-between',
      },
      defaultItems: [
        {
          id: 'icon',
          position: { cx: 12.5, cy: 50 },
          gridArea: { column: 1, row: 1 },
        },
        {
          id: 'name',
          position: { cx: 37.5, cy: 50 },
          gridArea: { column: 2, row: 1 },
        },
        {
          id: 'state',
          position: { cx: 62.5, cy: 50 },
          gridArea: { column: 3, row: 1 },
        },
        {
          id: 'control',
          position: { cx: 87.5, cy: 50 },
          gridArea: { column: 4, row: 1 },
        },
      ],
    });

    // Responsive card that adapts to screen size
    this.register({
      name: 'responsive-card',
      description: 'Responsive layout that adapts to different screen sizes',
      config: {
        type: 'responsive',
        breakpoints: {
          mobile: {
            type: 'grid',
            columns: 1,
            rows: 4,
            gap: 3,
            alignment: 'center',
          },
          tablet: {
            type: 'grid',
            columns: 2,
            rows: 2,
            gap: 2,
            alignment: 'center',
          },
          desktop: {
            type: 'grid',
            columns: 4,
            rows: 1,
            gap: 1,
            alignment: 'center',
          },
        },
      },
      defaultItems: [
        {
          id: 'icon',
          position: { cx: 50, cy: 25 },
          gridArea: { column: 1, row: 1 },
          responsive: {
            mobile: { gridArea: { column: 1, row: 1 } },
            tablet: { gridArea: { column: 1, row: 1 } },
            desktop: { gridArea: { column: 1, row: 1 } },
          },
        },
        {
          id: 'name',
          position: { cx: 50, cy: 50 },
          gridArea: { column: 1, row: 2 },
          responsive: {
            mobile: { gridArea: { column: 1, row: 2 } },
            tablet: { gridArea: { column: 2, row: 1 } },
            desktop: { gridArea: { column: 2, row: 1 } },
          },
        },
        {
          id: 'state',
          position: { cx: 50, cy: 75 },
          gridArea: { column: 1, row: 3 },
          responsive: {
            mobile: { gridArea: { column: 1, row: 3 } },
            tablet: { gridArea: { column: 1, row: 2 } },
            desktop: { gridArea: { column: 3, row: 1 } },
          },
        },
        {
          id: 'control',
          position: { cx: 50, cy: 100 },
          gridArea: { column: 1, row: 4 },
          responsive: {
            mobile: { gridArea: { column: 1, row: 4 } },
            tablet: { gridArea: { column: 2, row: 2 } },
            desktop: { gridArea: { column: 4, row: 1 } },
          },
        },
      ],
    });

    // Gauge dashboard layout
    this.register({
      name: 'gauge-dashboard',
      description: 'Layout optimized for gauge and circular visualizations',
      config: {
        type: 'grid',
        columns: 2,
        rows: 2,
        gap: 4,
        alignment: 'center',
        justify: 'center',
      },
      defaultItems: [
        {
          id: 'main-gauge',
          position: { cx: 50, cy: 50 },
          gridArea: { column: 1, row: 1, columnSpan: 2 },
        },
        {
          id: 'secondary-gauge-1',
          position: { cx: 25, cy: 75 },
          gridArea: { column: 1, row: 2 },
        },
        {
          id: 'secondary-gauge-2',
          position: { cx: 75, cy: 75 },
          gridArea: { column: 2, row: 2 },
        },
      ],
    });

    // Chart layout for data visualization
    this.register({
      name: 'chart-layout',
      description: 'Layout optimized for charts and data visualization',
      config: {
        type: 'grid',
        columns: 1,
        rows: 4,
        gap: 2,
        alignment: 'stretch',
        justify: 'center',
      },
      defaultItems: [
        {
          id: 'title',
          position: { cx: 50, cy: 12.5 },
          gridArea: { column: 1, row: 1 },
        },
        {
          id: 'chart',
          position: { cx: 50, cy: 50 },
          gridArea: { column: 1, row: 2, rowSpan: 2 },
        },
        {
          id: 'legend',
          position: { cx: 50, cy: 87.5 },
          gridArea: { column: 1, row: 4 },
        },
      ],
    });
  }

  static register(template: LayoutTemplate): void {
    this.templates.set(template.name, template);
  }

  static get(name: string): LayoutTemplate | undefined {
    return this.templates.get(name);
  }

  static getAll(): LayoutTemplate[] {
    return Array.from(this.templates.values());
  }

  static getByCategory(
    category: 'simple' | 'dashboard' | 'responsive' | 'specialized'
  ): LayoutTemplate[] {
    const categoryMap = {
      simple: ['simple-card', 'compact-info'],
      dashboard: ['dashboard-tile', 'gauge-dashboard'],
      responsive: ['responsive-card'],
      specialized: ['chart-layout'],
    };

    return categoryMap[category]
      .map(name => this.get(name))
      .filter((template): template is LayoutTemplate => template !== undefined);
  }

  static createCustomTemplate(
    name: string,
    description: string,
    columns: number,
    rows: number,
    items: Array<{ id: string; column: number; row: number; columnSpan?: number; rowSpan?: number }>
  ): LayoutTemplate {
    return {
      name,
      description,
      config: {
        type: 'grid',
        columns,
        rows,
        gap: 2,
        alignment: 'center',
        justify: 'center',
      },
      defaultItems: items.map(item => ({
        id: item.id,
        position: { cx: 50, cy: 50 }, // Will be calculated by grid
        gridArea: {
          column: item.column,
          row: item.row,
          columnSpan: item.columnSpan,
          rowSpan: item.rowSpan,
        },
      })),
    };
  }
}

// Export template constants for easy reference
export const LAYOUT_TEMPLATES = {
  SIMPLE_CARD: 'simple-card',
  DASHBOARD_TILE: 'dashboard-tile',
  COMPACT_INFO: 'compact-info',
  RESPONSIVE_CARD: 'responsive-card',
  GAUGE_DASHBOARD: 'gauge-dashboard',
  CHART_LAYOUT: 'chart-layout',
} as const;
