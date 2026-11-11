Ecomwerce is a Shopify app that turns a product from a merchant's catalog into a product page on the merchant's store. We write for people who test products with paid ads: they need a new page for every product, they need it fast, and they have learned to distrust tools that promise magic. The brand is a precise, honest tool with one loud color.

## The idea

- The mark is what we make: a product card (photo window, title line, buy button) on an orange tile. Every surface grows from it: the app icon, the landing page hero, every ad, the App Store feature image. At icon size it is a symbol; at page size the window holds the merchant's real photo and the pill becomes the real "Add to cart".
- Make three promises, in this order, and none beyond them.
- A page for every product you test: speed and volume for the test loop (about three products a week, kill or scale after two or three days).
- Real data only: Ecomwerce never invents reviews, ratings, counters, stock levels or "verified" badges. Social proof comes from the merchant's real data or stays out.
- Your store, your click: the page is built in a new theme on the merchant's store and goes live only when they press Go live; their current theme stays in their theme library.

## Voice

- Write like a colleague who has built a hundred product pages: short sentences, concrete nouns, one idea per sentence.
- Call the merchant "you". Ecomwerce says "we" only for an action it owns: "We write the page. You decide when it goes live."
- Use sentence case everywhere: headings, buttons, labels, ad headlines. No exclamation marks. No emoji. No em dashes: use a comma, parentheses or two sentences.
- Say "in minutes" without a number: every build's estimate is minutes (2 for one product). Use a number only when it was measured, and keep the measurement one tap away (a footnote or a linked note): a one-product page builds in 1 min 57 s at p75 on our test store (October 2026), so "about two minutes" once the time is re-measured on the production app. Never "in seconds", "instantly" or "in 5 minutes".
- Compare with other apps only on our own site, in `ComparisonTable`: dated facts from their listings and our installs, names in text, no logos, never a speed claim.
- Describe what the page has, never what it will earn. No sales, conversion or revenue promises anywhere (Shopify requirement 4.3.1 forbids them in the listing; we hold every surface to it).
- Name the unit "product page". Not "store", "funnel" or "website": Ecomwerce makes product pages.
- Write the price the same way everywhere, word for word: "Free to install. Your first 2 product pages are free, then $3 per product page." Add "Monthly cap of $60" where there is room.
- Write in English. The app writes English pages for now, and the landing page and ads say so where language matters.

| Write | Avoid |
| --- | --- |
| Your product page, ready for ads in minutes. | Launch a winning store in seconds! |
| Ecomwerce writes the headline, benefits and FAQ. You keep the final say. | Our AI does everything for you. |
| No invented reviews. If you add real ones, the page shows them. | Social proof that converts. |
| See the page on your store first. It goes live when you press Go live. | One-click launch. |
| Free to install. Your first 2 product pages are free, then $3 per product page. | Start free today! |

Never use: magic, revolutionary, guaranteed, 10x, explode your sales, winning product, done-for-you store, AI-powered as a claim on its own.

## Color

- `orange` is the brand. Use it for the app tile, one hero field per page, the product card stage and ad backgrounds. Keep text on `orange` in `ink-fixed`; never put white text on it.
- Set running text in `text` on `surface` or `surface-2`; leads and answers in `text-2`; captions and eyebrows in `text-3`. Orange text on a light ground is `orange-text`, never `orange`.
- Fill the primary action with `action` and label it in `on-action`. One primary action per view. On an orange field the button is `ink-fixed` with a `white-fixed` label.
- Use `orange-tint` for soft highlights only. Use `positive` for check marks beside words. Use `critical` for form errors only. Never use red or orange to create urgency.
- Keep orange to about 15 % of a landing page, ink to about 25 %, the rest `surface` and `surface-2`. A page that is mostly orange stops reading as a page.
- No gradients, no purple, no sparkles. Shopify forbids the Sidekick look and "magic" purple for AI (requirement 4.3.5), and dropshippers read that look as AI-made.

## Type

