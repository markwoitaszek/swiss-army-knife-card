/*
 * Modern Build Configuration
 * Advanced build optimizations and configurations
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';

// Build performance monitoring
const buildStartTime = Date.now();

export const buildConfig = {
  // Performance optimizations
  performance: {
    // Enable build caching
    cache: true,
    // Parallel processing
    parallel: true,
    // Memory optimization
    maxMemory: 4096,
  },

  // Bundle analysis
  analysis: {
    enabled: process.env.ANALYZE === 'true',
    output: 'dist/analysis.html',
  },

  // Build targets
  targets: {
    modern: 'es2022',
    legacy: 'es2015',
  },

  // Optimization settings
  optimization: {
    // Tree shaking
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false,
    },
    
    // Minification
    minify: {
      enabled: true,
      options: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
          passes: 2,
        },
        mangle: {
          safari10: true,
          properties: {
            regex: /^_/,
          },
        },
        format: {
          comments: false,
        },
      },
    },

    // Code splitting
    codeSplitting: {
      enabled: true,
      chunks: {
        vendor: ['lit', 'home-assistant-js-websocket'],
        utils: ['@mdi/js', '@formatjs/intl-utils', '@tanem/svg-injector', 'memoize-one'],
      },
    },
  },

  // Source maps
  sourcemaps: {
    development: 'inline',
    production: true,
  },

  // Build monitoring
  monitoring: {
    enabled: process.env.BUILD_MONITOR === 'true',
    metrics: {
      buildTime: true,
      bundleSize: true,
      chunkCount: true,
      dependencyCount: true,
    },
  },
};

// Build performance monitoring
export const buildMonitor = {
  start: () => {
    console.log('🚀 Build started at:', new Date().toISOString());
    return Date.now();
  },
  
  end: (startTime) => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`✅ Build completed in ${duration}ms`);
    
    if (buildConfig.monitoring.enabled) {
      console.log('📊 Build Metrics:');
      console.log(`   Duration: ${duration}ms`);
      console.log(`   Memory: ${process.memoryUsage().heapUsed / 1024 / 1024}MB`);
    }
    
    return duration;
  },
};

// Export configuration
export default buildConfig;
