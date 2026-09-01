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
// Read the per-page nav fragment path from the `nav` metadata, if present, so a
// page can opt into its own header (e.g. theme-scoped) without affecting others.
function getNavMeta() {
  const meta = document.head.querySelector('meta[name="nav"]');
  const val = meta && meta.content ? meta.content.trim() : '';
  return val || null;
}

async function fetchNav() {
  // If the page declares a nav fragment, try it first (both /content and root),
  // then fall back to the default Delta nav fragment.
  const candidates = [];
  const navMeta = getNavMeta();
  if (navMeta) {
    const base = navMeta.replace(/\.plain\.html$/, '').replace(/^\//, '');
    candidates.push(`/${base}.plain.html`);
    // navMeta may already be /content-prefixed; also try a root variant
    candidates.push(`/${base.replace(/^content\//, '')}.plain.html`);
  }
  candidates.push('/content/nav.plain.html', '/nav.plain.html');
  for (let i = 0; i < candidates.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const r = await fetch(candidates[i]);
    if (r.ok) return r.text();
  }
  return null;
}

export default async function decorate(block) {
  const html = await fetchNav();
  if (html === null) return;

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

  // Build the top utility bar. Source layout: each side is a two-row stack —
  // a utility link on top and an icon control below — flanking a large centered
  // logo. Left = "Sign up" + hamburger; right = "Visit delta.com" + search.
  const bar = document.createElement('div');
  bar.className = 'nav-bar';

  const menuButton = document.createElement('button');
  menuButton.type = 'button';
  menuButton.className = 'nav-menu-toggle';
  menuButton.setAttribute('aria-controls', 'nav');
  menuButton.setAttribute('aria-label', 'Menu');
  menuButton.innerHTML = '<span class="nav-menu-icon"></span>';

  const searchButton = document.createElement('button');
  searchButton.type = 'button';
  searchButton.className = 'nav-search-toggle';
  searchButton.setAttribute('aria-label', 'Search');

  // Split the two utility links: first stays left, second moves right.
  const utilityLinks = utility ? utility.querySelectorAll('p') : [];
  const utilLeft = utilityLinks[0] || null;
  const utilRight = utilityLinks[1] || null;

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

  // Left stack: "Sign up" link on top, hamburger below.
  const leftStack = document.createElement('div');
  leftStack.className = 'nav-left';
  if (utilLeft) leftStack.append(utilLeft);
  leftStack.append(menuButton);

  // Right stack: "Visit delta.com" link on top, search icon below.
  const rightStack = document.createElement('div');
  rightStack.className = 'nav-right';
  if (utilRight) rightStack.append(utilRight);
  rightStack.append(searchButton);

  // The now-empty original utility container is discarded.
  if (utility) utility.remove();

  bar.append(leftStack);
  if (brand) bar.append(brand);
  bar.append(rightStack);

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
