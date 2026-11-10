Asks before any measurement or ad tag loads, for visitors in the EEA, the UK and Switzerland.

- Markup: `.ew-consent` (a dialog, not modal) with two `.ew-consent__part`s: the summary (`.ew-consent__title`, one sentence, "Reject all" and "Accept all" in `.ew-consent__actions`, then "Choose" and the cookie policy link in `.ew-consent__more`) and the settings (`ul.ew-consent__list`: Necessary always on, Measurement and Advertising as `input.ew-switch[role=switch]`, then "Save choices" and "Accept all").
- Reject is exactly as easy as accept: the same size, the same style, the same row. No switch starts on.
- With Global Privacy Control on, Advertising stays off and disabled, with `.ew-consent__note` saying why.
- Put it first in the body, so it is the first tab stop when it shows; it is drawn at the bottom. Desktop: a card at the bottom left, 420px wide. Phones: a sheet across the bottom; the hero's Install button stays visible above it.
- It floats over the page, so it takes `shadow-card`, the one exception to flat.
- The footer's "Privacy choices" opens the settings again, in every geo.
