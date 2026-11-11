# Landing page

The landing page has one job: turn a click on an ad into a click on Install in the App Store listing. One promise, one action, the same look as the ad before it and the listing after it.

## The path

- Ad on Meta or TikTok, then the landing page, then the App Store listing, then Install, then the first product page.
- Keep three things identical along it: the promise in words, the product card on orange, and the price sentence.
- Every Install button links to the App Store listing with `utm_source`, `utm_medium` and `utm_campaign`, and nowhere else.

## Sections, in order

1. Header (`SiteHeader`): the lockup on the left; a "Pricing" link and a small primary button "Install free" on the right.
2. Hero (`Hero`): eyebrow, the promise in `display-xl`, a lead in `text-lead`, the primary button "Install free" and a secondary "See a sample page", then the price sentence in `text-small`, then "No Shopify store yet?": a closed disclosure with three steps (press Install and create the Shopify account and store when Shopify asks, add the product, pick it in Ecomwerce), a note that the store has its own Shopify plan, and its own Install. On the "first product page" variant it sits right under the primary button. The orange stage with a product card on the right, with the build motion once.
3. How it works (`Steps`, pictured): pick a product; Ecomwerce writes the page in a new theme on your store; preview, then go live. The order is real, so the steps carry numbers. Until the launch interface ships, each step has a drawn scene on the orange stage: the catalog with one product picked; the page filling in, once, when it comes into view; the page on a phone with Go live and the current theme kept in the theme library.
4. What's on the page (`PageAnatomy`): a real page Ecomwerce generated, with short labels on its parts (headline, benefits, FAQ, buy box). A real build on a development store, never a mock.
5. Real data only (`HonestyList`): what Ecomwerce never adds, and what stays the merchant's (their photos and details, their real reviews). Publish this section only after the open P0 items on app-added proof in docs/pre-launch-backlog.md are fixed (the preset stock bar, the app-added "verified" badge, the default quotes and claims in hand-added blocks). Until then the page would promise something the app does not do yet.
6. What Ecomwerce writes, and what stays yours (`ScopeList`): the headline, benefits, reasons it stands out, an FAQ, a new theme based on Horizon that the merchant can edit in the theme editor, and optional AI images; and what stays the merchant's: payments, shipping, policies, the domain and the moment they go live. It publishes now. When What's on the page and Real data only open, the three stack in this order, and Real data only leaves the go-live line to this section.
7. Pricing (`PricingCard` with `CostChart`): pay as you go, the price sentence word for word, the $60 cap, billed on the Shopify invoice. Beside the card, what testing costs: a page, a week and four weeks at three products a week, and the cap, next to one ad test, on one dollar scale; the ad test always with its source line.
8. FAQ (`FAQ`): the merchant's questions in their words, "Do I need a Shopify store?" among them. Answers are drafts: check each against the app before launch.
9. Final call (`FinalCall`): the promise again in `display-l`, the primary button, and the official "Find it on the Shopify App Store" badge, then the price sentence and "No Shopify store yet?".
10. Footer (`SiteFooter`): the lockup, "Made by SpurIT", support email, privacy policy, terms, cookies, a legal notice and "Privacy choices".

## Headline options

- "A product page for every product you test." Usable now: no number, straight from what the app does.
- "Your next product page in about two minutes." Measured on our test store (p75 1 min 57 s for one product page, October 2026). Use it after the listing claim is decided (decision D1) and the time is re-measured on the production app.
- "Product pages with real data only." Use it after the P0 items above are fixed.
- Match the ad: a merchant who clicked a "first product page" ad lands on a hero about the first page; one who clicked a "page per test" ad lands on the test-loop promise. Personas: first-store beginners who already have a product, and product testers (tasks/persona-sizing). The ads reach visitors without a store or a product too, so the page gives them a path ("No Shopify store yet?" and the FAQ) instead of a dead end.

## Shopify's name and badge

- Link to the listing with the official "Find it on the Shopify App Store" badge, unaltered. The black version is preferred; the white one is for dark grounds.
- Use the word Shopify only to say the app works with Shopify. No Shopify bag, no Shopify green, nothing that looks like a Shopify product.

## Build notes

- Serve the fonts from the page's own domain (woff2, latin, only the weights in use) with `font-display: swap`; preload Gabarito 800 and Host Grotesk 400. No request to Google Fonts: an EU visitor would send it their IP address before consent.
- The hero product photo is the largest element: serve it as AVIF or WebP with fixed dimensions.
- Put the Meta Pixel and GA4 on the page, with the same IDs as the listing's tracking fields. In the EEA, the UK and Switzerland nothing loads before the visitor's choice (`ConsentBanner`); "Privacy choices" in the footer reopens it everywhere.
- Write every color, size, radius and space from `tokens.css`; take components from `components/bundle.css`.
