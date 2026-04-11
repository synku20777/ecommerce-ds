// ═══════════════════════════════════════════════════════════
// ds-input — Input Web Component
//
// Types:    text | password | email | select | textarea
// Props:    label, placeholder, helper, error, disabled, required
//
// Usage:
//   <ds-input label="Email" placeholder="name@example.com" helper="We won't share it."></ds-input>
//   <ds-input label="Bio" type="textarea" placeholder="Tell us about yourself..."></ds-input>
//   <ds-input label="Category" type="select">
//     <option value="">Choose...</option>
//     <option value="electronics">Electronics</option>
//   </ds-input>
// ═══════════════════════════════════════════════════════════

import { DSBaseComponent } from '../../core/base-component.js';

export class DSInput extends DSBaseComponent {
  static get observedAttributes() {
    return ['type', 'label', 'placeholder', 'helper', 'error', 'disabled', 'required', 'value', 'name'];
  }

  static get componentStyles() {
    return 'ds-input.css';
  }

  get type() {
    const t = this._getAttr('type', 'text');
    return ['text', 'password', 'email', 'number', 'tel', 'url', 'search', 'select', 'textarea'].includes(t) ? t : 'text';
  }

  get template() {
    const type = this.type;
    const label = this._getAttr('label');
    const placeholder = this._getAttr('placeholder');
    const helper = this._getAttr('helper');
    const error = this._getAttr('error');
    const disabled = this._hasBooleanAttr('disabled');
    const required = this._hasBooleanAttr('required');
    const value = this._getAttr('value');
    const name = this._getAttr('name');
    const hasError = !!error;
    const inputId = `ds-input-${Math.random().toString(36).slice(2, 9)}`;

    let fieldHTML = '';

    if (type === 'select') {
      fieldHTML = `
        <select
          id="${inputId}"
          class="ds-input__select"
          ${name ? `name="${name}"` : ''}
          ${disabled ? 'disabled' : ''}
          ${required ? 'required' : ''}
        >
          <slot></slot>
        </select>
      `;
    } else if (type === 'textarea') {
      fieldHTML = `
        <textarea
          id="${inputId}"
          class="ds-input__textarea"
          ${name ? `name="${name}"` : ''}
          ${placeholder ? `placeholder="${placeholder}"` : ''}
          ${disabled ? 'disabled' : ''}
          ${required ? 'required' : ''}
        >${value || ''}</textarea>
      `;
    } else {
      fieldHTML = `
        <input
          id="${inputId}"
          class="ds-input__field"
          type="${type}"
          ${name ? `name="${name}"` : ''}
          ${placeholder ? `placeholder="${placeholder}"` : ''}
          ${value ? `value="${value}"` : ''}
          ${disabled ? 'disabled' : ''}
          ${required ? 'required' : ''}
        />
      `;
    }

    return `
      <div class="ds-input ${hasError ? 'ds-input--error' : ''}">
        ${label ? `
          <label class="ds-input__label" for="${inputId}">
            ${label}${required ? '<span class="ds-input__required">*</span>' : ''}
          </label>
        ` : ''}
        ${fieldHTML}
        ${error ? `<span class="ds-input__error">${error}</span>` : ''}
        ${helper && !error ? `<span class="ds-input__helper">${helper}</span>` : ''}
      </div>
    `;
  }

  _setupEventListeners() {
    const field = this.shadowRoot.querySelector('input, select, textarea');
    if (!field) return;

    field.addEventListener('input', (e) => {
      this._emit('ds-input', { value: e.target.value, name: this._getAttr('name') });
    });

    field.addEventListener('change', (e) => {
      this._emit('ds-change', { value: e.target.value, name: this._getAttr('name') });
    });
  }
}

customElements.define('ds-input', DSInput);
