/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-delta-article.js
  var import_delta_article_exports = {};
  __export(import_delta_article_exports, {
    default: () => import_delta_article_default
  });

  // tools/importer/parsers/embed-social.js
  function parse(element, { document }) {
    const iframe = element.matches("iframe") ? element : element.querySelector('iframe.instagram-media, iframe[src*="instagram.com"], iframe[src*="instagr.am"]');
    const rawSrc = iframe && (iframe.getAttribute("src") || iframe.src);
    if (!rawSrc) {
      element.replaceWith(...element.childNodes);
      return;
    }
    let canonicalUrl = rawSrc;
    try {
      const url = new URL(rawSrc, "https://www.instagram.com");
      const match = url.pathname.match(/\/(p|reel|reels|tv)\/([^/]+)/i);
      if (match) {
        canonicalUrl = `https://www.instagram.com/${match[1].toLowerCase()}/${match[2]}/`;
      } else {
        const cleanedPath = url.pathname.replace(/\/embed.*$/i, "/");
        canonicalUrl = `${url.origin}${cleanedPath}`;
      }
    } catch (e) {
      canonicalUrl = rawSrc.split("#")[0].split("?")[0].replace(/\/embed.*$/i, "/");
    }
    const link = document.createElement("a");
    link.href = canonicalUrl;
    link.textContent = canonicalUrl;
    const cells = [];
    cells.push([link]);
    const block = WebImporter.Blocks.createBlock(document, { name: "embed-social", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/delta-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "span.a2a_kit.addtoany_list",
        // inline AddToAny social share row inside article (line 228)
        "#addtoany",
        // AddToAny modal/overlay container (line 441)
        "#newsletter-popup",
        // newsletter subscribe popup (line 501)
        // eu_cookie_compliance consent banner (rendered by the headless browser
        // at import time; not in cleaned.html). Its heading/buttons would leak in
        // as "By continuing to browse... I agree No, thanks".
        "#sliding-popup",
        ".eu-cookie-compliance-banner",
        ".eu-cookie-withdraw-banner",
        '[aria-label="Cookie compliance banner"]'
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "a.visually-hidden.focusable",
        // "Skip to main content" link (line 2)
        ".site-alert-region",
        // empty site alert region (line 7)
        "nav.navbar",
        // top utility navbar (line 9)
        "header.page__header",
        // page header w/ hamburger site nav (line 41)
        "footer.page__footer",
        // "More in SkyMiles" related-links footer (line 382)
        ".download-icon.overlay",
        // image download-overlay widgets on article images (lines 263, 285)
        "#destination_publishing_iframe_delta_0",
        // Adobe demdex ID-sync iframe (line 499)
        "noscript"
      ]);
      element.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
        if (!h.textContent.replace(/ /g, " ").trim() && !h.querySelector("img")) {
          h.remove();
        }
      });
    }
  }

  // tools/importer/import-delta-article.js
  var parsers = {
    "embed-social": parse
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "delta-article",
    description: "Delta News Hub editorial/news article page. Single-column article: eyebrow, H1, deck, byline, hero image, body copy with subheads/list/inline image, grey callout box, and an embedded Instagram post. Mostly default content; only the social embed is a block.",
    urls: [
      "https://news.delta.com/more-sips-more-trips-delta-and-starbucks-bring-back-member-favorite-way-earn-miles"
    ],
    blocks: [
      {
        name: "embed-social",
        instances: ["iframe.instagram-media", 'iframe[src*="instagram.com"]']
      }
    ],
    sections: [
      {
        id: "article-body",
        name: "Article header + body",
        selector: ["#main-content > div.container div.node--type-article", "div.node--type-article.node--view-mode-full"],
        style: null,
        blocks: ["embed-social"],
        defaultContent: ["div.node--type-article h1", "div.node--type-article p"]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_delta_article_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_delta_article_exports);
})();
