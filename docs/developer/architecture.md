# Technical Architecture

This document provides a comprehensive overview of the Swiss Army Knife (SAK) custom card's technical architecture, both current and planned for the modernization.

## 🏗️ Current Architecture

### Overview

The current SAK architecture is monolithic with tightly coupled components, built on deprecated technologies. The main component is a single 1,940+ line file with embedded tool implementations.

### Current Technology Stack

```typescript
// Current Stack (Deprecated)
{
  "framework": "Lit Element 2.5.1",     // ❌ DEPRECATED
  "language": "JavaScript ES6",          // ⚠️ NO TYPE SAFETY
  "buildTool": "Rollup",                 // ⚠️ BASIC CONFIGURATION
  "bundler": "Rollup + Terser",          // ⚠️ MANUAL OPTIMIZATION
  "testing": "None",                     // ❌ NO TESTING
  "linting": "ESLint (Basic)",           // ⚠️ MINIMAL CONFIGURATION
  "stateManagement": "Manual",           // ❌ NO STATE MANAGEMENT
  "styling": "CSS + Lit CSS"             // ✅ ACCEPTABLE
}
```

### Current Component Structure

```
src/
├── main.js                    # 1,940+ lines - Monolithic main component
├── base-tool.js              # Base tool class
├── toolset.js                # Toolset management
├── colors.js                 # Color management
├── utils.js                  # Utility functions
├── templates.js              # Template system
├── merge.js                  # Object merging utilities
├── const.js                  # Constants
├── [tool-name]-tool.js       # Individual tool implementations
└── frontend_mods/            # Home Assistant frontend modifications
    ├── color/
    ├── common/
    ├── datetime/
    └── number/
```

### Current Architecture Issues

1. **Monolithic Design**
   - Single massive file (main.js)
   - Tightly coupled components
   - Difficult to maintain and test

2. **No Type Safety**
   - Pure JavaScript implementation
   - Runtime errors common
   - Poor developer experience

3. **Deprecated Dependencies**
   - Lit Element 2.5.1 (deprecated)
   - Outdated Home Assistant libraries
   - Security vulnerabilities

4. **No Testing Framework**
   - Zero test coverage
   - Manual testing only
   - High risk of regressions

5. **Poor State Management**
   - Manual state tracking
   - Inconsistent updates
   - Memory leaks

## 🚀 Modern Architecture (Planned)

### Overview

The modern architecture will be modular, type-safe, and built on current technologies. It will follow modern web development best practices with proper separation of concerns.

### Modern Technology Stack

```typescript
// Modern Stack (Target)
{
  "framework": "Lit 3.x",                // ✅ CURRENT
  "language": "TypeScript 5.x",          // ✅ TYPE SAFETY
  "buildTool": "Vite 5.x",               // ✅ FAST DEVELOPMENT
  "bundler": "Rollup (via Vite)",        // ✅ OPTIMIZED
  "testing": {
    "unit": "Vitest",                    // ✅ FAST TESTING
    "e2e": "Playwright",                 // ✅ E2E TESTING
    "visual": "Chromatic"                // ✅ VISUAL TESTING
  },
  "linting": "ESLint + Prettier",        // ✅ CODE QUALITY
  "stateManagement": "Lit Reactive Controller", // ✅ REACTIVE STATE
  "styling": "CSS Custom Properties + Lit CSS"  // ✅ MODERN STYLING
}
```

### Modern Component Structure

