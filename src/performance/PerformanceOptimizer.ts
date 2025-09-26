/*
 * PerformanceOptimizer - Performance optimization system for SAK cards
 * Provides memory management, rendering optimization, and performance monitoring
 */

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  toolCount: number;
  updateFrequency: number;
  lastUpdate: number;
}

export interface OptimizationConfig {
  enableVirtualization?: boolean;
  maxRenderItems?: number;
  updateThrottleMs?: number;
  enableMemoryMonitoring?: boolean;
  enableRenderOptimization?: boolean;
  lazyLoadThreshold?: number;
}

export class PerformanceOptimizer {
  private metrics: PerformanceMetrics;
  private config: OptimizationConfig;
  private renderQueue: Set<() => void> = new Set();
  private updateThrottleTimer: number | null = null;
  private memoryMonitorInterval: number | null = null;
  private observer: IntersectionObserver | null = null;

  constructor(config: OptimizationConfig = {}) {
    this.config = {
      enableVirtualization: true,
      maxRenderItems: 100,
      updateThrottleMs: 16, // 60fps
      enableMemoryMonitoring: true,
      enableRenderOptimization: true,
      lazyLoadThreshold: 0.1,
      ...config,
    };

    this.metrics = {
      renderTime: 0,
      memoryUsage: 0,
      bundleSize: 0,
      toolCount: 0,
      updateFrequency: 0,
      lastUpdate: Date.now(),
    };

    this.setupPerformanceMonitoring();
  }

  // Public API
  optimizeRender(renderFn: () => void): void {
    if (!this.config.enableRenderOptimization) {
      renderFn();
      return;
    }

    // Add to render queue
    this.renderQueue.add(renderFn);

    // Throttle updates
    if (this.updateThrottleTimer) {
      return;
    }

    this.updateThrottleTimer = window.setTimeout(() => {
      this.flushRenderQueue();
      this.updateThrottleTimer = null;
    }, this.config.updateThrottleMs);
  }

  private flushRenderQueue(): void {
    const startTime = performance.now();

    // Execute all queued renders
    this.renderQueue.forEach(renderFn => {
      try {
        renderFn();
      } catch (error) {
        console.error('Render function failed:', error);
      }
    });

    this.renderQueue.clear();

    // Update metrics
    const endTime = performance.now();
    this.metrics.renderTime = endTime - startTime;
    this.metrics.lastUpdate = Date.now();
    this.updateMetrics();
  }

  // Memory optimization
  enableMemoryMonitoring(): void {
    if (!this.config.enableMemoryMonitoring || this.memoryMonitorInterval) {
      return;
    }

    this.memoryMonitorInterval = window.setInterval(() => {
      this.updateMemoryMetrics();
    }, 5000); // Check every 5 seconds
  }

