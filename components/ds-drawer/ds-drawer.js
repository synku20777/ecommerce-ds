import { DSBaseComponent } from '../../core/base-component.js';

const DRAWER_PLACEMENTS = ['left', 'right', 'top', 'bottom'];
const DRAWER_SIZES = ['sm', 'md', 'lg'];
const DRAWER_CLOSE_DELAY = 250;

const normalizeToken = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/\s+/g, '-');

const escapeAttribute = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;');

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

export class DSDrawer extends DSBaseComponent {
  static get observedAttributes() {
    return ['open', 'placement', 'size', 'label', 'persistent'];
  }

  static get componentStyles() {
    return 'ds-drawer.css';
  }

  constructor() {
    super();
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._isClosing = false;
    this._closeTimer = null;
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._handleKeyDown);
    window.clearTimeout(this._closeTimer);
  }

  get open() {
    return this._hasBooleanAttr('open');
  }

  get placement() {
    const placement = normalizeToken(this._getAttr('placement', 'right'));
    return DRAWER_PLACEMENTS.includes(placement) ? placement : 'right';
  }

  get size() {
    const size = normalizeToken(this._getAttr('size', 'md'));
    return DRAWER_SIZES.includes(size) ? size : 'md';
  }

  show() {
    const wasClosing = this._isClosing;
    window.clearTimeout(this._closeTimer);
    this._isClosing = false;
    this.setAttribute('open', '');
    if (wasClosing && this.isConnected) {
      this._render();
      this._setupEventListeners();
    }
  }

  close() {
    if (!this.open || this._isClosing) return;

    this._isClosing = true;
    this._render();
    this._setupEventListeners();

    this._closeTimer = window.setTimeout(() => {
      this._isClosing = false;
      this.removeAttribute('open');
    }, DRAWER_CLOSE_DELAY);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    super.attributeChangedCallback(name, oldValue, newValue);

    if (name !== 'open' || oldValue === newValue || !this.isConnected) return;

    const isOpen = newValue !== null;
    if (isOpen) this._isClosing = false;
    this._emit('ds-open-change', { open: isOpen });

    if (isOpen) {
      queueMicrotask(() => this.shadowRoot.querySelector('.ds-drawer__panel')?.focus());
    } else {
      this._emit('ds-close', {});
    }
  }

  _setupEventListeners() {
    document.removeEventListener('keydown', this._handleKeyDown);

    if (!this.open || this._isClosing) return;

    document.addEventListener('keydown', this._handleKeyDown);
    this.shadowRoot.querySelector('.ds-drawer__close')?.addEventListener('click', () => this.close());
    this.shadowRoot.querySelector('.ds-drawer__backdrop')?.addEventListener('click', () => {
      if (!this._hasBooleanAttr('persistent')) this.close();
    });
  }

  _handleKeyDown(event) {
    if (event.key === 'Escape' && this.open && !this._hasBooleanAttr('persistent')) {
      this.close();
    }
  }

  get template() {
    if (!this.open && !this._isClosing) return '';

    const placement = this.placement;
    const size = this.size;
    const state = this._isClosing ? 'closing' : 'open';
    const label = this._getAttr('label', '');
    const ariaLabel = this.getAttribute('aria-label') || label || 'Drawer';
    const labelMarkup = label
      ? `<h2 class="ds-drawer__title" id="drawer-title">${escapeHtml(label)}</h2>`
      : '<slot name="header"></slot>';
    const labelAttributes = label
      ? 'aria-labelledby="drawer-title"'
      : `aria-label="${escapeAttribute(ariaLabel)}"`;

    return `
      <div class="ds-drawer ds-drawer--${placement}" data-state="${state}">
        <div class="ds-drawer__backdrop" aria-hidden="true"></div>
        <section
          class="ds-drawer__panel ds-drawer__panel--${placement} ds-drawer__panel--${size}"
          role="dialog"
          aria-modal="true"
          ${labelAttributes}
          tabindex="-1"
        >
          <header class="ds-drawer__header">
            ${labelMarkup}
            <button class="ds-drawer__close" type="button" aria-label="Close drawer">&times;</button>
          </header>
          <div class="ds-drawer__body">
            <slot></slot>
          </div>
          <footer class="ds-drawer__footer">
            <slot name="footer"></slot>
          </footer>
        </section>
      </div>
    `;
  }
}

customElements.define('ds-drawer', DSDrawer);
