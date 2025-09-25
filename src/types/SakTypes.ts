// Main SAK Configuration Types
export interface SakConfig {
  entities: EntityConfig[];
  layout: LayoutConfig;
  aspectratio?: string;
  theme?: string;
  styles?: Record<string, string>;
}

export interface EntityConfig {
  entity: string;
  name?: string;
  icon?: string;
  unit?: string;
  attribute?: string;
  secondary_info?: string;
}

export interface LayoutConfig {
  aspectratio?: string;
  styles?: Record<string, string>;
  toolsets: ToolsetConfig[];
}

export interface ToolsetConfig {
  toolset: string;
  position: Position;
  scale?: Scale;
  rotation?: Rotation;
  tools: ToolConfig[];
}

// Position and Transform Types
export interface Position {
  cx: number;
  cy: number;
  x?: number;
  y?: number;
}

export interface Scale {
  x: number;
  y: number;
}

export interface Rotation {
  angle: number;
  cx?: number;
  cy?: number;
}

// Tool Configuration Types
export interface ToolConfig {
  type: ToolType;
  id: string;
  position: ToolPosition;
  entity_index: number;
  color?: string | ColorConfig;
  size?: number;
  width?: number;
  height?: number;
  radius?: number;
  stroke_width?: number;
  opacity?: number;
  animation?: AnimationConfig;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export type ToolType =
  | 'circle'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'text'
  | 'entity_state'
  | 'entity_name'
  | 'entity_icon'
  | 'switch'
  | 'slider'
  | 'sparkline'
  | 'barchart'
  | 'badge'
  | 'user_svg';

export interface ToolPosition {
  cx: number;
  cy: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
}

// Color Configuration
export interface ColorConfig {
  type: 'fixed' | 'entity' | 'colorstops';
  color?: string;
  colorstops?: Record<number, string>;
  attribute?: string;
}

// Animation Configuration
export interface AnimationConfig {
  type: 'none' | 'pulse' | 'rotate' | 'scale' | 'fade';
  duration?: number;
  delay?: number;
  iterations?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  easing?: string;
}

// Action Configuration
export interface ActionConfig {
  action: 'none' | 'toggle' | 'call-service' | 'navigate' | 'url' | 'more-info';
  service?: string;
  service_data?: Record<string, any>;
  navigation_path?: string;
  url_path?: string;
  haptic?: 'light' | 'medium' | 'heavy' | 'selection';
}

// State Management Types
export interface EntityState {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    user_id: string | null;
    parent_id: string | null;
  };
}

export interface SakState {
  entities: Map<string, EntityState>;
  toolsets: Map<string, ToolsetState>;
  theme: ThemeState;
  config: SakConfig;
}

export interface ToolsetState {
  id: string;
  config: ToolsetConfig;
  tools: Map<string, ToolState>;
  position: Position;
  scale: Scale;
  rotation: Rotation;
}

export interface ToolState {
  id: string;
  config: ToolConfig;
  entityState?: EntityState;
  isActive: boolean;
  isVisible: boolean;
}

export interface ThemeState {
  isDark: boolean;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  cardBackgroundColor: string;
  primaryTextColor: string;
  secondaryTextColor: string;
}

// Error Types
export interface SakError {
  code: string;
  message: string;
  context?: string;
  details?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Performance Types
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  loadTime: number;
}

// Event Types
export interface SakEvent extends CustomEvent {
  detail: {
    type: string;
    data?: any;
    error?: SakError;
  };
}

// Service Types
export interface EntityService {
  getEntityState(entityId: string): Promise<EntityState>;
  subscribeToEntity(entityId: string, callback: (state: EntityState) => void): () => void;
  callService(domain: string, service: string, data?: Record<string, any>): Promise<void>;
}

export interface ThemeService {
  getThemeVariable(name: string): string;
  subscribeToTheme(callback: (theme: ThemeState) => void): () => void;
  isDarkMode(): boolean;
}

export interface ConfigService {
  validateConfig(config: any): ValidationResult;
  mergeConfigs(base: SakConfig, override: Partial<SakConfig>): SakConfig;
  sanitizeConfig(config: any): SakConfig;
}
