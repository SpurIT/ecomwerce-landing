# Landing page

The landing page has one job: turn a click on an ad into a click on Install in the App Store listing. One promise, one action, the same look as the ad before it and the listing after it.

## The path

- Ad on Meta or TikTok, then the landing page, then the App Store listing, then Install, then the first product page.
- Keep three things identical along it: the promise in words, the product card on orange, and the price sentence.
- Every Install button links to the App Store listing with `utm_source`, `utm_medium` and `utm_campaign`, and nowhere else.

## Sections, in order

1. Header (`SiteHeader`): the lockup on the left; on the right three chips that each link to the section that proves them ("Zero setup" to How it works, "Go live free" to the comparison, "No monthly fee" to pricing) and "Get 2 pages free", the Install button, which shows only while no other Install button is in view (over the hero it is the hero's; near the FAQ's aside and the final call, theirs). On phones "No monthly fee" alone, and the button takes its place.
2. Hero (`Hero`): eyebrow, the promise with the outcome and "in minutes" in `display-xl`, a lead naming what the page gets (a hook headline, benefits, reasons to buy and an FAQ), the primary button "Build my first page free" and a secondary "See a sample page" (once a real build exists; until then the link "How it works"), then the price sentence in `text-small`, then "No Shopify store yet?": a closed disclosure with three steps (press Install and create the Shopify account and store when Shopify asks, add the product, pick it in Ecomwerce), a note that the store has its own Shopify plan, and its own Install. On the "first product page" variant it sits right under the primary button. The orange stage on the right plays the build once: the app icon, the mark becoming the product card, then the page written around it, with a Before / After switch (see Hero).
3. How it works (`Steps`, pictured): "Three steps, a few minutes": pick a product; Ecomwerce writes the page in a new theme on your store, in minutes; preview, then go live. The order is real, so the steps carry numbers. Until the launch interface ships, each step has a drawn scene on the orange stage: the catalog with one product picked; the page filling in, once, when it comes into view; the page on a phone with Go live and the current theme kept in the theme library.
4. What you get (`PageAnatomy`): "Built like the product pages the courses teach": the six parts Ecomwerce writes (a hook headline; your price, variants and Add to cart; benefits; four reasons it stands out; AI images, if you want them; an FAQ), each with what it does on the page, beside a drawn page with the same numbers, the drawing on the left (after How it works since phase 5: the hero already shows the page); pointing at a part rings it, and once in view the drawing walks through the six. Once a real build exists on a development store, its screenshot replaces the drawing in the same block, never a mock.
5. Real data only (`HonestyList`): what Ecomwerce never adds, and what stays the merchant's (their photos and details, their real reviews). Publish this section only after the open P0 items on app-added proof in docs/pre-launch-backlog.md are fixed (the preset stock bar, the app-added "verified" badge, the default quotes and claims in hand-added blocks). Until then the page would promise something the app does not do yet.
6. Pricing (`PricingCard` with `CostChart`): "The page is the cheapest part of your test": pay as you go, the price sentence word for word, the $60 cap, billed on the Shopify invoice. Beside the card, what testing costs on one dollar scale: one ad test first, then a page, a week and four weeks at three products a week, and the cap; the ad test always with its source line.
7. Compared (`ComparisonTable`): "Pay per test, not per month": Ecomwerce, PagePilot, Dropmagic and Forge AI on what each builds, how you pay, what it takes to start, 12 product pages a month, a month without tests and how each publishes. Prices from each listing with the date checked; the other apps by name in text, never their logos or icons, our app icon before our name; no speed row; on our site only, never in the App Store listing.
8. FAQ (`FAQ`): the merchant's questions in their words, "Do I need a Shopify store?", "Does it work on Shopify's $1 plan?", "Can I edit the page?" and "What if I don't like the page?" among them; what stays the merchant's (payments, shipping, policies, the domain) and when the live store changes are answered here. Answers are drafts: check each against the app before launch. Beside the questions, an aside: "The quickest answer is your own page", the offer, its own Install button and the support contact.
9. Final call (`FinalCall`): the glyph, then the promise again in `display-l`, the primary button "Build my first page free", and the official "Find it on the Shopify App Store" badge, then the price sentence and "No Shopify store yet?". It sits over the footer's top edge.
10. Footer (`SiteFooter`): ink, so the page ends in the mark's colours: the white lockup, "Made by SpurIT", support email; "On this page" (How it works, What you get, Pricing, Compare, FAQ); privacy policy, terms, cookies, a legal notice and "Privacy choices". No second badge: the final call carries it.

## Headline options

- "Your product page, ready for ads in minutes." Usable now: the outcome a visitor from an ad came for, and "in minutes" without a number.
- "A product page for every product you test." Once the next product lands in the existing theme (EC-37).
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
