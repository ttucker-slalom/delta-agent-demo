/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-partners.
 * Base block: tabs (2-column: [tab label | tab content]).
 * Source: https://www.delta.com/us/en/skymiles/how-to-earn-miles/skymiles-partners-offers
 * Generated: 2026-09-01
 *
 * COMPOUND block: a tabbed partner-offers browser. Five icon+label tabs
 * (Featured, Lodging, Cars, Specialty, Shop & Dine). Each tab panel is an
 * accordion of partner offers (logo + title, copy, optional QR image, CTA link,
 * nested Terms). EDS forbids block nesting, so this is flattened into a single
 * tabs-partners table: one row per tab, [label | full panel content].
 */
export default function parse(element, { document }) {
  // Tab labels live in the header list; each li has an icon image + a .subtitle label.
  const tabButtons = Array.from(
    element.querySelectorAll('ul.tabs-header-list > li.tab-btn, .tabs-header-list > li'),
  );

  // Tab panels hold the content shown when a tab is selected.
  const panels = Array.from(
    element.querySelectorAll('.content-tab-panel-container .tab-panel'),
  );

  const cells = [];

  // Cleans a cloned panel of author-preview noise so the markdown output stays tidy
  // while preserving all real content (headings, copy, images, links, terms).
  const cleanContent = (root) => {
    root
      .querySelectorAll('link, style, script, .toggle-all-faq, .sr-only, .cutout-external-image')
      .forEach((n) => n.remove());
    // Drop empty QR-caption duplicate spans that render nothing.
    root
      .querySelectorAll('span.d-inline.d-lg-none')
      .forEach((n) => {
        if (!n.textContent.trim()) n.remove();
      });
    return root;
  };

  const panelCount = Math.max(tabButtons.length, panels.length);
  for (let i = 0; i < panelCount; i += 1) {
    const btn = tabButtons[i];
    const panel = panels[i];

    // --- Tab label cell ---
    let labelText = '';
    if (btn) {
      const subtitle = btn.querySelector('.subtitle');
      labelText = (subtitle ? subtitle.textContent : btn.textContent).trim();
    }
    if (!labelText && panel) {
      // Fallback: use the panel's intro heading as the label.
      const h = panel.querySelector('.content-block h1, .content-block h2, h1, h2');
      if (h) labelText = h.textContent.trim();
    }
    const labelCell = document.createElement('p');
    labelCell.textContent = labelText || `Tab ${i + 1}`;

    // --- Tab content cell ---
    let contentCell;
    if (panel) {
      const contentRoot = panel.querySelector('.tab-panel-content') || panel;
      contentCell = cleanContent(contentRoot.cloneNode(true));
    } else {
      contentCell = document.createElement('div');
    }

    cells.push([labelCell, contentCell]);
  }

  // Empty-block guard: if we found no tabs/panels, unwrap rather than emit an empty block.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-partners', cells });
  element.replaceWith(block);
}
