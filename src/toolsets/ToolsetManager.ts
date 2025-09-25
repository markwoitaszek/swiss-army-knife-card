/*
 * ToolsetManager - Manages toolset rendering and coordination
 * Handles toolset creation, updates, and rendering
 */

import { html, TemplateResult } from 'lit';
import type { SakConfig, ToolsetConfig, EntityState, ThemeState } from '../types/SakTypes.js';
import { Toolset } from './Toolset.js';

export class ToolsetManager {
  private toolsets: Toolset[] = [];
  private config: SakConfig | null = null;
  private entities: EntityState[] = [];
  private theme: ThemeState | null = null;
  private hass: any = null;

  constructor() {
    // Initialize manager
  }

  // Public API
  initialize(config: SakConfig, hass: any): void {
    this.config = config;
    this.hass = hass;
    this.createToolsets();
  }

  updateEntities(entities: EntityState[]): void {
    this.entities = entities;
    this.toolsets.forEach(toolset => {
      toolset.updateEntities(entities);
    });
  }

  updateTheme(theme: ThemeState | null): void {
    this.theme = theme;
    this.toolsets.forEach(toolset => {
      toolset.updateTheme(theme);
    });
  }

  render(): TemplateResult {
    if (!this.config || this.toolsets.length === 0) {
      return html``;
    }

    return html`
      <div class="sak-toolsets">
        ${this.toolsets.map(toolset => toolset.render())}
      </div>
    `;
  }

  // Private methods
  private createToolsets(): void {
    if (!this.config?.layout?.toolsets) {
      return;
    }

    this.toolsets = [];
    
    this.config.layout.toolsets.forEach((toolsetConfig: ToolsetConfig) => {
      const toolset = new Toolset(toolsetConfig, this.hass);
      toolset.updateEntities(this.entities);
      toolset.updateTheme(this.theme);
      this.toolsets.push(toolset);
    });
  }

  // Utility methods
  getToolsets(): Toolset[] {
    return this.toolsets;
  }

  getToolsetById(id: string): Toolset | undefined {
    return this.toolsets.find(toolset => toolset.getId() === id);
  }

  // Cleanup
  disconnect(): void {
    this.toolsets.forEach(toolset => {
      toolset.disconnect();
    });
    this.toolsets = [];
    this.config = null;
    this.entities = [];
    this.theme = null;
    this.hass = null;
  }
}
