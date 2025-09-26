import { beforeEach, describe, expect, it } from 'vitest';

import type { PieChartToolConfig } from '../PieChartTool.js';
import { PieChartTool } from '../PieChartTool.js';

describe('PieChartTool', () => {
  let element: PieChartTool;
  let config: PieChartToolConfig;

  beforeEach(() => {
    config = {
      type: 'pie_chart',
      position: {
        cx: 50,
        cy: 50,
        radius: 40,
      },
      segments: [
        { value: 30, label: 'Segment A', color: '#FF6B6B' },
        { value: 45, label: 'Segment B', color: '#4ECDC4' },
        { value: 25, label: 'Segment C', color: '#45B7D1' },
      ],
      chart: {
        type: 'pie',
        start_angle: -90,
        stroke_width: 2,
      },
      labels: {
        show: true,
        position: 'outside',
        font_size: 12,
      },
    };

    element = new PieChartTool();
    element.config = config;
    document.body.appendChild(element);
  });

  it('should create a pie chart tool instance', () => {
    expect(element).toBeInstanceOf(PieChartTool);
  });

  it('should have correct tool type', () => {
    expect(element.getToolType()).toBe('pie_chart');
  });

  it('should render a group element', async () => {
    await element.updateComplete;
    const group = element.shadowRoot?.querySelector('g');
    expect(group).toBeTruthy();
    expect(group?.getAttribute('class')).toBe('sak-pie-chart');
  });

  it('should render correct number of segments', async () => {
    await element.updateComplete;
    const segments = element.shadowRoot?.querySelectorAll('.sak-pie-chart__segment');
    expect(segments?.length).toBe(3);
  });

  it('should apply segment colors correctly', async () => {
    await element.updateComplete;
    const segments = element.shadowRoot?.querySelectorAll('.sak-pie-chart__segment');

    expect(segments?.[0]?.getAttribute('style')).toContain('fill: #FF6B6B');
    expect(segments?.[1]?.getAttribute('style')).toContain('fill: #4ECDC4');
    expect(segments?.[2]?.getAttribute('style')).toContain('fill: #45B7D1');
  });

  it('should render labels when configured', async () => {
    await element.updateComplete;
    const labels = element.shadowRoot?.querySelectorAll('.sak-pie-chart__label');
    expect(labels?.length).toBe(3);

    expect(labels?.[0]?.textContent?.trim()).toBe('Segment A');
    expect(labels?.[1]?.textContent?.trim()).toBe('Segment B');
    expect(labels?.[2]?.textContent?.trim()).toBe('Segment C');
  });

  it('should show labels when configured', async () => {
    element.config.labels!.show = true;
    await element.updateComplete;

    const labels = element.shadowRoot?.querySelectorAll('.sak-pie-chart__label');
    expect(labels?.length).toBe(3);
  });

  it('should handle donut chart type', async () => {
    element.config.chart!.type = 'donut';
    element.config.position.inner_radius = 20;
    await element.updateComplete;

    const segments = element.shadowRoot?.querySelectorAll('.sak-pie-chart__segment');
    expect(segments?.length).toBe(3);

    // Donut charts should have more complex paths (with inner radius)
    segments?.forEach(segment => {
      const path = segment.getAttribute('d');
      expect(path).toBeTruthy();
      expect(path?.length).toBeGreaterThan(50); // Donut paths are longer
    });
  });

  it('should calculate percentages correctly', async () => {
    // Total: 30 + 45 + 25 = 100
    // Percentages: 30%, 45%, 25%
    element.config.segments = [
      { value: 30, label: '30%' },
      { value: 45, label: '45%' },
      { value: 25, label: '25%' },
    ];

    await element.updateComplete;

    // Check that segments are calculated correctly
    const segments = element.shadowRoot?.querySelectorAll('.sak-pie-chart__segment');
    expect(segments?.length).toBe(3);

    // Each segment should have a valid path
    segments?.forEach(segment => {
      const path = segment.getAttribute('d');
      expect(path).toBeTruthy();
      expect(path?.includes('A')).toBe(true); // Should contain arc commands
    });
  });

  it('should handle empty data gracefully', async () => {
    element.config.segments = [];
    await element.updateComplete;

    const segments = element.shadowRoot?.querySelectorAll('.sak-pie-chart__segment');
    expect(segments?.length).toBe(0);
  });

  it('should handle single segment', async () => {
    element.config.segments = [{ value: 100, label: 'Full', color: '#00ff00' }];
    await element.updateComplete;

    const segments = element.shadowRoot?.querySelectorAll('.sak-pie-chart__segment');
    expect(segments?.length).toBe(1);
    expect(segments?.[0]?.getAttribute('style')).toContain('fill: #00ff00');
  });

  it('should emit events on segment interaction', async () => {
    let clickedSegment: any = null;
    element.addEventListener('segment-click', (event: any) => {
      clickedSegment = event.detail;
    });

    await element.updateComplete;

    const firstSegment = element.shadowRoot?.querySelector('.sak-pie-chart__segment');
    firstSegment?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(clickedSegment).toBeTruthy();
    expect(clickedSegment.value).toBe(30);
  });

  it('should use default colors when not specified', async () => {
    element.config.segments = [
      { value: 50 }, // No color specified
      { value: 50 }, // No color specified
    ];

    await element.updateComplete;

    const segments = element.shadowRoot?.querySelectorAll('.sak-pie-chart__segment');
    expect(segments?.length).toBe(2);

    // Should have default colors applied
    segments?.forEach(segment => {
      const style = segment.getAttribute('style');
      expect(style).toContain('fill: #');
    });
  });

  it('should handle gaps between segments', async () => {
    element.config.chart!.gap = 5; // 5 degree gap
    await element.updateComplete;

    const segments = element.shadowRoot?.querySelectorAll('.sak-pie-chart__segment');
    expect(segments?.length).toBe(3);

    // With gaps, total arc should be less than 360 degrees
    segments?.forEach(segment => {
      const path = segment.getAttribute('d');
      expect(path).toBeTruthy();
    });
  });

  it('should merge default config with user config', () => {
    expect(element.config.position.cx).toBe(50);
    expect(element.config.position.cy).toBe(50);
    expect(element.config.position.radius).toBe(40);
    expect(element.config.chart?.type).toBe('pie');
    expect(element.config.segments.length).toBe(3);
  });

  it('should handle percentage labels correctly', async () => {
    element.config.segments = [
      { value: 60 }, // No label - should show percentage
      { value: 40 }, // No label - should show percentage
    ];
    element.config.labels!.show = true;

    await element.updateComplete;

    const labels = element.shadowRoot?.querySelectorAll('.sak-pie-chart__label');
    expect(labels?.length).toBe(2);
    expect(labels?.[0]?.textContent?.trim()).toBe('60.0%');
    expect(labels?.[1]?.textContent?.trim()).toBe('40.0%');
  });
});
