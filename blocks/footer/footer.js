// Delta News Hub footer: three related-content columns (More in SkyMiles /
// Most Recent / Most Popular) with thumbnail links, plus a copyright line.
// Content is authored in content/footer.plain.html; this module only reads
// that DOM and assigns layout classes — it never invents copy.

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // Metadata-independent dual-fetch: /content first (localhost), then root (DA/EDS prod).
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return;
  const html = await resp.text();

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
