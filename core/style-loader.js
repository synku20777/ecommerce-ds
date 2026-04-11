// ═══════════════════════════════════════════════════════════
// Style Loader — Constructable Stylesheets Utility
//
// Optional progressive enhancement for loading CSS into
// Shadow DOM using the adoptedStyleSheets API.
// Caches fetched stylesheets to avoid duplicate requests.
//
// Usage:
//   import { loadStyles } from '../core/style-loader.js';
//   const sheet = await loadStyles('/dist/ds-button.css');
//   this.shadowRoot.adoptedStyleSheets = [sheet];
// ═══════════════════════════════════════════════════════════

const styleCache = new Map();

/**
 * Fetches a CSS file and returns a CSSStyleSheet object.
 * Results are cached so each file is fetched only once.
 *
 * @param {string} cssPath - Path to the compiled CSS file
 * @returns {Promise<CSSStyleSheet>} The constructed stylesheet
 */
export async function loadStyles(cssPath) {
  if (styleCache.has(cssPath)) {
    return styleCache.get(cssPath);
  }

  const response = await fetch(cssPath);
  if (!response.ok) {
    throw new Error(`Failed to load stylesheet: ${cssPath} (${response.status})`);
  }

  const cssText = await response.text();
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(cssText);

  styleCache.set(cssPath, sheet);
  return sheet;
}

/**
 * Loads multiple CSS files and returns an array of CSSStyleSheet objects.
 *
 * @param {string[]} cssPaths - Paths to compiled CSS files
 * @returns {Promise<CSSStyleSheet[]>} Array of constructed stylesheets
 */
export async function loadMultipleStyles(cssPaths) {
  return Promise.all(cssPaths.map(loadStyles));
}

/**
 * Clears the style cache. Useful for hot-reload scenarios.
 */
export function clearStyleCache() {
  styleCache.clear();
}
