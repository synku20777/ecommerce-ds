---
name: Project conventions — ecommerce-ds
description: How this design system repo is structured, how to add components, token architecture, build flow, and demo patterns
type: project
---

### Project conventions — ecommerce-ds (React + Astro)
description: A comprehensive guide on how this design system repository is structured, the philosophy behind the stack, token architecture, component creation workflows, and documentation patterns for the migrated architecture.
type: project

### Stack & Architectural Philosophy

Our design system leverages a modern, performance-first stack. By combining Astro's static generation with React's component model, we get the best of both worlds: excellent developer experience and zero-overhead performance for end users.

Astro → Serves as the primary host, router, and static site generator (SSG) for our documentation and demo environment.

Why: Astro provides a zero-JS baseline. Using its "Islands Architecture," we only hydrate components that actually need JavaScript.

React → Used for declarative component composition and state management.

Why: React provides a robust ecosystem for managing complex UI state (like complex data tables, focus trapping in dialogs, and interactive menus) while allowing us to build a highly reusable API.

TypeScript → Strict type-safety enforced for all component props, state, and base types.

Why: It acts as our first layer of documentation and prevents runtime errors by ensuring developers pass the correct variants, sizes, and data types.

SCSS → Compiled via Astro/Vite and scoped tightly to BEM classes.

Why: We intentionally avoid CSS-in-JS or Shadow DOM to ensure our styles remain portable, easily cacheable, and leverage the natural CSS cascade through our strict tiered token system.

Static demo → Served locally via the Astro dev server (npm run dev) or built into a static output directory for production deployment.

### Token Architecture (3-tier, strict)

Our styling relies on a highly disciplined, three-tier token architecture. This ensures that global brand changes are simple, dark mode is practically automatic, and individual components can be customized without breaking the rest of the system.

## Tier 0 — Raw Primitives (src/styles/tokens/_tier0-*.scss)

SCSS $variables only. This tier outputs absolutely no CSS to the final bundle. These are your raw, brand-agnostic scales (the "DNA" of the design system).

Role: Define the absolute values allowed in the system.

Examples: $blue-500: #0ea5e9;, $spacing-4: 1rem;, $font-weight-bold: 700;

Files: _tier0-colors, _tier0-typography, _tier0-space, _tier0-shadows, _tier0-breakpoints

## Tier 1 — Semantic / Theming (src/styles/tokens/_tier1-semantic.scss, _tier1-dark.scss)

CSS custom properties (--var) applied to the :root selector. This tier maps meaningless primitive colors to meaningful semantic roles.

Role: Enables light/dark mode and global theming.

Examples: --color-bg-primary: #{$white};, --color-text-danger: #{$red-600};

Dark Mode: Handled via overrides in _tier1-dark.scss targeting [data-theme="dark"] :root. Because components only consume Tier 2 and Tier 1, switching the theme instantly updates all components.

## Tier 2 — Component-Scoped (src/styles/tokens/_tier2-{component}.scss)

CSS custom properties specific to a single component, mapped from Tier 1.

Role: Acts as the public styling API for a component. If a consumer needs to override a specific button's background, they target --ds-button-bg, not the global Tier 1 token.

Rule: Components reference these directly via BEM classes (e.g., .ds-button { background: var(--ds-button-bg); }). Never reference Tier 1 directly from within component CSS.

Adding a Component: Step-by-Step

Creating a new component requires adherence to a strict workflow to ensure consistency across the design system.

### Location & Structure:

Create a dedicated folder: src/components/{ComponentName}/.

Include the main component file ({ComponentName}.tsx), an index file for clean exporting (index.ts), and its specific styles if necessary.

Example: src/components/Button/Button.tsx

### Interface & Prop Design:

Export a functional React component.

Define a strictly typed Props interface that extends the global BaseProps interface (which should include standard HTML attributes).

Document every prop using JSDoc comments (/** ... */) so IntelliSense can pick them up.

### Styling & BEM Implementation:

Use standard BEM classes instead of native HTML element tags to prevent styling bleed.

Use a classNames() utility to gracefully merge incoming className props from the consumer with your internal structural classes.

Crucial: Do not use :host or Shadow DOM selectors. We rely entirely on class specificity.

### State, Events, & Accessibility (a11y):

Use standard React hooks (useState, useEffect) for internal logic.

Prefer controlled components (state managed by the parent via value and onChange) but support uncontrolled usage where sensible.

Accessibility: Ensure proper ARIA attributes are applied dynamically. For interactive elements without native equivalents, manage tabIndex, aria-expanded, and keyboard events (like listening for Enter or Space).

### Type Standardization:

Ensure polymorphic or standardized props are used across the board.

Examples: Always use isDisabled (boolean) instead of disabled, isOpen instead of visible, and standardize how children and icon props are handled.

### Token Integration:

Define your component's variables in _tier2-{component}.scss.

Add the new tier 2 token file to the import list in src/styles/global.scss to ensure it is bundled.

Documentation & Demo:

Add the component to src/pages/index.astro (or its specific docs page).

Show multiple variants (primary, secondary, disabled states).

Hydration Rule: Use Astro's client:load directive only if the component requires JS interactivity (e.g., Accordions, Dialogs, Tabs). Static components (Buttons, Badges, Cards) must render as zero-JS HTML by omitting the client directive.

### Naming Conventions

Strict naming conventions keep the codebase predictable and easy to search.

React Components: PascalCase (e.g., Accordion, Button, BreadcrumbItem).

React Props: CamelCase. Prefix booleans with is, has, or should (e.g., isLoading, hasIcon). Prefix event handlers with on (e.g., onClick, onToggle).

Files: PascalCase for React component files (Button.tsx), kebab-case for styling/tokens (_tier2-button.scss).

BEM Architecture: .ds-{component}__element--modifier

Block: .ds-breadcrumb

Element: .ds-breadcrumb__item

Modifier: .ds-breadcrumb--pill

SCSS partial files: _name.scss (Use a leading underscore, but import them without it via @use 'name').

## Key Token Names (Tier 1 Reference)

When defining Tier 2 component variables, always map them to these standard Tier 1 semantic tokens.

# Colors (Backgrounds): * --color-bg-page (main body background)

--color-bg-surface (cards, sidebars, standard containers)

--color-bg-raised / --color-bg-sunken (modals / well areas)

--color-bg-accent, --color-bg-accent-hover, --color-bg-accent-subtle (primary brand colors)

# Colors (Text & Typography): * --color-text-primary, --color-text-secondary, --color-text-tertiary

--color-text-disabled, --color-text-on-accent, --color-text-accent

# Colors (Borders & Dividers): * --color-border-subtle, --color-border-default, --color-border-strong

--color-border-focus (accessibility focus rings), --color-border-accent

# Spacing (Margin & Padding): * --space-{xxs|xs|sm|md|lg|xl|xxl}

# Typography: * --type-body-{s|m|l}, --type-label-{s|m}

--type-weight-{regular|medium|semibold|bold}

--font-family-base, --font-family-mono

# Structure & Interactivity: * --radius-{sm|md|lg|full}

--transition-fast, --transition-default, --transition-slow

--focus-ring (Standardized box-shadow for focus states)