```
src/
├── main.ts                    # Main entry point (minimal)
├── components/                # UI Components
│   ├── SakCard.ts            # Main card component
│   ├── ErrorBoundary.ts      # Error handling
│   └── LoadingSpinner.ts     # Loading states
├── tools/                     # Tool implementations
│   ├── base/
│   │   ├── BaseTool.ts       # Abstract base tool
│   │   └── ToolRegistry.ts   # Tool registration
│   ├── shapes/
│   │   ├── CircleTool.ts     # Circle tool
│   │   ├── RectangleTool.ts  # Rectangle tool
│   │   └── EllipseTool.ts    # Ellipse tool
│   ├── text/
│   │   ├── TextTool.ts       # Text tool
│   │   └── StateTool.ts      # State display tool
│   ├── icons/
│   │   ├── IconTool.ts       # Icon tool
│   │   └── BadgeTool.ts      # Badge tool
│   ├── interactive/
│   │   ├── SwitchTool.ts     # Switch tool
│   │   └── SliderTool.ts     # Slider tool
│   └── charts/
│       ├── SparklineTool.ts  # Sparkline tool
│       └── BarChartTool.ts   # Bar chart tool
├── toolsets/                  # Toolset management
│   ├── Toolset.ts            # Toolset class
│   ├── ToolsetManager.ts     # Toolset coordination
│   └── PositionCalculator.ts # Position calculations
├── state/                     # State management
│   ├── SakState.ts           # Main state class
│   ├── EntityState.ts        # Entity state management
│   ├── ThemeState.ts         # Theme state management
│   └── ConfigState.ts        # Configuration state
├── services/                  # Business logic
│   ├── EntityService.ts      # Entity management
│   ├── ThemeService.ts       # Theme management
│   ├── ConfigService.ts      # Configuration management
│   └── AnimationService.ts   # Animation management
├── utils/                     # Utility functions
│   ├── ColorUtils.ts         # Color calculations
│   ├── MathUtils.ts          # Mathematical utilities
│   ├── DOMUtils.ts           # DOM manipulation
│   └── ValidationUtils.ts    # Input validation
├── types/                     # TypeScript definitions
│   ├── SakTypes.ts           # Main type definitions
│   ├── ToolTypes.ts          # Tool-specific types
│   ├── EntityTypes.ts        # Entity types
│   └── ThemeTypes.ts         # Theme types
├── constants/                 # Application constants
│   ├── Defaults.ts           # Default values
│   ├── Limits.ts             # Configuration limits
│   └── Messages.ts           # Error messages
└── test/                      # Test files
    ├── setup.ts              # Test setup
    ├── fixtures/              # Test data
    └── mocks/                 # Mock implementations
```

## 🧩 Component Architecture

### Main Card Component

```typescript
// src/components/SakCard.ts
@customElement('swiss-army-knife-card')
export class SakCard extends LitElement {
  @state() private config: SakConfig;
  @state() private entities: EntityState[] = [];
  @state() private toolsets: Toolset[] = [];
  @state() private theme: ThemeState;
  
  // Reactive controllers for state management
  private entityController = new EntityController(this);
  private themeController = new ThemeController(this);
  private configController = new ConfigController(this);
  
  render() {
    return html`
      <div class="sak-card">
        ${this.toolsets.map(toolset => toolset.render())}
      </div>
    `;
  }
}
```

### Base Tool Architecture

```typescript
// src/tools/base/BaseTool.ts
export abstract class BaseTool extends LitElement {
  @property() config: ToolConfig;
  @property() entityIndex: number;
  @state() entityState?: EntityState;
  @state() isActive = false;
  
  // Reactive controller for entity updates
  private entityController = new EntityController(this);
  
  abstract render(): TemplateResult;
  
  protected handleTap(event: Event) {
    // Common tap handling logic
  }
  
  protected getEntityValue(): any {
    return this.entityState?.value;
  }
}
```

### Toolset Architecture

```typescript
// src/toolsets/Toolset.ts
export class Toolset {
  private tools: BaseTool[] = [];
  private position: Position;
  private scale: Scale;
  private rotation: Rotation;
  
  constructor(
    private config: ToolsetConfig,
    private state: SakState
  ) {
    this.initializeTools();
  }
  
  private initializeTools() {
    this.config.tools.forEach(toolConfig => {
      const tool = ToolRegistry.createTool(toolConfig, this);
      this.tools.push(tool);
    });
  }
  
  render(): TemplateResult {
    return html`
      <g class="toolset" transform="${this.getTransform()}">
        ${this.tools.map(tool => tool.render())}
      </g>
    `;
  }
}
```

## 🔄 State Management Architecture

### Reactive State System

```typescript
// src/state/SakState.ts
export class SakState {
  private entities = new Map<string, EntityState>();
  private toolsets = new Map<string, Toolset>();
  private theme: ThemeState;
  private config: SakConfig;
  
  // Reactive updates
  private updateCallbacks = new Set<() => void>();
  
  subscribe(callback: () => void) {
    this.updateCallbacks.add(callback);
    return () => this.updateCallbacks.delete(callback);
  }
  
  private notify() {
    this.updateCallbacks.forEach(callback => callback());
  }
  
  updateEntity(entityId: string, state: any) {
    const entityState = this.entities.get(entityId);
    if (entityState) {
      entityState.update(state);
      this.notify();
    }
  }
}
```

