// ═══════════════════════════════════════════════════════════
// DSBaseComponent — Base class for all design system Web Components
//
// Handles:
//   - Shadow DOM creation
//   - Style injection (component CSS via <link>)
//   - Attribute change re-rendering
//   - Helper methods for boolean attrs & property reflection
//
// CSS custom properties from tokens.css (loaded on the host page)
// inherit through Shadow DOM by spec — no need to re-inject tokens.
// ═══════════════════════════════════════════════════════════

export class DSBaseComponent extends HTMLElement {
  /**
   * Override in subclass: return the compiled CSS filename.
   * e.g., 'ds-button.css'
   */
  static get componentStyles() {
    return '';
  }

  /**
   * Override in subclass: return the Shadow DOM HTML template string.
   */
  get template() {
    return '';
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._stylesInjected = false;
  }

  connectedCallback() {
    this._injectStyles();
    this._render();
    this._setupEventListeners();
  }

  /**
   * Injects the component-specific CSS into Shadow DOM via <link>.
   * Called once — stylesheets are preserved across re-renders.
   */
  _injectStyles() {
    if (this._stylesInjected) return;
    this._stylesInjected = true;

    const basePath = this._getBasePath();
    const componentCSS = this.constructor.componentStyles;

    if (componentCSS) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${basePath}/dist/${componentCSS}`;
      this.shadowRoot.appendChild(link);
    }
  }

  /**
   * Resolves the base path to the design system root.
   * Looks for a <meta name="ds-base-path"> tag, falling back to auto-detection.
   */
  _getBasePath() {
    // Check for explicit base path meta tag
    const meta = document.querySelector('meta[name="ds-base-path"]');
    if (meta) return meta.content;

    // Auto-detect from current script location
    const scripts = document.querySelectorAll('script[src*="components/"]');
    for (const script of scripts) {
      const match = script.src.match(/(.*?)\/components\//);
      if (match) return match[1];
    }

    // Fallback: assume served from root
    return '.';
  }

  /**
   * Renders the template into Shadow DOM.
   * Preserves <link> stylesheets during re-renders.
   */
  _render() {
    // Preserve existing stylesheet links
    const existingLinks = this.shadowRoot.querySelectorAll('link[rel="stylesheet"]');

    // Clear non-stylesheet content
    const children = Array.from(this.shadowRoot.children);
    children.forEach(child => {
      if (child.tagName !== 'LINK') {
        child.remove();
      }
    });

    // Parse and append the template
    const temp = document.createElement('div');
    temp.innerHTML = this.template;
    while (temp.firstChild) {
      this.shadowRoot.appendChild(temp.firstChild);
    }
  }

  /**
   * Override in subclasses to set up event delegation.
   */
  _setupEventListeners() {}

  /**
   * Called when observed attributes change.
   * Triggers a re-render if the component is connected.
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected) {
      this._render();
      this._setupEventListeners();
    }
  }

  // ─── Utility Helpers ────────────────────────────────────

  /**
   * Check if a boolean attribute is present.
   */
  _hasBooleanAttr(name) {
    return this.hasAttribute(name);
  }

  /**
   * Get an attribute with a default fallback.
   */
  _getAttr(name, fallback = '') {
    return this.getAttribute(name) ?? fallback;
  }

  /**
   * Dispatch a custom event that bubbles and crosses shadow boundaries.
   */
  _emit(eventName, detail = {}) {
    this.dispatchEvent(new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true,
    }));
  }
}