- Set headlines and the wordmark in Gabarito (`display` family): `display-xl` for the single hero headline, `display-l` for section openers, `heading-1` to `heading-3` below. Tighten tracking as the tokens say; never set Gabarito below 18px.
- Set everything people read in Host Grotesk (`sans`): `text-body` for paragraphs (65 characters a line at most), `text-lead` under a hero headline, `text-small` for captions and the price sentence, `text-button` for buttons.
- Set figures in Geist Mono (`mono`): `data-figure` for prices, times and counts, `data-label` for uppercase eyebrows. Mono marks a figure as measured; do not use it for decoration.
- On phones (720px and narrower) the sizes step down: `display-xl` 44px, `display-l` 36px, `heading-1` 32px, `heading-2` 26px, `heading-3` 20px, `text-lead` 18px; the rest stay. Between 720 and 1440px the two scale with the viewport and keep the token sizes at both ends: `display-xl` is clamp(44px, 4.4vw + 12px, 72px), `display-l` clamp(36px, 2.6vw + 16px, 52px) (classes `ew-display-xl` and `ew-display-l` in bundle.css), so a tablet does not get a desktop headline in a narrow column.
- The weights in use: Gabarito 700 and 800, Host Grotesk 400, 500 and 600, Geist Mono 400 and 500. The landing page serves them from its own domain (woff2, latin, only these weights) and loads nothing from Google Fonts, because the browser would send Google the visitor's IP address before any consent; previews and documents may load them from Google Fonts.

## Layout and shape

- Use a 12-column grid, 1200px maximum content width, `space-6` gutters. Separate sections by `space-24` on desktop and `space-16` on phones. Keep at least `space-4` of side gutter at every width.
- Take radii from the mark: `radius-pill` for every button (the mark's buy button), `radius-m` for photo windows, cards and screenshots, `radius-l` for panels and the orange stage. Square corners are not part of the brand.
- Lift only a product card or photo off the orange stage, with `shadow-card`. Everything else sits flat.
- Lay out the hero in two columns: text left, the orange stage with a product card right. On phones the stage follows the text.

## Imagery

- Show the merchant's product the way their shopper will see it: a real product photo in the white window of a product card, on `orange`.
- Show real interface: crops of the Ecomwerce admin and of a page Ecomwerce generated on a development store. No browser chrome, no desktop wallpaper (Shopify requirement 4.4.4).
- Until the launch interface ships, How it works draws its steps as schematic scenes on the orange stage (Steps): grey lines for text, the neutral placeholder product, nothing the app does not do. A scene never imitates a screenshot, and real crops replace it.
- Never show invented reviews, star ratings, review counts, "people bought this" lines, stock bars or countdowns in any mock, ad, screenshot or example, not even as decoration.
- Use the neutral product placeholder in the previews only until a real development-store product exists. Never show another company's product or logo.
- No stock photos of people at laptops, no 3D blobs, no AI art.

## Iconography

- Inside the app, use Polaris icons only: the app follows Shopify's admin look (requirement 4.1.1).
- On the landing page and in ads, use Lucide icons (ISC licence) at 1.75px stroke, 20 to 24px, in `text` or `positive`. Use them sparingly: checks, crosses, steps.
- Never use the Ecomwerce mark as a bullet, a decoration or a loading spinner.

## Motion

- The one motion is the build: the photo window fills, the title line writes in, the buy button appears. Use it in the hero and in video ads, 1.2 to 2 seconds, once. On the landing page it plays once more, in How it works (Steps, the write scene), when that scene comes into view.
- With `prefers-reduced-motion`, show the finished card and nothing else. The first frame of any video is the finished page.

## Where the brand applies

- Brand: the landing page, ads, App Store listing images, emails, social profiles, favicons, documents.
- Polaris, not brand: everything inside the embedded app. The only brand element inside the Shopify admin is the app icon Shopify shows in the navigation.

## Accessibility

- Hold body text at 4.5:1 on its ground in both themes; large text, icons and control borders at 3:1. Each color token's note lists its grounds and ratios.
- Show keyboard focus as a 2px `surface` gap, then a solid 2px `focus` ring. The ring holds 3:1 on `surface` and on `orange` in both themes.
- Never carry meaning by color alone: a check or a cross always sits beside words.
