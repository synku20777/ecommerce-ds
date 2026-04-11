// ═══════════════════════════════════════════════════════════
// ds-toggle — Toggle Web Component
//
// Types:   checkbox | radio | switch
// Props:   type, label, checked, disabled, name, value
//
// Usage:
//   <ds-toggle type="checkbox" label="Accept terms"></ds-toggle>
//   <ds-toggle type="radio" name="size" value="m" label="Medium"></ds-toggle>
//   <ds-toggle type="switch" label="Notifications" checked></ds-toggle>
// ═══════════════════════════════════════════════════════════

import { DSBaseComponent } from '../../core/base-component.js';

export class DSToggle extends DSBaseComponent {
  static get observedAttributes() {
    return ['type', 'label', 'checked', 'disabled', 'name', 'value'];
  }

  static get componentStyles() {
    return 'ds-toggle.css';
  }

  get type() {
    const t = this._getAttr('type', 'checkbox');
    return ['checkbox', 'radio', 'switch'].includes(t) ? t : 'checkbox';
  }

  get template() {
    const type = this.type;
    const label = this._getAttr('label');
    const checked = this._hasBooleanAttr('checked');
    const disabled = this._hasBooleanAttr('disabled');
    const name = this._getAttr('name');
    const value = this._getAttr('value');
    const inputId = `ds-toggle-${Math.random().toString(36).slice(2, 9)}`;

    // The native input type: switch uses checkbox under the hood
    const nativeType = type === 'switch' ? 'checkbox' : type;

    const classes = [
      'ds-toggle',
      `ds-toggle--${type}`,
      disabled ? 'ds-toggle--disabled' : '',
    ].filter(Boolean).join(' ');

    let controlHTML = '';

    if (type === 'switch') {
      controlHTML = `
        <input
          id="${inputId}"
          class="ds-toggle__input"
          type="checkbox"
          role="switch"
          ${name ? `name="${name}"` : ''}
          ${value ? `value="${value}"` : ''}
          ${checked ? 'checked' : ''}
          ${disabled ? 'disabled' : ''}
        />
        <span class="ds-toggle__track">
          <span class="ds-toggle__thumb"></span>
        </span>
      `;
    } else if (type === 'checkbox') {
      controlHTML = `
        <input
          id="${inputId}"
          class="ds-toggle__input"
          type="checkbox"
          ${name ? `name="${name}"` : ''}
          ${value ? `value="${value}"` : ''}
          ${checked ? 'checked' : ''}
          ${disabled ? 'disabled' : ''}
        />
        <span class="ds-toggle__box">
          <svg class="ds-toggle__checkmark" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      `;
    } else {
      // radio
      controlHTML = `
        <input
          id="${inputId}"
          class="ds-toggle__input"
          type="radio"
          ${name ? `name="${name}"` : ''}
          ${value ? `value="${value}"` : ''}
          ${checked ? 'checked' : ''}
          ${disabled ? 'disabled' : ''}
        />
        <span class="ds-toggle__box">
          <span class="ds-toggle__dot"></span>
        </span>
      `;
    }

    return `
      <label class="${classes}" for="${inputId}">
        ${controlHTML}
        ${label ? `<span class="ds-toggle__label">${label}</span>` : ''}
      </label>
    `;
  }

  _setupEventListeners() {
    const input = this.shadowRoot.querySelector('input');
    if (!input) return;

    input.addEventListener('change', (e) => {
      // Sync the checked attribute with the native input
      if (e.target.checked) {
        this.setAttribute('checked', '');
      } else {
        this.removeAttribute('checked');
      }

      this._emit('ds-change', {
        checked: e.target.checked,
        value: this._getAttr('value'),
        name: this._getAttr('name'),
        type: this.type,
      });
    });
  }
}

customElements.define('ds-toggle', DSToggle);
