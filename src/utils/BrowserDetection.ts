/*
 * BrowserDetection - Detects browser capabilities and features
 * Handles Safari, iOS, and other browser-specific detection
 */

export class BrowserDetection {
  public readonly isSafari: boolean;
  public readonly isiOS: boolean;
  public readonly isSafari14: boolean;
  public readonly isSafari15: boolean;
  public readonly isSafari16: boolean;
  public readonly isChrome: boolean;
  public readonly isFirefox: boolean;
  public readonly isEdge: boolean;

  constructor() {
    this.isSafari = this.detectSafari();
    this.isiOS = this.detectiOS();
    this.isSafari14 = this.detectSafari14();
    this.isSafari15 = this.detectSafari15();
    this.isSafari16 = this.detectSafari16();
    this.isChrome = this.detectChrome();
    this.isFirefox = this.detectFirefox();
    this.isEdge = this.detectEdge();
  }

  // Safari detection
  private detectSafari(): boolean {
    return !!window.navigator.userAgent.match(/Version\/[\d.]+.*Safari/);
  }

  private detectSafari14(): boolean {
    return this.isSafari && /Version\/14\.[0-9]/.test(window.navigator.userAgent);
  }

  private detectSafari15(): boolean {
    return this.isSafari && /Version\/15\.[0-9]/.test(window.navigator.userAgent);
  }

  private detectSafari16(): boolean {
    return this.isSafari && /Version\/16\.[0-9]/.test(window.navigator.userAgent);
  }

  // iOS detection
  private detectiOS(): boolean {
    // See: https://javascriptio.com/view/10924/detect-if-device-is-ios
    // After iOS 13 you should detect iOS devices like this, since iPad will not be detected as iOS devices
    // by old ways (due to new "desktop" options, enabled by default)

    return (
      (/iPad|iPhone|iPod/.test(window.navigator.userAgent) ||
        (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)) &&
      !(window as any).MSStream
    );
  }

  // Other browser detection
  private detectChrome(): boolean {
    return /Chrome/.test(window.navigator.userAgent) && /Google Inc/.test(window.navigator.vendor);
  }

  private detectFirefox(): boolean {
    return /Firefox/.test(window.navigator.userAgent);
  }

  private detectEdge(): boolean {
    return /Edg/.test(window.navigator.userAgent);
  }

  // iOS app detection
  private detectiOSApp(): boolean {
    // The iOS app does not use a standard agent string...
    // See: https://github.com/home-assistant/iOS/blob/master/Sources/Shared/API/HAAPI.swift
    // It contains strings like "like Safari" and "OS 14_2", and "iOS 14.2.0"

    const userAgent = window.navigator.userAgent.toLowerCase();
    return (
      /os 15.*like safari/.test(userAgent) ||
      /os 14.*like safari/.test(userAgent) ||
      /os 16.*like safari/.test(userAgent)
    );
  }

  // Feature detection
  supportsSVG(): boolean {
    return (
      !!document.createElementNS &&
      !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect
    );
  }

  supportsCSSVariables(): boolean {
    return window.CSS && window.CSS.supports && window.CSS.supports('color', 'var(--test)');
  }

  supportsWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }

  supportsTouch(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  supportsPointerEvents(): boolean {
    return 'onpointerdown' in window;
  }

  // Performance detection
  isLowEndDevice(): boolean {
    // Simple heuristic for low-end devices
    return (
      navigator.hardwareConcurrency <= 2 ||
      ((navigator as any).deviceMemory && (navigator as any).deviceMemory <= 2)
    );
  }

  // Get browser info
  getBrowserInfo(): {
    name: string;
    version: string;
    platform: string;
    userAgent: string;
  } {
    const userAgent = window.navigator.userAgent;

    let name = 'Unknown';
    let version = 'Unknown';

    if (this.isChrome) {
      name = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (this.isFirefox) {
      name = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (this.isEdge) {
      name = 'Edge';
      const match = userAgent.match(/Edg\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (this.isSafari) {
      name = 'Safari';
      const match = userAgent.match(/Version\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    }

    return {
      name,
      version,
      platform: navigator.platform,
      userAgent,
    };
  }

  // Get capabilities summary
  getCapabilities(): {
    svg: boolean;
    cssVariables: boolean;
    webgl: boolean;
    touch: boolean;
    pointerEvents: boolean;
    lowEndDevice: boolean;
  } {
    return {
      svg: this.supportsSVG(),
      cssVariables: this.supportsCSSVariables(),
      webgl: this.supportsWebGL(),
      touch: this.supportsTouch(),
      pointerEvents: this.supportsPointerEvents(),
      lowEndDevice: this.isLowEndDevice(),
    };
  }
}
