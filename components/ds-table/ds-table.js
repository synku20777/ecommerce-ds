// ds-table - Compound table component using light DOM holder elements.
// Reads ds-table-* children and renders a semantic native table in shadow DOM.

import { DSBaseComponent } from '../../core/base-component.js';
import { DSTableRow } from './ds-table-row.js';
import { DSTableCell } from './ds-table-cell.js';
import { DSTableHead } from './ds-table-head.js';
import { DSTableHeaderGroup } from './ds-table-header-group.js';
import { DSTableRowGroup } from './ds-table-row-group.js';
import { DSTableFooter } from './ds-table-footer.js';

const VALID_SIZE = ['default', 'compact'];
const VALID_ALIGN = ['left', 'center', 'right'];

const normalizeToken = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/\s+/g, '-');

const escapeAttribute = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;');

const toPositiveInt = (value, fallback = 1) => {
  const parsed = Number.parseInt(String(value || ''), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export class DSTable extends DSBaseComponent {
  static get observedAttributes() {
    return ['striped', 'hover', 'bordered', 'size', 'sticky-header', 'sticky-column', 'max-height'];
  }

  static get componentStyles() {
    return 'ds-table.css';
  }

  constructor() {
    super();
    this._observer = null;
    this._renderPending = false;
    this._handleTableChange = this._handleTableChange.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('ds-table-change', this._handleTableChange);

    this._observer = new MutationObserver(() => this._scheduleRender());
    this._observer.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  }

  disconnectedCallback() {
    this.removeEventListener('ds-table-change', this._handleTableChange);
    this._observer?.disconnect();
    this._observer = null;
  }

  get size() {
    const value = normalizeToken(this._getAttr('size', 'default'));
    return VALID_SIZE.includes(value) ? value : 'default';
  }

  get maxHeight() {
    const value = this._getAttr('max-height', '').trim();
    return value || '';
  }

  _handleTableChange() {
    this._scheduleRender();
  }

  _scheduleRender() {
    if (this._renderPending) return;
    this._renderPending = true;

    queueMicrotask(() => {
      this._renderPending = false;
      if (!this.isConnected) return;
      this._render();
      this._setupEventListeners();
    });
  }

  _collectHeaderRows() {
    return Array.from(this.querySelectorAll(':scope > ds-table-header-group > ds-table-row'));
  }

  _collectBodyRows() {
    const groupedRows = Array.from(this.querySelectorAll(':scope > ds-table-row-group > ds-table-row'));
    const directRows = Array.from(this.querySelectorAll(':scope > ds-table-row')).filter(
      (row) => !row.closest('ds-table-header-group, ds-table-row-group')
    );

    return [...groupedRows, ...directRows];
  }

  _collectFooterRows() {
    return Array.from(this.querySelectorAll(':scope > ds-table-footer > ds-table-row'));
  }

  _cellAlignmentClass(element, baseClass) {
    const align = normalizeToken(element.getAttribute('align'));
    if (!VALID_ALIGN.includes(align) || align === 'left') {
      return baseClass;
    }

    return `${baseClass} ${baseClass}--align-${escapeAttribute(align)}`;
  }

  _renderHeaderCell(cell) {
    const colspan = toPositiveInt(cell.getAttribute('colspan'), 1);
    const rowspan = toPositiveInt(cell.getAttribute('rowspan'), 1);
    const className = this._cellAlignmentClass(cell, 'ds-table__header-cell');

    return `<th class="${className}"${colspan > 1 ? ` colspan="${colspan}"` : ''}${rowspan > 1 ? ` rowspan="${rowspan}"` : ''}>${cell.innerHTML}</th>`;
  }

  _renderBodyCell(cell) {
    const isHeaderLike = cell.tagName.toLowerCase() === 'ds-table-head';
    const tag = isHeaderLike ? 'th' : 'td';
    const className = this._cellAlignmentClass(cell, isHeaderLike ? 'ds-table__header-cell' : 'ds-table__cell');
    const scope = isHeaderLike ? ' scope="row"' : '';
    const colspan = toPositiveInt(cell.getAttribute('colspan'), 1);
    const rowspan = toPositiveInt(cell.getAttribute('rowspan'), 1);

    return `<${tag} class="${className}"${scope}${colspan > 1 ? ` colspan="${colspan}"` : ''}${rowspan > 1 ? ` rowspan="${rowspan}"` : ''}>${cell.innerHTML}</${tag}>`;
  }

  _renderHeaderRows(rows) {
    return rows.map((row) => {
      const cells = Array.from(row.querySelectorAll(':scope > ds-table-head, :scope > ds-table-cell'));
      const cellsHtml = cells.map((cell) => this._renderHeaderCell(cell)).join('');
      return `<tr class="ds-table__row">${cellsHtml}</tr>`;
    }).join('');
  }

  _renderBodyRows(rows) {
    return rows.map((row) => {
      const selected = row.hasAttribute('selected');
      const rowClass = selected ? 'ds-table__row ds-table__row--selected' : 'ds-table__row';
      const cells = Array.from(row.querySelectorAll(':scope > ds-table-cell, :scope > ds-table-head'));
      const cellsHtml = cells.map((cell) => this._renderBodyCell(cell)).join('');

      return `<tr class="${rowClass}">${cellsHtml}</tr>`;
    }).join('');
  }

  _renderFooterRows(rows) {
    return rows.map((row) => {
      const selected = row.hasAttribute('selected');
      const rowClass = selected ? 'ds-table__row ds-table__row--selected' : 'ds-table__row';
      const cells = Array.from(row.querySelectorAll(':scope > ds-table-cell, :scope > ds-table-head'));
      const cellsHtml = cells.map((cell) => this._renderBodyCell(cell)).join('');

      return `<tr class="${rowClass}">${cellsHtml}</tr>`;
    }).join('');
  }

  get template() {
    const headerRows = this._collectHeaderRows();
    const bodyRows = this._collectBodyRows();
    const footerRows = this._collectFooterRows();
    const classes = `ds-table ds-table--size-${this.size}`;
    const containerStyle = this.hasAttribute('sticky-header') && this.maxHeight
      ? ` style="max-height: ${escapeAttribute(this.maxHeight)};"`
      : '';
    const theadHtml = headerRows.length > 0
      ? `<thead class="ds-table__head">${this._renderHeaderRows(headerRows)}</thead>`
      : '';
    const tfootHtml = footerRows.length > 0
      ? `<tfoot class="ds-table__foot">${this._renderFooterRows(footerRows)}</tfoot>`
      : '';

    return `
      <div class="ds-table__container"${containerStyle}>
        <table class="${classes}">
          ${theadHtml}
          <tbody class="ds-table__body">
            ${this._renderBodyRows(bodyRows)}
          </tbody>
          ${tfootHtml}
        </table>
      </div>
    `;
  }
}

customElements.define('ds-table', DSTable);

export {
  DSTableRow,
  DSTableCell,
  DSTableHead,
  DSTableHeaderGroup,
  DSTableRowGroup,
  DSTableFooter,
};
