/*
 * StyleUtils - Utility functions for style handling
 * Provides style mapping and CSS generation utilities
 */

export function styleMap(
  styles: Record<string, string | number | undefined> | null | undefined
): string {
  if (!styles) return '';

  return (
    Object.entries(styles)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, value]) => value != null && value !== '')
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ')
  );
}

export function classMap(classes: Record<string, boolean | undefined> | null | undefined): string {
  if (!classes) return '';

  return Object.entries(classes)
    .filter(([_, value]) => value === true)
    .map(([key, _]) => key)
    .join(' ');
}

export function generateCSSVariables(variables: Record<string, string>): string {
  return Object.entries(variables)
    .map(([key, value]) => `--${key}: ${value};`)
    .join(' ');
}

export function generateTransform(transform: {
  translate?: { x: number; y: number };
  scale?: { x: number; y: number };
  rotate?: { angle: number; cx?: number; cy?: number };
}): string {
  const transforms: string[] = [];

  if (transform.translate) {
    transforms.push(`translate(${transform.translate.x}px, ${transform.translate.y}px)`);
  }

  if (transform.scale) {
    transforms.push(`scale(${transform.scale.x}, ${transform.scale.y})`);
  }

  if (transform.rotate) {
    const { angle, cx = 0, cy = 0 } = transform.rotate;
    transforms.push(`rotate(${angle}deg)`);
    if (cx !== 0 || cy !== 0) {
      transforms.push(`translate(-${cx}px, -${cy}px)`);
    }
  }

  return transforms.join(' ');
}

export function generateAnimation(animation: {
  name: string;
  duration?: number;
  delay?: number;
  iterations?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  easing?: string;
}): string {
  const parts: string[] = [];

  if (animation.name) {
    parts.push(animation.name);
  }

  if (animation.duration) {
    parts.push(`${animation.duration}ms`);
  }

  if (animation.easing) {
    parts.push(animation.easing);
  }

  if (animation.delay) {
    parts.push(`${animation.delay}ms`);
  }

  if (animation.iterations) {
    parts.push(animation.iterations.toString());
  }

  if (animation.direction) {
    parts.push(animation.direction);
  }

  return parts.join(' ');
}

export function generateBoxShadow(shadow: {
  x: number;
  y: number;
  blur: number;
  spread?: number;
  color: string;
  inset?: boolean;
}): string {
  const { x, y, blur, spread = 0, color, inset = false } = shadow;
  const insetStr = inset ? 'inset ' : '';
  return `${insetStr}${x}px ${y}px ${blur}px ${spread}px ${color}`;
}

export function generateGradient(gradient: {
  type: 'linear' | 'radial';
  direction?: string;
  stops: Array<{ color: string; position: number }>;
}): string {
  const { type, direction = 'to right', stops } = gradient;

  if (type === 'linear') {
    const stopStr = stops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
    return `linear-gradient(${direction}, ${stopStr})`;
  } else {
    const stopStr = stops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
    return `radial-gradient(circle, ${stopStr})`;
  }
}

export function generateFilter(filters: {
  blur?: number;
  brightness?: number;
  contrast?: number;
  grayscale?: number;
  hueRotate?: number;
  invert?: number;
  opacity?: number;
  saturate?: number;
  sepia?: number;
}): string {
  const filterParts: string[] = [];

  if (filters.blur !== undefined) {
    filterParts.push(`blur(${filters.blur}px)`);
  }

  if (filters.brightness !== undefined) {
    filterParts.push(`brightness(${filters.brightness})`);
  }

  if (filters.contrast !== undefined) {
    filterParts.push(`contrast(${filters.contrast})`);
  }

  if (filters.grayscale !== undefined) {
    filterParts.push(`grayscale(${filters.grayscale})`);
  }

  if (filters.hueRotate !== undefined) {
    filterParts.push(`hue-rotate(${filters.hueRotate}deg)`);
  }

  if (filters.invert !== undefined) {
    filterParts.push(`invert(${filters.invert})`);
  }

  if (filters.opacity !== undefined) {
    filterParts.push(`opacity(${filters.opacity})`);
  }

  if (filters.saturate !== undefined) {
    filterParts.push(`saturate(${filters.saturate})`);
  }

  if (filters.sepia !== undefined) {
    filterParts.push(`sepia(${filters.sepia})`);
  }

  return filterParts.join(' ');
}

export function generateClipPath(path: string): string {
  return `clip-path: ${path}`;
}

export function generateMask(mask: {
  image?: string;
  position?: string;
  size?: string;
  repeat?: string;
}): string {
  const parts: string[] = [];

  if (mask.image) {
    parts.push(`url(${mask.image})`);
  }

  if (mask.position) {
    parts.push(mask.position);
  }

  if (mask.size) {
    parts.push(mask.size);
  }

  if (mask.repeat) {
    parts.push(mask.repeat);
  }

  return parts.join(' ');
}

export function generateBackdropFilter(filters: {
  blur?: number;
  brightness?: number;
  contrast?: number;
  grayscale?: number;
  hueRotate?: number;
  invert?: number;
  opacity?: number;
  saturate?: number;
  sepia?: number;
}): string {
  return generateFilter(filters);
}

export function generateTransition(transition: {
  property: string;
  duration: number;
  delay?: number;
  easing?: string;
}): string {
  const { property, duration, delay = 0, easing = 'ease' } = transition;
  return `${property} ${duration}ms ${easing} ${delay}ms`;
}

export function generateKeyframes(
  name: string,
  keyframes: Record<string, Record<string, string>>
): string {
  const frames = Object.entries(keyframes)
    .map(([percentage, styles]) => {
      const styleStr = Object.entries(styles)
        .map(([prop, value]) => `${prop}: ${value}`)
        .join('; ');
      return `${percentage} { ${styleStr} }`;
    })
    .join(' ');

  return `@keyframes ${name} { ${frames} }`;
}
