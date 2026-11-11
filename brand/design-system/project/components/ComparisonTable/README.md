Pay per test, not per month: Ecomwerce next to the apps a visitor compares it with, on how each one charges and publishes.

- Markup: `.ew-compare` holding one `table` (explicit `role`s on the table, row groups, rows and cells, so it stays a table to assistive technology when the phone layout turns rows into cards). The head row names the apps (`th` with `scope="col"`), the first cell of each body row names the question (`th` with `scope="row"`), every answer cell carries `data-label` with its app's name. Ecomwerce's column comes first and carries `.ew-compare__us` (a tint of orange, `surface-2` where `color-mix` is unknown). The source line follows in `p.ew-note.ew-compare__src`.
- From 721px a table on a `surface` panel with hairlines; at 720px and below one card per question with its four answers, each prefixed by its app's name, and no horizontal scroll. `ew-compare--stacked` forces the card layout (for a preview).
- The facts come from one data file (`landing/src/data/competitors.mjs`): the date checked, each app's listing and every answer, the prices as numbers. Never type a price into the markup.
- Only facts with a date: prices from each app's Shopify App Store listing, re-checked on the day the page is built; how each one publishes from our own installs, or from its listing where we did not see it, and the source line says which.
- Names in text, never logos. No speed row and never "faster" (the apps we compare with generate faster than we do). Where another app costs less, the table shows it.
- On our own site only, never in the App Store listing or its images.
- No hover, no script: it reads the same without JavaScript.
