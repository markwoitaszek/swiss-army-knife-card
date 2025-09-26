/*
 * AnimationManager - Modern animation system for SAK tools
 * Provides CSS animations, transitions, and state-based effects
 */

export interface AnimationConfig {
  name: string;
  duration?: number; // milliseconds
  easing?: string; // CSS easing function
  delay?: number; // milliseconds
  iterations?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  playState?: 'running' | 'paused';
}

export interface TransitionConfig {
  property: string;
  duration?: number;
  easing?: string;
  delay?: number;
}

export interface StateAnimationConfig {
  state: string | string[];
  enter?: AnimationConfig;
  exit?: AnimationConfig;
  transitions?: TransitionConfig[];
}

export interface LoadingAnimationConfig {
  type: 'spin' | 'pulse' | 'fade' | 'bounce' | 'slide';
  duration?: number;
  easing?: string;
}

export class AnimationManager {
  private element: HTMLElement;
  private activeAnimations: Map<string, Animation> = new Map();
  private stateAnimations: Map<string, StateAnimationConfig> = new Map();
  private currentState: string = '';

  constructor(element: HTMLElement) {
    this.element = element;
    this.registerDefaultAnimations();
  }

  // Public API
  registerStateAnimation(config: StateAnimationConfig): void {
    const states = Array.isArray(config.state) ? config.state : [config.state];
    states.forEach(state => {
      this.stateAnimations.set(state, config);
    });
  }

  playAnimation(config: AnimationConfig, keyframes: Keyframe[]): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const animation = this.element.animate(keyframes, {
          duration: config.duration || 300,
          easing: config.easing || 'ease',
          delay: config.delay || 0,
          iterations: config.iterations || 1,
          direction: config.direction || 'normal',
          fill: config.fillMode || 'none',
        });

        this.activeAnimations.set(config.name, animation);

        animation.addEventListener('finish', () => {
          this.activeAnimations.delete(config.name);
          resolve();
        });

        animation.addEventListener('cancel', () => {
          this.activeAnimations.delete(config.name);
          reject(new Error('Animation cancelled'));
        });

