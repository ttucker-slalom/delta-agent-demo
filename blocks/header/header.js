// Delta News Hub header: fixed utility navbar + click-triggered offcanvas side nav.
// Content is authored in content/nav.plain.html (utility links, brand/logo, main
// nav with accordion groups, and secondary Languages / Delta Sites lists). This
// module only reads that DOM and wires up behavior — it never invents copy.

const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOffcanvas(nav) {
  nav.setAttribute('aria-expanded', 'false');
  document.body.style.overflowY = '';
}

function openOffcanvas(nav) {
  nav.setAttribute('aria-expanded', 'true');
  document.body.style.overflowY = 'hidden';
}

function toggleOffcanvas(nav) {
  const expanded = nav.getAttribute('aria-expanded') === 'true';
  if (expanded) closeOffcanvas(nav);
  else openOffcanvas(nav);
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Load the nav fragment. Metadata-independent dual-fetch:
  // /content first (localhost / aem up), then root (DA/EDS production).
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return;
  const html = await resp.text();

  const fragment = document.createElement('div');
  fragment.innerHTML = html;

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Assign section roles: [0] utility links, [1] brand/logo, [2] main nav, [3] secondary
  const [utility, brand, sections, secondary] = nav.children;
  if (utility) utility.classList.add('nav-utility');
  if (brand) brand.classList.add('nav-brand');
  if (sections) sections.classList.add('nav-sections');
  if (secondary) secondary.classList.add('nav-secondary');

  // Strip the visible logo text — the SVG is the wordmark
  if (brand) {
    const brandLink = brand.querySelector('a');
    if (brandLink) {
      const img = brandLink.querySelector('img');
      if (img) {
        brandLink.textContent = '';
        brandLink.append(img);
      }
    }
  }

  // Mark accordion groups (nav items that contain a sub-list)
  if (sections) {
    sections.querySelectorAll(':scope > ul > li').forEach((li) => {
      if (li.querySelector('ul')) {
        li.classList.add('nav-drop');
        li.setAttribute('aria-expanded', 'false');
        const label = li.querySelector(':scope > a');
        if (label) {
          const toggle = document.createElement('button');
          toggle.type = 'button';
          toggle.className = 'nav-drop-toggle';
          toggle.setAttribute('aria-label', `Toggle ${label.textContent.trim()}`);
          li.insertBefore(toggle, li.querySelector('ul'));
          toggle.addEventListener('click', () => {
            const expanded = li.getAttribute('aria-expanded') === 'true';
            li.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          });
        }
      }
    });
  }

  // Build the top utility bar: brand + utility links + Menu/Search buttons
  const bar = document.createElement('div');
  bar.className = 'nav-bar';

  const menuButton = document.createElement('button');
  menuButton.type = 'button';
  menuButton.className = 'nav-menu-toggle';
  menuButton.setAttribute('aria-controls', 'nav');
  menuButton.setAttribute('aria-label', 'Menu');
  menuButton.innerHTML = '<span class="nav-menu-icon"></span>Menu';

  const searchButton = document.createElement('button');
  searchButton.type = 'button';
  searchButton.className = 'nav-search-toggle';
  searchButton.setAttribute('aria-label', 'Search');

  // The offcanvas panel wraps main nav + secondary lists behind the Menu button.
  const panel = document.createElement('div');
  panel.className = 'nav-panel';
  const panelHeader = document.createElement('div');
  panelHeader.className = 'nav-panel-header';
  panelHeader.innerHTML = '<span>Site navigation</span>';
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'nav-panel-close';
  closeButton.setAttribute('aria-label', 'Close');
  panelHeader.append(closeButton);
  panel.append(panelHeader);
  if (sections) panel.append(sections);
  if (secondary) panel.append(secondary);

  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';

  // Assemble the bar: utility links on the left, brand centered, tools on the right
  if (utility) bar.append(utility);
  if (brand) bar.append(brand);
  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  tools.append(menuButton, searchButton);
  bar.append(tools);

  nav.append(bar, panel, backdrop);

  menuButton.addEventListener('click', () => toggleOffcanvas(nav));
  closeButton.addEventListener('click', () => closeOffcanvas(nav));
  backdrop.addEventListener('click', () => closeOffcanvas(nav));
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') closeOffcanvas(nav);
  });

  // Close the panel when switching to desktop width to avoid a stuck-open state
  isDesktop.addEventListener('change', () => closeOffcanvas(nav));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
