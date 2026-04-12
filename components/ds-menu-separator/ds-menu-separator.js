// ═══════════════════════════════════════════════════════════
// ds-menu-separator — thin <hr> divider for menus
//
// Usage:
//   <ds-menu-separator></ds-menu-separator>
// ═══════════════════════════════════════════════════════════

import { DSBaseComponent } from '../../core/base-component.js';

export class DSMenuSeparator extends DSBaseComponent {
  static get componentStyles() { return 'ds-menu-separator.css'; }
  static get observedAttributes() { return []; }

  get template() {
    return `<hr class="ds-menu-separator" role="separator" aria-hidden="true">`;
  }
}

customElements.define('ds-menu-separator', DSMenuSeparator);
