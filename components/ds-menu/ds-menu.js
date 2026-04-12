// ═══════════════════════════════════════════════════════════
// ds-menu — anchor-positioned floating menu panel
//
// Attributes:
//   open       — boolean, controls visibility
//   anchor     — CSS selector for trigger element (auto-binds click to toggle)
//   placement  — bottom-start (default) | bottom-end | top-start | top-end
//   size       — sm | md (default) | lg  (controls min-width)
//   label      — aria-label for the panel (default: "Menu")
//
// API:
//   show()  — opens menu
//   close() — closes menu
//   toggle()
//
// Events emitted:
//   ds-open-change  { open: boolean }
//   ds-close        {}
//
// Usage:
//   <ds-button id="trigger">Options</ds-button>
//   <ds-menu anchor="#trigger" placement="bottom-start">
//     <ds-menu-header name="Phillip George" email="p@example.com" avatar="PG"></ds-menu-header>
//     <ds-menu-separator></ds-menu-separator>
//     <ds-menu-item label="Profile" icon="user"></ds-menu-item>
//     <ds-menu-item label="Sign out" icon="link"></ds-menu-item>
//   </ds-menu>
// ═══════════════════════════════════════════════════════════

import { DSBaseComponent } from '../../core/base-component.js';

const MENU_SIZES = ['sm', 'md', 'lg'];
const PLACEMENTS = ['bottom-start', 'bottom-end', 'top-start', 'top-end'];

const escapeAttribute = (str) => String(str || '')
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;');

export class DSMenu extends DSBaseComponent {
  static get componentStyles() { return 'ds-menu.css'; }
  static get observedAttributes() {
    return ['open', 'anchor', 'placement', 'size', 'label'];
  }

  constructor() {
    super();
    this._anchorEl    = null;
    this._reposition  = null;
    this._outsideClickFrame = null;

    this._handleKeyDown      = this._handleKeyDown.bind(this);
    this._handleOutsideClick = this._handleOutsideClick.bind(this);
    this._handleAnchorClick  = this._handleAnchorClick.bind(this);
    this._handleSelect       = this._handleSelect.bind(this);
  }

  // ─── Public API ────────────────────────────────────────

  get open() { return this._hasBooleanAttr('open'); }

  show()   { this.setAttribute('open', ''); }
  close()  { this.removeAttribute('open'); }
  toggle() { this.open ? this.close() : this.show(); }

  // ─── Lifecycle ─────────────────────────────────────────

  connectedCallback() {
    super.connectedCallback();
    this._bindAnchor();
  }

  disconnectedCallback() {
    this._removeDocumentListeners();
    this._removeRepositionListeners();
    this._anchorEl?.removeEventListener('click', this._handleAnchorClick);
    this.removeEventListener('ds-select', this._handleSelect);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal); // triggers _render()

    if (!this.isConnected || oldVal === newVal) return;

    if (name === 'open') {
      const isOpen = newVal !== null;
      this._emit('ds-open-change', { open: isOpen });

      if (isOpen) {
        this._addDocumentListeners();
        this._addRepositionListeners();
        this._positionPanel();
        // Focus panel on open — ArrowDown/Up then moves into items
        queueMicrotask(() => {
          this.shadowRoot?.querySelector('.ds-menu__panel')?.focus();
        });
      } else {
        this._removeDocumentListeners();
        this._removeRepositionListeners();
        this._emit('ds-close', {});
      }
    }

