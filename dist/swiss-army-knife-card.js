import { css, LitElement, html } from "lit";
import { property, customElement } from "lit/decorators.js";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
let SwissArmyKnifeCard = class extends LitElement {
  constructor() {
    super(...arguments);
    this.config = {};
  }
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
};
SwissArmyKnifeCard.styles = css`
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
__decorateClass([
  property({ type: Object })
], SwissArmyKnifeCard.prototype, "config", 2);
SwissArmyKnifeCard = __decorateClass([
  customElement("swiss-army-knife-card")
], SwissArmyKnifeCard);
export {
  SwissArmyKnifeCard
};
//# sourceMappingURL=swiss-army-knife-card.js.map
