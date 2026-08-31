/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Delta News Hub site-wide cleanup.
 * Removes non-authorable site chrome and widgets so the import contains only
 * page-level authorable content (eyebrow, H1, deck, byline, hero image, body
 * copy, callout box, and the Instagram embed).
 *
 * All selectors verified in migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Share widgets / overlays / popups that sit over or inside content and
    // would otherwise be parsed as authorable content.
    WebImporter.DOMUtils.remove(element, [
      'span.a2a_kit.addtoany_list', // inline AddToAny social share row inside article (line 228)
      '#addtoany',                  // AddToAny modal/overlay container (line 441)
      '#newsletter-popup',          // newsletter subscribe popup (line 501)
      // eu_cookie_compliance consent banner (rendered by the headless browser
      // at import time; not in cleaned.html). Its heading/buttons would leak in
      // as "By continuing to browse... I agree No, thanks".
      '#sliding-popup',
      '.eu-cookie-compliance-banner',
      '.eu-cookie-withdraw-banner',
      '[aria-label="Cookie compliance banner"]',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site shell/chrome (header, nav, footer, skip link, alerts)
    // and tracking iframe. The Instagram embed iframe is intentionally NOT
    // matched here so the embed-social parser can extract it.
    WebImporter.DOMUtils.remove(element, [
      'a.visually-hidden.focusable',            // "Skip to main content" link (line 2)
      '.site-alert-region',                     // empty site alert region (line 7)
      'nav.navbar',                             // top utility navbar (line 9)
      'header.page__header',                    // page header w/ hamburger site nav (line 41)
      'footer.page__footer',                    // "More in SkyMiles" related-links footer (line 382)
      '.download-icon.overlay',                 // image download-overlay widgets on article images (lines 263, 285)
      '#destination_publishing_iframe_delta_0', // Adobe demdex ID-sync iframe (line 499)
      'noscript',
    ]);

    // Drop empty headings (e.g. `<h3>&nbsp;</h3>`) that the source uses as
    // spacers between subheads — they carry no content and become stray blank
    // headings in the imported document.
    element.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
      if (!h.textContent.replace(/ /g, ' ').trim() && !h.querySelector('img')) {
        h.remove();
      }
    });
  }
}
