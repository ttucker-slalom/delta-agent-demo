// Delta News Hub footer: three related-content columns (More in SkyMiles /
// Most Recent / Most Popular) with thumbnail links, plus a copyright line.
// Content is authored in content/footer.plain.html; this module only reads
// that DOM and assigns layout classes — it never invents copy.

// Read the per-page footer fragment path from the `footer` metadata, if present,
// so a page can opt into its own footer without affecting other pages.
function getFooterMeta() {
  const meta = document.head.querySelector('meta[name="footer"]');
  const val = meta && meta.content ? meta.content.trim() : '';
  return val || null;
}

async function fetchFooter() {
  const candidates = [];
  const footerMeta = getFooterMeta();
  if (footerMeta) {
    const base = footerMeta.replace(/\.plain\.html$/, '').replace(/^\//, '');
    candidates.push(`/${base}.plain.html`);
    candidates.push(`/${base.replace(/^content\//, '')}.plain.html`);
  }
  candidates.push('/content/footer.plain.html', '/footer.plain.html');
  for (let i = 0; i < candidates.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const r = await fetch(candidates[i]);
    if (r.ok) return r.text();
  }
  return null;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const html = await fetchFooter();
  if (html === null) return;

  const fragment = document.createElement('div');
  fragment.innerHTML = html;

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-inner';
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // The last section is the copyright line; the rest are link columns.
  const sections = [...footer.children];
  const copyright = sections[sections.length - 1];
  const columns = sections.slice(0, -1);

  const columnsWrap = document.createElement('div');
  columnsWrap.className = 'footer-columns';
  columns.forEach((col) => {
    col.classList.add('footer-column');
    columnsWrap.append(col);
  });

  if (copyright) copyright.classList.add('footer-legal');

  footer.textContent = '';
  footer.append(columnsWrap);
  if (copyright) footer.append(copyright);

  block.append(footer);
}
