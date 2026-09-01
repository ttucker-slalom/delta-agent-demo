/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-terms.
 * Base block: accordion (2-column: [title | content], one row per item).
 * Source: https://www.delta.com/us/en/skymiles/how-to-earn-miles/skymiles-partners-offers
 * Generated: 2026-09-01
 *
 * Page-level "Terms and Conditions" disclosure rendered as an expander. Each
 * expander card becomes one accordion row: summary/title cell + expanded body
 * cell. Handles both the page-level "expander-news" card and image-text cards.
 */
export default function parse(element, { document }) {
  // Each collapsible item is a .card (header + collapse panel body).
  const cards = Array.from(element.querySelectorAll('.expander-container .card, .card'));

  const cells = [];

  cards.forEach((card) => {
    const header = card.querySelector('.card-header');
    const body = card.querySelector('.panel-collapse .card-body, .card-body');
    if (!header && !body) return;

    // --- Title cell ---
    const titleCell = [];
    const titleText = card.querySelector(
      '.news-caption, .expander-title, .card-header a',
    );
    // Any logo/icon that accompanies the title (image-text cards).
    const titleImg = header ? header.querySelector('img') : null;
    if (titleImg) titleCell.push(titleImg.cloneNode(true));
    if (titleText) {
      const p = document.createElement('p');
      p.textContent = titleText.textContent.trim();
      titleCell.push(p);
    }

    // --- Content cell ---
    let contentCell;
    if (body) {
      contentCell = body.cloneNode(true);
      // Strip author-preview noise / decorative-only nodes.
      contentCell
        .querySelectorAll('link, style, script, .toggle-all-faq, .sr-only, .cutout-external-image')
        .forEach((n) => n.remove());
    } else {
      contentCell = document.createElement('div');
    }

    cells.push([titleCell, contentCell]);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-terms', cells });
  element.replaceWith(block);
}
