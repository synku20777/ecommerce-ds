// ds-breadcrumb-item - Data-holder child element (no Shadow DOM)
//
// Attributes: href | icon | current | collapsed | dropdown
// Used by <ds-breadcrumb> parent to build its shadow template.

const VALID_ICONS = ['home', 'folder', 'document'];

const normalizeToken = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/\s+/g, '-');

class DSBreadcrumbItem extends HTMLElement {
  static get observedAttributes() {
    return ['href', 'icon', 'current', 'collapsed', 'dropdown'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.dispatchEvent(new CustomEvent('ds-breadcrumb-item-change', {
        bubbles: true,
        composed: true,
      }));
    }
  }

  get href() {
    return this.getAttribute('href') || '';
  }

  get icon() {
    const icon = normalizeToken(this.getAttribute('icon'));
    return VALID_ICONS.includes(icon) ? icon : '';
  }

  get current() {
    return this.hasAttribute('current');
  }

  get collapsed() {
    return this.hasAttribute('collapsed');
  }

  get dropdown() {
    return this.hasAttribute('dropdown');
  }

  get label() {
    return this.textContent?.trim() || '';
  }
}

customElements.define('ds-breadcrumb-item', DSBreadcrumbItem);

export { DSBreadcrumbItem };
