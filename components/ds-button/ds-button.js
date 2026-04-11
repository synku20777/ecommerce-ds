// ═══════════════════════════════════════════════════════════
// ds-button — Button Web Component
//
// Variants: default | outline | ghost | destructive | secondary | link
// Sizes:    default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg
// Flags:    disabled, icon-only
//
// Usage:
//   <ds-button variant="default" size="default">Click me</ds-button>
//   <ds-button variant="ghost" size="icon-sm" aria-label="Search">
//     <svg>...</svg>
//   </ds-button>
// ═══════════════════════════════════════════════════════════

import { DSBaseComponent } from '../../core/base-component.js';

const BUTTON_VARIANTS = ['default', 'outline', 'ghost', 'destructive', 'secondary', 'link'];
const BUTTON_VARIANT_ALIASES = {
  primary: 'default',
};

const BUTTON_SIZES = ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'];
const BUTTON_SIZE_ALIASES = {
  s: 'sm',
  m: 'default',
  l: 'lg',
};

const BUTTON_ICON_SIZE_BY_SIZE = {
  xs: 'icon-xs',
  sm: 'icon-sm',
  default: 'icon',
  lg: 'icon-lg',
};

const escapeAttribute = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;');

export class DSButton extends DSBaseComponent {
  static get observedAttributes() {
    return ['variant', 'size', 'disabled', 'icon-only'];
  }

  static get componentStyles() {
    return 'ds-button.css';
  }

  get variant() {
    return this._normalizeVariant(this._getAttr('variant', 'default'));
  }

  get size() {
    const size = this._normalizeSize(this._getAttr('size', 'default'));

    if (this._hasBooleanAttr('icon-only')) {
      return this._toIconSize(size);
    }

    return size;
  }

  _normalizeVariant(value) {
    const raw = String(value || '').toLowerCase();
    const canonical = BUTTON_VARIANT_ALIASES[raw] || raw;
    return BUTTON_VARIANTS.includes(canonical) ? canonical : 'default';
  }

  _normalizeSize(value) {
    const raw = String(value || '').toLowerCase();
    const canonical = BUTTON_SIZE_ALIASES[raw] || raw;
    return BUTTON_SIZES.includes(canonical) ? canonical : 'default';
  }

  _toIconSize(size) {
    if (size.startsWith('icon')) {
      return size;
    }

    return BUTTON_ICON_SIZE_BY_SIZE[size] || 'icon';
  }

  get template() {
    const variant = this.variant;
    const size = this.size;
    const disabled = this._hasBooleanAttr('disabled');
    const iconOnly = size.startsWith('icon');
    const ariaLabel = this.getAttribute('aria-label') || '';

    const classes = [
      'ds-button',
      `ds-button--${variant}`,
      `ds-button--size-${size}`,
      iconOnly ? 'ds-button--icon-only' : '',
    ].filter(Boolean).join(' ');

    return `
      <button
        class="${classes}"
        ${disabled ? 'disabled' : ''}
        ${iconOnly && ariaLabel ? `aria-label="${escapeAttribute(ariaLabel)}"` : ''}
      >
        <slot></slot>
      </button>
    `;
  }
}

customElements.define('ds-button', DSButton);