        if (config.playState === 'paused') {
          animation.pause();
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  stopAnimation(name: string): void {
    const animation = this.activeAnimations.get(name);
    if (animation) {
      animation.cancel();
      this.activeAnimations.delete(name);
    }
  }

  stopAllAnimations(): void {
    this.activeAnimations.forEach(animation => animation.cancel());
    this.activeAnimations.clear();
  }

  // State-based animations
  animateToState(newState: string): void {
    const oldState = this.currentState;
    this.currentState = newState;

    // Handle exit animation for old state
    if (oldState && this.stateAnimations.has(oldState)) {
      const oldConfig = this.stateAnimations.get(oldState)!;
      if (oldConfig.exit) {
        this.playStateExitAnimation(oldConfig.exit);
      }
    }

    // Handle enter animation for new state
    if (this.stateAnimations.has(newState)) {
      const newConfig = this.stateAnimations.get(newState)!;
      if (newConfig.enter) {
        this.playStateEnterAnimation(newConfig.enter);
      }

      // Apply transitions
      if (newConfig.transitions) {
        this.applyTransitions(newConfig.transitions);
      }
    }
  }

  private playStateEnterAnimation(config: AnimationConfig): void {
    const keyframes = this.getStateEnterKeyframes();
    this.playAnimation(config, keyframes);
  }

  private playStateExitAnimation(config: AnimationConfig): void {
    const keyframes = this.getStateExitKeyframes();
    this.playAnimation(config, keyframes);
  }

  private getStateEnterKeyframes(): Keyframe[] {
    return [
      { opacity: 0, transform: 'scale(0.8)' },
      { opacity: 1, transform: 'scale(1)' },
    ];
  }

  private getStateExitKeyframes(): Keyframe[] {
    return [
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(0.8)' },
    ];
  }

  // Transition management
  applyTransitions(transitions: TransitionConfig[]): void {
    const transitionValues = transitions.map(
      t => `${t.property} ${t.duration || 300}ms ${t.easing || 'ease'} ${t.delay || 0}ms`
    );

    this.element.style.transition = transitionValues.join(', ');
  }

  removeTransitions(): void {
    this.element.style.transition = '';
  }

  // Pre-defined animations
  fadeIn(duration = 300): Promise<void> {
    return this.playAnimation({ name: 'fade-in', duration }, [{ opacity: 0 }, { opacity: 1 }]);
  }

  fadeOut(duration = 300): Promise<void> {
    return this.playAnimation({ name: 'fade-out', duration }, [{ opacity: 1 }, { opacity: 0 }]);
  }

  slideIn(direction: 'left' | 'right' | 'up' | 'down' = 'left', duration = 300): Promise<void> {
    const transforms = {
      left: ['translateX(-100%)', 'translateX(0)'],
      right: ['translateX(100%)', 'translateX(0)'],
      up: ['translateY(-100%)', 'translateY(0)'],
      down: ['translateY(100%)', 'translateY(0)'],
    };

    return this.playAnimation({ name: `slide-in-${direction}`, duration }, [
      { transform: transforms[direction][0] },
      { transform: transforms[direction][1] },
    ]);
  }

  bounce(duration = 600): Promise<void> {
    return this.playAnimation({ name: 'bounce', duration }, [
      { transform: 'scale(1)' },
      { transform: 'scale(1.1)' },
      { transform: 'scale(0.9)' },
      { transform: 'scale(1.05)' },
      { transform: 'scale(1)' },
    ]);
  }

  pulse(duration = 1000): Promise<void> {
    return this.playAnimation({ name: 'pulse', duration, iterations: 'infinite' }, [
      { opacity: 1 },
      { opacity: 0.7 },
      { opacity: 1 },
    ]);
  }

  spin(duration = 1000): Promise<void> {
    return this.playAnimation({ name: 'spin', duration, iterations: 'infinite' }, [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(360deg)' },
    ]);
  }

  // Loading animations
  showLoadingAnimation(config: LoadingAnimationConfig): void {
    switch (config.type) {
      case 'spin':
        this.spin(config.duration);
        break;
      case 'pulse':
        this.pulse(config.duration);
        break;
      case 'fade':
        this.fadeIn(config.duration);
        break;
      case 'bounce':
        this.bounce(config.duration);
        break;
      case 'slide':
        this.slideIn('left', config.duration);
        break;
    }
  }

  hideLoadingAnimation(): void {
    this.stopAllAnimations();
    this.fadeOut(200);
  }

  // Hover animations
  setupHoverAnimations(enterAnimation?: AnimationConfig, leaveAnimation?: AnimationConfig): void {
    this.element.addEventListener('mouseenter', () => {
      if (enterAnimation) {
        const keyframes = [
          { transform: 'scale(1)', opacity: 1 },
          { transform: 'scale(1.05)', opacity: 0.9 },
        ];
        this.playAnimation(enterAnimation, keyframes);
      }
    });

    this.element.addEventListener('mouseleave', () => {
      if (leaveAnimation) {
        const keyframes = [
          { transform: 'scale(1.05)', opacity: 0.9 },
          { transform: 'scale(1)', opacity: 1 },
        ];
        this.playAnimation(leaveAnimation, keyframes);
      }
    });
  }

  // CSS class-based animations
  addAnimationClass(className: string, duration?: number): void {
    this.element.classList.add(className);

    if (duration) {
      setTimeout(() => {
        this.element.classList.remove(className);
      }, duration);
    }
  }

  removeAnimationClass(className: string): void {
    this.element.classList.remove(className);
  }

  // Performance optimization
  enableHardwareAcceleration(): void {
    this.element.style.willChange = 'transform, opacity';
    this.element.style.transform = 'translateZ(0)'; // Force GPU layer
  }

  disableHardwareAcceleration(): void {
    this.element.style.willChange = 'auto';
    this.element.style.transform = '';
  }

  // Default animations registration
  private registerDefaultAnimations(): void {
    // Register common state animations
    this.registerStateAnimation({
      state: 'on',
      enter: {
        name: 'state-on-enter',
        duration: 200,
        easing: 'ease-out',
      },
      transitions: [
        { property: 'opacity', duration: 200 },
        { property: 'transform', duration: 200 },
      ],
    });

    this.registerStateAnimation({
      state: 'off',
      enter: {
        name: 'state-off-enter',
        duration: 200,
        easing: 'ease-in',
      },
      transitions: [
        { property: 'opacity', duration: 200 },
        { property: 'transform', duration: 200 },
      ],
    });

    this.registerStateAnimation({
      state: ['loading', 'updating'],
      enter: {
        name: 'loading-enter',
        duration: 500,
        iterations: 'infinite',
      },
    });
  }

  // Utility methods
  isAnimating(name?: string): boolean {
    if (name) {
      return this.activeAnimations.has(name);
    }
    return this.activeAnimations.size > 0;
  }

  getActiveAnimations(): string[] {
    return Array.from(this.activeAnimations.keys());
  }

  // Cleanup
  destroy(): void {
    this.stopAllAnimations();
    this.removeTransitions();
    this.disableHardwareAcceleration();
  }
}

// Export animation presets
export const ANIMATION_PRESETS = {
  FADE_IN: { name: 'fade-in', duration: 300, easing: 'ease-out' },
  FADE_OUT: { name: 'fade-out', duration: 300, easing: 'ease-in' },
  SLIDE_IN: { name: 'slide-in', duration: 400, easing: 'ease-out' },
  BOUNCE: { name: 'bounce', duration: 600, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
  PULSE: { name: 'pulse', duration: 1000, iterations: 'infinite' as const },
  SPIN: { name: 'spin', duration: 1000, iterations: 'infinite' as const },
} as const;

export default AnimationManager;
