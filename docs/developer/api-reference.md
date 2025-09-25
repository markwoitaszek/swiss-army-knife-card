# API Reference

Complete API reference for the Swiss Army Knife (SAK) custom card, including all components, tools, services, and utilities.

## 📋 Table of Contents

- [Main Components](#main-components)
- [Tools](#tools)
- [Services](#services)
- [Utilities](#utilities)
- [Types](#types)
- [Constants](#constants)
- [Events](#events)

## 🏗️ Main Components

### SakCard

The main custom element for the Swiss Army Knife card.

```typescript
@customElement('swiss-army-knife-card')
export class SakCard extends LitElement
```

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `config` | `SakConfig` | - | Card configuration |
| `hass` | `HomeAssistant` | - | Home Assistant instance |
| `narrow` | `boolean` | `false` | Whether card is in narrow mode |
| `editMode` | `boolean` | `false` | Whether card is in edit mode |

#### Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getCardSize()` | - | `number` | Returns card size for Lovelace |
| `setConfig(config)` | `SakConfig` | `void` | Sets card configuration |
| `updated(changedProperties)` | `Map<string, any>` | `void` | Called when properties update |

#### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `sak-error` | `{ error: Error, context: string }` | Fired when an error occurs |
| `sak-config-changed` | `SakConfig` | Fired when configuration changes |

#### Example

```typescript
const card = new SakCard();
card.config = {
  entities: [{ entity: 'sensor.temperature' }],
  layout: {
    toolsets: [{
      toolset: 'main',
      position: { cx: 50, cy: 50 },
      tools: [{
        type: 'circle',
        id: 'temp',
        position: { cx: 50, cy: 50, radius: 20 }
      }]
    }]
  }
};
```

### ErrorBoundary

Error boundary component for graceful error handling.

```typescript
@customElement('sak-error-boundary')
export class ErrorBoundary extends LitElement
```

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `error` | `Error \| null` | `null` | Current error state |
| `fallback` | `TemplateResult` | - | Fallback content to show |

#### Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `retry()` | - | `void` | Retries rendering after error |

## 🛠️ Tools

### BaseTool

Abstract base class for all tools.

```typescript
export abstract class BaseTool extends LitElement
```

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `config` | `ToolConfig` | - | Tool configuration |
| `entityIndex` | `number` | - | Entity index to use |
| `entityState` | `EntityState \| undefined` | - | Current entity state |
| `isActive` | `boolean` | `false` | Whether tool is active |

#### Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `render()` | - | `TemplateResult` | Renders the tool (abstract) |
| `handleTap(event)` | `Event` | `void` | Handles tap events |
| `getEntityValue()` | - | `any` | Gets current entity value |
| `updateEntityState(state)` | `EntityState` | `void` | Updates entity state |

### CircleTool

Creates circular shapes for indicators and progress displays.

```typescript
export class CircleTool extends BaseTool
```

#### Configuration

```typescript
interface CircleToolConfig extends ToolConfig {
  position: {
    cx: number;    // Center X (0-100%)
    cy: number;    // Center Y (0-100%)
    radius: number; // Radius (0-100%)
  };
}
```

#### Example

```typescript
const tool = new CircleTool();
tool.config = {
  position: { cx: 50, cy: 50, radius: 20 },
  entity_index: 0,
  show: {
    style: 'colorstop'
  },
  colorstops: {
    colors: {
      0: '#0000ff',
      100: '#ff0000'
    }
  }
};
```

### RectangleTool

Creates rectangular shapes for progress bars and containers.

```typescript
export class RectangleTool extends BaseTool
```

#### Configuration

```typescript
interface RectangleToolConfig extends ToolConfig {
  position: {
    cx: number;     // Center X (0-100%)
    cy: number;     // Center Y (0-100%)
    width: number;  // Width (0-100%)
    height: number; // Height (0-100%)
  };
}
```

### TextTool

Displays static text labels and descriptions.

```typescript
export class TextTool extends BaseTool
```

#### Configuration

```typescript
interface TextToolConfig extends ToolConfig {
  position: {
    cx: number;  // Center X (0-100%)
    cy: number;  // Center Y (0-100%)
    size: number; // Font size (8-32)
  };
  text: string; // Text content
}
```

### StateTool

Displays the current state value of an entity.

```typescript
export class StateTool extends BaseTool
```

#### Configuration

```typescript
interface StateToolConfig extends ToolConfig {
  position: {
    cx: number;  // Center X (0-100%)
    cy: number;  // Center Y (0-100%)
    size: number; // Font size (8-32)
  };
  entity_index: number; // Entity to display
}
```

### IconTool

Displays icons associated with entities or custom icons.

```typescript
export class IconTool extends BaseTool
```

#### Configuration

```typescript
interface IconToolConfig extends ToolConfig {
  position: {
    cx: number;  // Center X (0-100%)
    cy: number;  // Center Y (0-100%)
    size: number; // Icon size (8-40)
  };
  entity_index?: number; // Entity to display (optional)
  icon?: string;         // Custom icon (optional)
}
```

### SwitchTool

Creates interactive switches for toggling entities.

```typescript
export class SwitchTool extends BaseTool
```

#### Configuration

```typescript
interface SwitchToolConfig extends ToolConfig {
  position: {
    cx: number;  // Center X (0-100%)
    cy: number;  // Center Y (0-100%)
    size: number; // Switch size (20-50)
  };
  entity_index: number; // Entity to control
}
```

### SliderTool

Creates horizontal sliders for controlling numeric values.

```typescript
export class SliderTool extends BaseTool
```

#### Configuration

```typescript
interface SliderToolConfig extends ToolConfig {
  position: {
    cx: number;     // Center X (0-100%)
    cy: number;     // Center Y (0-100%)
    width: number;  // Slider width (40-100%)
    height: number; // Slider height (5-20)
  };
  entity_index: number; // Entity to control
}
```

### SparklineTool

Creates sparkline charts showing historical data trends.

```typescript
export class SparklineTool extends BaseTool
```

#### Configuration

```typescript
interface SparklineToolConfig extends ToolConfig {
  position: {
    cx: number;     // Center X (0-100%)
    cy: number;     // Center Y (0-100%)
    width: number;  // Chart width (40-100%)
    height: number; // Chart height (20-60)
  };
  entity_index: number; // Entity to display
  config: {
    hours: number;      // Hours of data to show
    show_fill: boolean; // Show filled area
    show_line: boolean; // Show line
  };
}
```

## 🔧 Services

### EntityService

Manages entity state and interactions.

```typescript
export class EntityService
```

#### Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getEntityState(entityId)` | `string` | `Promise<EntityState>` | Gets entity state |
| `getEntityHistory(entityId, start, end)` | `string, Date, Date` | `Promise<HistoryState[]>` | Gets entity history |
| `subscribeToEntity(entityId, callback)` | `string, Function` | `() => void` | Subscribes to entity updates |
| `callService(domain, service, data)` | `string, string, any` | `Promise<void>` | Calls Home Assistant service |

#### Example

```typescript
const entityService = new EntityService(hass);

// Get entity state
const state = await entityService.getEntityState('sensor.temperature');

// Subscribe to updates
const unsubscribe = entityService.subscribeToEntity('sensor.temperature', (state) => {
  console.log('Temperature updated:', state);
});

// Call service
await entityService.callService('light', 'toggle', {
  entity_id: 'light.living_room'
});
```

### ThemeService

Manages theme integration and styling.

```typescript
export class ThemeService
```

#### Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getThemeVariable(name)` | `string` | `string` | Gets theme variable value |
| `isDarkMode()` | - | `boolean` | Checks if dark mode is active |
| `getThemeColors()` | - | `ThemeColors` | Gets current theme colors |
| `subscribeToThemeChanges(callback)` | `Function` | `() => void` | Subscribes to theme changes |

#### Example

```typescript
const themeService = new ThemeService(hass);

// Get theme variable
const primaryColor = themeService.getThemeVariable('primary-color');

// Check dark mode
const isDark = themeService.isDarkMode();

// Subscribe to theme changes
const unsubscribe = themeService.subscribeToThemeChanges((theme) => {
  console.log('Theme changed:', theme);
});
```

### ConfigService

Manages configuration validation and processing.

```typescript
export class ConfigService
```

#### Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `validateConfig(config)` | `any` | `ValidationResult` | Validates configuration |
| `mergeConfigs(base, override)` | `SakConfig, Partial<SakConfig>` | `SakConfig` | Merges configurations |
| `processConfig(config)` | `any` | `SakConfig` | Processes raw configuration |
| `getDefaultConfig()` | - | `SakConfig` | Gets default configuration |

#### Example

```typescript
const configService = new ConfigService();

// Validate configuration
const result = configService.validateConfig(userConfig);
if (!result.isValid) {
  console.error('Configuration errors:', result.errors);
}

// Merge configurations
const mergedConfig = configService.mergeConfigs(defaultConfig, userConfig);
```

## 🛠️ Utilities

### ColorUtils

Utility functions for color calculations and conversions.

```typescript
export class ColorUtils
```

#### Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `hexToRgb(hex)` | `string` | `RGBColor` | Converts hex to RGB |
| `rgbToHex(rgb)` | `RGBColor` | `string` | Converts RGB to hex |
| `calculateColorStops(value, stops)` | `number, ColorStops` | `string` | Calculates color from stops |
| `interpolateColor(color1, color2, factor)` | `string, string, number` | `string` | Interpolates between colors |
| `getContrastColor(backgroundColor)` | `string` | `string` | Gets contrasting text color |

#### Example

```typescript
// Convert hex to RGB
const rgb = ColorUtils.hexToRgb('#ff0000');
// Returns: { r: 255, g: 0, b: 0 }

// Calculate color from stops
const color = ColorUtils.calculateColorStops(50, {
  0: '#0000ff',
  100: '#ff0000'
});
// Returns: '#800080'

// Interpolate colors
const interpolated = ColorUtils.interpolateColor('#0000ff', '#ff0000', 0.5);
// Returns: '#800080'
```

### MathUtils

Mathematical utility functions.

```typescript
export class MathUtils
```

#### Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `clamp(value, min, max)` | `number, number, number` | `number` | Clamps value between min and max |
| `lerp(start, end, factor)` | `number, number, number` | `number` | Linear interpolation |
| `map(value, inMin, inMax, outMin, outMax)` | `number, number, number, number, number` | `number` | Maps value from one range to another |
| `roundTo(value, decimals)` | `number, number` | `number` | Rounds to specified decimal places |

#### Example

```typescript
// Clamp value
const clamped = MathUtils.clamp(150, 0, 100);
// Returns: 100

// Linear interpolation
const interpolated = MathUtils.lerp(0, 100, 0.5);
// Returns: 50

// Map value
const mapped = MathUtils.map(50, 0, 100, 0, 360);
// Returns: 180
```

### DOMUtils

DOM manipulation utility functions.

```typescript
export class DOMUtils
```

#### Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `createElement(tag, attributes)` | `string, object` | `HTMLElement` | Creates element with attributes |
| `addEventListener(element, event, handler)` | `HTMLElement, string, Function` | `() => void` | Adds event listener with cleanup |
| `debounce(func, wait)` | `Function, number` | `Function` | Creates debounced function |
| `throttle(func, limit)` | `Function, number` | `Function` | Creates throttled function |

#### Example

```typescript
// Create element
const element = DOMUtils.createElement('div', {
  class: 'my-class',
  id: 'my-id'
});

// Debounce function
const debouncedFunction = DOMUtils.debounce((value) => {
  console.log('Debounced:', value);
}, 300);
```

## 📝 Types

### Core Types

```typescript
// Main configuration interface
interface SakConfig {
  entities: EntityConfig[];
  layout: LayoutConfig;
  aspectratio?: string;
  theme?: string;
  dev?: DevConfig;
}

// Entity configuration
interface EntityConfig {
  entity: string;
  name?: string;
  icon?: string;
  unit?: string;
  attribute?: string;
  secondary_info?: string;
}

// Layout configuration
interface LayoutConfig {
  aspectratio?: string;
  styles?: StyleConfig;
  toolsets: ToolsetConfig[];
}

// Toolset configuration
interface ToolsetConfig {
  toolset: string;
  position: PositionConfig;
  styles?: StyleConfig;
  tools: ToolConfig[];
}

// Tool configuration
interface ToolConfig {
  type: string;
  id: string;
  position: PositionConfig;
  entity_index?: number;
  entity_indexes?: EntityIndexConfig[];
  show?: ShowConfig;
  styles?: StyleConfig;
  classes?: ClassConfig;
  animations?: AnimationConfig;
  user_actions?: UserActionConfig;
}

// Position configuration
interface PositionConfig {
  cx: number;
  cy: number;
  // Tool-specific position properties
  radius?: number;    // For circles
  width?: number;     // For rectangles
  height?: number;    // For rectangles
  size?: number;      // For text/icons
  // ... other position properties
}

// Show configuration
interface ShowConfig {
  style: 'default' | 'fixedcolor' | 'colorstop' | 'colorstops' | 'colorstopgradient' | 'minmaxgradient';
  color?: string;
  colorstops?: ColorStopsConfig;
}

// Color stops configuration
interface ColorStopsConfig {
  colors: Record<string, string>;
}

// Animation configuration
interface AnimationConfig {
  [key: string]: {
    state: string;
    operator?: '==' | '!=' | '>' | '<' | '>=' | '<=';
    classes?: ClassConfig;
    styles?: StyleConfig;
    reuse?: boolean;
  };
}

// User action configuration
interface UserActionConfig {
  tap_action?: {
    haptic?: 'light' | 'medium' | 'heavy';
    actions: ActionConfig[];
  };
}

// Action configuration
interface ActionConfig {
  action: 'more-info' | 'navigate' | 'call-service' | 'fire-dom-event';
  navigation_path?: string;
  service?: string;
  service_data?: Record<string, any>;
  [key: string]: any;
}
```

### State Types

```typescript
// Entity state
interface EntityState {
  entity_id: string;
  state: any;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
}

// History state
interface HistoryState {
  last_changed: string;
  state: any;
}

// Theme state
interface ThemeState {
  isDark: boolean;
  primaryColor: string;
  accentColor: string;
  // ... other theme properties
}
```

### Utility Types

```typescript
// RGB color
interface RGBColor {
  r: number;
  g: number;
  b: number;
}

// HSL color
interface HSLColor {
  h: number;
  s: number;
  l: number;
}

// Validation result
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Theme colors
interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  error: string;
  onPrimary: string;
  onSecondary: string;
  onBackground: string;
  onSurface: string;
  onError: string;
}
```

## 📊 Constants

### Default Values

```typescript
// Default configuration
export const DEFAULT_CONFIG: SakConfig = {
  entities: [],
  layout: {
    toolsets: []
  },
  aspectratio: '1/1'
};

// Default tool configuration
export const DEFAULT_TOOL_CONFIG: Partial<ToolConfig> = {
  show: {
    style: 'default'
  }
};

// Default position
export const DEFAULT_POSITION: PositionConfig = {
  cx: 50,
  cy: 50
};
```

### Limits

```typescript
// Configuration limits
export const LIMITS = {
  MAX_ENTITIES: 10,
  MAX_TOOLS_PER_TOOLSET: 20,
  MAX_TOOLSETS: 5,
  MAX_ANIMATIONS: 10,
  MIN_POSITION: 0,
  MAX_POSITION: 100,
  MIN_SIZE: 1,
  MAX_SIZE: 100
};
```

### Messages

```typescript
// Error messages
export const ERROR_MESSAGES = {
  ENTITY_NOT_FOUND: 'Entity not found',
  INVALID_CONFIG: 'Invalid configuration',
  TOOL_NOT_FOUND: 'Tool not found',
  RENDER_ERROR: 'Render error'
};

// Success messages
export const SUCCESS_MESSAGES = {
  CONFIG_LOADED: 'Configuration loaded successfully',
  TOOL_CREATED: 'Tool created successfully',
  ANIMATION_APPLIED: 'Animation applied successfully'
};
```

## 📡 Events

### Custom Events

```typescript
// Error event
interface SakErrorEvent extends CustomEvent {
  detail: {
    error: Error;
    context: string;
  };
}

// Configuration change event
interface SakConfigChangeEvent extends CustomEvent {
  detail: SakConfig;
}

// Entity update event
interface SakEntityUpdateEvent extends CustomEvent {
  detail: {
    entityId: string;
    state: EntityState;
  };
}

// Theme change event
interface SakThemeChangeEvent extends CustomEvent {
  detail: ThemeState;
}
```

### Event Listeners

```typescript
// Listen for errors
card.addEventListener('sak-error', (event: SakErrorEvent) => {
  console.error('SAK Error:', event.detail.error);
});

// Listen for configuration changes
card.addEventListener('sak-config-changed', (event: SakConfigChangeEvent) => {
  console.log('Configuration changed:', event.detail);
});

// Listen for entity updates
card.addEventListener('sak-entity-update', (event: SakEntityUpdateEvent) => {
  console.log('Entity updated:', event.detail.entityId, event.detail.state);
});
```

## 📚 Related Documentation

- [Architecture Overview](architecture.md)
- [Development Setup](development-setup.md)
- [Testing Guide](testing.md)
- [Contributing Guide](contributing.md)

---

**Last Updated**: December 2024  
**Version**: 3.0.0 (Modernization Phase)