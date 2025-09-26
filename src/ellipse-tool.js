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
 * EllipseTool class
 *
 * Summary.
 *
 */

export default class EllipseTool extends BaseTool {
  constructor(argToolset, argConfig, argPos) {
    const DEFAULT_ELLIPSE_CONFIG = {
      position: {
        cx: 50,
        cy: 50,
        radiusx: 50,
        radiusy: 25,
      },
      classes: {
        tool: {
          'sak-ellipse': true,
          hover: true,
        },
        ellipse: {
          'sak-ellipse__ellipse': true,
        },
      },
      styles: {
        tool: {},
        ellipse: {},
      },
    };

    super(argToolset, Merge.mergeDeep(DEFAULT_ELLIPSE_CONFIG, argConfig), argPos);

    this.svg.radiusx = Utils.calculateSvgDimension(argConfig.position.radiusx);
    this.svg.radiusy = Utils.calculateSvgDimension(argConfig.position.radiusy);

    this.classes.tool = {};
    this.classes.ellipse = {};

    this.styles.tool = {};
    this.styles.ellipse = {};

    if (this.dev.debug)
      console.log(
        'EllipseTool constructor coords, dimensions',
        this.coords,
        this.dimensions,
        this.svg,
        this.config
      );
  }

  /** *****************************************************************************
   * EllipseTool::_renderEllipse()
   *
   * Summary.
   * Renders the ellipse using precalculated coordinates and dimensions.
   * Only the runtime style is calculated before rendering the ellipse
   *
   */

  _renderEllipse() {
    this.MergeAnimationClassIfChanged();
    this.MergeAnimationStyleIfChanged();
    this.MergeColorFromState(this.styles.ellipse);

    if (this.dev.debug)
      console.log(
        'EllipseTool - renderEllipse',
        this.svg.cx,
        this.svg.cy,
        this.svg.radiusx,
        this.svg.radiusy
      );

    return svg`
      <ellipse class="${classMap(this.classes.ellipse)}"
        cx="${this.svg.cx}"% cy="${this.svg.cy}"%
        rx="${this.svg.radiusx}" ry="${this.svg.radiusy}"
        style="${styleMap(this.styles.ellipse)}"/>
      `;
  }

  /** *****************************************************************************
   * EllipseTool::render()
   *
   * Summary.
   * The render() function for this object.
   *
   */
  render() {
    return svg`
      <g id="ellipse-${this.toolId}"
        class="${classMap(this.classes.tool)}" style="${styleMap(this.styles.tool)}"
        @click=${e => this.handleTapEvent(e, this.config)}>
        ${this._renderEllipse()}
      </g>
    `;
  }
} // END of class
