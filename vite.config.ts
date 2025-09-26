import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode, command }) => {
  const isDev = command === 'serve';
  const isProd = mode === 'production';

  return {
    plugins: [
      dts({
        insertTypesEntry: true,
        include: ['src/**/*'],
        exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/test/**/*'],
        rollupTypes: true,
        copyDtsFiles: true,
      }),
      // Bundle analyzer for production builds
      isProd &&
        visualizer({
          filename: 'dist/bundle-analysis.html',
          open: false,
          gzipSize: true,
          brotliSize: true,
        }),
    ].filter(Boolean),

    build: {
      lib: {
        entry: resolve(__dirname, 'src/main.ts'),
        name: 'SwissArmyKnifeCard',
        fileName: format => format === 'es' ? 'swiss-army-knife-card.js' : `swiss-army-knife-card.${format}.js`,
        formats: ['es', 'umd'],
      },

      rollupOptions: {
        external: [
          'lit',
          'lit/decorators.js',
          'lit/directives/*',
          'home-assistant-js-websocket',
          '@mdi/js',
          '@formatjs/intl-utils',
          '@tanem/svg-injector',
          'memoize-one',
        ],
        output: {
          globals: {
            lit: 'Lit',
            'home-assistant-js-websocket': 'HomeAssistantWebSocket',
            '@mdi/js': 'MDI',
            '@formatjs/intl-utils': 'IntlUtils',
            '@tanem/svg-injector': 'SVGInjector',
            'memoize-one': 'memoizeOne',
          },
        },
        // Enable build caching and tree shaking
        cache: true,
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
      },

      // Advanced performance optimizations
      minify: isProd ? 'terser' : false,
      terserOptions: isProd
        ? {
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
          }
        : undefined,

      // Source maps for better debugging
      sourcemap: isDev ? 'inline' : true,
      target: 'es2022',

      // Build optimizations
      chunkSizeWarningLimit: 1000,
      reportCompressedSize: true,
      emptyOutDir: true,
    },

    // Development server optimizations
    server: {
      port: 3000,
      open: true,
      cors: true,
      hmr: {
        overlay: true,
      },
      // Enable build caching
      fs: {
        cachedChecks: false,
      },
    },

    // Preview server
    preview: {
      port: 4173,
      open: true,
      cors: true,
    },

    // Environment variables
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'import.meta.env.DEV': isDev,
      'import.meta.env.PROD': isProd,
    },

    // Optimize dependencies
    optimizeDeps: {
      include: [
        'lit',
        'lit/decorators.js',
        'home-assistant-js-websocket',
        '@mdi/js',
        '@formatjs/intl-utils',
        '@tanem/svg-injector',
        'memoize-one',
      ],
      exclude: ['@vitest/ui', '@playwright/test'],
    },

    // CSS optimization
    css: {
      devSourcemap: isDev,
    },

    // Build performance monitoring
    logLevel: isDev ? 'info' : 'warn',
  };
});
