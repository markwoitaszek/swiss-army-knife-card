/*
 * Toolset - Manages a collection of tools
 * Handles toolset positioning, scaling, and tool coordination
 */

import { html, TemplateResult } from 'lit';
import { BaseTool } from '../tools/base/BaseTool.js';
import type { EntityState, ThemeState, ToolsetConfig } from '../types/SakTypes.js';

export class Toolset {
  private config: ToolsetConfig;
  private tools: BaseTool[] = [];
  private entities: EntityState[] = [];
  private theme: ThemeState | null = null;
  private hass: any = null;
  private id: string;

  constructor(config: ToolsetConfig, hass: any) {
    this.config = config;
    this.hass = hass;
    this.id = config.toolset || `toolset-${Math.random().toString(36).substring(2, 11)}`;
    this.createTools();
  }

  // Public API
  getId(): string {
    return this.id;
  }

  getConfig(): ToolsetConfig {
    return this.config;
  }

  updateEntities(entities: EntityState[]): void {
    this.entities = entities;
    this.tools.forEach(tool => {
      const entityIndex = tool.entityIndex;
      if (entityIndex >= 0 && entityIndex < entities.length) {
        tool.updateEntityState(entities[entityIndex]);
      }
    });
  }

  updateTheme(theme: ThemeState | null): void {
    this.theme = theme;
    // Theme updates are handled by individual tools
  }

  render(): TemplateResult {
    if (this.tools.length === 0) {
      return html``;
    }

    const transform = this.getTransform();
    const styles = {
      transform,
      position: 'absolute' as const,
      left: '0',
      top: '0',
      width: '100%',
      height: '100%',
    };

    return html`
      <div class="sak-toolset" style="${this.styleMap(styles)}">
        ${this.tools.map(tool => tool.render())}
      </div>
    `;
  }

  // Private methods
  private createTools(): void {
    if (!this.config.tools) {
      return;
    }

    this.tools = [];

    this.config.tools.forEach(toolConfig => {
      const tool = this.createTool(toolConfig);
      if (tool) {
        this.tools.push(tool);
      }
    });
  }

  private createTool(toolConfig: any): BaseTool | null {
    // This would create the appropriate tool based on type
    // For now, we'll return null as the tool creation logic
    // would need to be implemented based on the existing tool classes

    // Tool creation would look something like:
    // switch (toolConfig.type) {
    //   case 'circle':
    //     return new CircleTool(toolConfig, this.hass);
    //   case 'rectangle':
    //     return new RectangleTool(toolConfig, this.hass);
    //   // ... other tool types
    //   default:
    //     console.warn('Unknown tool type:', toolConfig.type);
    //     return null;
    // }

    return null;
  }

  private getTransform(): string {
    let transform = '';

    // Position
    if (this.config.position) {
      transform += `translate(${this.config.position.cx}%, ${this.config.position.cy}%)`;
    }

    // Scale
    if (this.config.scale) {
      transform += ` scale(${this.config.scale.x}, ${this.config.scale.y})`;
    }

    // Rotation
    if (this.config.rotation) {
      const cx = this.config.rotation.cx || this.config.position?.cx || 50;
      const cy = this.config.rotation.cy || this.config.position?.cy || 50;
      transform += ` rotate(${this.config.rotation.angle}deg)`;
      transform += ` translate(-${cx}%, -${cy}%)`;
    }

    return transform;
  }

  private styleMap(styles: Record<string, any>): string {
    return Object.entries(styles)
      .filter(([_, value]) => value != null && value !== '')
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
  }

  // Utility methods
  getTools(): BaseTool[] {
    return this.tools;
  }

  getToolById(id: string): BaseTool | undefined {
    return this.tools.find(tool => (tool as any).config?.id === id);
  }

  // Cleanup
  disconnect(): void {
    this.tools.forEach(tool => {
      tool.remove();
    });
    this.tools = [];
  }
}
