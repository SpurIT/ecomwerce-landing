The mark grown into a page: a photo window, title, price and buy button on the orange stage.

- Markup: `.ew-stage` around `.ew-card` with `.ew-card__window` (holding the merchant's product photo), `.ew-card__title`, `.ew-card__price` and an `ew-btn ew-btn--on-orange ew-btn--block`. Where the buy pill is a picture, not a control (the landing hero), make it a `span.ew-card__buy`.
- The consumer provides a real product photo, a product title and a price. The previews use a neutral placeholder; never use another company's product.
- The build: `ew-card--build` plays the window filling, the title writing in over its line (`.ew-card__titlewrap` with `.ew-card__line` and the title) and the buy button appearing, once, about 1.5 s. With reduced motion it shows the finished card. The static building state is `ew-skel` on the window and lines with the button faded.
- Compact: `ew-card--compact` lays the card on its side (the 112px window left; title, price and a 40px buy pill right); `ew-card--compact-sm` does it below 720px only, so the hero's first screen on a phone holds the headline, the card and the Install button.
- Never add stars, review counts, stock bars or "sold" lines to the card.
