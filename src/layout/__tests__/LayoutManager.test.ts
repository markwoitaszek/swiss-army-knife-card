import { beforeEach, describe, expect, it } from 'vitest';

import type { GridLayoutConfig, LayoutItem } from '../LayoutManager.js';
import { LayoutManager, LayoutTemplates } from '../LayoutManager.js';

// Mock window for responsive testing
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

describe('LayoutManager', () => {
  let layoutManager: LayoutManager;
  let gridConfig: GridLayoutConfig;

  beforeEach(() => {
    gridConfig = {
      type: 'grid',
      columns: 3,
      rows: 3,
      gap: 2,
      padding: 4,
      alignment: 'center',
      justify: 'space-between',
    };

    layoutManager = new LayoutManager(gridConfig);
  });

  it('should create a layout manager instance', () => {
    expect(layoutManager).toBeInstanceOf(LayoutManager);
  });

  it('should add and retrieve layout items', () => {
    const item: LayoutItem = {
      id: 'test-item',
      position: { cx: 50, cy: 50 },
      gridArea: { column: 2, row: 2 },
    };

    layoutManager.addItem(item);
    const retrieved = layoutManager.getItem('test-item');
    expect(retrieved).toEqual(item);
  });

  it('should remove layout items', () => {
    const item: LayoutItem = {
      id: 'test-item',
      position: { cx: 50, cy: 50 },
    };

    layoutManager.addItem(item);
    expect(layoutManager.getItem('test-item')).toBeTruthy();

    layoutManager.removeItem('test-item');
    expect(layoutManager.getItem('test-item')).toBeUndefined();
  });

  it('should calculate grid positions correctly', () => {
    const item: LayoutItem = {
      id: 'grid-item',
      position: { cx: 0, cy: 0 }, // Will be overridden by grid calculation
      gridArea: { column: 2, row: 2 },
    };

    const position = layoutManager.calculateGridPosition(item);

    // For a 3x3 grid, column 2 row 2 should be center
    // Column 2: (2-1) * 33.33 + 33.33/2 = 33.33 + 16.67 = 50
    // Row 2: (2-1) * 33.33 + 33.33/2 = 33.33 + 16.67 = 50
    expect(position.cx).toBeCloseTo(50, 1);
    expect(position.cy).toBeCloseTo(50, 1);
  });

  it('should calculate grid positions for spanning items', () => {
    const item: LayoutItem = {
      id: 'spanning-item',
      position: { cx: 0, cy: 0 },
      gridArea: { column: 1, row: 1, columnSpan: 2, rowSpan: 2 },
    };

    const position = layoutManager.calculateGridPosition(item);

    // Spanning 2x2 from top-left should center in that area
    // Column span 2: 0 + (66.67/2) = 33.33
    // Row span 2: 0 + (66.67/2) = 33.33
    expect(position.cx).toBeCloseTo(33.33, 1);
    expect(position.cy).toBeCloseTo(33.33, 1);
  });

  it('should validate grid layout correctly', () => {
    // Add valid items
    layoutManager.addItem({
      id: 'valid-item',
      position: { cx: 50, cy: 50 },
      gridArea: { column: 1, row: 1 },
    });

    let validation = layoutManager.validateLayout();
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);

    // Add invalid item that exceeds grid
    layoutManager.addItem({
      id: 'invalid-item',
      position: { cx: 50, cy: 50 },
      gridArea: { column: 3, row: 3, columnSpan: 2 }, // Would exceed 3 columns
    });

    validation = layoutManager.validateLayout();
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('Item invalid-item exceeds grid columns');
  });

  it('should handle absolute positioning', () => {
    const absoluteConfig = {
      type: 'absolute' as const,
      bounds: { width: 200, height: 100 },
    };

    const absoluteLayout = new LayoutManager(absoluteConfig);
    const item: LayoutItem = {
      id: 'abs-item',
      position: { cx: 75, cy: 25 },
    };

    const position = absoluteLayout.calculateGridPosition(item);
    expect(position).toEqual({ cx: 75, cy: 25 });
  });

  it('should generate layout templates', () => {
    const simpleTemplate = layoutManager.generateLayoutTemplate(LayoutTemplates.SIMPLE_CARD);
    expect(simpleTemplate.type).toBe('grid');
    expect((simpleTemplate as GridLayoutConfig).columns).toBe(3);
    expect((simpleTemplate as GridLayoutConfig).rows).toBe(3);

    const dashboardTemplate = layoutManager.generateLayoutTemplate(LayoutTemplates.DASHBOARD_TILE);
    expect((dashboardTemplate as GridLayoutConfig).columns).toBe(4);
    expect((dashboardTemplate as GridLayoutConfig).rows).toBe(4);
  });

  it('should handle responsive breakpoints', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', { value: 600 });
    const responsiveLayout = new LayoutManager({
      type: 'responsive',
      breakpoints: {
        mobile: { type: 'grid', columns: 1, rows: 4 },
        desktop: { type: 'grid', columns: 4, rows: 1 },
      },
    });

    // Should detect mobile breakpoint
    (responsiveLayout as any).updateBreakpoint();
    expect((responsiveLayout as any).currentBreakpoint).toBe('mobile');

    // Mock desktop viewport
    Object.defineProperty(window, 'innerWidth', { value: 1200 });
    (responsiveLayout as any).updateBreakpoint();
    expect((responsiveLayout as any).currentBreakpoint).toBe('desktop');
  });

  it('should handle layout groups', () => {
    const group = {
      id: 'test-group',
      items: [
        { id: 'item1', position: { cx: 25, cy: 25 } },
        { id: 'item2', position: { cx: 75, cy: 75 } },
      ],
      transform: {
        scale: 1.2,
        rotate: 45,
        translate: { x: 10, y: 20 },
      },
    };

    layoutManager.addGroup(group);

    // Should be able to retrieve the group
    expect((layoutManager as any).groups.get('test-group')).toEqual(group);
  });

  it('should update layout configuration', () => {
    const newConfig: GridLayoutConfig = {
      type: 'grid',
      columns: 4,
      rows: 2,
      gap: 5,
    };

    layoutManager.updateLayout(newConfig);
    expect((layoutManager as any).config).toEqual(newConfig);
  });

  it('should handle items without grid area in grid layout', () => {
    const item: LayoutItem = {
      id: 'no-grid-area',
      position: { cx: 60, cy: 40 },
      // No gridArea specified
    };

    const position = layoutManager.calculateGridPosition(item);
    // Should return original position when no grid area
    expect(position).toEqual({ cx: 60, cy: 40 });
  });

  it('should validate layout with no errors for valid configuration', () => {
    // Empty layout should be valid
    const validation = layoutManager.validateLayout();
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should handle responsive item positioning', () => {
    const responsiveItem: LayoutItem = {
      id: 'responsive-item',
      position: { cx: 50, cy: 50 },
      responsive: {
        mobile: { position: { cx: 25, cy: 75 } },
        desktop: { position: { cx: 75, cy: 25 } },
      },
    };

    // Mock mobile
    (layoutManager as any).currentBreakpoint = 'mobile';
    let position = layoutManager.calculateResponsivePosition(responsiveItem);
    expect(position).toEqual({ cx: 25, cy: 75 });

    // Mock desktop
    (layoutManager as any).currentBreakpoint = 'desktop';
    position = layoutManager.calculateResponsivePosition(responsiveItem);
    expect(position).toEqual({ cx: 75, cy: 25 });
  });

  it('should fall back to default position for responsive items without breakpoint config', () => {
    const item: LayoutItem = {
      id: 'fallback-item',
      position: { cx: 50, cy: 50 },
      responsive: {
        mobile: { position: { cx: 25, cy: 25 } },
        // No desktop config
      },
    };

    (layoutManager as any).currentBreakpoint = 'desktop';
    const position = layoutManager.calculateResponsivePosition(item);
    expect(position).toEqual({ cx: 50, cy: 50 }); // Falls back to default
  });
});
