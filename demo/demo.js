document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const themeToggleMobile = document.getElementById('theme-toggle-mobile');
  const menuToggle = document.getElementById('menu-toggle');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('site-sidebar');
  const siteLayout = document.querySelector('.site-layout');
  const menuBackdrop = document.getElementById('site-menu-backdrop');
  const productGrid = document.getElementById('product-grid-specimen');
  const productGridControls = document.querySelectorAll('[data-product-grid-control]');
  const productGridCurtainButton = document.querySelector('.product-grid-curtain-button');
  const productGridCurtainBackdrop = productGrid?.querySelector('.product-grid-curtain-backdrop');
  const productGridCloseButtons = productGrid?.querySelectorAll('[data-product-grid-close]');
  const html = document.documentElement;

  // ── Theme ─────────────────────────────────────────────────────

  const savedTheme = localStorage.getItem('ds-theme') || 'light';
  html.setAttribute('data-theme', savedTheme);
  updateThemeButton(savedTheme);

  themeToggle?.addEventListener('click', toggleTheme);
  themeToggleMobile?.addEventListener('click', toggleTheme);

  function toggleTheme() {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('ds-theme', next);
    updateThemeButton(next);
  }

  function updateThemeButton(theme) {
    const label = theme === 'dark' ? 'Switch to Light' : 'Switch to Dark';
    if (themeToggle) themeToggle.textContent = label;
    if (themeToggleMobile) themeToggleMobile.textContent = label;
  }

  // ── Radius preset ─────────────────────────────────────────────

  const RADIUS_PRESETS = {
    none:   '0rem',
    small:  '0.25rem',
    medium: '0.625rem',
    large:  '1rem',
  };

  const savedRadius = localStorage.getItem('ds-radius') || 'medium';
  applyRadius(savedRadius);

  document.querySelectorAll('.radius-toggle__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      applyRadius(preset);
      localStorage.setItem('ds-radius', preset);
    });
  });

  function applyRadius(preset) {
    const value = RADIUS_PRESETS[preset] ?? RADIUS_PRESETS.medium;
    html.style.setProperty('--radius', value);
    document.querySelectorAll('.radius-toggle__btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.preset === preset);
    });
    const label = document.getElementById('radius-base-label');
    if (label) label.textContent = `${value} base`;
  }

  // ── Sidebar collapse (desktop) ────────────────────────────────

  const savedCollapsed = localStorage.getItem('ds-sidebar-collapsed') === 'true';
  setSidebarCollapsed(savedCollapsed);

  sidebarToggle?.addEventListener('click', () => {
    const isCollapsed = siteLayout?.getAttribute('data-sidebar-collapsed') === 'true';
    setSidebarCollapsed(!isCollapsed);
  });

  function setSidebarCollapsed(collapsed) {
    if (!siteLayout || !sidebarToggle) return;
    siteLayout.setAttribute('data-sidebar-collapsed', String(collapsed));
    sidebarToggle.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
    sidebarToggle.setAttribute('title', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
    localStorage.setItem('ds-sidebar-collapsed', String(collapsed));
  }

  // ── Sidebar drawer (mobile) ───────────────────────────────────

  menuToggle?.addEventListener('click', () => {
    const isOpen = sidebar?.getAttribute('data-open') === 'true';
    setMenuOpen(!isOpen);
  });

  menuBackdrop?.addEventListener('click', () => {
    setMenuOpen(false);
  });

  sidebar?.addEventListener('click', (event) => {
    if (event.target.closest('a') && window.innerWidth <= 900) {
      setMenuOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenuOpen(false);
      setProductGridCurtainOpen(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      setMenuOpen(false);
      sidebar?.removeAttribute('data-open');
    }
  });

  function setMenuOpen(isOpen) {
    if (!sidebar || !menuToggle) return;
    sidebar.setAttribute('data-open', String(isOpen));
    if (menuBackdrop) menuBackdrop.hidden = !isOpen;
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    document.body.classList.toggle('menu-open', isOpen);
  }

  // ── Active section highlighting ───────────────────────────────

  // Product Grid layout specimen

  if (productGrid) {
    productGridControls.forEach(control => {
      updateProductGridControl(control);
      control.addEventListener('change', () => updateProductGridControl(control));
    });

    productGridCurtainButton?.addEventListener('click', () => {
      const isOpen = productGrid.getAttribute('data-curtain-open') === 'true';
      setProductGridCurtainOpen(!isOpen);
    });

    productGridCloseButtons?.forEach(button => {
      button.addEventListener('click', () => setProductGridCurtainOpen(false));
    });
  }

  function updateProductGridControl(control) {
    if (!productGrid) return;

    const name = control.dataset.productGridControl;

    if (name === 'maxWidth') {
      productGrid.style.setProperty('--demo-product-grid-max-width', control.value);
    }

    if (name === 'margin') {
      productGrid.style.setProperty('--demo-product-grid-margin', control.value);
    }

    if (name === 'columns') {
      productGrid.style.setProperty('--demo-product-grid-columns', control.value);
      productGrid.setAttribute('data-columns', control.value);
    }

    if (name === 'filterPosition') {
      productGrid.setAttribute('data-filter-position', control.value);
      setProductGridCurtainOpen(false);
    }

    if (name === 'filtersEnabled') {
      productGrid.setAttribute('data-filters-enabled', String(control.checked));
      if (!control.checked) {
        setProductGridCurtainOpen(false);
      }
    }
  }

  function setProductGridCurtainOpen(isOpen) {
    if (!productGrid) return;

    const canOpen = productGrid.getAttribute('data-filter-position') === 'curtain'
      && productGrid.getAttribute('data-filters-enabled') === 'true';
    const shouldOpen = Boolean(isOpen && canOpen);

    productGrid.setAttribute('data-curtain-open', String(shouldOpen));
    productGridCurtainButton?.setAttribute('aria-expanded', String(shouldOpen));
    if (productGridCurtainBackdrop) {
      productGridCurtainBackdrop.hidden = !shouldOpen;
    }
  }

  const sections = document.querySelectorAll('.doc-section');
  const navLinks = sidebar?.querySelectorAll('.site-sidebar__nav a');

  if (sections.length && navLinks?.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => link.classList.remove('active'));
          const activeLink = sidebar.querySelector(`.site-sidebar__nav a[href="#${entry.target.id}"]`);
          activeLink?.classList.add('active');
        }
      });
    }, { rootMargin: '-15% 0px -70% 0px' });

    sections.forEach(section => observer.observe(section));
    document.querySelectorAll('.component-block[id]').forEach(block => observer.observe(block));
  }

  // ── Component event handlers ──────────────────────────────────

  document.addEventListener('ds-remove', (event) => {
    const chip = event.target;
    chip.style.opacity = '0';
    chip.style.transform = 'scale(0.8)';
    setTimeout(() => {
      chip.style.display = 'none';
    }, 200);
  });

  document.addEventListener('ds-change', (event) => {
    console.log('[ds-change]', event.detail);
  });

  document.addEventListener('ds-input', () => {
    // Keep the live demo responsive without noisy input logging.
  });
});
