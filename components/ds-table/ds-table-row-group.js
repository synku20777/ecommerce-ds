// ds-table-row-group - Light DOM data holder for grouped body rows.
// No Shadow DOM. No DSBaseComponent inheritance.

export class DSTableRowGroup extends HTMLElement {
  static get observedAttributes() {
    return [];
  }
}

customElements.define('ds-table-row-group', DSTableRowGroup);
