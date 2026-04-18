// ds-table-row - Light DOM data holder for ds-table rows.
// No Shadow DOM. No DSBaseComponent inheritance.

export class DSTableRow extends HTMLElement {
  static get observedAttributes() {
    return ['selected'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.dispatchEvent(new CustomEvent('ds-table-change', {
        bubbles: true,
        composed: true,
      }));
    }
  }

  get selected() {
    return this.hasAttribute('selected');
  }
}

customElements.define('ds-table-row', DSTableRow);
