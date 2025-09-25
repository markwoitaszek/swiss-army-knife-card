// Main entry point for Swiss Army Knife Card
// This will be the main component once the Lit 3.x migration is complete

import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('swiss-army-knife-card')
export class SwissArmyKnifeCard extends LitElement {
  @property({ type: Object }) config = {};

  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }

    .card {
      background: var(--card-background-color, #ffffff);
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .placeholder {
      text-align: center;
      color: var(--secondary-text-color, #666);
      font-style: italic;
    }
  `;

  render() {
    return html`
      <div class="card">
        <div class="placeholder">
          Swiss Army Knife Card - Development Mode
          <br />
          <small>Configuration: ${JSON.stringify(this.config)}</small>
        </div>
      </div>
    `;
  }
}

// Component is already exported via @customElement decorator
