// Type declarations for JavaScript modules

declare module './const' {
  export const FONT_SIZE: number;
  export const SVG_DEFAULT_DIMENSIONS: number;
  export const SVG_VIEW_BOX: number;
}

declare module './colors' {
  export default class Colors {
    static setElement(element: any): void;
    static processTheme(theme: any): { themeLight: any; themeDark: any };
    static processPalette(palette: any): { paletteLight: any; paletteDark: any };
    static getGradientValue(color1: string, color2: string, ratio: number): string;
    static colorCache: any[];
  }
}

declare module './merge' {
  export default class Merge {
    static mergeDeep(obj1: any, obj2?: any): any;
  }
}

declare module './templates' {
  export default class Templates {
    static replaceVariables3(variables: any, template: any): any;
    static getJsTemplateOrValueConfig(config: any, entities: any, defaultConfig: any): any;
  }
}

declare module './toolset' {
  export default class Toolset {
    constructor(card: any, config: any);
    updateValues(): void;
    firstUpdated(changedProperties: any): void;
    updated(changedProperties: any): void;
    render(): any;
  }
}

declare module './utils' {
  export default class Utils {
    static getLovelace(): any;
  }
}

declare module './frontend_mods/color/convert-color' {
  export function hs2rgb(h: number, s: number, l: number): [number, number, number];
  export function hsv2rgb(h: number, s: number, v: number): [number, number, number];
  export function rgb2hex(r: number, g: number, b: number): string;
  export function rgb2hsv(r: number, g: number, b: number): [number, number, number];
}

declare module './frontend_mods/color/convert-light-color' {
  export function rgbw2rgb(r: number, g: number, b: number, w: number): [number, number, number];
  export function rgbww2rgb(r: number, g: number, b: number, ww: number, cw: number): [number, number, number];
  export function temperature2rgb(temperature: number): [number, number, number];
}

declare module './frontend_mods/common/entity/compute_domain' {
  export function computeDomain(entityId: string): string;
}

// Extend Window interface for MSStream
declare global {
  interface Window {
    MSStream?: any;
  }
  
  interface Console {
    warning?: (message?: any, ...optionalParams: any[]) => void;
  }
}