### Entity State Management

```typescript
// src/state/EntityState.ts
export class EntityState {
  @state() value: any;
  @state() previousValue: any;
  @state() attributes: Record<string, any> = {};
  @state() lastChanged: Date;
  
  constructor(
    public entityId: string,
    public config: EntityConfig
  ) {}
  
  update(newState: any) {
    this.previousValue = this.value;
    this.value = newState.state;
    this.attributes = newState.attributes;
    this.lastChanged = new Date(newState.last_changed);
  }
  
  hasChanged(): boolean {
    return this.value !== this.previousValue;
  }
}
```

## 🎨 Styling Architecture

### CSS Custom Properties System

```typescript
// src/styles/SakStyles.ts
export const sakStyles = css`
  :host {
    /* Theme variables */
    --sak-primary-color: var(--primary-color, #1976d2);
    --sak-secondary-color: var(--secondary-color, #dc004e);
    --sak-background-color: var(--card-background-color, #ffffff);
    --sak-text-color: var(--primary-text-color, #000000);
    
    /* Layout variables */
    --sak-border-radius: 4px;
    --sak-padding: 16px;
    --sak-margin: 8px;
    
    /* Animation variables */
    --sak-transition-duration: 0.3s;
    --sak-transition-timing: ease-in-out;
  }
  
  .sak-card {
    background: var(--sak-background-color);
    color: var(--sak-text-color);
    border-radius: var(--sak-border-radius);
    padding: var(--sak-padding);
    transition: all var(--sak-transition-duration) var(--sak-transition-timing);
  }
`;
```

### Theme Integration

```typescript
// src/services/ThemeService.ts
export class ThemeService {
  private currentTheme: ThemeState;
  
  constructor(private hass: HomeAssistant) {
    this.currentTheme = this.createThemeState(hass.themes);
  }
  
  private createThemeState(themes: any): ThemeState {
    return {
      isDark: themes.darkMode,
      primaryColor: themes.primaryColor,
      accentColor: themes.accentColor,
      // ... other theme properties
    };
  }
  
  getThemeVariable(name: string): string {
    return this.currentTheme[name] || '';
  }
}
```

## 🔧 Service Architecture

### Entity Service

```typescript
// src/services/EntityService.ts
export class EntityService {
  constructor(private hass: HomeAssistant) {}
  
  async getEntityState(entityId: string): Promise<EntityState> {
    const state = this.hass.states[entityId];
    if (!state) {
      throw new Error(`Entity ${entityId} not found`);
    }
    return new EntityState(entityId, state);
  }
  
  async getEntityHistory(
    entityId: string, 
    startTime: Date, 
    endTime: Date
  ): Promise<HistoryState[]> {
    // Implementation for fetching entity history
  }
  
  subscribeToEntity(entityId: string, callback: (state: EntityState) => void) {
    // Implementation for entity state subscriptions
  }
}
```

### Configuration Service

```typescript
// src/services/ConfigService.ts
export class ConfigService {
  validateConfig(config: any): ValidationResult {
    const errors: string[] = [];
    
    // Validate required fields
    if (!config.entities || !Array.isArray(config.entities)) {
      errors.push('Entities array is required');
    }
    
    if (!config.layout || !config.layout.toolsets) {
      errors.push('Layout with toolsets is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  mergeConfigs(base: SakConfig, override: Partial<SakConfig>): SakConfig {
    return deepMerge(base, override);
  }
}
```

## 🧪 Testing Architecture

### Unit Testing Structure

```typescript
// src/test/setup.ts
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/lit';

afterEach(() => {
  cleanup();
});

// Mock Home Assistant
global.hass = {
  states: {},
  themes: { darkMode: false },
  // ... other HA properties
};
```

### Component Testing

```typescript
// src/components/__tests__/SakCard.test.ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/lit';
import { SakCard } from '../SakCard';

describe('SakCard', () => {
  it('should render with basic configuration', async () => {
    const config = {
      entities: [{ entity: 'sensor.test' }],
      layout: { toolsets: [] }
    };
    
    render(html`<sak-card .config=${config}></sak-card>`);
    
    expect(screen.getByRole('region')).toBeInTheDocument();
  });
});
```

### Tool Testing

```typescript
// src/tools/__tests__/CircleTool.test.ts
import { describe, it, expect } from 'vitest';
import { CircleTool } from '../CircleTool';

describe('CircleTool', () => {
  it('should render a circle with correct radius', () => {
    const tool = new CircleTool();
    tool.config = {
      position: { cx: 50, cy: 50, radius: 20 },
      entity_index: 0
    };
    
    const result = tool.render();
    expect(result).toContain('circle');
    expect(result).toContain('r="20"');
  });
});
```

## 📦 Build Architecture

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    // TypeScript support
    typescript(),
    
    // Lit plugin for optimal bundling
    lit({
      include: ['src/**/*.ts']
    }),
    
    // Bundle analysis
    bundleAnalyzer()
  ],
  
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'SwissArmyKnifeCard',
      fileName: 'swiss-army-knife-card',
      formats: ['es']
    },
    
    rollupOptions: {
      external: ['lit', 'lit/decorators.js'],
      output: {
        globals: {
          lit: 'Lit'
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
    }
  }
});
```

### Bundle Optimization

```typescript
// Bundle analysis and optimization
export const bundleConfig = {
  // Size limits
  maxSize: '200KB',
  maxGzipSize: '50KB',
  
  // Chunking strategy
  chunks: {
    vendor: ['lit'],
    tools: ['src/tools/**/*.ts'],
    utils: ['src/utils/**/*.ts']
  },
  
  // Tree shaking
  sideEffects: false,
  
  // Code splitting
  dynamicImports: true
};
```

## 🔒 Security Architecture

### Input Validation

```typescript
// src/utils/ValidationUtils.ts
export class ValidationUtils {
  static validateEntityId(entityId: string): boolean {
    return /^[a-z_]+\.[a-z0-9_]+$/.test(entityId);
  }
  
  static sanitizeHtml(html: string): string {
    // HTML sanitization implementation
  }
  
  static validateColor(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }
}
```

### CSP Compliance

```typescript
// Content Security Policy compliance
export const cspConfig = {
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", "data:", "https:"],
  'connect-src': ["'self'", "ws:", "wss:"]
};
```

## 📊 Performance Architecture

### Rendering Optimization

```typescript
// src/utils/PerformanceUtils.ts
export class PerformanceUtils {
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): T {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    }) as T;
  }
  
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T {
    let inThrottle: boolean;
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  }
}
```

### Memory Management

```typescript
// src/utils/MemoryManager.ts
export class MemoryManager {
  private static instances = new WeakMap();
  
