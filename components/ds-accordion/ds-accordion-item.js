// ═══════════════════════════════════════════════════════════
// ds-accordion-item — Child element Web Component
//
// Attributes: open (boolean), disabled (boolean)
// Slots: trigger (named), default (body content)
//        subtext (named, optional description under trigger title)
//        avatar  (named, optional icon/avatar left of trigger)
//        icon    (named, optional descriptive icon on trigger right-start)
//
// Events: ds-open-change (composed, bubbling)
// ═══════════════════════════════════════════════════════════

import { DSBaseComponent } from '../../core/base-component.js';

export class DSAccordionItem extends DSBaseComponent {
  static get observedAttributes() {
    return ['open', 'disabled'];
  }

  static get componentStyles() {
    return 'ds-accordion.css';
  }

  constructor() {
    super();
    this._handleTriggerClick = this._handleTriggerClick.bind(this);
    this._handleTriggerKeydown = this._handleTriggerKeydown.bind(this);
  }

  // ─── Accessors ──────────────────────────────────────────

  get open() {
    return this.hasAttribute('open');
  }

  set open(val) {
    if (val) {
      this.setAttribute('open', '');
    } else {
      this.removeAttribute('open');
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  // ─── Template ────────────────────────────────────────────

  get template() {
    const isOpen = this.open;
    const isDisabled = this.disabled;

    return `
      <div class="ds-accordion__item${isOpen ? ' ds-accordion__item--open' : ''}${isDisabled ? ' ds-accordion__item--disabled' : ''}">
        <button
          class="ds-accordion__trigger"
          aria-expanded="${isOpen}"
          ${isDisabled ? 'disabled aria-disabled="true"' : ''}
          type="button"
        >
          <slot name="avatar" class="ds-accordion__avatar-slot"></slot>
          <slot name="icon" class="ds-accordion__icon-slot"></slot>
          <span class="ds-accordion__trigger-content">
            <span class="ds-accordion__title"><slot name="trigger"></slot></span>
            <slot name="subtext" class="ds-accordion__subtext-slot"></slot>
          </span>
          <span class="ds-accordion__chevron" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </span>
        </button>
        <div class="ds-accordion__body" role="region" aria-hidden="${!isOpen}">
          <div class="ds-accordion__content">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }

  // ─── Lifecycle ───────────────────────────────────────────

  _setupEventListeners() {
    const trigger = this.shadowRoot.querySelector('.ds-accordion__trigger');
    if (!trigger) return;
    trigger.addEventListener('click', this._handleTriggerClick);
    trigger.addEventListener('keydown', this._handleTriggerKeydown);
  }

  // ─── Handlers ────────────────────────────────────────────

  _handleTriggerClick() {
    if (this.disabled) return;
    this.open = !this.open;
    this._emit('ds-open-change', { open: this.open, item: this });
  }

  _handleTriggerKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._handleTriggerClick();
    }
  }

  // ─── Attribute Change ────────────────────────────────────

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (!this.isConnected) return;
    this._render();
    this._setupEventListeners();
    // Sync aria-expanded on the trigger without full re-render
    const trigger = this.shadowRoot?.querySelector('.ds-accordion__trigger');
    if (trigger && name === 'open') {
      trigger.setAttribute('aria-expanded', String(this.open));
    }
  }
}

customElements.define('ds-accordion-item', DSAccordionItem);
