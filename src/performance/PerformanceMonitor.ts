/*
 * PerformanceMonitor - Runtime performance monitoring and optimization
 * Tracks rendering performance, memory usage, and interaction response times
 */

/**
 * Interface for performance metrics
 */
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  interactionTime: number;
  toolCount: number;
  timestamp: number;
}

/**
 * Interface for performance thresholds
 */
export interface PerformanceThresholds {
  maxRenderTime: number; // 16ms for 60fps
  maxInteractionTime: number; // 100ms
  maxMemoryGrowth: number; // 1MB per hour
  warningThreshold: number; // 80% of max
}

/**
 * PerformanceMonitor class for tracking and optimizing runtime performance
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private thresholds: PerformanceThresholds = {
    maxRenderTime: 16, // 60fps
    maxInteractionTime: 100,
    maxMemoryGrowth: 1024 * 1024, // 1MB
    warningThreshold: 0.8,
  };

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Measure rendering performance for a tool
   * @param toolType - Type of tool being rendered
   * @param renderFn - Function that performs the rendering
   * @returns Result of render function
   */
  measureRender<T>(toolType: string, renderFn: () => T): T {
    const start = performance.now();
    const result = renderFn();
    const end = performance.now();
    const renderTime = end - start;

    // Log warning if render time exceeds threshold
    if (renderTime > this.thresholds.maxRenderTime) {
      console.warn(
        `🐌 Slow render: ${toolType} took ${renderTime.toFixed(2)}ms (target: ${this.thresholds.maxRenderTime}ms)`
      );
    }

    // Record metrics
    this.recordMetric({
      renderTime,
      memoryUsage: this.getMemoryUsage(),
      interactionTime: 0,
      toolCount: this.getActiveToolCount(),
      timestamp: Date.now(),
    });

    return result;
  }

  /**
   * Measure interaction response time
   * @param interactionType - Type of interaction
   * @param interactionFn - Function that handles the interaction
   * @returns Result of interaction function
   */
  measureInteraction<T>(interactionType: string, interactionFn: () => T): T {
    const start = performance.now();
    const result = interactionFn();
    const end = performance.now();
    const interactionTime = end - start;

    // Log warning if interaction time exceeds threshold
    if (interactionTime > this.thresholds.maxInteractionTime) {
      console.warn(
        `🐌 Slow interaction: ${interactionType} took ${interactionTime.toFixed(2)}ms (target: ${this.thresholds.maxInteractionTime}ms)`
      );
    }

    return result;
  }

  /**
   * Get current memory usage
   * @returns Memory usage in bytes
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Get count of active tool instances
   * @returns Number of active tools
   */
  private getActiveToolCount(): number {
    // In a real implementation, this would count actual tool instances
    return document.querySelectorAll('[class*="sak-"]').length;
  }

  /**
   * Record performance metric
   * @param metric - Performance metric to record
   */
  private recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only last 100 metrics to prevent memory growth
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  /**
   * Get performance summary
   * @returns Performance summary statistics
   */
  getPerformanceSummary(): {
    averageRenderTime: number;
    maxRenderTime: number;
    memoryTrend: 'stable' | 'growing' | 'declining';
    recommendationsCount: number;
    status: 'good' | 'warning' | 'critical';
  } {
    if (this.metrics.length === 0) {
      return {
        averageRenderTime: 0,
        maxRenderTime: 0,
        memoryTrend: 'stable',
        recommendationsCount: 0,
        status: 'good',
      };
    }

    const renderTimes = this.metrics.map(m => m.renderTime);
    const averageRenderTime = renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;
    const maxRenderTime = Math.max(...renderTimes);

    // Analyze memory trend
    const recentMetrics = this.metrics.slice(-10);
    const memoryTrend = this.analyzeMemoryTrend(recentMetrics);

    // Determine status
    let status: 'good' | 'warning' | 'critical' = 'good';
    let recommendationsCount = 0;

    if (averageRenderTime > this.thresholds.maxRenderTime * this.thresholds.warningThreshold) {
      status = 'warning';
      recommendationsCount++;
    }

    if (averageRenderTime > this.thresholds.maxRenderTime) {
      status = 'critical';
      recommendationsCount++;
    }

    if (memoryTrend === 'growing') {
      recommendationsCount++;
      if (status === 'good') status = 'warning';
    }

    return {
      averageRenderTime,
      maxRenderTime,
      memoryTrend,
      recommendationsCount,
      status,
    };
  }

  /**
   * Analyze memory usage trend
   * @param metrics - Recent metrics to analyze
   * @returns Memory trend classification
   */
  private analyzeMemoryTrend(metrics: PerformanceMetrics[]): 'stable' | 'growing' | 'declining' {
    if (metrics.length < 5) return 'stable';

    const first = metrics[0].memoryUsage;
    const last = metrics[metrics.length - 1].memoryUsage;
    const growth = last - first;
    const threshold = this.thresholds.maxMemoryGrowth / 10; // 10% of hourly limit

    if (growth > threshold) return 'growing';
    if (growth < -threshold) return 'declining';
    return 'stable';
  }

  /**
   * Get optimization recommendations based on current performance
   * @returns Array of actionable recommendations
   */
  getOptimizationRecommendations(): string[] {
    const summary = this.getPerformanceSummary();
    const recommendations: string[] = [];

    if (summary.averageRenderTime > this.thresholds.maxRenderTime * 0.8) {
      recommendations.push('Consider optimizing render methods for better 60fps performance');
    }

    if (summary.memoryTrend === 'growing') {
      recommendations.push('Memory usage is growing - check for memory leaks');
    }

    if (summary.maxRenderTime > this.thresholds.maxRenderTime * 2) {
      recommendations.push('Some renders are very slow - implement caching or optimization');
    }

    return recommendations;
  }

  /**
   * Clear recorded metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Export metrics for external analysis
   * @returns Current metrics array
   */
  exportMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
