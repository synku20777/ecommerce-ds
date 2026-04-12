import { DSBaseComponent } from '../../core/base-component.js';

const DIALOG_SIZES = ['sm', 'md', 'lg', 'fullscreen'];

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

export class DSDialog extends DSBaseComponent {
  static get observedAttributes() {
    return ['open', 'size', 'label', 'persistent'];
  }

  static get componentStyles() {
    return 'ds-dialog.css';
  }

  constructor() {
    super();
    this._handleKeyDown = this._handleKeyDown.bind(this);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._handleKeyDown);
  }

  get size() {
    const size = normalizeToken(this._getAttr('size', 'md'));
    return DIALOG_SIZES.includes(size) ? size : 'md';
  }

  get open() {
    return this._hasBooleanAttr('open');
  }

  show() {
    this.setAttribute('open', '');
  }

  close() {
    this.removeAttribute('open');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    super.attributeChangedCallback(name, oldValue, newValue);

    if (name !== 'open' || oldValue === newValue || !this.isConnected) return;

    const isOpen = newValue !== null;
    this._emit('ds-open-change', { open: isOpen });

    if (isOpen) {
      queueMicrotask(() => this.shadowRoot.querySelector('.ds-dialog__panel')?.focus());
    } else {
      this._emit('ds-close', {});
    }
  }

  _setupEventListeners() {
    document.removeEventListener('keydown', this._handleKeyDown);

    if (!this.open) return;

    document.addEventListener('keydown', this._handleKeyDown);
    this.shadowRoot.querySelector('.ds-dialog__close')?.addEventListener('click', () => this.close());
    this.shadowRoot.querySelector('.ds-dialog__backdrop')?.addEventListener('click', () => {
      if (!this._hasBooleanAttr('persistent')) this.close();
    });
  }

  _handleKeyDown(event) {
    if (event.key === 'Escape' && this.open && !this._hasBooleanAttr('persistent')) {
      this.close();
    }
  }

  get template() {
    if (!this.open) return '';

    const size = this.size;
    const label = this._getAttr('label', '');
    const ariaLabel = this.getAttribute('aria-label') || label || 'Dialog';
    const labelMarkup = label
      ? `<h2 class="ds-dialog__title" id="dialog-title">${escapeHtml(label)}</h2>`
      : '<slot name="header"></slot>';
    const labelAttributes = label
      ? 'aria-labelledby="dialog-title"'
      : `aria-label="${escapeAttribute(ariaLabel)}"`;

    return `
      <div class="ds-dialog" data-state="open">
        <div class="ds-dialog__backdrop" aria-hidden="true"></div>
        <section
          class="ds-dialog__panel ds-dialog__panel--${size}"
          role="dialog"
          aria-modal="true"
          ${labelAttributes}
          tabindex="-1"
        >
          <header class="ds-dialog__header">
            ${labelMarkup}
            <button class="ds-dialog__close" type="button" aria-label="Close dialog">&times;</button>
          </header>
          <div class="ds-dialog__body">
            <slot></slot>
          </div>
          <footer class="ds-dialog__footer">
            <slot name="footer"></slot>
          </footer>
        </section>
      </div>
    `;
  }
}

customElements.define('ds-dialog', DSDialog);
