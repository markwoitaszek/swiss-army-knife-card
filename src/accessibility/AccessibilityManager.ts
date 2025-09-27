/*
 * AccessibilityManager - Enhanced accessibility support
 * Provides comprehensive accessibility features for the Swiss Army Knife Card
 */

/**
 * Interface for accessibility configuration
 */
export interface AccessibilityConfig {
  enabled: boolean;
  announceStateChanges: boolean;
  enhancedFocus: boolean;
  keyboardNavigation: boolean;
  highContrast: boolean;
}

/**
 * AccessibilityManager class providing comprehensive accessibility support
 */
export class AccessibilityManager {
  private static config: AccessibilityConfig = {
    enabled: true,
    announceStateChanges: true,
    enhancedFocus: true,
    keyboardNavigation: true,
    highContrast: false,
  };

  /**
   * Configure accessibility features
   * @param config - Accessibility configuration
   */
  static configure(config: Partial<AccessibilityConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Add ARIA labels to tool elements
   * @param element - Element to enhance
   * @param toolType - Type of tool
   * @param entityState - Current entity state
   */
  static enhanceToolAccessibility(element: HTMLElement, toolType: string, entityState?: any): void {
    if (!this.config.enabled) return;

    // Add basic ARIA attributes
    element.setAttribute('role', this.getToolRole(toolType));
    element.setAttribute('aria-label', this.generateAriaLabel(toolType, entityState));
    
    // Add keyboard navigation support
    if (this.config.keyboardNavigation && this.isInteractiveTool(toolType)) {
      element.setAttribute('tabindex', '0');
      element.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    }

    // Add focus enhancement
    if (this.config.enhancedFocus) {
      element.classList.add('sak-accessible-focus');
    }
  }

  /**
   * Get appropriate ARIA role for tool type
   * @param toolType - Tool type
   * @returns ARIA role
   */
  private static getToolRole(toolType: string): string {
    const roleMap: Record<string, string> = {
      switch: 'switch',
      slider: 'slider',
      range_slider: 'slider',
      button: 'button',
      gauge: 'progressbar',
      circle: 'img',
      rectangle: 'img',
      text: 'text',
      entity_state: 'status',
      entity_name: 'text',
      entity_icon: 'img',
      entity_area: 'text',
    };

    return roleMap[toolType] || 'img';
  }

  /**
   * Generate descriptive ARIA label
   * @param toolType - Tool type
   * @param entityState - Current entity state
   * @returns ARIA label string
   */
  private static generateAriaLabel(toolType: string, entityState?: any): string {
    if (entityState) {
      const entityName = entityState.attributes?.friendly_name || entityState.entity_id || 'Unknown Entity';
      const state = entityState.state;
      const unit = entityState.attributes?.unit_of_measurement || '';

      switch (toolType) {
        case 'entity_state':
          return `${entityName}: ${state} ${unit}`.trim();
        case 'entity_name':
          return `Entity name: ${entityName}`;
        case 'entity_icon':
          return `Icon for ${entityName}`;
        case 'entity_area':
          return `Area: ${entityState.attributes?.area_id || 'Unknown'}`;
        case 'switch':
          return `${entityName} switch: ${state === 'on' ? 'On' : 'Off'}`;
        case 'slider':
          return `${entityName} slider: ${state} ${unit}`.trim();
        default:
          return `${toolType} for ${entityName}`;
      }
    }

    // Fallback for tools without entity state
    return `${toolType.replace('_', ' ')} tool`;
  }

  /**
   * Check if tool type is interactive
   * @param toolType - Tool type to check
   * @returns True if tool is interactive
   */
  private static isInteractiveTool(toolType: string): boolean {
    const interactiveTools = ['switch', 'slider', 'range_slider', 'circular_slider'];
    return interactiveTools.includes(toolType);
  }

  /**
   * Handle keyboard navigation for interactive tools
   * @param event - Keyboard event
   */
  private static handleKeyboardNavigation(event: KeyboardEvent): void {
    const element = event.target as HTMLElement;
    const toolType = element.getAttribute('data-tool-type');

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        element.click();
        break;
      case 'ArrowUp':
      case 'ArrowRight':
        if (toolType === 'slider' || toolType === 'range_slider') {
          event.preventDefault();
          this.adjustSliderValue(element, 1);
        }
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        if (toolType === 'slider' || toolType === 'range_slider') {
          event.preventDefault();
          this.adjustSliderValue(element, -1);
        }
        break;
    }
  }

