# Landing page

The landing page has one job: turn a click on an ad into a click on Install in the App Store listing. One promise, one action, the same look as the ad before it and the listing after it.

## The path

- Ad on Meta or TikTok, then the landing page, then the App Store listing, then Install, then the first product page.
- Keep three things identical along it: the promise in words, the product card on orange, and the price sentence.
- Every Install button links to the App Store listing with `utm_source`, `utm_medium` and `utm_campaign`, and nowhere else.

## Sections, in order

1. Header: the lockup on the left; a "Pricing" link and a small primary button "Install free" on the right.
2. Hero (`Hero`): eyebrow, the promise in `display-xl`, a lead in `text-lead`, the primary button "Install free" and a secondary "See a sample page", then the price sentence in `text-small`. The orange stage with a product card on the right, with the build motion once.
3. How it works (`Steps`): pick a product; Ecomwerce writes the page in your theme; preview, then go live. The order is real, so the steps carry numbers.
4. What's on the page: a real page Ecomwerce generated, with short labels on its parts (headline, benefits, FAQ, buy box). A real build on a development store, never a mock.
5. Real data only (`HonestyList`): what Ecomwerce never adds, and what stays the merchant's. Publish this section only after the open P0 items on app-added proof in docs/pre-launch-backlog.md are fixed (the preset stock bar, the app-added "verified" badge, the default quotes and claims in hand-added blocks). Until then the page would promise something the app does not do yet.
6. Pricing (`PricingCard`): pay as you go, the price sentence word for word, the $60 cap, billed on the Shopify invoice.
7. FAQ (`FAQ`): the merchant's questions in their words. Answers are drafts: check each against the app before launch.
8. Final call: the promise again in `display-l`, the primary button, and the official "Find it on the Shopify App Store" badge.
9. Footer: the lockup, "Made by SpurIT", support email, privacy policy, terms.

## Headline options

- "A product page for every product you test." Usable now: no number, straight from what the app does.
- "Your next product page in about two minutes." Measured on our test store (p75 1 min 57 s for one product page, October 2026). Use it after the listing claim is decided (decision D1) and the time is re-measured on the production app.
- "Product pages with real data only." Use it after the P0 items above are fixed.
- Match the ad: a merchant who clicked a "first product page" ad lands on a hero about the first page; one who clicked a "page per test" ad lands on the test-loop promise. Personas: first-store beginners who already have a product, and product testers (tasks/persona-sizing).

## Shopify's name and badge

- Link to the listing with the official "Find it on the Shopify App Store" badge, unaltered. The black version is preferred; the white one is for dark grounds.
- Use the word Shopify only to say the app works with Shopify. No Shopify bag, no Shopify green, nothing that looks like a Shopify product.

## Build notes

- Load fonts from Google Fonts with `display=swap`; preload Gabarito 800 and Host Grotesk 400.
- The hero product photo is the largest element: serve it as AVIF or WebP with fixed dimensions.
- Put the Meta Pixel and GA4 on the page, with the same IDs as the listing's tracking fields.
- Write every color, size, radius and space from `tokens.css`; take components from `components/bundle.css`.
