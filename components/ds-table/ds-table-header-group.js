// ds-table-header-group - Light DOM data holder for grouped header rows.
// No Shadow DOM. No DSBaseComponent inheritance.

export class DSTableHeaderGroup extends HTMLElement {
  static get observedAttributes() {
    return [];
  }
}

customElements.define('ds-table-header-group', DSTableHeaderGroup);
