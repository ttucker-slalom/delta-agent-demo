/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Delta.com SkyMiles Partners & Offers section breaks + metadata.
 *
 * The skymiles-partners template defines 5 sections:
 *   intro, tabs, sync-cta, terms  (style: null)
 *   next-pager                    (style: "grey")
 *
 * Inserts a section break (<hr>) before every section except the first (→ 4
 * breaks), and a "Section Metadata" block for every section that carries a
 * style (→ 1 block, for the grey next-pager).
 *
 * Follows the reference implementation exactly: breaks are inserted in
 * beforeTransform (while every section element still exists, before block
 * parsers replace them via element.replaceWith), using a temporary marker
 * attribute on the <hr> so the styled section's metadata can be anchored in
 * afterTransform even after its original element has been replaced by a parsed
 * block. Sections are processed in reverse so live-element inserts never
 * disturb not-yet-processed sections.
 *
 * Section selectors come from page-templates.json (DOM-verified during page
 * analysis) and are stored as arrays there, so we normalize to the first entry.
 */
const SECTION_MARKER_ATTR = 'data-excat-section-id';

function sectionSelector(section) {
  const sel = section.selector;
  return Array.isArray(sel) ? sel[0] : sel;
}

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break, no metadata
      const selector = sectionSelector(section);
      if (!selector) continue;
      const sectionEl = element.querySelector(selector);
      if (!sectionEl) continue; // selector didn't match on this page — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers have now run and may have replaced section elements. Anchor each
    // styled section's Section Metadata block to whichever still exists: the
    // marker <hr> placed above, or (first section) the original element itself.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || element.querySelector(sectionSelector(section));
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
