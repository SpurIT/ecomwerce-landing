# landing - ecomwerce.com

the landing page: a static Astro build (astro 7.3.8, no cms, no ui framework). paid traffic from Meta, TikTok and Google search lands here; the page's one job is the Install click to the Shopify App Store listing. design and decisions: tasks/landing/ (TASK.md, copy.md, BRIEF-phase-2.md) and DECISIONS.md.

## commands

run in landing/ (node 22.12 or newer; playwright for og and check comes from the repo root's devDependencies)
- npm install - the pinned dependencies
- npm run dev - astro dev at http://localhost:4321 (no edge: the opt-in copy is at /_optin/ there; no content security policy in dev)
- npm run build - dist/ (writes src/styles/tokens.generated.css from the brand's tokens.json first)
- npm run serve -- --country DE - dist/ through the edge logic, like CloudFront (the country also comes from a cloudfront-viewer-country request header)
- npm test - the edge tests (edge/*.test.mjs)
- npm run check - the checks of the built site: extra builds, the html audit, screenshots, the phase 3 blocks (section frames .check/shots/p3-*.jpg, the chart to scale, step 2's build, the orange share, how it works in WebKit), real clicks, the tags with fake ids, Lighthouse (.check/, git-ignored; --only shots|blocks|clicks|tags|audit|lighthouse, --no-lighthouse)
- WebKit on macOS 14: playwright 1.64 gets a frozen WebKit build there (2251) that it cannot open a page in ("Unknown setting: PushAPIEnabled"), so the WebKit frame fails; install playwright 1.59.1, the first version that ships that build, outside the repo (npm i --prefix <dir> playwright@1.59.1; npx playwright install webkit once) and run with EW_PLAYWRIGHT_WEBKIT=<dir>/node_modules/playwright/index.mjs npm run check
- npm run og - redraws src/assets/og-1200x630.png from the brand's files (after a brand change)

## what lives where

- src/data/landing.mjs - the one data file: the variants (copy, paths), the gate facts, LISTING_URL, the utm defaults, the operator's inputs (empty shows the marked placeholder); src/data/legal.mjs - the legal placeholders
- src/config/tags.mjs - the GA4, Google Ads, Meta and TikTok ids; an empty id loads nothing and adds no host to the content security policy
- src/pages/[...path].astro - every page, each built twice: at its path and under /_optin/; src/pages/404.astro - no script, no tag
- src/components/ - the sections (classes from the brand's bundle.css, ew-*); src/styles/landing.css - the page layout only (lp-*); src/styles/fonts.css - the self-hosted fonts
- src/scripts/landing.js - the one script: consent, the tag loader, the Install events, utm pass-through, the in-app hint, and step 2's build in view (how it works: the scene ships finished, the script arms it below the fold and plays it once when 40 % of it shows; nothing moves without the script or with reduced motion)
- edge/geo.mjs - the viewer-request logic shared by scripts/serve.mjs and the CloudFront Function; edge/headers.mjs - the static security headers
- read from outside landing/, never copied: brand/design-system/project/tokens.json and components/bundle.css, brand/logo/ (lockups, favicons), brand/shopify/ (the official App Store badges)

## variants and gates

- variants by path: / (p2 product tester, Meta and TikTok), /first-product-page/ (p1), /product-page-builder/ (the Google ad group); a variant changes the eyebrow, the headline (hero, final call, title) and the lead. a new variant is one entry in VARIANTS
- gates are facts in GATES (all false on 2026-11-10): g1 ec37Shipped (the default headline), g2 proofFixesShipped (the honesty section and the reviews faq), g3 sampleBuildExists (the sample section, "See a sample page", the real hero photo; needs SAMPLE filled, the build fails otherwise), g4 timeClaimCleared (the time line and its footnote). a closed gate's part is not in the html; flipping a gate is one line and a deploy
- the listing url is one constant (a search link until the operator gives the handle)

## consent and tags

- the EEA, the UK, Switzerland and unknown countries get the /_optin/ copy (the CloudFront Function rewrites by the viewer's country): the banner, nothing loads before a choice; elsewhere the tags load without a banner. "Privacy choices" in the footer reopens the settings everywhere; Global Privacy Control is a no to advertising; the choice lives in the first-party cookie ew_consent (180 days)
- the Google tag gets Consent Mode v2 signals from the choice; Meta and TikTok load only with advertising on
- events: page view; on every Install click install_click (GA4), the Google Ads conversion (googleAdsInstallLabel), InstallClick (Meta, TikTok) with variant, placement, utm_source and in_app; the navigation waits 300 ms at most
- EW_TAGS (fake ids) and EW_GATES_OPEN are for check builds only; never deploy a build made with them

## deploy

not set up yet: infra (S3, CloudFront with the geo function and the security headers, ACM, DNS, a GitHub OIDC role), the GitHub Actions workflow and the deploy script come in wave 5, applied only on the operator's go (tasks/landing/BRIEF-phase-2.md). until the listing exists, every Install goes to an App Store search for "ecomwerce".
