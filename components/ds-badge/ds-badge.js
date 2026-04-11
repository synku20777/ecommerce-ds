// ds-badge - Badge Web Component
//
// Variants: default | secondary | destructive | outline | ghost | link | dot | number-dot | text-dot
// Sizes:    small | default | large
// Flags:    closable
// Slots:    default content, optional slot="icon"

import { DSBaseComponent } from '../../core/base-component.js';

const BADGE_VARIANTS = [
  'default',
  'secondary',
  'destructive',
  'outline',
  'ghost',
  'link',
  'dot',
  'number-dot',
  'text-dot',
];

const BADGE_SIZES = ['small', 'default', 'large'];
const ICON_POSITIONS = ['start', 'end'];
const LINK_ICON = `
  <svg class="ds-badge__link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
`;

const normalizeToken = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/\s+/g, '-');

const escapeAttribute = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;');

export class DSBadge extends DSBaseComponent {
  static get observedAttributes() {
    return ['variant', 'size', 'icon', 'closable'];
  }

  static get componentStyles() {
    return 'ds-badge.css';
  }

  get variant() {
    const variant = normalizeToken(this._getAttr('variant', 'default'));
    return BADGE_VARIANTS.includes(variant) ? variant : 'default';
  }

  get size() {
    const size = normalizeToken(this._getAttr('size', 'default'));
    return BADGE_SIZES.includes(size) ? size : 'default';
  }

  get icon() {
    const icon = normalizeToken(this._getAttr('icon', ''));
    return ICON_POSITIONS.includes(icon) ? icon : '';
  }

  get template() {
    const variant = this.variant;
    const size = this.size;
    const icon = variant === 'link' ? 'end' : this.icon;
    const closable = this._hasBooleanAttr('closable');
    const isDotOnly = variant === 'dot';
    const isButton = variant === 'link' && !closable;
    const hasDot = variant === 'dot' || variant === 'text-dot';
    const ariaLabel = this.getAttribute('aria-label') || '';

    const classes = [
      'ds-badge',
      `ds-badge--${variant}`,
      `ds-badge--size-${size}`,
      icon ? `ds-badge--icon-${icon}` : '',
      closable ? 'ds-badge--closable' : '',
      isDotOnly ? 'ds-badge--dot-only' : '',
    ].filter(Boolean).join(' ');

    const dot = hasDot ? '<span class="ds-badge__dot" aria-hidden="true"></span>' : '';
    const iconFallback = variant === 'link' ? LINK_ICON : '';
    const iconSlot = icon ? `<slot name="icon" class="ds-badge__icon ds-badge__icon--${icon}">${iconFallback}</slot>` : '';
    const startIcon = icon === 'start' ? iconSlot : '';
    const endIcon = icon === 'end' ? iconSlot : '';
    const content = isDotOnly ? '' : '<span class="ds-badge__content"><slot></slot></span>';
    const closeButton = closable
      ? '<button class="ds-badge__close" type="button" aria-label="Remove"><span aria-hidden="true">&times;</span></button>'
      : '';
    const label = isDotOnly && ariaLabel ? `role="status" aria-label="${escapeAttribute(ariaLabel)}"` : '';
    const tag = isButton ? 'button' : 'span';
    const buttonType = isButton ? 'type="button"' : '';

    return `
      <${tag} class="${classes}" ${buttonType} ${label}>
        ${dot}
        ${startIcon}
        ${content}
        ${endIcon}
        ${closeButton}
      </${tag}>
    `;
  }

  _setupEventListeners() {
    const closeButton = this.shadowRoot.querySelector('.ds-badge__close');
    if (!closeButton) return;

    closeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this._emit('ds-remove', {
        value: this.textContent?.trim() || '',
      });
    });
  }
}

customElements.define('ds-badge', DSBadge);
