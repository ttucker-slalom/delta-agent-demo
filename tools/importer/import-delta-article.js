/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import embedSocialParser from './parsers/embed-social.js';

// TRANSFORMER IMPORTS
import deltaCleanupTransformer from './transformers/delta-cleanup.js';

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'embed-social': embedSocialParser,
};

// TRANSFORMER REGISTRY - Array of transformer functions
const transformers = [
  deltaCleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'delta-article',
  description: 'Delta News Hub editorial/news article page. Single-column article: eyebrow, H1, deck, byline, hero image, body copy with subheads/list/inline image, grey callout box, and an embedded Instagram post. Mostly default content; only the social embed is a block.',
  urls: [
    'https://news.delta.com/more-sips-more-trips-delta-and-starbucks-bring-back-member-favorite-way-earn-miles',
  ],
  blocks: [
    {
      name: 'embed-social',
      instances: ['iframe.instagram-media', 'iframe[src*="instagram.com"]'],
    },
  ],
  sections: [
    {
      id: 'article-body',
      name: 'Article header + body',
      selector: ['#main-content > div.container div.node--type-article', 'div.node--type-article.node--view-mode-full'],
      style: null,
      blocks: ['embed-social'],
      defaultContent: ['div.node--type-article h1', 'div.node--type-article p'],
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - The hook name ('beforeTransform' or 'afterTransform')
 * @param {Element} element - The DOM element to transform (typically document.body or main)
 * @param {Object} payload - The payload containing { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        // Multiple selectors may match the same element - dedupe by element.
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers.
    // Skip elements already replaced by a prior parser (detached from DOM).
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (root URL maps to /index to avoid empty-path crash).
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
