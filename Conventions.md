---
name: Project conventions — ecommerce-ds
description: How this design system repo is structured, how to add components, token architecture, build flow, and demo patterns
type: project
---

## Stack

- **SCSS** → compiled to `dist/` via `sass` CLI (no bundler, no JS build step)
- **Web Components** (native custom elements, Shadow DOM, no framework)
- **Static demo** served via `npx serve .` (launch.json configured for preview tool)
- **No TypeScript**

## Token Architecture (3-tier, strict)

### Tier 0 — Raw primitives (`tokens/_tier0-*.scss`)
SCSS `$variables` only. No CSS output. Brand-agnostic scales.
Files: `_tier0-colors`, `_tier0-typography`, `_tier0-space`, `_tier0-shadows`, `_tier0-breakpoints`

### Tier 1 — Semantic (`tokens/_tier1-semantic.scss`, `_tier1-dark.scss`)
CSS custom properties on `:root`. Meaningful role aliases referencing Tier 0.
Key roles: `--color-bg-*`, `--color-text-*`, `--color-border-*`, `--color-status-*`
Dark overrides in `_tier1-dark.scss` via `[data-theme="dark"] :root`.

### Tier 2 — Component-scoped (`tokens/_tier2-{component}.scss`)
CSS custom properties on `:root`. Components reference these; never Tier 1 directly from within their CSS (except in tier2 definition files which alias tier1).
Naming: `--ds-{component}-{role}` (e.g. `--ds-breadcrumb-icon-size`)
OR `--button-{variant}-{role}` for the button (legacy naming).

### Entry points
- `tokens/tokens.scss` — `@use`s all tiers → compiles to `dist/tokens.css`. **Must add every new tier2 file here manually.**
- `tokens/_index.scss` — `@forward`s everything (for component SCSS `@use 'tokens'`). Also needs updating but is less critical.

**GOTCHA:** Adding a tier2 file to `_index.scss` is NOT enough. Must also add `@use 'tier2-{component}'` to `tokens/tokens.scss` or tokens won't appear in `dist/tokens.css`.

## Base SCSS

`base/_reset.scss` — box-sizing, margin/padding reset, `:host` font/color/smoothing defaults
`base/_typography.scss` — heading/body utility classes

Components do `@use 'reset'` (via `--load-path=base`) to pull the reset into their shadow DOM stylesheet.

## Component Structure

Every component lives in `components/ds-{name}/`:
- `ds-{name}.js` — Web Component class
- `ds-{name}.scss` — Shadow DOM styles
- `ds-{name}-item.js` (compound only) — child element, no Shadow DOM

### Base class: `DSBaseComponent` (`core/base-component.js`)
- `attachShadow({ mode: 'open' })` in constructor
- `connectedCallback()` → `_injectStyles()` + `_render()` + `_setupEventListeners()`
- `_injectStyles()` — injects `<link rel="stylesheet" href="${basePath}/dist/${componentStyles}">` into shadow root once
- `_render()` — clears shadow DOM (preserving `<link>`s), sets `innerHTML` from `get template()`
- `attributeChangedCallback()` → re-renders on attr change if connected

### Subclass pattern
```js
export class DSFoo extends DSBaseComponent {
  static get observedAttributes() { return ['variant', 'size']; }
  static get componentStyles() { return 'ds-foo.css'; }
  get template() { /* build HTML string */ return `<div class="ds-foo ds-foo--${this.variant}">...</div>`; }
}
customElements.define('ds-foo', DSFoo);
```

### Compound component (parent + child items)
`ds-breadcrumb` is the only compound component so far:
- `ds-breadcrumb-item` (child): no Shadow DOM, no base class. Pure data holder. Dispatches `ds-breadcrumb-item-change` on attr change.
- `ds-breadcrumb` (parent): `MutationObserver` on light DOM watching child attrs. Debounced via `queueMicrotask`. Parent `get template()` queries `this.querySelectorAll('ds-breadcrumb-item')` and builds full shadow DOM.

### Barrel file
`components/index.js` — import all components here. Demo HTML loads this as `<script type="module">`.

## Build System

