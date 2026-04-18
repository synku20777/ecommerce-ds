// ds-table-head - Light DOM data holder for ds-table header cells.
// No Shadow DOM. No DSBaseComponent inheritance.

const VALID_ALIGN = ['left', 'center', 'right'];

const normalizeToken = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/\s+/g, '-');

export class DSTableHead extends HTMLElement {
  static get observedAttributes() {
    return ['colspan', 'rowspan', 'align'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.dispatchEvent(new CustomEvent('ds-table-change', {
        bubbles: true,
        composed: true,
      }));
    }
  }

  get colspan() {
    const value = Number.parseInt(this.getAttribute('colspan') || '1', 10);
    return Number.isInteger(value) && value > 0 ? value : 1;
  }

  get rowspan() {
    const value = Number.parseInt(this.getAttribute('rowspan') || '1', 10);
    return Number.isInteger(value) && value > 0 ? value : 1;
  }

  get align() {
    const value = normalizeToken(this.getAttribute('align'));
    return VALID_ALIGN.includes(value) ? value : 'left';
  }
}

customElements.define('ds-table-head', DSTableHead);
