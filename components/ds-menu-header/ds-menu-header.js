// ═══════════════════════════════════════════════════════════
// ds-menu-header — user avatar + name + email block
//
// Attributes:
//   name    — display name (bold)
//   email   — email address (subdued)
//   avatar  — initials string (e.g. "PG") or image URL
//
// Usage:
//   <ds-menu-header name="Phillip George" email="phillip@example.com" avatar="PG"></ds-menu-header>
//   <ds-menu-header name="Phillip George" email="phillip@example.com" avatar="/avatar.jpg"></ds-menu-header>
// ═══════════════════════════════════════════════════════════

import { DSBaseComponent } from '../../core/base-component.js';

const escapeHtml = (str) => String(str || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const escapeAttribute = (str) => String(str || '')
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;');

export class DSMenuHeader extends DSBaseComponent {
  static get componentStyles() { return 'ds-menu-header.css'; }
  static get observedAttributes() { return ['name', 'email', 'avatar']; }

  get template() {
    const name  = escapeHtml(this.getAttribute('name') || '');
    const email = escapeHtml(this.getAttribute('email') || '');
    const av    = this.getAttribute('avatar') || '';
    const isImg = /^(https?:\/\/|\/)/.test(av);

    const avatarHtml = isImg
      ? `<img class="ds-menu-header__avatar" src="${escapeAttribute(av)}" alt="" aria-hidden="true">`
      : `<span class="ds-menu-header__avatar ds-menu-header__avatar--initials" aria-hidden="true">${escapeHtml(av.slice(0, 2).toUpperCase())}</span>`;

    return `
      <div class="ds-menu-header">
        ${avatarHtml}
        <div class="ds-menu-header__text">
          <span class="ds-menu-header__name">${name}</span>
          <span class="ds-menu-header__email">${email}</span>
        </div>
      </div>
    `;
  }
}

customElements.define('ds-menu-header', DSMenuHeader);
