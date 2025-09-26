import { svg } from 'lit';
// import { classMap } from 'lit/directives/class-map'; // Not available in Lit 3.x
// import { styleMap } from 'lit/directives/style-map'; // Not available in Lit 3.x

import Merge from './merge';

// Simple replacements for Lit 3.x compatibility
function classMap(classes) {
  if (!classes) return '';
  return Object.entries(classes)
    .filter(([_, value]) => value)
    .map(([key, _]) => key)
    .join(' ');
}

function styleMap(styles) {
  if (!styles) return '';
  return Object.entries(styles)
    .filter(([_, value]) => value != null && value !== '')
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
}

import Utils from './utils';
import BaseTool from './base-tool';

/** ****************************************************************************
 * CircleTool class
 *
 * Summary.
 *
 */

export default class CircleTool extends BaseTool {
  constructor(argToolset, argConfig, argPos) {
    const DEFAULT_CIRCLE_CONFIG = {
      position: {
        cx: 50,
        cy: 50,
        radius: 50,
      },
      classes: {
        tool: {
          'sak-circle': true,
          hover: true,
        },
        circle: {
          'sak-circle__circle': true,
        },
      },
      styles: {
        tool: {},
        circle: {},
      },
    };

    super(argToolset, Merge.mergeDeep(DEFAULT_CIRCLE_CONFIG, argConfig), argPos);
    this.EnableHoverForInteraction();

    this.svg.radius = Utils.calculateSvgDimension(argConfig.position.radius);

    this.classes.tool = {};
    this.classes.circle = {};

    this.styles.tool = {};
    this.styles.circle = {};
    if (this.dev.debug)
      console.log('CircleTool constructor config, svg', this.toolId, this.config, this.svg);
  }

  /** *****************************************************************************
   * CircleTool::value()
   *
   * Summary.
   * Receive new state data for the entity this circle is linked to. Called from set hass;
   *
   */
  set value(state) {
    super.value = state;
  }

  /** *****************************************************************************
   * CircleTool::_renderCircle()
   *
   * Summary.
   * Renders the circle using precalculated coordinates and dimensions.
   * Only the runtime style is calculated before rendering the circle
   *
   */

  _renderCircle() {
    this.MergeAnimationClassIfChanged();
    this.MergeAnimationStyleIfChanged();
    this.MergeColorFromState(this.styles.circle);

    return svg`
      <circle class="${classMap(this.classes.circle)}"
        cx="${this.svg.cx}"% cy="${this.svg.cy}"% r="${this.svg.radius}"
        style="${styleMap(this.styles.circle)}"
      </circle>

      `;
  }

  /** *****************************************************************************
   * CircleTool::render()
   *
   * Summary.
   * The render() function for this object.
   *
   */

  render() {
    this.styles.tool.overflow = 'visible';
    this.styles['transform-origin'] = `${this.svg.cx} ${this.svg.cy}`;

    return svg`
      <g "" id="circle-${this.toolId}"
        class="${classMap(this.classes.tool)}" style="${styleMap(this.styles.tool)}"
        @click=${e => this.handleTapEvent(e, this.config)}>
        ${this._renderCircle()}
      </g>
    `;
  }
} // END of class
