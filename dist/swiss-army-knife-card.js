import { svg, LitElement, css, unsafeCSS, html } from "lit";
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const global = globalThis;
const debugLogEvent = (event) => {
  const shouldEmit = global.emitLitDebugLogEvents;
  if (!shouldEmit) {
    return;
  }
  global.dispatchEvent(new CustomEvent("lit-debug", {
    detail: event
  }));
};
let issueWarning;
{
  global.litIssuedWarnings ??= /* @__PURE__ */ new Set();
  issueWarning = (code, warning) => {
    warning += code ? ` See https://lit.dev/msg/${code} for more information.` : "";
    if (!global.litIssuedWarnings.has(warning) && !global.litIssuedWarnings.has(code)) {
      console.warn(warning);
      global.litIssuedWarnings.add(warning);
    }
  };
  queueMicrotask(() => {
    issueWarning("dev-mode", `Lit is in dev mode. Not recommended for production!`);
  });
}
const wrap = global.ShadyDOM?.inUse && global.ShadyDOM?.noPatch === true ? global.ShadyDOM.wrap : (node) => node;
const trustedTypes = global.trustedTypes;
const policy = trustedTypes ? trustedTypes.createPolicy("lit-html", {
  createHTML: (s) => s
}) : void 0;
const identityFunction = (value) => value;
const noopSanitizer = (_node, _name, _type) => identityFunction;
const createSanitizer = (node, name, type) => {
  return sanitizerFactoryInternal();
};
const boundAttributeSuffix = "$lit$";
const marker = `lit$${Math.random().toFixed(9).slice(2)}$`;
const markerMatch = "?" + marker;
const nodeMarker = `<${markerMatch}>`;
const d = document;
const createMarker = () => d.createComment("");
const isPrimitive = (value) => value === null || typeof value != "object" && typeof value != "function";
const isArray = Array.isArray;
const isIterable = (value) => isArray(value) || // eslint-disable-next-line @typescript-eslint/no-explicit-any
typeof value?.[Symbol.iterator] === "function";
const SPACE_CHAR = `[ 	
\f\r]`;
const ATTR_VALUE_CHAR = `[^ 	
\f\r"'\`<>=]`;
const NAME_CHAR = `[^\\s"'>=/]`;
const textEndRegex = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
const COMMENT_START = 1;
const TAG_NAME = 2;
const DYNAMIC_TAG_NAME = 3;
const commentEndRegex = /-->/g;
const comment2EndRegex = />/g;
const tagEndRegex = new RegExp(`>|${SPACE_CHAR}(?:(${NAME_CHAR}+)(${SPACE_CHAR}*=${SPACE_CHAR}*(?:${ATTR_VALUE_CHAR}|("|')|))|$)`, "g");
const ENTIRE_MATCH = 0;
const ATTRIBUTE_NAME = 1;
const SPACES_AND_EQUALS = 2;
const QUOTE_CHAR = 3;
const singleQuoteAttrEndRegex = /'/g;
const doubleQuoteAttrEndRegex = /"/g;
const rawTextElement = /^(?:script|style|textarea|title)$/i;
const SVG_RESULT$1 = 2;
const MATHML_RESULT = 3;
const ATTRIBUTE_PART = 1;
const CHILD_PART = 2;
const PROPERTY_PART = 3;
const BOOLEAN_ATTRIBUTE_PART = 4;
const EVENT_PART = 5;
const ELEMENT_PART = 6;
const COMMENT_PART = 7;
const noChange = Symbol.for("lit-noChange");
const nothing = Symbol.for("lit-nothing");
const templateCache = /* @__PURE__ */ new WeakMap();
const walker = d.createTreeWalker(
  d,
  129
  /* NodeFilter.SHOW_{ELEMENT|COMMENT} */
);
let sanitizerFactoryInternal = noopSanitizer;
function trustFromTemplateString(tsa, stringFromTSA) {
  if (!isArray(tsa) || !tsa.hasOwnProperty("raw")) {
    let message = "invalid template strings array";
    {
      message = `
          Internal Error: expected template strings to be an array
          with a 'raw' field. Faking a template strings array by
          calling html or svg like an ordinary function is effectively
          the same as calling unsafeHtml and can lead to major security
          issues, e.g. opening your code up to XSS attacks.
          If you're using the html or svg tagged template functions normally
          and still seeing this error, please file a bug at
          https://github.com/lit/lit/issues/new?template=bug_report.md
          and include information about your build tooling, if any.
        `.trim().replace(/\n */g, "\n");
    }
    throw new Error(message);
  }
  return policy !== void 0 ? policy.createHTML(stringFromTSA) : stringFromTSA;
}
const getTemplateHtml = (strings, type) => {
  const l = strings.length - 1;
  const attrNames = [];
  let html2 = type === SVG_RESULT$1 ? "<svg>" : type === MATHML_RESULT ? "<math>" : "";
  let rawTextEndRegex;
  let regex = textEndRegex;
  for (let i = 0; i < l; i++) {
    const s = strings[i];
    let attrNameEndIndex = -1;
    let attrName;
    let lastIndex = 0;
    let match;
    while (lastIndex < s.length) {
      regex.lastIndex = lastIndex;
      match = regex.exec(s);
      if (match === null) {
        break;
      }
      lastIndex = regex.lastIndex;
      if (regex === textEndRegex) {
        if (match[COMMENT_START] === "!--") {
          regex = commentEndRegex;
        } else if (match[COMMENT_START] !== void 0) {
          regex = comment2EndRegex;
        } else if (match[TAG_NAME] !== void 0) {
          if (rawTextElement.test(match[TAG_NAME])) {
            rawTextEndRegex = new RegExp(`</${match[TAG_NAME]}`, "g");
          }
          regex = tagEndRegex;
        } else if (match[DYNAMIC_TAG_NAME] !== void 0) {
          {
            throw new Error("Bindings in tag names are not supported. Please use static templates instead. See https://lit.dev/docs/templates/expressions/#static-expressions");
          }
        }
      } else if (regex === tagEndRegex) {
        if (match[ENTIRE_MATCH] === ">") {
          regex = rawTextEndRegex ?? textEndRegex;
          attrNameEndIndex = -1;
        } else if (match[ATTRIBUTE_NAME] === void 0) {
          attrNameEndIndex = -2;
        } else {
          attrNameEndIndex = regex.lastIndex - match[SPACES_AND_EQUALS].length;
          attrName = match[ATTRIBUTE_NAME];
          regex = match[QUOTE_CHAR] === void 0 ? tagEndRegex : match[QUOTE_CHAR] === '"' ? doubleQuoteAttrEndRegex : singleQuoteAttrEndRegex;
        }
      } else if (regex === doubleQuoteAttrEndRegex || regex === singleQuoteAttrEndRegex) {
        regex = tagEndRegex;
      } else if (regex === commentEndRegex || regex === comment2EndRegex) {
        regex = textEndRegex;
      } else {
        regex = tagEndRegex;
        rawTextEndRegex = void 0;
      }
    }
    {
      console.assert(attrNameEndIndex === -1 || regex === tagEndRegex || regex === singleQuoteAttrEndRegex || regex === doubleQuoteAttrEndRegex, "unexpected parse state B");
    }
    const end = regex === tagEndRegex && strings[i + 1].startsWith("/>") ? " " : "";
    html2 += regex === textEndRegex ? s + nodeMarker : attrNameEndIndex >= 0 ? (attrNames.push(attrName), s.slice(0, attrNameEndIndex) + boundAttributeSuffix + s.slice(attrNameEndIndex)) + marker + end : s + marker + (attrNameEndIndex === -2 ? i : end);
  }
  const htmlResult = html2 + (strings[l] || "<?>") + (type === SVG_RESULT$1 ? "</svg>" : type === MATHML_RESULT ? "</math>" : "");
  return [trustFromTemplateString(strings, htmlResult), attrNames];
};
class Template {
  constructor({ strings, ["_$litType$"]: type }, options) {
    this.parts = [];
    let node;
    let nodeIndex = 0;
    let attrNameIndex = 0;
    const partCount = strings.length - 1;
    const parts = this.parts;
    const [html2, attrNames] = getTemplateHtml(strings, type);
    this.el = Template.createElement(html2, options);
    walker.currentNode = this.el.content;
    if (type === SVG_RESULT$1 || type === MATHML_RESULT) {
      const wrapper = this.el.content.firstChild;
      wrapper.replaceWith(...wrapper.childNodes);
    }
    while ((node = walker.nextNode()) !== null && parts.length < partCount) {
      if (node.nodeType === 1) {
        {
          const tag = node.localName;
          if (/^(?:textarea|template)$/i.test(tag) && node.innerHTML.includes(marker)) {
            const m = `Expressions are not supported inside \`${tag}\` elements. See https://lit.dev/msg/expression-in-${tag} for more information.`;
            if (tag === "template") {
              throw new Error(m);
            } else
              issueWarning("", m);
          }
        }
        if (node.hasAttributes()) {
          for (const name of node.getAttributeNames()) {
            if (name.endsWith(boundAttributeSuffix)) {
              const realName = attrNames[attrNameIndex++];
              const value = node.getAttribute(name);
              const statics = value.split(marker);
              const m = /([.?@])?(.*)/.exec(realName);
              parts.push({
                type: ATTRIBUTE_PART,
                index: nodeIndex,
                name: m[2],
                strings: statics,
                ctor: m[1] === "." ? PropertyPart : m[1] === "?" ? BooleanAttributePart : m[1] === "@" ? EventPart : AttributePart
              });
              node.removeAttribute(name);
            } else if (name.startsWith(marker)) {
              parts.push({
                type: ELEMENT_PART,
                index: nodeIndex
              });
              node.removeAttribute(name);
            }
          }
        }
        if (rawTextElement.test(node.tagName)) {
          const strings2 = node.textContent.split(marker);
          const lastIndex = strings2.length - 1;
          if (lastIndex > 0) {
            node.textContent = trustedTypes ? trustedTypes.emptyScript : "";
            for (let i = 0; i < lastIndex; i++) {
              node.append(strings2[i], createMarker());
              walker.nextNode();
              parts.push({ type: CHILD_PART, index: ++nodeIndex });
            }
            node.append(strings2[lastIndex], createMarker());
          }
        }
      } else if (node.nodeType === 8) {
        const data = node.data;
        if (data === markerMatch) {
          parts.push({ type: CHILD_PART, index: nodeIndex });
        } else {
          let i = -1;
          while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
            parts.push({ type: COMMENT_PART, index: nodeIndex });
            i += marker.length - 1;
          }
        }
      }
      nodeIndex++;
    }
    {
      if (attrNames.length !== attrNameIndex) {
        throw new Error(`Detected duplicate attribute bindings. This occurs if your template has duplicate attributes on an element tag. For example "<input ?disabled=\${true} ?disabled=\${false}>" contains a duplicate "disabled" attribute. The error was detected in the following template: 
\`` + strings.join("${...}") + "`");
      }
    }
    debugLogEvent && debugLogEvent({
      kind: "template prep",
      template: this,
      clonableTemplate: this.el,
      parts: this.parts,
      strings
    });
  }
  // Overridden via `litHtmlPolyfillSupport` to provide platform support.
  /** @nocollapse */
  static createElement(html2, _options) {
    const el = d.createElement("template");
    el.innerHTML = html2;
    return el;
  }
}
function resolveDirective(part, value, parent = part, attributeIndex) {
  if (value === noChange) {
    return value;
  }
  let currentDirective = attributeIndex !== void 0 ? parent.__directives?.[attributeIndex] : parent.__directive;
  const nextDirectiveConstructor = isPrimitive(value) ? void 0 : (
    // This property needs to remain unminified.
    value["_$litDirective$"]
  );
  if (currentDirective?.constructor !== nextDirectiveConstructor) {
    currentDirective?.["_$notifyDirectiveConnectionChanged"]?.(false);
    if (nextDirectiveConstructor === void 0) {
      currentDirective = void 0;
    } else {
      currentDirective = new nextDirectiveConstructor(part);
      currentDirective._$initialize(part, parent, attributeIndex);
    }
    if (attributeIndex !== void 0) {
      (parent.__directives ??= [])[attributeIndex] = currentDirective;
    } else {
      parent.__directive = currentDirective;
    }
  }
  if (currentDirective !== void 0) {
    value = resolveDirective(part, currentDirective._$resolve(part, value.values), currentDirective, attributeIndex);
  }
  return value;
}
class TemplateInstance {
  constructor(template, parent) {
    this._$parts = [];
    this._$disconnectableChildren = void 0;
    this._$template = template;
    this._$parent = parent;
  }
  // Called by ChildPart parentNode getter
  get parentNode() {
    return this._$parent.parentNode;
  }
  // See comment in Disconnectable interface for why this is a getter
  get _$isConnected() {
    return this._$parent._$isConnected;
  }
  // This method is separate from the constructor because we need to return a
  // DocumentFragment and we don't want to hold onto it with an instance field.
  _clone(options) {
    const { el: { content }, parts } = this._$template;
    const fragment = (options?.creationScope ?? d).importNode(content, true);
    walker.currentNode = fragment;
    let node = walker.nextNode();
    let nodeIndex = 0;
    let partIndex = 0;
    let templatePart = parts[0];
    while (templatePart !== void 0) {
      if (nodeIndex === templatePart.index) {
        let part;
        if (templatePart.type === CHILD_PART) {
          part = new ChildPart(node, node.nextSibling, this, options);
        } else if (templatePart.type === ATTRIBUTE_PART) {
          part = new templatePart.ctor(node, templatePart.name, templatePart.strings, this, options);
        } else if (templatePart.type === ELEMENT_PART) {
          part = new ElementPart(node, this, options);
        }
        this._$parts.push(part);
        templatePart = parts[++partIndex];
      }
      if (nodeIndex !== templatePart?.index) {
        node = walker.nextNode();
        nodeIndex++;
      }
    }
    walker.currentNode = d;
    return fragment;
  }
  _update(values) {
    let i = 0;
    for (const part of this._$parts) {
      if (part !== void 0) {
        debugLogEvent && debugLogEvent({
          kind: "set part",
          part,
          value: values[i],
          valueIndex: i,
          values,
          templateInstance: this
        });
        if (part.strings !== void 0) {
          part._$setValue(values, part, i);
          i += part.strings.length - 2;
        } else {
          part._$setValue(values[i]);
        }
      }
      i++;
    }
  }
}
class ChildPart {
  // See comment in Disconnectable interface for why this is a getter
  get _$isConnected() {
    return this._$parent?._$isConnected ?? this.__isConnected;
  }
  constructor(startNode, endNode, parent, options) {
    this.type = CHILD_PART;
    this._$committedValue = nothing;
    this._$disconnectableChildren = void 0;
    this._$startNode = startNode;
    this._$endNode = endNode;
    this._$parent = parent;
    this.options = options;
    this.__isConnected = options?.isConnected ?? true;
    {
      this._textSanitizer = void 0;
    }
  }
  /**
   * The parent node into which the part renders its content.
   *
   * A ChildPart's content consists of a range of adjacent child nodes of
   * `.parentNode`, possibly bordered by 'marker nodes' (`.startNode` and
   * `.endNode`).
   *
   * - If both `.startNode` and `.endNode` are non-null, then the part's content
   * consists of all siblings between `.startNode` and `.endNode`, exclusively.
   *
   * - If `.startNode` is non-null but `.endNode` is null, then the part's
   * content consists of all siblings following `.startNode`, up to and
   * including the last child of `.parentNode`. If `.endNode` is non-null, then
   * `.startNode` will always be non-null.
   *
   * - If both `.endNode` and `.startNode` are null, then the part's content
   * consists of all child nodes of `.parentNode`.
   */
  get parentNode() {
    let parentNode = wrap(this._$startNode).parentNode;
    const parent = this._$parent;
    if (parent !== void 0 && parentNode?.nodeType === 11) {
      parentNode = parent.parentNode;
    }
    return parentNode;
  }
  /**
   * The part's leading marker node, if any. See `.parentNode` for more
   * information.
   */
  get startNode() {
    return this._$startNode;
  }
  /**
   * The part's trailing marker node, if any. See `.parentNode` for more
   * information.
   */
  get endNode() {
    return this._$endNode;
  }
  _$setValue(value, directiveParent = this) {
    if (this.parentNode === null) {
      throw new Error(`This \`ChildPart\` has no \`parentNode\` and therefore cannot accept a value. This likely means the element containing the part was manipulated in an unsupported way outside of Lit's control such that the part's marker nodes were ejected from DOM. For example, setting the element's \`innerHTML\` or \`textContent\` can do this.`);
    }
    value = resolveDirective(this, value, directiveParent);
    if (isPrimitive(value)) {
      if (value === nothing || value == null || value === "") {
        if (this._$committedValue !== nothing) {
          debugLogEvent && debugLogEvent({
            kind: "commit nothing to child",
            start: this._$startNode,
            end: this._$endNode,
            parent: this._$parent,
            options: this.options
          });
          this._$clear();
        }
        this._$committedValue = nothing;
      } else if (value !== this._$committedValue && value !== noChange) {
        this._commitText(value);
      }
    } else if (value["_$litType$"] !== void 0) {
      this._commitTemplateResult(value);
    } else if (value.nodeType !== void 0) {
      if (this.options?.host === value) {
        this._commitText(`[probable mistake: rendered a template's host in itself (commonly caused by writing \${this} in a template]`);
        console.warn(`Attempted to render the template host`, value, `inside itself. This is almost always a mistake, and in dev mode `, `we render some warning text. In production however, we'll `, `render it, which will usually result in an error, and sometimes `, `in the element disappearing from the DOM.`);
        return;
      }
      this._commitNode(value);
    } else if (isIterable(value)) {
      this._commitIterable(value);
    } else {
      this._commitText(value);
    }
  }
  _insert(node) {
    return wrap(wrap(this._$startNode).parentNode).insertBefore(node, this._$endNode);
  }
  _commitNode(value) {
    if (this._$committedValue !== value) {
      this._$clear();
      if (sanitizerFactoryInternal !== noopSanitizer) {
        const parentNodeName = this._$startNode.parentNode?.nodeName;
        if (parentNodeName === "STYLE" || parentNodeName === "SCRIPT") {
          let message = "Forbidden";
          {
            if (parentNodeName === "STYLE") {
              message = `Lit does not support binding inside style nodes. This is a security risk, as style injection attacks can exfiltrate data and spoof UIs. Consider instead using css\`...\` literals to compose styles, and do dynamic styling with css custom properties, ::parts, <slot>s, and by mutating the DOM rather than stylesheets.`;
            } else {
              message = `Lit does not support binding inside script nodes. This is a security risk, as it could allow arbitrary code execution.`;
            }
          }
          throw new Error(message);
        }
      }
      debugLogEvent && debugLogEvent({
        kind: "commit node",
        start: this._$startNode,
        parent: this._$parent,
        value,
        options: this.options
      });
      this._$committedValue = this._insert(value);
    }
  }
  _commitText(value) {
    if (this._$committedValue !== nothing && isPrimitive(this._$committedValue)) {
      const node = wrap(this._$startNode).nextSibling;
      {
        if (this._textSanitizer === void 0) {
          this._textSanitizer = createSanitizer();
        }
        value = this._textSanitizer(value);
      }
      debugLogEvent && debugLogEvent({
        kind: "commit text",
        node,
        value,
        options: this.options
      });
      node.data = value;
    } else {
      {
        const textNode = d.createTextNode("");
        this._commitNode(textNode);
        if (this._textSanitizer === void 0) {
          this._textSanitizer = createSanitizer();
        }
        value = this._textSanitizer(value);
        debugLogEvent && debugLogEvent({
          kind: "commit text",
          node: textNode,
          value,
          options: this.options
        });
        textNode.data = value;
      }
    }
    this._$committedValue = value;
  }
  _commitTemplateResult(result) {
    const { values, ["_$litType$"]: type } = result;
    const template = typeof type === "number" ? this._$getTemplate(result) : (type.el === void 0 && (type.el = Template.createElement(trustFromTemplateString(type.h, type.h[0]), this.options)), type);
    if (this._$committedValue?._$template === template) {
      debugLogEvent && debugLogEvent({
        kind: "template updating",
        template,
        instance: this._$committedValue,
        parts: this._$committedValue._$parts,
        options: this.options,
        values
      });
      this._$committedValue._update(values);
    } else {
      const instance = new TemplateInstance(template, this);
      const fragment = instance._clone(this.options);
      debugLogEvent && debugLogEvent({
        kind: "template instantiated",
        template,
        instance,
        parts: instance._$parts,
        options: this.options,
        fragment,
        values
      });
      instance._update(values);
      debugLogEvent && debugLogEvent({
        kind: "template instantiated and updated",
        template,
        instance,
        parts: instance._$parts,
        options: this.options,
        fragment,
        values
      });
      this._commitNode(fragment);
      this._$committedValue = instance;
    }
  }
  // Overridden via `litHtmlPolyfillSupport` to provide platform support.
  /** @internal */
  _$getTemplate(result) {
    let template = templateCache.get(result.strings);
    if (template === void 0) {
      templateCache.set(result.strings, template = new Template(result));
    }
    return template;
  }
  _commitIterable(value) {
    if (!isArray(this._$committedValue)) {
      this._$committedValue = [];
      this._$clear();
    }
    const itemParts = this._$committedValue;
    let partIndex = 0;
    let itemPart;
    for (const item of value) {
      if (partIndex === itemParts.length) {
        itemParts.push(itemPart = new ChildPart(this._insert(createMarker()), this._insert(createMarker()), this, this.options));
      } else {
        itemPart = itemParts[partIndex];
      }
      itemPart._$setValue(item);
      partIndex++;
    }
    if (partIndex < itemParts.length) {
      this._$clear(itemPart && wrap(itemPart._$endNode).nextSibling, partIndex);
      itemParts.length = partIndex;
    }
  }
  /**
   * Removes the nodes contained within this Part from the DOM.
   *
   * @param start Start node to clear from, for clearing a subset of the part's
   *     DOM (used when truncating iterables)
   * @param from  When `start` is specified, the index within the iterable from
   *     which ChildParts are being removed, used for disconnecting directives
   *     in those Parts.
   *
   * @internal
   */
  _$clear(start = wrap(this._$startNode).nextSibling, from) {
    this._$notifyConnectionChanged?.(false, true, from);
    while (start !== this._$endNode) {
      const n = wrap(start).nextSibling;
      wrap(start).remove();
      start = n;
    }
  }
  /**
   * Implementation of RootPart's `isConnected`. Note that this method
   * should only be called on `RootPart`s (the `ChildPart` returned from a
   * top-level `render()` call). It has no effect on non-root ChildParts.
   * @param isConnected Whether to set
   * @internal
   */
  setConnected(isConnected) {
    if (this._$parent === void 0) {
      this.__isConnected = isConnected;
      this._$notifyConnectionChanged?.(isConnected);
    } else {
      throw new Error("part.setConnected() may only be called on a RootPart returned from render().");
    }
  }
}
class AttributePart {
  get tagName() {
    return this.element.tagName;
  }
  // See comment in Disconnectable interface for why this is a getter
  get _$isConnected() {
    return this._$parent._$isConnected;
  }
  constructor(element, name, strings, parent, options) {
    this.type = ATTRIBUTE_PART;
    this._$committedValue = nothing;
    this._$disconnectableChildren = void 0;
    this.element = element;
    this.name = name;
    this._$parent = parent;
    this.options = options;
    if (strings.length > 2 || strings[0] !== "" || strings[1] !== "") {
      this._$committedValue = new Array(strings.length - 1).fill(new String());
      this.strings = strings;
    } else {
      this._$committedValue = nothing;
    }
    {
      this._sanitizer = void 0;
    }
  }
  /**
   * Sets the value of this part by resolving the value from possibly multiple
   * values and static strings and committing it to the DOM.
   * If this part is single-valued, `this._strings` will be undefined, and the
   * method will be called with a single value argument. If this part is
   * multi-value, `this._strings` will be defined, and the method is called
   * with the value array of the part's owning TemplateInstance, and an offset
   * into the value array from which the values should be read.
   * This method is overloaded this way to eliminate short-lived array slices
   * of the template instance values, and allow a fast-path for single-valued
   * parts.
   *
   * @param value The part value, or an array of values for multi-valued parts
   * @param valueIndex the index to start reading values from. `undefined` for
   *   single-valued parts
   * @param noCommit causes the part to not commit its value to the DOM. Used
   *   in hydration to prime attribute parts with their first-rendered value,
   *   but not set the attribute, and in SSR to no-op the DOM operation and
   *   capture the value for serialization.
   *
   * @internal
   */
  _$setValue(value, directiveParent = this, valueIndex, noCommit) {
    const strings = this.strings;
    let change = false;
    if (strings === void 0) {
      value = resolveDirective(this, value, directiveParent, 0);
      change = !isPrimitive(value) || value !== this._$committedValue && value !== noChange;
      if (change) {
        this._$committedValue = value;
      }
    } else {
      const values = value;
      value = strings[0];
      let i, v;
      for (i = 0; i < strings.length - 1; i++) {
        v = resolveDirective(this, values[valueIndex + i], directiveParent, i);
        if (v === noChange) {
          v = this._$committedValue[i];
        }
        change ||= !isPrimitive(v) || v !== this._$committedValue[i];
        if (v === nothing) {
          value = nothing;
        } else if (value !== nothing) {
          value += (v ?? "") + strings[i + 1];
        }
        this._$committedValue[i] = v;
      }
    }
    if (change && !noCommit) {
      this._commitValue(value);
    }
  }
  /** @internal */
  _commitValue(value) {
    if (value === nothing) {
      wrap(this.element).removeAttribute(this.name);
    } else {
      {
        if (this._sanitizer === void 0) {
          this._sanitizer = sanitizerFactoryInternal(this.element, this.name);
        }
        value = this._sanitizer(value ?? "");
      }
      debugLogEvent && debugLogEvent({
        kind: "commit attribute",
        element: this.element,
        name: this.name,
        value,
        options: this.options
      });
      wrap(this.element).setAttribute(this.name, value ?? "");
    }
  }
}
class PropertyPart extends AttributePart {
  constructor() {
    super(...arguments);
    this.type = PROPERTY_PART;
  }
  /** @internal */
  _commitValue(value) {
    {
      if (this._sanitizer === void 0) {
        this._sanitizer = sanitizerFactoryInternal(this.element, this.name);
      }
      value = this._sanitizer(value);
    }
    debugLogEvent && debugLogEvent({
      kind: "commit property",
      element: this.element,
      name: this.name,
      value,
      options: this.options
    });
    this.element[this.name] = value === nothing ? void 0 : value;
  }
}
class BooleanAttributePart extends AttributePart {
  constructor() {
    super(...arguments);
    this.type = BOOLEAN_ATTRIBUTE_PART;
  }
  /** @internal */
  _commitValue(value) {
    debugLogEvent && debugLogEvent({
      kind: "commit boolean attribute",
      element: this.element,
      name: this.name,
      value: !!(value && value !== nothing),
      options: this.options
    });
    wrap(this.element).toggleAttribute(this.name, !!value && value !== nothing);
  }
}
class EventPart extends AttributePart {
  constructor(element, name, strings, parent, options) {
    super(element, name, strings, parent, options);
    this.type = EVENT_PART;
    if (this.strings !== void 0) {
      throw new Error(`A \`<${element.localName}>\` has a \`@${name}=...\` listener with invalid content. Event listeners in templates must have exactly one expression and no surrounding text.`);
    }
  }
  // EventPart does not use the base _$setValue/_resolveValue implementation
  // since the dirty checking is more complex
  /** @internal */
  _$setValue(newListener, directiveParent = this) {
    newListener = resolveDirective(this, newListener, directiveParent, 0) ?? nothing;
    if (newListener === noChange) {
      return;
    }
    const oldListener = this._$committedValue;
    const shouldRemoveListener = newListener === nothing && oldListener !== nothing || newListener.capture !== oldListener.capture || newListener.once !== oldListener.once || newListener.passive !== oldListener.passive;
    const shouldAddListener = newListener !== nothing && (oldListener === nothing || shouldRemoveListener);
    debugLogEvent && debugLogEvent({
      kind: "commit event listener",
      element: this.element,
      name: this.name,
      value: newListener,
      options: this.options,
      removeListener: shouldRemoveListener,
      addListener: shouldAddListener,
      oldListener
    });
    if (shouldRemoveListener) {
      this.element.removeEventListener(this.name, this, oldListener);
    }
    if (shouldAddListener) {
      this.element.addEventListener(this.name, this, newListener);
    }
    this._$committedValue = newListener;
  }
  handleEvent(event) {
    if (typeof this._$committedValue === "function") {
      this._$committedValue.call(this.options?.host ?? this.element, event);
    } else {
      this._$committedValue.handleEvent(event);
    }
  }
}
class ElementPart {
  constructor(element, parent, options) {
    this.element = element;
    this.type = ELEMENT_PART;
    this._$disconnectableChildren = void 0;
    this._$parent = parent;
    this.options = options;
  }
  // See comment in Disconnectable interface for why this is a getter
  get _$isConnected() {
    return this._$parent._$isConnected;
  }
  _$setValue(value) {
    debugLogEvent && debugLogEvent({
      kind: "commit to element binding",
      element: this.element,
      value,
      options: this.options
    });
    resolveDirective(this, value);
  }
}
const polyfillSupport = global.litHtmlPolyfillSupportDevMode;
polyfillSupport?.(Template, ChildPart);
(global.litHtmlVersions ??= []).push("3.3.1");
if (global.litHtmlVersions.length > 1) {
  queueMicrotask(() => {
    issueWarning("multiple-versions", `Multiple versions of Lit loaded. Loading multiple versions is not recommended.`);
  });
}
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ifDefined = (value) => value ?? nothing;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const PartType = {
  CHILD: 2
};
const directive = (c) => (...values) => ({
  // This property needs to remain unminified.
  ["_$litDirective$"]: c,
  values
});
class Directive {
  constructor(_partInfo) {
  }
  // See comment in Disconnectable interface for why this is a getter
  get _$isConnected() {
    return this._$parent._$isConnected;
  }
  /** @internal */
  _$initialize(part, parent, attributeIndex) {
    this.__part = part;
    this._$parent = parent;
    this.__attributeIndex = attributeIndex;
  }
  /** @internal */
  _$resolve(part, props) {
    return this.update(part, props);
  }
  update(_part, props) {
    return this.render(...props);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const HTML_RESULT = 1;
class UnsafeHTMLDirective extends Directive {
  constructor(partInfo) {
    super(partInfo);
    this._value = nothing;
    if (partInfo.type !== PartType.CHILD) {
      throw new Error(`${this.constructor.directiveName}() can only be used in child bindings`);
    }
  }
  render(value) {
    if (value === nothing || value == null) {
      this._templateResult = void 0;
      return this._value = value;
    }
    if (value === noChange) {
      return value;
    }
    if (typeof value != "string") {
      throw new Error(`${this.constructor.directiveName}() called with a non-string value`);
    }
    if (value === this._value) {
      return this._templateResult;
    }
    this._value = value;
    const strings = [value];
    strings.raw = strings;
    return this._templateResult = {
      // Cast to a known set of integers that satisfy ResultType so that we
      // don't have to export ResultType and possibly encourage this pattern.
      // This property needs to remain unminified.
      ["_$litType$"]: this.constructor.resultType,
      strings,
      values: []
    };
  }
}
UnsafeHTMLDirective.directiveName = "unsafeHTML";
UnsafeHTMLDirective.resultType = HTML_RESULT;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const SVG_RESULT = 2;
class UnsafeSVGDirective extends UnsafeHTMLDirective {
}
UnsafeSVGDirective.directiveName = "unsafeSVG";
UnsafeSVGDirective.resultType = SVG_RESULT;
const unsafeSVG = directive(UnsafeSVGDirective);
const version = "3.0.0-dev.1";
const SCALE_DIMENSIONS = 2;
const SVG_DEFAULT_DIMENSIONS = 200 * SCALE_DIMENSIONS;
const SVG_DEFAULT_DIMENSIONS_HALF = SVG_DEFAULT_DIMENSIONS / 2;
const SVG_VIEW_BOX = SVG_DEFAULT_DIMENSIONS;
const FONT_SIZE = SVG_DEFAULT_DIMENSIONS / 100;
const clamp$1 = (min, num, max) => Math.min(Math.max(num, min), max);
const round$1 = (min, num, max) => Math.abs(num - min) > Math.abs(max - num) ? max : min;
const angle360 = (start, angle, end) => start < 0 || end < 0 ? angle + 360 : angle;
const range = (value1, value2) => Math.abs(value1 - value2);
class Colors {
  static {
    Colors.colorCache = {};
    Colors.element = void 0;
  }
  /** *****************************************************************************
  * Colors::static _prefixKeys()
  *
  * @argument argColors - the colors to prefix with '--'
  *
  * @description
  * Prefixes all keys with '--' to make them CSS Variables.
  *
  */
  static _prefixKeys(argColors) {
    let prefixedColors = {};
    Object.keys(argColors).forEach((key) => {
      const prefixedKey = `--${key}`;
      const value = String(argColors[key]);
      prefixedColors[prefixedKey] = `${value}`;
    });
    return prefixedColors;
  }
  /** *****************************************************************************
  * Colors::static processTheme()
  *
  * @argument argTheme - the theme configuration to load
  *
  * @description
  * Loads and processes the theme to be used with dark and light modes.
  *
  * Theme mode is selected based on theme's darkMode boolean.
  */
  static processTheme(argTheme) {
    let combinedLight = {};
    let combinedDark = {};
    let themeLight = {};
    let themeDark = {};
    const { modes, ...themeBase } = argTheme;
    if (modes) {
      combinedDark = { ...themeBase, ...modes.dark };
      combinedLight = { ...themeBase, ...modes.light };
    }
    themeLight = Colors._prefixKeys(combinedLight);
    themeDark = Colors._prefixKeys(combinedDark);
    return { themeLight, themeDark };
  }
  /** *****************************************************************************
  * Colors::static processPalette()
  *
  * @argument argPalette - the palette configuration to load
  *
  * @description
  * Loads the swatches defined for the palette and combines them into a single
  * palette with light (default) and dark modes.
  *
  * Palette mode is selected based on theme's darkMode boolean.
  */
  static processPalette(argPalette) {
    let combinedBase = {};
    let combinedLight = {};
    let combinedDark = {};
    let paletteLight = {};
    let paletteDark = {};
    Object.values(argPalette).forEach((swatch) => {
      const { modes, ...swatchBase } = swatch;
      combinedBase = { ...combinedBase, ...swatchBase };
      if (modes) {
        combinedDark = { ...combinedDark, ...swatchBase, ...modes.dark };
        combinedLight = { ...combinedLight, ...swatchBase, ...modes.light };
      }
    });
    paletteLight = Colors._prefixKeys(combinedLight);
    paletteDark = Colors._prefixKeys(combinedDark);
    return { paletteLight, paletteDark };
  }
  /** *****************************************************************************
  * Colors::setElement()
  *
  * Summary.
  * Sets the HTML element (the custom card) to work with getting colors
  *
  */
  static setElement(argElement) {
    Colors.element = argElement;
  }
  /** *****************************************************************************
  * card::_calculateColor()
  *
  * Summary.
  *
  * #TODO:
  * replace by TinyColor library? Is that possible/feasible??
  *
  */
  static calculateColor(argState, argStops, argIsGradient) {
    const sortedStops = Object.keys(argStops).map((n) => Number(n)).sort((a, b) => a - b);
    let start;
    let end;
    let val;
    const l = sortedStops.length;
    if (argState <= sortedStops[0]) {
      return argStops[sortedStops[0]];
    } else if (argState >= sortedStops[l - 1]) {
      return argStops[sortedStops[l - 1]];
    } else {
      for (let i = 0; i < l - 1; i++) {
        const s1 = sortedStops[i];
        const s2 = sortedStops[i + 1];
        if (argState >= s1 && argState < s2) {
          [start, end] = [argStops[s1], argStops[s2]];
          if (!argIsGradient) {
            return start;
          }
          val = Colors.calculateValueBetween(s1, s2, argState);
          break;
        }
      }
    }
    return Colors.getGradientValue(start, end, val);
  }
  /** *****************************************************************************
  * card::_calculateColor2()
  *
  * Summary.
  *
  * #TODO:
  * replace by TinyColor library? Is that possible/feasible??
  *
  */
  static calculateColor2(argState, argStops, argPart, argProperty, argIsGradient) {
    const sortedStops = Object.keys(argStops).map((n) => Number(n)).sort((a, b) => a - b);
    let start;
    let end;
    let val;
    const l = sortedStops.length;
    if (argState <= sortedStops[0]) {
      return argStops[sortedStops[0]];
    } else if (argState >= sortedStops[l - 1]) {
      return argStops[sortedStops[l - 1]];
    } else {
      for (let i = 0; i < l - 1; i++) {
        const s1 = sortedStops[i];
        const s2 = sortedStops[i + 1];
        if (argState >= s1 && argState < s2) {
          [start, end] = [argStops[s1].styles[argPart][argProperty], argStops[s2].styles[argPart][argProperty]];
          if (!argIsGradient) {
            return start;
          }
          val = Colors.calculateValueBetween(s1, s2, argState);
          break;
        }
      }
    }
    return Colors.getGradientValue(start, end, val);
  }
  /** *****************************************************************************
  * card::_calculateValueBetween()
  *
  * Summary.
  * Clips the argValue value between argStart and argEnd, and returns the between value ;-)
  *
  * Returns NaN if argValue is undefined
  *
  * NOTE: Rename to valueToPercentage ??
  */
  static calculateValueBetween(argStart, argEnd, argValue) {
    return (Math.min(Math.max(argValue, argStart), argEnd) - argStart) / (argEnd - argStart);
  }
  /** *****************************************************************************
  * card::_getColorVariable()
  *
  * Summary.
  * Get value of CSS color variable, specified as var(--color-value)
  * These variables are defined in the Lovelace element so it appears...
  *
  */
  static getColorVariable(argColor) {
    const newColor = argColor.substr(4, argColor.length - 5);
    const returnColor = window.getComputedStyle(Colors.element).getPropertyValue(newColor);
    return returnColor;
  }
  /** *****************************************************************************
  * card::_getGradientValue()
  *
  * Summary.
  * Get gradient value of color as a result of a color_stop.
  * An RGBA value is calculated, so transparency is possible...
  *
  * The colors (colorA and colorB) can be specified as:
  * - a css variable, var(--color-value)
  * - a hex value, #fff or #ffffff
  * - an rgb() or rgba() value
  * - a hsl() or hsla() value
  * - a named css color value, such as white.
  *
  */
  static getGradientValue(argColorA, argColorB, argValue) {
    const resultColorA = Colors.colorToRGBA(argColorA);
    const resultColorB = Colors.colorToRGBA(argColorB);
    const v1 = 1 - argValue;
    const v2 = argValue;
    const rDec = Math.floor(resultColorA[0] * v1 + resultColorB[0] * v2);
    const gDec = Math.floor(resultColorA[1] * v1 + resultColorB[1] * v2);
    const bDec = Math.floor(resultColorA[2] * v1 + resultColorB[2] * v2);
    const aDec = Math.floor(resultColorA[3] * v1 + resultColorB[3] * v2);
    const rHex = Colors.padZero(rDec.toString(16));
    const gHex = Colors.padZero(gDec.toString(16));
    const bHex = Colors.padZero(bDec.toString(16));
    const aHex = Colors.padZero(aDec.toString(16));
    return `#${rHex}${gHex}${bHex}${aHex}`;
  }
  static padZero(argValue) {
    if (argValue.length < 2) {
      argValue = `0${argValue}`;
    }
    return argValue.substr(0, 2);
  }
  /** *****************************************************************************
  * card::_colorToRGBA()
  *
  * Summary.
  * Get RGBA color value of argColor.
  *
  * The argColor can be specified as:
  * - a css variable, var(--color-value)
  * - a hex value, #fff or #ffffff
  * - an rgb() or rgba() value
  * - a hsl() or hsla() value
  * - a named css color value, such as white.
  *
  */
  static colorToRGBA(argColor) {
    const retColor = Colors.colorCache[argColor];
    if (retColor) return retColor;
    let theColor = argColor;
    const a0 = argColor.substr(0, 3);
    if (a0.valueOf() === "var") {
      theColor = Colors.getColorVariable(argColor);
    }
    const canvas = window.document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = theColor;
    ctx.fillRect(0, 0, 1, 1);
    const outColor = [...ctx.getImageData(0, 0, 1, 1).data];
    Colors.colorCache[argColor] = outColor;
    return outColor;
  }
  static hslToRgb(hsl) {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;
    let r;
    let g;
    let b;
    if (s === 0) {
      r = g = b = l;
    } else {
      let hue2rgb = function(p2, q2, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p2 + (q2 - p2) * 6 * t;
        if (t < 1 / 2) return q2;
        if (t < 2 / 3) return p2 + (q2 - p2) * (2 / 3 - t) * 6;
        return p2;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    r *= 255;
    g *= 255;
    b *= 255;
    return { r, g, b };
  }
}
class Merge {
  static mergeDeep(...objects) {
    const isObject = (obj) => obj && typeof obj === "object";
    return objects.reduce((prev, obj) => {
      Object.keys(obj).forEach((key) => {
        const pVal = prev[key];
        const oVal = obj[key];
        if (Array.isArray(pVal) && Array.isArray(oVal)) {
          prev[key] = pVal.concat(...oVal);
        } else if (isObject(pVal) && isObject(oVal)) {
          prev[key] = this.mergeDeep(pVal, oVal);
        } else {
          prev[key] = oVal;
        }
      });
      return prev;
    }, {});
  }
}
class Templates {
  /** ****************************************************************************
  * Templates::replaceVariables()
  *
  * Summary.
  * A toolset defines a template. This template is found and passed as argToolsetTemplate.
  * This is actually a set of tools, nothing else...
  * Also passed is the list of variables that should be replaced:
  * - The list defined in the toolset
  * - The defaults defined in the template itself, which are defined in the argToolsetTemplate
  *
  */
  static replaceVariables3(argVariables, argTemplate) {
    if (!argVariables && !argTemplate.template.defaults) {
      return argTemplate[argTemplate.template.type];
    }
    let variableArray = argVariables?.slice(0) ?? [];
    if (argTemplate.template.defaults) {
      variableArray = variableArray.concat(argTemplate.template.defaults);
    }
    let jsonConfig = JSON.stringify(argTemplate[argTemplate.template.type]);
    variableArray.forEach((variable) => {
      const key = Object.keys(variable)[0];
      const value = Object.values(variable)[0];
      if (typeof value === "number" || typeof value === "boolean") {
        const rxp2 = new RegExp(`"\\[\\[${key}\\]\\]"`, "gm");
        jsonConfig = jsonConfig.replace(rxp2, value);
      }
      if (typeof value === "object") {
        const rxp2 = new RegExp(`"\\[\\[${key}\\]\\]"`, "gm");
        const valueString = JSON.stringify(value);
        jsonConfig = jsonConfig.replace(rxp2, valueString);
      } else {
        const rxp = new RegExp(`\\[\\[${key}\\]\\]`, "gm");
        jsonConfig = jsonConfig.replace(rxp, value);
      }
    });
    return JSON.parse(jsonConfig);
  }
  static getJsTemplateOrValueConfig(argTool, argEntities, argValue) {
    if (!argValue) return argValue;
    if (["number", "boolean", "bigint", "symbol"].includes(typeof argValue)) return argValue;
    if (typeof argValue === "object") {
      Object.keys(argValue).forEach((key) => {
        argValue[key] = Templates.getJsTemplateOrValueConfig(argTool, argEntities, argValue[key]);
      });
      return argValue;
    }
    const trimmedValue = argValue.trim();
    if (trimmedValue.substring(0, 4) === "[[[[" && trimmedValue.slice(-4) === "]]]]") {
      return Templates.evaluateJsTemplateConfig(argTool, argEntities, trimmedValue.slice(4, -4));
    } else {
      return argValue;
    }
  }
  static evaluateJsTemplateConfig(argTool, argEntities, jsTemplate) {
    try {
      return new Function("tool_config", "entities_config", `'use strict'; ${jsTemplate}`).call(
        this,
        argTool,
        argEntities
      );
    } catch (e) {
      e.name = "Sak-evaluateJsTemplateConfig-Error";
      throw e;
    }
  }
  /** *****************************************************************************
  * Templates::evaluateJsTemplate()
  *
  * Summary.
  * Runs the JavaScript template.
  *
  * The arguments passed to the function are:
  * - state, state of the current entity
  * - states, the full array of states provided by hass
  * - entity, the current entity and its configuration
  * - user, the currently logged in user
  * - hass, the hass object...
  * - tool_config, the YAML configuration of the current tool
  * - entity_config, the YAML configuration of configured entity in this tool
  *
  */
  static evaluateJsTemplate(argTool, state, jsTemplate) {
    try {
      return new Function("state", "states", "entity", "user", "hass", "tool_config", "entity_config", `'use strict'; ${jsTemplate}`).call(
        // return new Function('state', 'states', 'entity', 'user', 'hass',
        //                    'tool_config', 'entity_config', 'states_str', 'attributes_str', `'use strict'; ${jsTemplate}`).call(
        this,
        state,
        argTool._card._hass.states,
        argTool.config.hasOwnProperty("entity_index") ? argTool._card.entities[argTool.config.entity_index] : void 0,
        argTool._card._hass.user,
        argTool._card._hass,
        argTool.config,
        argTool.config.hasOwnProperty("entity_index") ? argTool._card.config.entities[argTool.config.entity_index] : void 0
        // argTool._card.entitiesStr,
        // argTool._card.attributesStr,
      );
    } catch (e) {
      e.name = "Sak-evaluateJsTemplate-Error";
      throw e;
    }
  }
  /** *****************************************************************************
  * Templates::getJsTemplateOrValue()
  *
  * Summary.
  *
  * References:
  * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
  * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
  *
  */
  static getJsTemplateOrValue(argTool, argState, argValue) {
    if (!argValue) return argValue;
    if (["number", "boolean", "bigint", "symbol"].includes(typeof argValue)) return argValue;
    if (typeof argValue === "object") {
      Object.keys(argValue).forEach((key) => {
        argValue[key] = Templates.getJsTemplateOrValue(argTool, argState, argValue[key]);
      });
      return argValue;
    }
    const trimmedValue = argValue.trim();
    if (trimmedValue.substring(0, 3) === "[[[" && trimmedValue.slice(-3) === "]]]") {
      return Templates.evaluateJsTemplate(argTool, argState, trimmedValue.slice(3, -3));
    } else {
      return argValue;
    }
  }
}
class Utils {
  /**
  * Utils::calculateValueBetween()
  *
  * Summary.
  * Clips the val value between start and end, and returns the between value ;-)
  * Returned value is a fractional value between 0 and 1.
  *
  * Note 1:
  * At start, state values are set to 'null' to make sure it has no value!
  * If such a value is detected, return 0(%) as the relative value.
  * In normal cases, this happens to be the _valuePrev, so 0% is ok!!!!
  *
  * Note 2:
  * !xyz checks for "", null, undefined, false and number 0
  * An extra check for NaN guards the result of this function ;-)
  */
  static calculateValueBetween(argStart, argEnd, argVal) {
    if (isNaN(argVal)) return 0;
    if (!argVal) return 0;
    return (Math.min(Math.max(argVal, argStart), argEnd) - argStart) / (argEnd - argStart);
  }
  /**
  * Utils::calculateSvgCoordinate()
  *
  * Summary.
  * Calculate own (tool/tool) coordinates relative to centered toolset position.
  * Tool coordinates are %
  *
  * Group is 50,40. Say SVG is 200x200. Group is 100,80 within 200x200.
  * Tool is 10,50. 0.1 * 200 = 20 + (100 - 200/2) = 20 + 0.
  */
  static calculateSvgCoordinate(argOwn, argToolset) {
    return argOwn / 100 * SVG_DEFAULT_DIMENSIONS + (argToolset - SVG_DEFAULT_DIMENSIONS_HALF);
  }
  /**
  * Utils::calculateSvgDimension()
  *
  * Summary.
  * Translate tool dimension like length or width to actual SVG dimension.
  */
  static calculateSvgDimension(argDimension) {
    return argDimension / 100 * SVG_DEFAULT_DIMENSIONS;
  }
  static getLovelace() {
    let root = window.document.querySelector("home-assistant");
    root = root && root.shadowRoot;
    root = root && root.querySelector("home-assistant-main");
    root = root && root.shadowRoot;
    root = root && root.querySelector("app-drawer-layout partial-panel-resolver, ha-drawer partial-panel-resolver");
    root = root && root.shadowRoot || root;
    root = root && root.querySelector("ha-panel-lovelace");
    root = root && root.shadowRoot;
    root = root && root.querySelector("hui-root");
    if (root) {
      const ll = root.lovelace;
      ll.current_view = root.___curView;
      return ll;
    }
    return null;
  }
}
const fireEvent = (node, type, detail, options) => {
  options = options || {};
  detail = detail === null || detail === void 0 ? {} : detail;
  const event = new Event(type, {
    bubbles: options.bubbles === void 0 ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === void 0 ? true : options.composed
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};
class BaseTool {
  constructor(argToolset, argConfig, argPos) {
    this.toolId = Math.random().toString(36).substr(2, 9);
    this.toolset = argToolset;
    this._card = this.toolset._card;
    this.config = argConfig;
    this.dev = { ...this._card.dev };
    this.toolsetPos = argPos;
    this.svg = {};
    this.svg.cx = Utils.calculateSvgCoordinate(argConfig.position.cx, 0);
    this.svg.cy = Utils.calculateSvgCoordinate(argConfig.position.cy, 0);
    this.svg.height = argConfig.position.height ? Utils.calculateSvgDimension(argConfig.position.height) : 0;
    this.svg.width = argConfig.position.width ? Utils.calculateSvgDimension(argConfig.position.width) : 0;
    this.svg.x = this.svg.cx - this.svg.width / 2;
    this.svg.y = this.svg.cy - this.svg.height / 2;
    this.classes = {};
    this.classes.card = {};
    this.classes.toolset = {};
    this.classes.tool = {};
    this.styles = {};
    this.styles.card = {};
    this.styles.toolset = {};
    this.styles.tool = {};
    this.animationClass = {};
    this.animationClassHasChanged = true;
    this.animationStyle = {};
    this.animationStyleHasChanged = true;
    if (!this.config?.show?.style) {
      if (!this.config.show) this.config.show = {};
      this.config.show.style = "default";
    }
    this.colorStops = {};
    if (this.config.colorstops && this.config.colorstops.colors) {
      Object.keys(this.config.colorstops.colors).forEach((key) => {
        this.colorStops[key] = this.config.colorstops.colors[key];
      });
    }
    if (this.config.show.style === "colorstop" && this.config?.colorstops.colors) {
      this.sortedColorStops = Object.keys(this.config.colorstops.colors).map((n) => Number(n)).sort((a, b) => a - b);
    }
    this.csnew = {};
    if (this.config.csnew && this.config.csnew.colors) {
      this.config.csnew.colors.forEach((item, i) => {
        this.csnew[item.stop] = this.config.csnew.colors[i];
      });
      this.sortedcsnew = Object.keys(this.csnew).map((n) => Number(n)).sort((a, b) => a - b);
    }
  }
  /** *****************************************************************************
  * BaseTool::textEllipsis()
  *
  * Summary.
  * Very simple form of ellipsis, which is not supported by SVG.
  * Cutoff text at number of characters and add '...'.
  * This does NOT take into account the actual width of a character!
  *
  */
  textEllipsis(argText, argEllipsis) {
    if (argEllipsis && argEllipsis < argText.length) {
      return argText.slice(0, argEllipsis - 1).concat("...");
    } else {
      return argText;
    }
  }
  defaultEntityIndex() {
    if (!this.default) {
      this.default = {};
      if (this.config.hasOwnProperty("entity_indexes")) {
        this.default.entity_index = this.config.entity_indexes[0].entity_index;
      } else {
        this.default.entity_index = this.config.entity_index;
      }
    }
    return this.default.entity_index;
  }
  /** *****************************************************************************
  * BaseTool::set value()
  *
  * Summary.
  * Receive new state data for the entity this is linked to. Called from set hass;
  *
  */
  set value(state) {
    let localState = state;
    if (this.dev.debug) console.log("BaseTool set value(state)", localState);
    try {
      if (localState !== "undefined" && typeof localState !== "undefined") {
        if (this._stateValue?.toString().toLowerCase() === localState.toString().toLowerCase()) return;
      }
    } catch (e) {
      console.log("catching something", e, state, this.config);
    }
    this.derivedEntity = null;
    if (this.config.derived_entity) {
      this.derivedEntity = Templates.getJsTemplateOrValue(this, state, Merge.mergeDeep(this.config.derived_entity));
      localState = this.derivedEntity.state?.toString();
    }
    this._stateValuePrev = this._stateValue || localState;
    this._stateValue = localState;
    this._stateValueIsDirty = true;
    let isMatch = false;
    this.activeAnimation = null;
    if (this.config.animations) Object.keys(this.config.animations).map((animation) => {
      const tempConfig = JSON.parse(JSON.stringify(this.config.animations[animation]));
      const item = Templates.getJsTemplateOrValue(this, this._stateValue, Merge.mergeDeep(tempConfig));
      if (isMatch) return true;
      const operator = item.operator ? item.operator : "==";
      switch (operator) {
        case "==":
          if (typeof this._stateValue === "undefined") {
            isMatch = typeof item.state === "undefined" || item.state.toLowerCase() === "undefined";
          } else {
            isMatch = this._stateValue.toLowerCase() === item.state.toLowerCase();
          }
          break;
        case "!=":
          if (typeof this._stateValue === "undefined") {
            isMatch = item.state.toLowerCase() !== "undefined";
          } else {
            isMatch = this._stateValue.toLowerCase() !== item.state.toLowerCase();
          }
          break;
        case ">":
          if (typeof this._stateValue !== "undefined")
            isMatch = Number(this._stateValue.toLowerCase()) > Number(item.state.toLowerCase());
          break;
        case "<":
          if (typeof this._stateValue !== "undefined")
            isMatch = Number(this._stateValue.toLowerCase()) < Number(item.state.toLowerCase());
          break;
        case ">=":
          if (typeof this._stateValue !== "undefined")
            isMatch = Number(this._stateValue.toLowerCase()) >= Number(item.state.toLowerCase());
          break;
        case "<=":
          if (typeof this._stateValue !== "undefined") {
            isMatch = Number(this._stateValue.toLowerCase()) <= Number(item.state.toLowerCase());
          }
          break;
        default:
          isMatch = false;
      }
      if (this.dev.debug) console.log("BaseTool, animation, match, value, config, operator", isMatch, this._stateValue, item.state, item.operator);
      if (!isMatch) return true;
      if (!this.animationClass || !item.reuse) {
        this.animationClass = {};
      }
      if (item.classes) {
        this.animationClass = Merge.mergeDeep(this.animationClass, item.classes);
      }
      if (!this.animationStyle || !item.reuse) this.animationStyle = {};
      if (item.styles) {
        this.animationStyle = Merge.mergeDeep(this.animationStyle, item.styles);
      }
      this.animationStyleHasChanged = true;
      this.item = item;
      this.activeAnimation = item;
      return isMatch;
    });
  }
  /** *****************************************************************************
  * BaseTool::set values()
  *
  * Summary.
  * Receive new state data for the entity this is linked to. Called from set hass;
  *
  */
  getEntityIndexFromAnimation(animation) {
    if (animation.hasOwnProperty("entity_index")) return animation.entity_index;
    if (this.config.hasOwnProperty("entity_index")) return this.config.entity_index;
    if (this.config.entity_indexes) return this.config.entity_indexes[0].entity_index;
  }
  getIndexInEntityIndexes(entityIdx) {
    return this.config.entity_indexes.findIndex((element) => element.entity_index === entityIdx);
  }
  stateIsMatch(animation, state) {
    let isMatch;
    const tempConfig = JSON.parse(JSON.stringify(animation));
    const item = Templates.getJsTemplateOrValue(this, state, Merge.mergeDeep(tempConfig));
    const operator = item.operator ? item.operator : "==";
    switch (operator) {
      case "==":
        if (typeof state === "undefined") {
          isMatch = typeof item.state === "undefined" || item.state?.toLowerCase() === "undefined";
        } else {
          isMatch = state.toLowerCase() === item.state.toLowerCase();
        }
        break;
      case "!=":
        if (typeof state === "undefined") {
          isMatch = typeof item.state !== "undefined" || item.state?.toLowerCase() !== "undefined";
        } else {
          isMatch = state.toLowerCase() !== item.state.toLowerCase();
        }
        break;
      case ">":
        if (typeof state !== "undefined")
          isMatch = Number(state.toLowerCase()) > Number(item.state.toLowerCase());
        break;
      case "<":
        if (typeof state !== "undefined")
          isMatch = Number(state.toLowerCase()) < Number(item.state.toLowerCase());
        break;
      case ">=":
        if (typeof state !== "undefined")
          isMatch = Number(state.toLowerCase()) >= Number(item.state.toLowerCase());
        break;
      case "<=":
        if (typeof state !== "undefined")
          isMatch = Number(state.toLowerCase()) <= Number(item.state.toLowerCase());
        break;
      default:
        isMatch = false;
    }
    return isMatch;
  }
  mergeAnimationData(animation) {
    if (!this.animationClass || !animation.reuse) this.animationClass = {};
    if (animation.classes) {
      this.animationClass = Merge.mergeDeep(this.animationClass, animation.classes);
    }
    if (!this.animationStyle || !animation.reuse) this.animationStyle = {};
    if (animation.styles) {
      this.animationStyle = Merge.mergeDeep(this.animationStyle, animation.styles);
    }
    this.animationStyleHasChanged = true;
    if (!this.item) this.item = {};
    this.item = Merge.mergeDeep(this.item, animation);
    this.activeAnimation = { ...animation };
  }
  set values(states) {
    if (!this._lastStateValues) this._lastStateValues = [];
    if (!this._stateValues) this._stateValues = [];
    const localStates = [...states];
    if (this.dev.debug) console.log("BaseTool set values(state)", localStates);
    for (let index = 0; index < states.length; ++index) {
      if (typeof localStates[index] !== "undefined") if (this._stateValues[index]?.toLowerCase() === localStates[index].toLowerCase()) ;
      else {
        if (this.config.derived_entities) {
          this.derivedEntities[index] = Templates.getJsTemplateOrValue(this, states[index], Merge.mergeDeep(this.config.derived_entities[index]));
          localStates[index] = this.derivedEntities[index].state?.toString();
        }
      }
      this._lastStateValues[index] = this._stateValues[index] || localStates[index];
      this._stateValues[index] = localStates[index];
      this._stateValueIsDirty = true;
      let isMatch = false;
      this.activeAnimation = null;
      if (this.config.animations) Object.keys(this.config.animations.map((aniKey, aniValue) => {
        const statesIndex = this.getIndexInEntityIndexes(this.getEntityIndexFromAnimation(aniKey));
        const tempConfig = JSON.parse(JSON.stringify(aniKey));
        let item = Templates.getJsTemplateOrValue(this, states[index], Merge.mergeDeep(tempConfig));
        isMatch = this.stateIsMatch(item, states[statesIndex]);
        if (aniKey.debug) console.log("set values, item, aniKey", item, states, isMatch, this.config.animations);
        if (isMatch) {
          this.mergeAnimationData(item);
          return true;
        } else {
          return false;
        }
      }));
    }
    this._stateValue = this._stateValues[this.getIndexInEntityIndexes(this.defaultEntityIndex())];
    this._stateValuePrev = this._lastStateValues[this.getIndexInEntityIndexes(this.defaultEntityIndex())];
  }
  EnableHoverForInteraction() {
    const hover = this.config.hasOwnProperty("entity_index") || this.config?.user_actions?.tap_action;
    this.classes.tool.hover = !!hover;
  }
  /** *****************************************************************************
  * BaseTool::MergeAnimationStyleIfChanged()
  *
  * Summary.
  * Merge changed animationStyle with configured static styles.
  *
  */
  MergeAnimationStyleIfChanged(argDefaultStyles) {
    if (this.animationStyleHasChanged) {
      this.animationStyleHasChanged = false;
      let styles = this.config?.styles || this.config[this.config.type]?.styles;
      if (argDefaultStyles) {
        this.styles = Merge.mergeDeep(argDefaultStyles, styles, this.animationStyle);
      } else {
        this.styles = Merge.mergeDeep(styles, this.animationStyle);
      }
      if (this.styles.card) {
        if (Object.keys(this.styles.card).length !== 0) {
          this._card.styles.card = Merge.mergeDeep(this.styles.card);
        }
      }
    }
  }
  /** *****************************************************************************
  * BaseTool::MergeAnimationClassIfChanged()
  *
  * Summary.
  * Merge changed animationclass with configured static styles.
  *
  */
  MergeAnimationClassIfChanged(argDefaultClasses) {
    this.animationClassHasChanged = true;
    if (this.animationClassHasChanged) {
      this.animationClassHasChanged = false;
      let classes = this.config?.classes || this.config[this.config.type]?.classes;
      if (argDefaultClasses) {
        this.classes = Merge.mergeDeep(argDefaultClasses, classes, this.animationClass);
      } else {
        this.classes = Merge.mergeDeep(classes, this.animationClass);
      }
    }
  }
  /** *****************************************************************************
  * BaseTool::MergeColorFromState()
  *
  * Summary.
  * Merge color depending on state into colorStyle
  *
  */
  MergeColorFromState(argStyleMap) {
    if (this.config.hasOwnProperty("entity_index")) {
      const color = this.getColorFromState(this._stateValue);
      if (color !== "") {
        if (this.config?.show?.style && argStyleMap) {
          argStyleMap.fill = this.config[this.config.show.style].fill ? color : "";
          argStyleMap.stroke = this.config[this.config.show.style].stroke ? color : "";
        }
      }
    }
  }
  /** *****************************************************************************
  * BaseTool::MergeColorFromState2()
  *
  * Summary.
  * Merge color depending on state into colorStyle
  *
  */
  MergeColorFromState2(argStyleMap, argPart) {
    if (this.config.hasOwnProperty("entity_index")) {
      const fillColor = this.config[this.config.show.style].fill ? this.getColorFromState2(this._stateValue, argPart, "fill") : "";
      const strokeColor = this.config[this.config.show.style].stroke ? this.getColorFromState2(this._stateValue, argPart, "stroke") : "";
      if (fillColor !== "") {
        argStyleMap.fill = fillColor;
      }
      if (strokeColor !== "") {
        argStyleMap.stroke = strokeColor;
      }
    }
  }
  /** *****************************************************************************
  * BaseTool::getColorFromState()
  *
  * Summary.
  * Get color from colorstop or gradient depending on state.
  *
  */
  getColorFromState(argValue) {
    let color = "";
    switch (this.config.show.style) {
      case "default":
        break;
      case "fixedcolor":
        color = this.config.color;
        break;
      case "colorstop":
      case "colorstops":
      case "colorstopgradient":
        color = Colors.calculateColor(argValue, this.colorStops, this.config.show.style === "colorstopgradient");
        break;
      case "minmaxgradient":
        color = Colors.calculateColor(argValue, this.colorStopsMinMax, true);
        break;
    }
    return color;
  }
  /** *****************************************************************************
  * BaseTool::getColorFromState2()
  *
  * Summary.
  * Get color from colorstop or gradient depending on state.
  *
  */
  getColorFromState2(argValue, argPart, argProperty) {
    let color = "";
    switch (this.config.show.style) {
      case "colorstop":
      case "colorstops":
      case "colorstopgradient":
        color = Colors.calculateColor2(argValue, this.csnew, argPart, argProperty, this.config.show.style === "colorstopgradient");
        break;
      case "minmaxgradient":
        color = Colors.calculateColor2(argValue, this.colorStopsMinMax, argPart, argProperty, true);
        break;
    }
    return color;
  }
  /** *****************************************************************************
  * BaseTool::_processTapEvent()
  *
  * Summary.
  * Processes the mouse click of the user and dispatches the event to the
  * configure handler.
  *
  */
  _processTapEvent(node, hass, config, actionConfig, entityId, parameterValue) {
    let e;
    if (!actionConfig) return;
    fireEvent(node, "haptic", actionConfig.haptic || "medium");
    if (this.dev.debug) console.log("_processTapEvent", config, actionConfig, entityId, parameterValue);
    for (let i = 0; i < actionConfig.actions.length; i++) {
      switch (actionConfig.actions[i].action) {
        case "more-info": {
          if (typeof entityId !== "undefined") {
            e = new Event("hass-more-info", { composed: true });
            e.detail = { entityId };
            node.dispatchEvent(e);
          }
          break;
        }
        case "navigate": {
          if (!actionConfig.actions[i].navigation_path) return;
          window.history.pushState(null, "", actionConfig.actions[i].navigation_path);
          e = new Event("location-changed", { composed: true });
          e.detail = { replace: false };
          window.dispatchEvent(e);
          break;
        }
        case "call-service": {
          if (!actionConfig.actions[i].service) return;
          const [domain, service] = actionConfig.actions[i].service.split(".", 2);
          const serviceData = { ...actionConfig.actions[i].service_data };
          if (!serviceData.entity_id) {
            serviceData.entity_id = entityId;
          }
          if (actionConfig.actions[i].parameter) {
            serviceData[actionConfig.actions[i].parameter] = parameterValue;
          }
          hass.callService(domain, service, serviceData);
          break;
        }
        case "fire-dom-event": {
          const domData = { ...actionConfig.actions[i] };
          e = new Event("ll-custom", { composed: true, bubbles: true });
          e.detail = domData;
          node.dispatchEvent(e);
          break;
        }
        default: {
          console.error("Unknown Event definition", actionConfig);
        }
      }
    }
  }
  /** *****************************************************************************
  * BaseTool::handleTapEvent()
  *
  * Summary.
  * Handles the first part of mouse click processing.
  * It stops propagation to the parent and processes the event.
  *
  * The action can be configured per tool.
  *
  */
  handleTapEvent(argEvent, argToolConfig) {
    argEvent.stopPropagation();
    argEvent.preventDefault();
    let tapConfig;
    let entityIdx = this.defaultEntityIndex();
    if (entityIdx !== void 0 && !argToolConfig.user_actions) {
      tapConfig = {
        haptic: "light",
        actions: [{
          action: "more-info"
        }]
      };
    } else {
      tapConfig = argToolConfig.user_actions?.tap_action;
    }
    if (!tapConfig) return;
    this._processTapEvent(
      this._card,
      this._card._hass,
      this.config,
      tapConfig,
      this._card.config.hasOwnProperty("entities") ? this._card.config.entities[entityIdx]?.entity : void 0,
      void 0
    );
  }
}
function classMap$i(classes) {
  if (!classes) return "";
  return Object.entries(classes).filter(([_, value]) => value).map(([key, _]) => key).join(" ");
}
function styleMap$k(styles) {
  if (!styles) return "";
  return Object.entries(styles).filter(([_, value]) => value != null && value !== "").map(([key, value]) => `${key}: ${value}`).join("; ");
}
class BadgeTool extends BaseTool {
  constructor(argToolset, argConfig, argPos) {
    const DEFAULT_BADGE_CONFIG = {
      position: {
        cx: 50,
        cy: 50,
        width: 100,
        height: 25,
        radius: 5,
        ratio: 30,
        divider: 30
      },
      classes: {
        tool: {
          "sak-badge": true,
          hover: true
        },
        left: {
          "sak-badge__left": true
        },
        right: {
          "sak-badge__right": true
        }
      },
      styles: {
        tool: {},
        left: {},
        right: {}
      }
    };
    super(argToolset, Merge.mergeDeep(DEFAULT_BADGE_CONFIG, argConfig), argPos);
    this.svg.radius = Utils.calculateSvgDimension(argConfig.position.radius);
    this.svg.leftXpos = this.svg.x;
    this.svg.leftYpos = this.svg.y;
    this.svg.leftWidth = this.config.position.ratio / 100 * this.svg.width;
    this.svg.arrowSize = this.svg.height * this.config.position.divider / 100 / 2;
    this.svg.divSize = this.svg.height * (100 - this.config.position.divider) / 100 / 2;
    this.svg.rightXpos = this.svg.x + this.svg.leftWidth;
    this.svg.rightYpos = this.svg.y;
    this.svg.rightWidth = (100 - this.config.position.ratio) / 100 * this.svg.width;
    this.classes.tool = {};
    this.classes.left = {};
    this.classes.right = {};
    this.styles.tool = {};
    this.styles.left = {};
    this.styles.right = {};
    if (this.dev.debug) console.log("BadgeTool constructor coords, dimensions", this.svg, this.config);
  }
  /** *****************************************************************************
  * BadgeTool::_renderBadge()
  *
  * Summary.
  * Renders the badge using precalculated coordinates and dimensions.
  * Only the runtime style is calculated before rendering the badge
  *
  * Refs for creating the path online:
  * - https://mavo.io/demos/svgpath/
  *
  */
  _renderBadge() {
    let svgItems = [];
    this.MergeAnimationClassIfChanged();
    this.MergeAnimationStyleIfChanged();
    svgItems = svg`
      <g  id="badge-${this.toolId}">
        <path class="${classMap$i(this.classes.right)}" d="
            M ${this.svg.rightXpos} ${this.svg.rightYpos}
            h ${this.svg.rightWidth - this.svg.radius}
            a ${this.svg.radius} ${this.svg.radius} 0 0 1 ${this.svg.radius} ${this.svg.radius}
            v ${this.svg.height - 2 * this.svg.radius}
            a ${this.svg.radius} ${this.svg.radius} 0 0 1 -${this.svg.radius} ${this.svg.radius}
            h -${this.svg.rightWidth - this.svg.radius}
            v -${this.svg.height - 2 * this.svg.radius}
            z
            "
            style="${styleMap$k(this.styles.right)}"/>

        <path class="${classMap$i(this.classes.left)}" d="
            M ${this.svg.leftXpos + this.svg.radius} ${this.svg.leftYpos}
            h ${this.svg.leftWidth - this.svg.radius}
            v ${this.svg.divSize}
            l ${this.svg.arrowSize} ${this.svg.arrowSize}
            l -${this.svg.arrowSize} ${this.svg.arrowSize}
            l 0 ${this.svg.divSize}
            h -${this.svg.leftWidth - this.svg.radius}
            a -${this.svg.radius} -${this.svg.radius} 0 0 1 -${this.svg.radius} -${this.svg.radius}
            v -${this.svg.height - 2 * this.svg.radius}
            a ${this.svg.radius} ${this.svg.radius} 0 0 1 ${this.svg.radius} -${this.svg.radius}
            "
            style="${styleMap$k(this.styles.left)}"/>
      </g>
      `;
    return svg`${svgItems}`;
  }
  /** *****************************************************************************
  * BadgeTool::render()
  *
  * Summary.
  * The render() function for this object.
  *
  */
  render() {
    return svg`
      <g id="badge-${this.toolId}"
        class="${classMap$i(this.classes.tool)}" style="${styleMap$k(this.styles.tool)}"
        @click=${(e) => this.handleTapEvent(e, this.config)}>
        ${this._renderBadge()}
      </g>
    `;
  }
}
function classMap$h(classes) {
  if (!classes) return "";
  return Object.entries(classes).filter(([_, value]) => value).map(([key, _]) => key).join(" ");
}
function styleMap$j(styles) {
  if (!styles) return "";
  return Object.entries(styles).filter(([_, value]) => value != null && value !== "").map(([key, value]) => `${key}: ${value}`).join("; ");
}
class CircleTool extends BaseTool {
  constructor(argToolset, argConfig, argPos) {
    const DEFAULT_CIRCLE_CONFIG = {
      position: {
        cx: 50,
        cy: 50,
        radius: 50
      },
      classes: {
        tool: {
          "sak-circle": true,
          hover: true
        },
        circle: {
          "sak-circle__circle": true
        }
      },
      styles: {
        tool: {},
        circle: {}
      }
    };
    super(argToolset, Merge.mergeDeep(DEFAULT_CIRCLE_CONFIG, argConfig), argPos);
    this.EnableHoverForInteraction();
    this.svg.radius = Utils.calculateSvgDimension(argConfig.position.radius);
    this.classes.tool = {};
    this.classes.circle = {};
    this.styles.tool = {};
    this.styles.circle = {};
    if (this.dev.debug) console.log("CircleTool constructor config, svg", this.toolId, this.config, this.svg);
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
      <circle class="${classMap$h(this.classes.circle)}"
        cx="${this.svg.cx}"% cy="${this.svg.cy}"% r="${this.svg.radius}"
        style="${styleMap$j(this.styles.circle)}"
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
    this.styles.tool.overflow = "visible";
    this.styles["transform-origin"] = `${this.svg.cx} ${this.svg.cy}`;
    return svg`
      <g "" id="circle-${this.toolId}"
        class="${classMap$h(this.classes.tool)}" style="${styleMap$j(this.styles.tool)}"
        @click=${(e) => this.handleTapEvent(e, this.config)}>
        ${this._renderCircle()}
      </g>
    `;
  }
}
function classMap$g(classes) {
  if (!classes) return "";
  return Object.entries(classes).filter(([_, value]) => value).map(([key, _]) => key).join(" ");
}
function styleMap$i(styles) {
  if (!styles) return "";
  return Object.entries(styles).filter(([_, value]) => value != null && value !== "").map(([key, value]) => `${key}: ${value}`).join("; ");
}
class CircularSliderTool extends BaseTool {
  constructor(argToolset, argConfig, argPos) {
    const DEFAULT_ARCSLIDER_CONFIG = {
      position: {
        cx: 50,
        cy: 50,
        radius: 45,
        start_angle: 30,
        end_angle: 230,
        track: {
          width: 2
        },
        active: {
          width: 4
        },
        thumb: {
          height: 10,
          width: 10,
          radius: 5
        },
        capture: {
          height: 25,
          width: 25,
          radius: 25
        },
        label: {
          placement: "none",
          cx: 10,
          cy: 10
        }
      },
      show: {
        uom: "end",
        active: false
      },
      classes: {
        tool: {
          "sak-circslider": true,
          hover: true
        },
        capture: {
          "sak-circslider__capture": true,
          hover: true
        },
        active: {
          "sak-circslider__active": true
        },
        track: {
          "sak-circslider__track": true
        },
        thumb: {
          "sak-circslider__thumb": true,
          hover: true
        },
        label: {
          "sak-circslider__value": true
        },
        uom: {
          "sak-circslider__uom": true
        }
      },
      styles: {
        tool: {},
        active: {},
        capture: {},
        track: {},
        thumb: {},
        label: {},
        uom: {}
      },
      scale: {
        min: 0,
        max: 100,
        step: 1
      }
    };
    super(argToolset, Merge.mergeDeep(DEFAULT_ARCSLIDER_CONFIG, argConfig), argPos);
    this.svg.radius = Utils.calculateSvgDimension(this.config.position.radius);
    this.arc = {};
    this.arc.startAngle = this.config.position.start_angle;
    this.arc.endAngle = this.config.position.end_angle;
    this.arc.size = range(this.config.position.end_angle, this.config.position.start_angle);
    this.arc.clockwise = this.config.position.end_angle > this.config.position.start_angle;
    this.arc.direction = this.arc.clockwise ? 1 : -1;
    this.arc.pathLength = 2 * this.arc.size / 360 * Math.PI * this.svg.radius;
    this.arc.arcLength = 2 * Math.PI * this.svg.radius;
    this.arc.startAngle360 = angle360(this.arc.startAngle, this.arc.startAngle, this.arc.endAngle);
    this.arc.endAngle360 = angle360(this.arc.startAngle, this.arc.endAngle, this.arc.endAngle);
    this.arc.startAngleSvgPoint = this.polarToCartesian(this.svg.cx, this.svg.cy, this.svg.radius, this.svg.radius, this.arc.startAngle360);
    this.arc.endAngleSvgPoint = this.polarToCartesian(this.svg.cx, this.svg.cy, this.svg.radius, this.svg.radius, this.arc.endAngle360);
    this.arc.scaleDasharray = 2 * this.arc.size / 360 * Math.PI * this.svg.radius;
    this.arc.dashOffset = this.arc.clockwise ? 0 : -this.arc.scaleDasharray - this.arc.arcLength;
    this.arc.currentAngle = this.arc.startAngle;
    this.svg.startAngle = this.config.position.start_angle;
    this.svg.endAngle = this.config.position.end_angle;
    this.svg.diffAngle = this.config.position.end_angle - this.config.position.start_angle;
    this.svg.pathLength = 2 * this.arc.size / 360 * Math.PI * this.svg.radius;
    this.svg.circleLength = 2 * Math.PI * this.svg.radius;
    this.svg.label = {};
    switch (this.config.position.label.placement) {
      case "position":
        this.svg.label.cx = Utils.calculateSvgCoordinate(this.config.position.label.cx, 0);
        this.svg.label.cy = Utils.calculateSvgCoordinate(this.config.position.label.cy, 0);
        break;
      case "thumb":
        this.svg.label.cx = this.svg.cx;
        this.svg.label.cy = this.svg.cy;
        break;
      case "none":
        break;
      default:
        console.error("CircularSliderTool - constructor: invalid label placement [none, position, thumb] = ", this.config.position.label.placement);
        throw Error("CircularSliderTool::constructor - invalid label placement [none, position, thumb] = ", this.config.position.label.placement);
    }
    this.svg.track = {};
    this.svg.track.width = Utils.calculateSvgDimension(this.config.position.track.width);
    this.svg.active = {};
    this.svg.active.width = Utils.calculateSvgDimension(this.config.position.active.width);
    this.svg.thumb = {};
    this.svg.thumb.width = Utils.calculateSvgDimension(this.config.position.thumb.width);
    this.svg.thumb.height = Utils.calculateSvgDimension(this.config.position.thumb.height);
    this.svg.thumb.radius = Utils.calculateSvgDimension(this.config.position.thumb.radius);
    this.svg.thumb.cx = this.svg.cx;
    this.svg.thumb.cy = this.svg.cy;
    this.svg.thumb.x1 = this.svg.cx - this.svg.thumb.width / 2;
    this.svg.thumb.y1 = this.svg.cy - this.svg.thumb.height / 2;
    this.svg.capture = {};
    this.svg.capture.width = Utils.calculateSvgDimension(Math.max(this.config.position.capture.width, this.config.position.thumb.width * 1.2));
    this.svg.capture.height = Utils.calculateSvgDimension(Math.max(this.config.position.capture.height, this.config.position.thumb.height * 1.2));
    this.svg.capture.radius = Utils.calculateSvgDimension(this.config.position.capture.radius);
    this.svg.capture.x1 = this.svg.cx - this.svg.capture.width / 2;
    this.svg.capture.y1 = this.svg.cy - this.svg.capture.height / 2;
    this.svg.rotate = {};
    this.svg.rotate.degrees = this.arc.clockwise ? -90 + this.arc.startAngle : this.arc.endAngle360 - 90;
    this.svg.rotate.cx = this.svg.cx;
    this.svg.rotate.cy = this.svg.cy;
    this.classes.track = {};
    this.classes.active = {};
    this.classes.thumb = {};
    this.classes.label = {};
    this.classes.uom = {};
    this.styles.track = {};
    this.styles.active = {};
    this.styles.thumb = {};
    this.styles.label = {};
    this.styles.uom = {};
    this.svg.scale = {};
    this.svg.scale.min = this.config.scale.min;
    this.svg.scale.max = this.config.scale.max;
    this.svg.scale.center = Math.abs(this.svg.scale.max - this.svg.scale.min) / 2 + this.svg.scale.min;
    this.svg.scale.svgPointMin = this.sliderValueToPoint(this.svg.scale.min);
    this.svg.scale.svgPointMax = this.sliderValueToPoint(this.svg.scale.max);
    this.svg.scale.svgPointCenter = this.sliderValueToPoint(this.svg.scale.center);
    this.svg.scale.step = this.config.scale.step;
    this.rid = null;
    this.thumbPos = this.sliderValueToPoint(this.config.scale.min);
    this.svg.thumb.x1 = this.thumbPos.x - this.svg.thumb.width / 2;
    this.svg.thumb.y1 = this.thumbPos.y - this.svg.thumb.height / 2;
    this.svg.capture.x1 = this.thumbPos.x - this.svg.capture.width / 2;
    this.svg.capture.y1 = this.thumbPos.y - this.svg.capture.height / 2;
    if (this.dev.debug) console.log("CircularSliderTool::constructor", this.config, this.svg);
  }
  // From roundSlider... https://github.com/soundar24/roundSlider/blob/master/src/roundslider.js
  // eslint-disable-next-line no-unused-vars
  pointToAngle360(point, center, isDrag) {
    const radian = Math.atan2(point.y - center.y, center.x - point.x);
    let angle = -radian / (Math.PI / 180);
    angle += -90;
    if (angle < 0) angle += 360;
    if (this.arc.clockwise) {
      if (angle < this.arc.startAngle360) angle += 360;
    }
    if (!this.arc.clockwise) {
      if (angle < this.arc.endAngle360) angle += 360;
    }
    return angle;
  }
  isAngle360InBetween(argAngle) {
    let inBetween;
    if (this.arc.clockwise) {
      inBetween = argAngle >= this.arc.startAngle360 && argAngle <= this.arc.endAngle360;
    } else {
      inBetween = argAngle <= this.arc.startAngle360 && argAngle >= this.arc.endAngle360;
    }
    return !!inBetween;
  }
  polarToCartesian(centerX, centerY, radiusX, radiusY, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
    return {
      x: centerX + radiusX * Math.cos(angleInRadians),
      y: centerY + radiusY * Math.sin(angleInRadians)
    };
  }
  // SVGPoint deprecated. Use DOMPoint!!
  // DOMPoint.fromPoint(); ??? Or just keep using SVGPoint...
  pointToSliderValue(m) {
    let state;
    let scalePos;
    const center = {};
    center.x = this.svg.cx;
    center.y = this.svg.cy;
    const newAngle = this.pointToAngle360(m, center, true);
    let { myAngle } = this;
    const inBetween = this.isAngle360InBetween(newAngle);
    if (inBetween) {
      this.myAngle = newAngle;
      myAngle = newAngle;
      this.arc.currentAngle = myAngle;
    }
    this.arc.currentAngle = myAngle;
    if (this.arc.clockwise) scalePos = (myAngle - this.arc.startAngle360) / this.arc.size;
    if (!this.arc.clockwise) scalePos = (this.arc.startAngle360 - myAngle) / this.arc.size;
    state = (this.config.scale.max - this.config.scale.min) * scalePos + this.config.scale.min;
    state = Math.round(state / this.svg.scale.step) * this.svg.scale.step;
    state = Math.max(Math.min(this.config.scale.max, state), this.config.scale.min);
    this.arc.currentAngle = myAngle;
    if (this.dragging && !inBetween) {
      state = round$1(this.svg.scale.min, state, this.svg.scale.max);
      this.m = this.sliderValueToPoint(state);
    }
    return state;
  }
  sliderValueToPoint(argValue) {
    let state = Utils.calculateValueBetween(this.config.scale.min, this.config.scale.max, argValue);
    if (isNaN(state)) state = 0;
    let angle;
    if (this.arc.clockwise) {
      angle = this.arc.size * state + this.arc.startAngle360;
    } else {
      angle = this.arc.size * (1 - state) + this.arc.endAngle360;
    }
    if (angle < 0) angle += 360;
    const svgPoint = this.polarToCartesian(this.svg.cx, this.svg.cy, this.svg.radius, this.svg.radius, angle);
    this.arc.currentAngle = angle;
    return svgPoint;
  }
  updateValue(m) {
    this._value = this.pointToSliderValue(m);
    const dist = 0;
    if (Math.abs(dist) < 0.01) {
      if (this.rid) {
        window.cancelAnimationFrame(this.rid);
        this.rid = null;
      }
    }
  }
  updateThumb(m) {
    if (this.dragging) {
      this.thumbPos = this.sliderValueToPoint(this._value);
      this.svg.thumb.x1 = this.thumbPos.x - this.svg.thumb.width / 2;
      this.svg.thumb.y1 = this.thumbPos.y - this.svg.thumb.height / 2;
      this.svg.capture.x1 = this.thumbPos.x - this.svg.capture.width / 2;
      this.svg.capture.y1 = this.thumbPos.y - this.svg.capture.height / 2;
      const rotateStr = `rotate(${this.arc.currentAngle} ${this.svg.capture.width / 2} ${this.svg.capture.height / 2})`;
      this.elements.thumb.setAttribute("transform", rotateStr);
      this.elements.thumbGroup.setAttribute("x", this.svg.capture.x1);
      this.elements.thumbGroup.setAttribute("y", this.svg.capture.y1);
    }
    this.updateLabel(m);
  }
  // eslint-disable-next-line no-unused-vars
  updateActiveTrack(m) {
    const min = this.config.scale.min || 0;
    const max = this.config.scale.max || 100;
    let val = Utils.calculateValueBetween(min, max, this.labelValue);
    if (isNaN(val)) val = 0;
    const score = val * this.svg.pathLength;
    this.dashArray = `${score} ${this.svg.circleLength}`;
    if (this.dragging) {
      this.elements.activeTrack.setAttribute("stroke-dasharray", this.dashArray);
    }
  }
  updateLabel(m) {
    if (this.dev.debug) console.log("SLIDER - updateLabel start", m, this.config.position.orientation);
    const dec = this._card.config.entities[this.defaultEntityIndex()].decimals || 0;
    const x = 10 ** dec;
    this.labelValue2 = (Math.round(this.pointToSliderValue(m) * x) / x).toFixed(dec);
    console.log("updateLabel, labelvalue ", this.labelValue2);
    if (this.config.position.label.placement !== "none") {
      this.elements.label.textContent = this.labelValue2;
    }
  }
  /*
  * mouseEventToPoint
  *
  * Translate mouse/touch client window coordinates to SVG window coordinates
  *
  */
  mouseEventToPoint(e) {
    let p = this.elements.svg.createSVGPoint();
    p.x = e.touches ? e.touches[0].clientX : e.clientX;
    p.y = e.touches ? e.touches[0].clientY : e.clientY;
    const ctm = this.elements.svg.getScreenCTM().inverse();
    p = p.matrixTransform(ctm);
    return p;
  }
  callDragService() {
    if (typeof this.labelValue2 === "undefined") return;
    if (this.labelValuePrev !== this.labelValue2) {
      this.labelValuePrev = this.labelValue2;
      this._processTapEvent(
        this._card,
        this._card._hass,
        this.config,
        this.config.user_actions.tap_action,
        this._card.config.entities[this.defaultEntityIndex()]?.entity,
        this.labelValue2
      );
    }
    if (this.dragging)
      this.timeOutId = setTimeout(() => this.callDragService(), this.config.user_actions.drag_action.update_interval);
  }
  callTapService() {
    if (typeof this.labelValue2 === "undefined") return;
    this._processTapEvent(
      this._card,
      this._card._hass,
      this.config,
      this.config.user_actions?.tap_action,
      this._card.config.entities[this.defaultEntityIndex()]?.entity,
      this.labelValue2
    );
  }
  // eslint-disable-next-line no-unused-vars
  firstUpdated(changedProperties) {
    this.labelValue = this._stateValue;
    function FrameArc() {
      this.rid = window.requestAnimationFrame(FrameArc);
      this.updateValue(this.m);
      this.updateThumb(this.m);
      this.updateActiveTrack(this.m);
    }
    if (this.dev.debug) console.log("circslider - firstUpdated");
    this.elements = {};
    this.elements.svg = this._card.shadowRoot.getElementById("circslider-".concat(this.toolId));
    this.elements.track = this.elements.svg.querySelector("#track");
    this.elements.activeTrack = this.elements.svg.querySelector("#active-track");
    this.elements.capture = this.elements.svg.querySelector("#capture");
    this.elements.thumbGroup = this.elements.svg.querySelector("#thumb-group");
    this.elements.thumb = this.elements.svg.querySelector("#thumb");
    this.elements.label = this.elements.svg.querySelector("#label tspan");
    if (this.dev.debug) console.log(
      "circslider - firstUpdated svg = ",
      this.elements.svg,
      "activeTrack=",
      this.elements.activeTrack,
      "thumb=",
      this.elements.thumb,
      "label=",
      this.elements.label,
      "text=",
      this.elements.text
    );
    const protectBorderPassing = () => {
      const diffMax = range(this.svg.scale.max, this.labelValue) <= this.rangeMax;
      const diffMin = range(this.svg.scale.min, this.labelValue) <= this.rangeMin;
      const fromMaxToMin = !!(diffMin && this.diffMax);
      const fromMinToMax = !!(diffMax && this.diffMin);
      if (fromMaxToMin) {
        this.labelValue = this.svg.scale.max;
        this.m = this.sliderValueToPoint(this.labelValue);
        this.rangeMax = this.svg.scale.max / 10;
        this.rangeMin = range(this.svg.scale.max, this.svg.scale.min + this.svg.scale.max / 5);
      } else if (fromMinToMax) {
        this.labelValue = this.svg.scale.min;
        this.m = this.sliderValueToPoint(this.labelValue);
        this.rangeMax = range(this.svg.scale.min, this.svg.scale.max - this.svg.scale.max / 5);
        this.rangeMin = this.svg.scale.max / 10;
      } else {
        this.diffMax = diffMax;
        this.diffMin = diffMin;
        this.rangeMin = this.svg.scale.max / 5;
        this.rangeMax = this.svg.scale.max / 5;
      }
    };
    const pointerMove = (e) => {
      e.preventDefault();
      if (this.dragging) {
        this.m = this.mouseEventToPoint(e);
        this.labelValue = this.pointToSliderValue(this.m);
        protectBorderPassing();
        FrameArc.call(this);
      }
    };
    const pointerDown = (e) => {
      e.preventDefault();
      this.dragging = true;
      window.addEventListener("pointermove", pointerMove, false);
      window.addEventListener("pointerup", pointerUp, false);
      if (this.config.user_actions?.drag_action && this.config.user_actions?.drag_action.update_interval) {
        if (this.config.user_actions.drag_action.update_interval > 0) {
          this.timeOutId = setTimeout(() => this.callDragService(), this.config.user_actions.drag_action.update_interval);
        } else {
          this.timeOutId = null;
        }
      }
      this.m = this.mouseEventToPoint(e);
      this.labelValue = this.pointToSliderValue(this.m);
      protectBorderPassing();
      if (this.dev.debug) console.log("pointerDOWN", Math.round(this.m.x * 100) / 100);
      FrameArc.call(this);
    };
    const pointerUp = (e) => {
      e.preventDefault();
      if (this.dev.debug) console.log("pointerUP");
      window.removeEventListener("pointermove", pointerMove, false);
      window.removeEventListener("pointerup", pointerUp, false);
      window.removeEventListener("mousemove", pointerMove, false);
      window.removeEventListener("touchmove", pointerMove, false);
      window.removeEventListener("mouseup", pointerUp, false);
      window.removeEventListener("touchend", pointerUp, false);
      this.labelValuePrev = this.labelValue;
      if (!this.dragging) {
        protectBorderPassing();
        return;
      }
      this.dragging = false;
      clearTimeout(this.timeOutId);
      this.timeOutId = null;
      this.target = 0;
      this.labelValue2 = this.labelValue;
      FrameArc.call(this);
      this.callTapService();
    };
    const mouseWheel = (e) => {
      e.preventDefault();
      clearTimeout(this.wheelTimeOutId);
      this.dragging = true;
      this.wheelTimeOutId = setTimeout(() => {
        clearTimeout(this.timeOutId);
        this.timeOutId = null;
        this.labelValue2 = this.labelValue;
        this.dragging = false;
        this.callTapService();
      }, 500);
      if (this.config.user_actions?.drag_action && this.config.user_actions?.drag_action.update_interval) {
        if (this.config.user_actions.drag_action.update_interval > 0) {
          this.timeOutId = setTimeout(() => this.callDragService(), this.config.user_actions.drag_action.update_interval);
        } else {
          this.timeOutId = null;
        }
      }
      const newValue = +this.labelValue + +((e.altKey ? 10 * this.svg.scale.step : this.svg.scale.step) * Math.sign(e.deltaY));
      this.labelValue = clamp$1(this.svg.scale.min, newValue, this.svg.scale.max);
      this.m = this.sliderValueToPoint(this.labelValue);
      this.pointToSliderValue(this.m);
      FrameArc.call(this);
      this.labelValue2 = this.labelValue;
    };
    this.elements.thumbGroup.addEventListener("touchstart", pointerDown, false);
    this.elements.thumbGroup.addEventListener("mousedown", pointerDown, false);
    this.elements.svg.addEventListener("wheel", mouseWheel, false);
  }
  /** *****************************************************************************
  * CircularSliderTool::value()
  *
  * Summary.
  * Sets the value of the CircularSliderTool. Value updated via set hass.
  * Calculate CircularSliderTool settings & colors depending on config and new value.
  *
  */
  set value(state) {
    super.value = state;
    if (!this.dragging) this.labelValue = this._stateValue;
    if (!this.dragging) {
      const min = this.config.scale.min || 0;
      const max = this.config.scale.max || 100;
      let val = Math.min(Utils.calculateValueBetween(min, max, this._stateValue), 1);
      if (isNaN(val)) val = 0;
      const score = val * this.svg.pathLength;
      this.dashArray = `${score} ${this.svg.circleLength}`;
      const thumbPos = this.sliderValueToPoint(this._stateValue);
      this.svg.thumb.x1 = thumbPos.x - this.svg.thumb.width / 2;
      this.svg.thumb.y1 = thumbPos.y - this.svg.thumb.height / 2;
      this.svg.capture.x1 = thumbPos.x - this.svg.capture.width / 2;
      this.svg.capture.y1 = thumbPos.y - this.svg.capture.height / 2;
    }
  }
  set values(states) {
    super.values = states;
    if (!this.dragging) this.labelValue = this._stateValues[this.getIndexInEntityIndexes(this.defaultEntityIndex())];
    if (!this.dragging) {
      const min = this.config.scale.min || 0;
      const max = this.config.scale.max || 100;
      let val = Math.min(Utils.calculateValueBetween(min, max, this._stateValues[this.getIndexInEntityIndexes(this.defaultEntityIndex())]), 1);
      if (isNaN(val)) val = 0;
      const score = val * this.svg.pathLength;
      this.dashArray = `${score} ${this.svg.circleLength}`;
      const thumbPos = this.sliderValueToPoint(this._stateValues[this.getIndexInEntityIndexes(this.defaultEntityIndex())]);
      this.svg.thumb.x1 = thumbPos.x - this.svg.thumb.width / 2;
      this.svg.thumb.y1 = thumbPos.y - this.svg.thumb.height / 2;
      this.svg.capture.x1 = thumbPos.x - this.svg.capture.width / 2;
      this.svg.capture.y1 = thumbPos.y - this.svg.capture.height / 2;
    }
  }
  _renderUom() {
    if (this.config.show.uom === "none") {
      return svg``;
    } else {
      this.MergeAnimationStyleIfChanged();
      this.MergeColorFromState(this.styles.uom);
      let fsuomStr = this.styles.label["font-size"];
      let fsuomValue = 0.5;
      let fsuomType = "em";
      const fsuomSplit = fsuomStr.match(/\D+|\d*\.?\d+/g);
      if (fsuomSplit.length === 2) {
        fsuomValue = Number(fsuomSplit[0]) * 0.6;
        fsuomType = fsuomSplit[1];
      } else console.error("Cannot determine font-size for state/unit", fsuomStr);
      fsuomStr = { "font-size": fsuomValue + fsuomType };
      this.styles.uom = Merge.mergeDeep(this.config.styles.uom, fsuomStr);
      const uom = this._card._buildUom(this.derivedEntity, this._card.entities[this.defaultEntityIndex()], this._card.config.entities[this.defaultEntityIndex()]);
      if (this.config.show.uom === "end") {
        return svg`
          <tspan class="${classMap$g(this.classes.uom)}" dx="-0.1em" dy="-0.35em"
            style="${styleMap$i(this.styles.uom)}">
            ${uom}</tspan>
        `;
      } else if (this.config.show.uom === "bottom") {
        return svg`
          <tspan class="${classMap$g(this.classes.uom)}" x="${this.svg.label.cx}" dy="1.5em"
            style="${styleMap$i(this.styles.uom)}">
            ${uom}</tspan>
        `;
      } else if (this.config.show.uom === "top") {
        return svg`
          <tspan class="${classMap$g(this.classes.uom)}" x="${this.svg.label.cx}" dy="-1.5em"
            style="${styleMap$i(this.styles.uom)}">
            ${uom}</tspan>
        `;
      } else {
        return svg`
          <tspan class="${classMap$g(this.classes.uom)}"  dx="-0.1em" dy="-0.35em"
            style="${styleMap$i(this.styles.uom)}">
            ERR</tspan>
        `;
      }
    }
  }
  /** *****************************************************************************
  * CircularSliderTool::_renderCircSlider()
  *
  * Summary.
  * Renders the CircularSliderTool
  *
  * Description.
  * The horseshoes are rendered in a viewbox of 200x200 (SVG_VIEW_BOX).
  * Both are centered with a radius of 45%, ie 200*0.45 = 90.
  *
  * The horseshoes are rotated 220 degrees and are 2 * 26/36 * Math.PI * r in size
  * There you get your value of 408.4070449,180 ;-)
  */
  _renderCircSlider() {
    this.MergeAnimationClassIfChanged();
    this.MergeColorFromState();
    this.MergeAnimationStyleIfChanged();
    this.renderValue = this._stateValue;
    if (this.dragging) {
      this.renderValue = this.labelValue2;
    } else if (this.elements?.label) this.elements.label.textContent = this.renderValue === "undefined" ? "" : this.renderValue;
    function renderLabel(argGroup) {
      if (this.config.position.label.placement === "thumb" && argGroup) {
        return svg`
      <text id="label">
        <tspan class="${classMap$g(this.classes.label)}" x="${this.svg.label.cx}" y="${this.svg.label.cy}" style="${styleMap$i(this.styles.label)}">
        ${typeof this.renderValue === "undefined" ? "" : this.renderValue}</tspan>
        ${typeof this.renderValue === "undefined" ? "" : this._renderUom()}
        </text>
        `;
      }
      if (this.config.position.label.placement === "position" && !argGroup) {
        return svg`
          <text id="label" style="transform-origin:center;transform-box: fill-box;">
            <tspan class="${classMap$g(this.classes.label)}" data-placement="position" x="${this.svg.label.cx}" y="${this.svg.label.cy}"
            style="${styleMap$i(this.styles.label)}">
            ${typeof this.renderValue === "undefined" ? "" : this.renderValue}</tspan>
            ${typeof this.renderValue === "undefined" ? "" : this._renderUom()}
          </text>
          `;
      }
    }
    function renderThumbGroup() {
      return svg`
        <svg id="thumb-group" x="${this.svg.capture.x1}" y="${this.svg.capture.y1}" style="filter:url(#sak-drop-1);overflow:visible;">
          <g style="transform-origin:center;transform-box: fill-box;" >
          <g id="thumb" transform="rotate(${this.arc.currentAngle} ${this.svg.capture.width / 2} ${this.svg.capture.height / 2})">

            <rect id="capture" class="${classMap$g(this.classes.capture)}" x="0" y="0"
              width="${this.svg.capture.width}" height="${this.svg.capture.height}" rx="${this.svg.capture.radius}" 
              style="${styleMap$i(this.styles.capture)}" 
            />

            <rect id="rect-thumb" class="${classMap$g(this.classes.thumb)}" x="${(this.svg.capture.width - this.svg.thumb.width) / 2}" y="${(this.svg.capture.height - this.svg.thumb.height) / 2}"
              width="${this.svg.thumb.width}" height="${this.svg.thumb.height}" rx="${this.svg.thumb.radius}" 
              style="${styleMap$i(this.styles.thumb)}"
            />

            </g>
            </g>
        </g>
      `;
    }
    return svg`
      <g id="circslider__group-inner" class="${classMap$g(this.classes.tool)}" style="${styleMap$i(this.styles.tool)}">

        <circle id="track" class="sak-circslider__track" cx="${this.svg.cx}" cy="${this.svg.cy}" r="${this.svg.radius}"
          style="${styleMap$i(this.styles.track)}"
          stroke-dasharray="${this.arc.scaleDasharray} ${this.arc.arcLength}"
          stroke-dashoffset="${this.arc.dashOffset}"
          stroke-width="${this.svg.track.width}"
          transform="rotate(${this.svg.rotate.degrees} ${this.svg.rotate.cx} ${this.svg.rotate.cy})"/>

        <circle id="active-track" class="sak-circslider__active" cx="${this.svg.cx}" cy="${this.svg.cy}" r="${this.svg.radius}"
          fill="${this.config.fill || "rgba(0, 0, 0, 0)"}"
          style="${styleMap$i(this.styles.active)}"
          stroke-dasharray="${this.dashArray}"
          stroke-dashoffset="${this.arc.dashOffset}"
          stroke-width="${this.svg.active.width}"
          transform="rotate(${this.svg.rotate.degrees} ${this.svg.rotate.cx} ${this.svg.rotate.cy})"/>

        ${renderThumbGroup.call(this)}
        ${renderLabel.call(this, false)}
      </g>

    `;
  }
  /** *****************************************************************************
  * CircularSliderTool::render()
  *
  * Summary.
  * The render() function for this object.
  *
  */
  render() {
    return svg`
      <svg xmlns="http://www.w3.org/2000/svg" id="circslider-${this.toolId}" class="circslider__group-outer" overflow="visible"
        touch-action="none" style="touch-action:none;"
      >
        ${this._renderCircSlider()}

      </svg>
    `;
  }
}
function classMap$f(classes) {
  if (!classes) return "";
  return Object.entries(classes).filter(([_, value]) => value).map(([key, _]) => key).join(" ");
}
function styleMap$h(styles) {
  if (!styles) return "";
  return Object.entries(styles).filter(([_, value]) => value != null && value !== "").map(([key, value]) => `${key}: ${value}`).join("; ");
}
class EllipseTool extends BaseTool {
  constructor(argToolset, argConfig, argPos) {
    const DEFAULT_ELLIPSE_CONFIG = {
      position: {
        cx: 50,
        cy: 50,
        radiusx: 50,
        radiusy: 25
      },
      classes: {
        tool: {
          "sak-ellipse": true,
          hover: true
        },
        ellipse: {
          "sak-ellipse__ellipse": true
        }
      },
      styles: {
        tool: {},
        ellipse: {}
      }
    };
    super(argToolset, Merge.mergeDeep(DEFAULT_ELLIPSE_CONFIG, argConfig), argPos);
    this.svg.radiusx = Utils.calculateSvgDimension(argConfig.position.radiusx);
    this.svg.radiusy = Utils.calculateSvgDimension(argConfig.position.radiusy);
    this.classes.tool = {};
    this.classes.ellipse = {};
    this.styles.tool = {};
    this.styles.ellipse = {};
    if (this.dev.debug) console.log("EllipseTool constructor coords, dimensions", this.coords, this.dimensions, this.svg, this.config);
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
    if (this.dev.debug) console.log("EllipseTool - renderEllipse", this.svg.cx, this.svg.cy, this.svg.radiusx, this.svg.radiusy);
    return svg`
      <ellipse class="${classMap$f(this.classes.ellipse)}"
        cx="${this.svg.cx}"% cy="${this.svg.cy}"%
        rx="${this.svg.radiusx}" ry="${this.svg.radiusy}"
        style="${styleMap$h(this.styles.ellipse)}"/>
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
        class="${classMap$f(this.classes.tool)}" style="${styleMap$h(this.styles.tool)}"
        @click=${(e) => this.handleTapEvent(e, this.config)}>
        ${this._renderEllipse()}
      </g>
    `;
  }
}
function classMap$e(classes) {
  if (!classes) return "";
  return Object.entries(classes).filter(([_, value]) => value).map(([key, _]) => key).join(" ");
}
function styleMap$g(styles) {
  if (!styles) return "";
  return Object.entries(styles).filter(([_, value]) => value != null && value !== "").map(([key, value]) => `${key}: ${value}`).join("; ");
}
class EntityAreaTool extends BaseTool {
  constructor(argToolset, argConfig, argPos) {
    const DEFAULT_AREA_CONFIG = {
      classes: {
        tool: {},
        area: {
          "sak-area__area": true,
          hover: true
        }
      },
      styles: {
        tool: {},
        area: {}
      }
    };
    super(argToolset, Merge.mergeDeep(DEFAULT_AREA_CONFIG, argConfig), argPos);
    this.classes.tool = {};
    this.classes.area = {};
    this.styles.tool = {};
    this.styles.area = {};
    if (this.dev.debug) console.log("EntityAreaTool constructor coords, dimensions", this.coords, this.dimensions, this.svg, this.config);
  }
  /** *****************************************************************************
  * EntityAreaTool::_buildArea()
  *
  * Summary.
  * Builds the Area string.
  *
  */
  _buildArea(entityState, entityConfig) {
    return entityConfig.area || "?";
  }
  /** *****************************************************************************
  * EntityAreaTool::_renderEntityArea()
  *
  * Summary.
  * Renders the entity area using precalculated coordinates and dimensions.
  * Only the runtime style is calculated before rendering the area
  *
  */
  _renderEntityArea() {
    this.MergeAnimationClassIfChanged();
    this.MergeColorFromState(this.styles.area);
    this.MergeAnimationStyleIfChanged();
    const area = this.textEllipsis(
      this._buildArea(
        this._card.entities[this.defaultEntityIndex()],
        this._card.config.entities[this.defaultEntityIndex()]
      ),
      this.config?.show?.ellipsis
    );
    return svg`
        <text>
          <tspan class="${classMap$e(this.classes.area)}"
          x="${this.svg.cx}" y="${this.svg.cy}" style="${styleMap$g(this.styles.area)}">${area}</tspan>
        </text>
      `;
  }
  /** *****************************************************************************
  * EntityAreaTool::render()
  *
  * Summary.
  * The render() function for this object.
  *
  */
  render() {
    return svg`
      <g id="area-${this.toolId}"
        class="${classMap$e(this.classes.tool)}" style="${styleMap$g(this.styles.tool)}"
        @click=${(e) => this.handleTapEvent(e, this.config)}>
        ${this._renderEntityArea()}
      </g>
    `;
  }
}
const DEFAULT_DOMAIN_ICON_NAME = "mdi:bookmark";
const FIXED_DOMAIN_ICONS_NAME = {
  air_quality: "mdi:air-filter",
  alert: "mdi:alert",
  calendar: "mdi:calendar",
  climate: "mdi:thermostat",
  configurator: "mdi:cog",
  conversation: "mdi:microphone-message",
  counter: "mdi:counter",
  datetime: "mdi:calendar-clock",
  date: "mdi:calendar",
  demo: "mdi:home-assistant",
  google_assistant: "mdi:google-assistant",
  group: "mdi:google-circles-communities",
  homeassistant: "mdi:home-assistant",
  homekit: "mdi:home-automation",
  image_processing: "mdi:image-filter-frames",
  input_button: "mdi:gesture-tap-button",
  input_datetime: "mdi:calendar-clock",
  input_number: "mdi:ray-vertex",
  input_select: "mdi:format-list-bulleted",
  input_text: "mdi:form-textbox",
  light: "mdi:lightbulb",
  mailbox: "mdi:mailbox",
  notify: "mdi:comment-alert",
  number: "mdi:ray-vertex",
  persistent_notification: "mdi:bell",
  plant: "mdi:Flower",
  proximity: "mdi:apple-safari",
  remote: "mdi:remote",
  scene: "mdi:palette",
  schedule: "mdi:calendar-clock",
  script: "mdi:script-text",
  select: "mdi:format-list-bulleted",
  sensor: "mdi:Eye",
  simple_alarm: "mdi:bell",
  siren: "mdi:bullhorn",
  stt: "mdi:microphone-message",
  text: "mdi:form-textbox",
  time: "mdi:clock",
  timer: "mdi:timer-outline",
  tts: "mdi:speaker-message",
  updater: "mdi:cloud-upload",
  vacuum: "mdi:robot-vacuum",
  zone: "mdi:map-marker-radius"
};
const FIXED_DEVICE_CLASS_ICONS_NAME = {
  apparent_power: "mdi:flash",
  aqi: "mdi:air-filter",
  atmospheric_pressure: "mdi:thermometer-lines",
  // battery: 'mdi:Battery, => not included by design since `sensorIcon()` will dynamically determine the icon
  carbon_dioxide: "mdi:molecule-co2",
  carbon_monoxide: "mdi:molecule-co",
  current: "mdi:current-ac",
  data_rate: "mdi:transmission-tower",
  data_size: "mdi:database",
  date: "mdi:calendar",
  distance: "mdi:arrow-left-right",
  duration: "mdi:progress-clock",
  energy: "mdi:lightning-bolt",
  frequency: "mdi:sine-wave",
  gas: "mdi:meter-gas",
  humidity: "mdi:water-percent",
  illuminance: "mdi:brightness-5",
  irradiance: "mdi:sun-wireless",
  moisture: "mdi:water-percent",
  monetary: "mdi:cash",
  nitrogen_dioxide: "mdi:molecule",
  nitrogen_monoxide: "mdi:molecule",
  nitrous_oxide: "mdi:molecule",
  ozone: "mdi:molecule",
  pm1: "mdi:molecule",
  pm10: "mdi:molecule",
  pm25: "mdi:molecule",
  power: "mdi:flash",
  power_factor: "mdi:angle-acute",
  precipitation: "mdi:weather-rainy",
  precipitation_intensity: "mdi:weather-pouring",
  pressure: "mdi:gauge",
  reactive_power: "mdi:flash",
  signal_strength: "mdi:wifi",
  sound_pressure: "mdi:ear-hearing",
  speed: "mdi:speedometer",
  sulphur_dioxide: "mdi:molecule",
  temperature: "mdi:thermometer",
  timestamp: "mdi:clock",
  volatile_organic_compounds: "mdi:molecule",
  volatile_organic_compounds_parts: "mdi:molecule",
  voltage: "mdi:sine-wave",
  volume: "mdi:car-coolant-level",
  water: "mdi:water",
  weight: "mdi:weight",
  wind_speed: "mdi:weather-windy"
};
const computeDomain = (entityId) => entityId.substr(0, entityId.indexOf("."));
const alarmPanelIconName = (state) => {
  switch (state) {
    case "armed_away":
      return "mdi:shield-lock";
    case "armed_vacation":
      return "mdi:shield-airplane";
    case "armed_home":
      return "mdi:shield-home";
    case "armed_night":
      return "mdi:shield-moon";
    case "armed_custom_bypass":
      return "mdi:security";
    case "pending":
      return "mdi:shield-outline";
    case "triggered":
      return "mdi:bell-ring";
    case "disarmed":
      return "mdi:shield-off";
    default:
      return "mdi:shield";
  }
};
const binarySensorIconName = (state, stateObj) => {
  const is_off = state === "off";
  switch (stateObj?.attributes.device_class) {
    case "battery":
      return is_off ? "mdi:battery" : "mdi:battery-outline";
    case "battery_charging":
      return is_off ? "mdi:battery" : "mdi:battery-charging";
    case "carbon_monoxide":
      return is_off ? "mdi:smoke-detector" : "mdi:smoke-detector-alert";
    case "cold":
      return is_off ? "mdi:thermometer" : "mdi:Snowflake";
    case "connectivity":
      return is_off ? "mdi:close-network-outline" : "mdi:check-network-outline";
    case "door":
      return is_off ? "mdi:door-closed" : "mdi:door-open";
    case "garage_door":
      return is_off ? "mdi:garage" : "mdi:garage-open";
    case "power":
      return is_off ? "mdi:power-plug-off" : "mdi:power-plug";
    case "gas":
    case "problem":
    case "safety":
    case "tamper":
      return is_off ? "mdi:check-circle" : "mdi:alert-circle";
    case "smoke":
      return is_off ? "mdi:smoke-detector-variant" : "mdi:smoke-detector-variant-alert";
    case "heat":
      return is_off ? "mdi:thermometer" : "mdi:fire";
    case "light":
      return is_off ? "mdi:brightness-5" : "mdi:brightness-7";
    case "lock":
      return is_off ? "mdi:lock" : "mdi:lock-open";
    case "moisture":
      return is_off ? "mdi:water-off" : "mdi:water";
    case "motion":
      return is_off ? "mdi:motion-sensor-off" : "mdi:motion-sensor";
    case "occupancy":
      return is_off ? "mdi:home-outline" : "mdi:Home";
    case "opening":
      return is_off ? "mdi:square" : "mdi:square-outline";
    case "plug":
      return is_off ? "mdi:power-plug-off" : "mdi:power-plug";
    case "presence":
      return is_off ? "mdi:home-outline" : "mdi:home";
    case "running":
      return is_off ? "mdi:stop" : "mdi:play";
    case "sound":
      return is_off ? "mdi:music-note-off" : "mdi:music-note";
    case "update":
      return is_off ? "mdi:package" : "mdi:package-up";
    case "vibration":
      return is_off ? "mdi:crop-portrait" : "mdi:vibrate";
    case "window":
      return is_off ? "mdi:window-closed" : "mdi:window-open";
    default:
      return is_off ? "mdi:radiobox-blank" : "mdi:checkbox-marked-circle";
  }
};
const coverIconName = (state, stateObj) => {
  const open = state !== "closed";
  switch (stateObj?.attributes.device_class) {
    case "garage":
      switch (state) {
        case "opening":
          return "mdi:arrow-up-box";
        case "closing":
          return "mdi:arrow-down-box";
        case "closed":
          return "mdigarage";
        default:
          return "mdi:Garage-open";
      }
    case "gate":
      switch (state) {
        case "opening":
        case "closing":
          return "mdi:gate-arrow-right";
        case "closed":
          return "mdi:gate";
        default:
          return "mdi:gate-open";
      }
    case "door":
      return open ? "mdi:door-open" : "mdi:door-closed";
    case "damper":
      return open ? "mdi:circle" : "mdi:circle-slice-8";
    case "shutter":
      switch (state) {
        case "opening":
          return "mdi:arrow-up-box";
        case "closing":
          return "mdi:arrow-down-box";
        case "closed":
          return "mdi:window-shutter";
        default:
          return "mdi:window-shutter-open";
      }
    case "curtain":
      switch (state) {
        case "opening":
          return "mdi:arrow-split-vertical";
        case "closing":
          return "mdi:arrow-collapse-horizontal";
        case "closed":
          return "mdi:curtains-closed";
        default:
          return "mdi:curtains";
      }
    case "blind":
      switch (state) {
        case "opening":
          return "mdi:arrow-up-box";
        case "closing":
          return "mdi:arrow-down-box";
        case "closed":
          return "mdi:blinds-horizontal-closed";
        default:
          return "mdi:blinds-horizontal";
      }
    case "shade":
      switch (state) {
        case "opening":
          return "mdi:arrow-up-box";
        case "closing":
          return "mdi:arrow-down-box";
        case "closed":
          return "mdi:roller-shade-closed";
        default:
          return "mdi:roller-shade";
      }
    case "window":
      switch (state) {
        case "opening":
          return "mdi:arrow-up-box";
        case "closing":
          return "mdi:arrow-down-box";
        case "closed":
          return "mdi:window--closed";
        default:
          return "mdi:window--open";
      }
  }
  switch (state) {
    case "opening":
      return "mdi:arrow-up-box";
    case "closing":
      return "mdi:arrow-down-box";
    case "closed":
      return "mdi:window--closed";
    default:
      return "mdi:window--open";
  }
};
const numberIconName = (stateObj) => {
  const dclass = stateObj?.attributes.device_class;
  if (dclass && dclass in FIXED_DEVICE_CLASS_ICONS_NAME) {
    return FIXED_DEVICE_CLASS_ICONS_NAME[dclass];
  }
  return void 0;
};
const SENSOR_DEVICE_CLASS_BATTERY = "battery";
const UNIT_C = "°C";
const UNIT_F = "°F";
const BATTERY_ICONS_NAME = {
  10: "mdi:battery-10",
  20: "mdi:battery-20",
  30: "mdi:battery-30",
  40: "mdi:battery-40",
  50: "mdi:battery-50",
  60: "mdi:battery-60",
  70: "mdi:battery-70",
  80: "mdi:battery-80",
  90: "mdi:battery-90",
  100: "mdi:battery"
};
const batteryStateIconName = (batteryState, batteryChargingState) => {
  const battery = batteryState.state;
  return batteryIconName(battery);
};
const batteryIconName = (batteryState, batteryCharging) => {
  const batteryValue = Number(batteryState);
  if (isNaN(batteryValue)) {
    if (batteryState === "off") {
      return "mdi:battery";
    }
    if (batteryState === "on") {
      return "mdi:battery-alert";
    }
    return "mdi:battery-unknown";
  }
  const batteryRound = Math.round(batteryValue / 10) * 10;
  if (batteryValue <= 5) {
    return "mdi:battery-alert-variant-outline";
  }
  return BATTERY_ICONS_NAME[batteryRound];
};
const sensorIconName = (stateObj) => {
  const dclass = stateObj?.attributes.device_class;
  if (dclass && dclass in FIXED_DEVICE_CLASS_ICONS_NAME) {
    return FIXED_DEVICE_CLASS_ICONS_NAME[dclass];
  }
  if (dclass === SENSOR_DEVICE_CLASS_BATTERY) {
    return stateObj ? batteryStateIconName(stateObj) : "mdi:battery";
  }
  const unit = stateObj?.attributes.unit_of_measurement;
  if (unit === UNIT_C || unit === UNIT_F) {
    return "mdi-thermometer";
  }
  return void 0;
};
const domainIconName = (domain, stateObj, state) => {
  const icon = domainIconWithoutDefaultName(domain, stateObj);
  if (icon) {
    return icon;
  }
  console.warn(`Unable to find icon for domain ${domain}`);
  return DEFAULT_DOMAIN_ICON_NAME;
};
const domainIconWithoutDefaultName = (domain, stateObj, state) => {
  const compareState = stateObj?.state;
  switch (domain) {
    case "alarm_control_panel":
      return alarmPanelIconName(compareState);
    case "automation":
      return compareState === "off" ? "mdi:robot-off" : "mdi:robot";
    case "binary_sensor":
      return binarySensorIconName(compareState, stateObj);
    case "button":
      switch (stateObj?.attributes.device_class) {
        case "restart":
          return "mdi:restart";
        case "update":
          return "mdi:package-up";
        default:
          return "mdi:gesture-tap-button";
      }
    case "camera":
      return compareState === "off" ? "mdi:video-off" : "mdi:video";
    case "cover":
      return coverIconName(compareState, stateObj);
    case "device_tracker":
      if (stateObj?.attributes.source_type === "router") {
        return compareState === "home" ? "mdi:lan-connect" : "mdi:lan-cisconnect";
      }
      if (["bluetooth", "bluetooth_le"].includes(stateObj?.attributes.source_type)) {
        return compareState === "home" ? "mdi:bluetooth-connect" : "mdi:bluetooth";
      }
      return compareState === "not_home" ? "mdi:account-arrow-right" : "mdi:account";
    case "fan":
      return compareState === "off" ? "mdi:fan-off" : "mdi:fan";
    case "humidifier":
      return compareState === "off" ? "mdi:air-humidifier-off" : "mdi:air-humidifier";
    case "input_boolean":
      return compareState === "on" ? "mdi:check-circle-outline" : "mdi:close-circle-outline";
    case "input_datetime":
      if (!stateObj?.attributes.has_date) {
        return "mdi:clock";
      }
      if (!stateObj.attributes.has_time) {
        return "mdi:calendar";
      }
      break;
    case "lock":
      switch (compareState) {
        case "unlocked":
          return "mdi:lock-open";
        case "jammed":
          return "mdi:lock-alert";
        case "locking":
        case "unlocking":
          return "mdi:lock-clock";
        default:
          return "mdi:lock";
      }
    case "media_player":
      switch (stateObj?.attributes.device_class) {
        case "speaker":
          switch (compareState) {
            case "playing":
              return "mdi:speaker-play";
            case "paused":
              return "mdi:speaker-pause";
            case "off":
              return "mdi:speaker-off";
            default:
              return "mdi:speaker";
          }
        case "tv":
          switch (compareState) {
            case "playing":
              return "mdi:television-play";
            case "paused":
              return "mdi:television-pause";
            case "off":
              return "mdi:television-off";
            default:
              return "mdi:television";
          }
        case "receiver":
          switch (compareState) {
            case "off":
              return "mdi:audio-video-off";
            default:
              return "mdi:audio-video";
          }
        default:
          switch (compareState) {
            case "playing":
            case "paused":
              return "mdi:cast-connected";
            case "off":
              return "mdi:cast-off";
            default:
              return "mdi:cast";
          }
      }
    case "number": {
      const icon = numberIconName(stateObj);
      if (icon) {
        return icon;
      }
      break;
    }
    case "person":
      return compareState === "not_home" ? "mdi:account-arrow-right" : "mdi:account";
    case "switch":
      switch (stateObj?.attributes.device_class) {
        case "outlet":
          return compareState === "on" ? "mdi:power-plug" : "mdi:power-plug-off";
        case "switch":
          return compareState === "on" ? "mdi:toggle-switch-variant" : "mdi:toggle-switch-variant-off";
        default:
          return "mdi:toggle-switch-variant";
      }
    case "sensor": {
      const icon = sensorIconName(stateObj);
      if (icon) {
        return icon;
      }
      break;
    }
    case "sun":
      return stateObj?.state === "above_horizon" ? "mdi:white-balance-sunny" : "mdi:weather-night";
    case "switch_as_x":
      return "mdi:swap-horizontal";
    case "threshold":
      return "mdi:chart-sankey";
    case "water_heater":
      return compareState === "off" ? "mdi:water-boiler-off" : "mdi:water-boiler";
  }
  if (domain in FIXED_DOMAIN_ICONS_NAME) {
    return FIXED_DOMAIN_ICONS_NAME[domain];
  }
  return void 0;
};
const stateIconName = (state) => {
  if (!state) {
    return DEFAULT_DOMAIN_ICON_NAME;
  }
  return domainIconName(computeDomain(state.entity_id), state);
};
function classMap$d(classes) {
  if (!classes) return "";
  return Object.entries(classes).filter(([_, value]) => value).map(([key, _]) => key).join(" ");
}
function styleMap$f(styles) {
  if (!styles) return "";
  return Object.entries(styles).filter(([_, value]) => value != null && value !== "").map(([key, value]) => `${key}: ${value}`).join("; ");
}
class EntityIconTool extends BaseTool {
  constructor(argToolset, argConfig, argPos) {
    const DEFAULT_ICON_CONFIG = {
      classes: {
        tool: {
          "sak-icon": true,
          hover: true
        },
        icon: {
          "sak-icon__icon": true
        }
      },
      styles: {
        tool: {},
        icon: {}
      }
    };
    super(argToolset, Merge.mergeDeep(DEFAULT_ICON_CONFIG, argConfig), argPos);
    this.svg.iconSize = this.config.position.icon_size ? this.config.position.icon_size : 3;
    this.svg.iconPixels = this.svg.iconSize * FONT_SIZE;
    const align = this.config.position.align ? this.config.position.align : "center";
    const adjust = align === "center" ? 0.5 : align === "start" ? -1 : 1;
    const clientWidth = 400;
    const correction = clientWidth / this._card.viewBox.width;
    this.svg.xpx = this.svg.cx;
    this.svg.ypx = this.svg.cy;
    if ((this._card.isSafari || this._card.iOS) && !this._card.isSafari16) {
      this.svg.iconSize *= correction;
      this.svg.xpx = this.svg.xpx * correction - this.svg.iconPixels * adjust * correction;
      this.svg.ypx = this.svg.ypx * correction - this.svg.iconPixels * 0.5 * correction - this.svg.iconPixels * 0.25 * correction;
    } else {
      this.svg.xpx -= this.svg.iconPixels * adjust;
      this.svg.ypx = this.svg.ypx - this.svg.iconPixels * 0.5 - this.svg.iconPixels * 0.25;
    }
    this.classes.tool = {};
    this.classes.icon = {};
    this.styles.tool = {};
    this.styles.icon = {};
    if (this.dev.debug) console.log("EntityIconTool constructor coords, dimensions, config", this.coords, this.dimensions, this.config);
  }
  static {
    EntityIconTool.sakIconCache = {};
  }
  /** *****************************************************************************
  * EntityIconTool::_buildIcon()
  *
  * Summary.
  * Builds the Icon specification name.
  *
  */
  _buildIcon(entityState, entityConfig, toolIcon) {
    return this.activeAnimation?.icon || toolIcon || entityConfig?.icon || entityState?.attributes?.icon || stateIconName(entityState);
  }
  /** *****************************************************************************
  * EntityIconTool::_renderIcon()
  *
  * Summary.
  * Renders the icon using precalculated coordinates and dimensions.
  * Only the runtime style is calculated before rendering the icon
  *
  * THIS IS THE ONE!!!!
  */
  _renderIcon() {
    const icon = this._buildIcon(
      this._card.entities[this.defaultEntityIndex()],
      this.defaultEntityIndex() !== void 0 ? this._card.config.entities[this.defaultEntityIndex()] : void 0,
      this.config.icon
    );
    {
      this.svg.iconSize = this.config.position.icon_size ? this.config.position.icon_size : 2;
      this.svg.iconPixels = this.svg.iconSize * FONT_SIZE;
      this.svg.iconSize = this.config.position.icon_size ? this.config.position.icon_size : 2;
      this.svg.iconPixels = Utils.calculateSvgDimension(this.svg.iconSize);
      const align = this.config.position.align ? this.config.position.align : "center";
      const adjust = align === "center" ? 0.5 : align === "start" ? -1 : 1;
      const clientWidth = 400;
      const correction = clientWidth / this._card.viewBox.width;
      this.svg.xpx = this.svg.cx;
      this.svg.ypx = this.svg.cy;
      if ((this._card.isSafari || this._card.iOS) && !this._card.isSafari16) {
        this.svg.iconSize *= correction;
        this.svg.iconPixels *= correction;
        this.svg.xpx = this.svg.xpx * correction - this.svg.iconPixels * adjust * correction;
        this.svg.ypx = this.svg.ypx * correction - this.svg.iconPixels * 0.9 * correction;
        this.svg.xpx = this.svg.cx * correction - this.svg.iconPixels * adjust * correction;
        this.svg.ypx = this.svg.cy * correction - this.svg.iconPixels * adjust * correction;
      } else {
        this.svg.xpx = this.svg.cx - this.svg.iconPixels * adjust;
        this.svg.ypx = this.svg.cy - this.svg.iconPixels * adjust;
        if (this.dev.debug) console.log("EntityIconTool::_renderIcon - svg values =", this.toolId, this.svg, this.config.cx, this.config.cy, align, adjust);
      }
    }
    if (!this.alternateColor) {
      this.alternateColor = "rgba(0,0,0,0)";
    }
    if (!EntityIconTool.sakIconCache[icon]) {
      const theQuery = this._card.shadowRoot.getElementById("icon-".concat(this.toolId))?.shadowRoot?.querySelectorAll("*");
      if (theQuery) {
        this.iconSvg = theQuery[0]?.path;
      } else {
        this.iconSvg = void 0;
      }
      if (this.iconSvg) {
        EntityIconTool.sakIconCache[icon] = this.iconSvg;
      }
    } else {
      this.iconSvg = EntityIconTool.sakIconCache[icon];
    }
    let scale;
    if (this.iconSvg) {
      this.svg.iconSize = this.config.position.icon_size ? this.config.position.icon_size : 2;
      this.svg.iconPixels = Utils.calculateSvgDimension(this.svg.iconSize);
      this.svg.x1 = this.svg.cx - this.svg.iconPixels / 2;
      this.svg.y1 = this.svg.cy - this.svg.iconPixels / 2;
      this.svg.x1 = this.svg.cx - this.svg.iconPixels * 0.5;
      this.svg.y1 = this.svg.cy - this.svg.iconPixels * 0.5;
      scale = this.svg.iconPixels / 24;
      return svg`
        <g id="icon-${this.toolId}" class="${classMap$d(this.classes.icon)}" style="${styleMap$f(this.styles.icon)}" x="${this.svg.x1}px" y="${this.svg.y1}px" transform-origin="${this.svg.cx} ${this.svg.cy}">
          <rect x="${this.svg.x1}" y="${this.svg.y1}" height="${this.svg.iconPixels}px" width="${this.svg.iconPixels}px" stroke-width="0px" fill="rgba(0,0,0,0)"></rect>
          <path d="${this.iconSvg}" transform="translate(${this.svg.x1},${this.svg.y1}) scale(${scale})"></path>
        <g>
      `;
    } else {
      return svg`
        <foreignObject width="0px" height="0px" x="${this.svg.xpx}" y="${this.svg.ypx}" overflow="hidden">
          <body>
            <div class="div__icon, hover" xmlns="http://www.w3.org/1999/xhtml"
                style="line-height:${this.svg.iconPixels}px;position:relative;border-style:solid;border-width:0px;border-color:${this.alternateColor};fill:${this.alternateColor};color:${this.alternateColor};">
                <ha-icon icon=${icon} id="icon-${this.toolId}"
                @animationstart=${(e) => this._handleAnimationEvent(e, this)}
                @animationiteration=${(e) => this._handleAnimationEvent(e, this)}
                style="animation: flash 0.15s 20;"></ha-icon>
            </div>
          </body>
        </foreignObject>
        `;
    }
  }
  _handleAnimationEvent(argEvent, argThis) {
    argEvent.stopPropagation();
    argEvent.preventDefault();
    argThis.iconSvg = this._card.shadowRoot.getElementById("icon-".concat(this.toolId))?.shadowRoot?.querySelectorAll("*")[0]?.path;
    if (argThis.iconSvg) {
      argThis._card.requestUpdate();
    }
  }
  // eslint-disable-next-line no-unused-vars
  firstUpdated(changedProperties) {
  }
  /** *****************************************************************************
  * EntityIconTool::render()
  *
  * Summary.
  * The render() function for this object.
  *
  * NTS:
  * Adding        <style> div { overflow: hidden;}</style>
  * to the <g group, clips the icon against the ha-card, ie the div.
  * however, on Safari, all icons are clipped, as if they don't fit the room given to be displayed.
  * a bug in rendering the Icon?? Only first time icon is clipped, then displayed normally if a data update
  * from hass is coming in.
  */
  render() {
    this.MergeAnimationClassIfChanged();
    this.MergeAnimationStyleIfChanged();
    this.MergeColorFromState(this.styles.icon);
    return svg`
      <g "" id="icongrp-${this.toolId}" class="${classMap$d(this.classes.tool)}" style="${styleMap$f(this.styles.tool)}"
        @click=${(e) => this.handleTapEvent(e, this.config)} >

        ${this._renderIcon()}
      </g>
    `;
  }
}
function classMap$c(classes) {
  if (!classes) return "";
  return Object.entries(classes).filter(([_, value]) => value).map(([key, _]) => key).join(" ");
}
function styleMap$e(styles) {
  if (!styles) return "";
  return Object.entries(styles).filter(([_, value]) => value != null && value !== "").map(([key, value]) => `${key}: ${value}`).join("; ");
}
class EntityNameTool extends BaseTool {
  constructor(argToolset, argConfig, argPos) {
    const DEFAULT_NAME_CONFIG = {
      classes: {
        tool: {
          "sak-name": true,
          hover: true
        },
        name: {
          "sak-name__name": true
        }
      },
      styles: {
        tool: {},
        name: {}
      }
    };
    super(argToolset, Merge.mergeDeep(DEFAULT_NAME_CONFIG, argConfig), argPos);
    this._name = {};
    this.classes.tool = {};
    this.classes.name = {};
    this.styles.tool = {};
    this.styles.name = {};
    if (this.dev.debug) console.log("EntityName constructor coords, dimensions", this.coords, this.dimensions, this.svg, this.config);
  }
  /** *****************************************************************************
  * EntityNameTool::_buildName()
  *
  * Summary.
  * Builds the Name string.
  *
  */
  _buildName(entityState, entityConfig) {
    return this.activeAnimation?.name || entityConfig.name || entityState.attributes.friendly_name;
  }
  /** *****************************************************************************
  * EntityNameTool::_renderEntityName()
  *
  * Summary.
  * Renders the entity name using precalculated coordinates and dimensions.
  * Only the runtime style is calculated before rendering the name
  *
  */
  _renderEntityName() {
    this.MergeAnimationClassIfChanged();
    this.MergeColorFromState(this.styles.name);
    this.MergeAnimationStyleIfChanged();
    const name = this.textEllipsis(
      this._buildName(
        this._card.entities[this.defaultEntityIndex()],
        this._card.config.entities[this.defaultEntityIndex()]
      ),
      this.config?.show?.ellipsis
    );
    return svg`
        <text>
          <tspan class="${classMap$c(this.classes.name)}" x="${this.svg.cx}" y="${this.svg.cy}" style="${styleMap$e(this.styles.name)}">${name}</tspan>
        </text>
      `;
  }
  /** *****************************************************************************
  * EntityNameTool::render()
  *
  * Summary.
  * The render() function for this object.
  *
  */
  render() {
    return svg`
      <g id="name-${this.toolId}"
        class="${classMap$c(this.classes.tool)}" style="${styleMap$e(this.styles.tool)}"
        @click=${(e) => this.handleTapEvent(e, this.config)}>
        ${this._renderEntityName()}
      </g>
    `;
  }
}
var __assign = function() {
  __assign = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
        t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
var MS_PER_SECOND = 1e3;
var SECS_PER_MIN = 60;
var SECS_PER_HOUR = SECS_PER_MIN * 60;
var SECS_PER_DAY = SECS_PER_HOUR * 24;
var SECS_PER_WEEK = SECS_PER_DAY * 7;
function selectUnit(from, to, thresholds) {
  if (to === void 0) {
    to = Date.now();
  }
  if (thresholds === void 0) {
    thresholds = {};
  }
  var resolvedThresholds = __assign(__assign({}, DEFAULT_THRESHOLDS), thresholds || {});
  var secs = (+from - +to) / MS_PER_SECOND;
  if (Math.abs(secs) < resolvedThresholds.second) {
    return {
      value: Math.round(secs),
      unit: "second"
    };
  }
  var mins = secs / SECS_PER_MIN;
  if (Math.abs(mins) < resolvedThresholds.minute) {
    return {
      value: Math.round(mins),
      unit: "minute"
    };
  }
  var hours = secs / SECS_PER_HOUR;
  if (Math.abs(hours) < resolvedThresholds.hour) {
    return {
      value: Math.round(hours),
      unit: "hour"
    };
  }
  var days = secs / SECS_PER_DAY;
  if (Math.abs(days) < resolvedThresholds.day) {
    return {
      value: Math.round(days),
      unit: "day"
    };
  }
  var fromDate = new Date(from);
  var toDate = new Date(to);
  var years = fromDate.getFullYear() - toDate.getFullYear();
  if (Math.round(Math.abs(years)) > 0) {
    return {
      value: Math.round(years),
      unit: "year"
    };
  }
  var months = years * 12 + fromDate.getMonth() - toDate.getMonth();
  if (Math.round(Math.abs(months)) > 0) {
    return {
      value: Math.round(months),
      unit: "month"
    };
  }
  var weeks = secs / SECS_PER_WEEK;
  return {
    value: Math.round(weeks),
    unit: "week"
  };
}
var DEFAULT_THRESHOLDS = {
  second: 45,
  minute: 45,
  hour: 22,
  day: 5
};
var NumberFormat;
(function(NumberFormat2) {
  NumberFormat2.language = "language";
  NumberFormat2.system = "system";
  NumberFormat2.comma_decimal = "comma_decimal";
  NumberFormat2.decimal_comma = "decimal_comma";
  NumberFormat2.space_comma = "space_comma";
  NumberFormat2.none = "none";
})(NumberFormat = NumberFormat || (NumberFormat = {}));
const round = (value, precision = 2) => Math.round(value * 10 ** precision) / 10 ** precision;
const numberFormatToLocale = (localeOptions) => {
  switch (localeOptions.number_format) {
    case NumberFormat.comma_decimal:
      return ["en-US", "en"];
    case NumberFormat.decimal_comma:
      return ["de", "es", "it"];
    case NumberFormat.space_comma:
      return ["fr", "sv", "cs"];
    case NumberFormat.system:
      return void 0;
    default:
      return localeOptions.language;
  }
};
const formatNumber = (num, localeOptions, options) => {
  const locale = localeOptions ? numberFormatToLocale(localeOptions) : void 0;
  Number.isNaN = Number.isNaN || function isNaN2(input) {
    return typeof input === "number" && isNaN2(input);
  };
  if (localeOptions?.number_format !== NumberFormat.none && !Number.isNaN(Number(num)) && Intl) {
    try {
      return new Intl.NumberFormat(
        locale,
        getDefaultFormatOptions(num, options)
      ).format(Number(num));
    } catch (err) {
      console.error(err);
      return new Intl.NumberFormat(
        void 0,
        getDefaultFormatOptions(num, options)
      ).format(Number(num));
    }
  }
  if (!Number.isNaN(Number(num)) && num !== "" && localeOptions?.number_format === NumberFormat.none && Intl) {
    return new Intl.NumberFormat(
      "en-US",
      getDefaultFormatOptions(num, {
        ...options,
        useGrouping: false
      })
    ).format(Number(num));
  }
  if (typeof num === "string") {
    return num;
  }
  return `${round(num, options?.maximumFractionDigits).toString()}${options?.style === "currency" ? ` ${options.currency}` : ""}`;
};
const getDefaultFormatOptions = (num, options) => {
  const defaultOptions = {
    maximumFractionDigits: 2,
    ...options
  };
  if (typeof num !== "string") {
    return defaultOptions;
  }
  if (!options || options.minimumFractionDigits === void 0 && options.maximumFractionDigits === void 0) {
    const digits = num.indexOf(".") > -1 ? num.split(".")[1].length : 0;
    defaultOptions.minimumFractionDigits = digits;
    defaultOptions.maximumFractionDigits = digits;
  }
  return defaultOptions;
};
var safeIsNaN = Number.isNaN || function ponyfill(value) {
  return typeof value === "number" && value !== value;
};
function isEqual(first, second) {
  if (first === second) {
    return true;
  }
  if (safeIsNaN(first) && safeIsNaN(second)) {
    return true;
  }
  return false;
}
function areInputsEqual(newInputs, lastInputs) {
  if (newInputs.length !== lastInputs.length) {
    return false;
  }
  for (var i = 0; i < newInputs.length; i++) {
    if (!isEqual(newInputs[i], lastInputs[i])) {
      return false;
    }
  }
  return true;
}
function memoizeOne(resultFn, isEqual2) {
  if (isEqual2 === void 0) {
    isEqual2 = areInputsEqual;
  }
  var cache2 = null;
  function memoized() {
    var newArgs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      newArgs[_i] = arguments[_i];
    }
    if (cache2 && cache2.lastThis === this && isEqual2(newArgs, cache2.lastArgs)) {
      return cache2.lastResult;
    }
    var lastResult = resultFn.apply(this, newArgs);
    cache2 = {
      lastResult,
      lastArgs: newArgs,
      lastThis: this
    };
    return lastResult;
  }
  memoized.clear = function clear() {
    cache2 = null;
  };
  return memoized;
}
const formatDateWeekdayDay = (dateObj, locale) => formatDateWeekdayDayMem(locale).format(dateObj);
const formatDateWeekdayDayMem = memoizeOne(
  (locale) => new Intl.DateTimeFormat(locale.language, {
    weekday: "long",
    month: "long",
    day: "numeric"
  })
);
const formatDate = (dateObj, locale) => formatDateMem(locale).format(dateObj);
const formatDateMem = memoizeOne(
  (locale) => new Intl.DateTimeFormat(locale.language, {
    year: "numeric",
    month: "long",
    day: "numeric"
  })
);
const formatDateNumeric = (dateObj, locale) => formatDateNumericMem(locale).format(dateObj);
const formatDateNumericMem = memoizeOne(
  (locale) => new Intl.DateTimeFormat(locale.language, {
    year: "numeric",
    month: "numeric",
    day: "numeric"
  })
);
const formatDateShort = (dateObj, locale) => formatDateShortMem(locale).format(dateObj);
const formatDateShortMem = memoizeOne(
  (locale) => new Intl.DateTimeFormat(locale.language, {
    day: "numeric",
    month: "short"
  })
);
const formatDateMonthYear = (dateObj, locale) => formatDateMonthYearMem(locale).format(dateObj);
const formatDateMonthYearMem = memoizeOne(
  (locale) => new Intl.DateTimeFormat(locale.language, {
    month: "long",
    year: "numeric"
  })
);
const formatDateMonth = (dateObj, locale) => formatDateMonthMem(locale).format(dateObj);
const formatDateMonthMem = memoizeOne(
  (locale) => new Intl.DateTimeFormat(locale.language, {
    month: "long"
  })
);
memoizeOne(
  (locale) => new Intl.DateTimeFormat(locale.language, {
    year: "numeric"
  })
);
const formatDateWeekday = (dateObj, locale) => formatDateWeekdayMem(locale).format(dateObj);
const formatDateWeekdayMem = memoizeOne(
  (locale) => new Intl.DateTimeFormat(locale.language, {
    weekday: "long"
  })
);
const formatDateWeekdayShort = (dateObj, locale) => formatDateWeekdayShortMem(locale).format(dateObj);
const formatDateWeekdayShortMem = memoizeOne(
  (locale) => new Intl.DateTimeFormat(locale.language, {
    weekday: "short"
  })
);
var TimeFormat;
(function(TimeFormat2) {
  TimeFormat2.language = "language";
  TimeFormat2.system = "system";
  TimeFormat2.am_pm = "12";
  TimeFormat2.twenty_four = "24";
})(TimeFormat = TimeFormat || (TimeFormat = {}));
const useAmPm = memoizeOne((locale) => {
  if (locale.time_format === TimeFormat.language || locale.time_format === TimeFormat.system) {
    const testLanguage = locale.time_format === TimeFormat.language ? locale.language : void 0;
    const test = (/* @__PURE__ */ new Date()).toLocaleString(testLanguage);
    return test.includes("AM") || test.includes("PM");
  }
  return locale.time_format === TimeFormat.am_pm;
});
const formatTime = (dateObj, locale) => formatTimeMem(locale).format(dateObj);
const formatTimeMem = memoizeOne(
  (locale) => new Intl.DateTimeFormat(
    locale.language === "en" && !useAmPm(locale) ? "en-u-hc-h23" : locale.language,
    {
      hour: "numeric",
      minute: "2-digit",
      hour12: useAmPm(locale)
    }
  )
);
const formatTimeWithSeconds = (dateObj, locale) => formatTimeWithSecondsMem(locale).format(dateObj);
const formatTimeWithSecondsMem = memoizeOne(
  (locale) => new Intl.DateTimeFormat(
    locale.language === "en" && !useAmPm(locale) ? "en-u-hc-h23" : locale.language,
    {
      hour: useAmPm(locale) ? "numeric" : "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: useAmPm(locale)
    }
  )
);
const formatTimeWeekday = (dateObj, locale) => formatTimeWeekdayMem(locale).format(dateObj);
const formatTimeWeekdayMem = memoizeOne(
  (locale) => new Intl.DateTimeFormat(
    locale.language === "en" && !useAmPm(locale) ? "en-u-hc-h23" : locale.language,
    {
      weekday: "long",
      hour: useAmPm(locale) ? "numeric" : "2-digit",
      minute: "2-digit",
      hour12: useAmPm(locale)
    }
  )
);
const formatTime24h = (dateObj) => formatTime24hMem().format(dateObj);
const formatTime24hMem = memoizeOne(
  () => (
    // en-GB to fix Chrome 24:59 to 0:59 https://stackoverflow.com/a/60898146
    // eslint-disable-next-line implicit-arrow-linebreak
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: false
    })
  )
);
const formatDateTime = (dateObj, locale) => formatDateTimeMem(locale).format(dateObj);
const formatDateTimeMem = memoizeOne(
  (locale) => new Intl.DateTimeFormat(
    locale.language === "en" && !useAmPm(locale) ? "en-u-hc-h23" : locale.language,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: useAmPm(locale) ? "numeric" : "2-digit",
      minute: "2-digit",
      hour12: useAmPm(locale)
    }
  )
);
const formatShortDateTimeWithYear = (dateObj, locale) => formatShortDateTimeWithYearMem(locale).format(dateObj);
const formatShortDateTimeWithYearMem = memoizeOne(
  (locale) => new Intl.DateTimeFormat(
    locale.language === "en" && !useAmPm(locale) ? "en-u-hc-h23" : locale.language,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: useAmPm(locale) ? "numeric" : "2-digit",
      minute: "2-digit",
      hour12: useAmPm(locale)
    }
  )
);
const formatShortDateTime = (dateObj, locale) => formatShortDateTimeMem(locale).format(dateObj);
const formatShortDateTimeMem = memoizeOne(
  (locale) => new Intl.DateTimeFormat(
    locale.language === "en" && !useAmPm(locale) ? "en-u-hc-h23" : locale.language,
    {
      month: "short",
      day: "numeric",
      hour: useAmPm(locale) ? "numeric" : "2-digit",
      minute: "2-digit",
      hour12: useAmPm(locale)
    }
  )
);
const formatDateTimeWithSeconds = (dateObj, locale) => formatDateTimeWithSecondsMem(locale).format(dateObj);
const formatDateTimeWithSecondsMem = memoizeOne(
  (locale) => new Intl.DateTimeFormat(
    locale.language === "en" && !useAmPm(locale) ? "en-u-hc-h23" : locale.language,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: useAmPm(locale) ? "numeric" : "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: useAmPm(locale)
    }
  )
);
const formatDateTimeNumeric = (dateObj, locale) => formatDateTimeNumericMem(locale).format(dateObj);
const formatDateTimeNumericMem = memoizeOne(
  (locale) => new Intl.DateTimeFormat(
    locale.language === "en" && !useAmPm(locale) ? "en-u-hc-h23" : locale.language,
    {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: useAmPm(locale)
    }
  )
);
const leftPad = (num, digits = 2) => {
  let paddedNum = `${num}`;
  for (let i = 1; i < digits; i++) {
    paddedNum = parseInt(paddedNum) < 10 ** i ? `0${paddedNum}` : paddedNum;
  }
  return paddedNum;
};
function millisecondsToDuration(d2) {
  const h = Math.floor(d2 / 1e3 / 3600);
  const m = Math.floor(d2 / 1e3 % 3600 / 60);
  const s = Math.floor(d2 / 1e3 % 3600 % 60);
  const ms = Math.floor(d2 % 1e3);
  if (h > 0) {
    return `${h}:${leftPad(m)}:${leftPad(s)}`;
  }
  if (m > 0) {
    return `${m}:${leftPad(s)}`;
  }
  if (s > 0 || ms > 0) {
    return `${s}${ms > 0 ? `.${leftPad(ms, 3)}` : ""}`;
  }
  return null;
}
const DAY_IN_MILLISECONDS = 864e5;
const HOUR_IN_MILLISECONDS = 36e5;
const MINUTE_IN_MILLISECONDS = 6e4;
const SECOND_IN_MILLISECONDS = 1e3;
const UNIT_TO_MILLISECOND_CONVERT = {
  ms: 1,
  s: SECOND_IN_MILLISECONDS,
  min: MINUTE_IN_MILLISECONDS,
  h: HOUR_IN_MILLISECONDS,
  d: DAY_IN_MILLISECONDS
};
const formatDuration = (duration, units) => millisecondsToDuration(
  parseFloat(duration) * UNIT_TO_MILLISECOND_CONVERT[units]
) || "0";
function classMap$b(classes) {
  if (!classes) return "";
  return Object.entries(classes).filter(([_, value]) => value).map(([key, _]) => key).join(" ");
}
function styleMap$d(styles) {
  if (!styles) return "";
  return Object.entries(styles).filter(([_, value]) => value != null && value !== "").map(([key, value]) => `${key}: ${value}`).join("; ");
}
class EntityStateTool extends BaseTool {
  constructor(argToolset, argConfig, argPos) {
    const DEFAULT_STATE_CONFIG = {
      show: { uom: "end" },
      classes: {
        tool: {
          "sak-state": true,
          hover: true
        },
        state: {
          "sak-state__value": true
        },
        uom: {
          "sak-state__uom": true
        }
      },
      styles: {
        tool: {},
        state: {},
        uom: {}
      }
    };
    super(argToolset, Merge.mergeDeep(DEFAULT_STATE_CONFIG, argConfig), argPos);
    this.classes.tool = {};
    this.classes.state = {};
    this.classes.uom = {};
    this.styles.tool = {};
    this.styles.state = {};
    this.styles.uom = {};
    if (this.dev.debug) console.log("EntityStateTool constructor coords, dimensions", this.coords, this.dimensions, this.svg, this.config);
  }
  static testTimeDate = false;
  // EntityStateTool::value
  set value(state) {
    super.value = state;
  }
  formatStateString(inState, entityConfig) {
    const lang = this._card._hass.selectedLanguage || this._card._hass.language;
    let locale = {};
    locale.language = lang;
    if ([
      "relative",
      "total",
      "datetime",
      "datetime-short",
      "datetime-short_with-year",
      "datetime_seconds",
      "datetime-numeric",
      "date",
      "date_month",
      "date_month_year",
      "date-short",
      "date-numeric",
      "date_weekday",
      "date_weekday_day",
      "date_weekday-short",
      "time",
      "time-24h",
      "time-24h_date-short",
      "time_weekday",
      "time_seconds"
    ].includes(entityConfig.format)) {
      const timestamp = new Date(inState);
      if (!(timestamp instanceof Date) || isNaN(timestamp.getTime())) {
        return inState;
      }
      let retValue;
      switch (entityConfig.format) {
        case "relative":
          const diff = selectUnit(timestamp, /* @__PURE__ */ new Date());
          retValue = new Intl.RelativeTimeFormat(lang, { numeric: "auto" }).format(diff.value, diff.unit);
          break;
        case "total":
        case "precision":
          retValue = "Not Yet Supported";
          break;
        case "datetime":
          retValue = formatDateTime(timestamp, locale);
          break;
        case "datetime-short":
          retValue = formatShortDateTime(timestamp, locale);
          break;
        case "datetime-short_with-year":
          retValue = formatShortDateTimeWithYear(timestamp, locale);
          break;
        case "datetime_seconds":
          retValue = formatDateTimeWithSeconds(timestamp, locale);
          break;
        case "datetime-numeric":
          retValue = formatDateTimeNumeric(timestamp, locale);
          break;
        case "date":
          retValue = formatDate(timestamp, locale);
          break;
        case "date_month":
          retValue = formatDateMonth(timestamp, locale);
          break;
        case "date_month_year":
          retValue = formatDateMonthYear(timestamp, locale);
          break;
        case "date-short":
          retValue = formatDateShort(timestamp, locale);
          break;
        case "date-numeric":
          retValue = formatDateNumeric(timestamp, locale);
          break;
        case "date_weekday":
          retValue = formatDateWeekday(timestamp, locale);
          break;
        case "date_weekday-short":
          retValue = formatDateWeekdayShort(timestamp, locale);
          break;
        case "date_weekday_day":
          retValue = formatDateWeekdayDay(timestamp, locale);
          break;
        case "time":
          retValue = formatTime(timestamp, locale);
          break;
        case "time-24h":
          retValue = formatTime24h(timestamp);
          break;
        case "time-24h_date-short":
          const diff2 = selectUnit(timestamp, /* @__PURE__ */ new Date());
          if (["second", "minute", "hour"].includes(diff2.unit)) {
            retValue = formatTime24h(timestamp);
          } else {
            retValue = formatDateShort(timestamp, locale);
          }
          break;
        case "time_weekday":
          retValue = formatTimeWeekday(timestamp, locale);
          break;
        case "time_seconds":
          retValue = formatTimeWithSeconds(timestamp, locale);
          break;
      }
      return retValue;
    }
    if (isNaN(parseFloat(inState)) || !isFinite(inState)) {
      return inState;
    }
    if (entityConfig.format === "brightness" || entityConfig.format === "brightness_pct") {
      return `${Math.round(inState / 255 * 100)} %`;
    }
    if (entityConfig.format === "duration") {
      return formatDuration(inState, "s");
    }
  }
  _renderState() {
    this.MergeAnimationClassIfChanged();
    this.MergeAnimationStyleIfChanged();
    this.MergeColorFromState(this.styles.state);
    let inState = this._stateValue;
    const stateObj = this._card.entities[this.defaultEntityIndex()];
    if (stateObj === void 0) return svg``;
    if ([void 0, "undefined"].includes(inState)) {
      return svg``;
    }
    if (inState === void 0) return svg``;
    const entity = this._card._hass.entities[stateObj.entity_id];
    const entity2 = this._card._hass.states[stateObj.entity_id];
    const entityConfig = this._card.config.entities[this.defaultEntityIndex()];
    const domain = computeDomain(this._card.entities[this.defaultEntityIndex()].entity_id);
    const localeTag = this.config.locale_tag ? this.config.locale_tag + inState.toLowerCase() : void 0;
    if (entityConfig.format !== void 0 && typeof inState !== "undefined") {
      inState = this.formatStateString(inState, entityConfig);
    }
    if (inState && isNaN(inState) && !entityConfig.secondary_info || entityConfig.attribute) {
      inState = localeTag && this._card._hass.localize(localeTag) || entity?.translation_key && this._card._hass.localize(
        `component.${entity.platform}.entity.${domain}.${entity.translation_key}.state.${inState}`
      ) || entity2?.attributes?.device_class && this._card._hass.localize(
        `component.${domain}.entity_component.${entity2.attributes.device_class}.state.${inState}`
      ) || this._card._hass.localize(`component.${domain}.entity_component._.state.${inState}`) || inState;
      inState = this.textEllipsis(inState, this.config?.show?.ellipsis);
    }
    if (["undefined", "unknown", "unavailable", "-ua-"].includes(inState)) {
      inState = this._card._hass.localize(`state.default.${inState}`);
    }
    if (!isNaN(inState)) {
      let options = {};
      options = getDefaultFormatOptions(inState, options);
      if (this._card.config.entities[this.defaultEntityIndex()].decimals !== void 0) {
        options.maximumFractionDigits = this._card.config.entities[this.defaultEntityIndex()].decimals;
        options.minimumFractionDigits = options.maximumFractionDigits;
      }
      let renderNumber = formatNumber(inState, this._card._hass.locale, options);
      inState = renderNumber;
    }
    return svg`
      <tspan class="${classMap$b(this.classes.state)}" x="${this.svg.x}" y="${this.svg.y}"
        style="${styleMap$d(this.styles.state)}">
        ${this.config?.text?.before ? this.config.text.before : ""}${inState}${this.config?.text?.after ? this.config.text.after : ""}</tspan>
    `;
  }
  _renderUom() {
    if (this.config.show.uom === "none" || typeof this._stateValue === "undefined") {
      return svg``;
    } else {
      this.MergeAnimationClassIfChanged();
      this.MergeAnimationStyleIfChanged();
      this.MergeColorFromState(this.styles.uom);
      let fsuomStr = this.styles.state["font-size"];
      let fsuomValue = 0.5;
      let fsuomType = "em";
      const fsuomSplit = fsuomStr.match(/\D+|\d*\.?\d+/g);
      if (fsuomSplit.length === 2) {
        fsuomValue = Number(fsuomSplit[0]) * 0.6;
        fsuomType = fsuomSplit[1];
      } else console.error("Cannot determine font-size for state/unit", fsuomStr);
      fsuomStr = { "font-size": fsuomValue + fsuomType };
      this.styles.uom = Merge.mergeDeep(this.config.styles.uom, this.styles.uom, fsuomStr);
      const uom = this._card._buildUom(this.derivedEntity, this._card.entities[this.defaultEntityIndex()], this._card.config.entities[this.defaultEntityIndex()]);
      if (this.config.show.uom === "end") {
        return svg`
          <tspan class="${classMap$b(this.classes.uom)}" dx="-0.1em" dy="-0.35em"
            style="${styleMap$d(this.styles.uom)}">
            ${uom}</tspan>
        `;
      } else if (this.config.show.uom === "bottom") {
        return svg`
          <tspan class="${classMap$b(this.classes.uom)}" x="${this.svg.x}" dy="1.5em"
            style="${styleMap$d(this.styles.uom)}">
            ${uom}</tspan>
        `;
      } else if (this.config.show.uom === "top") {
        return svg`
          <tspan class="${classMap$b(this.classes.uom)}" x="${this.svg.x}" dy="-1.5em"
            style="${styleMap$d(this.styles.uom)}">
            ${uom}</tspan>
        `;
      } else {
        return svg``;
      }
    }
  }
  // eslint-disable-next-line no-unused-vars
  firstUpdated(changedProperties) {
  }
  // eslint-disable-next-line no-unused-vars
  updated(changedProperties) {
  }
  render() {
    {
      return svg`
    <svg overflow="visible" id="state-${this.toolId}"
      class="${classMap$b(this.classes.tool)}" style="${styleMap$d(this.styles.tool)}">
        <text @click=${(e) => this.handleTapEvent(e, this.config)}>
          ${this._renderState()}
          ${this._renderUom()}
        </text>
      </svg>
      `;
    }
  }
  // render()
}
const X = 0;
const Y = 1;
const V = 2;
const Y2 = 3;
const RX = 4;
const RY = 5;
const ONE_HOUR = 1e3 * 3600;
class SparklineGraph {
  constructor(width, height, margin, config, gradeValues = [], gradeRanks = [], stateMap = {}) {
    this.aggregateFuncMap = {
      avg: this._average,
      median: this._median,
      max: this._maximum,
      min: this._minimum,
      first: this._first,
      last: this._last,
      sum: this._sum,
      delta: this._delta,
      diff: this._diff
    };
    this.config = config;
    this.graphArea = {};
    this.graphArea.x = 0;
    this.graphArea.y = 0;
    this.graphArea.width = width - 2 * this.graphArea.x;
    this.graphArea.height = height - 2 * this.graphArea.y;
    this.drawArea = {};
    this.drawArea.x = margin.l;
    this.drawArea.y = margin.t;
    this.drawArea.top = margin.t;
    this.drawArea.bottom = margin.b;
    this.drawArea.width = width - (margin.l + margin.r);
    this.drawArea.height = height - (margin.t + margin.b);
    this._history = void 0;
    this.coords = [];
    this.width = width;
    this.height = height;
    this.margin = margin;
    this._max = 0;
    this._min = 0;
    this.points = this.config.period?.calendar?.bins?.per_hour || this.config.period?.rolling_window?.bins?.per_hour || 1;
    this.hours = this.config.period?.calendar?.duration?.hour || this.config.period?.rolling_window?.duration?.hour || 24;
    this.aggregateFuncName = this.config.sparkline.state_values.aggregate_func;
    this._calcPoint = this.aggregateFuncMap[this.aggregateFuncName] || this._average;
    this._smoothing = this.config.sparkline.state_values?.smoothing;
    this._logarithmic = this.config.sparkline.state_values?.logarithmic;
    this._groupBy = this.config.period.groupBy;
    this._endTime = 0;
    this.valuesPerBucket = 0;
    this.levelCount = 1;
    this.gradeValues = gradeValues;
    this.gradeRanks = gradeRanks;
    this.stateMap = { ...stateMap };
    this.radialBarcodeSize = Utils.calculateSvgDimension(this.config.sparkline?.radial_barcode?.size || 5);
  }
  get max() {
    return this._max;
  }
  set max(max) {
    this._max = max;
  }
  get min() {
    return this._min;
  }
  set min(min) {
    this._min = min;
  }
  set history(data) {
    this._history = data;
  }
  update(history = void 0) {
    if (history) {
      this._history = history;
    }
    if (!this._history) return;
    if (this._history?.length === 0) return;
    this._updateEndTime();
    let date = /* @__PURE__ */ new Date();
    date.getDate();
    this.offsetHours = 0;
    if (this.config.period?.calendar?.period === "day") {
      date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
      this.offsetHours = Math.abs(this.config.period.calendar.offset * 24);
    }
    const histGroups = this._history.reduce((res, item) => this._reducer(res, item), []);
    if (histGroups[0] && histGroups[0].length) {
      histGroups[0] = [histGroups[0][histGroups[0].length - 1]];
    }
    let requiredNumOfPoints;
    this.offsetHours = 0;
    switch (this.config.period.type) {
      case "real_time":
        requiredNumOfPoints = 1;
        this.hours = 1;
        break;
      case "calendar":
        if (this.config.period?.calendar?.period === "day") {
          let hours = this.hours;
          if (this.config.period.calendar.offset === 0) {
            hours = date.getHours() + date.getMinutes() / 60;
          } else {
            this.offsetHours = Math.abs(this.config.period.calendar.offset * 24);
          }
          requiredNumOfPoints = Math.ceil(hours * this.points);
        }
        break;
      case "rolling_window":
        requiredNumOfPoints = Math.ceil(this.hours * this.points);
        break;
    }
    histGroups.length = requiredNumOfPoints;
    try {
      this.coords = this._calcPoints(histGroups);
    } catch (error) {
      console.log("error in calcpoints");
    }
    this.min = Math.min(...this.coords.map((item) => Number(item[V])));
    this.max = Math.max(...this.coords.map((item) => Number(item[V])));
    if (["line", "area"].includes(this.config.sparkline.show.chart_type) && (this.config.sparkline.line?.show_minmax === true || this.config.sparkline.area?.show_minmax === true)) {
      const histGroupsMinMax = this._history.reduce((res, item) => this._reducerMinMax(res, item), []);
      if (histGroupsMinMax[0][0] && histGroupsMinMax[0][0].length) {
        histGroupsMinMax[0][0] = [histGroupsMinMax[0][0][histGroupsMinMax[0][0].length - 1]];
      }
      if (histGroupsMinMax[1][0] && histGroupsMinMax[1][0].length) {
        histGroupsMinMax[1][0] = [histGroupsMinMax[1][0][histGroupsMinMax[1][0].length - 1]];
      }
      histGroupsMinMax[0].length = requiredNumOfPoints;
      histGroupsMinMax[1].length = requiredNumOfPoints;
      const histGroupsMin = [...histGroups];
      const histGroupsMax = [...histGroups];
      let prevFunction = this._calcPoint;
      this._calcPoint = this.aggregateFuncMap.min;
      this.coordsMin = [];
      this.coordsMin = this._calcPoints(histGroupsMin);
      this._calcPoint = this.aggregateFuncMap.max;
      this.coordsMax = [];
      this.coordsMax = this._calcPoints(histGroupsMax);
      this._calcPoint = prevFunction;
      this.min = Math.min(...this.coordsMin.map((item) => Number(item[V])));
      this.max = Math.max(...this.coordsMax.map((item) => Number(item[V])));
    }
  }
  // This reducer calculates the min and max in a bucket. This is the REAL min and max
  // The other functions calculate the min and max from the function used (mostly avg)!!
  // This real min/max could be used to show the min/max graph on the background. Some filled
  // graph would be nice. That would mean we calculate each point (per bucket) and connect the
  // first point of the min/max array, and the last point of the min/max array.
  //
  // Array should be changed to [0][key], so we can pass the res[0] to some function to calculate
  // the resulting points. Must in that case also pass the function, ie max or min. Not the default
  // function, as that would give us (again) possible the avg...
  //
  // It could run with a single reducer, if using [0] for the buckets to calculate the function
  // and [1] for min, and [2] for max value in that bucket...
  _reducerMinMax(res, item) {
    const age = this._endTime - new Date(item.last_changed).getTime();
    const interval = age / ONE_HOUR * this.points - this.hours * this.points;
    const key = interval < 0 ? Math.floor(Math.abs(interval)) : 0;
    if (!res[0]) res[0] = [];
    if (!res[1]) res[1] = [];
    if (!res[0][key]) {
      res[0][key] = {};
      res[1][key] = {};
    }
    res[0][key].state = Math.min(res[0][key].state ? res[0][key].state : Number.POSITIVE_INFINITY, item.state);
    res[0][key].haState = Math.min(res[0][key].haState ? res[0][key].haState : Number.POSITIVE_INFINITY, item.haState);
    res[1][key].state = Math.max(res[1][key].state ? res[0][key].state : Number.NEGATIVE_INFINITY, item.state);
    res[1][key].haState = Math.max(res[1][key].haState ? res[0][key].haState : Number.NEGATIVE_INFINITY, item.haState);
    return res;
  }
  // #TODO @2023.07.26:
  // The reducer should not have to check for hours. This wasn't required some changes ago
  // Must be looked in to...
  _reducer(res, item) {
    const hours = this.config.period?.calendar?.period === "day" ? this.config.period.calendar.offset === 0 ? (/* @__PURE__ */ new Date()).getHours() + (/* @__PURE__ */ new Date()).getMinutes() / 60 : 24 : this.hours;
    const age = this._endTime - new Date(item.last_changed).getTime();
    const interval = age / ONE_HOUR * this.points - hours * this.points;
    const key = interval < 0 ? Math.floor(Math.abs(interval)) : 0;
    if (!res[key]) res[key] = [];
    res[key].push(item);
    return res;
  }
  _calcPoints(history) {
    const coords = [];
    let xRatio = this.drawArea.width / (this.hours * this.points - 1);
    xRatio = Number.isFinite(xRatio) ? xRatio : this.drawArea.width;
    const first = history.filter(Boolean)[0];
    let last = [this._calcPoint(first), this._lastValue(first)];
    const getCoords = (item, i) => {
      const x = xRatio * i + this.drawArea.x;
      if (item)
        last = [this._calcPoint(item), this._lastValue(item)];
      return coords.push([x, 0, item ? last[0] : last[1]]);
    };
    for (let i = 0; i < history.length; i += 1)
      getCoords(history[i], i);
    return coords;
  }
  _calcY(coords) {
    const max = this._logarithmic ? Math.log10(Math.max(1, this.max)) : this.max;
    const min = this._logarithmic ? Math.log10(Math.max(1, this.min)) : this.min;
    const yRatio = (max - min) / this.drawArea.height || 1;
    const coords2 = coords.map((coord) => {
      const val = this._logarithmic ? Math.log10(Math.max(1, coord[V])) : coord[V];
      const offset = min < 0 ? Math.abs(min) : 0;
      const val0 = val > 0 ? val - Math.max(0, min) : 0;
      this.drawArea.height + this.drawArea.y - val0 / yRatio;
      const coordY2 = val > 0 ? this.drawArea.height + this.drawArea.top * 1 - offset / yRatio - (val - Math.max(0, min)) / yRatio : this.drawArea.height + this.drawArea.top * 1 - (0 - min) / yRatio;
      const coordY = this.drawArea.height + this.drawArea.y * 1 - (val - min) / yRatio;
      return [coord[X], coordY, coord[V], coordY2];
    });
    return coords2;
  }
  // Calculate y coordinate for level stuff
  // The calculated y coordinate is the TOP y coodinate of the rectangle to be displayed
  _calcLevelY(coord) {
    const max = this._logarithmic ? Math.log10(Math.max(1, this.max)) : this.max;
    const min = this._logarithmic ? Math.log10(Math.max(1, this.min)) : this.min;
    const yRatio = (max - min) / this.drawArea.height || 1;
    const offset = min < 0 ? Math.abs(min) : 0;
    let yStack = [];
    coord[V].forEach((val, index) => {
      const coordY = val >= 0 ? this.drawArea.height + this.drawArea.top * 1 - 1 * offset / yRatio - (val - Math.max(0, min)) / yRatio : this.drawArea.height + this.drawArea.top * 1 - (0 - val) / yRatio;
      yStack.push(coordY);
      return yStack;
    });
    return yStack;
  }
  getPoints() {
    let { coords } = this;
    if (coords.length === 1) {
      coords[1] = [this.width + this.margin.x, 0, coords[0][V]];
    }
    coords = this._calcY(this.coords);
    let next;
    let Z;
    let last = coords[0];
    coords.shift();
    const coords2 = coords.map((point, i) => {
      next = point;
      Z = this._smoothing ? this._midPoint(last[X], last[Y], next[X], next[Y]) : next;
      const sum = this._smoothing ? (next[V] + last[V]) / 2 : next[V];
      last = next;
      return [Z[X], Z[Y], sum, i + 1];
    });
    return coords2;
  }
  getPath() {
    let { coords } = this;
    if (coords.length === 1) {
      coords[1] = [this.width + this.margin.x, 0, coords[0][V]];
    }
    coords = this._calcY(this.coords);
    let next;
    let Z;
    let path = "";
    let last = coords[0];
    path += `M${last[X]},${last[Y]}`;
    coords.forEach((point) => {
      next = point;
      Z = this._smoothing ? this._midPoint(last[X], last[Y], next[X], next[Y]) : next;
      path += ` ${Z[X]},${Z[Y]}`;
      path += ` Q ${next[X]},${next[Y]}`;
      last = next;
    });
    path += ` ${next[X]},${next[Y]}`;
    return path;
  }
  getPathMin() {
    let { coordsMin } = this;
    if (coordsMin.length === 1) {
      coordsMin[1] = [this.width + this.margin.x, 0, coordsMin[0][V]];
    }
    coordsMin = this._calcY(this.coordsMin);
    let next;
    let Z;
    let path = "";
    let last = coordsMin[0];
    path += `M${last[X]},${last[Y]}`;
    coordsMin.forEach((point) => {
      next = point;
      Z = next;
      path += ` ${Z[X]},${Z[Y]}`;
      path += ` Q ${next[X]},${next[Y]}`;
      last = next;
    });
    path += ` ${next[X]},${next[Y]}`;
    return path;
  }
  // Get this in reverse...
  getPathMax() {
    let { coordsMax } = this;
    if (coordsMax.length === 1) {
      coordsMax[1] = [this.width + this.margin.x, 0, coordsMax[0][V]];
    }
    coordsMax = this._calcY(this.coordsMax);
    let next;
    let Z;
    let path = "";
    let last = coordsMax[coordsMax.length - 1];
    coordsMax.reverse().forEach((point, index, points) => {
      next = point;
      Z = next;
      path += ` ${Z[X]},${Z[Y]}`;
      path += ` Q ${next[X]},${next[Y]}`;
      last = next;
    });
    path += ` ${next[X]},${next[Y]}`;
    path += `M${last[X]},${last[Y]}`;
    return path;
  }
  computeGradient(thresholds, logarithmic) {
    const scale = logarithmic ? Math.log10(Math.max(1, this._max)) - Math.log10(Math.max(1, this._min)) : this._max - this._min;
    const scaleOffset = scale / (this.graphArea.height - this.margin.b) * this.graphArea.height - scale;
    return thresholds.map((stop, index, arr) => {
      let color;
      if (stop.value > this._max && arr[index + 1]) {
        const factor = (this._max - arr[index + 1].value) / (stop.value - arr[index + 1].value);
        color = Colors.getGradientValue(arr[index + 1].color, stop.color, factor);
      } else if (stop.value < this._min && arr[index - 1]) {
        const factor = (arr[index - 1].value - this._min) / (arr[index - 1].value - stop.value);
        color = Colors.getGradientValue(arr[index - 1].color, stop.color, factor);
      }
      let offset;
      if (scale <= 0) {
        offset = 0;
      } else if (logarithmic) {
        offset = (Math.log10(Math.max(1, this._max)) - Math.log10(Math.max(1, stop.value))) * (100 / scale);
      } else {
        offset = (this._max - stop.value) * (100 / (scale + scaleOffset));
      }
      return {
        color: color || stop.color,
        offset
      };
    });
  }
  // #TODO. Is not right...
  // Weird stuff...
  getAreaMinMax(pathMin, pathMax) {
    let fill = pathMin;
    fill += ` L ${this.coordsMax[this.coordsMax.length - 1][X]},
                ${this.coordsMax[this.coordsMax.length - 1][Y]}`;
    fill += pathMax;
    fill += " z";
    return fill;
  }
  getArea(path) {
    const y_zero = this._min >= 0 ? this.height : this.height + 0 - Math.abs(this._min) / (this._max - this._min) * this.height;
    const height = y_zero + this.drawArea.y * 1.5;
    let fill = path;
    fill += ` L ${this.coords[this.coords.length - 1][X] + this.drawArea.x}, ${height}`;
    fill += ` L ${this.coords[0][X]}, ${height} z`;
    return fill;
  }
  polarToCartesian(centerX, centerY, radiusX, radiusY, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
    return {
      x: centerX + radiusX * Math.cos(angleInRadians),
      y: centerY + radiusY * Math.sin(angleInRadians)
    };
  }
  _calcRadialBarcodeCoords(argStartAngle, argEndAngle, argClockwise, argRadiusX, argRadiusY, argWidth) {
    const cx = this.drawArea.x + this.drawArea.width / 2;
    const cy = this.drawArea.y + this.drawArea.height / 2;
    const start = this.polarToCartesian(cx, cy, argRadiusX, argRadiusY, argEndAngle);
    const end = this.polarToCartesian(cx, cy, argRadiusX, argRadiusY, argStartAngle);
    const largeArcFlag = Math.abs(argEndAngle - argStartAngle) <= 180 ? "0" : "1";
    const sweepFlag = argClockwise ? "0" : "1";
    const cutoutRadiusX = argRadiusX - argWidth;
    const cutoutRadiusY = argRadiusY - argWidth;
    const start2 = this.polarToCartesian(cx, cy, cutoutRadiusX, cutoutRadiusY, argEndAngle);
    const end2 = this.polarToCartesian(cx, cy, cutoutRadiusX, cutoutRadiusY, argStartAngle);
    return {
      start,
      end,
      start2,
      end2,
      largeArcFlag,
      sweepFlag
    };
  }
  _calcRadialBarcode(coords, isBackground = false, columnSpacing = 4, rowSpacing = 4) {
    const max = this._logarithmic ? Math.log10(Math.max(1, this.max)) : this.max;
    const min = this._logarithmic ? Math.log10(Math.max(1, this.min)) : this.min;
    const segments = this.hours * this.points;
    const angleSize = 360 / segments;
    const startAngle = 0;
    let runningAngle = startAngle;
    const clockWise = true;
    const wRatio = (max - min) / this.radialBarcodeSize;
    const coords2 = coords.map((coord) => {
      const value = !isBackground ? coord[V] : this.max;
      let ringWidth;
      let radius;
      switch (this.config.sparkline.show?.chart_variant) {
        case "sunburst":
        case "sunburst_centered":
          ringWidth = ((this._logarithmic ? Math.log10(Math.max(1, value)) : value) - min) / wRatio;
          radius = (this.drawArea.width - this.radialBarcodeSize + ringWidth) / 2;
          break;
        case "sunburst_outward":
          ringWidth = ((this._logarithmic ? Math.log10(Math.max(1, value)) : value) - min) / wRatio;
          radius = this.drawArea.width / 2 - this.radialBarcodeSize + ringWidth;
          break;
        case "sunburst_inward":
          ringWidth = ((this._logarithmic ? Math.log10(Math.max(1, value)) : value) - min) / wRatio;
          radius = this.drawArea.width / 2;
          break;
        default:
          ringWidth = this.radialBarcodeSize;
          radius = this.drawArea.width / 2;
          break;
      }
      let newX = [];
      let newY = [];
      let radiusX = [];
      let radiusY = [];
      const {
        start,
        end,
        start2,
        end2,
        largeArcFlag,
        sweepFlag
      } = this._calcRadialBarcodeCoords(
        runningAngle + columnSpacing,
        runningAngle + angleSize - columnSpacing,
        clockWise,
        radius,
        radius,
        ringWidth
      );
      runningAngle += angleSize;
      newX.push(start.x, end.x, start2.x, end2.x);
      newY.push(start.y, end.y, start2.y, end2.y);
      radiusX.push(this.drawArea.width / 2, this.drawArea.width / 2 - this.radialBarcodeSize);
      radiusY.push(this.drawArea.height / 2, this.drawArea.height / 2 - this.radialBarcodeSize);
      return [newX, newY, value, 0, radiusX, radiusY, largeArcFlag, sweepFlag];
    });
    if (isBackground) {
      if (coords.length !== segments) {
        let ringWidth;
        let radius;
        const value = this.max;
        switch (this.config.sparkline.show?.chart_variant) {
          case "sunburst":
          case "sunburst_centered":
            ringWidth = ((this._logarithmic ? Math.log10(Math.max(1, value)) : value) - min) / wRatio;
            radius = (this.drawArea.width - this.radialBarcodeSize + ringWidth) / 2;
            break;
          case "sunburst_outward":
            ringWidth = ((this._logarithmic ? Math.log10(Math.max(1, value)) : value) - min) / wRatio;
            radius = this.drawArea.width / 2 - this.radialBarcodeSize + ringWidth;
            break;
          case "sunburst_inward":
            ringWidth = ((this._logarithmic ? Math.log10(Math.max(1, value)) : value) - min) / wRatio;
            radius = this.drawArea.width / 2;
            break;
          default:
            ringWidth = this.radialBarcodeSize;
            radius = this.drawArea.width / 2;
            break;
        }
        let bgCoords = [];
        for (let bg = coords.length; bg < segments; bg++) {
          bgCoords[bg] = {};
          bgCoords[bg][X] = bg;
          bgCoords[bg][Y] = 0;
          bgCoords[bg][V] = max;
          let newX = [];
          let newY = [];
          let radiusX = [];
          let radiusY = [];
          const {
            start,
            end,
            start2,
            end2,
            largeArcFlag,
            sweepFlag
          } = this._calcRadialBarcodeCoords(
            runningAngle + columnSpacing,
            runningAngle + angleSize - columnSpacing,
            clockWise,
            radius,
            radius,
            ringWidth
          );
          runningAngle += angleSize;
          newX.push(start.x, end.x, start2.x, end2.x);
          newY.push(start.y, end.y, start2.y, end2.y);
          radiusX.push(this.drawArea.width / 2, this.drawArea.width / 2 - this.radialBarcodeSize);
          radiusY.push(this.drawArea.height / 2, this.drawArea.height / 2 - this.radialBarcodeSize);
          coords2.push([newX, newY, value, 0, radiusX, radiusY, largeArcFlag, sweepFlag]);
        }
      }
    }
    return coords2;
  }
  getRadialBarcodeBackground(position, total, columnSpacing = 4, rowSpacing = 4) {
    this.backgroundCoords = [];
    this.backgroundCoords = [...this.coords];
    const radialBarcodeCoords = this._calcRadialBarcode(this.backgroundCoords, true, columnSpacing, rowSpacing);
    return radialBarcodeCoords.map((coord, i) => ({
      start: { x: coord[X][0], y: coord[Y][0] },
      end: { x: coord[X][1], y: coord[Y][1] },
      start2: { x: coord[X][2], y: coord[Y][2] },
      end2: { x: coord[X][3], y: coord[Y][3] },
      radius: { x: coord[RX][0], y: coord[RY][0] },
      radius2: { x: coord[RX][1], y: coord[RY][1] },
      largeArcFlag: coord[6],
      sweepFlag: coord[7],
      value: coord[V]
    }));
  }
  getRadialBarcodeBackgroundPaths() {
    const radialBarcodeBackgroundPaths = this.radialBarcodeBackground.map((segment, index) => {
      let rOuterX;
      let rOuterY;
      let rInnerX;
      let rInnerY;
      let sweepFlagTest = "0";
      if (["flower2", "flower", "rice_grain"].includes(this.config.sparkline.show?.chart_viz)) {
        if (this.config.sparkline.show.chart_viz === "flower" && this.config.sparkline.show.chart_variant === "sunburst_inward") {
          rOuterX = segment.radius.x;
          rOuterY = segment.radius.y;
        } else {
          const difX1 = Math.abs(segment.start.x - segment.end.x);
          const difY1 = Math.abs(segment.start.y - segment.end.y);
          rOuterX = Math.sqrt(difX1 * difX1 + difY1 * difY1) / 2;
          rOuterY = rOuterX;
        }
        if (this.config.sparkline.show.chart_viz === "flower" && this.config.sparkline.show.chart_variant === "sunburst_outward") {
          rInnerX = segment.radius2.x;
          rInnerY = segment.radius2.y;
        } else {
          const difX2 = Math.abs(segment.start2.x - segment.end2.x);
          const difY2 = Math.abs(segment.start2.y - segment.end2.y);
          rInnerX = Math.sqrt(difX2 * difX2 + difY2 * difY2) / 2;
          rInnerY = rInnerX;
          sweepFlagTest = ["rice_grain", "flower"].includes(this.config.sparkline.show.chart_viz) ? "1" : "0";
        }
      } else {
        rOuterX = segment.radius.x;
        rOuterY = segment.radius.y;
        rInnerX = segment.radius2.x;
        rInnerY = segment.radius2.y;
      }
      const d2 = [
        "M",
        segment.start.x,
        segment.start.y,
        "A",
        rOuterX,
        rOuterY,
        0,
        segment.largeArcFlag,
        segment.sweepFlag,
        segment.end.x,
        segment.end.y,
        "L",
        segment.end2.x,
        segment.end2.y,
        "A",
        rInnerX,
        rInnerY,
        0,
        segment.largeArcFlag,
        segment.sweepFlag === sweepFlagTest ? "1" : "0",
        segment.start2.x,
        segment.start2.y,
        "Z"
      ].join(" ");
      return d2;
    });
    return radialBarcodeBackgroundPaths;
  }
  getRadialBarcode(position, total, columnSpacing = 4, rowSpacing = 4) {
    const radialBarcodeCoords = this._calcRadialBarcode(this.coords, false, columnSpacing, rowSpacing);
    return radialBarcodeCoords.map((coord, i) => ({
      start: { x: coord[X][0], y: coord[Y][0] },
      end: { x: coord[X][1], y: coord[Y][1] },
      start2: { x: coord[X][2], y: coord[Y][2] },
      end2: { x: coord[X][3], y: coord[Y][3] },
      radius: { x: coord[RX][0], y: coord[RY][0] },
      radius2: { x: coord[RX][1], y: coord[RY][1] },
      largeArcFlag: coord[6],
      sweepFlag: coord[7],
      value: coord[V]
    }));
  }
  getRadialBarcodePaths() {
    const radialBarcodePaths = this.radialBarcode.map((segment, index) => {
      let rOuterX;
      let rOuterY;
      let rInnerX;
      let rInnerY;
      let sweepFlagTest = "0";
      if (["flower2", "flower", "rice_grain"].includes(this.config.sparkline.show?.chart_viz)) {
        if (this.config.sparkline.show.chart_viz === "flower" && this.config.sparkline.show.chart_variant === "sunburst_inward") {
          rOuterX = segment.radius.x;
          rOuterY = segment.radius.y;
        } else {
          const difX1 = Math.abs(segment.start.x - segment.end.x);
          const difY1 = Math.abs(segment.start.y - segment.end.y);
          rOuterX = Math.sqrt(difX1 * difX1 + difY1 * difY1) / 2;
          rOuterY = rOuterX;
        }
        if (this.config.sparkline.show.chart_viz === "flower" && this.config.sparkline.show.chart_variant === "sunburst_outward") {
          rInnerX = segment.radius2.x;
          rInnerY = segment.radius2.y;
        } else {
          const difX2 = Math.abs(segment.start2.x - segment.end2.x);
          const difY2 = Math.abs(segment.start2.y - segment.end2.y);
          rInnerX = Math.sqrt(difX2 * difX2 + difY2 * difY2) / 2;
          rInnerY = rInnerX;
          sweepFlagTest = ["rice_grain", "flower"].includes(this.config.sparkline.show.chart_viz) ? "1" : "0";
        }
      } else {
        rOuterX = segment.radius.x;
        rOuterY = segment.radius.y;
        rInnerX = segment.radius2.x;
        rInnerY = segment.radius2.y;
      }
      const d2 = [
        "M",
        segment.start.x,
        segment.start.y,
        "A",
        rOuterX,
        rOuterY,
        0,
        segment.largeArcFlag,
        segment.sweepFlag,
        segment.end.x,
        segment.end.y,
        "L",
        segment.end2.x,
        segment.end2.y,
        "A",
        rInnerX,
        rInnerY,
        0,
        segment.largeArcFlag,
        segment.sweepFlag === sweepFlagTest ? "1" : "0",
        segment.start2.x,
        segment.start2.y,
        "Z"
      ].join(" ");
      return d2;
    });
    return radialBarcodePaths;
  }
  getBarcode(position, total, columnSpacing = 4, rowSpacing = 4) {
    const max = this._logarithmic ? Math.log10(Math.max(1, this.max)) : this.max;
    const min = this._logarithmic ? Math.log10(Math.max(1, this.min)) : this.min;
    const coords = this.coords;
    const xRatio = (this.drawArea.width + columnSpacing) / Math.ceil(this.hours * this.points) / total;
    const yRatio = (max - min) / this.drawArea.height || 1;
    switch (this.config.sparkline.show.chart_variant) {
      case "audio":
        return coords.map((coord, i) => ({
          x: xRatio * i * total + xRatio * position + this.drawArea.x,
          y: this.drawArea.height / 2 - ((this._logarithmic ? Math.log10(Math.max(1, coord[V])) : coord[V]) - min) / yRatio / 2,
          height: ((this._logarithmic ? Math.log10(Math.max(1, coord[V])) : coord[V]) - min) / yRatio,
          width: xRatio - columnSpacing / 2,
          value: coord[V]
        }));
      case "stalactites":
        return coords.map((coord, i) => ({
          x: xRatio * i * total + xRatio * position + this.drawArea.x,
          y: 0,
          height: ((this._logarithmic ? Math.log10(Math.max(1, coord[V])) : coord[V]) - min) / yRatio,
          width: xRatio - columnSpacing / 2,
          value: coord[V]
        }));
      case "stalagmites":
        return coords.map((coord, i) => ({
          x: xRatio * i * total + xRatio * position + this.drawArea.x,
          y: this.drawArea.height / 1 - ((this._logarithmic ? Math.log10(Math.max(1, coord[V])) : coord[V]) - min) / yRatio,
          height: ((this._logarithmic ? Math.log10(Math.max(1, coord[V])) : coord[V]) - min) / yRatio,
          width: xRatio - columnSpacing / 2,
          value: coord[V]
        }));
      default:
        return coords.map((coord, i) => ({
          x: xRatio * i * total + xRatio * position + this.drawArea.x,
          y: 0,
          height: this.drawArea.height,
          width: xRatio - columnSpacing / 2,
          value: coord[V]
        }));
    }
  }
  // Get array of levels. Just levels which draw a little bar at each level once reached
  getEqualizer(position, total, columnSpacing = 4, rowSpacing = 4) {
    const xRatio = (this.drawArea.width + columnSpacing) / Math.ceil(this.hours * this.points) / total;
    const yRatio = (this._max - this._min) / this.drawArea.height || 1;
    this._min < 0 ? Math.abs(this._min) / yRatio : 0;
    const levelHeight = (this.drawArea.height - this.levelCount * rowSpacing) / this.levelCount;
    let stepRange;
    let equalizerCoords = this.coords.map((coord, i) => {
      let newCoord = [];
      const stepMax = Math.trunc(coord[V] / this.valuesPerBucket);
      const stepMin = Math.trunc(this._min / this.valuesPerBucket);
      stepRange = stepMax - stepMin;
      newCoord[X] = coord[X];
      newCoord[Y] = [];
      newCoord[V] = [];
      for (let i2 = 0; i2 < stepRange; i2++) {
        newCoord[V][i2] = this._min + i2 * this.valuesPerBucket;
      }
      newCoord[Y] = this._calcLevelY(newCoord);
      return newCoord;
    });
    return equalizerCoords.map((coord, i) => ({
      x: xRatio * i * total + xRatio * position + this.drawArea.x,
      y: coord[Y],
      height: levelHeight,
      width: xRatio - columnSpacing,
      value: coord[V]
    }));
  }
  getGrades(position, total, columnSpacing = 4, rowSpacing = 4) {
    const xRatio = (this.drawArea.width + columnSpacing) / Math.ceil(this.hours * this.points) / total;
    const bucketHeight = (this.drawArea.height - (this.gradeRanks.length - 1) * rowSpacing) / this.gradeRanks.length;
    let stepRange;
    let levelCoords = this.coords.map((coord, i) => {
      let newCoord = [];
      const stepMax = this.gradeRanks.length;
      const stepMin = 0;
      stepRange = stepMax - stepMin;
      newCoord[X] = coord[X];
      newCoord[Y] = [];
      newCoord[V] = [];
      let matchStep = -1;
      let matchBucket = 0;
      for (let i2 = 0; i2 < stepRange; i2++) {
        matchBucket = 0;
        for (let j = 0; j < this.gradeRanks[i2].rangeMin.length; j++) {
          if (coord[V] >= this.gradeRanks[i2].rangeMin[j] && coord[V] < this.gradeRanks[i2].rangeMax[j]) {
            matchBucket = j;
            matchStep = i2;
          }
        }
      }
      for (let i2 = 0; i2 <= stepRange; i2++) {
        if (i2 <= matchStep) newCoord[V][i2] = this.gradeRanks[i2].length > matchBucket ? this.gradeRanks[i2].rangeMin[matchBucket] : this.gradeRanks[i2].rangeMin[0];
        newCoord[Y][i2] = this.drawArea.height + this.margin.t - i2 * (bucketHeight + rowSpacing);
      }
      return newCoord;
    });
    return levelCoords.map((coord, i) => ({
      x: xRatio * i * total + xRatio * position + this.drawArea.x,
      // Remove start spacing + spacing,
      y: coord[Y],
      height: bucketHeight,
      width: xRatio - columnSpacing,
      value: coord[V]
    }));
  }
  getBars(position, total, columnSpacing = 4, rowSpacing = 4) {
    const coords = this._calcY(this.coords);
    const xRatio = (this.drawArea.width + columnSpacing) / Math.ceil(this.hours * this.points) / total;
    const yRatio = (this._max - this._min) / this.drawArea.height || 1;
    this._min < 0 ? Math.abs(this._min) / yRatio : 0;
    return coords.map((coord, i) => ({
      x: xRatio * i * total + xRatio * position + this.drawArea.x,
      // Remove start spacing + spacing,
      y: this._min > 0 ? coord[Y] : coord[Y2],
      height: coord[V] > 0 ? this._min < 0 ? coord[V] / yRatio : (coord[V] - this._min) / yRatio : coord[Y] - coord[Y2],
      width: xRatio - columnSpacing,
      value: coord[V]
    }));
  }
  _midPoint(Ax, Ay, Bx, By) {
    const Zx = (Ax - Bx) / 2 + Bx;
    const Zy = (Ay - By) / 2 + By;
    return [Zx, Zy];
  }
  _average(items) {
    return items.reduce((sum, entry) => sum + parseFloat(entry.state), 0) / items.length;
  }
  _median(items) {
    const itemsDup = [...items].sort((a, b) => parseFloat(a) - parseFloat(b));
    const mid = Math.floor((itemsDup.length - 1) / 2);
    if (itemsDup.length % 2 === 1)
      return parseFloat(itemsDup[mid].state);
    return (parseFloat(itemsDup[mid].state) + parseFloat(itemsDup[mid + 1].state)) / 2;
  }
  _maximum(items) {
    return Math.max(...items.map((item) => item.state));
  }
  _minimum(items) {
    return Math.min(...items.map((item) => item.state));
  }
  _first(items) {
    return parseFloat(items[0].state);
  }
  _last(items) {
    return parseFloat(items[items.length - 1].state);
  }
  _sum(items) {
    return items.reduce((sum, entry) => sum + parseFloat(entry.state), 0);
  }
  _delta(items) {
    return this._maximum(items) - this._minimum(items);
  }
  _diff(items) {
    return this._last(items) - this._first(items);
  }
  _lastValue(items) {
    if (["delta", "diff"].includes(this.aggregateFuncName)) {
      return 0;
    } else {
      return parseFloat(items[items.length - 1].state) || 0;
    }
  }
  _updateEndTime() {
    this._endTime = /* @__PURE__ */ new Date();
    if (this.config.period.type === "calendar") {
      if (this.config.period.calendar.period === "day" && this.config.period.calendar.offset !== 0) {
        this._endTime.setHours(0, 0, 0, 0);
        this.hours = 24;
      }
    } else {
      switch (this._groupBy) {
        case "month":
          this._endTime.setMonth(this._endTime.getMonth() + 1);
          this._endTime.setDate(1);
          break;
        case "date":
          this._endTime.setDate(this._endTime.getDate() + 1);
          this._endTime.setHours(0, 0, 0, 0);
          break;
        case "hour":
          this._endTime.setHours(this._endTime.getHours() + 1);
          this._endTime.setMinutes(0, 0, 0);
          break;
      }
    }
  }
}
function classMap$a(classes) {
  if (!classes) return "";
  return Object.entries(classes).filter(([_, value]) => value).map(([key, _]) => key).join(" ");
}
function styleMap$c(styles) {
  if (!styles) return "";
  return Object.entries(styles).filter(([_, value]) => value != null && value !== "").map(([key, value]) => `${key}: ${value}`).join("; ");
}
const getFirstDefinedItem = (...collection) => collection.find((item) => typeof item !== "undefined");
const DEFAULT_COLORS = [
  "var(--theme-sys-color-primary)",
  "#3498db",
  "#e74c3c",
  "#9b59b6",
  "#f1c40f",
  "#2ecc71",
  "#1abc9c",
  "#34495e",
  "#e67e22",
  "#7f8c8d",
  "#27ae60",
  "#2980b9",
  "#8e44ad"
];
const findFirstValuedIndex = (stops, startIndex) => {
  for (let i = startIndex, l = stops.length; i < l; i += 1) {
    if (stops[i].value != null) {
      return i;
    }
  }
  throw new Error(
    'Error in threshold interpolation: could not find right-nearest valued stop. Do the first and last thresholds have a set "value"?'
  );
};
const interpolateStops = (stops) => {
  if (!stops || !stops.length) {
    return stops;
  }
  if (stops[0].value == null || stops[stops.length - 1].value == null) {
    throw new Error('The first and last thresholds must have a set "value".\n See xyz manual');
  }
  let leftValuedIndex = 0;
  let rightValuedIndex = null;
  return stops.map((stop, stopIndex) => {
    if (stop.value != null) {
      leftValuedIndex = stopIndex;
      return { ...stop };
    }
    if (rightValuedIndex == null) {
      rightValuedIndex = findFirstValuedIndex(stops, stopIndex);
    } else if (stopIndex > rightValuedIndex) {
      leftValuedIndex = rightValuedIndex;
      rightValuedIndex = findFirstValuedIndex(stops, stopIndex);
    }
    const leftValue = stops[leftValuedIndex].value;
    const rightValue = stops[rightValuedIndex].value;
    const m = (rightValue - leftValue) / (rightValuedIndex - leftValuedIndex);
    return {
      color: typeof stop === "string" ? stop : stop.color,
      value: m * stopIndex + leftValue
    };
  });
};
const computeThresholds = (stops, type) => {
  const valuedStops = interpolateStops(stops);
  try {
    valuedStops.sort((a, b) => b.value - a.value);
  } catch (error) {
    console.log("computeThresholds, error", error, valuedStops);
  }
  if (type === "smooth") {
    return valuedStops;
  } else {
    const rect = [].concat(...valuedStops.map((stop, i) => [stop, {
      value: stop.value - 1e-4,
      color: valuedStops[i + 1] ? valuedStops[i + 1].color : stop.color
    }]));
    return rect;
  }
};
class SparklineGraphTool extends BaseTool {
  constructor(argToolset, argConfig, argPos) {
    const DEFAULT_GRAPH_CONFIG = {
      position: {
        cx: 50,
        cy: 50,
        height: 25,
        width: 25,
        margin: 0
      },
      period: {
        type: "unknown",
        real_time: false,
        group_by: "interval"
      },
      sparkline: {
        state_values: {
          logarithmic: false,
          value_factor: 0,
          aggregate_func: "avg",
          smoothing: true
        },
        equalizer: {
          value_buckets: 10,
          square: false
        },
        graded: {
          square: false
        },
        animate: true,
        hour24: false,
        font_size: 10,
        line_color: [...DEFAULT_COLORS],
        colorstops: {
          colors: []
        },
        colorstops_transition: "smooth",
        state_map: {
          map: []
        },
        cache: true,
        color: "var(--primary-color)",
        radial_barcode: {
          size: 5,
          line_width: 0,
          face: {
            hour_marks_count: 24
          }
        },
        classes: {
          tool: {
            "sak-sparkline": true,
            hover: true
          },
          bar: {},
          line: {
            "sak-sparkline__line": true,
            hover: true
          },
          graded_background: {},
          graded_foreground: {},
          radial_barcode_background: {
            "sak-sparkline__radial_barcode__background": true
          },
          radial_barcode_face_day_night: {
            "sak-sparkline__radial_barcode-face_day-night": true
          },
          radial_barcode_face_hour_marks: {
            "sak-sparkline__radial_barcode-face_hour-marks": true
          },
          radial_barcode_face_hour_numbers: {
            "sak-sparkline__radial_barcode-face_hour-numbers": true
          }
        },
        styles: {
          tool: {},
          line: {},
          bar: {},
          graded_background: {},
          graded_foreground: {},
          radial_barcode_background: {},
          radial_barcode_face_day_night: {},
          radial_barcode_face_hour_marks: {},
          radial_barcode_face_hour_numbers: {},
          area_mask_above: {
            fill: "url(#sak-sparkline-area-mask-tb-1)"
          },
          area_mask_below: {
            fill: "url(#sak-sparkline-area-mask-bt-1)"
          },
          bar_mask_above: {
            fill: "url(#sak-sparkline-bar-mask-tb-80)"
          },
          bar_mask_below: {
            fill: "url(#sak-sparkline-bar-mask-bt-80)"
          }
        },
        show: { style: "fixedcolor" }
      }
    };
    const DEFAULT_CALENDER_CONFIG = {
      calendar: {
        period: "day",
        offset: 0,
        duration: {
          hour: 24
        },
        bins: {
          per_hour: 1
        }
      }
    };
    const DEFAULT_ROLLING_WINDOW_CONFIG = {
      rolling_window: {
        duration: {
          hour: 24
        },
        bins: {
          per_hour: 1
        }
      }
    };
    super(argToolset, Merge.mergeDeep(DEFAULT_GRAPH_CONFIG, argConfig), argPos);
    if (this.config.period.real_time) {
      this.config.period.type = "real_time";
    } else if (this.config.period?.calendar) {
      this.config.period.type = "calendar";
      this.config.period = Merge.mergeDeep(DEFAULT_CALENDER_CONFIG, this.config.period);
    } else if (this.config.period?.rolling_window) {
      this.config.period.type = "rolling_window";
      this.config.period = Merge.mergeDeep(DEFAULT_ROLLING_WINDOW_CONFIG, this.config.period);
    }
    this.svg.margin = {};
    if (typeof this.config.position.margin === "object") {
      this.svg.margin.t = Utils.calculateSvgDimension(this.config.position.margin?.t) || Utils.calculateSvgDimension(this.config.position.margin?.y) || 0;
      this.svg.margin.b = Utils.calculateSvgDimension(this.config.position.margin?.b) || Utils.calculateSvgDimension(this.config.position.margin?.y) || 0;
      this.svg.margin.r = Utils.calculateSvgDimension(this.config.position.margin?.r) || Utils.calculateSvgDimension(this.config.position.margin?.x) || 0;
      this.svg.margin.l = Utils.calculateSvgDimension(this.config.position.margin?.l) || Utils.calculateSvgDimension(this.config.position.margin?.x) || 0;
      this.svg.margin.x = this.svg.margin.l;
      this.svg.margin.y = this.svg.margin.t;
    } else {
      this.svg.margin.x = Utils.calculateSvgDimension(this.config.position.margin);
      this.svg.margin.y = this.svg.margin.x;
      this.svg.margin.t = this.svg.margin.x;
      this.svg.margin.r = this.svg.margin.x;
      this.svg.margin.b = this.svg.margin.x;
      this.svg.margin.l = this.svg.margin.x;
    }
    this.svg.clockface = {};
    if (this.config.sparkline?.radial_barcode?.face) {
      if (this.config.sparkline.radial_barcode.face?.show_day_night === true)
        this.svg.clockface.dayNightRadius = Utils.calculateSvgDimension(this.config.sparkline.radial_barcode.face.day_night_radius);
      if (this.config.sparkline.radial_barcode.face?.show_hour_marks === true)
        this.svg.clockface.hourMarksRadius = Utils.calculateSvgDimension(this.config.sparkline.radial_barcode.face.hour_marks_radius);
      if (["absolute", "relative"].includes(this.config.sparkline.radial_barcode.face?.show_hour_numbers))
        this.svg.clockface.hourNumbersRadius = Utils.calculateSvgDimension(this.config.sparkline.radial_barcode.face.hour_numbers_radius);
    }
    this._data = [];
    this._bars = [];
    this._scale = {};
    this._needsRendering = false;
    this.classes.tool = {};
    this.classes.bar = {};
    this.classes.radial_barcode_face_day_night = {};
    this.classes.radial_barcode_face_hour_marks = {};
    this.classes.radial_barcode_face_hour_numbers = {};
    this.classes.barcode = {};
    this.classes.barcode_graph = {};
    this.styles.barcode = {};
    this.styles.barcode_graph = {};
    this.classes.traffic_light = {};
    this.classes.graded_background = {};
    this.styles.graded_background = {};
    this.classes.graded_foreground = {};
    this.styles.graded_foreground = {};
    this.classes.equalizer_part = {};
    this.styles.equalizer_part = {};
    this.classes.radial_barcode = {};
    this.classes.radial_barcode_background = {};
    this.classes.radial_barcode_graph = {};
    this.styles.radial_barcode = {};
    this.styles.radial_barcode_background = {};
    this.styles.radial_barcode_graph = {};
    this.classes.helper_line1 = {};
    this.classes.helper_line2 = {};
    this.classes.helper_line3 = {};
    this.styles.helper_line1 = {};
    this.styles.helper_line2 = {};
    this.styles.helper_line3 = {};
    this.styles.tool = {};
    this.styles.bar = {};
    this.styles.line = {};
    this.styles.radial_barcode_face_day_night = {};
    this.styles.radial_barcode_face_hour_marks = {};
    this.styles.radial_barcode_face_hour_numbers = {};
    this.stylesBar = {};
    this.seriesIndex = 0;
    this.id = this.toolId;
    this.bound = [0, 0];
    this.boundSecondary = [0, 0];
    this.length = [];
    this.entity = [];
    this.line = [];
    this.lineMin = [];
    this.lineMax = [];
    this.bar = [];
    this.equalizer = [];
    this.graded = [];
    this.abs = [];
    this.area = [];
    this.areaMinMax = [];
    this.points = [];
    this.gradient = [];
    this.tooltip = {};
    this.updateQueue = [];
    this.updating = false;
    this.stateChanged = false;
    this.initial = true;
    this._md5Config = void 0;
    this.radialBarcodeChart = [];
    this.radialBarcodeChartBackground = [];
    this.barcodeChart = [];
    this.config.width = this.svg.width;
    this.config.height = this.svg.height;
    this.svg.line_width = Utils.calculateSvgDimension(this.config.sparkline[this.config.sparkline.show.chart_type]?.line_width || this.config.line_width || 0);
    this.svg.column_spacing = Utils.calculateSvgDimension(this.config.sparkline[this.config.sparkline.show.chart_type]?.column_spacing || this.config.bar_spacing || 1);
    this.svg.row_spacing = Utils.calculateSvgDimension(this.config.sparkline[this.config.sparkline.show.chart_type]?.row_spacing || this.config.bar_spacing || 1);
    this.gradeValues = [];
    this.config.sparkline.colorstops.colors.map((value, index) => this.gradeValues[index] = value.value);
    this.stops = Merge.mergeDeep(...this.config.sparkline.colorstops.colors);
    this.gradeRanks = [];
    this.config.sparkline.colorstops.colors.map((value, index) => {
      let rankIndex;
      rankIndex = this.config.sparkline.show?.chart_variant === "rank_order" && value.rank !== void 0 ? value.rank : index;
      if (!this.gradeRanks[rankIndex]) {
        this.gradeRanks[rankIndex] = {};
        this.gradeRanks[rankIndex].value = [];
        this.gradeRanks[rankIndex].rangeMin = [];
        this.gradeRanks[rankIndex].rangeMax = [];
      }
      this.gradeRanks[rankIndex].rank = rankIndex;
      this.gradeRanks[rankIndex].color = value.color;
      let rangeMin = value.value;
      let rangeMax = this.config.sparkline.colorstops.colors[index + 1]?.value || Infinity;
      this.gradeRanks[rankIndex].value.push(value.value);
      this.gradeRanks[rankIndex].rangeMin.push(rangeMin);
      this.gradeRanks[rankIndex].rangeMax.push(rangeMax);
      return true;
    });
    this.config.sparkline.colorstops.colors = computeThresholds(
      this.config.sparkline.colorstops.colors,
      this.config.sparkline.colorstops_transition
    );
    this.radialBarcodeChartWidth = Utils.calculateSvgDimension(this.config?.radial_barcode?.size || 5);
    this.svg.graph = {};
    this.svg.graph.height = this.svg.height - this.svg.margin.y * 0;
    this.svg.graph.width = this.svg.width - this.svg.margin.x * 0;
    this.config.sparkline.state_map.map.forEach((state, i) => {
      if (typeof state === "string") this.config.sparkline.state_map.map[i] = { value: state, label: state };
      this.config.sparkline.state_map.map[i].label = this.config.sparkline.state_map.map[i].label || this.config.sparkline.state_map.map[i].value;
    });
    this.xLines = {};
    this.xLines.lines = [];
    if (typeof this.config.sparkline.x_lines?.lines === "object") {
      let j = 0;
      let helpers = this.config.sparkline.x_lines.lines;
      helpers.forEach((helperLine) => {
        this.xLines.lines[j] = {
          id: helperLine.name,
          zpos: helperLine?.zpos || "above",
          yshift: Utils.calculateSvgDimension(helperLine?.yshift) || 0
        };
        j += 1;
      });
    }
    if (typeof this.config.sparkline.x_lines?.numbers === "object") {
      this.xLines.numbers = { ...this.config.sparkline.x_lines.numbers };
    }
    let { config } = this;
    this.config.sparkline.state_values.smoothing = getFirstDefinedItem(
      this.config.sparkline.state_values.smoothing,
      !this._card.config.entities[this.defaultEntityIndex()].entity.startsWith("binary_sensor.")
      // !entity.entity.startsWith('binary_sensor.'), // turn off for binary sensor by default
    );
    this.Graph = [];
    this.Graph[0] = new SparklineGraph(
      this.svg.graph.width,
      this.svg.graph.height,
      this.svg.margin,
      this.config,
      this.gradeValues,
      this.gradeRanks,
      this.config.sparkline.state_map
    );
    this._firstDataReceived = false;
  }
  set value(state) {
    if (this._stateValue === state) return false;
    const changed = super.value = state;
    if (this.config.period.type === "real_time") {
      let histState = state;
      const stateHistory = [{ state: histState }];
      this.series = stateHistory;
    }
    return changed;
  }
  /** *****************************************************************************
    * SparklineBarChartTool::set series
    *
    * Summary.
    * Sets the timeseries for the barchart tool. Is an array of states.
    * If this is historical data, the caller has taken the time to create this.
    * This tool only displays the result...
    *
    */
  set data(states) {
  }
  set series(states) {
    if (this.dev && this.dev.fakeData) {
      let z = 40;
      for (let i = 0; i < states.length; i++) {
        if (i < states.length / 2) z -= 4 * i;
        if (i > states.length / 2) z += 3 * i;
        states[i].state = z;
      }
    }
    if (this._card.config.entities[0].fixed_value === true) {
      const last = states[states.length - 1];
      states = [last, last];
    }
    this.seriesIndex = 0;
    this.Graph[this.seriesIndex].update(states);
    this.updateBounds();
    let { config } = this;
    if (config.sparkline.show.chart_type) {
      let graphPos = 0;
      let entity = this._card.config.entities[this.defaultEntityIndex()];
      const i = 0;
      if (!entity || this.Graph[i].coords.length === 0) return;
      const bound = this._card.config.entities[i].states === "secondary" ? this.boundSecondary : this.bound;
      [this.Graph[i].min, this.Graph[i].max] = [bound[0], bound[1]];
      const numVisible = this.visibleEntities.length;
      if (config.sparkline.show.chart_type === "bar") {
        this.bar[i] = this.Graph[i].getBars(graphPos, numVisible, this.svg.colomn_spacing);
        graphPos += 1;
        if (config.sparkline.colorstops.colors.length > 0 && !this._card.config.entities[i].color)
          this.gradient[i] = this.Graph[i].computeGradient(
            config.sparkline.colorstops.colors,
            this.config.sparkline.state_values.logarithmic
          );
      } else if (["area", "line"].includes(config.sparkline.show.chart_type)) {
        const line = this.Graph[i].getPath();
        if (this._card.config.entities[i].show_line !== false) this.line[i] = line;
      }
      if (config.sparkline.show.chart_type === "area") {
        this.area[i] = this.Graph[i].getArea(this.line[i]);
      }
      if (config.sparkline?.line?.show_minmax || config.sparkline?.area?.show_minmax) {
        const lineMin = this.Graph[i].getPathMin();
        const lineMax = this.Graph[i].getPathMax();
        this.lineMin[i] = lineMin;
        this.lineMax[i] = lineMax;
        this.areaMinMax[i] = this.Graph[i].getAreaMinMax(lineMin, lineMax);
      }
      if (config.sparkline.show.chart_type === "dots" || config.sparkline?.area?.show_dots === true || config.sparkline?.line?.show_dots === true) {
        this.points[i] = this.Graph[i].getPoints();
      } else if (this.config.sparkline.show.chart_type === "equalizer") {
        this.Graph[i].levelCount = this.config.sparkline.equalizer.value_buckets;
        this.Graph[i].valuesPerBucket = (this.Graph[i].max - this.Graph[i].min) / this.config.sparkline.equalizer.value_buckets;
        this.equalizer[i] = this.Graph[i].getEqualizer(
          0,
          this.visibleEntities.length,
          this.svg.column_spacing,
          this.svg.row_spacing
        );
      } else if (this.config.sparkline.show.chart_type === "graded") {
        this.Graph[i].levelCount = this.config.sparkline.equalizer.value_buckets;
        this.Graph[i].valuesPerBucket = (this.Graph[i].max - this.Graph[i].min) / this.config.sparkline.equalizer.value_buckets;
        this.graded[i] = this.Graph[i].getGrades(
          0,
          this.visibleEntities.length,
          this.svg.column_spacing,
          this.svg.row_spacing
        );
      } else if (this.config.sparkline.show.chart_type === "radial_barcode") {
        this.radialBarcodeChartBackground[i] = this.Graph[i].getRadialBarcodeBackground(
          0,
          this.visibleEntities.length,
          this.svg.column_spacing,
          this.svg.row_spacing
        );
        this.radialBarcodeChart[i] = this.Graph[i].getRadialBarcode(
          0,
          this.visibleEntities.length,
          this.svg.column_spacing,
          this.svg.row_spacing
        );
        this.Graph[i].radialBarcodeBackground = this.radialBarcodeChartBackground[i];
        this.Graph[i].radialBarcode = this.radialBarcodeChart[i];
      } else if (this.config.sparkline.show.chart_type === "barcode") {
        this.barcodeChart[i] = this.Graph[i].getBarcode(
          0,
          this.visibleEntities.length,
          this.svg.column_spacing,
          this.svg.row_spacing
        );
        this.Graph[i].barcodeChart = this.barcodeChart[i];
      }
      if (config.sparkline.colorstops.colors.length > 0 && !this._card.config.entities[i].color)
        this.gradient[i] = this.Graph[i].computeGradient(
          config.sparkline.colorstops.colors,
          this.config.sparkline.state_values.logarithmic
        );
      this.line = [...this.line];
    }
    this.updating = false;
    if (this._firstUpdatedCalled) {
      this._firstUpdatedCalled = false;
      this._firstDataReceived = true;
    } else {
      this._firstUpdatedCalled = true;
      this._firstDataReceived = false;
    }
  }
  hasSeries() {
    return this.defaultEntityIndex();
  }
  _convertState(res) {
    const resultIndex = this.config.sparkline.state_map.map.findIndex((s) => s.value === res.state);
    if (resultIndex === -1) {
      return;
    }
    res.state = resultIndex;
  }
  // NOTE!!!!!!!!!!!!
  // Should this function return a record with:
  // - source value
  // - mapped value
  // - bucket value (or same as mapped value)
  // In that case the software can choose what to get, depending on the mode.
  // I think that that is more consistent than the current 'bin' implementation.
  // That one hides the source value, which is then is fetched again using reverse
  // lookup in the buckets to get the proper value for computing the color!
  // WOuld this work:
  // - .state = source value
  // - .mapped = mapped value
  // - .xlated = translated value, or bucket/bin. Or same as .mapped.
  // OR, if no mapping or else, use state as the resulting value.
  // - .state = translated value
  // - .sourceState = source state
  // if no .sourceState there, nothing translated. No extra memory and stuff
  processStateMap(history) {
    if (this.config.sparkline.state_map?.map?.length > 0) {
      history[0].forEach((item, index) => {
        if (this.config.sparkline.state_map.map.length > 0)
          history[0][index].haState = item.state;
        this._convertState(item);
        history[0][index].state = item.state;
      });
    }
    if (this.config.sparkline.state_values?.use_value === "bin") {
      history[0].forEach((item, index) => {
        let matchStep = -1;
        let match = false;
        match = false;
        for (let i = 0; i < this.gradeRanks.length; i++) {
          for (let j = 0; j < this.gradeRanks[i].rangeMin.length; j++) {
            if (item.state >= this.gradeRanks[i].rangeMin[j] && item.state < this.gradeRanks[i].rangeMax[j]) {
              match = true;
              matchStep = i;
            }
          }
        }
        if (!match) {
          console.log("processStateMap - ILLEGAL value", item, index);
        }
        const newValue = this.gradeRanks[matchStep].rank;
        history[0][index].haState = item.state;
        history[0][index].state = newValue;
      });
    }
    if (this.config.sparkline.state_values.value_factor !== 0) {
      history[0].forEach((item, index) => {
        history[0][index].haState = item.state;
        history[0][index].state = item.state * this.config.sparkline.state_values.value_factor;
      });
    }
  }
  get visibleEntities() {
    return [1];
  }
  get primaryYaxisEntities() {
    return this.visibleEntities.filter((entity) => entity.states === void 0 || entity.states === "primary");
  }
  get secondaryYaxisEntities() {
    return this.visibleEntities.filter((entity) => entity.states === "secondary");
  }
  get visibleLegends() {
    return this.visibleEntities.filter((entity) => entity.show_legend !== false);
  }
  get primaryYaxisSeries() {
    return this.primaryYaxisEntities.map((entity, index) => this.Graph[index]);
  }
  get secondaryYaxisSeries() {
    return this.secondaryYaxisEntities.map((entity) => this.Graph[entity.index]);
  }
  getBoundary(type, series, configVal, fallback) {
    if (!(type in Math)) {
      throw new Error(`The type "${type}" is not present on the Math object`);
    }
    if (configVal === void 0) {
      return Math[type](...series.map((ele) => ele[type])) || fallback;
    }
    if (configVal[0] !== "~") {
      return configVal;
    }
    return Math[type](Number(configVal.substr(1)), ...series.map((ele) => ele[type]));
  }
  getBoundaries(series, min, max, fallback, minRange) {
    let boundary = [
      this.getBoundary("min", series, min, fallback[0], minRange),
      this.getBoundary("max", series, max, fallback[1], minRange)
    ];
    if (minRange) {
      const currentRange = Math.abs(boundary[0] - boundary[1]);
      const diff = parseFloat(minRange) - currentRange;
      if (diff > 0) {
        boundary = [
          boundary[0] - diff / 2,
          boundary[1] + diff / 2
        ];
      }
    }
    return boundary;
  }
  updateBounds({ config } = this) {
    this.bound = this.getBoundaries(
      this.primaryYaxisSeries,
      config.sparkline.state_values.lower_bound,
      config.sparkline.state_values.upper_bound,
      this.bound,
      config.sparkline.state_values.min_bound_range
    );
    this.boundSecondary = this.getBoundaries(
      this.secondaryYaxisSeries,
      config.sparkline.state_values.lower_bound_secondary,
      config.sparkline.state_values.upper_bound_secondary,
      this.boundSecondary,
      config.sparkline.state_values.min_bound_range_secondary
    );
  }
  computeColor(inState, i) {
    const { colorstops, line_color } = this.config.sparkline;
    const state = Number(inState) || 0;
    const threshold = {
      color: line_color[i] || line_color[0],
      ...colorstops.colors.slice(-1)[0],
      ...colorstops.colors.find((ele) => ele.value < state)
    };
    return this._card.config.entities[i].color || threshold.color;
  }
  intColor(inState, i) {
    const { colorstops, line_color } = this.config.sparkline;
    const state = Number(inState) || 0;
    let intColor;
    if (colorstops.colors.length > 0) {
      if (this.config.sparkline.show.chart_type === "bar") {
        const { color } = colorstops.colors.find((ele) => ele.value < state) || colorstops.colors.slice(-1)[0];
        intColor = color;
      } else {
        const index = colorstops.colors.findIndex((ele) => ele.value < state);
        const c1 = colorstops.colors[index];
        const c2 = colorstops.colors[index - 1];
        if (c2) {
          const factor = (c2.value - inState) / (c2.value - c1.value);
          intColor = Colors.getGradientValue(c2.color, c1.color, factor);
        } else {
          intColor = index ? colorstops.colors[colorstops.colors.length - 1].color : colorstops.colors[0].color;
        }
      }
    }
    return this._card.config.entities[i].color || intColor || line_color[i] || line_color[0];
  }
  getEndDate() {
    const date = /* @__PURE__ */ new Date();
    switch (this.config.period?.group_by) {
      case "date":
        date.setDate(date.getDate() + 1);
        date.setHours(0, 0, 0);
        break;
      case "hour":
        date.setHours(date.getHours() + 1);
        date.setMinutes(0, 0);
        break;
    }
    switch (this.config.period?.calendar?.period) {
      case "day":
        date.setHours(0, 0, 0, 0);
        break;
    }
    return date;
  }
  setTooltip(entity, index, value, label = null) {
    return;
  }
  renderSvgAreaMask(fill, i) {
    if (this.config.sparkline.show.chart_type !== "area") return;
    if (!fill) return;
    const fade = this.config.sparkline.show.fill === "fade";
    const init = this.length[i] || this._card.config.entities[i].show_line === false;
    const y_zero = this.Graph[i]._min >= 0 ? 0 : Math.abs(this.Graph[i]._min) / (this.Graph[i]._max - this.Graph[i]._min) * 100;
    return svg`
    <defs>
      <linearGradient id=${`fill-grad-pos-${this.id}-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop stop-color='white' offset='0%' stop-opacity='1'/>
        <stop stop-color='white' offset='100%' stop-opacity='0.1'/>
      </linearGradient>
      <mask id=${`fill-grad-mask-pos-${this.id}-${i}`}>
        <rect width="100%" height="${100 - y_zero}%" fill=${this.config.sparkline.styles.area_mask_above.fill}
         />
      </mask>
      <linearGradient id=${`fill-grad-neg-${this.id}-${i}`} x1="0%" y1="100%" x2="0%" y2="0%">
        <stop stop-color='white' offset='0%' stop-opacity='1'/>
        <stop stop-color='white' offset='100%' stop-opacity='0.1'/>
      </linearGradient>
      <mask id=${`fill-grad-mask-neg-${this.id}-${i}`}>
        <rect width="100%" y=${100 - y_zero}% height="${y_zero}%" fill=${this.config.sparkline.styles.area_mask_below.fill}
         />
      </mask>
    </defs>

    <mask id=${`fill-${this.id}-${i}`}>
      <path class='fill'
        type=${this.config.sparkline.show.fill}
        .id=${i} anim=${this.config.sparkline.animate} ?init=${init}
        style="animation-delay: ${this.config.sparkline.animate ? `${i * 0.5}s` : "0s"}"
        fill='white'
        mask=${fade ? `url(#fill-grad-mask-pos-${this.id}-${i})` : ""}
        d=${this.area[i]}
      />
      ${this.Graph[i]._min < 0 ? svg`<path class='fill'
            type=${this.config.sparkline.show.fill}
            .id=${i} anim=${this.config.sparkline.animate} ?init=${init}
            style="animation-delay: ${this.config.sparkline.animate ? `${i * 0.5}s` : "0s"}"
            fill='white'
            mask=${fade ? `url(#fill-grad-mask-neg-${this.id}-${i})` : ""}
            d=${this.area[i]}
          />` : ""}
    </mask>`;
  }
  renderSvgAreaMinMaxMask(fill, i) {
    if (!["area", "line"].includes(this.config.sparkline.show.chart_type)) return;
    if (!fill) return;
    const fade = this.config.sparkline.show.fill === "fade";
    const init = this.length[i] || this._card.config.entities[i].show_line === false;
    const y_zero = this.Graph[i]._min >= 0 ? 0 : Math.abs(this.Graph[i]._min) / (this.Graph[i]._max - this.Graph[i]._min) * 100;
    return svg`
    <defs>
      <linearGradient id=${`fill-grad-pos-${this.id}-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop stop-color='white' offset='0%' stop-opacity='1'/>
        <stop stop-color='white' offset='100%' stop-opacity='0.1'/>
      </linearGradient>
      <mask id=${`fill-grad-mask-pos-${this.id}-${i}`}>
        <rect width="100%" height="${100 - y_zero}%" fill=${this.config.sparkline.styles.area_mask_above.fill}
         />
      </mask>
      <linearGradient id=${`fill-grad-neg-${this.id}-${i}`} x1="0%" y1="100%" x2="0%" y2="0%">
        <stop stop-color='white' offset='0%' stop-opacity='1'/>
        <stop stop-color='white' offset='100%' stop-opacity='0.1'/>
      </linearGradient>
      <mask id=${`fill-grad-mask-neg-${this.id}-${i}`}>
        <rect width="100%" y=${100 - y_zero}% height="${y_zero}%" fill=${this.config.sparkline.styles.area_mask_below.fill}
         />
      </mask>
    </defs>

    <mask id=${`fillMinMax-${this.id}-${i}`}>
      <path class='fill'
        type=${this.config.sparkline.show.fill}
        .id=${i} anim=${this.config.sparkline.animate} ?init=${init}
        style="animation-delay: ${this.config.sparkline.animate ? `${i * 0.5}s` : "0s"}"
        fill='#555555'
        mask=${fade ? `url(#fill-grad-mask-pos-${this.id}-${i})` : ""}
        d=${this.areaMinMax[i]}
      />
      ${this.Graph[i]._min < 0 ? svg`<path class='fill'
            type=${this.config.sparkline.show.fill}
            .id=${i} anim=${this.config.sparkline.animate} ?init=${init}
            style="animation-delay: ${this.config.sparkline.animate ? `${i * 0.5}s` : "0s"}"
            fill='#444444'
            mask=${fade ? `url(#fill-grad-mask-neg-${this.id}-${i})` : ""}
            d=${this.areaMinMax[i]}
          />` : ""}
    </mask>`;
  }
  renderSvgLineMask(line, i) {
    if (!line) return;
    const path = svg`
    <path
      class='line'
      .id=${i}
      anim=${this.config.sparkline.animate} ?init=${this.length[i]}
      style="animation-delay: ${this.config.sparkline.animate ? `${i * 0.5}s` : "0s"}"
      fill='none'
      stroke-dasharray=${this.length[i] || "none"} stroke-dashoffset=${this.length[i] || "none"}
      stroke=${"white"}
      stroke-width=${this.svg.line_width}
      d=${this.line[i]}
    />`;
    return svg`
    <mask id=${`line-${this.id}-${i}`}>
      ${path}
    </mask>
  `;
  }
  renderSvgLineMinMaxMask(line, i) {
    if (this.config.sparkline.show.chart_type !== "line") return;
    if (!line) return;
    const path = svg`
    <path
      class='lineMinMax'
      .id=${i}
      anim=${this.config.sparkline.animate} ?init=${this.length[i]}
      style="animation-delay: ${this.config.sparkline.animate ? `${i * 0.5}s` : "0s"}"
      fill='none'
      stroke-dasharray=${this.length[i] || "none"} stroke-dashoffset=${this.length[i] || "none"}
      stroke=${"white"}
      stroke-width=${this.svg.line_width}
      d=${this.line[i]}
    />`;
    return svg`
    <mask id=${`lineMinMax-${this.id}-${i}`}>
      ${path}
    </mask>
  `;
  }
  renderSvgPoint(point, i) {
    const color = this.gradient[i] ? this.computeColor(point[V], i) : "inherit";
    return svg`
    <circle
      class='line--point'
      ?inactive=${this.tooltip.index !== point[3]}
      style=${`--mcg-hover: ${color};`}
      stroke=${color}
      fill=${color}
      cx=${point[X]} cy=${point[Y]} r=${this.svg.line_width / 1.5}
      @mouseover=${() => this.setTooltip(i, point[3], point[V])}
      @mouseout=${() => this.tooltip = {}}
    />
  `;
  }
  renderSvgPoints(points, i) {
    if (!points) return;
    const color = this.computeColor(this._card.entities[i].state, i);
    return svg`
    <g class='line--points'
      ?tooltip=${this.tooltip.entity === i}
      ?inactive=${this.tooltip.entity !== void 0 && this.tooltip.entity !== i}
      ?init=${this.length[i]}
      anim=${this.config.sparkline.animate && this.config.sparkline.show.points !== "hover"}
      style="animation-delay: ${this.config.sparkline.animate ? `${i * 0.5 + 0.5}s` : "0s"}"
      fill=${color}
      stroke=${color}
      stroke-width=${this.svg.line_width / 2}
      >
      ${points.map((point) => this.renderSvgPoint(point, i))}
    </g>`;
  }
  renderSvgTrafficLight(trafficLight, i) {
    let size;
    if (this.config.sparkline.graded.square === true) {
      size = Math.min(trafficLight.width, trafficLight.height);
      if (size < trafficLight.height) {
        let spaceBetween = (this.svg.graph.height - this.gradeRanks.length * size) / (this.gradeRanks.length - 1);
        for (let j = 0; j < this.gradeRanks.length; j++) {
          trafficLight.y[j] = this.svg.graph.height + this.svg.margin.y - j * (size + spaceBetween);
        }
        trafficLight.height = size;
        trafficLight.width = size;
      } else {
        trafficLight.width = size;
      }
    }
    const tlRect = this.gradeRanks.map((bucket, k) => {
      const hasValue = typeof trafficLight.value[k] !== "undefined";
      const classList = hasValue ? this.classes.graded_foreground : this.classes.graded_background;
      const styleList = hasValue ? this.styles.graded_foreground : this.styles.graded_background;
      const color = hasValue ? this.computeColor(trafficLight.value[k] + 1e-3, 0) : "var(--theme-sys-elevation-surface-neutral4)";
      const rx = hasValue ? this.styles.graded_foreground?.rx || 0 : this.styles.graded_background?.rx || 0;
      const ry = hasValue ? this.styles.graded_foreground?.ry || rx : this.styles.graded_background?.ry || rx;
      return svg`
    <rect class="${classMap$a(classList)}" style="${styleMap$c(styleList)}"
      x=${trafficLight.x + this.svg.line_width / 2}
      y=${trafficLight.y[k] - 1 * trafficLight.height + this.svg.line_width / 2}
      height=${Math.max(1, trafficLight.height - this.svg.line_width)}
      width=${Math.max(1, trafficLight.width - this.svg.line_width)}
      stroke-width="${this.svg.line_width ? this.svg.line_width : 0}"
      fill=${color}
      stroke=${color}
      pathLength="10"
      rx=${rx}
      ry=${ry}
      >
    </rect>`;
    });
    return svg`
    ${tlRect}
    `;
  }
  renderSvgGraded(trafficLights, i) {
    if (!trafficLights) return;
    const color = this.computeColor(this._card.entities[i].state, i);
    const linesBelow = this.xLines.lines.map((helperLine) => {
      if (helperLine.zpos === "below") {
        return [svg`
        <line class=${classMap$a(this.classes[helperLine.id])}) style="${styleMap$c(this.styles[helperLine.id])}"
        x1="${this.svg.margin.x}" y1="${this.svg.margin.y + this.svg.graph.height / 2 + helperLine.yshift}"
        x2="${this.svg.graph.width + this.svg.margin.x}" y2="${this.svg.margin.y + this.svg.graph.height / 2 + helperLine.yshift}"
        pathLength="240"
        >
        </line>
        `];
      } else return [""];
    });
    const linesAbove = this.xLines.lines.map((helperLine) => {
      if (helperLine.zpos === "above") {
        return [svg`
        <line class="${classMap$a(this.classes[helperLine.id])}"
              style="${styleMap$c(this.styles[helperLine.id])}"
        x1="${this.svg.margin.x}" y1="${this.svg.margin.y + this.svg.graph.height / 2 + helperLine.yshift}"
        x2="${this.svg.graph.width + this.svg.margin.x}" y2="${this.svg.margin.y + this.svg.graph.height / 2 + helperLine.yshift}"
        pathLength="240"
        >
        </line>
        `];
      } else return [""];
    });
    return svg`
    <g class='traffic-lights'
      ?tooltip=${this.tooltip.entity === i}
      ?inactive=${this.tooltip.entity !== void 0 && this.tooltip.entity !== i}
      ?init=${this.length[i]}
      anim=${this.config.sparkline.animate && this.config.sparkline.show.points !== "hover"}
      style="animation-delay: ${this.config.sparkline.animate ? `${i * 0.5 + 0.5}s` : "0s"}"
      fill=${color}
      stroke=${color}
      stroke-width=${this.svg.line_width / 2}
      >
      ${linesBelow}
      ${trafficLights.map((trafficLight) => this.renderSvgTrafficLight(trafficLight, i))}
      ${linesAbove}
    </g>`;
  }
  renderSvgGradient(gradients) {
    if (!gradients) return;
    const items = gradients.map((gradient, i) => {
      if (!gradient) return;
      return svg`
      <linearGradient id=${`grad-${this.id}-${i}`} gradientTransform="rotate(90)">
        ${gradient.map((stop) => svg`
          <stop stop-color=${stop.color} offset=${`${stop.offset}%`} />
        `)}
      </linearGradient>`;
    });
    return svg`${items}`;
  }
  // Render the rectangle with the line color to be used.
  // The line itself is a mask, that only shows the colors behind it using 'white'
  // as the drawing (fill) color...
  renderSvgLineBackground(line, i) {
    if (!line) return;
    const fill = this.gradient[i] ? `url(#grad-${this.id}-${i})` : this.computeColor(this._card.entities[i].state, i);
    const linesBelow = this.xLines.lines.map((helperLine) => {
      if (helperLine.zpos === "below") {
        return [svg`
        <line class=${classMap$a(this.classes[helperLine.id])}) style="${styleMap$c(this.styles[helperLine.id])}"
        x1="${this.svg.margin.x}" y1="${this.svg.margin.y + this.svg.graph.height / 2 + helperLine.yshift}"
        x2="${this.svg.graph.width + this.svg.margin.x}" y2="${this.svg.margin.y + this.svg.graph.height / 2 + helperLine.yshift}"
        pathLength="240"
        >
        </line>
        `];
      } else return [""];
    });
    const linesAbove = this.xLines.lines.map((helperLine) => {
      if (helperLine.zpos === "above") {
        return [svg`
        <line class="${classMap$a(this.classes[helperLine.id])}"
              style="${styleMap$c(this.styles[helperLine.id])}"
        x1="${this.svg.margin.x}" y1="${this.svg.margin.y + this.svg.graph.height / 2 + helperLine.yshift}"
        x2="${this.svg.graph.width + this.svg.margin.x}" y2="${this.svg.margin.y + this.svg.graph.height / 2 + helperLine.yshift}"
        pathLength="240"
        >
        </line>
        `];
      } else return [""];
    });
    return svg`
    ${linesBelow}
    <rect class='line--rect'
      ?inactive=${this.tooltip.entity !== void 0 && this.tooltip.entity !== i}
      id=${`line-rect-${this.id}-${i}`}
      fill=${fill} height="100%" width="100%"
      mask=${`url(#line-${this.id}-${i})`}
    />
    ${linesAbove}
    `;
  }
  renderSvgLineMinMaxBackground(line, i) {
    if (this.config.sparkline.show.chart_type !== "line") return;
    if (!line) return;
    const fill = this.gradient[i] ? `url(#grad-${this.id}-${i})` : this.computeColor(this._card.entities[i].state, i);
    return svg`
    <rect class='line--rect'
      ?inactive=${this.tooltip.entity !== void 0 && this.tooltip.entity !== i}
      id=${`line-rect-${this.id}-${i}`}
      fill=${fill} height="100%" width="100%"
      mask=${`url(#lineMinMax-${this.id}-${i})`}
    />`;
  }
  // Render the area below the line graph.
  // Currently called the 'fill', but actually it should be named area, after
  // sparkline area graph according to the mighty internet.
  renderSvgAreaBackground(fill, i) {
    if (this.config.sparkline.show.chart_type !== "area") return;
    if (!fill) return;
    const svgFill = this.gradient[i] ? `url(#grad-${this.id}-${i})` : this.intColor(this._card.entities[i].state, i);
    const linesBelow = this.xLines.lines.map((helperLine) => {
      if (helperLine.zpos === "below") {
        return [svg`
          <line class=${classMap$a(this.classes[helperLine.id])}) style="${styleMap$c(this.styles[helperLine.id])}"
          x1="${this.svg.margin.x}" y1="${this.svg.margin.y + this.svg.graph.height / 2 + helperLine.yshift}"
          x2="${this.svg.graph.width + this.svg.margin.x}" y2="${this.svg.margin.y + this.svg.graph.height / 2 + helperLine.yshift}"
          pathLength="240"
          >
          </line>
          `];
      } else return [""];
    });
    const linesAbove = this.xLines.lines.map((helperLine) => {
      if (helperLine.zpos === "above") {
        return [svg`
          <line class="${classMap$a(this.classes[helperLine.id])}"
                style="${styleMap$c(this.styles[helperLine.id])}"
          x1="${this.svg.margin.x}" y1="${this.svg.margin.y + this.svg.graph.height / 2 + helperLine.yshift}"
          x2="${this.svg.graph.width + this.svg.margin.x}" y2="${this.svg.margin.y + this.svg.graph.height / 2 + helperLine.yshift}"
          pathLength="240"
          >
          </line>
          `];
      } else return [""];
    });
    return svg`
    ${linesBelow}
    <rect class='fill--rect'
      ?inactive=${this.tooltip.entity !== void 0 && this.tooltip.entity !== i}
      id=${`fill-rect-${this.id}-${i}`}
      fill=${svgFill} height="100%" width="100%"
      mask=${`url(#fill-${this.id}-${i})`}
    />
    ${linesAbove}
    `;
  }
  renderSvgAreaMinMaxBackground(fill, i) {
    if (!["area", "line"].includes(this.config.sparkline.show.chart_type)) return;
    if (!fill) return;
    const svgFill = this.gradient[i] ? `url(#grad-${this.id}-${i})` : this.intColor(this._card.entities[i].state, i);
    return svg`
    <rect class='fill--rect'
      ?inactive=${this.tooltip.entity !== void 0 && this.tooltip.entity !== i}
      id=${`fill-rect-${this.id}-${i}`}
      fill=${svgFill} height="100%" width="100%"
      mask=${`url(#fillMinMax-${this.id}-${i})`}
    />`;
  }
  renderSvgEqualizerMask(equalizer, index) {
    if (this.config.sparkline.show.chart_type !== "equalizer") return;
    if (!equalizer) return;
    const fade = this.config.sparkline.show.fill === "fade";
    `url(#fill-grad-mask-neg-${this.id}-${index}})`;
    const maskPos = `url(#fill-grad-mask-pos-${this.id}-${index}})`;
    const fillNeg = this.config.sparkline.styles.bar_mask_below.fill;
    const fillPos = this.config.sparkline.styles.bar_mask_above.fill;
    let size;
    if (this.config.sparkline.equalizer.square === true) {
      size = Math.min(equalizer[0].width, equalizer[0].height);
      if (size < equalizer[0].height) {
        let spaceBetween = (this.svg.height - this.config.sparkline.equalizer.value_buckets * size) / (this.config.sparkline.equalizer.value_buckets - 1);
        let newEq = equalizer.map((equalizerPart, i) => {
          let eq = { ...equalizerPart };
          for (let j = 0; j < equalizerPart.y.length; j++) {
            eq.y[j] = this.svg.height - j * (size + spaceBetween);
          }
          eq.width = size;
          eq.height = size;
          return eq;
        });
        equalizer = [...newEq];
      }
    }
    const paths = equalizer.map((equalizerPart, i) => {
      const equalizerPartRect = equalizerPart.value.map((single, j) => {
        const animation = this.config.sparkline.animate ? svg`
        <animate attributeName='y'
          from=${this.svg.height} to=${equalizerPart.y[j] - 1 * equalizerPart.height - this.svg.line_width}
          begin='0s' dur='2s' fill='remove' restart='whenNotActive' repeatCount='1'
          calcMode='spline' keyTimes='0; 1' keySplines='0.215 0.61 0.355 1'>
        </animate>` : "";
        return svg`
      <rect class="${classMap$a(this.classes.equalizer_part)}"
            style="${styleMap$c(this.styles.equalizer_part)}"
        data-size=${size}
        x=${equalizerPart.x}
        y=${equalizerPart.y[j] - equalizerPart.height - this.svg.line_width / 1e5}
        height=${Math.max(1, equalizerPart.height - this.svg.line_width)}
        width=${Math.max(1, equalizerPart.width - this.svg.line_width)}
        fill=${fade ? equalizerPart.value > 0 ? fillPos : fillNeg : "white"}
        stroke=${fade ? equalizerPart.value > 0 ? fillPos : fillNeg : "white"}
        stroke-width="${this.svg.line_width ? this.svg.line_width : 0}"
        rx="0%"
        style="transition: fill 5s ease;"
        @mouseover=${() => this.setTooltip(index, j, single)}
        @mouseout=${() => this.tooltip = {}}>
        ${this._firstUpdatedCalled ? animation : ""}
      </rect>`;
      });
      return svg`
      ${equalizerPartRect}`;
    });
    return svg`
    <defs>
      <linearGradient id=${`fill-grad-pos-${this.id}-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop stop-color='white' offset='0%' stop-opacity='1'/>
        <stop stop-color='white' offset='25%' stop-opacity='0.4'/>
        <stop stop-color='white' offset='60%' stop-opacity='0.0'/>
      </linearGradient>
      <linearGradient id=${`fill-grad-neg-${this.id}-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop stop-color='white' offset='40%' stop-opacity='0'/>
        <stop stop-color='white' offset='75%' stop-opacity='0.4'/>
        <stop stop-color='white' offset='100%' stop-opacity='1.0'/>
      </linearGradient>

      <mask id=${`fill-grad-mask-pos-${this.id}-${index}`}>
        <rect width="100%" height="100%"}
      </mask>
    </defs>  
    <mask id=${`equalizer-bg-${this.id}-${index}`}>
      ${paths}
      mask = ${maskPos}
    </mask>
  `;
  }
  renderSvgBarsMask(bars, index) {
    if (this.config.sparkline.show.chart_type !== "bar") return;
    if (!bars) return;
    const fade = this.config.sparkline.show.fill === "fade";
    `url(#fill-grad-mask-neg-${this.id}-${index}})`;
    const maskPos = `url(#fill-grad-mask-pos-${this.id}-${index}})`;
    const fillNeg = this.config.sparkline.styles.bar_mask_below.fill;
    const fillPos = this.config.sparkline.styles.bar_mask_above.fill;
    const paths = bars.map((bar, i) => {
      const animation = this.config.sparkline.animate ? svg`
        <animate attributeName='y' from=${this.svg.height} to=${bar.y} dur='2s' fill='remove'
          calcMode='spline' keyTimes='0; 1' keySplines='0.215 0.61 0.355 1'>
        </animate>` : "";
      return svg` 

      <rect class='bar' x=${bar.x} y=${bar.y + (bar.value > 0 ? +this.svg.line_width / 2 : -this.svg.line_width / 2)}
        height=${Math.max(1, bar.height - this.svg.line_width / 1 - 0)} width=${bar.width}
        fill=${fade ? bar.value > 0 ? fillPos : fillNeg : "white"}
        stroke=${fade ? bar.value > 0 ? fillPos : fillNeg : "white"}
        stroke-width="${this.svg.line_width ? this.svg.line_width : 0}"
        @mouseover=${() => this.setTooltip(index, i, bar.value)}
        @mouseout=${() => this.tooltip = {}}>
        ${this._firstUpdatedCalled ? animation : ""}
      </rect>`;
    });
    return svg`
    <defs>
      <linearGradient id=${`fill-grad-pos-${this.id}-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop stop-color='white' offset='0%' stop-opacity='1'/>
        <stop stop-color='white' offset='25%' stop-opacity='0.4'/>
        <stop stop-color='white' offset='60%' stop-opacity='0.0'/>
      </linearGradient>
      <linearGradient id=${`fill-grad-neg-${this.id}-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop stop-color='white' offset='40%' stop-opacity='0'/>
        <stop stop-color='white' offset='75%' stop-opacity='0.4'/>
        <stop stop-color='white' offset='100%' stop-opacity='1.0'/>
      </linearGradient>

      <mask id=${`fill-grad-mask-pos-${this.id}-${index}`}>
        <rect width="100%" height="100%"}
      </mask>
    </defs>  
    <mask id=${`bars-bg-${this.id}-${index}`}>
      ${paths}
      mask = ${maskPos}
    </mask>
  `;
  }
  renderSvgEqualizerBackground(equalizer, index) {
    if (this.config.sparkline.show.chart_type !== "equalizer") return;
    if (!equalizer) return;
    const fade = this.config.sparkline.show.fill === "fadenever";
    if (fade) {
      this.length[index] || this._card.config.entities[index].show_line === false;
      const svgFill = this.gradient[index] ? `url(#grad-${this.id}-${index})` : this.intColor(this._card.entities[index].state, index);
      this.gradient[index] ? `url(#fill-grad${this.id}-${index})` : this.intColor(this._card.entities[index].state, index);
      return svg`
      <defs>
        <linearGradient id=${`fill-grad-${this.id}-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop stop-color='white' offset='0%' stop-opacity='1'/>
          <stop stop-color='white' offset='100%' stop-opacity='.1'/>
        </linearGradient>

        <mask id=${`fill-grad-mask-${this.id}-${index}`}>
          <rect width="100%" height="100%" fill=${`url(#fill-grad-${this.id}-${index})`}
        </mask>
      </defs>

      <g mask = ${`url(#fill-grad-mask-${this.id}-${index})`}>
        <rect class='equalizer--bg'
          ?inactive=${this.tooltip.entity !== void 0 && this.tooltip.entity !== index}
          id=${`equalizer-bg-${this.id}-${index}`}
          fill=${svgFill} height="100%" width="100%"
          mask=${`url(#equalizer-bg-${this.id}-${index})`}
        />
      /g>`;
    } else {
      const fill = this.gradient[index] ? `url(#grad-${this.id}-${index})` : this.computeColor(this._card.entities[index].state, index);
      const linesBelow = this.xLines.lines.map((helperLine) => {
        if (helperLine.zpos === "below") {
          return [svg`
            <line class=${classMap$a(this.classes[helperLine.id])}) style="${styleMap$c(this.styles[helperLine.id])}"
            x1="${this.svg.margin.x}" y1="${this.svg.margin.y + this.svg.graph.height / 2 + helperLine.yshift}"
            x2="${this.svg.graph.width + this.svg.margin.x}" y2="${this.svg.margin.y + this.svg.graph.height / 2 + helperLine.yshift}"
            pathLength="240"
            >
            </line>
            `];
        } else return [""];
      });
      const linesAbove = this.xLines.lines.map((helperLine) => {
        if (helperLine.zpos === "above") {
          return [svg`
            <line class="${classMap$a(this.classes[helperLine.id])}"
                  style="${styleMap$c(this.styles[helperLine.id])}"
            x1="${this.svg.margin.x}" y1="${this.svg.margin.y + this.svg.graph.height / 2 + helperLine.yshift}"
            x2="${this.svg.graph.width + this.svg.margin.x}" y2="${this.svg.margin.y + this.svg.graph.height / 2 + helperLine.yshift}"
            pathLength="240"
            >
            </line>
            `];
        } else return [""];
      });
      return svg`
      ${linesBelow}
      <rect class='equalizer--bg'
        ?inactive=${this.tooltip.entity !== void 0 && this.tooltip.entity !== index}
        id=${`equalizer-bg-${this.id}-${index}`}
        fill=${fill} height="100%" width="100%"
        mask=${`url(#equalizer-bg-${this.id}-${index})`}
      />
      ${linesAbove}
      `;
    }
  }
  renderSvgBarsBackground(bars, index) {
    if (this.config.sparkline.show.chart_type !== "bar") return;
    if (!bars) return;
    const fade = this.config.sparkline.show.fill === "fadenever";
    if (fade) {
      this.length[index] || this._card.config.entities[index].show_line === false;
      const svgFill = this.gradient[index] ? `url(#grad-${this.id}-${index})` : this.intColor(this._card.entities[index].state, index);
      this.gradient[index] ? `url(#fill-grad${this.id}-${index})` : this.intColor(this._card.entities[index].state, index);
      return svg`
      <defs>
        <linearGradient id=${`fill-grad-${this.id}-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop stop-color='white' offset='0%' stop-opacity='1'/>
          <stop stop-color='white' offset='100%' stop-opacity='.1'/>
        </linearGradient>

        <mask id=${`fill-grad-mask-${this.id}-${index}`}>
          <rect width="100%" height="100%" fill=${`url(#fill-grad-${this.id}-${index})`}
        </mask>
      </defs>

      <g mask = ${`url(#fill-grad-mask-${this.id}-${index})`}>
        <rect class='bars--bg'
          ?inactive=${this.tooltip.entity !== void 0 && this.tooltip.entity !== index}
          id=${`bars-bg-${this.id}-${index}`}
          fill=${svgFill} height="100%" width="100%"
          mask=${`url(#bars-bg-${this.id}-${index})`}
        />
      /g>`;
    } else {
      const fill = this.gradient[index] ? `url(#grad-${this.id}-${index})` : this.computeColor(this._card.entities[index].state, index);
      return svg`
      <rect class='bars--bg'
        ?inactive=${this.tooltip.entity !== void 0 && this.tooltip.entity !== index}
        id=${`bars-bg-${this.id}-${index}`}
        fill=${fill} height="100%" width="100%"
        mask=${`url(#bars-bg-${this.id}-${index})`}
      />`;
    }
  }
  // This function to use for coloring the full bar depending on colorstop or color
  // This depends on the style setting. Don't know which one at this point
  renderSvgBars(bars, index) {
    if (!bars) return;
    const items = bars.map((bar, i) => {
      const animation = this.config.sparkline.animate ? svg`
        <animate attributeName='y' from=${this.svg.height} to=${bar.y} dur='2s' fill='remove'
          calcMode='spline' keyTimes='0; 1' keySplines='0.215 0.61 0.355 1'>
        </animate>` : "";
      const color = this.computeColor(bar.value, index);
      return svg` 
      <rect class='bar' x=${bar.x} y=${bar.y}
        height=${bar.height} width=${bar.width} fill=${color}
        @mouseover=${() => this.setTooltip(index, i, bar.value)}
        @mouseout=${() => this.tooltip = {}}>
        ${this._firstUpdatedCalled ? animation : ""}
      </rect>`;
    });
    return svg`<g class='bars' ?anim=${this.config.sparkline.animate}>${items}</g>`;
  }
  renderSvgRadialBarcodeBin(bin, path, index) {
    const color = this.intColor(bin.value, 0);
    return svg`
  <path class="${classMap$a(this.classes.clock_graph)}"
        style="${styleMap$c(this.styles.clock_graph)}"
    d=${path}
    fill=${color}
    stroke=${color}
  >
  `;
  }
  renderSvgRadialBarcodeBackgroundBin(bin, path, index) {
    return svg`
  <path class="${classMap$a(this.classes.radial_barcode_background)}"
        style="${styleMap$c(this.styles.radial_barcode_background)}"
    d=${path}
  >
  `;
  }
  renderSvgRadialBarcodeBackground(radius) {
    const {
      start,
      end,
      start2,
      end2,
      largeArcFlag,
      sweepFlag
    } = this.Graph[0]._calcRadialBarcodeCoords(0, 359.9, true, radius, radius, this.radialBarcodeChartWidth);
    const radius2 = { x: radius - this.radialBarcodeChartWidth, y: radius - this.radialBarcodeChartWidth };
    const d2 = [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      sweepFlag,
      end.x,
      end.y,
      "L",
      end2.x,
      end2.y,
      "A",
      radius2.x,
      radius2.y,
      0,
      largeArcFlag,
      sweepFlag === "0" ? "1" : "0",
      start2.x,
      start2.y,
      "Z"
    ].join(" ");
    return svg`
    <path
      style="fill: lightgray; opacity: 0.4"
      d="${d2}"
    />
  `;
  }
  renderSvgRadialBarcodeFace(radius) {
    if (!this.config?.clock?.face) return svg``;
    const renderDayNight = () => this.config.radial_barcode.face?.show_day_night === true ? svg`
          <circle pathLength="1"
          class="${classMap$a(this.classes.radial_barcode_face_day_night)}" style="${styleMap$c(this.styles.radial_barcode_face_day_night)}"
          r="${this.svg.clockface.dayNightRadius}" cx=${this.svg.width / 2} cy="${this.svg.height / 2}"
          />
        ` : "";
    const renderHourMarks = () => this.config.radial_barcode.face?.show_hour_marks === true ? svg`
        <circle pathLength=${this.config.radial_barcode.face.hour_marks_count}
        class="${classMap$a(this.classes.radial_barcode_face_hour_marks)}" style="${styleMap$c(this.styles.radial_barcode_face_hour_marks)}"
        r="${this.svg.clockface.hourMarksRadius}" cx=${this.svg.width / 2} cy="${this.svg.height / 2}"
        />
       ` : "";
    const renderAbsoluteHourNumbers = () => this.config.radial_barcode.face?.show_hour_numbers === "absolute" ? svg`
        <g>
          <text class="${classMap$a(this.classes.radial_barcode_face_hour_numbers)}" style="${styleMap$c(this.styles.radial_barcode_face_hour_numbers)}"
            x="${this.svg.width / 2}" y="${this.svg.height / 2 - this.svg.clockface.hourNumbersRadius}"
            >24</text>
          <text class="${classMap$a(this.classes.radial_barcode_face_hour_numbers)}" style="${styleMap$c(this.styles.radial_barcode_face_hour_numbers)}"
            x="${this.svg.width / 2}" y="${this.svg.height / 2 + this.svg.clockface.hourNumbersRadius}"
            >12</text>
          <text class="${classMap$a(this.classes.radial_barcode_face_hour_numbers)}" style="${styleMap$c(this.styles.radial_barcode_face_hour_numbers)}"
            x="${this.svg.width / 2 + this.svg.clockface.hourNumbersRadius}" y="${this.svg.height / 2}"
            >6</text>
          <text class="${classMap$a(this.classes.radial_barcode_face_hour_numbers)}" style="${styleMap$c(this.styles.radial_barcode_face_hour_numbers)}"
            x="${this.svg.width / 2 - this.svg.clockface.hourNumbersRadius}" y="${this.svg.height / 2}"
            >18</text>
        </g>` : "";
    const renderRelativeHourNumbers = () => this.config.radial_barcode.face?.show_hour_numbers === "relative" ? svg`
        <g>
          <text class="${classMap$a(this.classes.radial_barcode_face_hour_numbers)}" style="${styleMap$c(this.styles.radial_barcode_face_hour_numbers)}"
            x="${this.svg.width / 2}" y="${this.svg.height / 2 - this.svg.clockface.hourNumbersRadius}"
            >0</text>
          <text class="${classMap$a(this.classes.radial_barcode_face_hour_numbers)}" style="${styleMap$c(this.styles.radial_barcode_face_hour_numbers)}"
            x="${this.svg.width / 2}" y="${this.svg.height / 2 + this.svg.clockface.hourNumbersRadius}"
            >-12</text>
          <text class="${classMap$a(this.classes.radial_barcode_face_hour_numbers)}" style="${styleMap$c(this.styles.radial_barcode_face_hour_numbers)}"
            x="${this.svg.width / 2 + this.svg.clockface.hourNumbersRadius}" y="${this.svg.height / 2}"
            >-18</text>
          <text class="${classMap$a(this.classes.radial_barcode_face_hour_numbers)}" style="${styleMap$c(this.styles.radial_barcode_face_hour_numbers)}"
            x="${this.svg.width / 2 - this.svg.clockface.hourNumbersRadius}" y="${this.svg.height / 2}"
            >-6</text>

        </g>` : "";
    return svg`
    ${renderDayNight()}
    ${renderHourMarks()}
    ${renderAbsoluteHourNumbers()}
    ${renderRelativeHourNumbers()}
  `;
  }
  // See here: https://pro.arcgis.com/en/pro-app/latest/help/analysis/geoprocessing/charts/data-clock.htm
  // for nice naming conventions using ring, wedge and bin!
  renderSvgRadialBarcode(radialBarcode, index) {
    if (!radialBarcode) return;
    const radialBarcodePaths = this.Graph[index].getRadialBarcodePaths();
    const radialBarcodeBackgroundPaths = this.Graph[index].getRadialBarcodeBackgroundPaths();
    return svg`
    <g class='graph-clock'
      ?tooltip=${this.tooltip.entity === index}
      ?inactive=${this.tooltip.entity !== void 0 && this.tooltip.entity !== index}
      ?init=${this.length[index]}
      anim=${this.config.sparkline.animate && this.config.sparkline.show.points !== "hover"}
      style="animation-delay: ${this.config.sparkline.animate ? `${index * 0.5 + 0.5}s` : "0s"}"
      stroke-width=${this.svg.line_width / 2}>
      ${this.radialBarcodeChartBackground[index].map((bin, i) => this.renderSvgRadialBarcodeBackgroundBin(bin, radialBarcodeBackgroundPaths[i], i))}
      ${radialBarcode.map((bin, i) => this.renderSvgRadialBarcodeBin(bin, radialBarcodePaths[i], i))}
      ${this.renderSvgRadialBarcodeFace(this.svg.width / 2 - 2 * 20)}
    </g>`;
  }
  renderSvgBarcode(barcode, index) {
    if (!barcode) return;
    const paths = barcode.map((barcodePart, i) => {
      let color;
      if (this.config.sparkline.state_values?.use_value === "bin") {
        const flooredValue = Math.floor(barcodePart.value);
        if (this.gradeRanks[flooredValue]?.value) {
          const colorValue = this.gradeRanks[flooredValue].value[0] + (this.gradeRanks[flooredValue].rangeMax[0] - this.gradeRanks[flooredValue].rangeMin[0]) * (barcodePart.value - flooredValue);
          color = this.intColor(colorValue, 0);
        } else {
          console.log("renderbarcode, illegal value", barcodePart.value);
        }
      } else {
        color = this.intColor(barcodePart.value, 0);
      }
      const animation = this.config.sparkline.animate ? svg`
        <animate attributeName='x' from=${this.svg.margin.x} to=${barcodePart.x} dur='3s' fill='remove'
          calcMode='spline' keyTimes='0; 1' keySplines='0.215 0.61 0.355 1'>
        </animate>` : "";
      const rx = this.styles.barcode_graph?.rx || 0;
      const ry = this.styles.barcode_graph?.ry || rx;
      const realHeight = barcodePart.height - this.svg.margin.t - this.svg.margin.b - this.svg.line_width;
      const yCorr = realHeight < 1 ? -(1 - realHeight) : 0;
      return svg` 
      <!-- Barcode Part -->
      <rect class="${classMap$a(this.classes.barcode_graph)}"
            style="${styleMap$c(this.styles.barcode_graph)}"
        x=${barcodePart.x}
        y=${barcodePart.y + yCorr + this.svg.margin.t - this.svg.margin.b + this.svg.line_width / 2}
        height=${Math.max(1, barcodePart.height - this.svg.margin.t - this.svg.margin.b - this.svg.line_width)}
        width=${Math.max(barcodePart.width, 1)}
        fill=${color}
        stroke=${color}
        stroke-width="${this.svg.line_width ? this.svg.line_width : 0}"
        rx="${rx}"
        ry="${ry}"
        @mouseover=${() => this.setTooltip(index, i, barcodePart.value)}
        @mouseout=${() => this.tooltip = {}}>
        ${this._firstUpdatedCalled ? animation : ""}
      </rect>`;
    });
    const linesBelow = this.xLines.lines.map((line) => {
      if (line.zpos === "below") {
        return [svg`
        <!-- Line Below -->
        <line class=${classMap$a(this.classes[line.id])} style="${styleMap$c(this.styles[line.id])}"
        x1="${this.svg.margin.x}" y1="${this.svg.margin.y + this.svg.graph.height / 2 + line.yshift}"
        x2="${this.svg.graph.width + this.svg.margin.x}" y2="${this.svg.margin.y + this.svg.graph.height / 2 + line.yshift}"
        pathLength="240"
        >
        </line>
        `];
      } else return [""];
    });
    const linesAbove = this.xLines.lines.map((line) => {
      if (line.zpos === "above") {
        return [svg`
        <!-- Line Above-->
        <line class="${classMap$a(this.classes[line.id])}"
              style="${styleMap$c(this.styles[line.id])}"
        x1="${this.svg.margin.x}" y1="${this.svg.margin.y + this.svg.graph.height / 2 + line.yshift}"
        x2="${this.svg.graph.width + this.svg.margin.x}" y2="${this.svg.margin.y + this.svg.graph.height / 2 + line.yshift}"
        pathLength="240"
        >
        </line>
        `];
      } else return [""];
    });
    return svg`
    <!-- Sparkline Barcode Render -->
    <g id="linesBelow">
      ${linesBelow}
    </g>
    <g id="BarcodeParts">
      ${paths}
    </g>
    <g id="linesAbove">
      ${linesAbove}
    </g>
  `;
  }
  renderSvg() {
    let i = 0;
    if (this.config.sparkline.colorstops.colors.length > 0 && !this._card.config.entities[i].color)
      this.gradient[i] = this.Graph[i].computeGradient(
        this.config.sparkline.colorstops.colors,
        this.config.sparkline.state_values.logarithmic
      );
    this.MergeAnimationClassIfChanged();
    this.MergeAnimationStyleIfChanged();
    return svg`
    <svg width="${this.svg.width}" height="${this.svg.height}" overflow="visible"
      x="${this.svg.x}" y="${this.svg.y}"
    >
      <g>
        <!-- Sparkline Tool Gradient Defs -->
        <defs>
          ${this.renderSvgGradient(this.gradient)}
        </defs>
        <!-- Sparkline Tool Graph Area -->
        <svg viewbox="0 0 ${this.svg.width} ${this.svg.height}"
         overflow="visible"
        >
        ${this.area.map((fill, i2) => this.renderSvgAreaMask(fill, i2))}
        ${this.area.map((fill, i2) => this.renderSvgAreaBackground(fill, i2))}
        ${this.areaMinMax.map((fill, i2) => this.renderSvgAreaMinMaxMask(fill, i2))}
        ${this.areaMinMax.map((fill, i2) => this.renderSvgAreaMinMaxBackground(fill, i2))}
        ${this.line.map((line, i2) => this.renderSvgLineMask(line, i2))}
        ${this.line.map((line, i2) => this.renderSvgLineBackground(line, i2))}
        ${this.bar.map((bars, i2) => this.renderSvgBarsMask(bars, i2))}
        ${this.bar.map((bars, i2) => this.renderSvgBarsBackground(bars, i2))}
        ${this.equalizer.map((equalizer, i2) => this.renderSvgEqualizerMask(equalizer, i2))}
        ${this.equalizer.map((equalizer, i2) => this.renderSvgEqualizerBackground(equalizer, i2))}
        ${this.points.map((points, i2) => this.renderSvgPoints(points, i2))}
        ${this.barcodeChart.map((barcodePart, i2) => this.renderSvgBarcode(barcodePart, i2))}
        ${this.radialBarcodeChart.map((radialPart, i2) => this.renderSvgRadialBarcode(radialPart, i2))}
        ${this.graded.map((grade, i2) => this.renderSvgGraded(grade, i2))}
        </svg>
      </g>
    </svg>`;
  }
  updated(changedProperties) {
    if (this.config.sparkline.animate && changedProperties.has("line")) {
      if (this.length.length < this.entity.length) {
        this._card.shadowRoot.querySelectorAll("svg path.line").forEach((ele) => {
          this.length[ele.id] = ele.getTotalLength();
        });
        this.length = [...this.length];
      } else {
        this.length = Array(this.entity.length).fill("none");
      }
    }
  }
  /** *****************************************************************************
    * SparklineGraphTool::render()
    *
    * Summary.
    * The actual render() function called by the card for each tool.
    *
    */
  render() {
    return svg`
        <!-- Sparkline Tool Render -->
        <g
          id="sparkline-${this.toolId}"
          class="${classMap$a(this.classes.tool)}" style="${styleMap$c(this.styles.tool)}"
          @click=${(e) => this.handleTapEvent(e, this.config)}>
          ${this.renderSvg()}
        </g>
      `;
  }
}
class HorseshoeTool extends BaseTool {
  // Donut starts at -220 degrees and is 260 degrees in size.
  // zero degrees is at 3 o'clock.
  constructor(argToolset, argConfig, argPos) {
    const DEFAULT_HORSESHOE_CONFIG = {
      position: {
        cx: 50,
        cy: 50,
        radius: 45
      },
      card_filter: "card--filter-none",
      horseshoe_scale: {
        min: 0,
        max: 100,
        width: 3,
        color: "var(--primary-background-color)"
      },
      horseshoe_state: {
        width: 6,
        color: "var(--primary-color)"
      },
      show: {
        horseshoe: true,
        scale_tickmarks: false,
        horseshoe_style: "fixed"
      }
    };
    super(argToolset, Merge.mergeDeep(DEFAULT_HORSESHOE_CONFIG, argConfig), argPos);
    this.HORSESHOE_RADIUS_SIZE = 0.45 * SVG_VIEW_BOX;
    this.TICKMARKS_RADIUS_SIZE = 0.43 * SVG_VIEW_BOX;
    this.HORSESHOE_PATH_LENGTH = 2 * 260 / 360 * Math.PI * this.HORSESHOE_RADIUS_SIZE;
    this.config.entity_index = this.config.entity_index ? this.config.entity_index : 0;
    this.svg.radius = Utils.calculateSvgDimension(this.config.position.radius);
    this.svg.radius_ticks = Utils.calculateSvgDimension(0.95 * this.config.position.radius);
    this.svg.horseshoe_scale = {};
    this.svg.horseshoe_scale.width = Utils.calculateSvgDimension(this.config.horseshoe_scale.width);
    this.svg.horseshoe_state = {};
    this.svg.horseshoe_state.width = Utils.calculateSvgDimension(this.config.horseshoe_state.width);
    this.svg.horseshoe_scale.dasharray = 2 * 26 / 36 * Math.PI * this.svg.radius;
    this.svg.rotate = {};
    this.svg.rotate.degrees = -220;
    this.svg.rotate.cx = this.svg.cx;
    this.svg.rotate.cy = this.svg.cy;
    this.colorStops = {};
    if (this.config.color_stops) {
      Object.keys(this.config.color_stops).forEach((key) => {
        this.colorStops[key] = this.config.color_stops[key];
      });
    }
    this.sortedStops = Object.keys(this.colorStops).map((n) => Number(n)).sort((a, b) => a - b);
    this.colorStopsMinMax = {};
    this.colorStopsMinMax[this.config.horseshoe_scale.min] = this.colorStops[this.sortedStops[0]];
    this.colorStopsMinMax[this.config.horseshoe_scale.max] = this.colorStops[this.sortedStops[this.sortedStops.length - 1]];
    this.color0 = this.colorStops[this.sortedStops[0]];
    this.color1 = this.colorStops[this.sortedStops[this.sortedStops.length - 1]];
    this.angleCoords = {
      x1: "0%",
      y1: "0%",
      x2: "100%",
      y2: "0%"
    };
    this.color1_offset = "0%";
    if (this.dev.debug) console.log("HorseshoeTool constructor coords, dimensions", this.coords, this.dimensions, this.svg, this.config);
  }
  /** *****************************************************************************
  * HorseshoeTool::value()
  *
  * Summary.
  * Sets the value of the horseshoe. Value updated via set hass.
  * Calculate horseshoe settings & colors depening on config and new value.
  *
  */
  set value(state) {
    if (this._stateValue === state) return;
    this._stateValuePrev = this._stateValue || state;
    this._stateValue = state;
    this._stateValueIsDirty = true;
    const min = this.config.horseshoe_scale.min || 0;
    const max = this.config.horseshoe_scale.max || 100;
    const val = Math.min(Utils.calculateValueBetween(min, max, state), 1);
    const score = val * this.HORSESHOE_PATH_LENGTH;
    const total = 10 * this.HORSESHOE_RADIUS_SIZE;
    this.dashArray = `${score} ${total}`;
    const strokeStyle = this.config.show.horseshoe_style;
    if (strokeStyle === "fixed") {
      this.stroke_color = this.config.horseshoe_state.color;
      this.color0 = this.config.horseshoe_state.color;
      this.color1 = this.config.horseshoe_state.color;
      this.color1_offset = "0%";
    } else if (strokeStyle === "autominmax") {
      const stroke = Colors.calculateColor(state, this.colorStopsMinMax, true);
      this.color0 = stroke;
      this.color1 = stroke;
      this.color1_offset = "0%";
    } else if (strokeStyle === "colorstop" || strokeStyle === "colorstopgradient") {
      const stroke = Colors.calculateColor(state, this.colorStops, strokeStyle === "colorstopgradient");
      this.color0 = stroke;
      this.color1 = stroke;
      this.color1_offset = "0%";
    } else if (strokeStyle === "lineargradient") {
      const angleCoords = {
        x1: "0%",
        y1: "0%",
        x2: "100%",
        y2: "0%"
      };
      this.color1_offset = `${Math.round((1 - val) * 100)}%`;
      this.angleCoords = angleCoords;
    }
    if (this.dev.debug) console.log("HorseshoeTool set value", this.cardId, state);
  }
  /** *****************************************************************************
  * HorseshoeTool::_renderTickMarks()
  *
  * Summary.
  * Renders the tick marks on the scale.
  *
  */
  _renderTickMarks() {
    const { config } = this;
    if (!config.show.scale_tickmarks) return;
    const stroke = config.horseshoe_scale.color ? config.horseshoe_scale.color : "var(--primary-background-color)";
    const tickSize = config.horseshoe_scale.ticksize ? config.horseshoe_scale.ticksize : (config.horseshoe_scale.max - config.horseshoe_scale.min) / 10;
    const fullScale = 260;
    const remainder = config.horseshoe_scale.min % tickSize;
    const startTickValue = config.horseshoe_scale.min + (remainder === 0 ? 0 : tickSize - remainder);
    const startAngle = (startTickValue - config.horseshoe_scale.min) / (config.horseshoe_scale.max - config.horseshoe_scale.min) * fullScale;
    const tickSteps = (config.horseshoe_scale.max - startTickValue) / tickSize;
    let steps = Math.floor(tickSteps);
    const angleStepSize = (fullScale - startAngle) / tickSteps;
    if (Math.floor(steps * tickSize + startTickValue) <= config.horseshoe_scale.max) {
      steps += 1;
    }
    const radius = this.svg.horseshoe_scale.width ? this.svg.horseshoe_scale.width / 2 : 6 / 2;
    let angle;
    const scaleItems = [];
    let i;
    for (i = 0; i < steps; i++) {
      angle = startAngle + (-230 + (360 - i * angleStepSize)) * Math.PI / 180;
      scaleItems[i] = svg`
        <circle cx="${this.svg.cx - Math.sin(angle) * this.svg.radius_ticks}"
                cy="${this.svg.cy - Math.cos(angle) * this.svg.radius_ticks}" r="${radius}"
                fill="${stroke}">
      `;
    }
    return svg`${scaleItems}`;
  }
  /** *****************************************************************************
  * HorseshoeTool::_renderHorseShoe()
  *
  * Summary.
  * Renders the horseshoe group.
  *
  * Description.
  * The horseshoes are rendered in a viewbox of 200x200 (SVG_VIEW_BOX).
  * Both are centered with a radius of 45%, ie 200*0.45 = 90.
  *
  * The foreground horseshoe is always rendered as a gradient with two colors.
  *
  * The horseshoes are rotated 220 degrees and are 2 * 26/36 * Math.PI * r in size
  * There you get your value of 408.4070449,180 ;-)
  */
  _renderHorseShoe() {
    if (!this.config.show.horseshoe) return;
    return svg`
      <g id="horseshoe__group-inner" class="horseshoe__group-inner">
        <circle id="horseshoe__scale" class="horseshoe__scale" cx="${this.svg.cx}" cy="${this.svg.cy}" r="${this.svg.radius}"
          fill="${this.fill || "rgba(0, 0, 0, 0)"}"
          stroke="${this.config.horseshoe_scale.color || "#000000"}"
          stroke-dasharray="${this.svg.horseshoe_scale.dasharray}"
          stroke-width="${this.svg.horseshoe_scale.width}"
          stroke-linecap="square"
          transform="rotate(-220 ${this.svg.rotate.cx} ${this.svg.rotate.cy})"/>

        <circle id="horseshoe__state__value" class="horseshoe__state__value" cx="${this.svg.cx}" cy="${this.svg.cy}" r="${this.svg.radius}"
          fill="${this.config.fill || "rgba(0, 0, 0, 0)"}"
          stroke="url('#horseshoe__gradient-${this.cardId}')"
          stroke-dasharray="${this.dashArray}"
          stroke-width="${this.svg.horseshoe_state.width}"
          stroke-linecap="square"
          transform="rotate(-220 ${this.svg.rotate.cx} ${this.svg.rotate.cy})"/>

        ${this._renderTickMarks()}
      </g>
    `;
  }
  /** *****************************************************************************
  * HorseshoeTool::render()
  *
  * Summary.
  * The render() function for this object.
  *
  */
  render() {
    return svg`
      <g "" id="horseshoe-${this.toolId}" class="horseshoe__group-outer"
        @click=${(e) => this.handleTapEvent(e, this.config)}>
        ${this._renderHorseShoe()}
      </g>

      <svg style="width:0;height:0;position:absolute;" aria-hidden="true" focusable="false">
        <linearGradient gradientTransform="rotate(0)" id="horseshoe__gradient-${this.cardId}" x1="${this.angleCoords.x1}", y1="${this.angleCoords.y1}", x2="${this.angleCoords.x2}" y2="${this.angleCoords.y2}">
          <stop offset="${this.color1_offset}" stop-color="${this.color1}" />
          <stop offset="100%" stop-color="${this.color0}" />
        </linearGradient>
      </svg>

    `;
  }
}
function classMap$9(classes) {
  if (!classes) return "";
  return Object.entries(classes).filter(([_, value]) => value).map(([key, _]) => key).join(" ");
}
function styleMap$b(styles) {
  if (!styles) return "";
  return Object.entries(styles).filter(([_, value]) => value != null && value !== "").map(([key, value]) => `${key}: ${value}`).join("; ");
}
class LineTool extends BaseTool {
  constructor(argToolset, argConfig, argPos) {
    const DEFAULT_LINE_CONFIG = {
      position: {
        orientation: "vertical",
        length: "10",
        cx: "50",
        cy: "50"
      },
      classes: {
        tool: {
          "sak-line": true,
          hover: true
        },
        line: {
          "sak-line__line": true
        }
      },
      styles: {
        tool: {},
        line: {}
      }
    };
    super(argToolset, Merge.mergeDeep(DEFAULT_LINE_CONFIG, argConfig), argPos);
    if (!["horizontal", "vertical", "fromto"].includes(this.config.position.orientation))
      throw Error("LineTool::constructor - invalid orientation [vertical, horizontal, fromto] = ", this.config.position.orientation);
    if (["horizontal", "vertical"].includes(this.config.position.orientation))
      this.svg.length = Utils.calculateSvgDimension(argConfig.position.length);
    if (this.config.position.orientation === "fromto") {
      this.svg.x1 = Utils.calculateSvgCoordinate(argConfig.position.x1, this.toolsetPos.cx);
      this.svg.y1 = Utils.calculateSvgCoordinate(argConfig.position.y1, this.toolsetPos.cy);
      this.svg.x2 = Utils.calculateSvgCoordinate(argConfig.position.x2, this.toolsetPos.cx);
      this.svg.y2 = Utils.calculateSvgCoordinate(argConfig.position.y2, this.toolsetPos.cy);
    } else if (this.config.position.orientation === "vertical") {
      this.svg.x1 = this.svg.cx;
      this.svg.y1 = this.svg.cy - this.svg.length / 2;
      this.svg.x2 = this.svg.cx;
      this.svg.y2 = this.svg.cy + this.svg.length / 2;
    } else if (this.config.position.orientation === "horizontal") {
      this.svg.x1 = this.svg.cx - this.svg.length / 2;
      this.svg.y1 = this.svg.cy;
      this.svg.x2 = this.svg.cx + this.svg.length / 2;
      this.svg.y2 = this.svg.cy;
    }
    this.classes.line = {};
    this.styles.line = {};
    if (this.dev.debug) console.log("LineTool constructor coords, dimensions", this.coords, this.dimensions, this.svg, this.config);
  }
  /** *****************************************************************************
  * LineTool::_renderLine()
  *
  * Summary.
  * Renders the line using precalculated coordinates and dimensions.
  * Only the runtime style is calculated before rendering the line
  *
  * @returns  {svg} Rendered line
  *
  */
  _renderLine() {
    this.MergeAnimationClassIfChanged();
    this.MergeAnimationStyleIfChanged();
    this.MergeColorFromState(this.styles.line);
    if (this.dev.debug) console.log("_renderLine", this.config.position.orientation, this.svg.x1, this.svg.y1, this.svg.x2, this.svg.y2);
    return svg`
      <line class="${classMap$9(this.classes.line)}"
        x1="${this.svg.x1}"
        y1="${this.svg.y1}"
        x2="${this.svg.x2}"
        y2="${this.svg.y2}"
        style="${styleMap$b(this.styles.line)}"/>
      `;
  }
  /** *****************************************************************************
  * LineTool::render()
  *
  * Summary.
  * The render() function for this object.
  *
  * @returns  {svg} Rendered line group
  *
  */
  render() {
    return svg`
      <g id="line-${this.toolId}"
        class="${classMap$9(this.classes.tool)}" style="${styleMap$b(this.styles.tool)}"
        @click=${(e) => this.handleTapEvent(e, this.config)}>
        ${this._renderLine()}
      </g>
    `;
  }
}
function classMap$8(classes) {
  if (!classes) return "";
  return Object.entries(classes).filter(([_, value]) => value).map(([key, _]) => key).join(" ");
}
function styleMap$a(styles) {
  if (!styles) return "";
  return Object.entries(styles).filter(([_, value]) => value != null && value !== "").map(([key, value]) => `${key}: ${value}`).join("; ");
}
class RangeSliderTool extends BaseTool {
  constructor(argToolset, argConfig, argPos) {
    const DEFAULT_RANGESLIDER_CONFIG = {
      descr: "none",
      position: {
        cx: 50,
        cy: 50,
        orientation: "horizontal",
        active: {
          width: 0,
          height: 0,
          radius: 0
        },
        track: {
          width: 16,
          height: 7,
          radius: 3.5
        },
        thumb: {
          width: 9,
          height: 9,
          radius: 4.5,
          offset: 4.5
        },
        label: {
          placement: "none"
        }
      },
      show: {
        uom: "end",
        active: false
      },
      classes: {
        tool: {
          "sak-slider": true,
          hover: true
        },
        capture: {
          "sak-slider__capture": true
        },
        active: {
          "sak-slider__active": true
        },
        track: {
          "sak-slider__track": true
        },
        thumb: {
          "sak-slider__thumb": true
        },
        label: {
          "sak-slider__value": true
        },
        uom: {
          "sak-slider__uom": true
        }
      },
      styles: {
        tool: {},
        capture: {},
        active: {},
        track: {},
        thumb: {},
        label: {},
        uom: {}
      }
    };
    super(argToolset, Merge.mergeDeep(DEFAULT_RANGESLIDER_CONFIG, argConfig), argPos);
    this.svg.activeTrack = {};
    this.svg.activeTrack.radius = Utils.calculateSvgDimension(this.config.position.active.radius);
    this.svg.activeTrack.height = Utils.calculateSvgDimension(this.config.position.active.height);
    this.svg.activeTrack.width = Utils.calculateSvgDimension(this.config.position.active.width);
    this.svg.track = {};
    this.svg.track.radius = Utils.calculateSvgDimension(this.config.position.track.radius);
    this.svg.thumb = {};
    this.svg.thumb.radius = Utils.calculateSvgDimension(this.config.position.thumb.radius);
    this.svg.thumb.offset = Utils.calculateSvgDimension(this.config.position.thumb.offset);
    this.svg.capture = {};
    this.svg.label = {};
    switch (this.config.position.orientation) {
      case "horizontal":
      case "vertical":
        this.svg.capture.width = Utils.calculateSvgDimension(this.config.position.capture.width || 1.1 * this.config.position.track.width);
        this.svg.capture.height = Utils.calculateSvgDimension(this.config.position.capture.height || 3 * this.config.position.thumb.height);
        this.svg.track.width = Utils.calculateSvgDimension(this.config.position.track.width);
        this.svg.track.height = Utils.calculateSvgDimension(this.config.position.track.height);
        this.svg.thumb.width = Utils.calculateSvgDimension(this.config.position.thumb.width);
        this.svg.thumb.height = Utils.calculateSvgDimension(this.config.position.thumb.height);
        this.svg.capture.x1 = this.svg.cx - this.svg.capture.width / 2;
        this.svg.capture.y1 = this.svg.cy - this.svg.capture.height / 2;
        this.svg.track.x1 = this.svg.cx - this.svg.track.width / 2;
        this.svg.track.y1 = this.svg.cy - this.svg.track.height / 2;
        this.svg.activeTrack.x1 = this.config.position.orientation === "horizontal" ? this.svg.track.x1 : this.svg.cx - this.svg.activeTrack.width / 2;
        this.svg.activeTrack.y1 = this.svg.cy - this.svg.activeTrack.height / 2;
        this.svg.thumb.x1 = this.svg.cx - this.svg.thumb.width / 2;
        this.svg.thumb.y1 = this.svg.cy - this.svg.thumb.height / 2;
        break;
      default:
        console.error("RangeSliderTool - constructor: invalid orientation [vertical, horizontal] = ", this.config.position.orientation);
        throw Error("RangeSliderTool::constructor - invalid orientation [vertical, horizontal] = ", this.config.position.orientation);
    }
    switch (this.config.position.orientation) {
      case "vertical":
        this.svg.track.y2 = this.svg.cy + this.svg.track.height / 2;
        this.svg.activeTrack.y2 = this.svg.track.y2;
        break;
    }
    switch (this.config.position.label.placement) {
      case "position":
        this.svg.label.cx = Utils.calculateSvgCoordinate(this.config.position.label.cx, 0);
        this.svg.label.cy = Utils.calculateSvgCoordinate(this.config.position.label.cy, 0);
        break;
      case "thumb":
        this.svg.label.cx = this.svg.cx;
        this.svg.label.cy = this.svg.cy;
        break;
      case "none":
        break;
      default:
        console.error("RangeSliderTool - constructor: invalid label placement [none, position, thumb] = ", this.config.position.label.placement);
        throw Error("RangeSliderTool::constructor - invalid label placement [none, position, thumb] = ", this.config.position.label.placement);
    }
    this.classes.capture = {};
    this.classes.track = {};
    this.classes.thumb = {};
    this.classes.label = {};
    this.classes.uom = {};
    this.styles.capture = {};
    this.styles.track = {};
    this.styles.thumb = {};
    this.styles.label = {};
    this.styles.uom = {};
    this.svg.scale = {};
    this.svg.scale.min = this.valueToSvg(this, this.config.scale.min);
    this.svg.scale.max = this.valueToSvg(this, this.config.scale.max);
    this.svg.scale.step = this.config.scale.step;
    if (this.dev.debug) console.log("RangeSliderTool constructor coords, dimensions", this.coords, this.dimensions, this.svg, this.config);
  }
  /** *****************************************************************************
  * RangeSliderTool::svgCoordinateToSliderValue()
  *
  * Summary.
  * @returns {slider value} Translated svg coordinate to actual slider value
  *
  */
  svgCoordinateToSliderValue(argThis, m) {
    let state;
    let scalePos;
    let xpos;
    let ypos;
    switch (argThis.config.position.orientation) {
      case "horizontal":
        xpos = m.x - argThis.svg.track.x1 - this.svg.thumb.width / 2;
        scalePos = xpos / (argThis.svg.track.width - this.svg.thumb.width);
        break;
      case "vertical":
        ypos = argThis.svg.track.y2 - this.svg.thumb.height / 2 - m.y;
        scalePos = ypos / (argThis.svg.track.height - this.svg.thumb.height);
        break;
    }
    state = (argThis.config.scale.max - argThis.config.scale.min) * scalePos + argThis.config.scale.min;
    state = Math.round(state / this.svg.scale.step) * this.svg.scale.step;
    state = Math.max(Math.min(this.config.scale.max, state), this.config.scale.min);
    return state;
  }
  valueToSvg(argThis, argValue) {
    if (argThis.config.position.orientation === "horizontal") {
      const state = Utils.calculateValueBetween(argThis.config.scale.min, argThis.config.scale.max, argValue);
      const xposp = state * (argThis.svg.track.width - this.svg.thumb.width);
      const xpos = argThis.svg.track.x1 + this.svg.thumb.width / 2 + xposp;
      return xpos;
    } else if (argThis.config.position.orientation === "vertical") {
      const state = Utils.calculateValueBetween(argThis.config.scale.min, argThis.config.scale.max, argValue);
      const yposp = state * (argThis.svg.track.height - this.svg.thumb.height);
      const ypos = argThis.svg.track.y2 - this.svg.thumb.height / 2 - yposp;
      return ypos;
    }
  }
  updateValue(argThis, m) {
    this._value = this.svgCoordinateToSliderValue(argThis, m);
    const dist = 0;
    if (Math.abs(dist) < 0.01) {
      if (this.rid) {
        window.cancelAnimationFrame(this.rid);
        this.rid = null;
      }
    }
  }
  updateThumb(argThis, m) {
    switch (argThis.config.position.orientation) {
      default:
      case "horizontal":
        if (this.config.position.label.placement === "thumb") ;
        if (this.dragging) {
          const yUp = this.config.position.label.placement === "thumb" ? -50 : 0;
          const yUpStr = `translate(${m.x - this.svg.cx}px , ${yUp}px)`;
          argThis.elements.thumbGroup.style.transform = yUpStr;
        } else {
          argThis.elements.thumbGroup.style.transform = `translate(${m.x - this.svg.cx}px, ${0}px)`;
        }
        break;
      case "vertical":
        if (this.dragging) {
          const xUp = this.config.position.label.placement === "thumb" ? -50 : 0;
          const xUpStr = `translate(${xUp}px, ${m.y - this.svg.cy}px)`;
          argThis.elements.thumbGroup.style.transform = xUpStr;
        } else {
          argThis.elements.thumbGroup.style.transform = `translate(${0}px, ${m.y - this.svg.cy}px)`;
        }
        break;
    }
    argThis.updateLabel(argThis, m);
  }
  updateActiveTrack(argThis, m) {
    if (!argThis.config.show.active) return;
    switch (argThis.config.position.orientation) {
      default:
      case "horizontal":
        if (this.dragging) {
          argThis.elements.activeTrack.setAttribute("width", Math.abs(this.svg.activeTrack.x1 - m.x + this.svg.cx));
        }
        break;
      case "vertical":
        if (this.dragging) {
          argThis.elements.activeTrack.setAttribute("y", m.y - this.svg.cy);
          argThis.elements.activeTrack.setAttribute("height", Math.abs(argThis.svg.activeTrack.y2 - m.y + this.svg.cx));
        }
        break;
    }
  }
  updateLabel(argThis, m) {
    if (this.dev.debug) console.log("SLIDER - updateLabel start", m, argThis.config.position.orientation);
    const dec = this._card.config.entities[this.defaultEntityIndex()].decimals || 0;
    const x = 10 ** dec;
    argThis.labelValue2 = (Math.round(argThis.svgCoordinateToSliderValue(argThis, m) * x) / x).toFixed(dec);
    if (this.config.position.label.placement !== "none") {
      argThis.elements.label.textContent = argThis.labelValue2;
    }
  }
  /*
  * mouseEventToPoint
  *
  * Translate mouse/touch client window coordinates to SVG window coordinates
  *
  */
  // mouseEventToPoint(e) {
  //   var p = this.elements.svg.createSVGPoint();
  //   p.x = e.touches ? e.touches[0].clientX : e.clientX;
  //   p.y = e.touches ? e.touches[0].clientY : e.clientY;
  //   const ctm = this.elements.svg.getScreenCTM().inverse();
  //   var p = p.matrixTransform(ctm);
  //   return p;
  // }
  mouseEventToPoint(e) {
    let p = this.elements.svg.createSVGPoint();
    p.x = e.touches ? e.touches[0].clientX : e.clientX;
    p.y = e.touches ? e.touches[0].clientY : e.clientY;
    const ctm = this.elements.svg.getScreenCTM().inverse();
    p = p.matrixTransform(ctm);
    return p;
  }
  callDragService() {
    if (typeof this.labelValue2 === "undefined") return;
    if (this.labelValuePrev !== this.labelValue2) {
      this.labelValuePrev = this.labelValue2;
      this._processTapEvent(
        this._card,
        this._card._hass,
        this.config,
        this.config.user_actions.tap_action,
        this._card.config.entities[this.defaultEntityIndex()]?.entity,
        this.labelValue2
      );
    }
    if (this.dragging)
      this.timeOutId = setTimeout(() => this.callDragService(), this.config.user_actions.drag_action.update_interval);
  }
  callTapService() {
    if (typeof this.labelValue2 === "undefined") return;
    if (this.labelValuePrev !== this.labelValue2) {
      this.labelValuePrev = this.labelValue2;
      this._processTapEvent(
        this._card,
        this._card._hass,
        this.config,
        this.config.user_actions?.tap_action,
        this._card.config.entities[this.defaultEntityIndex()]?.entity,
        this.labelValue2
      );
    }
  }
  // eslint-disable-next-line no-unused-vars
  firstUpdated(changedProperties) {
    this.labelValue = this._stateValue;
    function Frame2() {
      this.rid = window.requestAnimationFrame(Frame2);
      this.updateValue(this, this.m);
      this.updateThumb(this, this.m);
      this.updateActiveTrack(this, this.m);
    }
    function pointerMove(e) {
      let scaleValue;
      e.preventDefault();
      if (this.dragging) {
        this.m = this.mouseEventToPoint(e);
        switch (this.config.position.orientation) {
          case "horizontal":
            scaleValue = this.svgCoordinateToSliderValue(this, this.m);
            this.m.x = this.valueToSvg(this, scaleValue);
            this.m.x = Math.max(this.svg.scale.min, Math.min(this.m.x, this.svg.scale.max));
            this.m.x = Math.round(this.m.x / this.svg.scale.step) * this.svg.scale.step;
            break;
          case "vertical":
            scaleValue = this.svgCoordinateToSliderValue(this, this.m);
            this.m.y = this.valueToSvg(this, scaleValue);
            this.m.y = Math.round(this.m.y / this.svg.scale.step) * this.svg.scale.step;
            break;
        }
        Frame2.call(this);
      }
    }
    if (this.dev.debug) console.log("slider - firstUpdated");
    this.elements = {};
    this.elements.svg = this._card.shadowRoot.getElementById("rangeslider-".concat(this.toolId));
    this.elements.capture = this.elements.svg.querySelector("#capture");
    this.elements.track = this.elements.svg.querySelector("#rs-track");
    this.elements.activeTrack = this.elements.svg.querySelector("#active-track");
    this.elements.thumbGroup = this.elements.svg.querySelector("#rs-thumb-group");
    this.elements.thumb = this.elements.svg.querySelector("#rs-thumb");
    this.elements.label = this.elements.svg.querySelector("#rs-label tspan");
    if (this.dev.debug) console.log("slider - firstUpdated svg = ", this.elements.svg, "path=", this.elements.path, "thumb=", this.elements.thumb, "label=", this.elements.label, "text=", this.elements.text);
    function pointerDown(e) {
      e.preventDefault();
      window.addEventListener("pointermove", pointerMove.bind(this), false);
      window.addEventListener("pointerup", pointerUp.bind(this), false);
      const mousePos = this.mouseEventToPoint(e);
      const thumbPos = this.svg.thumb.x1 + this.svg.thumb.cx;
      if (mousePos.x > thumbPos - 10 && mousePos.x < thumbPos + this.svg.thumb.width + 10) {
        fireEvent(window, "haptic", "heavy");
      } else {
        fireEvent(window, "haptic", "error");
        return;
      }
      this.dragging = true;
      if (this.config.user_actions?.drag_action && this.config.user_actions?.drag_action.update_interval) {
        if (this.config.user_actions.drag_action.update_interval > 0) {
          this.timeOutId = setTimeout(() => this.callDragService(), this.config.user_actions.drag_action.update_interval);
        } else {
          this.timeOutId = null;
        }
      }
      this.m = this.mouseEventToPoint(e);
      if (this.config.position.orientation === "horizontal") {
        this.m.x = Math.round(this.m.x / this.svg.scale.step) * this.svg.scale.step;
      } else {
        this.m.y = Math.round(this.m.y / this.svg.scale.step) * this.svg.scale.step;
      }
      if (this.dev.debug) console.log("pointerDOWN", Math.round(this.m.x * 100) / 100);
      Frame2.call(this);
    }
    function pointerUp(e) {
      e.preventDefault();
      window.removeEventListener("pointermove", pointerMove.bind(this), false);
      window.removeEventListener("pointerup", pointerUp.bind(this), false);
      window.removeEventListener("mousemove", pointerMove.bind(this), false);
      window.removeEventListener("touchmove", pointerMove.bind(this), false);
      window.removeEventListener("mouseup", pointerUp.bind(this), false);
      window.removeEventListener("touchend", pointerUp.bind(this), false);
      if (!this.dragging) return;
      this.dragging = false;
      clearTimeout(this.timeOutId);
      this.target = 0;
      if (this.dev.debug) console.log("pointerUP");
      Frame2.call(this);
      this.callTapService();
    }
    this.elements.svg.addEventListener("touchstart", pointerDown.bind(this), false);
    this.elements.svg.addEventListener("mousedown", pointerDown.bind(this), false);
  }
  /** *****************************************************************************
  * RangeSliderTool::value()
  *
  * Summary.
  * Receive new state data for the entity this rangeslider is linked to. Called from set hass;
  * Sets the brightness value of the slider. This is a value 0..255. We display %, so translate
  *
  */
  set value(state) {
    super.value = state;
    if (!this.dragging) this.labelValue = this._stateValue;
  }
  _renderUom() {
    if (this.config.show.uom === "none") {
      return svg``;
    } else {
      this.MergeAnimationStyleIfChanged();
      this.MergeColorFromState(this.styles.uom);
      let fsuomStr = this.styles.label["font-size"];
      let fsuomValue = 0.5;
      let fsuomType = "em";
      const fsuomSplit = fsuomStr.match(/\D+|\d*\.?\d+/g);
      if (fsuomSplit.length === 2) {
        fsuomValue = Number(fsuomSplit[0]) * 0.6;
        fsuomType = fsuomSplit[1];
      } else console.error("Cannot determine font-size for state/unit", fsuomStr);
      fsuomStr = { "font-size": fsuomValue + fsuomType };
      this.styles.uom = Merge.mergeDeep(this.config.styles.uom, fsuomStr);
      const uom = this._card._buildUom(this.derivedEntity, this._card.entities[this.defaultEntityIndex()], this._card.config.entities[this.defaultEntityIndex()]);
      if (this.config.show.uom === "end") {
        return svg`
          <tspan class="${classMap$8(this.classes.uom)}" dx="-0.1em" dy="-0.35em"
            style="${styleMap$a(this.styles.uom)}">
            ${uom}</tspan>
        `;
      } else if (this.config.show.uom === "bottom") {
        return svg`
          <tspan class="${classMap$8(this.classes.uom)}" x="${this.svg.label.cx}" dy="1.5em"
            style="${styleMap$a(this.styles.uom)}">
            ${uom}</tspan>
        `;
      } else if (this.config.show.uom === "top") {
        return svg`
          <tspan class="${classMap$8(this.classes.uom)}" x="${this.svg.label.cx}" dy="-1.5em"
            style="${styleMap$a(this.styles.uom)}">
            ${uom}</tspan>
        `;
      } else {
        return svg`
          <tspan class="${classMap$8(this.classes.uom)}"  dx="-0.1em" dy="-0.35em"
            style="${styleMap$a(this.styles.uom)}">
            ERRR</tspan>
        `;
      }
    }
  }
  /** *****************************************************************************
  * RangeSliderTool::_renderRangeSlider()
  *
  * Summary.
  * Renders the range slider
  *
  */
  _renderRangeSlider() {
    if (this.dev.debug) console.log("slider - _renderRangeSlider");
    this.MergeAnimationClassIfChanged();
    this.MergeColorFromState();
    this.MergeAnimationStyleIfChanged();
    this.MergeColorFromState();
    this.renderValue = this._stateValue;
    if (this.dragging) {
      this.renderValue = this.labelValue2;
    } else if (this.elements?.label) this.elements.label.textContent = this.renderValue;
    let cx;
    let cy;
    switch (this.config.position.label.placement) {
      case "none":
        this.styles.label.display = "none";
        this.styles.uom.display = "none";
        break;
      case "position":
        cx = this.config.position.orientation === "horizontal" ? this.valueToSvg(this, Number(this.renderValue)) - this.svg.cx : 0;
        cy = this.config.position.orientation === "vertical" ? this.valueToSvg(this, Number(this.renderValue)) - this.svg.cy : 0;
        break;
      case "thumb":
        cx = this.config.position.orientation === "horizontal" ? -this.svg.label.cx + this.valueToSvg(this, Number(this.renderValue)) : 0;
        cy = this.config.position.orientation === "vertical" ? this.valueToSvg(this, Number(this.renderValue)) : 0;
        if (this.dragging) {
          this.config.position.orientation === "horizontal" ? cy -= 50 : cx -= 50;
        }
        break;
      default:
        console.error("_renderRangeSlider(), invalid label placement", this.config.position.label.placement);
    }
    this.svg.thumb.cx = cx;
    this.svg.thumb.cy = cy;
    function renderActiveTrack() {
      if (!this.config.show.active) return svg``;
      if (this.config.position.orientation === "horizontal") {
        return svg`
          <rect id="active-track" class="${classMap$8(this.classes.active)}" x="${this.svg.activeTrack.x1}" y="${this.svg.activeTrack.y1}"
            width="${Math.abs(this.svg.thumb.x1 - this.svg.activeTrack.x1 + cx + this.svg.thumb.width / 2)}" height="${this.svg.activeTrack.height}" rx="${this.svg.activeTrack.radius}"
            style="${styleMap$a(this.styles.active)}" touch-action="none"
          />`;
      } else {
        return svg`
          <rect id="active-track" class="${classMap$8(this.classes.active)}" x="${this.svg.activeTrack.x1}" y="${cy}"
            height="${Math.abs(this.svg.activeTrack.y1 + cy - this.svg.thumb.height)}" width="${this.svg.activeTrack.width}" rx="${this.svg.activeTrack.radius}"
            style="${styleMap$a(this.styles.active)}"
          />`;
      }
    }
    function renderLabel(argGroup) {
      if (this.config.position.label.placement === "thumb" && argGroup) {
        return svg`
      <text id="rs-label">
        <tspan class="${classMap$8(this.classes.label)}" x="${this.svg.label.cx}" y="${this.svg.label.cy}" style="${styleMap$a(this.styles.label)}">
        ${this.renderValue}</tspan>
        ${this._renderUom()}
        </text>
        `;
      }
      if (this.config.position.label.placement === "position" && !argGroup) {
        return svg`
          <text id="rs-label" style="transform-origin:center;transform-box: fill-box;">
            <tspan class="${classMap$8(this.classes.label)}" data-placement="position" x="${this.svg.label.cx}" y="${this.svg.label.cy}"
            style="${styleMap$a(this.styles.label)}">${this.renderValue ? this.renderValue : ""}</tspan>
            ${this.renderValue ? this._renderUom() : ""}
          </text>
          `;
      }
    }
    function renderThumbGroup() {
      return svg`
        <g id="rs-thumb-group" x="${this.svg.thumb.x1}" y="${this.svg.thumb.y1}" style="transform:translate(${cx}px, ${cy}px);">
          <g style="transform-origin:center;transform-box: fill-box;">
            <rect id="rs-thumb" class="${classMap$8(this.classes.thumb)}" x="${this.svg.thumb.x1}" y="${this.svg.thumb.y1}"
              width="${this.svg.thumb.width}" height="${this.svg.thumb.height}" rx="${this.svg.thumb.radius}" 
              style="${styleMap$a(this.styles.thumb)}"
            />
            </g>
            ${renderLabel.call(this, true)} 
        </g>
      `;
    }
    const svgItems = [];
    svgItems.push(svg`
      <rect id="capture" class="${classMap$8(this.classes.capture)}" x="${this.svg.capture.x1}" y="${this.svg.capture.y1}"
      width="${this.svg.capture.width}" height="${this.svg.capture.height}" rx="${this.svg.track.radius}"          
      />

      <rect id="rs-track" class="${classMap$8(this.classes.track)}" x="${this.svg.track.x1}" y="${this.svg.track.y1}"
        width="${this.svg.track.width}" height="${this.svg.track.height}" rx="${this.svg.track.radius}"
        style="${styleMap$a(this.styles.track)}"
      />

      ${renderActiveTrack.call(this)}
      ${renderThumbGroup.call(this)}
      ${renderLabel.call(this, false)}


      `);
    return svgItems;
  }
  /** *****************************************************************************
  * RangeSliderTool::render()
  *
  * Summary.
  * The render() function for this object. The conversion of pointer events need
  * an SVG as grouping object!
  *
  * NOTE:
  * It is imperative that the style overflow=visible is set on the svg.
  * The weird thing is that if using an svg as grouping object, AND a class, the overflow=visible
  * seems to be ignored by both chrome and safari. If the overflow=visible is directly set as style,
  * the setting works.
  *
  * Works on svg with direct styling:
  * ---
  *  return svg`
  *    <svg xmlns="http://www.w3.org/2000/svg" id="rangeslider-${this.toolId}"
  *      pointer-events="all" overflow="visible"
  *    >
  *      ${this._renderRangeSlider()}
  *    </svg>
  *  `;
  *
  * Does NOT work on svg with class styling:
  * ---
  *  return svg`
  *    <svg xmlns="http://www.w3.org/2000/svg" id="rangeslider-${this.toolId}" class="${classMap(this.classes.tool)}"
  *    >
  *      ${this._renderRangeSlider()}
  *    </svg>
  *  `;
  * where the class has the overflow=visible setting...
  *
  */
  render() {
    return svg`
      <svg xmlns="http://www.w3.org/2000/svg" id="rangeslider-${this.toolId}" overflow="visible"
        touch-action="none" style="touch-action:none; pointer-events:none;"
      >
        ${this._renderRangeSlider()}
      </svg>
    `;
  }
}
function classMap$7(classes) {
  if (!classes) return "";
  return Object.entries(classes).filter(([_, value]) => value).map(([key, _]) => key).join(" ");
}
function styleMap$9(styles) {
  if (!styles) return "";
  return Object.entries(styles).filter(([_, value]) => value != null && value !== "").map(([key, value]) => `${key}: ${value}`).join("; ");
}
class RectangleTool extends BaseTool {
  constructor(argToolset, argConfig, argPos) {
    const DEFAULT_RECTANGLE_CONFIG = {
      position: {
        cx: 50,
        cy: 50,
        width: 50,
        height: 50,
        rx: 0
      },
      classes: {
        tool: {
          "sak-rectangle": true,
          hover: true
        },
        rectangle: {
          "sak-rectangle__rectangle": true
        }
      },
      styles: {
        rectangle: {}
      }
    };
    super(argToolset, Merge.mergeDeep(DEFAULT_RECTANGLE_CONFIG, argConfig), argPos);
    this.svg.rx = argConfig.position.rx ? Utils.calculateSvgDimension(argConfig.position.rx) : 0;
    this.classes.rectangle = {};
    this.styles.rectangle = {};
    if (this.dev.debug) console.log("RectangleTool constructor config, svg", this.toolId, this.config, this.svg);
  }
  /** *****************************************************************************
  * RectangleTool::value()
  *
  * Summary.
  * Receive new state data for the entity this rectangle is linked to. Called from set hass;
  *
  */
  set value(state) {
    super.value = state;
  }
  /** *****************************************************************************
  * RectangleTool::_renderRectangle()
  *
  * Summary.
  * Renders the circle using precalculated coordinates and dimensions.
  * Only the runtime style is calculated before rendering the circle
  *
  */
  _renderRectangle() {
    this.MergeAnimationClassIfChanged();
    this.MergeAnimationStyleIfChanged();
    this.MergeColorFromState(this.styles.rectangle);
    return svg`
      <rect class="${classMap$7(this.classes.rectangle)}"
        x="${this.svg.x}" y="${this.svg.y}" width="${this.svg.width}" height="${this.svg.height}" rx="${this.svg.rx}"
        style="${styleMap$9(this.styles.rectangle)}"/>
      `;
  }
  /** *****************************************************************************
  * RectangleTool::render()
  *
  * Summary.
  * The render() function for this object.
  *
  */
  render() {
    return svg`
      <g id="rectangle-${this.toolId}" class="${classMap$7(this.classes.tool)}" transform-origin="${this.svg.cx}px ${this.svg.cy}px"
        style="${styleMap$9(this.styles.tool)}"
        @click=${(e) => this.handleTapEvent(e, this.config)}>
        ${this._renderRectangle()}
      </g>
    `;
  }
}
function classMap$6(classes) {
  if (!classes) return "";
  return Object.entries(classes).filter(([_, value]) => value).map(([key, _]) => key).join(" ");
}
function styleMap$8(styles) {
  if (!styles) return "";
  return Object.entries(styles).filter(([_, value]) => value != null && value !== "").map(([key, value]) => `${key}: ${value}`).join("; ");
}
class RectangleToolEx extends BaseTool {
  constructor(argToolset, argConfig, argPos) {
    const DEFAULT_RECTANGLEEX_CONFIG = {
      position: {
        cx: 50,
        cy: 50,
        width: 50,
        height: 50,
        radius: {
          all: 0
        }
      },
      classes: {
        tool: {
          "sak-rectex": true,
          hover: true
        },
        rectex: {
          "sak-rectex__rectex": true
        }
      },
      styles: {
        tool: {},
        rectex: {}
      }
    };
    super(argToolset, Merge.mergeDeep(DEFAULT_RECTANGLEEX_CONFIG, argConfig), argPos);
    this.classes.tool = {};
    this.classes.rectex = {};
    this.styles.tool = {};
    this.styles.rectex = {};
    const maxRadius = Math.min(this.svg.height, this.svg.width) / 2;
    let radius = 0;
    radius = Utils.calculateSvgDimension(this.config.position.radius.all);
    this.svg.radiusTopLeft = +Math.min(maxRadius, Math.max(0, Utils.calculateSvgDimension(
      this.config.position.radius.top_left || this.config.position.radius.left || this.config.position.radius.top || radius
    ))) || 0;
    this.svg.radiusTopRight = +Math.min(maxRadius, Math.max(0, Utils.calculateSvgDimension(
      this.config.position.radius.top_right || this.config.position.radius.right || this.config.position.radius.top || radius
    ))) || 0;
    this.svg.radiusBottomLeft = +Math.min(maxRadius, Math.max(0, Utils.calculateSvgDimension(
      this.config.position.radius.bottom_left || this.config.position.radius.left || this.config.position.radius.bottom || radius
    ))) || 0;
    this.svg.radiusBottomRight = +Math.min(maxRadius, Math.max(0, Utils.calculateSvgDimension(
      this.config.position.radius.bottom_right || this.config.position.radius.right || this.config.position.radius.bottom || radius
    ))) || 0;
    if (this.dev.debug) console.log("RectangleToolEx constructor config, svg", this.toolId, this.config, this.svg);
  }
  /** *****************************************************************************
  * RectangleToolEx::value()
  *
  */
  set value(state) {
    super.value = state;
  }
  /** *****************************************************************************
  * RectangleToolEx::_renderRectangleEx()
  *
  * Summary.
  * Renders the rectangle using lines and bezier curves with precalculated coordinates and dimensions.
  *
  * Refs for creating the path online:
  * - https://mavo.io/demos/svgpath/
  *
  */
  _renderRectangleEx() {
    this.MergeAnimationClassIfChanged();
    this.MergeAnimationStyleIfChanged(this.styles);
    this.MergeAnimationStyleIfChanged();
    if (this.config.hasOwnProperty("csnew")) {
      this.MergeColorFromState2(this.styles.rectex, "rectex");
    } else {
      this.MergeColorFromState(this.styles.rectex);
    }
    if (!this.counter) {
      this.counter = 0;
    }
    this.counter += 1;
    const svgItems = svg`
      <g class="${classMap$6(this.classes.rectex)}" id="rectex-${this.toolId}">
        <path  d="
            M ${this.svg.x + this.svg.radiusTopLeft} ${this.svg.y}
            h ${this.svg.width - this.svg.radiusTopLeft - this.svg.radiusTopRight}
            q ${this.svg.radiusTopRight} 0 ${this.svg.radiusTopRight} ${this.svg.radiusTopRight}
            v ${this.svg.height - this.svg.radiusTopRight - this.svg.radiusBottomRight}
            q 0 ${this.svg.radiusBottomRight} -${this.svg.radiusBottomRight} ${this.svg.radiusBottomRight}
            h -${this.svg.width - this.svg.radiusBottomRight - this.svg.radiusBottomLeft}
            q -${this.svg.radiusBottomLeft} 0 -${this.svg.radiusBottomLeft} -${this.svg.radiusBottomLeft}
            v -${this.svg.height - this.svg.radiusBottomLeft - this.svg.radiusTopLeft}
            q 0 -${this.svg.radiusTopLeft} ${this.svg.radiusTopLeft} -${this.svg.radiusTopLeft}
            "
            counter="${this.counter}" 
            style="${styleMap$8(this.styles.rectex)}"/>
      </g>
      `;
    return svg`${svgItems}`;
  }
  /** *****************************************************************************
  * RectangleToolEx::render()
  *
  * Summary.
  * The render() function for this object.
  *
  */
  render() {
    return svg`
      <g id="rectex-${this.toolId}"
        class="${classMap$6(this.classes.tool)}" style="${styleMap$8(this.styles.tool)}"
        @click=${(e) => this.handleTapEvent(e, this.config)}>
        ${this._renderRectangleEx()}
      </g>
    `;
  }
}
function classMap$5(classes) {
  if (!classes) return "";
  return Object.entries(classes).filter(([_, value]) => value).map(([key, _]) => key).join(" ");
}
function styleMap$7(styles) {
  if (!styles) return "";
  return Object.entries(styles).filter(([_, value]) => value != null && value !== "").map(([key, value]) => `${key}: ${value}`).join("; ");
}
class RegPolyTool extends BaseTool {
  constructor(argToolset, argConfig, argPos) {
    const DEFAULT_REGPOLY_CONFIG = {
      position: {
        cx: 50,
        cy: 50,
        radius: 50,
        side_count: 6,
        side_skip: 1,
        angle_offset: 0
      },
      classes: {
        tool: {
          "sak-polygon": true,
          hover: true
        },
        regpoly: {
          "sak-polygon__regpoly": true
        }
      },
      styles: {
        tool: {},
        regpoly: {}
      }
    };
    super(argToolset, Merge.mergeDeep(DEFAULT_REGPOLY_CONFIG, argConfig), argPos);
    this.svg.radius = Utils.calculateSvgDimension(argConfig.position.radius);
    this.classes.regpoly = {};
    this.styles.regpoly = {};
    if (this.dev.debug) console.log("RegPolyTool constructor config, svg", this.toolId, this.config, this.svg);
  }
  /** *****************************************************************************
  * RegPolyTool::value()
  *
  * Summary.
  * Receive new state data for the entity this circle is linked to. Called from set hass;
  *
  */
  set value(state) {
    super.value = state;
  }
  /** *****************************************************************************
  * RegPolyTool::_renderRegPoly()
  *
  * Summary.
  * Renders the regular polygon using precalculated coordinates and dimensions.
  * Only the runtime style is calculated before rendering the regular polygon
  *
  */
  _renderRegPoly() {
    const generatePoly = function(p, q, r, a, cx, cy) {
      const base_angle = 2 * Math.PI / p;
      let angle = a + base_angle;
      let x;
      let y;
      let d_attr = "";
      for (let i = 0; i < p; i++) {
        angle += q * base_angle;
        x = cx + ~~(r * Math.cos(angle));
        y = cy + ~~(r * Math.sin(angle));
        d_attr += `${(i === 0 ? "M" : "L") + x} ${y} `;
        if (i * q % p === 0 && i > 0) {
          angle += base_angle;
          x = cx + ~~(r * Math.cos(angle));
          y = cy + ~~(r * Math.sin(angle));
          d_attr += `M${x} ${y} `;
        }
      }
      d_attr += "z";
      return d_attr;
    };
    this.MergeAnimationStyleIfChanged();
    this.MergeColorFromState(this.styles.regpoly);
    return svg`
      <path class="${classMap$5(this.classes.regpoly)}"
        d="${generatePoly(this.config.position.side_count, this.config.position.side_skip, this.svg.radius, this.config.position.angle_offset, this.svg.cx, this.svg.cy)}"
        style="${styleMap$7(this.styles.regpoly)}"
      />
      `;
  }
  /** *****************************************************************************
  * RegPolyTool::render()
  *
  * Summary.
  * The render() function for this object.
  *
  */
  //        @click=${e => this._card.handlePopup(e, this._card.entities[this.defaultEntityIndex()])} >
  render() {
    return svg`
      <g "" id="regpoly-${this.toolId}" class="${classMap$5(this.classes.tool)}" transform-origin="${this.svg.cx} ${this.svg.cy}"
        style="${styleMap$7(this.styles.tool)}"
        @click=${(e) => this.handleTapEvent(e, this.config)}>
        ${this._renderRegPoly()}
      </g>
    `;
  }
}
function classMap$4(classes) {
  if (!classes) return "";
  return Object.entries(classes).filter(([_, value]) => value).map(([key, _]) => key).join(" ");
}
function styleMap$6(styles) {
  if (!styles) return "";
  return Object.entries(styles).filter(([_, value]) => value != null && value !== "").map(([key, value]) => `${key}: ${value}`).join("; ");
}
class SegmentedArcTool extends BaseTool {
  constructor(argToolset, argConfig, argPos) {
    const DEFAULT_SEGARC_CONFIG = {
      position: {
        cx: 50,
        cy: 50,
        radius: 45,
        width: 3,
        margin: 1.5
      },
      color: "var(--primary-color)",
      classes: {
        tool: {
          "sak-segarc": true
        },
        foreground: {},
        background: {}
      },
      styles: {
        tool: {},
        foreground: {},
        background: {}
      },
      segments: {},
      colorstops: [],
      scale: {
        min: 0,
        max: 100,
        width: 2,
        offset: -3.5
      },
      show: {
        style: "fixedcolor",
        scale: false
      },
      isScale: false,
      animation: {
        duration: 1.5
      }
    };
    super(argToolset, Merge.mergeDeep(DEFAULT_SEGARC_CONFIG, argConfig), argPos);
    if (this.dev.performance) console.time(`--> ${this.toolId} PERFORMANCE SegmentedArcTool::constructor`);
    this.svg.radius = Utils.calculateSvgDimension(argConfig.position.radius);
    this.svg.radiusX = Utils.calculateSvgDimension(argConfig.position.radius_x || argConfig.position.radius);
    this.svg.radiusY = Utils.calculateSvgDimension(argConfig.position.radius_y || argConfig.position.radius);
    this.svg.segments = {};
    this.svg.segments.gap = Utils.calculateSvgDimension(this.config.segments.gap);
    this.svg.scale_offset = Utils.calculateSvgDimension(this.config.scale.offset);
    this._firstUpdatedCalled = false;
    this._stateValue = null;
    this._stateValuePrev = null;
    this._stateValueIsDirty = false;
    this._renderFrom = null;
    this._renderTo = null;
    this.rAFid = null;
    this.cancelAnimation = false;
    this.arcId = null;
    this._cache = [];
    this._segmentAngles = [];
    this._segments = {};
    this._arc = {};
    this._arc.size = Math.abs(this.config.position.end_angle - this.config.position.start_angle);
    this._arc.clockwise = this.config.position.end_angle > this.config.position.start_angle;
    this._arc.direction = this._arc.clockwise ? 1 : -1;
    let tcolorlist = {};
    let colorlist = null;
    if (this.config.segments.colorlist?.template) {
      colorlist = this.config.segments.colorlist;
      if (this._card.lovelace.config.sak_user_templates.templates[colorlist.template.name]) {
        if (this.dev.debug) console.log("SegmentedArcTool::constructor - templates colorlist found", colorlist.template.name);
        tcolorlist = Templates.replaceVariables2(colorlist.template.variables, this._card.lovelace.config.sak_user_templates.templates[colorlist.template.name]);
        this.config.segments.colorlist = tcolorlist;
      }
    }
    if (this.config.show.style === "fixedcolor") ;
    else if (this.config.show.style === "colorlist") {
      this._segments.count = this.config.segments.colorlist.colors.length;
      this._segments.size = this._arc.size / this._segments.count;
      this._segments.gap = this.config.segments.colorlist.gap !== "undefined" ? this.config.segments.colorlist.gap : 1;
      this._segments.sizeList = [];
      for (var i = 0; i < this._segments.count; i++) {
        this._segments.sizeList[i] = this._segments.size;
      }
      var segmentRunningSize = 0;
      for (var i = 0; i < this._segments.count; i++) {
        this._segmentAngles[i] = {
          boundsStart: this.config.position.start_angle + segmentRunningSize * this._arc.direction,
          boundsEnd: this.config.position.start_angle + (segmentRunningSize + this._segments.sizeList[i]) * this._arc.direction,
          drawStart: this.config.position.start_angle + segmentRunningSize * this._arc.direction + this._segments.gap * this._arc.direction,
          drawEnd: this.config.position.start_angle + (segmentRunningSize + this._segments.sizeList[i]) * this._arc.direction - this._segments.gap * this._arc.direction
        };
        segmentRunningSize += this._segments.sizeList[i];
      }
      if (this.dev.debug) console.log("colorstuff - COLORLIST", this._segments, this._segmentAngles);
    } else if (this.config.show.style === "colorstops") {
      this._segments.colorStops = {};
      Object.keys(this.config.segments.colorstops.colors).forEach((key) => {
        if (key >= this.config.scale.min && key <= this.config.scale.max)
          this._segments.colorStops[key] = this.config.segments.colorstops.colors[key];
      });
      this._segments.sortedStops = Object.keys(this._segments.colorStops).map((n) => Number(n)).sort((a, b) => a - b);
      if (typeof this._segments.colorStops[this.config.scale.max] === "undefined") {
        this._segments.colorStops[this.config.scale.max] = this._segments.colorStops[this._segments.sortedStops[this._segments.sortedStops.length - 1]];
        this._segments.sortedStops = Object.keys(this._segments.colorStops).map((n) => Number(n)).sort((a, b) => a - b);
      }
      this._segments.count = this._segments.sortedStops.length - 1;
      this._segments.gap = this.config.segments.colorstops.gap !== "undefined" ? this.config.segments.colorstops.gap : 1;
      let runningColorStop = this.config.scale.min;
      const scaleRange = this.config.scale.max - this.config.scale.min;
      this._segments.sizeList = [];
      for (var i = 0; i < this._segments.count; i++) {
        const colorSize = this._segments.sortedStops[i + 1] - runningColorStop;
        runningColorStop += colorSize;
        const fraction = colorSize / scaleRange;
        const angleSize = fraction * this._arc.size;
        this._segments.sizeList[i] = angleSize;
      }
      var segmentRunningSize = 0;
      for (var i = 0; i < this._segments.count; i++) {
        this._segmentAngles[i] = {
          boundsStart: this.config.position.start_angle + segmentRunningSize * this._arc.direction,
          boundsEnd: this.config.position.start_angle + (segmentRunningSize + this._segments.sizeList[i]) * this._arc.direction,
          drawStart: this.config.position.start_angle + segmentRunningSize * this._arc.direction + this._segments.gap * this._arc.direction,
          drawEnd: this.config.position.start_angle + (segmentRunningSize + this._segments.sizeList[i]) * this._arc.direction - this._segments.gap * this._arc.direction
        };
        segmentRunningSize += this._segments.sizeList[i];
        if (this.dev.debug) console.log("colorstuff - COLORSTOPS++ segments", segmentRunningSize, this._segmentAngles[i]);
      }
      if (this.dev.debug) console.log("colorstuff - COLORSTOPS++", this._segments, this._segmentAngles, this._arc.direction, this._segments.count);
    } else if (this.config.show.style === "simplegradient") ;
    if (this.config.isScale) {
      this._stateValue = this.config.scale.max;
    } else {
      if (this.config.show.scale) {
        const scaleConfig = Merge.mergeDeep(this.config);
        scaleConfig.id += "-scale";
        scaleConfig.show.scale = false;
        scaleConfig.isScale = true;
        scaleConfig.position.width = this.config.scale.width;
        scaleConfig.position.radius = this.config.position.radius - this.config.position.width / 2 + scaleConfig.position.width / 2 + this.config.scale.offset;
        scaleConfig.position.radius_x = (this.config.position.radius_x || this.config.position.radius) - this.config.position.width / 2 + scaleConfig.position.width / 2 + this.config.scale.offset;
        scaleConfig.position.radius_y = (this.config.position.radius_y || this.config.position.radius) - this.config.position.width / 2 + scaleConfig.position.width / 2 + this.config.scale.offset;
        this._segmentedArcScale = new SegmentedArcTool(this, scaleConfig, argPos);
      } else {
        this._segmentedArcScale = null;
      }
    }
    this.skipOriginal = this.config.show.style === "colorstops" || this.config.show.style === "colorlist";
    if (this.skipOriginal) {
      if (this.config.isScale) this._stateValuePrev = this._stateValue;
      this._initialDraw = false;
    }
    this._arc.parts = Math.floor(this._arc.size / Math.abs(this.config.segments.dash));
    this._arc.partsPartialSize = this._arc.size - this._arc.parts * this.config.segments.dash;
    if (this.skipOriginal) {
      this._arc.parts = this._segmentAngles.length;
      this._arc.partsPartialSize = 0;
    } else {
      for (var i = 0; i < this._arc.parts; i++) {
        this._segmentAngles[i] = {
          boundsStart: this.config.position.start_angle + i * this.config.segments.dash * this._arc.direction,
          boundsEnd: this.config.position.start_angle + (i + 1) * this.config.segments.dash * this._arc.direction,
          drawStart: this.config.position.start_angle + i * this.config.segments.dash * this._arc.direction + this.config.segments.gap * this._arc.direction,
          drawEnd: this.config.position.start_angle + (i + 1) * this.config.segments.dash * this._arc.direction - this.config.segments.gap * this._arc.direction
        };
      }
      if (this._arc.partsPartialSize > 0) {
        this._segmentAngles[i] = {
          boundsStart: this.config.position.start_angle + i * this.config.segments.dash * this._arc.direction,
          boundsEnd: this.config.position.start_angle + (i + 0) * this.config.segments.dash * this._arc.direction + this._arc.partsPartialSize * this._arc.direction,
          drawStart: this.config.position.start_angle + i * this.config.segments.dash * this._arc.direction + this.config.segments.gap * this._arc.direction,
          drawEnd: this.config.position.start_angle + (i + 0) * this.config.segments.dash * this._arc.direction + this._arc.partsPartialSize * this._arc.direction - this.config.segments.gap * this._arc.direction
        };
      }
    }
    this.starttime = null;
    if (this.dev.debug) console.log("SegmentedArcTool constructor coords, dimensions", this.coords, this.dimensions, this.svg, this.config);
    if (this.dev.debug) console.log("SegmentedArcTool - init", this.toolId, this.config.isScale, this._segmentAngles);
    if (this.dev.performance) console.timeEnd(`--> ${this.toolId} PERFORMANCE SegmentedArcTool::constructor`);
  }
  // SegmentedArcTool::objectId
  get objectId() {
    return this.toolId;
  }
  // SegmentedArcTool::value
  set value(state) {
    if (this.dev.debug) console.log("SegmentedArcTool - set value IN");
    if (this.config.isScale) return false;
    if (this._stateValue === state) return false;
    const changed = super.value = state;
    return changed;
  }
  // SegmentedArcTool::firstUpdated
  // Me is updated. Get arc id for animations...
  firstUpdated(changedProperties) {
    if (this.dev.debug) console.log("SegmentedArcTool - firstUpdated IN with _arcId/id", this._arcId, this.toolId, this.config.isScale);
    this._arcId = this._card.shadowRoot.getElementById("arc-".concat(this.toolId));
    this._firstUpdatedCalled = true;
    this._segmentedArcScale?.firstUpdated(changedProperties);
    if (this.skipOriginal) {
      if (this.dev.debug) console.log("RENDERNEW - firstUpdated IN with _arcId/id/isScale/scale/connected", this._arcId, this.toolId, this.config.isScale, this._segmentedArcScale, this._card.connected);
      if (!this.config.isScale) this._stateValuePrev = null;
      this._initialDraw = true;
      this._card.requestUpdate();
    }
  }
  // SegmentedArcTool::updated
  // eslint-disable-next-line no-unused-vars
  updated(changedProperties) {
    if (this.dev.debug) console.log("SegmentedArcTool - updated IN");
  }
  // SegmentedArcTool::render
  render() {
    if (this.dev.debug) console.log("SegmentedArcTool RENDERNEW - Render IN");
    return svg`
      <g "" id="arc-${this.toolId}"
        class="${classMap$4(this.classes.tool)}" style="${styleMap$6(this.styles.tool)}"
      >
        <g >
          ${this._renderSegments()}
          </g>
        ${this._renderScale()}
      </g>
    `;
  }
  _renderScale() {
    if (this._segmentedArcScale) return this._segmentedArcScale.render();
  }
  _renderSegments() {
    if (this.skipOriginal) {
      let arcEnd;
      let arcEndPrev;
      const arcWidth = this.svg.width;
      const arcRadiusX = this.svg.radiusX;
      const arcRadiusY = this.svg.radiusY;
      let d2;
      if (this.dev.debug) console.log("RENDERNEW - IN _arcId, firstUpdatedCalled", this._arcId, this._firstUpdatedCalled);
      const val = Utils.calculateValueBetween(this.config.scale.min, this.config.scale.max, this._stateValue);
      const valPrev = Utils.calculateValueBetween(this.config.scale.min, this.config.scale.max, this._stateValuePrev);
      if (this.dev.debug) {
        if (!this._stateValuePrev) console.log("*****UNDEFINED", this._stateValue, this._stateValuePrev, valPrev);
      }
      if (val !== valPrev) {
        if (this.dev.debug) console.log("RENDERNEW _renderSegments diff value old new", this.toolId, valPrev, val);
      }
      arcEnd = val * this._arc.size * this._arc.direction + this.config.position.start_angle;
      arcEndPrev = valPrev * this._arc.size * this._arc.direction + this.config.position.start_angle;
      const svgItems = [];
      if (!this.config.isScale) {
        for (let k = 0; k < this._segmentAngles.length; k++) {
          d2 = this.buildArcPath(
            this._segmentAngles[k].drawStart,
            this._segmentAngles[k].drawEnd,
            this._arc.clockwise,
            this.svg.radiusX,
            this.svg.radiusY,
            this.svg.width
          );
          svgItems.push(svg`<path id="arc-segment-bg-${this.toolId}-${k}" class="sak-segarc__background"
                              style="${styleMap$6(this.config.styles.background)}"
                              d="${d2}"
                              />`);
        }
      }
      if (this._firstUpdatedCalled) {
        let animateSegmentsNEW = function(timestamp, thisTool) {
          const easeOut = (progress) => --progress ** 5 + 1;
          let frameSegment;
          let runningSegment;
          var timestamp = timestamp || (/* @__PURE__ */ new Date()).getTime();
          if (!tween.startTime) {
            tween.startTime = timestamp;
            tween.runningAngle = tween.fromAngle;
          }
          if (thisTool.debug) console.log("RENDERNEW - in animateSegmentsNEW", thisTool.toolId, tween);
          const runtime = timestamp - tween.startTime;
          tween.progress = Math.min(runtime / tween.duration, 1);
          tween.progress = easeOut(tween.progress);
          const increase = thisTool._arc.clockwise ? tween.toAngle > tween.fromAngle : tween.fromAngle > tween.toAngle;
          tween.frameAngle = tween.fromAngle + (tween.toAngle - tween.fromAngle) * tween.progress;
          frameSegment = thisTool._segmentAngles.findIndex((currentValue, index) => thisTool._arc.clockwise ? tween.frameAngle <= currentValue.boundsEnd && tween.frameAngle >= currentValue.boundsStart : tween.frameAngle <= currentValue.boundsStart && tween.frameAngle >= currentValue.boundsEnd);
          if (frameSegment === -1) {
            console.log("RENDERNEW animateSegments frameAngle not found", tween, thisTool._segmentAngles);
            console.log("config", thisTool.config);
          }
          runningSegment = thisTool._segmentAngles.findIndex((currentValue, index) => thisTool._arc.clockwise ? tween.runningAngle <= currentValue.boundsEnd && tween.runningAngle >= currentValue.boundsStart : tween.runningAngle <= currentValue.boundsStart && tween.runningAngle >= currentValue.boundsEnd);
          do {
            const aniStartAngle = thisTool._segmentAngles[runningSegment].drawStart;
            var runningSegmentAngle = thisTool._arc.clockwise ? Math.min(thisTool._segmentAngles[runningSegment].boundsEnd, tween.frameAngle) : Math.max(thisTool._segmentAngles[runningSegment].boundsEnd, tween.frameAngle);
            const aniEndAngle = thisTool._arc.clockwise ? Math.min(thisTool._segmentAngles[runningSegment].drawEnd, tween.frameAngle) : Math.max(thisTool._segmentAngles[runningSegment].drawEnd, tween.frameAngle);
            d2 = thisTool.buildArcPath(aniStartAngle, aniEndAngle, thisTool._arc.clockwise, arcRadiusX, arcRadiusY, arcWidth);
            if (!thisTool.myarc) thisTool.myarc = {};
            if (!thisTool.as) thisTool.as = {};
            let as;
            const myarc = "arc-segment-".concat(thisTool.toolId).concat("-").concat(runningSegment);
            if (!thisTool.as[runningSegment])
              thisTool.as[runningSegment] = thisTool._card.shadowRoot.getElementById(myarc);
            as = thisTool.as[runningSegment];
            thisTool.myarc[runningSegment] = myarc;
            if (as) {
              as.setAttribute("d", d2);
              if (thisTool.config.show.style === "colorlist") {
                as.style.fill = thisTool.config.segments.colorlist.colors[runningSegment];
                thisTool.styles.foreground[runningSegment].fill = thisTool.config.segments.colorlist.colors[runningSegment];
              }
              if (thisTool.config.show.lastcolor) {
                var fill;
                const boundsStart = thisTool._arc.clockwise ? thisTool._segmentAngles[runningSegment].drawStart : thisTool._segmentAngles[runningSegment].drawEnd;
                const boundsEnd = thisTool._arc.clockwise ? thisTool._segmentAngles[runningSegment].drawEnd : thisTool._segmentAngles[runningSegment].drawStart;
                const value = Math.min(Math.max(0, (runningSegmentAngle - boundsStart) / (boundsEnd - boundsStart)), 1);
                if (thisTool.config.show.style === "colorstops") {
                  fill = Colors.getGradientValue(
                    thisTool._segments.colorStops[thisTool._segments.sortedStops[runningSegment]],
                    thisTool._segments.colorStops[thisTool._segments.sortedStops[runningSegment]],
                    value
                  );
                } else {
                  if (thisTool.config.show.style === "colorlist") {
                    fill = thisTool.config.segments.colorlist.colors[runningSegment];
                  }
                }
                thisTool.styles.foreground[0].fill = fill;
                thisTool.as[0].style.fill = fill;
                if (runningSegment > 0) {
                  for (let j = runningSegment; j >= 0; j--) {
                    if (thisTool.styles.foreground[j].fill !== fill) {
                      thisTool.styles.foreground[j].fill = fill;
                      thisTool.as[j].style.fill = fill;
                    }
                    thisTool.styles.foreground[j].fill = fill;
                    thisTool.as[j].style.fill = fill;
                  }
                }
              }
            }
            thisTool._cache[runningSegment] = d2;
            if (tween.frameAngle !== runningSegmentAngle) {
              runningSegmentAngle += 1e-6 * thisTool._arc.direction;
            }
            var runningSegmentPrev = runningSegment;
            runningSegment = thisTool._segmentAngles.findIndex((currentValue, index) => thisTool._arc.clockwise ? runningSegmentAngle <= currentValue.boundsEnd && runningSegmentAngle >= currentValue.boundsStart : runningSegmentAngle <= currentValue.boundsStart && runningSegmentAngle >= currentValue.boundsEnd);
            if (!increase) {
              if (runningSegmentPrev !== runningSegment) {
                if (thisTool.debug) console.log("RENDERNEW movit - remove path", thisTool.toolId, runningSegmentPrev);
                if (thisTool._arc.clockwise) {
                  as.removeAttribute("d");
                  thisTool._cache[runningSegmentPrev] = null;
                } else {
                  as.removeAttribute("d");
                  thisTool._cache[runningSegmentPrev] = null;
                }
              }
            }
            tween.runningAngle = runningSegmentAngle;
            if (thisTool.debug) console.log("RENDERNEW - animation loop tween", thisTool.toolId, tween, runningSegment, runningSegmentPrev);
          } while (tween.runningAngle !== tween.frameAngle);
          if (tween.progress !== 1) {
            thisTool.rAFid = requestAnimationFrame((timestamp2) => {
              animateSegmentsNEW(timestamp2, thisTool);
            });
          } else {
            tween.startTime = null;
            if (thisTool.debug) console.log("RENDERNEW - animation loop ENDING tween", thisTool.toolId, tween, runningSegment, runningSegmentPrev);
          }
        };
        if (this.dev.debug) console.log("RENDERNEW _arcId DOES exist", this._arcId, this.toolId, this._firstUpdatedCalled);
        this._cache.forEach((item, index) => {
          d2 = item;
          if (this.config.isScale) {
            let fill = this.config.color;
            if (this.config.show.style === "colorlist") {
              fill = this.config.segments.colorlist.colors[index];
            }
            if (this.config.show.style === "colorstops") {
              fill = this._segments.colorStops[this._segments.sortedStops[index]];
            }
            if (!this.styles.foreground[index]) {
              this.styles.foreground[index] = Merge.mergeDeep(this.config.styles.foreground);
            }
            this.styles.foreground[index].fill = fill;
          }
          svgItems.push(svg`<path id="arc-segment-${this.toolId}-${index}" class="sak-segarc__foreground"
                            style="${styleMap$6(this.styles.foreground[index])}"
                            d="${d2}"
                            />`);
        });
        const tween = {};
        const mySelf = this;
        if (
          /* (val != valPrev) && */
          this._card.connected === true && this._renderTo !== this._stateValue
        ) {
          this._renderTo = this._stateValue;
          if (this.rAFid) {
            cancelAnimationFrame(this.rAFid);
          }
          tween.fromAngle = arcEndPrev;
          tween.toAngle = arcEnd;
          tween.runningAngle = arcEndPrev;
          {
            tween.duration = Math.min(Math.max(this._initialDraw ? 100 : 500, this._initialDraw ? 16 : this.config.animation.duration * 1e3), 5e3);
            tween.startTime = null;
            if (this.dev.debug) console.log("RENDERNEW - tween", this.toolId, tween);
            this.rAFid = requestAnimationFrame((timestamp) => {
              animateSegmentsNEW(timestamp, mySelf);
            });
            this._initialDraw = false;
          }
        }
        return svg`${svgItems}`;
      } else {
        if (this.dev.debug) console.log("RENDERNEW _arcId does NOT exist", this._arcId, this.toolId);
        for (let i = 0; i < this._segmentAngles.length; i++) {
          d2 = this.buildArcPath(
            this._segmentAngles[i].drawStart,
            this._segmentAngles[i].drawEnd,
            this._arc.clockwise,
            this.svg.radiusX,
            this.svg.radiusY,
            this.config.isScale ? this.svg.width : 0
          );
          this._cache[i] = d2;
          let fill = this.config.color;
          if (this.config.show.style === "colorlist") {
            fill = this.config.segments.colorlist.colors[i];
          }
          if (this.config.show.style === "colorstops") {
            fill = this._segments.colorStops[this._segments.sortedStops[i]];
          }
          if (!this.styles.foreground) {
            this.styles.foreground = {};
          }
          if (!this.styles.foreground[i]) {
            this.styles.foreground[i] = Merge.mergeDeep(this.config.styles.foreground);
          }
          this.styles.foreground[i].fill = fill;
          if (this.config.show.lastcolor) {
            if (i > 0) {
              for (let j = i - 1; j > 0; j--) {
                this.styles.foreground[j].fill = fill;
              }
            }
          }
          svgItems.push(svg`<path id="arc-segment-${this.toolId}-${i}" class="arc__segment"
                            style="${styleMap$6(this.styles.foreground[i])}"
                            d="${d2}"
                            />`);
        }
        if (this.dev.debug) console.log("RENDERNEW - svgItems", svgItems, this._firstUpdatedCalled);
        return svg`${svgItems}`;
      }
    }
  }
  polarToCartesian(centerX, centerY, radiusX, radiusY, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
    return {
      x: centerX + radiusX * Math.cos(angleInRadians),
      y: centerY + radiusY * Math.sin(angleInRadians)
    };
  }
  /*
   *
   * start = 10, end = 30, clockwise -> size is 20
   * start = 10, end = 30, anticlockwise -> size is (360 - 20) = 340
   *
   *
   */
  buildArcPath(argStartAngle, argEndAngle, argClockwise, argRadiusX, argRadiusY, argWidth) {
    const start = this.polarToCartesian(this.svg.cx, this.svg.cy, argRadiusX, argRadiusY, argEndAngle);
    const end = this.polarToCartesian(this.svg.cx, this.svg.cy, argRadiusX, argRadiusY, argStartAngle);
    const largeArcFlag = Math.abs(argEndAngle - argStartAngle) <= 180 ? "0" : "1";
    const sweepFlag = argClockwise ? "0" : "1";
    const cutoutRadiusX = argRadiusX - argWidth;
    const cutoutRadiusY = argRadiusY - argWidth;
    const start2 = this.polarToCartesian(this.svg.cx, this.svg.cy, cutoutRadiusX, cutoutRadiusY, argEndAngle);
    const end2 = this.polarToCartesian(this.svg.cx, this.svg.cy, cutoutRadiusX, cutoutRadiusY, argStartAngle);
    const d2 = [
      "M",
      start.x,
      start.y,
      "A",
      argRadiusX,
      argRadiusY,
      0,
      largeArcFlag,
      sweepFlag,
      end.x,
      end.y,
      "L",
      end2.x,
      end2.y,
      "A",
      cutoutRadiusX,
      cutoutRadiusY,
      0,
      largeArcFlag,
      sweepFlag === "0" ? "1" : "0",
      start2.x,
      start2.y,
      "Z"
    ].join(" ");
    return d2;
  }
}
function classMap$3(classes) {
  if (!classes) return "";
  return Object.entries(classes).filter(([_, value]) => value).map(([key, _]) => key).join(" ");
}
function styleMap$5(styles) {
  if (!styles) return "";
  return Object.entries(styles).filter(([_, value]) => value != null && value !== "").map(([key, value]) => `${key}: ${value}`).join("; ");
}
class SparklineBarChartTool extends BaseTool {
  constructor(argToolset, argConfig, argPos) {
    const DEFAULT_BARCHART_CONFIG = {
      position: {
        cx: 50,
        cy: 50,
        height: 25,
        width: 25,
        margin: 0.5,
        orientation: "vertical"
      },
      hours: 24,
      barhours: 1,
      color: "var(--primary-color)",
      classes: {
        tool: {
          "sak-barchart": true,
          hover: true
        },
        bar: {},
        line: {
          "sak-barchart__line": true,
          hover: true
        }
      },
      styles: {
        tool: {},
        line: {},
        bar: {}
      },
      colorstops: [],
      show: { style: "fixedcolor" }
    };
    super(argToolset, Merge.mergeDeep(DEFAULT_BARCHART_CONFIG, argConfig), argPos);
    this.svg.margin = Utils.calculateSvgDimension(this.config.position.margin);
    const theWidth = this.config.position.orientation === "vertical" ? this.svg.width : this.svg.height;
    this.svg.barWidth = (theWidth - (this.config.hours / this.config.barhours - 1) * this.svg.margin) / (this.config.hours / this.config.barhours);
    this._data = [];
    this._bars = [];
    this._scale = {};
    this._needsRendering = false;
    this.classes.tool = {};
    this.classes.bar = {};
    this.styles.tool = {};
    this.styles.line = {};
    this.stylesBar = {};
    if (this.dev.debug) console.log("SparkleBarChart constructor coords, dimensions", this.coords, this.dimensions, this.svg, this.config);
  }
  /** *****************************************************************************
    * SparklineBarChartTool::computeMinMax()
    *
    * Summary.
    * Compute min/max values of bars to scale them to the maximum amount.
    *
    */
  computeMinMax() {
    let min = this._series[0];
    let max = this._series[0];
    for (let i = 1, len = this._series.length; i < len; i++) {
      const v = this._series[i];
      min = v < min ? v : min;
      max = v > max ? v : max;
    }
    this._scale.min = min;
    this._scale.max = max;
    this._scale.size = max - min;
    this._scale.size = (max - min) * 1.05;
    this._scale.min = max - this._scale.size;
  }
  /** *****************************************************************************
    * SparklineBarChartTool::set series
    *
    * Summary.
    * Sets the timeseries for the barchart tool. Is an array of states.
    * If this is historical data, the caller has taken the time to create this.
    * This tool only displays the result...
    *
    */
  set data(states) {
    this._series = Object.assign(states);
    this.computeBars();
    this._needsRendering = true;
  }
  set series(states) {
    this._series = Object.assign(states);
    this.computeBars();
    this._needsRendering = true;
  }
  hasSeries() {
    return this.defaultEntityIndex();
  }
  /** *****************************************************************************
    * SparklineBarChartTool::computeBars()
    *
    * Summary.
    * Compute start and end of bars for easy rendering.
    *
    */
  computeBars({ _bars } = this) {
    this.computeMinMax();
    if (this.config.show.style === "minmaxgradient") {
      this.colorStopsMinMax = {};
      this.colorStopsMinMax = {
        [this._scale.min.toString()]: this.config.minmaxgradient.colors.min,
        [this._scale.max.toString()]: this.config.minmaxgradient.colors.max
      };
    }
    if (this.config.position.orientation === "vertical") {
      if (this.dev.debug) console.log("bar is vertical");
      this._series.forEach((item, index) => {
        if (!_bars[index]) _bars[index] = {};
        _bars[index].length = this._scale.size === 0 ? 0 : (item - this._scale.min) / this._scale.size * this.svg.height;
        _bars[index].x1 = this.svg.x + this.svg.barWidth / 2 + (this.svg.barWidth + this.svg.margin) * index;
        _bars[index].x2 = _bars[index].x1;
        _bars[index].y1 = this.svg.y + this.svg.height;
        _bars[index].y2 = _bars[index].y1 - this._bars[index].length;
        _bars[index].dataLength = this._bars[index].length;
      });
    } else if (this.config.position.orientation === "horizontal") {
      if (this.dev.debug) console.log("bar is horizontal");
      this._data.forEach((item, index) => {
        if (!_bars[index]) _bars[index] = {};
        _bars[index].length = this._scale.size === 0 ? 0 : (item - this._scale.min) / this._scale.size * this.svg.width;
        _bars[index].y1 = this.svg.y + this.svg.barWidth / 2 + (this.svg.barWidth + this.svg.margin) * index;
        _bars[index].y2 = _bars[index].y1;
        _bars[index].x1 = this.svg.x;
        _bars[index].x2 = _bars[index].x1 + this._bars[index].length;
        _bars[index].dataLength = this._bars[index].length;
      });
    } else if (this.dev.debug) console.log("SparklineBarChartTool - unknown barchart orientation (horizontal or vertical)");
  }
  /** *****************************************************************************
    * SparklineBarChartTool::_renderBars()
    *
    * Summary.
    * Render all the bars. Number of bars depend on hours and barhours settings.
    *
    */
  // _renderBars({ _bars } = this) {
  _renderBars() {
    const svgItems = [];
    if (this._bars.length === 0) return;
    if (this.dev.debug) console.log("_renderBars IN", this.toolId);
    this._bars.forEach((item, index) => {
      if (this.dev.debug) console.log("_renderBars - bars", item, index);
      const stroke = this.getColorFromState(this._series[index]);
      if (!this.stylesBar[index])
        this.stylesBar[index] = { ...this.config.styles.bar };
      if (!this._bars[index].y2) console.log("sparklebarchart y2 invalid", this._bars[index]);
      svgItems.push(svg`
          <line id="line-segment-${this.toolId}-${index}" class="${classMap$3(this.config.classes.line)}"
                    style="${styleMap$5(this.stylesBar[index])}"
                    x1="${this._bars[index].x1}"
                    x2="${this._bars[index].x2}"
                    y1="${this._bars[index].y1}"
                    y2="${this._bars[index].y2}"
                    data-length="${this._bars[index].dataLength}"
                    stroke="${stroke}"
                    stroke-width="${this.svg.barWidth}"
                    />
          `);
    });
    if (this.dev.debug) console.log("_renderBars OUT", this.toolId);
    return svg`${svgItems}`;
  }
  /** *****************************************************************************
    * SparklineBarChartTool::render()
    *
    * Summary.
    * The actual render() function called by the card for each tool.
    *
    */
  render() {
    return svg`
        <g id="barchart-${this.toolId}"
          class="${classMap$3(this.classes.tool)}" style="${styleMap$5(this.styles.tool)}"
          @click=${(e) => this.handleTapEvent(e, this.config)}>
          ${this._renderBars()}
        </g>
      `;
  }
}
function classMap$2(classes) {
  if (!classes) return "";
  return Object.entries(classes).filter(([_, value]) => value).map(([key, _]) => key).join(" ");
}
function styleMap$4(styles) {
  if (!styles) return "";
  return Object.entries(styles).filter(([_, value]) => value != null && value !== "").map(([key, value]) => `${key}: ${value}`).join("; ");
}
class SwitchTool extends BaseTool {
  constructor(argToolset, argConfig, argPos) {
    const DEFAULT_SWITCH_CONFIG = {
      position: {
        cx: 50,
        cy: 50,
        orientation: "horizontal",
        track: {
          width: 16,
          height: 7,
          radius: 3.5
        },
        thumb: {
          width: 9,
          height: 9,
          radius: 4.5,
          offset: 4.5
        }
      },
      classes: {
        tool: {
          "sak-switch": true,
          hover: true
        },
        track: {
          "sak-switch__track": true
        },
        thumb: {
          "sak-switch__thumb": true
        }
      },
      styles: {
        tool: {
          overflow: "visible"
        },
        track: {},
        thumb: {}
      }
    };
    const HORIZONTAL_SWITCH_CONFIG = {
      animations: [
        {
          state: "on",
          id: 1,
          styles: {
            track: {
              fill: "var(--switch-checked-track-color)",
              "pointer-events": "auto"
            },
            thumb: {
              fill: "var(--switch-checked-button-color)",
              transform: "translateX(4.5em)",
              "pointer-events": "auto"
            }
          }
        },
        {
          state: "off",
          id: 0,
          styles: {
            track: {
              fill: "var(--switch-unchecked-track-color)",
              "pointer-events": "auto"
            },
            thumb: {
              fill: "var(--switch-unchecked-button-color)",
              transform: "translateX(-4.5em)",
              "pointer-events": "auto"
            }
          }
        }
      ]
    };
    const VERTICAL_SWITCH_CONFIG = {
      animations: [
        {
          state: "on",
          id: 1,
          styles: {
            track: {
              fill: "var(--switch-checked-track-color)",
              "pointer-events": "auto"
            },
            thumb: {
              fill: "var(--switch-checked-button-color)",
              transform: "translateY(-4.5em)",
              "pointer-events": "auto"
            }
          }
        },
        {
          state: "off",
          id: 0,
          styles: {
            track: {
              fill: "var(--switch-unchecked-track-color)",
              "pointer-events": "auto"
            },
            thumb: {
              fill: "var(--switch-unchecked-button-color)",
              transform: "translateY(4.5em)",
              "pointer-events": "auto"
            }
          }
        }
      ]
    };
    super(argToolset, Merge.mergeDeep(DEFAULT_SWITCH_CONFIG, argConfig), argPos);
    if (!["horizontal", "vertical"].includes(this.config.position.orientation))
      throw Error("SwitchTool::constructor - invalid orientation [vertical, horizontal] = ", this.config.position.orientation);
    this.svg.track = {};
    this.svg.track.radius = Utils.calculateSvgDimension(this.config.position.track.radius);
    this.svg.thumb = {};
    this.svg.thumb.radius = Utils.calculateSvgDimension(this.config.position.thumb.radius);
    this.svg.thumb.offset = Utils.calculateSvgDimension(this.config.position.thumb.offset);
    switch (this.config.position.orientation) {
      default:
      case "horizontal":
        this.config = Merge.mergeDeep(DEFAULT_SWITCH_CONFIG, HORIZONTAL_SWITCH_CONFIG, argConfig);
        this.svg.track.width = Utils.calculateSvgDimension(this.config.position.track.width);
        this.svg.track.height = Utils.calculateSvgDimension(this.config.position.track.height);
        this.svg.thumb.width = Utils.calculateSvgDimension(this.config.position.thumb.width);
        this.svg.thumb.height = Utils.calculateSvgDimension(this.config.position.thumb.height);
        this.svg.track.x1 = this.svg.cx - this.svg.track.width / 2;
        this.svg.track.y1 = this.svg.cy - this.svg.track.height / 2;
        this.svg.thumb.x1 = this.svg.cx - this.svg.thumb.width / 2;
        this.svg.thumb.y1 = this.svg.cy - this.svg.thumb.height / 2;
        break;
      case "vertical":
        this.config = Merge.mergeDeep(DEFAULT_SWITCH_CONFIG, VERTICAL_SWITCH_CONFIG, argConfig);
        this.svg.track.width = Utils.calculateSvgDimension(this.config.position.track.height);
        this.svg.track.height = Utils.calculateSvgDimension(this.config.position.track.width);
        this.svg.thumb.width = Utils.calculateSvgDimension(this.config.position.thumb.height);
        this.svg.thumb.height = Utils.calculateSvgDimension(this.config.position.thumb.width);
        this.svg.track.x1 = this.svg.cx - this.svg.track.width / 2;
        this.svg.track.y1 = this.svg.cy - this.svg.track.height / 2;
        this.svg.thumb.x1 = this.svg.cx - this.svg.thumb.width / 2;
        this.svg.thumb.y1 = this.svg.cy - this.svg.thumb.height / 2;
        break;
    }
    this.classes.track = {};
    this.classes.thumb = {};
    this.styles.track = {};
    this.styles.thumb = {};
    if (this.dev.debug) console.log("SwitchTool constructor config, svg", this.toolId, this.config, this.svg);
  }
  /** *****************************************************************************
  * SwitchTool::value()
  *
  * Summary.
  * Receive new state data for the entity this switch is linked to. Called from set hass;
  *
  */
  set value(state) {
    super.value = state;
  }
  /**
  * SwitchTool::_renderSwitch()
  *
  * Summary.
  * Renders the switch using precalculated coordinates and dimensions.
  * Only the runtime style is calculated before rendering the switch
  *
  */
  _renderSwitch() {
    this.MergeAnimationClassIfChanged();
    this.MergeAnimationStyleIfChanged(this.styles);
    return svg`
      <g>
        <rect class="${classMap$2(this.classes.track)}" x="${this.svg.track.x1}" y="${this.svg.track.y1}"
          width="${this.svg.track.width}" height="${this.svg.track.height}" rx="${this.svg.track.radius}"
          style="${styleMap$4(this.styles.track)}"
        />
        <rect class="${classMap$2(this.classes.thumb)}" x="${this.svg.thumb.x1}" y="${this.svg.thumb.y1}"
          width="${this.svg.thumb.width}" height="${this.svg.thumb.height}" rx="${this.svg.thumb.radius}" 
          style="${styleMap$4(this.styles.thumb)}"
        />
      </g>
      `;
  }
  /** *****************************************************************************
  * SwitchTool::render()
  *
  * Summary.
  * The render() function for this object.
  *
  * https://codepen.io/joegaffey/pen/vrVZaN
  *
  */
  render() {
    return svg`
      <g id="switch-${this.toolId}" transform-origin="${this.svg.cx} ${this.svg.cy}"
        class="${classMap$2(this.classes.tool)}" style="${styleMap$4(this.styles.tool)}"
        @click=${(e) => this.handleTapEvent(e, this.config)}>
        ${this._renderSwitch()}
      </g>
    `;
  }
}
function classMap$1(classes) {
  if (!classes) return "";
  return Object.entries(classes).filter(([_, value]) => value).map(([key, _]) => key).join(" ");
}
function styleMap$3(styles) {
  if (!styles) return "";
  return Object.entries(styles).filter(([_, value]) => value != null && value !== "").map(([key, value]) => `${key}: ${value}`).join("; ");
}
class TextTool extends BaseTool {
  constructor(argToolset, argConfig, argPos) {
    const DEFAULT_TEXT_CONFIG = {
      classes: {
        tool: {
          "sak-text": true
        },
        text: {
          "sak-text__text": true,
          hover: false
        }
      },
      styles: {
        tool: {},
        text: {}
      }
    };
    super(argToolset, Merge.mergeDeep(DEFAULT_TEXT_CONFIG, argConfig), argPos);
    this.EnableHoverForInteraction();
    this.text = this.config.text;
    this.classes.tool = {};
    this.classes.text = {};
    this.styles.tool = {};
    this.styles.text = {};
    if (this.dev.debug) console.log("TextTool constructor coords, dimensions", this.coords, this.dimensions, this.svg, this.config);
  }
  /** *****************************************************************************
  * TextTool::_renderText()
  *
  * Summary.
  * Renders the text using precalculated coordinates and dimensions.
  * Only the runtime style is calculated before rendering the text
  *
  */
  _renderText() {
    this.MergeAnimationClassIfChanged();
    this.MergeColorFromState(this.styles.text);
    this.MergeAnimationStyleIfChanged();
    return svg`
        <text>
          <tspan class="${classMap$1(this.classes.text)}" x="${this.svg.cx}" y="${this.svg.cy}" style="${styleMap$3(this.styles.text)}">${this.text}</tspan>
        </text>
      `;
  }
  /** *****************************************************************************
  * TextTool::render()
  *
  * Summary.
  * The render() function for this object.
  *
  */
  render() {
    return svg`
        <g id="text-${this.toolId}"
          class="${classMap$1(this.classes.tool)}" style="${styleMap$3(this.styles.tool)}"
          @click=${(e) => this.handleTapEvent(e, this.config)}>
          ${this._renderText()}
        </g>
      `;
  }
}
function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}
/*!
 * content-type
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
var PARAM_REGEXP = /; *([!#$%&'*+.^_`|~0-9A-Za-z-]+) *= *("(?:[\u000b\u0020\u0021\u0023-\u005b\u005d-\u007e\u0080-\u00ff]|\\[\u000b\u0020-\u00ff])*"|[!#$%&'*+.^_`|~0-9A-Za-z-]+) */g;
var QESC_REGEXP = /\\([\u000b\u0020-\u00ff])/g;
var TYPE_REGEXP = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+\/[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
var parse_1 = parse;
function parse(string) {
  if (!string) {
    throw new TypeError("argument string is required");
  }
  var header = typeof string === "object" ? getcontenttype(string) : string;
  if (typeof header !== "string") {
    throw new TypeError("argument string is required to be a string");
  }
  var index = header.indexOf(";");
  var type = index !== -1 ? header.slice(0, index).trim() : header.trim();
  if (!TYPE_REGEXP.test(type)) {
    throw new TypeError("invalid media type");
  }
  var obj = new ContentType(type.toLowerCase());
  if (index !== -1) {
    var key;
    var match;
    var value;
    PARAM_REGEXP.lastIndex = index;
    while (match = PARAM_REGEXP.exec(header)) {
      if (match.index !== index) {
        throw new TypeError("invalid parameter format");
      }
      index += match[0].length;
      key = match[1].toLowerCase();
      value = match[2];
      if (value.charCodeAt(0) === 34) {
        value = value.slice(1, -1);
        if (value.indexOf("\\") !== -1) {
          value = value.replace(QESC_REGEXP, "$1");
        }
      }
      obj.parameters[key] = value;
    }
    if (index !== header.length) {
      throw new TypeError("invalid parameter format");
    }
  }
  return obj;
}
function getcontenttype(obj) {
  var header;
  if (typeof obj.getHeader === "function") {
    header = obj.getHeader("content-type");
  } else if (typeof obj.headers === "object") {
    header = obj.headers && obj.headers["content-type"];
  }
  if (typeof header !== "string") {
    throw new TypeError("content-type header is missing from object");
  }
  return header;
}
function ContentType(type) {
  this.parameters = /* @__PURE__ */ Object.create(null);
  this.type = type;
}
var cache = /* @__PURE__ */ new Map();
var cloneSvg = function cloneSvg2(sourceSvg) {
  return sourceSvg.cloneNode(true);
};
var isLocal = function isLocal2() {
  return window.location.protocol === "file:";
};
var makeAjaxRequest = function makeAjaxRequest2(url, httpRequestWithCredentials, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() {
    try {
      if (!/\.svg/i.test(url) && httpRequest.readyState === 2) {
        var contentType = httpRequest.getResponseHeader("Content-Type");
        if (!contentType) {
          throw new Error("Content type not found");
        }
        var type = parse_1(contentType).type;
        if (!(type === "image/svg+xml" || type === "text/plain")) {
          throw new Error("Invalid content type: ".concat(type));
        }
      }
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 404 || httpRequest.responseXML === null) {
          throw new Error(isLocal() ? "Note: SVG injection ajax calls do not work locally without adjusting security settings in your browser. Or consider using a local webserver." : "Unable to load SVG file: " + url);
        }
        if (httpRequest.status === 200 || isLocal() && httpRequest.status === 0) {
          callback(null, httpRequest);
        } else {
          throw new Error("There was a problem injecting the SVG: " + httpRequest.status + " " + httpRequest.statusText);
        }
      }
    } catch (error) {
      httpRequest.abort();
      if (error instanceof Error) {
        callback(error, httpRequest);
      } else {
        throw error;
      }
    }
  };
  httpRequest.open("GET", url);
  httpRequest.withCredentials = httpRequestWithCredentials;
  if (httpRequest.overrideMimeType) {
    httpRequest.overrideMimeType("text/xml");
  }
  httpRequest.send();
};
var requestQueue = {};
var queueRequest = function queueRequest2(url, callback) {
  requestQueue[url] = requestQueue[url] || [];
  requestQueue[url].push(callback);
};
var processRequestQueue = function processRequestQueue2(url) {
  var _loop_1 = function _loop_12(i2, len2) {
    setTimeout(function() {
      if (Array.isArray(requestQueue[url])) {
        var cacheValue = cache.get(url);
        var callback = requestQueue[url][i2];
        if (cacheValue instanceof SVGSVGElement) {
          callback(null, cloneSvg(cacheValue));
        }
        if (cacheValue instanceof Error) {
          callback(cacheValue);
        }
        if (i2 === requestQueue[url].length - 1) {
          delete requestQueue[url];
        }
      }
    }, 0);
  };
  for (var i = 0, len = requestQueue[url].length; i < len; i++) {
    _loop_1(i);
  }
};
var loadSvgCached = function loadSvgCached2(url, httpRequestWithCredentials, callback) {
  if (cache.has(url)) {
    var cacheValue = cache.get(url);
    if (cacheValue === void 0) {
      queueRequest(url, callback);
      return;
    }
    if (cacheValue instanceof SVGSVGElement) {
      callback(null, cloneSvg(cacheValue));
      return;
    }
  }
  cache.set(url, void 0);
  queueRequest(url, callback);
  makeAjaxRequest(url, httpRequestWithCredentials, function(error, httpRequest) {
    var _a;
    if (error) {
      cache.set(url, error);
    } else if (((_a = httpRequest.responseXML) === null || _a === void 0 ? void 0 : _a.documentElement) instanceof SVGSVGElement) {
      cache.set(url, httpRequest.responseXML.documentElement);
    }
    processRequestQueue(url);
  });
};
var loadSvgUncached = function loadSvgUncached2(url, httpRequestWithCredentials, callback) {
  makeAjaxRequest(url, httpRequestWithCredentials, function(error, httpRequest) {
    var _a;
    if (error) {
      callback(error);
    } else if (((_a = httpRequest.responseXML) === null || _a === void 0 ? void 0 : _a.documentElement) instanceof SVGSVGElement) {
      callback(null, httpRequest.responseXML.documentElement);
    }
  });
};
var idCounter = 0;
var uniqueId = function uniqueId2() {
  return ++idCounter;
};
var injectedElements = [];
var ranScripts = {};
var svgNamespace = "http://www.w3.org/2000/svg";
var xlinkNamespace = "http://www.w3.org/1999/xlink";
var injectElement = function injectElement2(el, evalScripts, renumerateIRIElements, cacheRequests, httpRequestWithCredentials, beforeEach, callback) {
  var elUrl = el.getAttribute("data-src") || el.getAttribute("src");
  if (!elUrl) {
    callback(new Error("Invalid data-src or src attribute"));
    return;
  }
  if (injectedElements.indexOf(el) !== -1) {
    injectedElements.splice(injectedElements.indexOf(el), 1);
    el = null;
    return;
  }
  injectedElements.push(el);
  el.setAttribute("src", "");
  var loadSvg = cacheRequests ? loadSvgCached : loadSvgUncached;
  loadSvg(elUrl, httpRequestWithCredentials, function(error, svg2) {
    if (!svg2) {
      injectedElements.splice(injectedElements.indexOf(el), 1);
      el = null;
      callback(error);
      return;
    }
    var elId = el.getAttribute("id");
    if (elId) {
      svg2.setAttribute("id", elId);
    }
    var elTitle = el.getAttribute("title");
    if (elTitle) {
      svg2.setAttribute("title", elTitle);
    }
    var elWidth = el.getAttribute("width");
    if (elWidth) {
      svg2.setAttribute("width", elWidth);
    }
    var elHeight = el.getAttribute("height");
    if (elHeight) {
      svg2.setAttribute("height", elHeight);
    }
    var mergedClasses = Array.from(new Set(__spreadArray(__spreadArray(__spreadArray([], (svg2.getAttribute("class") || "").split(" "), true), ["injected-svg"], false), (el.getAttribute("class") || "").split(" "), true))).join(" ").trim();
    svg2.setAttribute("class", mergedClasses);
    var elStyle = el.getAttribute("style");
    if (elStyle) {
      svg2.setAttribute("style", elStyle);
    }
    svg2.setAttribute("data-src", elUrl);
    var elData = [].filter.call(el.attributes, function(at) {
      return /^data-\w[\w-]*$/.test(at.name);
    });
    Array.prototype.forEach.call(elData, function(dataAttr) {
      if (dataAttr.name && dataAttr.value) {
        svg2.setAttribute(dataAttr.name, dataAttr.value);
      }
    });
    if (renumerateIRIElements) {
      var iriElementsAndProperties_1 = {
        clipPath: ["clip-path"],
        "color-profile": ["color-profile"],
        cursor: ["cursor"],
        filter: ["filter"],
        linearGradient: ["fill", "stroke"],
        marker: ["marker", "marker-start", "marker-mid", "marker-end"],
        mask: ["mask"],
        path: [],
        pattern: ["fill", "stroke"],
        radialGradient: ["fill", "stroke"]
      };
      var element_1;
      var elements_1;
      var properties_1;
      var currentId_1;
      var newId_1;
      Object.keys(iriElementsAndProperties_1).forEach(function(key) {
        element_1 = key;
        properties_1 = iriElementsAndProperties_1[key];
        elements_1 = svg2.querySelectorAll(element_1 + "[id]");
        var _loop_1 = function _loop_12(a2, elementsLen2) {
          currentId_1 = elements_1[a2].id;
          newId_1 = currentId_1 + "-" + uniqueId();
          var referencingElements;
          Array.prototype.forEach.call(properties_1, function(property) {
            referencingElements = svg2.querySelectorAll("[" + property + '*="' + currentId_1 + '"]');
            for (var b = 0, referencingElementLen = referencingElements.length; b < referencingElementLen; b++) {
              var attrValue = referencingElements[b].getAttribute(property);
              if (attrValue && !attrValue.match(new RegExp('url\\("?#' + currentId_1 + '"?\\)'))) {
                continue;
              }
              referencingElements[b].setAttribute(property, "url(#" + newId_1 + ")");
            }
          });
          var allLinks = svg2.querySelectorAll("[*|href]");
          var links = [];
          for (var c = 0, allLinksLen = allLinks.length; c < allLinksLen; c++) {
            var href = allLinks[c].getAttributeNS(xlinkNamespace, "href");
            if (href && href.toString() === "#" + elements_1[a2].id) {
              links.push(allLinks[c]);
            }
          }
          for (var d2 = 0, linksLen = links.length; d2 < linksLen; d2++) {
            links[d2].setAttributeNS(xlinkNamespace, "href", "#" + newId_1);
          }
          elements_1[a2].id = newId_1;
        };
        for (var a = 0, elementsLen = elements_1.length; a < elementsLen; a++) {
          _loop_1(a);
        }
      });
    }
    svg2.removeAttribute("xmlns:a");
    var scripts = svg2.querySelectorAll("script");
    var scriptsToEval = [];
    var script;
    var scriptType;
    for (var i = 0, scriptsLen = scripts.length; i < scriptsLen; i++) {
      scriptType = scripts[i].getAttribute("type");
      if (!scriptType || scriptType === "application/ecmascript" || scriptType === "application/javascript" || scriptType === "text/javascript") {
        script = scripts[i].innerText || scripts[i].textContent;
        if (script) {
          scriptsToEval.push(script);
        }
        svg2.removeChild(scripts[i]);
      }
    }
    if (scriptsToEval.length > 0 && (evalScripts === "always" || evalScripts === "once" && !ranScripts[elUrl])) {
      for (var l = 0, scriptsToEvalLen = scriptsToEval.length; l < scriptsToEvalLen; l++) {
        new Function(scriptsToEval[l])(window);
      }
      ranScripts[elUrl] = true;
    }
    var styleTags = svg2.querySelectorAll("style");
    Array.prototype.forEach.call(styleTags, function(styleTag) {
      styleTag.textContent += "";
    });
    svg2.setAttribute("xmlns", svgNamespace);
    svg2.setAttribute("xmlns:xlink", xlinkNamespace);
    beforeEach(svg2);
    if (!el.parentNode) {
      injectedElements.splice(injectedElements.indexOf(el), 1);
      el = null;
      callback(new Error("Parent node is null"));
      return;
    }
    el.parentNode.replaceChild(svg2, el);
    injectedElements.splice(injectedElements.indexOf(el), 1);
    el = null;
    callback(null, svg2);
  });
};
var SVGInjector = function SVGInjector2(elements, _a) {
  var _b = _a === void 0 ? {} : _a, _c = _b.afterAll, afterAll = _c === void 0 ? function() {
    return void 0;
  } : _c, _d = _b.afterEach, afterEach = _d === void 0 ? function() {
    return void 0;
  } : _d, _e = _b.beforeEach, beforeEach = _e === void 0 ? function() {
    return void 0;
  } : _e, _f = _b.cacheRequests, cacheRequests = _f === void 0 ? true : _f, _g = _b.evalScripts, evalScripts = _g === void 0 ? "never" : _g, _h = _b.httpRequestWithCredentials, httpRequestWithCredentials = _h === void 0 ? false : _h, _j = _b.renumerateIRIElements, renumerateIRIElements = _j === void 0 ? true : _j;
  if (elements && "length" in elements) {
    var elementsLoaded_1 = 0;
    for (var i = 0, j = elements.length; i < j; i++) {
      injectElement(elements[i], evalScripts, renumerateIRIElements, cacheRequests, httpRequestWithCredentials, beforeEach, function(error, svg2) {
        afterEach(error, svg2);
        if (elements && "length" in elements && elements.length === ++elementsLoaded_1) {
          afterAll(elementsLoaded_1);
        }
      });
    }
  } else if (elements) {
    injectElement(elements, evalScripts, renumerateIRIElements, cacheRequests, httpRequestWithCredentials, beforeEach, function(error, svg2) {
      afterEach(error, svg2);
      afterAll(1);
      elements = null;
    });
  } else {
    afterAll(0);
  }
};
function classMap(classes) {
  if (!classes) return "";
  return Object.entries(classes).filter(([_, value]) => value).map(([key, _]) => key).join(" ");
}
function styleMap$2(styles) {
  if (!styles) return "";
  return Object.entries(styles).filter(([_, value]) => value != null && value !== "").map(([key, value]) => `${key}: ${value}`).join("; ");
}
class UserSvgTool extends BaseTool {
  constructor(argToolset, argConfig, argPos) {
    const DEFAULT_USERSVG_CONFIG = {
      position: {
        cx: 50,
        cy: 50,
        height: 50,
        width: 50
      },
      options: {
        svginject: true
      },
      styles: {
        usersvg: {},
        mask: {
          fill: "white"
        }
      }
    };
    super(argToolset, Merge.mergeDeep(DEFAULT_USERSVG_CONFIG, argConfig), argPos);
    this.images = {};
    this.images = Object.assign({}, ...this.config.images);
    this.item = {};
    this.item.image = "default";
    this.imageCur = "none";
    this.imagePrev = "none";
    this.classes = {};
    this.classes.tool = {};
    this.classes.usersvg = {};
    this.classes.mask = {};
    this.styles = {};
    this.styles.tool = {};
    this.styles.usersvg = {};
    this.styles.mask = {};
    this.injector = {};
    this.injector.svg = null;
    this.injector.cache = [];
    this.clipPath = {};
    if (this.config.clip_path) {
      this.svg.cp_cx = Utils.calculateSvgCoordinate(this.config.clip_path.position.cx || this.config.position.cx, 0);
      this.svg.cp_cy = Utils.calculateSvgCoordinate(this.config.clip_path.position.cy || this.config.position.cy, 0);
      this.svg.cp_height = Utils.calculateSvgDimension(this.config.clip_path.position.height || this.config.position.height);
      this.svg.cp_width = Utils.calculateSvgDimension(this.config.clip_path.position.width || this.config.position.width);
      const maxRadius = Math.min(this.svg.cp_height, this.svg.cp_width) / 2;
      this.svg.radiusTopLeft = +Math.min(maxRadius, Math.max(0, Utils.calculateSvgDimension(
        this.config.clip_path.position.radius.top_left || this.config.clip_path.position.radius.left || this.config.clip_path.position.radius.top || this.config.clip_path.position.radius.all
      ))) || 0;
      this.svg.radiusTopRight = +Math.min(maxRadius, Math.max(0, Utils.calculateSvgDimension(
        this.config.clip_path.position.radius.top_right || this.config.clip_path.position.radius.right || this.config.clip_path.position.radius.top || this.config.clip_path.position.radius.all
      ))) || 0;
      this.svg.radiusBottomLeft = +Math.min(maxRadius, Math.max(0, Utils.calculateSvgDimension(
        this.config.clip_path.position.radius.bottom_left || this.config.clip_path.position.radius.left || this.config.clip_path.position.radius.bottom || this.config.clip_path.position.radius.all
      ))) || 0;
      this.svg.radiusBottomRight = +Math.min(maxRadius, Math.max(0, Utils.calculateSvgDimension(
        this.config.clip_path.position.radius.bottom_right || this.config.clip_path.position.radius.right || this.config.clip_path.position.radius.bottom || this.config.clip_path.position.radius.all
      ))) || 0;
    }
    if (this.dev.debug) console.log("UserSvgTool constructor config, svg", this.toolId, this.config, this.svg);
  }
  /** *****************************************************************************
  * UserSvgTool::value()
  *
  * Summary.
  * Receive new state data for the entity this usersvg is linked to. Called from set hass;
  *
  */
  set value(state) {
    super.value = state;
  }
  /**
   * Summary.
   * Use firstUpdated(). updated() gives a loop of updates of the SVG if more than one SVG
   * is defined in the card: things start to blink, as each SVG is removed/rendered in a loop
   * so it seems. Either a bug in the Injector, or the UserSvg tool...
   *
   * @param {()} changedProperties
   * @returns
   */
  // eslint-disable-next-line no-unused-vars
  updated(changedProperties) {
    var myThis = this;
    if (!this.config.options.svginject || this.injector.cache[this.imageCur]) {
      return;
    }
    this.injector.elementsToInject = this._card.shadowRoot.getElementById(
      "usersvg-".concat(this.toolId)
    ).querySelectorAll("svg[data-src]:not(.injected-svg)");
    if (this.injector.elementsToInject.length !== 0) {
      SVGInjector(this.injector.elementsToInject, {
        afterAll(elementsLoaded) {
          setTimeout(() => {
            myThis._card.requestUpdate();
          }, 0);
        },
        afterEach(err, svg2) {
          if (err) {
            myThis.injector.error = err;
            myThis.config.options.svginject = false;
            throw err;
          } else {
            myThis.injector.error = "";
            myThis.injector.cache[myThis.imageCur] = svg2;
          }
        },
        beforeEach(svg2) {
          svg2.removeAttribute("height");
          svg2.removeAttribute("width");
        },
        cacheRequests: false,
        evalScripts: "once",
        httpRequestWithCredentials: false,
        renumerateIRIElements: false
      });
    }
  }
  /** *****************************************************************************
  * UserSvgTool::_renderUserSvg()
  *
  * Summary.
  * Renders the usersvg using precalculated coordinates and dimensions.
  * Only the runtime style is calculated before rendering the usersvg
  *
  */
  _renderUserSvg() {
    this.MergeAnimationStyleIfChanged();
    const images = Templates.getJsTemplateOrValue(this, this._stateValue, Merge.mergeDeep(this.images));
    this.imagePrev = this.imageCur;
    this.imageCur = images[this.item.image];
    if (images[this.item.image] === "none")
      return svg``;
    let cachedSvg = this.injector.cache[this.imageCur];
    let clipPath = svg``;
    let clipPathUrl = "";
    let maskUrl = "";
    if (this.config.clip_path) {
      clipPathUrl = `url(#clip-path-${this.toolId})`;
      maskUrl = `url(#mask-${this.toolId})`;
      clipPath = svg`
        <defs>
          <path  id="path-${this.toolId}"
            d="
              M ${this.svg.cp_cx + this.svg.radiusTopLeft + (this.svg.width - this.svg.cp_width) / 2} ${this.svg.cp_cy + (this.svg.height - this.svg.cp_height) / 2}
              h ${this.svg.cp_width - this.svg.radiusTopLeft - this.svg.radiusTopRight}
              a ${this.svg.radiusTopRight} ${this.svg.radiusTopRight} 0 0 1 ${this.svg.radiusTopRight} ${this.svg.radiusTopRight}
              v ${this.svg.cp_height - this.svg.radiusTopRight - this.svg.radiusBottomRight}
              a ${this.svg.radiusBottomRight} ${this.svg.radiusBottomRight} 0 0 1 -${this.svg.radiusBottomRight} ${this.svg.radiusBottomRight}
              h -${this.svg.cp_width - this.svg.radiusBottomRight - this.svg.radiusBottomLeft}
              a ${this.svg.radiusBottomLeft} ${this.svg.radiusBottomLeft} 0 0 1 -${this.svg.radiusBottomLeft} -${this.svg.radiusBottomLeft}
              v -${this.svg.cp_height - this.svg.radiusBottomLeft - this.svg.radiusTopLeft}
              a ${this.svg.radiusTopLeft} ${this.svg.radiusTopLeft}  0 0 1 ${this.svg.radiusTopLeft} -${this.svg.radiusTopLeft}
              ">
          </path>
          <clipPath id="clip-path-${this.toolId}">
            <use href="#path-${this.toolId}"/>
          </clipPath>
          <mask id="mask-${this.toolId}">
            <use href="#path-${this.toolId}" style="${styleMap$2(this.styles.mask)}"/>
          </mask>
        </defs>
        `;
    }
    const dotPosition = images[this.item.image].lastIndexOf(".");
    const imageExtension = images[this.item.image].substring(dotPosition === -1 ? Infinity : dotPosition + 1);
    if (imageExtension !== "svg") {
      return svg`
        <svg class="sak-usersvg__image" x="${this.svg.x}" y="${this.svg.y}"
          style="${styleMap$2(this.styles.usersvg)}">
          "${clipPath}"
          <image 
            clip-path="${clipPathUrl}" mask="${maskUrl}"
            href="${images[this.item.image]}"
            height="${this.svg.height}" width="${this.svg.width}"
          />
        </svg>
        `;
    } else if (!cachedSvg || !this.config.options.svginject) {
      return svg`
        <svg class="sak-usersvg__image ${this.config.options.svginject ? "hidden" : ""}"
          data-id="usersvg-${this.toolId}" data-src="${images[this.item.image]}"
          x="${this.svg.x}" y="${this.svg.y}"
          style="${this.config.options.svginject ? "" : styleMap$2(this.styles.usersvg)}">
          "${clipPath}"
          <image
            clip-path="${clipPathUrl}"
            mask="${maskUrl}"
            href="${images[this.item.image]}"
            height="${this.svg.height}" width="${this.svg.width}"
          />
        </svg>
      `;
    } else {
      cachedSvg.classList.remove("hidden");
      return svg`
        <svg x="${this.svg.x}" y="${this.svg.y}" style="${styleMap$2(this.styles.usersvg)}"
          height="${this.svg.height}" width="${this.svg.width}"
          clip-path="${clipPathUrl}"
          mask="${maskUrl}"
        >
          "${clipPath}"
          ${cachedSvg};
       </svg>
       `;
    }
  }
  /** *****************************************************************************
  * UserSvgTool::render()
  *
  * Summary.
  * The render() function for this object.
  *
  */
  render() {
    return svg`
      <g id="usersvg-${this.toolId}" overflow="visible"
        class="${classMap(this.classes.tool)}" style="${styleMap$2(this.styles.tool)}"
        @click=${(e) => this.handleTapEvent(e, this.config)}>
        ${this._renderUserSvg()}
      </g>
    `;
  }
}
class Toolset {
  constructor(argCard, argConfig) {
    this.toolsetId = Math.random().toString(36).substr(2, 9);
    this._card = argCard;
    this.dev = { ...this._card.dev };
    if (this.dev.performance) console.time(`--> ${this.toolsetId} PERFORMANCE Toolset::constructor`);
    this.config = argConfig;
    this.tools = [];
    this.palette = {};
    this.palette.light = {};
    this.palette.dark = {};
    if (this.config.palette) {
      const { paletteLight, paletteDark } = Colors.processPalette(this.config.palette);
      this.palette.light = paletteLight;
      this.palette.dark = paletteDark;
    }
    this.svg = {};
    this.svg.cx = Utils.calculateSvgCoordinate(argConfig.position.cx, SVG_DEFAULT_DIMENSIONS_HALF);
    this.svg.cy = Utils.calculateSvgCoordinate(argConfig.position.cy, SVG_DEFAULT_DIMENSIONS_HALF);
    this.svg.x = this.svg.cx - SVG_DEFAULT_DIMENSIONS_HALF;
    this.svg.y = this.svg.cy - SVG_DEFAULT_DIMENSIONS_HALF;
    this.transform = {};
    this.transform.scale = {};
    this.transform.scale.x = this.transform.scale.y = 1;
    this.transform.rotate = {};
    this.transform.rotate.x = this.transform.rotate.y = 0;
    this.transform.skew = {};
    this.transform.skew.x = this.transform.skew.y = 0;
    if (this.config.position.scale) {
      this.transform.scale.x = this.transform.scale.y = this.config.position.scale;
    }
    if (this.config.position.rotate) {
      this.transform.rotate.x = this.transform.rotate.y = this.config.position.rotate;
    }
    this.transform.scale.x = this.config.position.scale_x || this.config.position.scale || 1;
    this.transform.scale.y = this.config.position.scale_y || this.config.position.scale || 1;
    this.transform.rotate.x = this.config.position.rotate_x || this.config.position.rotate || 0;
    this.transform.rotate.y = this.config.position.rotate_y || this.config.position.rotate || 0;
    if (this.dev.debug) console.log("Toolset::constructor config/svg", this.toolsetId, this.config, this.svg);
    const toolsNew = {
      area: EntityAreaTool,
      circslider: CircularSliderTool,
      badge: BadgeTool,
      bar: SparklineBarChartTool,
      circle: CircleTool,
      ellipse: EllipseTool,
      sparkline: SparklineGraphTool,
      horseshoe: HorseshoeTool,
      icon: EntityIconTool,
      line: LineTool,
      name: EntityNameTool,
      rectangle: RectangleTool,
      rectex: RectangleToolEx,
      regpoly: RegPolyTool,
      segarc: SegmentedArcTool,
      state: EntityStateTool,
      slider: RangeSliderTool,
      switch: SwitchTool,
      text: TextTool,
      usersvg: UserSvgTool
    };
    this.config.tools.map((toolConfig) => {
      const newConfig = { ...toolConfig };
      const newPos = {
        cx: 0 / 100 * SVG_DEFAULT_DIMENSIONS,
        cy: 0 / 100 * SVG_DEFAULT_DIMENSIONS,
        scale: this.config.position.scale ? this.config.position.scale : 1
      };
      if (this.dev.debug) console.log("Toolset::constructor toolConfig", this.toolsetId, newConfig, newPos);
      if (!toolConfig.disabled) {
        const newTool = new toolsNew[toolConfig.type](this, newConfig, newPos);
        this._card.entityHistory.needed |= toolConfig.type === "bar";
        this._card.entityHistory.needed |= toolConfig.type === "sparkline";
        this.tools.push({ type: toolConfig.type, index: toolConfig.id, tool: newTool });
      }
      return true;
    });
    if (this.dev.performance) console.timeEnd(`--> ${this.toolsetId} PERFORMANCE Toolset::constructor`);
  }
  /** *****************************************************************************
  * Toolset::updateValues()
  *
  * Summary.
  * Called from set hass to update values for tools
  *
  */
  // #TODO:
  // Update only the changed entity_index, not all indexes. Now ALL tools are updated...
  updateValues() {
    if (this.dev.performance) console.time(`--> ${this.toolsetId} PERFORMANCE Toolset::updateValues`);
    if (this.tools) {
      this.tools.map((item, index) => {
        {
          if (item.tool.config.hasOwnProperty("entity_index")) {
            if (this.dev.debug) console.log("Toolset::updateValues", item, index);
            item.tool.value = this._card.attributesStr[item.tool.config.entity_index] ? this._card.attributesStr[item.tool.config.entity_index] : this._card.secondaryInfoStr[item.tool.config.entity_index] ? this._card.secondaryInfoStr[item.tool.config.entity_index] : this._card.entitiesStr[item.tool.config.entity_index];
          }
          if (item.tool.config.hasOwnProperty("entity_indexes")) {
            const valueList = [];
            for (let i = 0; i < item.tool.config.entity_indexes.length; ++i) {
              valueList[i] = this._card.attributesStr[item.tool.config.entity_indexes[i].entity_index] ? this._card.attributesStr[item.tool.config.entity_indexes[i].entity_index] : this._card.secondaryInfoStr[item.tool.config.entity_indexes[i].entity_index] ? this._card.secondaryInfoStr[item.tool.config.entity_indexes[i].entity_index] : this._card.entitiesStr[item.tool.config.entity_indexes[i].entity_index];
            }
            item.tool.values = valueList;
          }
        }
        return true;
      });
    }
    if (this.dev.performance) console.timeEnd(`--> ${this.toolsetId} PERFORMANCE Toolset::updateValues`);
  }
  /** *****************************************************************************
  * Toolset::connectedCallback()
  *
  * Summary.
  *
  */
  connectedCallback() {
    if (this.dev.performance) console.time(`--> ${this.toolsetId} PERFORMANCE Toolset::connectedCallback`);
    if (this.dev.debug) console.log("*****Event - connectedCallback", this.toolsetId, (/* @__PURE__ */ new Date()).getTime());
    if (this.dev.performance) console.timeEnd(`--> ${this.toolsetId} PERFORMANCE Toolset::connectedCallback`);
  }
  /** *****************************************************************************
  * Toolset::disconnectedCallback()
  *
  * Summary.
  *
  */
  disconnectedCallback() {
    if (this.dev.performance) console.time(`--> ${this.cardId} PERFORMANCE Toolset::disconnectedCallback`);
    if (this.dev.debug) console.log("*****Event - disconnectedCallback", this.toolsetId, (/* @__PURE__ */ new Date()).getTime());
    if (this.dev.performance) console.timeEnd(`--> ${this.cardId} PERFORMANCE Toolset::disconnectedCallback`);
  }
  /** *****************************************************************************
  * Toolset::firstUpdated()
  *
  * Summary.
  *
  */
  firstUpdated(changedProperties) {
    if (this.dev.debug) console.log("*****Event - Toolset::firstUpdated", this.toolsetId, (/* @__PURE__ */ new Date()).getTime());
    if (this.tools) {
      this.tools.map((item) => {
        if (typeof item.tool.firstUpdated === "function") {
          item.tool.firstUpdated(changedProperties);
          return true;
        }
        return false;
      });
    }
  }
  /** *****************************************************************************
  * Toolset::updated()
  *
  * Summary.
  *
  */
  updated(changedProperties) {
    if (this.dev.debug) console.log("*****Event - Updated", this.toolsetId, (/* @__PURE__ */ new Date()).getTime());
    if (this.tools) {
      this.tools.map((item) => {
        if (typeof item.tool.updated === "function") {
          item.tool.updated(changedProperties);
          return true;
        }
        return false;
      });
    }
  }
  /** *****************************************************************************
  * Toolset::renderToolset()
  *
  * Summary.
  *
  */
  renderToolset() {
    if (this.dev.debug) console.log("*****Event - renderToolset", this.toolsetId, (/* @__PURE__ */ new Date()).getTime());
    const svgItems = this.tools.map((item) => svg`
        <!-- Toolset Render Tools -->
        ${item.tool.render()}
      `);
    return svg`${svgItems}`;
  }
  /** *****************************************************************************
  * Toolset::render()
  *
  * Summary.
  * The render() function for this toolset renders all the tools within this set.
  *
  * Important notes:
  * - the toolset position is set on the svg. That one accepts x,y
  * - scaling, rotating and skewing (and translating) is done on the parent group.
  *
  * The order of transformations are done from the child's perspective!!
  * So, the child (tools) gets positioned FIRST, and then scaled/rotated.
  *
  * See comments for different render paths for Apple/Safari and any other browser...
  *
  */
  render() {
    if ((this._card.isSafari || this._card.iOS) && !this._card.isSafari16) {
      return svg`
        <!-- Toolset Render Outer Group Safari ${this.config.toolset} -->
        <g data-toolset-name="${this.config.toolset}"
           id="toolset-${this.toolsetId}" class="toolset__group-outer"
           transform="rotate(${this.transform.rotate.x}, ${this.svg.cx}, ${this.svg.cy})
                      scale(${this.transform.scale.x}, ${this.transform.scale.y})
                      "
           style="transform-origin:center; transform-box:fill-box;">
          <svg style="overflow:visible;">
            <g data-toolset-name="${this.config.toolset}"
            class="toolset__group" transform="translate(${this.svg.cx / this.transform.scale.x}, ${this.svg.cy / this.transform.scale.y})"
            style="${styleMap(this._card.themeIsDarkMode() ? this.palette.dark : this.palette.light)}"
            >
              ${this.renderToolset()}
            </g>
            </svg>
        </g>
      `;
    } else {
      return svg`
        <!-- Toolset Render Outer Group Other -->
        <g data-toolset-name="${this.config.toolset}"
           id="toolset-${this.toolsetId}" class="toolset__group-outer"
           transform="rotate(${this.transform.rotate.x}) scale(${this.transform.scale.x}, ${this.transform.scale.y})"
           style="transform-origin:center; transform-box:fill-box;">
          <svg style="overflow:visible;">
            <!-- Toolset Render Inner Group Other -->
            <g data-toolset-name="${this.config.toolset}"
            class="toolset__group" transform="translate(${this.svg.cx}, ${this.svg.cy})"
            style="${styleMap(this._card.themeIsDarkMode() ? this.palette.dark : this.palette.light)}"
            >
              ${this.renderToolset()}
            </g>
            </svg>
        </g>
      `;
    }
  }
}
const rgb_hex = (component) => {
  const hex = Math.round(Math.min(Math.max(component, 0), 255)).toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
};
const rgb2hex = (rgb) => `#${rgb_hex(rgb[0])}${rgb_hex(rgb[1])}${rgb_hex(rgb[2])}`;
const rgb2hsv = (rgb) => {
  const [r, g, b] = rgb;
  const v = Math.max(r, g, b);
  const c = v - Math.min(r, g, b);
  const h = c && (v === r ? (g - b) / c : v === g ? 2 + (b - r) / c : 4 + (r - g) / c);
  return [60 * (h < 0 ? h + 6 : h), v && c / v, v];
};
const hsv2rgb = (hsv) => {
  const [h, s, v] = hsv;
  const f = (n) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  };
  return [f(5), f(3), f(1)];
};
const hs2rgb = (hs) => hsv2rgb([hs[0], hs[1], 255]);
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const DEFAULT_MIN_KELVIN = 2700;
const DEFAULT_MAX_KELVIN = 6500;
const temperatureRed = (temperature) => {
  if (temperature <= 66) {
    return 255;
  }
  const red = 329.698727446 * (temperature - 60) ** -0.1332047592;
  return clamp(red, 0, 255);
};
const temperatureGreen = (temperature) => {
  let green;
  if (temperature <= 66) {
    green = 99.4708025861 * Math.log(temperature) - 161.1195681661;
  } else {
    green = 288.1221695283 * (temperature - 60) ** -0.0755148492;
  }
  return clamp(green, 0, 255);
};
const temperatureBlue = (temperature) => {
  if (temperature >= 66) {
    return 255;
  }
  if (temperature <= 19) {
    return 0;
  }
  const blue = 138.5177312231 * Math.log(temperature - 10) - 305.0447927307;
  return clamp(blue, 0, 255);
};
const temperature2rgb = (temperature) => {
  const value = temperature / 100;
  return [
    temperatureRed(value),
    temperatureGreen(value),
    temperatureBlue(value)
  ];
};
const matchMaxScale = (inputColors, outputColors) => {
  const maxIn = Math.max(...inputColors);
  const maxOut = Math.max(...outputColors);
  let factor;
  if (maxOut === 0) {
    factor = 0;
  } else {
    factor = maxIn / maxOut;
  }
  return outputColors.map((value) => Math.round(value * factor));
};
const mired2kelvin = (miredTemperature) => Math.floor(1e6 / miredTemperature);
const kelvin2mired = (kelvintTemperature) => Math.floor(1e6 / kelvintTemperature);
const rgbww2rgb = (rgbww, minKelvin, maxKelvin) => {
  const [r, g, b, cw, ww] = rgbww;
  const maxMireds = kelvin2mired(minKelvin ?? DEFAULT_MIN_KELVIN);
  const minMireds = kelvin2mired(maxKelvin ?? DEFAULT_MAX_KELVIN);
  const miredRange = maxMireds - minMireds;
  let ctRatio;
  try {
    ctRatio = ww / (cw + ww);
  } catch (_error) {
    ctRatio = 0.5;
  }
  const colorTempMired = minMireds + ctRatio * miredRange;
  const colorTempKelvin = colorTempMired ? mired2kelvin(colorTempMired) : 0;
  const [wR, wG, wB] = temperature2rgb(colorTempKelvin);
  const whiteLevel = Math.max(cw, ww) / 255;
  const rgb = [r + wR * whiteLevel, g + wG * whiteLevel, b + wB * whiteLevel];
  return matchMaxScale([r, g, b, cw, ww], rgb);
};
const rgbw2rgb = (rgbw) => {
  const [r, g, b, w] = rgbw;
  const rgb = [r + w, g + w, b + w];
  return matchMaxScale([r, g, b, w], rgb);
};
function styleMap$1(styles) {
  if (!styles) return "";
  return Object.entries(styles).filter(([_, value]) => value != null && value !== "").map(([key, value]) => `${key}: ${value}`).join("; ");
}
console.info(
  `%c  SWISS-ARMY-KNIFE-CARD  
%c      Version ${version}      `,
  "color: yellow; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: dimgray"
);
class SwissArmyKnifeCard extends LitElement {
  // card::constructor
  constructor() {
    super();
    this.connected = false;
    Colors.setElement(this);
    this.cardId = Math.random().toString(36).substr(2, 9);
    this.entities = [];
    this.entitiesStr = [];
    this.attributesStr = [];
    this.secondaryInfoStr = [];
    this.iconStr = [];
    this.viewBoxSize = SVG_VIEW_BOX;
    this.viewBox = { width: SVG_VIEW_BOX, height: SVG_VIEW_BOX };
    this.toolsets = [];
    this.tools = [];
    this.styles = {};
    this.styles.card = {};
    this.styles.card.default = {};
    this.styles.card.light = {};
    this.styles.card.dark = {};
    this.entityHistory = {};
    this.entityHistory.needed = false;
    this.stateChanged = true;
    this.entityHistory.updating = false;
    this.entityHistory.update_interval = 300;
    this.dev = {};
    this.dev.debug = false;
    this.dev.performance = false;
    this.dev.m3 = false;
    this.configIsSet = false;
    this.theme = {};
    this.theme.checked = false;
    this.theme.isLoaded = false;
    this.theme.modeChanged = false;
    this.theme.darkMode = false;
    this.theme.light = {};
    this.theme.dark = {};
    this.isSafari = !!window.navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
    this.iOS = (/iPad|iPhone|iPod/.test(window.navigator.userAgent) || window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1) && !window.MSStream;
    this.isSafari14 = this.isSafari && /Version\/14\.[0-9]/.test(window.navigator.userAgent);
    this.isSafari15 = this.isSafari && /Version\/15\.[0-9]/.test(window.navigator.userAgent);
    this.isSafari16 = this.isSafari && /Version\/16\.[0-9]/.test(window.navigator.userAgent);
    this.isSafari16 = this.isSafari && /Version\/16\.[0-9]/.test(window.navigator.userAgent);
    this.isSafari14 = this.isSafari14 || /os 15.*like safari/.test(window.navigator.userAgent.toLowerCase());
    this.isSafari15 = this.isSafari15 || /os 14.*like safari/.test(window.navigator.userAgent.toLowerCase());
    this.isSafari16 = this.isSafari16 || /os 16.*like safari/.test(window.navigator.userAgent.toLowerCase());
    this.lovelace = SwissArmyKnifeCard.lovelace;
    if (!this.lovelace) {
      console.error("card::constructor - Can't get Lovelace panel");
      throw Error("card::constructor - Can't get Lovelace panel");
    }
    if (!SwissArmyKnifeCard.colorCache) {
      SwissArmyKnifeCard.colorCache = [];
    }
    this.palette = {};
    this.palette.light = {};
    this.palette.dark = {};
    if (this.dev.debug) console.log("*****Event - card - constructor", this.cardId, (/* @__PURE__ */ new Date()).getTime());
  }
  static getSystemStyles() {
    return css`
      :host {
        cursor: default;
        font-size: ${FONT_SIZE}px;
        --sak-ref-palette-gray-platinum: #e9e9ea;
        --sak-ref-palette-gray-french-gray: #d1d1d6;
        --sak-ref-palette-gray-taupe-gray: #8e8e93;
        --sak-ref-palette-gray-cool-gray: #919bb4;

        --sak-ref-palette-yellow-sunglow: #F7ce46;
        --sak-ref-palette-yellow-jonquil: #ffcc01;
        --sak-ref-palette-yellow-Amber: #f6b90b;

        --sak-ref-palette-orange-xanthous: #F3b530;
        --sak-ref-palette-orange-princeton-orange: #ff9500;
        --sak-ref-palette-orange-orange : #F46c36;

        --sak-ref-palette-red-indian-red: #ed5254;
        --sak-ref-palette-red-japser: #d85140;
        --sak-ref-palette-red-cinnabar: #ff3b2f;

        --sak-ref-palette-purple-amethyst: #Af52de;
        --sak-ref-palette-purple-tropical-indigo: #8d82ef;
        --sak-ref-palette-purple-slate-blue: #5f5dd1;
      }

      /* Default settings for the card */
      /* - default cursor */
      /* - SVG overflow is not displayed, ie cutoff by the card edges */
      ha-card {
        cursor: default;
        overflow: hidden;

        -webkit-touch-callout: none;
      }

      /* For disabled parts of tools/toolsets */
      /* - No input */
      ha-card.disabled {
        pointer-events: none;
        cursor: default;
      }

      .disabled {
        pointer-events: none !important;
        cursor: default !important;
      }

      /* For 'active' tools/toolsets */
      /* - Show cursor as pointer */
      .hover {
        cursor: pointer;
      }

      /* For hidden tools/toolsets where state for instance is undefined */
      .hidden {
        opacity: 0;
        visibility: hidden;
        transition: visibility 0s 1s, opacity 0.5s linear;
      }

      focus {
        outline: none;
      }
      focus-visible {
        outline: 3px solid blanchedalmond; /* That'll show 'em */
      }


      @media (print), (prefers-reduced-motion: reduce) {
        .animated {
          animation-duration: 1ms !important;
          transition-duration: 1ms !important;
          animation-iteration-count: 1 !important;
        }
      }


      /* Set default host font-size to 10 pixels.
       * In that case 1em = 10 pixels = 1% of 100x100 matrix used
       */
      @media screen and (min-width: 467px) {
        :host {
        font-size: ${FONT_SIZE}px;
        }
      }
      @media screen and (max-width: 466px) {
        :host {
        font-size: ${FONT_SIZE}px;
        }
      }

      :host ha-card {
            padding: 0px 0px 0px 0px;
      }

      .container {
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .labelContainer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 65%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
      }

      .ellipsis {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }

      .state {
        position: relative;
        display: flex;
        flex-wrap: wrap;
        max-width: 100%;
        min-width: 0px;
      }

      #label {
        display: flex;
        line-height: 1;
      }

      #label.bold {
        font-weight: bold;
      }

      #label, #name {
        margin: 3% 0;
      }

      .shadow {
        font-size: 30px;
        font-weight: 700;
        text-anchor: middle;
      }

      .card--dropshadow-5 {
        filter: drop-shadow(0 1px 0 #ccc)
               drop-shadow(0 2px 0 #c9c9c9)
               drop-shadow(0 3px 0 #bbb)
               drop-shadow(0 4px 0 #b9b9b9)
               drop-shadow(0 5px 0 #aaa)
               drop-shadow(0 6px 1px rgba(0,0,0,.1))
               drop-shadow(0 0 5px rgba(0,0,0,.1))
               drop-shadow(0 1px 3px rgba(0,0,0,.3))
               drop-shadow(0 3px 5px rgba(0,0,0,.2))
               drop-shadow(0 5px 10px rgba(0,0,0,.25))
               drop-shadow(0 10px 10px rgba(0,0,0,.2))
               drop-shadow(0 20px 20px rgba(0,0,0,.15));
      }
      .card--dropshadow-medium--opaque--sepia90 {
        filter: drop-shadow(0.0em 0.05em 0px #b2a98f22)
                drop-shadow(0.0em 0.07em 0px #b2a98f55)
                drop-shadow(0.0em 0.10em 0px #b2a98f88)
                drop-shadow(0px 0.6em 0.9em rgba(0,0,0,0.15))
                drop-shadow(0px 1.2em 0.15em rgba(0,0,0,0.1))
                drop-shadow(0px 2.4em 2.5em rgba(0,0,0,0.1))
                sepia(90%);
      }

      .card--dropshadow-heavy--sepia90 {
        filter: drop-shadow(0.0em 0.05em 0px #b2a98f22)
                drop-shadow(0.0em 0.07em 0px #b2a98f55)
                drop-shadow(0.0em 0.10em 0px #b2a98f88)
                drop-shadow(0px 0.3em 0.45em rgba(0,0,0,0.5))
                drop-shadow(0px 0.6em 0.07em rgba(0,0,0,0.3))
                drop-shadow(0px 1.2em 1.25em rgba(0,0,0,1))
                drop-shadow(0px 1.8em 1.6em rgba(0,0,0,0.1))
                drop-shadow(0px 2.4em 2.0em rgba(0,0,0,0.1))
                drop-shadow(0px 3.0em 2.5em rgba(0,0,0,0.1))
                sepia(90%);
      }

      .card--dropshadow-heavy {
        filter: drop-shadow(0.0em 0.05em 0px #b2a98f22)
                drop-shadow(0.0em 0.07em 0px #b2a98f55)
                drop-shadow(0.0em 0.10em 0px #b2a98f88)
                drop-shadow(0px 0.3em 0.45em rgba(0,0,0,0.5))
                drop-shadow(0px 0.6em 0.07em rgba(0,0,0,0.3))
                drop-shadow(0px 1.2em 1.25em rgba(0,0,0,1))
                drop-shadow(0px 1.8em 1.6em rgba(0,0,0,0.1))
                drop-shadow(0px 2.4em 2.0em rgba(0,0,0,0.1))
                drop-shadow(0px 3.0em 2.5em rgba(0,0,0,0.1));
      }

      .card--dropshadow-medium--sepia90 {
        filter: drop-shadow(0.0em 0.05em 0px #b2a98f)
                drop-shadow(0.0em 0.15em 0px #b2a98f)
                drop-shadow(0.0em 0.15em 0px #b2a98f)
                drop-shadow(0px 0.6em 0.9em rgba(0,0,0,0.15))
                drop-shadow(0px 1.2em 0.15em rgba(0,0,0,0.1))
                drop-shadow(0px 2.4em 2.5em rgba(0,0,0,0.1))
                sepia(90%);
      }

      .card--dropshadow-medium {
        filter: drop-shadow(0.0em 0.05em 0px #b2a98f)
                drop-shadow(0.0em 0.15em 0px #b2a98f)
                drop-shadow(0.0em 0.15em 0px #b2a98f)
                drop-shadow(0px 0.6em 0.9em rgba(0,0,0,0.15))
                drop-shadow(0px 1.2em 0.15em rgba(0,0,0,0.1))
                drop-shadow(0px 2.4em 2.5em rgba(0,0,0,0.1));
      }

      .card--dropshadow-light--sepia90 {
        filter: drop-shadow(0px 0.10em 0px #b2a98f)
                drop-shadow(0.1em 0.5em 0.2em rgba(0, 0, 0, .5))
                sepia(90%);
      }

      .card--dropshadow-light {
        filter: drop-shadow(0px 0.10em 0px #b2a98f)
                drop-shadow(0.1em 0.5em 0.2em rgba(0, 0, 0, .5));
      }

      .card--dropshadow-down-and-distant {
        filter: drop-shadow(0px 0.05em 0px #b2a98f)
                drop-shadow(0px 14px 10px rgba(0,0,0,0.15))
                drop-shadow(0px 24px 2px rgba(0,0,0,0.1))
                drop-shadow(0px 34px 30px rgba(0,0,0,0.1));
      }

      .card--filter-none {
      }

      .horseshoe__svg__group {
        transform: translateY(15%);
      }

    `;
  }
  /** *****************************************************************************
  * card::getUserStyles()
  *
  * Summary.
  * Returns the user defined CSS styles for the card in sak_user_templates config
  * section in lovelace configuration.
  *
  */
  static getUserStyles() {
    this.userContent = "";
    if (SwissArmyKnifeCard.lovelace.config.sak_user_templates && SwissArmyKnifeCard.lovelace.config.sak_user_templates.definitions.user_css_definitions) {
      this.userContent = SwissArmyKnifeCard.lovelace.config.sak_user_templates.definitions.user_css_definitions.reduce((accumulator, currentValue) => accumulator + currentValue.content, "");
    }
    return css`${unsafeCSS(this.userContent)}`;
  }
  static getSakStyles() {
    this.sakContent = "";
    if (SwissArmyKnifeCard.lovelace.config.sak_sys_templates && SwissArmyKnifeCard.lovelace.config.sak_sys_templates.definitions.sak_css_definitions) {
      this.sakContent = SwissArmyKnifeCard.lovelace.config.sak_sys_templates.definitions.sak_css_definitions.reduce((accumulator, currentValue) => accumulator + currentValue.content, "");
    }
    return css`${unsafeCSS(this.sakContent)}`;
  }
  static getSakSvgDefinitions() {
    SwissArmyKnifeCard.lovelace.sakSvgContent = null;
    let sakSvgContent = "";
    if (SwissArmyKnifeCard.lovelace.config.sak_sys_templates && SwissArmyKnifeCard.lovelace.config.sak_sys_templates.definitions.sak_svg_definitions) {
      sakSvgContent = SwissArmyKnifeCard.lovelace.config.sak_sys_templates.definitions.sak_svg_definitions.reduce((accumulator, currentValue) => accumulator + currentValue.content, "");
    }
    SwissArmyKnifeCard.sakSvgContent = unsafeSVG(sakSvgContent);
  }
  static getUserSvgDefinitions() {
    SwissArmyKnifeCard.lovelace.userSvgContent = null;
    let userSvgContent = "";
    if (SwissArmyKnifeCard.lovelace.config.sak_user_templates && SwissArmyKnifeCard.lovelace.config.sak_user_templates.definitions.user_svg_definitions) {
      userSvgContent = SwissArmyKnifeCard.lovelace.config.sak_user_templates.definitions.user_svg_definitions.reduce((accumulator, currentValue) => accumulator + currentValue.content, "");
    }
    SwissArmyKnifeCard.userSvgContent = unsafeSVG(userSvgContent);
  }
  /** *****************************************************************************
  * card::get styles()
  *
  * Summary.
  * Returns the static CSS styles for the lit-element
  *
  * Note:
  * - The BEM (http://getbem.com/naming/) naming style for CSS is used
  *   Of course, if no mistakes are made ;-)
  *
  * Note2:
  * - get styles is a static function and is called ONCE at initialization.
  *   So, we need to get lovelace here...
  */
  static get styles() {
    if (!SwissArmyKnifeCard.lovelace) SwissArmyKnifeCard.lovelace = Utils.getLovelace();
    if (!SwissArmyKnifeCard.lovelace) {
      console.error("SAK - Can't get reference to Lovelace");
      throw Error("card::get styles - Can't get Lovelace panel");
    }
    if (!SwissArmyKnifeCard.lovelace.config.sak_sys_templates) {
      console.error(version, " - SAK - System Templates reference NOT defined.");
      throw Error(version, " - card::get styles - System Templates reference NOT defined!");
    }
    if (!SwissArmyKnifeCard.lovelace.config.sak_user_templates) {
      console.warning(version, " - SAK - User Templates reference NOT defined. Did you NOT include them?");
    }
    SwissArmyKnifeCard.getSakSvgDefinitions();
    SwissArmyKnifeCard.getUserSvgDefinitions();
    return css`
      ${SwissArmyKnifeCard.getSystemStyles()}
      ${SwissArmyKnifeCard.getSakStyles()}
      ${SwissArmyKnifeCard.getUserStyles()}
    `;
  }
  /** *****************************************************************************
  * card::set hass()
  *
  * Summary.
  * Updates hass data for the card
  *
  */
  set hass(hass) {
    if (!this.counter) this.counter = 0;
    this.counter += 1;
    this.theme.modeChanged = hass.themes.darkMode !== this.theme.darkMode;
    if (this.theme.modeChanged) {
      this.theme.darkMode = hass.themes.darkMode;
      Colors.colorCache = {};
    }
    if (!this.theme.checked) {
      this.theme.checked = true;
      if (this.config.theme && hass.themes.themes[this.config.theme]) {
        const { themeLight, themeDark } = Colors.processTheme(hass.themes.themes[this.config.theme]);
        this.theme.light = themeLight;
        this.theme.dark = themeDark;
        this.theme.isLoaded = true;
      }
      this.styles.card.light = {
        ...this.styles.card.default,
        ...this.theme.light,
        ...this.palette.light
      };
      this.styles.card.dark = {
        ...this.styles.card.default,
        ...this.theme.dark,
        ...this.palette.dark
      };
    }
    if (this.dev.debug) console.log("*****Event - card::set hass", this.cardId, (/* @__PURE__ */ new Date()).getTime());
    this._hass = hass;
    if (!this.connected) {
      if (this.dev.debug) console.log("set hass but NOT connected", this.cardId);
    }
    if (!this.config.entities) {
      return;
    }
    let entityHasChanged = false;
    let value;
    let index = 0;
    let secInfoSet = false;
    let newSecInfoState;
    let newSecInfoStateStr;
    let newIconStr;
    let attrSet = false;
    let newStateStr;
    let entityIsUndefined = false;
    for (value of this.config.entities) {
      this.entities[index] = hass.states[this.config.entities[index].entity];
      entityIsUndefined = this.entities[index] === void 0;
      if (entityIsUndefined) {
        console.error("SAK - set hass, entity undefined: ", this.config.entities[index].entity);
      }
      if (this.config.entities[index].secondary_info) {
        secInfoSet = true;
        newSecInfoState = entityIsUndefined ? void 0 : this.entities[index][this.config.entities[index].secondary_info];
        newSecInfoStateStr = this._buildStateString(newSecInfoState, this.config.entities[index]);
        if (newSecInfoStateStr !== this.secondaryInfoStr[index]) {
          this.secondaryInfoStr[index] = newSecInfoStateStr;
          entityHasChanged = true;
        }
      }
      if (!this.config.entities[index].icon) {
        newIconStr = entityIsUndefined ? void 0 : hass.states[this.config.entities[index].entity].attributes.icon;
        if (newIconStr !== this.iconStr[index]) {
          this.iconStr[index] = newIconStr;
          entityHasChanged = true;
        }
      }
      if (this.config.entities[index].attribute) {
        let { attribute } = this.config.entities[index];
        let attrMore = "";
        let attributeState = "";
        const arrayPos = this.config.entities[index].attribute.indexOf("[");
        const dotPos = this.config.entities[index].attribute.indexOf(".");
        let arrayIdx = 0;
        let arrayMap = "";
        if (arrayPos !== -1) {
          attribute = this.config.entities[index].attribute.substr(0, arrayPos);
          attrMore = this.config.entities[index].attribute.substr(arrayPos, this.config.entities[index].attribute.length - arrayPos);
          arrayIdx = attrMore[1];
          arrayMap = attrMore.substr(4, attrMore.length - 4);
          attributeState = this.entities[index].attributes[attribute][arrayIdx][arrayMap];
        } else if (dotPos !== -1) {
          attribute = this.config.entities[index].attribute.substr(0, dotPos);
          attrMore = this.config.entities[index].attribute.substr(arrayPos, this.config.entities[index].attribute.length - arrayPos);
          arrayMap = attrMore.substr(1, attrMore.length - 1);
          attributeState = this.entities[index].attributes[attribute][arrayMap];
          console.log("set hass, attributes with map", this.config.entities[index].attribute, attribute, attrMore);
        } else {
          attributeState = this.entities[index].attributes[attribute];
        }
        {
          newStateStr = this._buildStateString(attributeState, this.config.entities[index]);
          if (newStateStr !== this.attributesStr[index]) {
            this.attributesStr[index] = newStateStr;
            entityHasChanged = true;
          }
          attrSet = true;
        }
      }
      if (!attrSet && !secInfoSet) {
        newStateStr = entityIsUndefined ? void 0 : this._buildStateString(this.entities[index].state, this.config.entities[index]);
        if (newStateStr !== this.entitiesStr[index]) {
          this.entitiesStr[index] = newStateStr;
          entityHasChanged = true;
        }
        if (this.dev.debug) console.log("set hass - attrSet=false", this.cardId, `${(/* @__PURE__ */ new Date()).getSeconds().toString()}.${(/* @__PURE__ */ new Date()).getMilliseconds().toString()}`, newStateStr);
      }
      entityHasChanged ||= attrSet || secInfoSet;
      index += 1;
      attrSet = false;
      secInfoSet = false;
    }
    if (!entityHasChanged && !this.theme.modeChanged) {
      return;
    }
    if (this.toolsets) {
      this.toolsets.map((item) => {
        item.updateValues();
        return true;
      });
    }
    this.requestUpdate();
    this.theme.modeChanged = false;
    this.counter -= 1;
  }
  /** *****************************************************************************
  * card::setConfig()
  *
  * Summary.
  * Sets/Updates the card configuration. Rarely called if the doc is right
  *
  */
  setConfig(config) {
    if (this.dev.performance) console.time(`--> ${this.cardId} PERFORMANCE card::setConfig`);
    if (this.dev.debug) console.log("*****Event - setConfig", this.cardId, (/* @__PURE__ */ new Date()).getTime());
    config = JSON.parse(JSON.stringify(config));
    if (config.dev) this.dev = { ...this.dev, ...config.dev };
    if (this.dev.debug) console.log("setConfig", this.cardId);
    if (!config.layout) {
      throw Error("card::setConfig - No layout defined");
    }
    if (config.entities) {
      const newdomain = computeDomain(config.entities[0].entity);
      if (newdomain !== "sensor") {
        if (config.entities[0].attribute && !isNaN(config.entities[0].attribute)) {
          throw Error("card::setConfig - First entity or attribute must be a numbered sensorvalue, but is NOT");
        }
      }
    }
    const newConfig = Merge.mergeDeep(config);
    this.config = newConfig;
    this.toolset = [];
    const thisMe = this;
    function findTemplate(key, value) {
      if (value?.template) {
        const template = thisMe.lovelace.config.sak_user_templates.templates[value.template.name];
        if (!template) {
          console.error("Template not found...", value.template, template);
        }
        const replacedValue = Templates.replaceVariables3(value.template.variables, template);
        const secondValue = Merge.mergeDeep(replacedValue);
        return secondValue;
      }
      if (key === "template") {
        console.log("findTemplate return key=template/value", key, void 0);
        return value;
      }
      return value;
    }
    const cfg = JSON.stringify(this.config, findTemplate);
    if (this.config.palette) {
      this.config.palette = JSON.parse(cfg).palette;
      const { paletteLight, paletteDark } = Colors.processPalette(this.config.palette);
      this.palette.light = paletteLight;
      this.palette.dark = paletteDark;
    }
    const cfgobj = JSON.parse(cfg).layout.toolsets;
    if (this.config.layout.template) {
      this.config.layout = JSON.parse(cfg).layout;
    }
    this.config.layout.toolsets.map((toolsetCfg, toolidx) => {
      let toolList = null;
      if (!this.toolsets) this.toolsets = [];
      {
        let found = false;
        let toolAdd = [];
        toolList = cfgobj[toolidx].tools;
        if (toolsetCfg.tools) {
          toolsetCfg.tools.map((tool, index) => {
            cfgobj[toolidx].tools.map((toolT, indexT) => {
              if (tool.id === toolT.id) {
                if (toolsetCfg.template) {
                  if (this.config.layout.toolsets[toolidx].position)
                    cfgobj[toolidx].position = Merge.mergeDeep(this.config.layout.toolsets[toolidx].position);
                  toolList[indexT] = Merge.mergeDeep(toolList[indexT], tool);
                  toolList[indexT] = JSON.parse(JSON.stringify(toolList[indexT], findTemplate));
                  found = true;
                }
                if (this.dev.debug) console.log("card::setConfig - got toolsetCfg toolid", tool, index, toolT, indexT, tool);
              }
              cfgobj[toolidx].tools[indexT] = Templates.getJsTemplateOrValueConfig(cfgobj[toolidx].tools[indexT], this.config.entities, Merge.mergeDeep(cfgobj[toolidx].tools[indexT]));
              return found;
            });
            if (!found) toolAdd = toolAdd.concat(toolsetCfg.tools[index]);
            return found;
          });
        }
        toolList = toolList.concat(toolAdd);
      }
      toolsetCfg = cfgobj[toolidx];
      const newToolset = new Toolset(this, toolsetCfg);
      this.toolsets.push(newToolset);
      return true;
    });
    if (this.dev.m3) {
      console.log("*** M3 - Checking for m3.yaml template to convert...");
      if (this.lovelace.config.sak_user_templates.templates.m3) {
        let hex2rgb = function(hexColor) {
          const rgbCol = {};
          rgbCol.r = Math.round(parseInt(hexColor.substr(1, 2), 16));
          rgbCol.g = Math.round(parseInt(hexColor.substr(3, 2), 16));
          rgbCol.b = Math.round(parseInt(hexColor.substr(5, 2), 16));
          const cssRgbColor = `${rgbCol.r},${rgbCol.g},${rgbCol.b}`;
          return cssRgbColor;
        }, getSurfaces = function(surfaceColor, paletteColor, opacities, cssName, mode) {
          const bgCol = {};
          const fgCol = {};
          bgCol.r = Math.round(parseInt(surfaceColor.substr(1, 2), 16));
          bgCol.g = Math.round(parseInt(surfaceColor.substr(3, 2), 16));
          bgCol.b = Math.round(parseInt(surfaceColor.substr(5, 2), 16));
          fgCol.r = Math.round(parseInt(paletteColor.substr(1, 2), 16));
          fgCol.g = Math.round(parseInt(paletteColor.substr(3, 2), 16));
          fgCol.b = Math.round(parseInt(paletteColor.substr(5, 2), 16));
          let surfaceColors = "";
          let r;
          let g;
          let b;
          opacities.forEach((opacity, index) => {
            r = Math.round(opacity * fgCol.r + (1 - opacity) * bgCol.r);
            g = Math.round(opacity * fgCol.g + (1 - opacity) * bgCol.g);
            b = Math.round(opacity * fgCol.b + (1 - opacity) * bgCol.b);
            surfaceColors += `${cssName + (index + 1).toString()}-${mode}: rgb(${r},${g},${b})
`;
            surfaceColors += `${cssName + (index + 1).toString()}-${mode}-rgb: ${r},${g},${b}
`;
          });
          return surfaceColors;
        };
        const { m3 } = this.lovelace.config.sak_user_templates.templates;
        console.log("*** M3 - Found. Material 3 conversion starting...");
        let palette = "";
        let colordefault = "";
        let colorlight = "";
        let colordark = "";
        let surfacelight = "";
        let primarylight = "";
        let neutrallight = "";
        let surfacedark = "";
        let primarydark = "";
        let neutraldark = "";
        const colorEntities = {};
        const cssNames = {};
        const cssNamesRgb = {};
        m3.entities.map((entity) => {
          if (["ref.palette", "sys.color", "sys.color.light", "sys.color.dark"].includes(entity.category_id)) {
            if (!entity.tags.includes("alias")) {
              colorEntities[entity.id] = { value: entity.value, tags: entity.tags };
            }
          }
          if (entity.category_id === "ref.palette") {
            palette += `${entity.id}: '${entity.value}'
`;
            if (entity.id === "md.ref.palette.primary40") {
              primarylight = entity.value;
            }
            if (entity.id === "md.ref.palette.primary80") {
              primarydark = entity.value;
            }
            if (entity.id === "md.ref.palette.neutral40") {
              neutrallight = entity.value;
            }
            if (entity.id === "md.ref.palette.neutral80") {
              neutraldark = entity.value;
            }
          }
          if (entity.category_id === "sys.color") {
            colordefault += `${entity.id}: '${entity.value}'
`;
          }
          if (entity.category_id === "sys.color.light") {
            colorlight += `${entity.id}: '${entity.value}'
`;
            if (entity.id === "md.sys.color.surface.light") {
              surfacelight = entity.value;
            }
          }
          if (entity.category_id === "sys.color.dark") {
            colordark += `${entity.id}: '${entity.value}'
`;
            if (entity.id === "md.sys.color.surface.dark") {
              surfacedark = entity.value;
            }
          }
          return true;
        });
        ["primary", "secondary", "tertiary", "error", "neutral", "neutral-variant"].forEach((paletteName) => {
          [5, 15, 25, 35, 45, 65, 75, 85].forEach((step) => {
            colorEntities[`md.ref.palette.${paletteName}${step.toString()}`] = {
              value: Colors.getGradientValue(
                colorEntities[`md.ref.palette.${paletteName}${(step - 5).toString()}`].value,
                colorEntities[`md.ref.palette.${paletteName}${(step + 5).toString()}`].value,
                0.5
              ),
              tags: [...colorEntities[`md.ref.palette.${paletteName}${(step - 5).toString()}`].tags]
            };
            colorEntities[`md.ref.palette.${paletteName}${step.toString()}`].tags[3] = paletteName + step.toString();
          });
          colorEntities[`md.ref.palette.${paletteName}7`] = {
            value: Colors.getGradientValue(
              colorEntities[`md.ref.palette.${paletteName}5`].value,
              colorEntities[`md.ref.palette.${paletteName}10`].value,
              0.5
            ),
            tags: [...colorEntities[`md.ref.palette.${paletteName}10`].tags]
          };
          colorEntities[`md.ref.palette.${paletteName}7`].tags[3] = `${paletteName}7`;
          colorEntities[`md.ref.palette.${paletteName}92`] = {
            value: Colors.getGradientValue(
              colorEntities[`md.ref.palette.${paletteName}90`].value,
              colorEntities[`md.ref.palette.${paletteName}95`].value,
              0.5
            ),
            tags: [...colorEntities[`md.ref.palette.${paletteName}90`].tags]
          };
          colorEntities[`md.ref.palette.${paletteName}92`].tags[3] = `${paletteName}92`;
          colorEntities[`md.ref.palette.${paletteName}97`] = {
            value: Colors.getGradientValue(
              colorEntities[`md.ref.palette.${paletteName}95`].value,
              colorEntities[`md.ref.palette.${paletteName}99`].value,
              0.5
            ),
            tags: [...colorEntities[`md.ref.palette.${paletteName}90`].tags]
          };
          colorEntities[`md.ref.palette.${paletteName}97`].tags[3] = `${paletteName}97`;
        });
        for (const [index, entity] of Object.entries(colorEntities)) {
          cssNames[index] = `theme-${entity.tags[1]}-${entity.tags[2]}-${entity.tags[3]}: rgb(${hex2rgb(entity.value)})`;
          cssNamesRgb[index] = `theme-${entity.tags[1]}-${entity.tags[2]}-${entity.tags[3]}-rgb: ${hex2rgb(entity.value)}`;
        }
        const opacitysurfacelight = [0.03, 0.05, 0.08, 0.11, 0.15, 0.19, 0.24, 0.29, 0.35, 0.4];
        const opacitysurfacedark = [0.05, 0.08, 0.11, 0.15, 0.19, 0.24, 0.29, 0.35, 0.4, 0.45];
        const surfacenL = getSurfaces(surfacelight, neutrallight, opacitysurfacelight, "  theme-ref-elevation-surface-neutral", "light");
        const neutralvariantlight = colorEntities["md.ref.palette.neutral-variant40"].value;
        const surfacenvL = getSurfaces(surfacelight, neutralvariantlight, opacitysurfacelight, "  theme-ref-elevation-surface-neutral-variant", "light");
        const surfacepL = getSurfaces(surfacelight, primarylight, opacitysurfacelight, "  theme-ref-elevation-surface-primary", "light");
        const secondarylight = colorEntities["md.ref.palette.secondary40"].value;
        const surfacesL = getSurfaces(surfacelight, secondarylight, opacitysurfacelight, "  theme-ref-elevation-surface-secondary", "light");
        const tertiarylight = colorEntities["md.ref.palette.tertiary40"].value;
        const surfacetL = getSurfaces(surfacelight, tertiarylight, opacitysurfacelight, "  theme-ref-elevation-surface-tertiary", "light");
        const errorlight = colorEntities["md.ref.palette.error40"].value;
        const surfaceeL = getSurfaces(surfacelight, errorlight, opacitysurfacelight, "  theme-ref-elevation-surface-error", "light");
        const surfacenD = getSurfaces(surfacedark, neutraldark, opacitysurfacedark, "  theme-ref-elevation-surface-neutral", "dark");
        const neutralvariantdark = colorEntities["md.ref.palette.neutral-variant80"].value;
        const surfacenvD = getSurfaces(surfacedark, neutralvariantdark, opacitysurfacedark, "  theme-ref-elevation-surface-neutral-variant", "dark");
        const surfacepD = getSurfaces(surfacedark, primarydark, opacitysurfacedark, "  theme-ref-elevation-surface-primary", "dark");
        const secondarydark = colorEntities["md.ref.palette.secondary80"].value;
        const surfacesD = getSurfaces(surfacedark, secondarydark, opacitysurfacedark, "  theme-ref-elevation-surface-secondary", "dark");
        const tertiarydark = colorEntities["md.ref.palette.tertiary80"].value;
        const surfacetD = getSurfaces(surfacedark, tertiarydark, opacitysurfacedark, "  theme-ref-elevation-surface-tertiary", "dark");
        const errordark = colorEntities["md.ref.palette.error80"].value;
        const surfaceeD = getSurfaces(surfacedark, errordark, opacitysurfacedark, "  theme-ref-elevation-surface-error", "dark");
        let themeDefs = "";
        for (const [index, cssName] of Object.entries(cssNames)) {
          if (cssName.substring(0, 9) === "theme-ref") {
            themeDefs += `  ${cssName}
`;
            themeDefs += `  ${cssNamesRgb[index]}
`;
          }
        }
        console.log(surfacenL + surfacenvL + surfacepL + surfacesL + surfacetL + surfaceeL + surfacenD + surfacenvD + surfacepD + surfacesD + surfacetD + surfaceeD + themeDefs);
        console.log("*** M3 - Material 3 conversion DONE. You should copy the above output...");
      }
    }
    this.aspectratio = (this.config.layout.aspectratio || this.config.aspectratio || "1/1").trim();
    const ar = this.aspectratio.split("/");
    if (!this.viewBox) this.viewBox = {};
    this.viewBox.width = ar[0] * SVG_DEFAULT_DIMENSIONS;
    this.viewBox.height = ar[1] * SVG_DEFAULT_DIMENSIONS;
    if (this.config.layout.styles?.card) {
      this.styles.card.default = this.config.layout.styles.card;
    }
    if (this.dev.debug) console.log("Step 5: toolconfig, list of toolsets", this.toolsets);
    if (this.dev.debug) console.log("debug - setConfig", this.cardId, this.config);
    if (this.dev.performance) console.timeEnd(`--> ${this.cardId} PERFORMANCE card::setConfig`);
    this.configIsSet = true;
  }
  /** *****************************************************************************
  * card::connectedCallback()
  *
  * Summary.
  *
  */
  connectedCallback() {
    if (this.dev.performance) console.time(`--> ${this.cardId} PERFORMANCE card::connectedCallback`);
    if (this.dev.debug) console.log("*****Event - connectedCallback", this.cardId, (/* @__PURE__ */ new Date()).getTime());
    this.connected = true;
    super.connectedCallback();
    if (this.entityHistory.update_interval) {
      this.updateOnInterval();
      clearInterval(this.interval);
      this.interval = setInterval(
        () => this.updateOnInterval(),
        this._hass ? this.entityHistory.update_interval * 1e3 : 100
      );
    }
    if (this.dev.debug) console.log("ConnectedCallback", this.cardId);
    this.requestUpdate();
    if (this.dev.performance) console.timeEnd(`--> ${this.cardId} PERFORMANCE card::connectedCallback`);
  }
  /** *****************************************************************************
  * card::disconnectedCallback()
  *
  * Summary.
  *
  */
  disconnectedCallback() {
    if (this.dev.performance) console.time(`--> ${this.cardId} PERFORMANCE card::disconnectedCallback`);
    if (this.dev.debug) console.log("*****Event - disconnectedCallback", this.cardId, (/* @__PURE__ */ new Date()).getTime());
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = 0;
    }
    super.disconnectedCallback();
    if (this.dev.debug) console.log("disconnectedCallback", this.cardId);
    this.connected = false;
    if (this.dev.performance) console.timeEnd(`--> ${this.cardId} PERFORMANCE card::disconnectedCallback`);
  }
  /** *****************************************************************************
  * card::firstUpdated()
  *
  * Summary.
  * firstUpdated fires after the first time the card hs been updated using its render method,
  * but before the browser has had a chance to paint.
  *
  */
  firstUpdated(changedProperties) {
    if (this.dev.debug) console.log("*****Event - card::firstUpdated", this.cardId, (/* @__PURE__ */ new Date()).getTime());
    if (this.toolsets) {
      this.toolsets.map(async (item) => {
        item.firstUpdated(changedProperties);
        return true;
      });
    }
  }
  /** *****************************************************************************
  * card::updated()
  *
  * Summary.
  *
  */
  updated(changedProperties) {
    if (this.dev.debug) console.log("*****Event - Updated", this.cardId, (/* @__PURE__ */ new Date()).getTime());
    if (this.toolsets) {
      this.toolsets.map(async (item) => {
        item.updated(changedProperties);
        return true;
      });
    }
  }
  /** *****************************************************************************
  * card::render()
  *
  * Summary.
  * Renders the complete SVG based card according to the specified layout.
  *
  * render ICON TESTING pathh lzwzmegla undefined undefined
  * render ICON TESTING pathh lzwzmegla undefined NodeList [ha-svg-icon]
  * render ICON TESTING pathh lzwzmegla M7,2V13H10V22L17,10H13L17,2H7Z NodeList [ha-svg-icon]
  */
  render() {
    if (this.dev.performance) console.time(`--> ${this.cardId} PERFORMANCE card::render`);
    if (this.dev.debug) console.log("*****Event - render", this.cardId, (/* @__PURE__ */ new Date()).getTime());
    if (!this.connected) {
      if (this.dev.debug) console.log("render but NOT connected", this.cardId, (/* @__PURE__ */ new Date()).getTime());
      return;
    }
    let myHtml;
    try {
      if (this.config.disable_card) {
        myHtml = html`
                  <div class="container" id="container">
                    ${this._renderSvg()}
                  </div>
                  `;
      } else {
        myHtml = html`
                  <ha-card style="${styleMap$1(this.styles.card.default)}">
                    <div class="container" id="container"
                    >
                      ${this._renderSvg()}
                    </div>
                  </ha-card>
                  `;
      }
    } catch (error) {
      console.error(error);
    }
    if (this.dev.performance) console.timeEnd(`--> ${this.cardId} PERFORMANCE card::render`);
    return myHtml;
  }
  _renderSakSvgDefinitions() {
    return svg`
    ${SwissArmyKnifeCard.sakSvgContent}
    `;
  }
  _renderUserSvgDefinitions() {
    return svg`
    ${SwissArmyKnifeCard.userSvgContent}
    `;
  }
  themeIsDarkMode() {
    return this.theme.darkMode === true;
  }
  themeIsLightMode() {
    return this.theme.darkMode === false;
  }
  /** *****************************************************************************
  * card::_RenderToolsets()
  *
  * Summary.
  * Renders the toolsets
  *
  */
  _RenderToolsets() {
    if (this.dev.debug) console.log("all the tools in renderTools", this.tools);
    return svg`
      <g id="toolsets" class="toolsets__group"
      >
        ${this.toolsets.map((toolset) => toolset.render())}
      </g>

      <defs>
        ${this._renderSakSvgDefinitions()}
        ${this._renderUserSvgDefinitions()}
      </defs>
    `;
  }
  /** *****************************************************************************
  * card::_renderSvg()
  *
  * Summary.
  * Renders the SVG
  *
  * NTS:
  * If height and width given for svg it equals the viewbox. The card is not scaled
  * anymore to the full dimensions of the card given by hass/lovelace.
  * Card or svg is also placed default at start of viewport (not box), and can be
  * placed at start, center or end of viewport (Use align-self to center it).
  *
  * 1.  If height and width are ommitted, the ha-card/viewport is forced to the x/y
  *     aspect ratio of the viewbox, ie 1:1. EXACTLY WHAT WE WANT!
  * 2.  If height and width are set to 100%, the viewport (or ha-card) forces the
  *     aspect-ratio on the svg. Although GetCardSize is set to 4, it seems the
  *     height is forced to 150px, so part of the viewbox/svg is not shown or
  *     out of proportion!
  *
  */
  _renderCardAttributes() {
    let entityValue;
    const attributes = [];
    this._attributes = "";
    for (let i = 0; i < this.entities.length; i++) {
      entityValue = this.attributesStr[i] ? this.attributesStr[i] : this.secondaryInfoStr[i] ? this.secondaryInfoStr[i] : this.entitiesStr[i];
      attributes.push(entityValue);
    }
    this._attributes = attributes;
    return attributes;
  }
  _renderSvg() {
    const cardFilter = this.config.card_filter ? this.config.card_filter : "card--filter-none";
    const svgItems = [];
    this._renderCardAttributes();
    const toolsetsSvg = this._RenderToolsets();
    svgItems.push(svg`
      <!-- SAK Card SVG Render -->
      <svg id="rootsvg" xmlns="http://www/w3.org/2000/svg" xmlns:xlink="http://www/w3.org/1999/xlink"
       class="${cardFilter}"
       style="${styleMap$1(this.themeIsDarkMode() ? this.styles.card.dark : this.styles.card.light)}"
       data-entity-0="${this._attributes[0]}"
       data-entity-1="${ifDefined(this._attributes[1])}"
       data-entity-2="${ifDefined(this._attributes[2])}"
       data-entity-3="${ifDefined(this._attributes[3])}"
       data-entity-4="${ifDefined(this._attributes[4])}"
       data-entity-5="${ifDefined(this._attributes[5])}"
       data-entity-6="${ifDefined(this._attributes[6])}"
       data-entity-7="${ifDefined(this._attributes[7])}"
       data-entity-8="${ifDefined(this._attributes[8])}"
       data-entity-9="${ifDefined(this._attributes[9])}"
       viewBox="0 0 ${this.viewBox.width} ${this.viewBox.height}"
      >
        <g style="${styleMap$1(this.config.layout?.styles?.toolsets)}">
          ${toolsetsSvg}
        </g>
      </svg>`);
    return svg`${svgItems}`;
  }
  /** *****************************************************************************
  * card::_buildUom()
  *
  * Summary.
  * Builds the Unit of Measurement string.
  *
  */
  _buildUom(derivedEntity, entityState, entityConfig) {
    return derivedEntity?.unit || entityConfig?.unit || entityState?.attributes.unit_of_measurement || "";
  }
  toLocale(string, fallback = "unknown") {
    const lang = this._hass.selectedLanguage || this._hass.language;
    const resources = this._hass.resources[lang];
    return resources && resources[string] ? resources[string] : fallback;
  }
  /** *****************************************************************************
    * card::_buildStateString()
    *
    * Summary.
    * Builds the State string.
    * If state is not a number, the state is returned AS IS, otherwise the state
    * is converted if specified before it is returned as a string
    *
    * IMPORTANT NOTE:
    * - do NOT replace isNaN() by Number.isNaN(). They are INCOMPATIBLE !!!!!!!!!
    */
  _buildStateString(inState, entityConfig) {
    if (typeof inState === "undefined") return inState;
    if (entityConfig.convert) {
      let splitted = entityConfig.convert.match(/(^\w+)\((\d+)\)/);
      let converter;
      let parameter;
      if (splitted === null) {
        converter = entityConfig.convert;
      } else if (splitted.length === 3) {
        converter = splitted[1];
        parameter = Number(splitted[2]);
      }
      switch (converter) {
        case "brightness_pct":
          inState = inState === "undefined" ? "undefined" : `${Math.round(inState / 255 * 100)}`;
          break;
        case "multiply":
          inState = `${Math.round(inState * parameter)}`;
          break;
        case "divide":
          inState = `${Math.round(inState / parameter)}`;
          break;
        case "rgb_csv":
        case "rgb_hex":
          if (entityConfig.attribute) {
            let entity = this._hass.states[entityConfig.entity];
            switch (entity.attributes.color_mode) {
              case "unknown":
                break;
              case "onoff":
                break;
              case "brightness":
                break;
              case "color_temp":
                if (entity.attributes.color_temp_kelvin) {
                  let rgb = temperature2rgb(entity.attributes.color_temp_kelvin);
                  const hsvColor = rgb2hsv(rgb);
                  if (hsvColor[1] < 0.4) {
                    if (hsvColor[1] < 0.1) {
                      hsvColor[2] = 225;
                    } else {
                      hsvColor[1] = 0.4;
                    }
                  }
                  rgb = hsv2rgb(hsvColor);
                  rgb[0] = Math.round(rgb[0]);
                  rgb[1] = Math.round(rgb[1]);
                  rgb[2] = Math.round(rgb[2]);
                  if (converter === "rgb_csv") {
                    inState = `${rgb[0]},${rgb[1]},${rgb[2]}`;
                  } else {
                    inState = rgb2hex(rgb);
                  }
                } else {
                  if (converter === "rgb_csv") {
                    inState = `${255},${255},${255}`;
                  } else {
                    inState = "#ffffff00";
                  }
                }
                break;
              case "hs":
                {
                  let rgb = hs2rgb([entity.attributes.hs_color[0], entity.attributes.hs_color[1] / 100]);
                  rgb[0] = Math.round(rgb[0]);
                  rgb[1] = Math.round(rgb[1]);
                  rgb[2] = Math.round(rgb[2]);
                  if (converter === "rgb_csv") {
                    inState = `${rgb[0]},${rgb[1]},${rgb[2]}`;
                  } else {
                    inState = rgb2hex(rgb);
                  }
                }
                break;
              case "rgb":
                {
                  const hsvColor = rgb2hsv(this.stateObj.attributes.rgb_color);
                  if (hsvColor[1] < 0.4) {
                    if (hsvColor[1] < 0.1) {
                      hsvColor[2] = 225;
                    } else {
                      hsvColor[1] = 0.4;
                    }
                  }
                  const rgbColor = hsv2rgb(hsvColor);
                  if (converter === "rgb_csv") {
                    inState = rgbColor.toString();
                  } else {
                    inState = rgb2hex(rgbColor);
                  }
                }
                break;
              case "rgbw":
                {
                  let rgb = rgbw2rgb(entity.attributes.rgbw_color);
                  rgb[0] = Math.round(rgb[0]);
                  rgb[1] = Math.round(rgb[1]);
                  rgb[2] = Math.round(rgb[2]);
                  if (converter === "rgb_csv") {
                    inState = `${rgb[0]},${rgb[1]},${rgb[2]}`;
                  } else {
                    inState = rgb2hex(rgb);
                  }
                }
                break;
              case "rgbww":
                {
                  let rgb = rgbww2rgb(
                    entity.attributes.rgbww_color,
                    entity.attributes?.min_color_temp_kelvin,
                    entity.attributes?.max_color_temp_kelvin
                  );
                  rgb[0] = Math.round(rgb[0]);
                  rgb[1] = Math.round(rgb[1]);
                  rgb[2] = Math.round(rgb[2]);
                  if (converter === "rgb_csv") {
                    inState = `${rgb[0]},${rgb[1]},${rgb[2]}`;
                  } else {
                    inState = rgb2hex(rgb);
                  }
                }
                break;
              case "white":
                break;
              case "xy":
                if (entity.attributes.hs_color) {
                  let rgb = hs2rgb([entity.attributes.hs_color[0], entity.attributes.hs_color[1] / 100]);
                  const hsvColor = rgb2hsv(rgb);
                  if (hsvColor[1] < 0.4) {
                    if (hsvColor[1] < 0.1) {
                      hsvColor[2] = 225;
                    } else {
                      hsvColor[1] = 0.4;
                    }
                  }
                  rgb = hsv2rgb(hsvColor);
                  rgb[0] = Math.round(rgb[0]);
                  rgb[1] = Math.round(rgb[1]);
                  rgb[2] = Math.round(rgb[2]);
                  if (converter === "rgb_csv") {
                    inState = `${rgb[0]},${rgb[1]},${rgb[2]}`;
                  } else {
                    inState = rgb2hex(rgb);
                  }
                } else if (entity.attributes.color) {
                  let hsl = {};
                  hsl.l = entity.attributes.brightness;
                  hsl.h = entity.attributes.color.h || entity.attributes.color.hue;
                  hsl.s = entity.attributes.color.s || entity.attributes.color.saturation;
                  let { r, g, b } = Colors.hslToRgb(hsl);
                  if (converter === "rgb_csv") {
                    inState = `${r},${g},${b}`;
                  } else {
                    const rHex = Colors.padZero(r.toString(16));
                    const gHex = Colors.padZero(g.toString(16));
                    const bHex = Colors.padZero(b.toString(16));
                    inState = `#${rHex}${gHex}${bHex}`;
                  }
                } else if (entity.attributes.xy_color) ;
                break;
            }
          }
          break;
        default:
          console.error(`Unknown converter [${converter}] specified for entity [${entityConfig.entity}]!`);
          break;
      }
    }
    if (typeof inState === "undefined") {
      return void 0;
    }
    if (Number.isNaN(inState)) {
      return inState;
    }
    return inState.toString();
  }
  _computeEntity(entityId) {
    return entityId.substr(entityId.indexOf(".") + 1);
  }
  // 2022.01.25 #TODO
  // Reset interval to 5 minutes: is now short I think after connectedCallback().
  // Only if _hass exists / is set --> set to 5 minutes!
  //
  // BUG: If no history entity, the interval check keeps running. Initially set to 2000ms, and
  // keeps running with that interval. If history present, interval is larger ????????
  //
  // There is no check yet, if history is requested. That is the only reason to have this
  // interval active!
  updateOnInterval() {
    if (!this._hass) {
      if (this.dev.debug) console.log("UpdateOnInterval - NO hass, returning");
      return;
    }
    {
      this.updateData();
    }
    if (!this.entityHistory.needed) {
      if (this.interval) {
        window.clearInterval(this.interval);
        this.interval = 0;
      }
    } else {
      window.clearInterval(this.interval);
      this.interval = setInterval(
        () => this.updateOnInterval(),
        // 30 * 1000,
        this.entityHistory.update_interval * 1e3
      );
    }
  }
  async fetchRecent(entityId, start, end, skipInitialState) {
    let url = "history/period";
    if (start) url += `/${start.toISOString()}`;
    url += `?filter_entity_id=${entityId}`;
    if (end) url += `&end_time=${end.toISOString()}`;
    if (skipInitialState) url += "&skip_initial_state";
    url += "&minimal_response";
    return this._hass.callApi("GET", url);
  }
  // async updateData({ config } = this) {
  async updateData() {
    this.entityHistory.updating = true;
    if (this.dev.debug) console.log("card::updateData - ENTRY", this.cardId);
    const entityList = [];
    let j = 0;
    this.toolsets.map((toolset, k) => {
      toolset.tools.map((item, i) => {
        if (item.type === "bar" || item.type === "sparkline") {
          if (item.tool.config?.period?.type === "real_time") return true;
          const end = /* @__PURE__ */ new Date();
          const start = /* @__PURE__ */ new Date();
          if (item.tool.config.period?.calendar?.period === "day") {
            start.setHours(0, 0, 0, 0);
            start.setHours(start.getHours() + item.tool.config.period.calendar.offset * 24);
            if (item.tool.config.period.calendar.offset !== 0) end.setHours(0, 0, 0, 0);
          } else {
            start.setHours(end.getHours() - (item.tool.config.period?.rolling_window?.duration?.hour || item.tool.config.hours));
          }
          const attr = this.config.entities[item.tool.config.entity_index].attribute ? this.config.entities[item.tool.config.entity_index].attribute : null;
          entityList[j] = {
            tsidx: k,
            entityIndex: item.tool.config.entity_index,
            entityId: this.entities[item.tool.config.entity_index].entity_id,
            attrId: attr,
            start,
            end,
            type: item.type,
            idx: i
            // tsidx: k, entityIndex: item.tool.config.entity_index, entityId: this.entities[item.tool.config.entity_index].entity_id, attrId: attr, start, end, type: 'bar', idx: i,
          };
          j += 1;
        }
        return true;
      });
      return true;
    });
    if (this.dev.debug) console.log("card::updateData - LENGTH", this.cardId, entityList.length, entityList);
    this.stateChanged = false;
    if (this.dev.debug) console.log("card::updateData, entityList from tools", entityList);
    try {
      const promise = entityList.map((item, i) => this.updateEntity(item, i, item.start, item.end));
      await Promise.all(promise);
    } finally {
      this.entityHistory.updating = false;
    }
    this.entityHistory.updating = false;
  }
  async updateEntity(entity, index, initStart, end) {
    let stateHistory = [];
    const start = initStart;
    const skipInitialState = false;
    let newStateHistory = await this.fetchRecent(entity.entityId, start, end, skipInitialState);
    if (entity.type === "sparkline") {
      this.toolsets[entity.tsidx].tools[entity.idx].tool.processStateMap(newStateHistory);
    }
    let theState;
    if (newStateHistory[0] && newStateHistory[0].length > 0) {
      if (entity.attrId) {
        theState = this.entities[entity.entityIndex].attributes[this.config.entities[entity.entityIndex].attribute];
        entity.state = theState;
      }
      newStateHistory = newStateHistory[0].filter((item) => entity.attrId ? !isNaN(parseFloat(item.attributes[entity.attrId])) : !isNaN(parseFloat(item.state)));
      newStateHistory = newStateHistory.map((item) => ({
        last_changed: item.last_changed,
        state: entity.attrId ? Number(item.attributes[entity.attrId]) : Number(item.state)
      }));
    }
    stateHistory = [...stateHistory, ...newStateHistory];
    if (entity.type === "sparkline") {
      this.toolsets[entity.tsidx].tools[entity.idx].tool.data = entity.entityIndex;
      this.toolsets[entity.tsidx].tools[entity.idx].tool.series = [...stateHistory];
      this.requestUpdate();
    } else {
      this.uppdate(entity, stateHistory);
    }
  }
  uppdate(entity, hist) {
    if (!hist) return;
    const getAvg = (arr, val) => arr.reduce((sum, p) => sum + Number(p[val]), 0) / arr.length;
    const now = (/* @__PURE__ */ new Date()).getTime();
    let hours = 24;
    let barhours = 2;
    if (entity.type === "bar" || entity.type === "sparkline") {
      if (this.dev.debug) console.log("entity.type == bar", entity);
      hours = this.toolsets[entity.tsidx].tools[entity.idx].tool.config.hours;
      barhours = this.toolsets[entity.tsidx].tools[entity.idx].tool.config.barhours;
    }
    const reduce = (res, item) => {
      const age = now - new Date(item.last_changed).getTime();
      const interval = age / (1e3 * 3600) / barhours - hours / barhours;
      const key = Math.floor(Math.abs(interval));
      if (!res[key]) res[key] = [];
      res[key].push(item);
      return res;
    };
    const coords = hist.reduce((res, item) => reduce(res, item), []);
    coords.length = Math.ceil(hours / barhours);
    if (Object.keys(coords).length === 0) {
      return;
    }
    const firstInterval = Object.keys(coords)[0];
    if (firstInterval !== "0") {
      coords[0] = [];
      coords[0].push(coords[firstInterval][0]);
    }
    for (let i = 0; i < hours / barhours; i++) {
      if (!coords[i]) {
        coords[i] = [];
        coords[i].push(coords[i - 1][coords[i - 1].length - 1]);
      }
    }
    this.coords = coords;
    let theData = [];
    theData = [];
    theData = coords.map((item) => getAvg(item, "state"));
    if (["bar"].includes(entity.type)) {
      this.toolsets[entity.tsidx].tools[entity.idx].tool.series = [...theData];
    }
    this.requestUpdate();
  }
  /** *****************************************************************************
  * card::getCardSize()
  *
  * Summary.
  * Return a fixed value of 4 as the height.
  *
  */
  getCardSize() {
    return 4;
  }
}
customElements.define("swiss-army-knife-card", SwissArmyKnifeCard);
//# sourceMappingURL=swiss-army-knife-card.js.map
