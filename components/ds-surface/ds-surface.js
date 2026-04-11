// ═══════════════════════════════════════════════════════════
// ds-surface — Surface Web Component
//
// Variants:  card | badge | tag | chip
// Props:     variant, elevated (cards), removable (chips)
//
// Usage:
//   <ds-surface variant="card">Card content here</ds-surface>
//   <ds-surface variant="card" elevated>Raised card</ds-surface>
//   <ds-surface variant="badge">New</ds-surface>
//   <ds-surface variant="tag">Electronics</ds-surface>
//   <ds-surface variant="chip" removable>Filter: Blue</ds-surface>
// ═══════════════════════════════════════════════════════════

import { DSBaseComponent } from '../../core/base-component.js';

export class DSSurface extends DSBaseComponent {
  static get observedAttributes() {
    return ['variant', 'elevated', 'removable'];
  }

  static get componentStyles() {
    return 'ds-surface.css';
  }

  get variant() {
    const v = this._getAttr('variant', 'card');
    return ['card', 'badge', 'tag', 'chip'].includes(v) ? v : 'card';
  }

  get template() {
    const variant = this.variant;
    const elevated = this._hasBooleanAttr('elevated');
    const removable = this._hasBooleanAttr('removable');

    const classes = [
      `ds-surface--${variant}`,
      elevated ? 'ds-surface--elevated' : '',
    ].filter(Boolean).join(' ');

    // Chips with removable flag get a dismiss button
    const removeBtn = variant === 'chip' && removable
      ? `<button class="ds-surface__remove" aria-label="Remove" type="button">&times;</button>`
      : '';

    return `
      <div class="${classes}">
        <slot></slot>
        ${removeBtn}
      </div>
    `;
  }

  _setupEventListeners() {
    const removeBtn = this.shadowRoot.querySelector('.ds-surface__remove');
    if (!removeBtn) return;

    removeBtn.addEventListener('click', () => {
      this._emit('ds-remove', {
        value: this.textContent?.trim() || '',
      });
    });
  }
}

customElements.define('ds-surface', DSSurface);
