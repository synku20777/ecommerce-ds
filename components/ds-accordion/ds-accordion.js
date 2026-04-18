// ═══════════════════════════════════════════════════════════
// ds-accordion — Accordion parent Web Component
//
// Attributes:
//   variant     — one of 16 variant names (default: 'default')
//   single-open — boolean: only one item open at a time
//
// Events: ds-open-change (composed, bubbling) — forwarded from items
// ═══════════════════════════════════════════════════════════

import { DSBaseComponent } from '../../core/base-component.js';
import './ds-accordion-item.js';

const VALID_VARIANTS = [
  'default',
  'bordered',
  'separated',
  'filled',
  'shadow',
  'left-icon',
  'plus-minus',
  'subtext',
  'ghost',
  'avatar',
  'colored-indicator',
  'minimal',
  'rounded',
  'arrow',
  'outline',
  'icon-right',
];

const normalizeToken = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

export class DSAccordion extends DSBaseComponent {
  static get observedAttributes() {
    return ['variant', 'single-open'];
  }

  static get componentStyles() {
    return 'ds-accordion.css';
  }

  constructor() {
    super();
    this._handleOpenChange = this._handleOpenChange.bind(this);
  }

  // ─── Accessors ──────────────────────────────────────────

  get variant() {
    const v = normalizeToken(this._getAttr('variant', 'default'));
    return VALID_VARIANTS.includes(v) ? v : 'default';
  }

  get singleOpen() {
    return this.hasAttribute('single-open');
  }

  get items() {
    return Array.from(this.querySelectorAll(':scope > ds-accordion-item'));
  }

  // ─── Template ────────────────────────────────────────────

  get template() {
    return `
      <div class="ds-accordion ds-accordion--${this.variant}" role="list">
        <slot></slot>
      </div>
    `;
  }

  // ─── Lifecycle ───────────────────────────────────────────

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('ds-open-change', this._handleOpenChange);
    // Propagate variant to items after slotchange
    const slot = this.shadowRoot.querySelector('slot');
    if (slot) {
      slot.addEventListener('slotchange', () => this._propagateVariant());
    }
    this._propagateVariant();
  }

  disconnectedCallback() {
    this.removeEventListener('ds-open-change', this._handleOpenChange);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === 'variant') {
      this._propagateVariant();
    }
  }

  // ─── Propagate variant ctx to children ───────────────────

  _propagateVariant() {
    const variant = this.variant;
    this.items.forEach((item) => {
      item.setAttribute('data-variant', variant);
    });
  }

  // ─── Single-open logic ───────────────────────────────────

  _handleOpenChange(e) {
    if (!this.singleOpen) return;
    if (!e.detail?.open) return;

    const openedItem = e.target.closest('ds-accordion-item');
    if (!openedItem) return;

    this.items.forEach((item) => {
      if (item !== openedItem && item.open) {
        item.open = false;
      }
    });
  }
}

customElements.define('ds-accordion', DSAccordion);
