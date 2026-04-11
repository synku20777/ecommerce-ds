import { DSBaseComponent } from '../../core/base-component.js';

const normalizeToken = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/\s+/g, '-');

const escapeHtml = (str) => String(str || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const CSS_FILE = 'ds-tabs.css';

// ═══════════════════════════════════════════════════════════
// ds-tab-panels & ds-tab-panel
// ═══════════════════════════════════════════════════════════

export class DSTabPanels extends DSBaseComponent {
  static get componentStyles() { return CSS_FILE; }
  get template() {
    return `<div class="ds-tab-panels"><slot></slot></div>`;
  }
}
customElements.define('ds-tab-panels', DSTabPanels);

export class DSTabPanel extends DSBaseComponent {
  static get componentStyles() { return CSS_FILE; }
  static get observedAttributes() { return ['active', 'value']; }

  get template() {
    const isActive = this._hasBooleanAttr('active');
    return `<div class="ds-tab-panel" role="tabpanel" tabindex="0" ${isActive ? '' : 'hidden'}><slot></slot></div>`;
  }
}
customElements.define('ds-tab-panel', DSTabPanel);

// ═══════════════════════════════════════════════════════════
// ds-tab-list & ds-tab
// ═══════════════════════════════════════════════════════════

export class DSTabList extends DSBaseComponent {
  static get componentStyles() { return CSS_FILE; }
  static get observedAttributes() { return ['orientation', 'list-bg', 'shadow', 'indicator', 'radius', 'border']; }

  get template() {
    const orientation = normalizeToken(this._getAttr('orientation', 'horizontal'));
    const listBg = normalizeToken(this._getAttr('list-bg', 'transparent'));
    const indicator = normalizeToken(this._getAttr('indicator', 'none'));
    const radius = normalizeToken(this._getAttr('radius', 'sm'));

    return `
      <div 
        class="ds-tab-list ds-tab-list--${orientation} list-bg--${listBg} indicator--${indicator} radius--${radius}" 
        role="tablist" 
        aria-orientation="${orientation === 'vertical' ? 'vertical' : 'horizontal'}"
      >
        <slot></slot>
      </div>
    `;
  }
}
customElements.define('ds-tab-list', DSTabList);

const ICONS = {
  compass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  gift: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>`
};
export class DSTab extends DSBaseComponent {
  static get componentStyles() { return CSS_FILE; }
  static get observedAttributes() {
    return ['value', 'icon', 'icon-pos', 'label', 'bg', 'color', 'orientation', 'active', 'disabled', 'indicator', 'shadow', 'radius', 'border'];
  }

  constructor() {
    super();
    this._handleClick = this._handleClick.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
  }

  _setupEventListeners() {
    const btn = this.shadowRoot.querySelector('button');
    if (btn) {
      btn.removeEventListener('click', this._handleClick);
      btn.addEventListener('click', this._handleClick);
    }
  }

  _handleClick(e) {
    if (this._hasBooleanAttr('disabled')) return;
    this._emit('ds-tab-click', { value: this.getAttribute('value') });
  }

  focus() {
    this.shadowRoot.querySelector('button')?.focus();
  }

  get template() {
    const orientation = normalizeToken(this._getAttr('orientation', 'horizontal'));
    const bg = normalizeToken(this._getAttr('bg', 'transparent'));
    const color = normalizeToken(this._getAttr('color', 'foreground'));

    const iconPos = normalizeToken(this._getAttr('icon-pos', 'start'));
    const hasLabel = this._getAttr('label') !== 'false';
    const isActive = this._hasBooleanAttr('active');
    const isDisabled = this._hasBooleanAttr('disabled');
    const iconName = this.getAttribute('icon');

    let iconHtml = '';
    if (iconName && ICONS[iconName]) {
      iconHtml = `<span class="icon-slot">${ICONS[iconName]}</span>`;
    } else if (iconName) {
      iconHtml = `<span class="icon-slot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></svg></span>`;
    }

    const slotHtml = hasLabel ? `<span class="label-slot"><slot></slot></span>` : '';

    let contentHtml = '';
    if (iconPos === 'end') {
      contentHtml = `${slotHtml}${iconHtml}`;
    } else {
      contentHtml = `${iconHtml}${slotHtml}`;
    }

    const shadow = normalizeToken(this._getAttr('shadow', 'none'));
    const border = normalizeToken(this._getAttr('border', 'none'));
    const indicator = normalizeToken(this._getAttr('indicator', 'none'));
    const radius = normalizeToken(this._getAttr('radius', 'sm', 'full'));

    return `
      <button 
        class="ds-tab ds-tab--${orientation} active-bg--${bg} active-color--${color} shadow--${shadow} border--${border} indicator--${indicator} radius--${radius} icon-only--${!hasLabel}" 
        role="tab" 
        icon-pos="${iconPos}"
        aria-selected="${isActive ? 'true' : 'false'}"
        tabindex="${isActive ? '0' : '-1'}"
        ${isDisabled ? 'disabled' : ''}
      >
        ${contentHtml}
      </button>
    `;
  }
}
customElements.define('ds-tab', DSTab);

// ═══════════════════════════════════════════════════════════
// ds-tabs (Orchestrator)
// ═══════════════════════════════════════════════════════════

