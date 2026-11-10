# App Store listing

The listing is where every landing page visitor ends up. It has to look like the same product they just saw: the same tile, the same promise, the same price sentence.

## Name, subtitle and introduction

- Proposed app name: "Ecomwerce: AI Product Pages" (27 characters, brand first). The name in the Dev Dashboard and on the listing must match or be similar (requirement 4.1.1). Proposal, not decided.
- Proposed app card subtitle: "A product page for every product you test". No data or statistics here: Shopify keeps numbers out of the subtitle. Proposal.
- Proposed introduction (100 characters at most): "Pick a product and get a product page in your own theme. Preview it, then go live when you're ready." Proposal; check the count in the form.

## Icon

- Upload `ecomwerce-icon-1200.png`: 1200 x 1200 px, square, no rounded corners (Shopify rounds them), no text.
- Use the same icon in the app's settings in the Dev Dashboard, so the admin navigation and the listing match.

## Feature image (1600 x 900)

- One focal point: the product page Ecomwerce generated for a real product on a development store, shown on a phone, on `orange`.
- One headline in `display-xl` at feature size, in `ink-fixed`. Do not repeat the subtitle.
- No logo-only image, no pricing, no ratings (requirements 4.2.2 and 4.4.4). Write alt text that says what the page shows.
- The `ListingImage` component holds the layout.

## Screenshots (1600 x 900, 3 to 6, each different)

- Each screenshot is a heading in `heading-1` at screenshot size on `surface-2`, over a real crop of the app on a white card. No browser chrome, no desktop background (4.4.4), no duplicates (4.4.5).
- Write headings as what the merchant does: 1. Pick a product from your catalog. 2. Ecomwerce writes the page. 3. Preview it on your store. 4. Go live when you decide. 5. Every page in one place.
- No prices, reviews or outcome promises in any image (4.2.2, 4.3.1). Write alt text for each.

## Pricing and demo store

- Pricing details must say what the app and the landing page say: "Free to install. Your first 2 product pages are free, then $3 per product page." plus the $60 monthly cap (docs/specs/billing.md).
- The demo store link opens a product page Ecomwerce built on a development store, with real photos and no invented proof.

## Tracking

- In the listing's tracking information, enter the same GA4 measurement ID and Meta Pixel ID the landing page uses. Shopify then reports listing views (`view_item`) and Install clicks (`add_to_cart`) to both, so an ad campaign can optimise for Install clicks.
- Shopify does not pass the visitor's campaign to the installed app. Attribution per shop needs something the merchant does in the app (a code, a question), which is out of scope here.
