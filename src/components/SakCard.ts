/*
 * SakCard Component
 * Main component for the Swiss Army Knife Card
 * Extracted from monolithic main.ts for better modularity
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { version } from '../../package.json';

// Import types
import type { SakConfig, EntityState, ThemeState } from '../types/SakTypes.js';

// Import services
import { EntityService } from '../services/EntityService.js';
import { ThemeService } from '../services/ThemeService.js';
import { ConfigService } from '../services/ConfigService.js';

// Import components
import { ToolsetManager } from '../toolsets/ToolsetManager.js';

// Import utilities
import { BrowserDetection } from '../utils/BrowserDetection.js';

@customElement('swiss-army-knife-card')
export class SakCard extends LitElement {
  // Properties
  @property({ attribute: false }) config: SakConfig | null = null;

  // State
  @state() private entities: EntityState[] = [];
  @state() private theme: ThemeState | null = null;
  @state() private connected = false;
  @state() private cardId: string = '';

  // Services
  private entityService: EntityService;
  private themeService: ThemeService;
  private configService: ConfigService;
  private toolsetManager: ToolsetManager;

  // Browser detection
  private browserDetection: BrowserDetection;

  // Private properties
  private _hass: any = null;

  // Development settings
  private dev = {
    debug: false,
    performance: false,
    m3: false
  };

  constructor() {
    super();
    
    // Generate unique card ID
    this.cardId = Math.random().toString(36).substring(2, 11);
    
    // Initialize services
    this.entityService = new EntityService();
    this.themeService = new ThemeService();
    this.configService = new ConfigService();
    this.toolsetManager = new ToolsetManager();
    
    // Initialize browser detection
    this.browserDetection = new BrowserDetection();
    
    // Log version info
    // eslint-disable-next-line no-console
    console.info(
      `%c  SWISS-ARMY-KNIFE-CARD  \n%c      Version ${version}      `,
      'color: yellow; font-weight: bold; background: black',
      'color: white; font-weight: bold; background: dimgray',
    );
  }

  static get styles() {
    return css`
      :host {
        display: block;
        cursor: default;
        font-size: 14px;
      }

      ha-card {
        cursor: default;
        overflow: hidden;
        -webkit-touch-callout: none;
        padding: 0;
      }

      .sak-card {
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .disabled {
        pointer-events: none !important;
        cursor: default !important;
      }

      .hover {
        cursor: pointer;
      }

      .hidden {
        opacity: 0;
        visibility: hidden;
        transition: visibility 0s 1s, opacity 0.5s linear;
      }

      @media (print), (prefers-reduced-motion: reduce) {
        .animated {
          animation-duration: 1ms !important;
          transition-duration: 1ms !important;
          animation-iteration-count: 1 !important;
        }
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.connected = true;
    
    if (this.dev.debug) {
      // eslint-disable-next-line no-console
      console.log('SakCard connected', this.cardId);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.connected = false;
    
    // Cleanup services
    this.entityService.disconnect();
    this.themeService.disconnect();
    
    if (this.dev.debug) {
      // eslint-disable-next-line no-console
      console.log('SakCard disconnected', this.cardId);
    }
  }

  setConfig(config: SakConfig): void {
    if (this.dev.debug) {
      // eslint-disable-next-line no-console
      console.log('SakCard setConfig', this.cardId);
    }

    // Validate configuration
    const validation = this.configService.validateConfig(config);
    if (!validation.isValid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    // Process configuration
    this.config = this.configService.sanitizeConfig(config);
    
    // Update development settings
    if (this.config.dev) {
      this.dev = { ...this.dev, ...this.config.dev };
    }

    // Initialize toolset manager
    this.toolsetManager.initialize(this.config, this._hass);
  }

  set hass(hass: any) {
    this._hass = hass;
    
    if (!this.connected || !this.config) {
      return;
    }

    if (this.dev.debug) {
      // eslint-disable-next-line no-console
      console.log('SakCard set hass', this.cardId);
    }

    // Update theme if changed
    const themeChanged = this.themeService.updateTheme(hass, this.config);
    
    // Update entities
    const entitiesChanged = this.entityService.updateEntities(hass, this.config);
    
    // Update toolset manager
    if (entitiesChanged || themeChanged) {
      this.toolsetManager.updateEntities(this.entityService.getEntities());
      this.toolsetManager.updateTheme(this.themeService.getTheme());
      this.requestUpdate();
    }
  }

  render() {
    if (!this.config) {
      return html`<ha-card><div class="error">No configuration provided</div></ha-card>`;
    }

    return html`
      <ha-card class="sak-card">
        ${this.toolsetManager.render()}
      </ha-card>
    `;
  }

  // Error boundary
  private handleError(error: Error, errorInfo: any) {
    // eslint-disable-next-line no-console
    console.error('SakCard Error:', error, errorInfo);
    
    return html`
      <ha-card class="error-card">
        <div class="error-content">
          <h3>Card Error</h3>
          <p>${error.message}</p>
          ${this.dev.debug ? html`<pre>${error.stack}</pre>` : ''}
        </div>
      </ha-card>
    `;
  }
}