    if (name === 'anchor') {
      this._bindAnchor();
    }
  }

  // ─── Template ──────────────────────────────────────────

  get _size() {
    const s = (this._getAttr('size', 'md') || 'md').toLowerCase();
    return MENU_SIZES.includes(s) ? s : 'md';
  }

  get template() {
    if (!this.open) return '';

    const label = escapeAttribute(this._getAttr('label', 'Menu'));

    return `
      <div class="ds-menu__panel ds-menu__panel--${this._size}"
           role="menu"
           aria-label="${label}"
           tabindex="-1">
        <slot></slot>
      </div>
    `;
  }

  // ─── Event setup ───────────────────────────────────────

  _setupEventListeners() {
    // Auto-close when any ds-menu-item inside fires ds-select
    this.removeEventListener('ds-select', this._handleSelect);
    this.addEventListener('ds-select', this._handleSelect);
  }

  _handleSelect() {
    this.close();
  }

  // ─── Anchor binding — idempotent ───────────────────────

  _bindAnchor() {
    // Remove old listener before re-binding
    this._anchorEl?.removeEventListener('click', this._handleAnchorClick);

    const sel = this.getAttribute('anchor');
    this._anchorEl = sel ? document.querySelector(sel) : null;
    this._anchorEl?.addEventListener('click', this._handleAnchorClick);
  }

  _handleAnchorClick(e) {
    e.stopPropagation();
    this.toggle();
  }

  // ─── Document listeners — no leaks ─────────────────────

  _addDocumentListeners() {
    this._removeDocumentListeners(); // idempotent
    document.addEventListener('keydown', this._handleKeyDown);
    // Defer outside-click: anchor click must not immediately close
    this._outsideClickFrame = requestAnimationFrame(() => {
      this._outsideClickFrame = null;
      if (!this.open) return;
      document.addEventListener('click', this._handleOutsideClick, { capture: true });
    });
  }

  _removeDocumentListeners() {
    if (this._outsideClickFrame) {
      cancelAnimationFrame(this._outsideClickFrame);
      this._outsideClickFrame = null;
    }
    document.removeEventListener('keydown', this._handleKeyDown);
    document.removeEventListener('click', this._handleOutsideClick, { capture: true });
  }

  // ─── Outside click — shadow DOM safe ───────────────────

  _handleOutsideClick(e) {
    const path = e.composedPath();
    if (!path.includes(this) && !path.includes(this._anchorEl)) {
      this.close();
    }
  }

  // ─── Keyboard navigation ───────────────────────────────

  _handleKeyDown(e) {
    if (!this.open) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.close();
        this._focusAnchor();
        break;

      case 'Tab':
        // Don't trap — let browser move focus, but close menu
        this.close();
        break;

      case 'ArrowDown':
        e.preventDefault();
        this._moveFocus(1);
        break;

      case 'ArrowUp':
        e.preventDefault();
        this._moveFocus(-1);
        break;

      case 'Home':
        e.preventDefault();
        this._focusItemAt(0);
        break;

      case 'End':
        e.preventDefault();
        this._focusItemAt(-1);
        break;
    }
  }

  _getItems() {
    return [...this.querySelectorAll('ds-menu-item:not([disabled])')];
  }

  _currentIndex(items) {
    return items.findIndex(
      item => item.shadowRoot?.querySelector('button') === item.shadowRoot?.activeElement
    );
  }

  _moveFocus(dir) {
    const items = this._getItems();
    if (!items.length) return;

    let idx = this._currentIndex(items);

    if (idx === -1) {
      // Nothing focused yet — ArrowDown → first, ArrowUp → last
      idx = dir > 0 ? -1 : items.length;
    }

    const next = (idx + dir + items.length) % items.length;
    items[next]?.focus();
  }

  _focusItemAt(index) {
    const items = this._getItems();
    if (!items.length) return;
    const target = index === -1 ? items.at(-1) : items[index];
    target?.focus();
  }

  // ─── Positioning — viewport clamped ────────────────────

  _focusAnchor() {
    const anchor = this._anchorEl;
    if (!anchor) return;

    const focusTarget = anchor.shadowRoot?.querySelector('button, [tabindex], a, input, select, textarea')
      || anchor;
    focusTarget.focus?.();
  }

  _positionPanel() {
    queueMicrotask(() => {
      const panel  = this.shadowRoot?.querySelector('.ds-menu__panel');
      const anchor = this._anchorEl;
      if (!panel || !anchor) return;

      const r   = anchor.getBoundingClientRect();
      const pW  = panel.offsetWidth;
      const pH  = panel.offsetHeight;
      const vW  = window.innerWidth;
      const vH  = window.innerHeight;
      const GAP = 4;

      let top, left;
      const placement = this._getAttr('placement', 'bottom-start');

      switch (placement) {
        case 'bottom-end':
          top  = r.bottom + GAP;
          left = r.right - pW;
          break;
        case 'top-start':
          top  = r.top - pH - GAP;
          left = r.left;
          break;
        case 'top-end':
          top  = r.top - pH - GAP;
          left = r.right - pW;
          break;
        default: // bottom-start
          top  = r.bottom + GAP;
          left = r.left;
      }

      // Clamp to viewport
      left = Math.max(GAP, Math.min(left, vW - pW - GAP));
      top  = Math.max(GAP, Math.min(top,  vH - pH - GAP));

      panel.style.top  = `${top}px`;
      panel.style.left = `${left}px`;
    });
  }

  // ─── Reposition on scroll/resize while open ────────────

  _addRepositionListeners() {
    this._removeRepositionListeners();
    this._reposition = () => { if (this.open) this._positionPanel(); };
    window.addEventListener('scroll', this._reposition, { passive: true, capture: true });
    window.addEventListener('resize', this._reposition, { passive: true });
  }

  _removeRepositionListeners() {
    if (this._reposition) {
      window.removeEventListener('scroll', this._reposition, { capture: true });
      window.removeEventListener('resize', this._reposition);
      this._reposition = null;
    }
  }
}

customElements.define('ds-menu', DSMenu);
