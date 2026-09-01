/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Delta.com SkyMiles Partners & Offers site-wide cleanup.
 *
 * Removes non-authorable delta.com global chrome and third-party widgets so the
 * import contains only page-level authorable content: the intro header
 * (eyebrow, H1, tagline), the tabbed partner-offers browser, the Delta Sync
 * Partners CTA, the Terms & Conditions disclosure, and the Next pager (all
 * under #maincontent plus the trailing div.nextprevsection pager).
 *
 * All selectors verified in migration-work/cleaned.html (line numbers noted).
 * NOTE: This is separate from delta-cleanup.js (Delta News Hub / news.delta.com
 * template) — the two sites have different shells and must not share a cleanup.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// The authorable page content lives under #maincontent, plus the trailing
// "Next" pager (div.nextprevsection). delta.com is an Angular MACH shell whose
// live-rendered DOM wraps everything (including #maincontent) inside header-app
// and injects skip-nav / off-screen global-nav sitemap link lists, a logo bar,
// consent/chat widgets, and a global footer around it. Rather than chase each
// chrome selector (which drifts between the static snapshot and the hydrated
// DOM), we take a KEEP-ONLY approach: collect the authorable nodes, then replace
// the whole body with just those. This is resilient to shell markup changes.
const KEEP_SELECTORS = [
  '#maincontent',
  'div.nextprevsection',
];

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.beforeTransform) return;

  const doc = (payload && payload.document) || element.ownerDocument;
  if (!doc) return;

  // Gather the authorable nodes (first match per selector, in document order).
  const keep = [];
  KEEP_SELECTORS.forEach((sel) => {
    const found = element.querySelector(sel);
    if (found && !keep.includes(found)) keep.push(found);
  });

  // If we couldn't find #maincontent (unexpected), leave the DOM as-is so the
  // parsers still get a chance rather than blanking the page.
  if (keep.length === 0) return;

  // Sort by document order so the pager stays after the main content.
  keep.sort((a, b) => {
    const pos = a.compareDocumentPosition(b);
    // eslint-disable-next-line no-bitwise
    return (pos & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
  });

  // Detach the kept nodes, clear the body, and re-append only them.
  const fragment = doc.createDocumentFragment();
  keep.forEach((node) => fragment.appendChild(node));
  element.textContent = '';
  element.appendChild(fragment);

  // Belt-and-suspenders: strip non-content leftovers that could ride along
  // inside #maincontent (scripts/consent/tracking), plus the skip link.
  WebImporter.DOMUtils.remove(element, [
    'a#skip-main-content',
    '#onetrust-consent-sdk',
    '.QSIFeedbackButton',
    '#st-ping-div',
    'iframe[id^="lpSS_"]',
    'iframe[src*="lpsnmedia.net"]',
    '#destination_publishing_iframe_delta_0',
    'idp-refund-help-modal',
    'script',
    'link',
    'noscript',
  ]);
}