  static track(instance: any, cleanup: () => void) {
    this.instances.set(instance, cleanup);
  }
  
  static cleanup(instance: any) {
    const cleanup = this.instances.get(instance);
    if (cleanup) {
      cleanup();
      this.instances.delete(instance);
    }
  }
}
```

## 🔄 Migration Strategy

### Gradual Migration Approach

1. **Phase 1**: Core architecture modernization
2. **Phase 2**: Component-by-component migration
3. **Phase 3**: Feature parity validation
4. **Phase 4**: Performance optimization
5. **Phase 5**: Legacy code removal

### Backward Compatibility

```typescript
// src/compat/LegacySupport.ts
export class LegacySupport {
  static convertLegacyConfig(config: any): SakConfig {
    // Convert old configuration format to new format
  }
  
  static createLegacyInterface(newCard: SakCard): any {
    // Create legacy interface for backward compatibility
  }
}
```

## 📚 Related Documentation

- [Modernization Overview](../modernization/overview.md) - Complete modernization strategy
- [Phase 1: Foundation](../modernization/phase-1-foundation.md) - Architecture modernization
- [Contributing Guide](contributing.md) - Development guidelines
- [Testing Guide](testing.md) - Testing strategies
- [API Reference](api-reference.md) - Complete API documentation

---

**Last Updated**: December 2024  
**Version**: 3.0.0 (Modernization Phase)  
**Status**: Planning Phase  
**Next Review**: Phase 1 Completion