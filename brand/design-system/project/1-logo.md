# Logo

## The mark

- The mark is a product card on an orange tile: a white photo window, a white title line and an ink buy button. It is the thing Ecomwerce makes, drawn as simply as it can be drawn.
- In the App Store results it is the only orange tile and the only product card (81 apps checked for "ai store builder", "ai product page", "product page builder" and "landing page builder", November 2026). Keep both: the color and the shape do the recognising.

## Construction

- Draw it on Shopify's icon grid: a 1200 px square, 16 units of 75 px. The glyph is 500 x 850 px, inside Shopify's 750 to 900 px band, with 350 px side and 175 px top and bottom margins.
- Photo window: 500 x 500 px at (350, 175), radius 62.5. Title line: 350 x 75 px at (350, 725), fully round. Buy button: 500 x 150 px at (350, 875), fully round.
- Colors: tile `orange` #FF6A13, window and title line `white-fixed` #FFFFFF, button `ink-fixed` #1A1410.
- Below 24 px use the small version (`ecomwerce-favicon.svg`): window and button only, enlarged. The title line would turn into noise.
- `ecomwerce-icon-construction.svg` shows the grid, the margin and the glyph band.

## Versions

| File | Use |
| --- | --- |
| `ecomwerce-icon.svg`, `ecomwerce-icon-1200.png` | The app icon: App Store listing, app settings in the Dev Dashboard, ad account avatars. |
| `ecomwerce-icon-512.png`, `-192.png`, `-180.png` | Web app icons; 180 is the Apple touch icon. |
| `ecomwerce-favicon.svg`, `-32.png`, `-16.png` | Browser tabs. The small version, corners already rounded. |
| `ecomwerce-lockup.svg`, `ecomwerce-lockup.png` | Tile and wordmark on light grounds: landing header, emails, documents. |
| `ecomwerce-lockup-white.svg` | The same on ink or dark grounds. |
| `ecomwerce-lockup-on-orange.svg` | On an orange field the tile edge disappears, so the glyph stands alone beside an ink wordmark. |
| `ecomwerce-mark-on-orange.svg` | The glyph alone, for orange fields only. |
| `ecomwerce-wordmark.svg`, `-white.svg` | The word alone, where the tile is already visible nearby. |
| `ecomwerce-icon-mono.svg` | Single-color reproduction (print, embossing). Not for screens. |

## Wordmark

- Write the wordmark "ecomwerce": lowercase, Gabarito ExtraBold, tracking -0.02em, outlined. Use the files; never retype it in a font.
- Write the name in running text as "Ecomwerce": capital E, one word. Never "EcomWerce", "ECOMWERCE" or "Ecom Werce".
- The word has no ascenders or descenders, so it is one band of x-height. In the lockup that band is 0.4 of the tile height, centred on the tile's centre line, 0.25 of the tile height away from it.
- There is no stacked lockup: the name is long. In a square space use the tile alone.
- Keep the w a plain w. Merchants type the name into the App Store search after seeing an ad; every letter must read at first glance.

## Clear space and size

- Keep clear space of half the tile height on every side of the lockup, and the full margin of the grid around the icon.
- Minimum sizes on screen: the icon 16 px (small version up to 24 px), the lockup 24 px tile height.

## Grounds

- On `surface` (white or light): the lockup with the ink wordmark.
- On ink or dark grounds: the white lockup. The orange tile needs no outline on dark.
- On `orange`: the lockup on orange (no tile) with the ink wordmark.
- On photos: put the lockup on a solid `surface` chip, or leave it out.

## Do not

- Change the orange, recolor the button, or swap the white and ink parts.
- Add an outline, a gradient, a shadow, a glow, a sparkle or a star.
- Rotate, tilt, stretch or crop the tile, or rearrange the window, line and button.
- Put text, a price or a number in the tile (Shopify requirements 4.2.2 and 4.4.3 apply to the app icon).
- Place the glyph without its tile on white: the window disappears.
- Use the mark as a bullet, a pattern or a loading spinner.
