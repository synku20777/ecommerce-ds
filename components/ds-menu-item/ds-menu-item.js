// ═══════════════════════════════════════════════════════════
// ds-menu-item — Menu / Dropdown list item Web Component
//
// Attributes:
//   label       — primary text (slot fallback used if absent)
//   subtext     — secondary/hint text
//   icon        — name of leading icon (uses ds-tabs icon set + more)
//   icon-end    — name of trailing icon
//   selected    — boolean, shows checkmark without reserving space when absent
//   disabled    — boolean
//   size        — xs | s | m (default) | l | xl
//
// Usage:
//   <ds-menu-item label="Rename" icon="edit" subtext="Alt+R"></ds-menu-item>
//   <ds-menu-item label="Delete" icon="trash" disabled></ds-menu-item>
// ═══════════════════════════════════════════════════════════

import { DSBaseComponent } from '../../core/base-component.js';

const escapeHtml = (str) => String(str || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// Inline SVG icon map (16px viewport, strokeCurrentColor)
const ICONS = {
  check: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="2.5,8 6.5,12 13.5,4"/></svg>`,
  chevron: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,4 10,8 6,12"/></svg>`,
  edit: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5z"/></svg>`,
  trash: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,4 14,4"/><path d="M5 4V2h6v2"/><path d="M6 7v5m4-5v5"/><rect x="3" y="4" width="10" height="10" rx="1"/></svg>`,
  copy: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="5" width="9" height="9" rx="1"/><path d="M11 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2"/></svg>`,
  link: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5l-1 1"/><path d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5l1-1"/></svg>`,
  share: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="3" r="1.5"/><circle cx="12" cy="13" r="1.5"/><circle cx="3" cy="8" r="1.5"/><line x1="10.5" y1="3.75" x2="4.5" y2="7.25"/><line x1="10.5" y1="12.25" x2="4.5" y2="8.75"/></svg>`,
  warning: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2L14.5 13H1.5L8 2z"/><line x1="8" y1="6" x2="8" y2="9"/><circle cx="8" cy="11.5" r="0.5" fill="currentColor"/></svg>`,
  info: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><line x1="8" y1="7" x2="8" y2="11"/><circle cx="8" cy="5" r="0.5" fill="currentColor"/></svg>`,
  settings: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.22 3.22l1.42 1.42M11.36 11.36l1.42 1.42M3.22 12.78l1.42-1.42M11.36 4.64l1.42-1.42"/></svg>`,
  user: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="5.5" r="2.5"/><path d="M2 13c0-3.314 2.686-5 6-5s6 1.686 6 5"/></svg>`,
};

const SIZE_VARS = {
  xs: { padY: 'var(--space-xxs)', padX: 'var(--space-sm)', minH: '2rem' },
  s:  { padY: 'var(--space-xs)',  padX: 'var(--space-sm)', minH: '2.25rem' },
  m:  { padY: 'var(--space-sm)', padX: 'var(--space-sm)', minH: '2.75rem' },
  l:  { padY: 'var(--space-md)', padX: 'var(--space-sm)', minH: '3.25rem' },
  xl: { padY: 'var(--space-lg)', padX: 'var(--space-sm)', minH: '4rem' },
};

const CSS_FILE = 'ds-menu-item.css';

export class DSMenuItem extends DSBaseComponent {
  static get componentStyles() { return CSS_FILE; }
  static get observedAttributes() {
    return ['label', 'subtext', 'icon', 'icon-end', 'selected', 'disabled', 'size'];
  }

  constructor() {
    super();
    this._handleClick = this._handleClick.bind(this);
  }

  _setupEventListeners() {
    const btn = this.shadowRoot.querySelector('button');
    if (btn) {
      btn.removeEventListener('click', this._handleClick);
      btn.addEventListener('click', this._handleClick);
    }
  }

  // Public focus() — cleaner than external shadowRoot piercing
  focus(options) {
    this.shadowRoot?.querySelector('button')?.focus(options);
  }

  get selected() {
    return this._hasBooleanAttr('selected');
  }

  set selected(value) {
    if (value) {
      this.setAttribute('selected', '');
    } else {
      this.removeAttribute('selected');
    }
  }

  _handleClick() {
    if (this._hasBooleanAttr('disabled')) return;
    this._emit('ds-select', { label: this.getAttribute('label') });
  }

  get template() {
    const label    = escapeHtml(this.getAttribute('label') || '');
    const subtext  = escapeHtml(this.getAttribute('subtext') || '');
    const iconName = this.getAttribute('icon') || '';
    const iconEnd  = this.getAttribute('icon-end') || '';
    const selected = this._hasBooleanAttr('selected');
    const disabled = this._hasBooleanAttr('disabled');
    const size     = (this.getAttribute('size') || 'm').toLowerCase();
    const sizing   = SIZE_VARS[size] || SIZE_VARS.m;
    const hasSubtext = !!subtext;
    const iconSvg = iconName ? (ICONS[iconName] || '') : '';
    const iconEndSvg = iconEnd ? (ICONS[iconEnd] || (iconEnd === 'chevron' ? ICONS.chevron : '')) : '';
    const checkHtml = selected
      ? `<span class="ds-menu-item__check" aria-hidden="true">${ICONS.check}</span>`
      : '';

    return `
      <button
        class="ds-menu-item ${disabled ? 'ds-menu-item--disabled' : ''} ${selected ? 'ds-menu-item--selected' : ''}"
        role="menuitem"
        aria-disabled="${disabled ? 'true' : 'false'}"
        ${selected ? 'aria-checked="true"' : ''}
        ${disabled ? 'disabled' : ''}
        style="
          padding-top: ${sizing.padY};
          padding-bottom: ${sizing.padY};
          padding-left: ${sizing.padX};
          padding-right: ${sizing.padX};
          min-height: ${sizing.minH};
        "
      >
        ${checkHtml}

        ${iconSvg ? `<span class="ds-menu-item__icon" aria-hidden="true">${iconSvg}</span>` : ''}

        <span class="ds-menu-item__content">
          <span class="ds-menu-item__label">${label || '<slot></slot>'}</span>
          ${hasSubtext ? `<span class="ds-menu-item__subtext">${subtext}</span>` : ''}
        </span>

        ${iconEndSvg ? `<span class="ds-menu-item__icon-end" aria-hidden="true">${iconEndSvg}</span>` : ''}
      </button>
    `;
  }
}

customElements.define('ds-menu-item', DSMenuItem);
