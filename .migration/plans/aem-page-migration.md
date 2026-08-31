# Full Page Migration Plan — Delta × Starbucks Article Page

## Overview
Migrate a single source web page into AEM Edge Delivery Services with full fidelity: content structure mapped to blocks, visual design matched to the original, and instrumented header/navigation and footer. Scope confirmed: **Full (content, design, nav & footer)**.

- **Source URL:** `https://news.delta.com/more-sips-more-trips-delta-and-starbucks-bring-back-member-favorite-way-earn-miles`
- **Page type:** Editorial / news article page (Delta News Hub).

## Checklist

- [x] **Provide source URL** — received
- [ ] **Confirm project type** — determine doc / da / xwalk project and the correct Block Library endpoint (project-expert)
- [ ] **Scrape the source page** — capture HTML, metadata, images, and screenshots for reference
- [ ] **Analyze page structure** — identify sections, content sequences, and authoring decisions (default content vs. blocks)
- [ ] **Survey available blocks** — inventory local project + Block Collection blocks to map content to the right block palette
- [ ] **Catalog page template** — record the page as a template and map DOM selectors to block variants
- [ ] **Create/reuse block variants** — reuse existing variants at ~80% similarity; create new variants only where needed
- [ ] **Build import infrastructure** — generate block parsers and page transformers for this template
- [ ] **Generate & bundle import script** — assemble the project's import script (never hand-write content HTML)
- [ ] **Run the import** — execute the bundled import to produce content in the content directory
- [ ] **Migrate design/styling** — extract computed styles from source and write EDS-ready, block-scoped CSS
- [ ] **Instrument navigation/header** — build the header/nav from the source (desktop + mobile, megamenu if present)
- [ ] **Migrate footer** — build the footer from the source (desktop + mobile) with validation
- [ ] **Preview & verify** — render in preview, compare against original for content and visual fidelity
- [ ] **Visual critique & fixes** — critique migrated page vs. original; iterate on styling/layout gaps
- [ ] **Validate import** — score content completeness (source vs. output) and resolve flagged divergences
- [ ] **Prepare PR** — ensure the branch includes the required `{branch}--{repo}--{owner}.aem.page/{path}` preview link

## Execution Notes
- **Content generation rule:** All content HTML is produced by the bundled import script — never authored or edited by hand in the content directory.
- **Ordering:** Content import runs first, then design styling, then navigation and footer instrumentation (both require the page to already be migrated).
- **CSS scoping:** All styles scoped to `.blockname`; `-wrapper` / `-container` are reserved section classes.
- **Verification:** Prefer text-based preview inspection (DOM snapshot, computed-style checks); reserve screenshots for final pixel-level design QA.
- **Likely blocks for this article page:** hero (headline + lead image), article body (default content: headings, paragraphs, inline images), possibly a media/figure block, share links, and related-content cards — to be confirmed during structure analysis.

> **Execution requires Execute mode.** This plan is complete and ready to run — exit plan mode to begin execution starting with the project-type check and page scrape.
