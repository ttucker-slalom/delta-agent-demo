/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed-social.
 * Base block: embed (Block Collection), variant: social.
 * Source: https://news.delta.com/more-sips-more-trips-delta-and-starbucks-bring-back-member-favorite-way-earn-miles
 * Generated: 2026-08-31
 *
 * Structure (per library-description.txt "Embed (social)"):
 *   1 column, 2 rows. Row 1 = block name (added by createBlock).
 *   Row 2 = single cell containing a link to the external social content.
 *
 * Extraction: the source is an Instagram embed iframe
 *   (iframe.instagram-media / iframe[src*="instagram.com"]) whose src is an
 *   /embed/captioned/ URL with tracking query params. We derive the canonical
 *   post permalink by keeping only the /p/{shortcode}/ (or /reel/{shortcode}/)
 *   path and dropping /embed[...]/ segments and the query string / hash.
 */
export default function parse(element, { document }) {
  // The element may be the iframe itself or a wrapper containing it.
  const iframe = element.matches('iframe')
    ? element
    : element.querySelector('iframe.instagram-media, iframe[src*="instagram.com"], iframe[src*="instagr.am"]');

  const rawSrc = iframe && (iframe.getAttribute('src') || iframe.src);

  // Empty-block guard: no usable embed source found.
  if (!rawSrc) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Normalize to the canonical Instagram post permalink.
  // e.g. https://www.instagram.com/p/DQUioiskX4D/embed/captioned/?cr=1&v=14#{...}
  //   -> https://www.instagram.com/p/DQUioiskX4D/
  let canonicalUrl = rawSrc;
  try {
    const url = new URL(rawSrc, 'https://www.instagram.com');
    // Match the content path: /p/{shortcode}/, /reel/{shortcode}/, /tv/{shortcode}/
    const match = url.pathname.match(/\/(p|reel|reels|tv)\/([^/]+)/i);
    if (match) {
      canonicalUrl = `https://www.instagram.com/${match[1].toLowerCase()}/${match[2]}/`;
    } else {
      // Fallback: strip any /embed... segment and the query/hash.
      const cleanedPath = url.pathname.replace(/\/embed.*$/i, '/');
      canonicalUrl = `${url.origin}${cleanedPath}`;
    }
  } catch (e) {
    // Fallback for non-parseable src: strip /embed... and query/hash manually.
    canonicalUrl = rawSrc.split('#')[0].split('?')[0].replace(/\/embed.*$/i, '/');
  }

  // Build the link node that goes into the single embed cell.
  const link = document.createElement('a');
  link.href = canonicalUrl;
  link.textContent = canonicalUrl;

  // 1-column block: one row, one cell holding the link.
  const cells = [];
  cells.push([link]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-social', cells });
  element.replaceWith(block);
}
