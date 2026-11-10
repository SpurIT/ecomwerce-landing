The landing page header: the lockup, a Pricing link and one small Install button. Sticky, so Install stays one tap away.

- Markup: `header.ew-header` > `.ew-header__in` (inside the page's 1200px wrap) with `a.ew-header__logo` (both lockups, `ew-light-only` and `ew-dark-only`; the theme shows one) and `nav.ew-header__nav` (`a.ew-header__link` "Pricing", `a.ew-btn.ew-btn--sm` "Install free").
- 72px high with the lockup at a 32px tile, 56px with a 28px tile on phones (the lockup's minimum is 24px). Below 360px the Pricing link hides.
- The Install button links to the App Store listing with utm parameters, like every Install button on the page.
- One hairline in `line` under it, no shadow.
