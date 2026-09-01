/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-cta.
 * Base block: columns (multi-column; first row block name, subsequent rows are columns).
 * Source: https://www.delta.com/us/en/skymiles/how-to-earn-miles/skymiles-partners-offers
 * Generated: 2026-09-01
 *
 * "Delta Sync Partners" promo. 2-column single row:
 *   Left  = eyebrow (h4) + descriptive paragraph.
 *   Right = a CTA button ("Explore All").
 */
export default function parse(element, { document }) {
  // Left content lives in the intro/introcomponent column; right is the CTA button column.
  const textCol = element.querySelector('.introcomponent, .section-cta-container > div:not(.section-cta-btn)');
  const ctaCol = element.querySelector('.section-cta-btn');

  // --- Left cell: eyebrow + copy ---
  const leftCell = [];
  const eyebrow = element.querySelector('.introcomponent .h4, .introcomponent h1, .introcomponent h2, span.h4');
  if (eyebrow) {
    // Promote the visual eyebrow to a real heading so it is preserved semantically.
    const h = document.createElement('h3');
    h.textContent = eyebrow.textContent.trim();
    leftCell.push(h);
  }
  const paras = Array.from((textCol || element).querySelectorAll('p'));
  paras.forEach((p) => {
    if (p.textContent.trim()) leftCell.push(p);
  });

  // --- Right cell: CTA link ---
  // Preserve the original anchor (cloned) so all text — including sr-only
  // accessibility copy like ", opens in new window" — is retained.
  const rightCell = [];
  const cta = (ctaCol || element).querySelector('a.btn, a.btn-secondary-cta, a[class*="btn"], a');
  if (cta) {
    const link = cta.cloneNode(true);
    // Drop only the empty decorative image placeholder (no text content).
    link.querySelectorAll('.cutout-external-image').forEach((n) => n.remove());
    rightCell.push(link);
  }

  // Empty-block guard.
  if (leftCell.length === 0 && rightCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[leftCell, rightCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-cta', cells });
  element.replaceWith(block);
}
