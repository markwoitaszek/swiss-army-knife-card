import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts']
    }),
  ],

  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'SwissArmyKnifeCard',
      fileName: 'swiss-army-knife-card',
      formats: ['es']
    },

    rollupOptions: {
      external: ['lit', 'lit/decorators.js', 'home-assistant-js-websocket'],
      output: {
        globals: {
          lit: 'Lit',
          'home-assistant-js-websocket': 'HomeAssistantWebSocket'
        }
      }
    },

    // Performance optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },

    sourcemap: true,
    target: 'es2022'
  },

  server: {
    port: 3000,
    open: true,
    cors: true
  },

  preview: {
    port: 4173,
    open: true
  },

  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
});
