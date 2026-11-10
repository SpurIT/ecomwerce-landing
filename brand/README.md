# brand

the Ecomwerce brand: the app icon, the logo files and the source of the brand book. decided 2026-11-10 (DECISIONS.md, tasks/brand/TASK.md).

- brand book (design system artifact, english): https://claude.ai/artifact/WKDCPE9W13nfUtoCmG15KV
- logo directions board (phase 1, the rejected alternatives): https://claude.ai/artifact/6b3cPuS9zgVVbR8vZH1JWe

## what is here

- logo/ - the mark (a product card on an orange tile), the small version for 16-24 px, mono, lockups, the wordmark, the construction drawing, and the png exports; ecomwerce-icon-1200.png is the App Store and Dev Dashboard upload
- tools/build-brand.mjs - one geometry for everything: writes logo/ (svg and png) and the design system previews and bundle.css; run from the repo root with node brand/tools/build-brand.mjs
- tools/outline-wordmark.mjs and tools/wordmark-path.json - the wordmark outlined once from Gabarito ExtraBold (Google Fonts, OFL) with opentype.js; the json holds the path, so the build needs no font
- design-system/project/ - the brand book's files (tokens.json, README.md and four sections, components with README and preview, the cover, the asset index design-system.json)

## changing it

- the mark or the lockups: edit the geometry in tools/build-brand.mjs, run it, upload the changed files to the artifact as assets (Artifact publish with asset: true and the artifact url), then update their records in design-system/project/design-system.json
- the brand book: edit the files under design-system/project/ and publish only the changed ones to the artifact url with root brand/design-system; the index goes last, read again right before
- people can edit the artifact on its page; read the files back from it before editing them here
