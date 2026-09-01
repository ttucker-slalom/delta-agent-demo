// Header block. Two page-scoped layouts share one block:
//  - Default (Delta News Hub): fixed utility navbar + click-triggered offcanvas
//    side nav. Fragment sections: [utility links, brand, main nav, secondary].
//  - Partners (body.partners): delta.com-style single-row bar — left logo +
//    inline nav groups + Sign Up / Log in / notification / search on the right,
//    collapsing to a hamburger + offcanvas on mobile. Fragment sections:
//    [brand, primary nav, secondary nav, account links].
// Content is authored in the nav fragment; this module only reads it and wires
// up behavior — it never invents copy.

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

// Read the per-page nav fragment path from the `nav` metadata, if present, so a
// page can opt into its own header without affecting others.
function getNavMeta() {
  const meta = document.head.querySelector('meta[name="nav"]');
  const val = meta && meta.content ? meta.content.trim() : '';
  return val || null;
}

async function fetchNav() {
  const candidates = [];
  const navMeta = getNavMeta();
  if (navMeta) {
    const base = navMeta.replace(/\.plain\.html$/, '').replace(/^\//, '');
    candidates.push(`/${base}.plain.html`);
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

// Reduce a brand section to just its logo link (drop the fallback text label).
function normalizeBrand(brand) {
  if (!brand) return;
  const brandLink = brand.querySelector('a');
  const img = brandLink && brandLink.querySelector('img');
  if (brandLink && img) {
    brandLink.textContent = '';
    brandLink.append(img);
  }
}

/* ---------------------------------------------------------------------------
 * Delta News Hub layout (default)
 * ------------------------------------------------------------------------- */
function decorateNewsHub(nav) {
  const [utility, brand, sections, secondary] = nav.children;
  if (utility) utility.classList.add('nav-utility');
  if (brand) brand.classList.add('nav-brand');
  if (sections) sections.classList.add('nav-sections');
  if (secondary) secondary.classList.add('nav-secondary');

  normalizeBrand(brand);

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

  const utilityLinks = utility ? utility.querySelectorAll('p') : [];
  const utilLeft = utilityLinks[0] || null;
  const utilRight = utilityLinks[1] || null;

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

  const leftStack = document.createElement('div');
  leftStack.className = 'nav-left';
  if (utilLeft) leftStack.append(utilLeft);
  leftStack.append(menuButton);

  const rightStack = document.createElement('div');
  rightStack.className = 'nav-right';
  if (utilRight) rightStack.append(utilRight);
  rightStack.append(searchButton);

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
  isDesktop.addEventListener('change', () => closeOffcanvas(nav));
}

/* ---------------------------------------------------------------------------
 * Partners layout (delta.com desktop global nav)
 * ------------------------------------------------------------------------- */
function decoratePartners(nav) {
  // Fragment sections: [brand, primary nav, secondary nav, account links].
  const [brand, primary, secondary, account] = nav.children;
  if (brand) brand.classList.add('nav-brand');
  if (primary) primary.classList.add('nav-primary');
  if (secondary) secondary.classList.add('nav-secondary');
  if (account) account.classList.add('nav-account');

  normalizeBrand(brand);

  // Turn the account links (Sign Up / Log in) into the right-side action group.
  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  if (account) {
    const links = [...account.querySelectorAll('a')];
    links.forEach((a, i) => {
      const label = a.textContent.trim();
      // The second action ("Log in") renders as the solid red button.
      if (/log ?in/i.test(label) || (i === links.length - 1 && links.length > 1)) {
        a.classList.add('nav-login');
      } else {
        a.classList.add('nav-signup');
      }
      tools.append(a);
    });
    account.remove();
  }

  // Notification + search icon buttons (behavioral controls, built here).
  const bell = document.createElement('button');
  bell.type = 'button';
  bell.className = 'nav-bell';
  bell.setAttribute('aria-label', 'Notifications');
  bell.innerHTML = '<span class="nav-bell-badge">3</span>';

  const searchButton = document.createElement('button');
  searchButton.type = 'button';
  searchButton.className = 'nav-search-toggle';
  searchButton.setAttribute('aria-label', 'Search');
  tools.append(bell, searchButton);

  // Hamburger for mobile — opens an offcanvas holding the nav groups.
  const menuButton = document.createElement('button');
  menuButton.type = 'button';
  menuButton.className = 'nav-menu-toggle';
  menuButton.setAttribute('aria-controls', 'nav');
  menuButton.setAttribute('aria-label', 'Menu');
  menuButton.innerHTML = '<span class="nav-menu-icon"></span>';

  // Desktop bar: logo + inline nav groups + tools.
  const bar = document.createElement('div');
  bar.className = 'nav-bar';
  bar.append(menuButton);
  if (brand) bar.append(brand);
  const groups = document.createElement('div');
  groups.className = 'nav-groups';
  if (primary) groups.append(primary);
  if (secondary) groups.append(secondary);
  bar.append(groups);
  bar.append(tools);

  // Offcanvas panel (mobile) reuses the same nav groups by reference; on desktop
  // the groups live inline in the bar (CSS controls which is visible).
  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';

  nav.append(bar, backdrop);

  menuButton.addEventListener('click', () => toggleOffcanvas(nav));
  backdrop.addEventListener('click', () => closeOffcanvas(nav));
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') closeOffcanvas(nav);
  });
  isDesktop.addEventListener('change', () => closeOffcanvas(nav));
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
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

  if (document.body.classList.contains('partners')) {
    nav.classList.add('nav-partners-layout');
    decoratePartners(nav);
  } else {
    decorateNewsHub(nav);
  }

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