  /**
   * Adjust slider value via keyboard
   * @param element - Slider element
   * @param direction - Direction of adjustment (1 or -1)
   */
  private static adjustSliderValue(element: HTMLElement, direction: number): void {
    // This would integrate with the actual slider implementation
    const currentValue = parseFloat(element.getAttribute('data-current-value') || '0');
    const step = parseFloat(element.getAttribute('data-step') || '1');
    const min = parseFloat(element.getAttribute('data-min') || '0');
    const max = parseFloat(element.getAttribute('data-max') || '100');

    const newValue = Math.min(Math.max(currentValue + (step * direction), min), max);
    
    // Trigger value change event
    const changeEvent = new CustomEvent('sak-value-change', {
      detail: { value: newValue },
      bubbles: true,
    });
    element.dispatchEvent(changeEvent);
  }

  /**
   * Announce state changes to screen readers
   * @param toolType - Tool type
   * @param oldState - Previous state
   * @param newState - New state
   */
  static announceStateChange(toolType: string, oldState: any, newState: any): void {
    if (!this.config.enabled || !this.config.announceStateChanges) return;

    const announcement = this.generateStateChangeAnnouncement(toolType, oldState, newState);
    if (announcement) {
      this.announceToScreenReader(announcement);
    }
  }

  /**
   * Generate state change announcement
   * @param toolType - Tool type
   * @param oldState - Previous state
   * @param newState - New state
   * @returns Announcement string or null
   */
  private static generateStateChangeAnnouncement(toolType: string, oldState: any, newState: any): string | null {
    if (!oldState || !newState || oldState.state === newState.state) {
      return null;
    }

    const entityName = newState.attributes?.friendly_name || newState.entity_id || 'Entity';
    const unit = newState.attributes?.unit_of_measurement || '';

    switch (toolType) {
      case 'entity_state':
        return `${entityName} changed to ${newState.state} ${unit}`.trim();
      case 'switch':
        return `${entityName} ${newState.state === 'on' ? 'turned on' : 'turned off'}`;
      default:
        return `${entityName} state changed`;
    }
  }

  /**
   * Announce message to screen readers
   * @param message - Message to announce
   */
  private static announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Apply high contrast theme
   * @param element - Element to apply high contrast to
   */
  static applyHighContrast(element: HTMLElement): void {
    if (!this.config.enabled || !this.config.highContrast) return;

    element.classList.add('sak-high-contrast');
    
    // Add high contrast CSS variables
    element.style.setProperty('--sak-text-color', '#000000');
    element.style.setProperty('--sak-background-color', '#ffffff');
    element.style.setProperty('--sak-border-color', '#000000');
    element.style.setProperty('--sak-focus-color', '#0066cc');
  }

  /**
   * Get accessibility status
   * @returns Current accessibility configuration and status
   */
  static getAccessibilityStatus(): {
    config: AccessibilityConfig;
    featuresActive: string[];
    recommendations: string[];
  } {
    const featuresActive: string[] = [];
    const recommendations: string[] = [];

    if (this.config.enabled) {
      featuresActive.push('Basic accessibility enabled');
    } else {
      recommendations.push('Enable basic accessibility features');
    }

    if (this.config.announceStateChanges) {
      featuresActive.push('State change announcements');
    }

    if (this.config.enhancedFocus) {
      featuresActive.push('Enhanced focus indicators');
    }

    if (this.config.keyboardNavigation) {
      featuresActive.push('Keyboard navigation support');
    }

    if (this.config.highContrast) {
      featuresActive.push('High contrast mode');
    }

    if (featuresActive.length < 4) {
      recommendations.push('Consider enabling additional accessibility features');
    }

    return {
      config: this.config,
      featuresActive,
      recommendations,
    };
  }
}