export class DSTabs extends DSBaseComponent {
  static get componentStyles() { return CSS_FILE; }
  static get observedAttributes() {
    return ['orientation', 'bg', 'list-bg', 'color', 'icon-pos', 'shadow', 'border', 'indicator', 'radius', 'label', 'value'];
  }

  constructor() {
    super();
    this._handleTabClick = this._handleTabClick.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._observer = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('ds-tab-click', this._handleTabClick);
    this.addEventListener('keydown', this._handleKeyDown);

    this._observer = new MutationObserver(() => this._syncChildren());
    this._observer.observe(this, { childList: true, subtree: true });
  }

  disconnectedCallback() {
    this.removeEventListener('ds-tab-click', this._handleTabClick);
    this.removeEventListener('keydown', this._handleKeyDown);
    this._observer?.disconnect();
    this._observer = null;
  }

  _setupEventListeners() {
    this._syncChildren();
  }

  _handleTabClick(e) {
    const val = e.detail.value;
    if (val) this.setAttribute('value', val);
  }

  _handleKeyDown(e) {
    const tabs = Array.from(this.querySelectorAll('ds-tab:not([disabled])'));
    if (!tabs.length) return;

    let activeIdx = tabs.findIndex(t => t.hasAttribute('active'));
    if (activeIdx === -1) activeIdx = 0;

    let nextIdx = activeIdx;
    const orientation = normalizeToken(this._getAttr('orientation', 'horizontal'));

    if (orientation === 'horizontal') {
      if (e.key === 'ArrowRight') nextIdx = (activeIdx + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') nextIdx = (activeIdx - 1 + tabs.length) % tabs.length;
    } else {
      if (e.key === 'ArrowDown') nextIdx = (activeIdx + 1) % tabs.length;
      else if (e.key === 'ArrowUp') nextIdx = (activeIdx - 1 + tabs.length) % tabs.length;
    }

    if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = tabs.length - 1;

    if (nextIdx !== activeIdx && tabs[nextIdx]) {
      e.preventDefault();
      const nextTab = tabs[nextIdx];
      this.setAttribute('value', nextTab.getAttribute('value'));
      nextTab.focus();
    }
  }

  _syncChildren() {
    const tabs = Array.from(this.querySelectorAll('ds-tab'));
    let value = this.getAttribute('value');

    if (!value && tabs.length > 0) {
      value = tabs[0].getAttribute('value');
      this.setAttribute('value', value);
      return;
    }

    const lists = this.querySelectorAll('ds-tab-list');

    // Only pass down orchestrator attributes if they are explicitly set!
    if (this.hasAttribute('orientation')) {
      const orientation = normalizeToken(this.getAttribute('orientation'));
      lists.forEach(l => l.setAttribute('orientation', orientation));
      tabs.forEach(t => t.setAttribute('orientation', orientation));
    }

    if (this.hasAttribute('list-bg')) {
      const listBg = normalizeToken(this.getAttribute('list-bg'));
      lists.forEach(l => l.setAttribute('list-bg', listBg));
    }

    if (this.hasAttribute('indicator')) {
      const indicator = normalizeToken(this.getAttribute('indicator'));
      lists.forEach(l => l.setAttribute('indicator', indicator));
      tabs.forEach(t => t.setAttribute('indicator', indicator));
    }

    if (this.hasAttribute('radius')) {
      const radius = normalizeToken(this.getAttribute('radius'));
      lists.forEach(l => l.setAttribute('radius', radius));
      tabs.forEach(t => t.setAttribute('radius', radius));
    }

    if (this.hasAttribute('bg')) {
      const bg = normalizeToken(this.getAttribute('bg'));
      tabs.forEach(t => t.setAttribute('bg', bg));
    }

    if (this.hasAttribute('color')) {
      const color = normalizeToken(this.getAttribute('color'));
      tabs.forEach(t => t.setAttribute('color', color));
    }

    if (this.hasAttribute('icon-pos')) {
      const iconPos = normalizeToken(this.getAttribute('icon-pos'));
      tabs.forEach(t => t.setAttribute('icon-pos', iconPos));
    }

    if (this.hasAttribute('label')) {
      const label = this.getAttribute('label');
      tabs.forEach(t => t.setAttribute('label', label));
    }

    if (this.hasAttribute('shadow')) {
      const shadow = normalizeToken(this.getAttribute('shadow'));
      tabs.forEach(t => t.setAttribute('shadow', shadow));
    }

    if (this.hasAttribute('border')) {
      const border = normalizeToken(this.getAttribute('border'));
      lists.forEach(l => l.setAttribute('border', border));
      tabs.forEach(t => t.setAttribute('border', border));
    }

    tabs.forEach(t => {
      const tabVal = t.getAttribute('value');
      if (tabVal && tabVal === value) {
        t.setAttribute('active', '');
      } else {
        t.removeAttribute('active');
      }
    });

    const panels = this.querySelectorAll('ds-tab-panel');
    panels.forEach(p => {
      if (p.getAttribute('value') === value) {
        p.setAttribute('active', '');
      } else {
        p.removeAttribute('active');
      }
    });
  }

  get template() {
    const orientation = normalizeToken(this._getAttr('orientation', 'horizontal'));
    return `
      <div class="ds-tabs ds-tabs--${orientation}">
        <slot name="list"></slot>
        <slot name="panels"></slot>
        <slot></slot>
      </div>
    `;
  }
}
customElements.define('ds-tabs', DSTabs);
