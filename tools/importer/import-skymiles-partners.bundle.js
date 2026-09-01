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

  // tools/importer/import-skymiles-partners.js
  var import_skymiles_partners_exports = {};
  __export(import_skymiles_partners_exports, {
    default: () => import_skymiles_partners_default
  });

  // tools/importer/parsers/tabs-partners.js
  function parse(element, { document: document2 }) {
    const tabButtons = Array.from(
      element.querySelectorAll("ul.tabs-header-list > li.tab-btn, .tabs-header-list > li")
    );
    const panels = Array.from(
      element.querySelectorAll(".content-tab-panel-container .tab-panel")
    );
    const cells = [];
    const cleanContent = (root) => {
      root.querySelectorAll("link, style, script, .toggle-all-faq, .sr-only, .cutout-external-image").forEach((n) => n.remove());
      root.querySelectorAll("span.d-inline.d-lg-none").forEach((n) => {
        if (!n.textContent.trim()) n.remove();
      });
      return root;
    };
    const panelCount = Math.max(tabButtons.length, panels.length);
    for (let i = 0; i < panelCount; i += 1) {
      const btn = tabButtons[i];
      const panel = panels[i];
      let labelText = "";
      if (btn) {
        const subtitle = btn.querySelector(".subtitle");
        labelText = (subtitle ? subtitle.textContent : btn.textContent).trim();
      }
      if (!labelText && panel) {
        const h = panel.querySelector(".content-block h1, .content-block h2, h1, h2");
        if (h) labelText = h.textContent.trim();
      }
      const labelCell = document2.createElement("p");
      labelCell.textContent = labelText || `Tab ${i + 1}`;
      let contentCell;
      if (panel) {
        const contentRoot = panel.querySelector(".tab-panel-content") || panel;
        contentCell = cleanContent(contentRoot.cloneNode(true));
      } else {
        contentCell = document2.createElement("div");
      }
      cells.push([labelCell, contentCell]);
    }
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-partners", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-cta.js
  function parse2(element, { document: document2 }) {
    const textCol = element.querySelector(".introcomponent, .section-cta-container > div:not(.section-cta-btn)");
    const ctaCol = element.querySelector(".section-cta-btn");
    const leftCell = [];
    const eyebrow = element.querySelector(".introcomponent .h4, .introcomponent h1, .introcomponent h2, span.h4");
    if (eyebrow) {
      const h = document2.createElement("h3");
      h.textContent = eyebrow.textContent.trim();
      leftCell.push(h);
    }
    const paras = Array.from((textCol || element).querySelectorAll("p"));
    paras.forEach((p) => {
      if (p.textContent.trim()) leftCell.push(p);
    });
    const rightCell = [];
    const cta = (ctaCol || element).querySelector('a.btn, a.btn-secondary-cta, a[class*="btn"], a');
    if (cta) {
      const link = cta.cloneNode(true);
      link.querySelectorAll(".cutout-external-image").forEach((n) => n.remove());
      rightCell.push(link);
    }
    if (leftCell.length === 0 && rightCell.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[leftCell, rightCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-cta", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-terms.js
  function parse3(element, { document: document2 }) {
    const cards = Array.from(element.querySelectorAll(".expander-container .card, .card"));
    const cells = [];
    cards.forEach((card) => {
      const header = card.querySelector(".card-header");
      const body = card.querySelector(".panel-collapse .card-body, .card-body");
      if (!header && !body) return;
      const titleCell = [];
      const titleText = card.querySelector(
        ".news-caption, .expander-title, .card-header a"
      );
      const titleImg = header ? header.querySelector("img") : null;
      if (titleImg) titleCell.push(titleImg.cloneNode(true));
      if (titleText) {
        const p = document2.createElement("p");
        p.textContent = titleText.textContent.trim();
        titleCell.push(p);
      }
      let contentCell;
      if (body) {
        contentCell = body.cloneNode(true);
        contentCell.querySelectorAll("link, style, script, .toggle-all-faq, .sr-only, .cutout-external-image").forEach((n) => n.remove());
      } else {
        contentCell = document2.createElement("div");
      }
      cells.push([titleCell, contentCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-terms", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/skymiles-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var KEEP_SELECTORS = [
    "#maincontent",
    "div.nextprevsection"
  ];
  function transform(hookName, element, payload) {
    if (hookName !== TransformHook.beforeTransform) return;
    const doc = payload && payload.document || element.ownerDocument;
    if (!doc) return;
    const keep = [];
    KEEP_SELECTORS.forEach((sel) => {
      const found = element.querySelector(sel);
      if (found && !keep.includes(found)) keep.push(found);
    });
    if (keep.length === 0) return;
    keep.sort((a, b) => {
      const pos = a.compareDocumentPosition(b);
      return pos & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
    const fragment = doc.createDocumentFragment();
    keep.forEach((node) => fragment.appendChild(node));
    element.textContent = "";
    element.appendChild(fragment);
    WebImporter.DOMUtils.remove(element, [
      "a#skip-main-content",
      "#onetrust-consent-sdk",
      ".QSIFeedbackButton",
      "#st-ping-div",
      'iframe[id^="lpSS_"]',
      'iframe[src*="lpsnmedia.net"]',
      "#destination_publishing_iframe_delta_0",
      "idp-refund-help-modal",
      "script",
      "link",
      "noscript"
    ]);
  }

  // tools/importer/transformers/skymiles-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function sectionSelector(section) {
    const sel = section.selector;
    return Array.isArray(sel) ? sel[0] : sel;
  }
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const selector = sectionSelector(section);
        if (!selector) continue;
        const sectionEl = element.querySelector(selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || element.querySelector(sectionSelector(section));
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-skymiles-partners.js
  var parsers = {
    "tabs-partners": parse,
    "columns-cta": parse2,
    "accordion-terms": parse3
  };
  var PAGE_TEMPLATE = {
    name: "skymiles-partners",
    description: "Delta.com SkyMiles Partners & Offers marketing page.",
    urls: [
      "https://www.delta.com/us/en/skymiles/how-to-earn-miles/skymiles-partners-offers"
    ],
    blocks: [
      { name: "tabs-partners", instances: ["#maincontent > div.tabs.parbase", "div.tabs.parbase"] },
      { name: "columns-cta", instances: ["#maincontent > div.sectioncta.parbase", "div.sectioncta.parbase"] },
      { name: "accordion-terms", instances: ["#maincontent > div.expander", "div.expander"] }
    ],
    sections: [
      { id: "intro", name: "Intro / page header", selector: ["#maincontent > div.intro"], style: null, blocks: [], defaultContent: ["#maincontent > div.intro h1", "#maincontent > div.intro p"] },
      { id: "tabs", name: "Tabbed partner offers browser", selector: ["#maincontent > div.tabs.parbase"], style: null, blocks: ["tabs-partners"], defaultContent: [] },
      { id: "sync-cta", name: "Delta Sync Partners promo CTA", selector: ["#maincontent > div.sectioncta.parbase"], style: null, blocks: ["columns-cta"], defaultContent: [] },
      { id: "terms", name: "Page-level Terms and Conditions", selector: ["#maincontent > div.expander"], style: null, blocks: ["accordion-terms"], defaultContent: [] },
      { id: "next-pager", name: "Next / Convert Partner Points pager", selector: ["body > div.fresh-air > div:nth-of-type(3) > div.nextprevsection"], style: "grey", blocks: [], defaultContent: ["div.nextprevsection p", "div.nextprevsection a"] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
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
  var import_skymiles_partners_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      const metaBlock = WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const tables = [...main.querySelectorAll("table")];
      const metaEl = metaBlock && metaBlock.nodeType === 1 && metaBlock.tagName === "TABLE" ? metaBlock : tables.reverse().find((t) => {
        var _a;
        return /^metadata$/i.test(((_a = (t.querySelector("th, td") || {}).textContent) == null ? void 0 : _a.trim()) || "");
      }) || main.querySelector(".metadata");
      if (metaEl) {
        const isTable = metaEl.tagName === "TABLE";
        const addMetaRow = (key, value) => {
          if (isTable) {
            const tr = document2.createElement("tr");
            const kd = document2.createElement("td");
            kd.textContent = key;
            const vd = document2.createElement("td");
            vd.textContent = value;
            tr.append(kd, vd);
            (metaEl.querySelector("tbody") || metaEl).append(tr);
          } else {
            const row = document2.createElement("div");
            const k = document2.createElement("div");
            k.textContent = key;
            const v = document2.createElement("div");
            v.textContent = value;
            row.append(k, v);
            metaEl.append(row);
          }
        };
        addMetaRow("theme", "partners");
        addMetaRow("nav", "/content/nav-partners");
        addMetaRow("footer", "/content/footer-partners");
      }
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_skymiles_partners_exports);
})();
