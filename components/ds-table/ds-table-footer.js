// ds-table-footer - Light DOM data holder for ds-table footer rows.
// No Shadow DOM. No DSBaseComponent inheritance.

export class DSTableFooter extends HTMLElement {
  constructor() {
    super();
    this._observer = null;
  }

  connectedCallback() {
    this._observer = new MutationObserver(() => {
      this.dispatchEvent(new CustomEvent('ds-table-change', {
        bubbles: true,
        composed: true,
      }));
    });

    this._observer.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });
  }

  disconnectedCallback() {
    this._observer?.disconnect();
    this._observer = null;
  }
}

customElements.define('ds-table-footer', DSTableFooter);
