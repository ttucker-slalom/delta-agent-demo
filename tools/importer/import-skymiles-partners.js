/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import tabsPartnersParser from './parsers/tabs-partners.js';
import columnsCtaParser from './parsers/columns-cta.js';
import accordionTermsParser from './parsers/accordion-terms.js';

// TRANSFORMER IMPORTS
import skymilesCleanupTransformer from './transformers/skymiles-cleanup.js';
import skymilesSectionsTransformer from './transformers/skymiles-sections.js';

// PARSER REGISTRY
const parsers = {
  'tabs-partners': tabsPartnersParser,
  'columns-cta': columnsCtaParser,
  'accordion-terms': accordionTermsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'skymiles-partners',
  description: 'Delta.com SkyMiles Partners & Offers marketing page.',
  urls: [
    'https://www.delta.com/us/en/skymiles/how-to-earn-miles/skymiles-partners-offers',
  ],
  blocks: [
    { name: 'tabs-partners', instances: ['#maincontent > div.tabs.parbase', 'div.tabs.parbase'] },
    { name: 'columns-cta', instances: ['#maincontent > div.sectioncta.parbase', 'div.sectioncta.parbase'] },
    { name: 'accordion-terms', instances: ['#maincontent > div.expander', 'div.expander'] },
  ],
  sections: [
    { id: 'intro', name: 'Intro / page header', selector: ['#maincontent > div.intro'], style: null, blocks: [], defaultContent: ['#maincontent > div.intro h1', '#maincontent > div.intro p'] },
    { id: 'tabs', name: 'Tabbed partner offers browser', selector: ['#maincontent > div.tabs.parbase'], style: null, blocks: ['tabs-partners'], defaultContent: [] },
    { id: 'sync-cta', name: 'Delta Sync Partners promo CTA', selector: ['#maincontent > div.sectioncta.parbase'], style: null, blocks: ['columns-cta'], defaultContent: [] },
    { id: 'terms', name: 'Page-level Terms and Conditions', selector: ['#maincontent > div.expander'], style: null, blocks: ['accordion-terms'], defaultContent: [] },
    { id: 'next-pager', name: 'Next / Convert Partner Points pager', selector: ['body > div.fresh-air > div:nth-of-type(3) > div.nextprevsection'], style: 'grey', blocks: [], defaultContent: ['div.nextprevsection p', 'div.nextprevsection a'] },
  ],
};

// TRANSFORMER REGISTRY — cleanup first, then sections (adds <hr> + section metadata)
const transformers = [
  skymilesCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [skymilesSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
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
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. find blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. parse each block (skip elements already replaced by an earlier parser)
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

    // 4. afterTransform cleanup + section breaks/metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    // createMetadata returns the metadata block table (and also appends it to main).
    const metaBlock = WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 5b. Page-scoped overrides — add theme + per-page nav/footer to the metadata
    // block so this page uses its own theme, header, and footer without touching
    // any other page (the header/footer blocks read these values, and
    // decorateTemplateAndTheme applies `theme` as a body class).
    // Prefer the returned block; fall back to a query in case the API appended only.
    // createMetadata appends the Metadata block table last in main. Find the
    // metadata table specifically: the one whose first cell reads "Metadata".
    const tables = [...main.querySelectorAll('table')];
    const metaEl = (metaBlock && metaBlock.nodeType === 1 && metaBlock.tagName === 'TABLE')
      ? metaBlock
      : tables.reverse().find((t) => /^metadata$/i.test((t.querySelector('th, td') || {}).textContent?.trim() || ''))
        || main.querySelector('.metadata');
    if (metaEl) {
      const isTable = metaEl.tagName === 'TABLE';
      const addMetaRow = (key, value) => {
        if (isTable) {
          // Blocks are tables at transform time: one <tr> with two <td> cells.
          const tr = document.createElement('tr');
          const kd = document.createElement('td');
          kd.textContent = key;
          const vd = document.createElement('td');
          vd.textContent = value;
          tr.append(kd, vd);
          (metaEl.querySelector('tbody') || metaEl).append(tr);
        } else {
          const row = document.createElement('div');
          const k = document.createElement('div');
          k.textContent = key;
          const v = document.createElement('div');
          v.textContent = value;
          row.append(k, v);
          metaEl.append(row);
        }
      };
      addMetaRow('theme', 'partners');
      addMetaRow('nav', '/content/nav-partners');
      addMetaRow('footer', '/content/footer-partners');
    }

    // 6. sanitized path (root → /index guard)
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