```json
"build:tokens":    "sass tokens/tokens.scss dist/tokens.css --style=expanded --no-source-map"
"build:components":"sass components/ds-{x}/ds-{x}.scss:dist/ds-{x}.css ... --load-path=tokens --load-path=base"
"build":           "build:tokens && build:components"
"watch":           "sass --watch {all source:dist pairs}"
"demo":            "npx serve ."
```

**When adding a new component:** add its `scss:dist` pair to BOTH `build:components` AND `watch` in `package.json`.

**CSS custom properties inherit into Shadow DOM** by spec — no need to re-inject tokens into shadow root. They flow through automatically.

## Demo (`demo/index.html` + `demo/demo.css`)

### Layout
- Sidebar (`<aside id="site-sidebar">`) + content (`<div class="site-content">`)
- Sidebar collapsible: `data-sidebar-collapsed="true"` on `.site-layout`. Collapsed = 56px wide, shows `data-abbr` abbreviations.
- Dark mode: `data-theme="dark"` on `<html>`.

### Sidebar nav structure
```html
<nav class="site-sidebar__nav">
  <span class="nav-group-label">Foundation</span>
  <a href="#section-id" data-abbr="Ab"><span class="nav-label">Name</span></a>
  ...
  <span class="nav-group-label">Components</span>
  ...
  <span class="nav-group-label">Layouts</span>
  ...
</nav>
```
- `data-abbr` = 2-letter code shown when sidebar collapsed (via CSS `::before` content)
- Nav links styled as ghost buttons: `border: 1px solid var(--color-border-subtle)`, transparent bg, hover fills sunken, active gets accent bg + accent border

### Section order in sidebar
Foundation → Components → Layouts → Usage

### Current components in sidebar (in order)
Button, Badge, Input, Toggle, Surface, Breadcrumb | Layout: Product Grid

### Demo component block pattern

**Regular component block** (Button, Badge, Input, Toggle, Surface, Breadcrumb):
```html
<div class="component-block {name}-doc" id="{id}">
  <div class="component-block__copy">
    <span class="specimen__label">ds-{name}</span>
    <h3>Title</h3>
    <p>Description.</p>
  </div>
  <div class="component-block__demo">
    <!-- live component variants -->
  </div>
</div>
```
→ 2-column card layout: copy left, demo right. Bordered card.

**Specimen/canvas block** (Product Grid, interactive stages):
Same HTML but add modifier class with:
```css
.your-specimen-block {
  grid-template-columns: 1fr;  /* single column */
  border: none;
  background: transparent;
}
```
→ No card chrome. Copy top, full-width demo below.

### Adding a new component to demo
1. Sidebar nav: add `<a href="#ds-{name}" data-abbr="Xx"><span class="nav-label">Name</span></a>` under correct group
2. Demo section: add `.component-block` section after the last sibling in its group
3. `demo.css`: add any modifier class needed (group headings, specimen override, etc.)
4. `demo/demo.js` IntersectionObserver already watches `.component-block[id]` — auto active state

## Naming Conventions

- **BEM**: `.ds-{component}__element--modifier`
- Component classes: `.ds-breadcrumb`, `.ds-breadcrumb__item`, `.ds-breadcrumb--pill`
- Separator/variant classes: `ds-breadcrumb--sep-chevron`, `ds-breadcrumb--default`
- SCSS partial files: `_name.scss` (leading underscore, imported without it via `@use 'name'`)

## Key Token Names (Tier 1 reference)

Colors: `--color-bg-{page|surface|raised|sunken|accent|accent-hover|accent-subtle}`
Text: `--color-text-{primary|secondary|tertiary|disabled|on-accent|accent}`
Border: `--color-border-{subtle|default|strong|focus|accent}` ← note: `--color-border-accent` may not exist; use `--color-border-focus` for accent borders
Space: `--space-{xxs|xs|sm|md|lg|xl|xxl}`
Type: `--type-body-{s|m|l}`, `--type-label-{s|m}`, `--type-weight-{regular|medium|semibold|bold}`
Radius: `--radius-{sm|md|lg|full}`
Transitions: `--transition-fast`
Focus: `--focus-ring`
Font families: `--font-family-sans`, `--font-family-mono`

## Preview Tool

`.claude/launch.json` → `npm run demo` → `npx serve .` → port 3000
`autoPort: true` needed or preview tool can't start its own process if port 3000 is taken.
The `serve` package respects `PORT` env var when no `--listen` flag is set.
