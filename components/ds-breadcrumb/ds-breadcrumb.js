// ds-breadcrumb - Breadcrumb Navigation Web Component
//
// Variants:   default | pill | contained
// Separators: chevron | slash | double-chevron | dot
//
// Reads <ds-breadcrumb-item> children from light DOM
// and builds the full template in shadow DOM.

import { DSBaseComponent } from '../../core/base-component.js';
import './ds-breadcrumb-item.js';

// ─── SVG Icons ──────────────────────────────────────────────

const ICON_HOME = `<svg class="ds-breadcrumb__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`;

const ICON_FOLDER = `<svg class="ds-breadcrumb__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`;

const ICON_DOCUMENT = `<svg class="ds-breadcrumb__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`;

const ICON_CHEVRON_DOWN = `<svg class="ds-breadcrumb__dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;

const BUILT_IN_ICONS = {
  home: ICON_HOME,
  folder: ICON_FOLDER,
  document: ICON_DOCUMENT,
};

// ─── Separators ─────────────────────────────────────────────

const SEP_CHEVRON = `<svg class="ds-breadcrumb__sep-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>`;

const SEP_DOUBLE_CHEVRON = `<svg class="ds-breadcrumb__sep-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg>`;

const SEPARATORS = {
  chevron: SEP_CHEVRON,
  slash: '<span class="ds-breadcrumb__sep-text">/</span>',
  'double-chevron': SEP_DOUBLE_CHEVRON,
  dot: '<span class="ds-breadcrumb__sep-text">&middot;</span>',
};

const VALID_SEPARATORS = Object.keys(SEPARATORS);
const VALID_VARIANTS = ['default', 'pill', 'contained'];

const normalizeToken = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/\s+/g, '-');

const escapeHtml = (str) => String(str || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

export class DSBreadcrumb extends DSBaseComponent {
  static get observedAttributes() {
    return ['separator', 'variant'];
  }

  static get componentStyles() {
    return 'ds-breadcrumb.css';
  }

  constructor() {
    super();
    this._observer = null;
    this._renderPending = false;
  }

  connectedCallback() {
    super.connectedCallback();

    this._observer = new MutationObserver(() => this._scheduleRender());
    this._observer.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href', 'icon', 'current', 'collapsed', 'dropdown'],
    });
  }

  disconnectedCallback() {
    this._observer?.disconnect();
    this._observer = null;
  }

  _scheduleRender() {
    if (this._renderPending) return;
    this._renderPending = true;
    queueMicrotask(() => {
      this._renderPending = false;
      if (this.isConnected) {
        this._render();
        this._setupEventListeners();
      }
    });
  }

  get separator() {
    const sep = normalizeToken(this._getAttr('separator', 'chevron'));
    return VALID_SEPARATORS.includes(sep) ? sep : 'chevron';
  }

  get variant() {
    const variant = normalizeToken(this._getAttr('variant', 'default'));
    return VALID_VARIANTS.includes(variant) ? variant : 'default';
  }

  get template() {
    const items = Array.from(this.querySelectorAll('ds-breadcrumb-item'));
    const variant = this.variant;
    const separator = this.separator;
    const sepHtml = SEPARATORS[separator];

    const classes = [
      'ds-breadcrumb',
      `ds-breadcrumb--${variant}`,
      `ds-breadcrumb--sep-${separator}`,
    ].join(' ');

    let listItems = '';

    items.forEach((item, index) => {
      const isCurrent = item.current;
      const isCollapsed = item.collapsed;
      const hasDropdown = item.dropdown;
      const iconName = item.icon;
      const href = item.href;
      const label = escapeHtml(item.label);

      const iconHtml = iconName && BUILT_IN_ICONS[iconName] ? BUILT_IN_ICONS[iconName] : '';
      const textHtml = `<span class="ds-breadcrumb__text">${label}</span>`;
      const dropdownHtml = hasDropdown ? ICON_CHEVRON_DOWN : '';

      const itemClasses = [
        'ds-breadcrumb__item',
        isCollapsed ? 'ds-breadcrumb__item--collapsed' : '',
      ].filter(Boolean).join(' ');

      let inner;
      if (isCurrent) {
        inner = `<span class="ds-breadcrumb__current">${iconHtml}${textHtml}${dropdownHtml}</span>`;
      } else if (href) {
        inner = `<a class="ds-breadcrumb__link" href="${escapeHtml(href)}">${iconHtml}${textHtml}</a>`;
      } else {
        inner = `<span class="ds-breadcrumb__link">${iconHtml}${textHtml}</span>`;
      }

      listItems += `<li class="${itemClasses}"${isCurrent ? ' aria-current="page"' : ''}>${inner}</li>`;

      // Separator between items (not after last)
      if (index < items.length - 1) {
        listItems += `<li class="ds-breadcrumb__separator" aria-hidden="true">${sepHtml}</li>`;
      }
    });

    return `
      <nav aria-label="Breadcrumb">
        <ol class="${classes}">
          ${listItems}
        </ol>
      </nav>
    `;
  }
}

customElements.define('ds-breadcrumb', DSBreadcrumb);