  disableMemoryMonitoring(): void {
    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
      this.memoryMonitorInterval = null;
    }
  }

  private updateMemoryMetrics(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }
  }

  // Virtualization for large datasets
  virtualizeItems<T>(
    items: T[],
    renderItem: (item: T, index: number) => HTMLElement,
    container: HTMLElement
  ): void {
    if (!this.config.enableVirtualization || items.length <= this.config.maxRenderItems!) {
      // Render all items if virtualization is disabled or item count is small
      items.forEach((item, index) => {
        const element = renderItem(item, index);
        container.appendChild(element);
      });
      return;
    }

    // Setup intersection observer for lazy loading
    this.setupIntersectionObserver(items, renderItem, container);
  }

  private setupIntersectionObserver<T>(
    items: T[],
    renderItem: (item: T, index: number) => HTMLElement,
    container: HTMLElement
  ): void {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            const item = items[index];
            if (item) {
              const element = renderItem(item, index);
              entry.target.replaceWith(element);
            }
          }
        });
      },
      { threshold: this.config.lazyLoadThreshold }
    );

    // Create placeholder elements
    items.forEach((_, index) => {
      const placeholder = document.createElement('div');
      placeholder.setAttribute('data-index', index.toString());
      placeholder.style.minHeight = '20px'; // Prevent layout shift
      container.appendChild(placeholder);
      this.observer!.observe(placeholder);
    });
  }

  // Bundle optimization
  analyzeBundleSize(): Promise<PerformanceMetrics> {
    return new Promise(resolve => {
      // Estimate bundle size based on loaded modules
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      let totalSize = 0;

      const promises = scripts.map(script => {
        return fetch((script as HTMLScriptElement).src, { method: 'HEAD' })
          .then(response => {
            const size = response.headers.get('content-length');
            return size ? parseInt(size, 10) : 0;
          })
          .catch(() => 0);
      });

      Promise.all(promises).then(sizes => {
        totalSize = sizes.reduce((sum, size) => sum + size, 0);
        this.metrics.bundleSize = totalSize / 1024; // KB
        resolve(this.metrics);
      });
    });
  }

  // Rendering optimization
  optimizeRenderingPipeline(): void {
    // Enable will-change for animated elements
    const animatedElements = document.querySelectorAll('[class*="sak-"]:hover, [class*="animate"]');
    animatedElements.forEach(element => {
      (element as HTMLElement).style.willChange = 'transform, opacity';
    });

    // Optimize reflows and repaints
    this.batchDOMUpdates();
  }

  private batchDOMUpdates(): void {
    // Use requestAnimationFrame for DOM updates
    let pendingUpdates: (() => void)[] = [];
    let rafId: number | null = null;

    const flushUpdates = () => {
      pendingUpdates.forEach(update => update());
      pendingUpdates = [];
      rafId = null;
    };

    // Expose batched update function
    (window as any).sakBatchUpdate = (updateFn: () => void) => {
      pendingUpdates.push(updateFn);
      if (!rafId) {
        rafId = requestAnimationFrame(flushUpdates);
      }
    };
  }

  // Performance monitoring
  private setupPerformanceMonitoring(): void {
    // Monitor render performance
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'measure' && entry.name.includes('sak')) {
            this.metrics.renderTime = Math.max(this.metrics.renderTime, entry.duration);
          }
        });
      });

      observer.observe({ entryTypes: ['measure'] });
    }

    // Enable memory monitoring if configured
    if (this.config.enableMemoryMonitoring) {
      this.enableMemoryMonitoring();
    }
  }

  // Performance measurement utilities
  measureRender<T>(name: string, renderFn: () => T): T {
    performance.mark(`${name}-start`);
    const result = renderFn();
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    return result;
  }

  // Debounce utility for frequent updates
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: number | null = null;

    return (...args: Parameters<T>) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = window.setTimeout(() => {
        func(...args);
        timeout = null;
      }, wait);
    };
  }

  // Throttle utility for high-frequency events
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }

  // Resource cleanup
  cleanup(): void {
    if (this.updateThrottleTimer) {
      clearTimeout(this.updateThrottleTimer);
    }

    this.disableMemoryMonitoring();

    if (this.observer) {
      this.observer.disconnect();
    }

    this.renderQueue.clear();
  }

  // Metrics access
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  updateMetrics(): void {
    this.metrics.toolCount = document.querySelectorAll('[class*="sak-"]').length;
    this.metrics.updateFrequency = Date.now() - this.metrics.lastUpdate;
  }

  // Performance recommendations
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.renderTime > 16) {
      recommendations.push('Consider reducing the number of tools or enabling virtualization');
    }

    if (this.metrics.memoryUsage > 50) {
      recommendations.push('Memory usage is high - consider cleanup of unused resources');
    }

    if (this.metrics.toolCount > 50) {
      recommendations.push('Large number of tools detected - consider using virtualization');
    }

    if (this.metrics.updateFrequency < 16) {
      recommendations.push('High update frequency detected - consider throttling updates');
    }

    return recommendations;
  }

  // Export performance report
  generatePerformanceReport(): {
    metrics: PerformanceMetrics;
    recommendations: string[];
    timestamp: string;
  } {
    return {
      metrics: this.getMetrics(),
      recommendations: this.getPerformanceRecommendations(),
      timestamp: new Date().toISOString(),
    };
  }
}

// Export optimization presets
export const OPTIMIZATION_PRESETS = {
  HIGH_PERFORMANCE: {
    enableVirtualization: true,
    maxRenderItems: 50,
    updateThrottleMs: 8, // 120fps
    enableMemoryMonitoring: true,
    enableRenderOptimization: true,
    lazyLoadThreshold: 0.05,
  },
  BALANCED: {
    enableVirtualization: true,
    maxRenderItems: 100,
    updateThrottleMs: 16, // 60fps
    enableMemoryMonitoring: true,
    enableRenderOptimization: true,
    lazyLoadThreshold: 0.1,
  },
  BATTERY_SAVER: {
    enableVirtualization: true,
    maxRenderItems: 25,
    updateThrottleMs: 33, // 30fps
    enableMemoryMonitoring: false,
    enableRenderOptimization: true,
    lazyLoadThreshold: 0.2,
  },
} as const;

export default PerformanceOptimizer;
