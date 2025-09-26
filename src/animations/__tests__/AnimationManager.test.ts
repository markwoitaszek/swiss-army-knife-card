import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AnimationConfig, StateAnimationConfig } from '../AnimationManager.js';
import { ANIMATION_PRESETS, AnimationManager } from '../AnimationManager.js';

// Mock Web Animations API
global.Element.prototype.animate = vi.fn().mockImplementation(() => ({
  addEventListener: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  play: vi.fn(),
  finish: vi.fn(),
}));

describe('AnimationManager', () => {
  let animationManager: AnimationManager;
  let mockElement: HTMLElement;

  beforeEach(() => {
    mockElement = document.createElement('div');
    mockElement.style.setProperty = vi.fn();
    mockElement.classList = {
      add: vi.fn(),
      remove: vi.fn(),
    } as any;

    animationManager = new AnimationManager(mockElement);
  });

  it('should create animation manager instance', () => {
    expect(animationManager).toBeInstanceOf(AnimationManager);
  });

  it('should register state animations', () => {
    const config: StateAnimationConfig = {
      state: 'active',
      enter: {
        name: 'active-enter',
        duration: 300,
        easing: 'ease-out',
      },
    };

    animationManager.registerStateAnimation(config);

    // Should be able to animate to that state
    animationManager.animateToState('active');
    expect(mockElement.animate).toHaveBeenCalled();
  });

  it('should handle multiple states in single config', () => {
    const config: StateAnimationConfig = {
      state: ['loading', 'updating'],
      enter: {
        name: 'loading-enter',
        duration: 500,
        iterations: 'infinite',
      },
    };

    animationManager.registerStateAnimation(config);

    animationManager.animateToState('loading');
    expect(mockElement.animate).toHaveBeenCalled();

    animationManager.animateToState('updating');
    expect(mockElement.animate).toHaveBeenCalled();
  });

  it('should play custom animations', async () => {
    const config: AnimationConfig = {
      name: 'test-animation',
      duration: 200,
      easing: 'ease-in-out',
    };

    const keyframes = [{ opacity: 0 }, { opacity: 1 }];

    const animationPromise = animationManager.playAnimation(config, keyframes);

    expect(mockElement.animate).toHaveBeenCalledWith(keyframes, {
      duration: 200,
      easing: 'ease-in-out',
      delay: 0,
      iterations: 1,
      direction: 'normal',
      fill: 'none',
    });

    // Simulate animation finish
    const mockAnimation = (mockElement.animate as any).mock.results[0].value;
    const finishCallback = mockAnimation.addEventListener.mock.calls.find(
      (call: any) => call[0] === 'finish'
    )?.[1];

    if (finishCallback) {
      finishCallback();
    }

    await animationPromise;
  });

  it('should use animation presets', async () => {
    await animationManager.fadeIn();
    expect(mockElement.animate).toHaveBeenCalledWith(
      [{ opacity: 0 }, { opacity: 1 }],
      expect.objectContaining({ duration: 300 })
    );

    await animationManager.fadeOut();
    expect(mockElement.animate).toHaveBeenCalledWith(
      [{ opacity: 1 }, { opacity: 0 }],
      expect.objectContaining({ duration: 300 })
    );
  });

  it('should handle slide animations', async () => {
    await animationManager.slideIn('left');
    expect(mockElement.animate).toHaveBeenCalledWith(
      [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }],
      expect.objectContaining({ duration: 300 })
    );

    await animationManager.slideIn('right');
    expect(mockElement.animate).toHaveBeenCalledWith(
      [{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }],
      expect.objectContaining({ duration: 300 })
    );
  });

  it('should handle bounce animation', async () => {
    await animationManager.bounce();
    expect(mockElement.animate).toHaveBeenCalledWith(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.1)' },
        { transform: 'scale(0.9)' },
        { transform: 'scale(1.05)' },
        { transform: 'scale(1)' },
      ],
      expect.objectContaining({ duration: 600 })
    );
  });

  it('should handle infinite animations', async () => {
    await animationManager.pulse();
    expect(mockElement.animate).toHaveBeenCalledWith(
      [{ opacity: 1 }, { opacity: 0.7 }, { opacity: 1 }],
      expect.objectContaining({
        duration: 1000,
        iterations: 'infinite',
      })
    );

    await animationManager.spin();
    expect(mockElement.animate).toHaveBeenCalledWith(
      [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
      expect.objectContaining({
        duration: 1000,
        iterations: 'infinite',
      })
    );
  });

  it('should manage active animations', () => {
    expect(animationManager.isAnimating()).toBe(false);
    expect(animationManager.getActiveAnimations()).toHaveLength(0);

    // Start animation
    animationManager.fadeIn();
    // Would track active animations in real implementation
  });

  it('should stop animations', () => {
    animationManager.fadeIn();
    animationManager.pulse();

    animationManager.stopAnimation('fade-in');
    animationManager.stopAllAnimations();

    expect(animationManager.getActiveAnimations()).toHaveLength(0);
  });

  it('should apply transitions', () => {
    const transitions = [
      { property: 'opacity', duration: 300, easing: 'ease' },
      { property: 'transform', duration: 500, easing: 'ease-out' },
    ];

    animationManager.applyTransitions(transitions);

    expect(mockElement.style.transition).toBe(
      'opacity 300ms ease 0ms, transform 500ms ease-out 0ms'
    );
  });

  it('should remove transitions', () => {
    animationManager.applyTransitions([{ property: 'opacity', duration: 300 }]);

    animationManager.removeTransitions();
    expect(mockElement.style.transition).toBe('');
  });

  it('should handle loading animations', () => {
    animationManager.showLoadingAnimation({ type: 'spin', duration: 800 });
    expect(mockElement.animate).toHaveBeenCalled();

    animationManager.hideLoadingAnimation();
    // Should stop animations and fade out
  });

  it('should setup hover animations', () => {
    const enterConfig = { name: 'hover-enter', duration: 150 };
    const leaveConfig = { name: 'hover-leave', duration: 150 };

    animationManager.setupHoverAnimations(enterConfig, leaveConfig);

    // Should add event listeners
    expect(mockElement.addEventListener).toHaveBeenCalledWith('mouseenter', expect.any(Function));
    expect(mockElement.addEventListener).toHaveBeenCalledWith('mouseleave', expect.any(Function));
  });

  it('should manage hardware acceleration', () => {
    animationManager.enableHardwareAcceleration();
    expect(mockElement.style.willChange).toBe('transform, opacity');
    expect(mockElement.style.transform).toBe('translateZ(0)');

    animationManager.disableHardwareAcceleration();
    expect(mockElement.style.willChange).toBe('auto');
    expect(mockElement.style.transform).toBe('');
  });

  it('should add and remove animation classes', () => {
    animationManager.addAnimationClass('shake', 500);
    expect(mockElement.classList.add).toHaveBeenCalledWith('shake');

    animationManager.removeAnimationClass('shake');
    expect(mockElement.classList.remove).toHaveBeenCalledWith('shake');
  });

  it('should handle state transitions', () => {
    // Register state animations
    animationManager.registerStateAnimation({
      state: 'on',
      enter: { name: 'on-enter', duration: 200 },
      exit: { name: 'on-exit', duration: 200 },
    });

    animationManager.registerStateAnimation({
      state: 'off',
      enter: { name: 'off-enter', duration: 200 },
    });

    // Animate from off to on
    animationManager.animateToState('on');
    expect(mockElement.animate).toHaveBeenCalled();

    // Animate from on to off (should trigger exit then enter)
    animationManager.animateToState('off');
    expect(mockElement.animate).toHaveBeenCalled();
  });

  it('should cleanup properly', () => {
    animationManager.enableHardwareAcceleration();
    animationManager.applyTransitions([{ property: 'opacity', duration: 300 }]);

    animationManager.destroy();

    expect(mockElement.style.willChange).toBe('auto');
    expect(mockElement.style.transition).toBe('');
  });

  it('should validate animation presets', () => {
    expect(ANIMATION_PRESETS.FADE_IN.name).toBe('fade-in');
    expect(ANIMATION_PRESETS.FADE_OUT.name).toBe('fade-out');
    expect(ANIMATION_PRESETS.SLIDE_IN.name).toBe('slide-in');
    expect(ANIMATION_PRESETS.BOUNCE.name).toBe('bounce');
    expect(ANIMATION_PRESETS.PULSE.iterations).toBe('infinite');
    expect(ANIMATION_PRESETS.SPIN.iterations).toBe('infinite');
  });
});
