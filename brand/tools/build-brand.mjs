// builds the Ecomwerce logo files (svg + png) and the design system previews from one geometry.
// run from the repo root: node brand/tools/build-brand.mjs
// needs playwright (repo devDependency) for the png exports; the wordmark outline comes from
// brand/tools/wordmark-path.json (made once by outline-wordmark.mjs from Gabarito ExtraBold).
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const ROOT = new URL('../', import.meta.url).pathname
const LOGO = ROOT + 'logo/'
const DS = ROOT + 'design-system/project/'
const C = { orange: '#FF6A13', ink: '#1A1410', white: '#FFFFFF' }

// the mark on Shopify's 16-unit icon grid (1200 px, 75 px per unit): margins 350 / 175, glyph 500 x 850
const G = {
  window: { x: 350, y: 175, w: 500, h: 500, r: 62.5 },
  title: { x: 350, y: 725, w: 350, h: 75, r: 37.5 },
  buy: { x: 350, y: 875, w: 500, h: 150, r: 75 },
}
// small version for 16-24 px (favicons): no title line, bigger window and button
const GS = { window: { x: 300, y: 150, w: 600, h: 600, r: 72 }, buy: { x: 300, y: 870, w: 600, h: 180, r: 90 } }
const rect = (e, fill) => `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="${e.r}" fill="${fill}"/>`
const glyph = ({ win = C.white, title = C.white, buy = C.ink } = {}) => rect(G.window, win) + rect(G.title, title) + rect(G.buy, buy)
const svg = (vb, body, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${w ? ` width="${w}" height="${h}"` : ''}>${body}</svg>`

const icon = ({ tile = C.orange, round = 0, ...g } = {}) => svg('0 0 1200 1200', `<rect width="1200" height="1200" rx="${round}" fill="${tile}"/>${glyph(g)}`)
const iconSmall = ({ round = 264 } = {}) => svg('0 0 1200 1200', `<rect width="1200" height="1200" rx="${round}" fill="${C.orange}"/>${rect(GS.window, C.white)}${rect(GS.buy, C.ink)}`)
const markOnOrange = () => svg('350 175 500 850', glyph())

const WM = JSON.parse(await readFile(ROOT + 'tools/wordmark-path.json', 'utf8'))
// the word has no ascenders or descenders: its x-height band is the whole word (overshoot 12 units)
const wmBox = { x: -10, y: -WM.xHeight - 14, w: WM.width + 20, h: WM.xHeight + 28 }
const wordmark = (fill = C.ink) => svg(`${wmBox.x} ${wmBox.y} ${wmBox.w} ${wmBox.h}`, `<path d="${WM.d}" fill="${fill}"/>`)
// lockup: tile 1200, gap 300 (0.25 tile), x-height 480 (0.4 tile) centred on the tile's centre line
const LK = { gap: 300, xh: 480 }
const lockup = ({ word = C.ink, tile = true } = {}) => {
  const s = LK.xh / WM.xHeight, x0 = 1200 + LK.gap, base = 600 + LK.xh / 2
  const w = Math.ceil(x0 + WM.width * s + 10)
  const mark = tile ? `<rect width="1200" height="1200" rx="264" fill="${C.orange}"/>${glyph()}` : `<g transform="translate(-175 0)">${glyph()}</g>`
  const shift = tile ? 0 : -350
  return svg(`0 0 ${w + shift} 1200`, `${mark}<g transform="translate(${x0 + shift} ${base}) scale(${s.toFixed(5)})"><path d="${WM.d}" fill="${word}"/></g>`)
}
// construction drawing: the 16-unit grid, the 75 px margin and the 750 / 900 px glyph band
const construction = () => {
  let lines = ''
  for (let i = 1; i < 16; i++) lines += `<line x1="${i * 75}" y1="0" x2="${i * 75}" y2="1200"/><line x1="0" y1="${i * 75}" x2="1200" y2="${i * 75}"/>`
  return svg('-60 -60 1320 1320', `<rect x="-60" y="-60" width="1320" height="1320" fill="#ffffff"/><rect width="1200" height="1200" fill="${C.orange}"/>${glyph()}
<g stroke="#1A1410" stroke-opacity=".28" stroke-width="2">${lines}</g>
<rect x="0" y="0" width="1200" height="1200" fill="none" stroke="#1A1410" stroke-width="4"/>
<rect x="75" y="75" width="1050" height="1050" fill="none" stroke="#1A1410" stroke-width="3" stroke-dasharray="14 10"/>
<rect x="225" y="225" width="750" height="750" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="6 8"/>
<rect x="150" y="150" width="900" height="900" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="20 8"/>
<g font-family="ui-monospace, Menlo, monospace" font-size="30" fill="#1A1410"><text x="0" y="-18">1200 px · 16 units of 75 px</text><text x="82" y="112">margin 75</text><text x="860" y="1188">glyph 500 x 850</text></g>`)
}

const files = {
  'ecomwerce-icon.svg': icon(),
  'ecomwerce-icon-mono.svg': icon({ tile: C.ink, buy: C.white }),
  'ecomwerce-favicon.svg': iconSmall(),
  'ecomwerce-mark-on-orange.svg': markOnOrange(),
  'ecomwerce-wordmark.svg': wordmark(C.ink),
  'ecomwerce-wordmark-white.svg': wordmark(C.white),
  'ecomwerce-lockup.svg': lockup(),
  'ecomwerce-lockup-white.svg': lockup({ word: C.white }),
  'ecomwerce-lockup-on-orange.svg': lockup({ tile: false }),
  'ecomwerce-icon-construction.svg': construction(),
}
await mkdir(LOGO, { recursive: true })
for (const [n, s] of Object.entries(files)) await writeFile(LOGO + n, s + '\n')

// png exports
const pngs = [
  ['ecomwerce-icon-1200.png', icon(), 1200, 1200, false],
  ['ecomwerce-icon-512.png', icon(), 512, 512, false],
  ['ecomwerce-icon-192.png', icon(), 192, 192, false],
  ['ecomwerce-icon-180.png', icon(), 180, 180, false],
  ['ecomwerce-favicon-32.png', iconSmall(), 32, 32, true],
  ['ecomwerce-favicon-16.png', iconSmall(), 16, 16, true],
]
const lk = lockup(); const lkW = +lk.match(/viewBox="0 0 (\d+)/)[1]
pngs.push(['ecomwerce-lockup.png', lk, Math.round(lkW / 1200 * 160), 160, true])
const browser = await chromium.launch(); const page = await browser.newPage({ deviceScaleFactor: 1 })
for (const [n, s, w, h, transparent] of pngs) {
  await page.setViewportSize({ width: w, height: h })
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block}</style>${s.replace('<svg ', `<svg width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" `)}`)
  await page.screenshot({ path: LOGO + n, omitBackground: transparent, clip: { x: 0, y: 0, width: w, height: h } })
}
await browser.close()

// ---------- design system: bundle.css and previews ----------
const at = (s, w, h = w) => s.replace('<svg ', `<svg width="${w}" height="${h}" aria-hidden="true" `)
const tileAt = (s, px) => `<span class="ew-tile" style="--s:${px}px">${at(s, px)}</span>`
const ICON = icon(), SMALL = iconSmall({ round: 0 })
const FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gabarito:wght@700;800&family=Host+Grotesk:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap">'
const LUC = { check: '<path d="M20 6 9 17l-5-5"/>', x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>' }
const luc = (n, cls = '') => `<svg class="ew-ico ${cls}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${LUC[n]}</svg>`
// placeholder for the merchant's own product photo (never a real brand's product)
const PHOTO = `<svg class="ew-photo" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Product photo placeholder"><rect width="400" height="400" fill="#F3EEE8"/><ellipse cx="200" cy="322" rx="122" ry="13" fill="#E4DBD1"/><path d="M118 128h164l-48 98h-68z" fill="#E7DCD1"/><rect x="140" y="216" width="120" height="14" rx="7" fill="#D7CBBF"/><path d="M128 238h144v46a40 40 0 0 1-40 40h-64a40 40 0 0 1-40-40z" fill="#FFFFFF" stroke="#D7CBBF" stroke-width="3"/><path d="M272 252h14a22 22 0 0 1 0 44h-10" fill="none" stroke="#D7CBBF" stroke-width="9"/></svg>`
// inline styles name tokens with a fallback, so a preview still reads where tokens.css is missing
const FALLBACK = { orange: '#FF6A13', 'ink-fixed': '#1A1410', 'white-fixed': '#FFFFFF', surface: '#FFFFFF', 'surface-2': '#F5F3F0', text: '#1A1410', 'text-2': '#5E554F', 'text-3': '#736963', line: '#E7E1DB', 'font-mono': "'Geist Mono',ui-monospace,monospace", 'font-display': "'Gabarito',system-ui,sans-serif", 'font-sans': "'Host Grotesk',system-ui,sans-serif" }
const withFallbacks = h => h.replace(/var\(--([a-z0-9-]+)\)/g, (m, n) => FALLBACK[n] ? `var(--${n},${FALLBACK[n]})` : m)
const doc = (marker, title, body, extraHead = '') => `${marker}\n<!doctype html>\n<html><head><meta charset="utf-8"><title>${title} - preview</title>${FONTS}${extraHead}</head>\n<body class="ew ew-preview">\n${withFallbacks(body)}\n</body></html>\n`

const bundleCss = `/* Ecomwerce components: classes shared by the previews and the landing page. Values come from tokens.css; the fallbacks only cover a page without it. */
.ew{font-family:var(--font-sans,"Host Grotesk",system-ui,sans-serif);color:var(--text,#1A1410);-webkit-font-smoothing:antialiased}
.ew-preview{margin:0;padding:20px;background:var(--surface,#fff)}
.ew *,.ew *::before,.ew *::after{box-sizing:border-box}
.ew-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-4,16px)}
.ew-col{display:flex;flex-direction:column;gap:var(--space-3,12px)}
.ew-tile{display:inline-block;flex:none;width:var(--s);height:var(--s);border-radius:var(--radius-tile,22%);overflow:hidden;vertical-align:middle}
.ew-tile svg{display:block}
.ew-eyebrow{font:500 12px/1.4 var(--font-mono,"Geist Mono",ui-monospace,monospace);letter-spacing:.06em;text-transform:uppercase;color:var(--text-3,#736963)}
.ew-h{font-family:var(--font-display,"Gabarito",system-ui,sans-serif);font-weight:800;letter-spacing:-.02em;line-height:1.05;margin:0;text-wrap:balance}
.ew-p{margin:0;max-width:65ch;color:var(--text-2,#5E554F)}
.ew-num{font:500 15px/1.4 var(--font-mono,"Geist Mono",ui-monospace,monospace);font-variant-numeric:tabular-nums}
.ew-note{font-size:13px;line-height:1.5;color:var(--text-3,#736963);margin:0}
.ew-ico{flex:none;display:block}
/* buttons: one shape, the mark's buy button */
.ew-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:48px;padding:0 22px;border:0;border-radius:var(--radius-pill,999px);background:var(--action,#1A1410);color:var(--on-action,#fff);font:600 16px/1 var(--font-sans,"Host Grotesk",system-ui,sans-serif);text-decoration:none;cursor:pointer;white-space:nowrap}
.ew-btn:hover{background:var(--action-hover,#3A302A)}
.ew-btn:focus-visible{outline:none;box-shadow:0 0 0 2px var(--surface,#fff),0 0 0 4px var(--focus,#1A1410)}
.ew-btn--lg{height:56px;padding:0 28px;font-size:17px}
.ew-btn--sm{height:36px;padding:0 16px;font-size:14px}
.ew-btn--secondary{background:transparent;color:var(--text,#1A1410);box-shadow:inset 0 0 0 1.5px var(--control-border,#8F857E)}
.ew-btn--secondary:hover{background:var(--surface-2,#F5F3F0)}
.ew-btn--on-orange{background:var(--ink-fixed,#1A1410);color:var(--white-fixed,#fff)}
.ew-btn--on-orange:hover{background:#3A302A}
.ew-btn--block{width:100%}
.ew-link{color:var(--orange-text,#C2410C);text-decoration:underline;text-underline-offset:3px;font-weight:500}
/* the orange stage and the product card: the mark grown into a page */
.ew-stage{background:var(--orange,#FF6A13);border-radius:var(--radius-l,24px);color:var(--ink-fixed,#1A1410)}
.ew-card{display:flex;flex-direction:column;gap:12px;width:100%;max-width:300px}
.ew-card__window{aspect-ratio:1;border-radius:var(--radius-m,14px);overflow:hidden;background:var(--white-fixed,#fff);box-shadow:var(--shadow-card,0 10px 30px -14px rgba(26,20,16,.22))}
.ew-photo{display:block;width:100%;height:100%}
.ew-card__title{font:800 21px/1.15 var(--font-display,"Gabarito",system-ui,sans-serif);letter-spacing:-.015em;color:var(--ink-fixed,#1A1410);margin:2px 0 0}
.ew-card__price{font:500 15px/1.3 var(--font-mono,"Geist Mono",ui-monospace,monospace);color:var(--ink-fixed,#1A1410)}
.ew-card__line{height:12px;border-radius:999px;background:var(--white-fixed,#fff);width:70%}
.ew-skel{background:rgba(255,255,255,.55)}
/* landing sections */
.ew-hero{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:48px;align-items:center}
.ew-hero__text{display:flex;flex-direction:column;gap:20px}
.ew-hero__stage{padding:44px;display:grid;place-items:center}
.ew-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;list-style:none;margin:0;padding:0}
.ew-step{display:flex;flex-direction:column;gap:10px;padding-top:16px;border-top:2px solid var(--text,#1A1410)}
.ew-step__n{font:500 13px var(--font-mono,"Geist Mono",ui-monospace,monospace);color:var(--text-3,#736963)}
.ew-honest{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
.ew-honest__col{background:var(--surface-2,#F5F3F0);border-radius:var(--radius-l,24px);padding:24px;display:flex;flex-direction:column;gap:14px}
.ew-honest ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
.ew-honest li{display:flex;gap:10px;align-items:flex-start;line-height:1.4}
.ew-never .ew-ico{color:var(--text-3,#736963)}
.ew-always .ew-ico{color:var(--positive,#1D7A55)}
.ew-price{background:var(--surface-2,#F5F3F0);border-radius:var(--radius-l,24px);padding:28px;display:flex;flex-direction:column;gap:16px;max-width:420px}
.ew-price__big{display:flex;align-items:baseline;gap:10px}
.ew-price__big b{font:800 64px/1 var(--font-display,"Gabarito",system-ui,sans-serif);letter-spacing:-.03em}
.ew-price ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.ew-price li{display:flex;gap:10px;align-items:center}
.ew-price li .ew-ico{color:var(--positive,#1D7A55)}
.ew-faq{border-top:1px solid var(--line,#E7E1DB);max-width:760px}
.ew-faq details{border-bottom:1px solid var(--line,#E7E1DB)}
.ew-faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:18px 0;font:700 19px/1.3 var(--font-display,"Gabarito",system-ui,sans-serif)}
.ew-faq summary::-webkit-details-marker{display:none}
.ew-faq summary::after{content:"+";font:400 24px/1 var(--font-mono,"Geist Mono",monospace);color:var(--text-3,#736963)}
.ew-faq details[open] summary::after{content:"-"}
.ew-faq summary:focus-visible{outline:none;box-shadow:0 0 0 2px var(--surface,#fff),0 0 0 4px var(--focus,#1A1410);border-radius:6px}
.ew-faq details p{margin:0 0 18px;color:var(--text-2,#5E554F);max-width:65ch}
/* fixed-size frames: listing images and ads, drawn at real pixels and scaled to fit */
.ew-frame{position:relative;overflow:hidden;flex:none;transform-origin:top left}
.ew-frames{display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start}
.ew-safe{position:absolute;border:3px dashed rgba(26,20,16,.75);border-radius:8px;pointer-events:none}
.ew-unsafe{position:absolute;left:0;right:0;background:repeating-linear-gradient(135deg,rgba(26,20,16,.16) 0 12px,transparent 12px 24px);pointer-events:none}
@media (max-width:720px){.ew-hero,.ew-steps,.ew-honest{grid-template-columns:1fr}}
`

const card = ({ title = 'Ceramic pour-over set', price = '$34.00', buy = 'Add to cart', building = false } = {}) => `<div class="ew-card">
  <div class="ew-card__window${building ? ' ew-skel' : ''}">${building ? '' : PHOTO}</div>
  ${building ? '<div class="ew-card__line ew-skel"></div><div class="ew-card__line ew-skel" style="width:35%"></div>' : `<p class="ew-card__title">${title}</p><span class="ew-card__price">${price}</span>`}
  <a class="ew-btn ew-btn--on-orange ew-btn--block" href="#" ${building ? 'aria-disabled="true" style="opacity:.35"' : ''}>${buy}</a>
</div>`

const PRICE_LINE = 'Free to install. Your first 2 product pages are free, then $3 per product page.'
const previews = {
  Logo: doc('<!-- @dsCard group="Brand" height=420 subtitle="The product card mark, the wordmark and the lockups" -->', 'Logo', `<div class="ew-col" style="gap:22px">
  <div class="ew-row" style="gap:28px;align-items:flex-end">${[120, 64, 40, 28].map(s => tileAt(ICON, s)).join('')}${tileAt(SMALL, 20)}${tileAt(SMALL, 16)}</div>
  <div class="ew-row" style="gap:16px">
    <div style="background:var(--white-fixed);border:1px solid var(--line);border-radius:16px;padding:22px 26px">${at(files['ecomwerce-lockup.svg'], 230, 39)}</div>
    <div style="background:var(--ink-fixed);border-radius:16px;padding:22px 26px">${at(files['ecomwerce-lockup-white.svg'], 230, 39)}</div>
    <div style="background:var(--orange);border-radius:16px;padding:22px 26px">${at(files['ecomwerce-lockup-on-orange.svg'], 196, 39)}</div>
  </div>
  <p class="ew-note">Tile sizes 120, 64, 40, 28; the small version at 20 and 16. Lockups on white, on ink and on orange (the mark drops its tile on an orange field).</p>
</div>`),
  AppIcon: doc('<!-- @dsCard group="Brand" height=440 subtitle="The Shopify App Store icon: 1200 px, 16-unit grid, glyph inside the 750-900 px band" -->', 'App icon', `<div class="ew-row" style="gap:28px;align-items:flex-start">
  <div style="width:300px;max-width:100%">${at(files['ecomwerce-icon-construction.svg'], 300)}</div>
  <div class="ew-col" style="gap:16px;max-width:380px">
    <span class="ew-eyebrow">Where Shopify shows it</span>
    <div class="ew-row" style="gap:12px;background:#fff;border:1px solid #e6e0db;border-radius:12px;padding:12px;color:#1A1410">${tileAt(ICON, 52)}<div><b style="font-weight:600">Ecomwerce: AI Product Pages</b><div style="font-size:13px;color:#616161">Free to install</div></div></div>
    <div class="ew-row" style="gap:8px;background:#ebebeb;border-radius:12px;padding:10px 12px;color:#303030;font-size:13px">${tileAt(ICON, 20)}<b style="font-weight:600">Ecomwerce</b><span style="margin-left:auto;color:#616161">admin navigation, 20 px</span></div>
    <div class="ew-row" style="gap:10px;font-size:13px;color:var(--text-2)">${`<span style="width:40px;height:40px;border-radius:50%;overflow:hidden;display:inline-block">${at(ICON, 40)}</span>`}<span>Ad account avatar: the glyph fits inside the circle crop.</span></div>
    <p class="ew-note">Upload ecomwerce-icon-1200.png: square, no rounded corners (Shopify rounds them), no text.</p>
  </div>
</div>`),
  Button: doc('<!-- @dsCard group="Actions" height=200 subtitle="Pill buttons: primary, secondary, on orange, link" -->', 'Button', `<div class="ew-col" style="gap:18px">
  <div class="ew-row"><a class="ew-btn ew-btn--lg" href="#">Install free</a><a class="ew-btn" href="#">Install free</a><a class="ew-btn ew-btn--sm" href="#">Install free</a><a class="ew-btn ew-btn--secondary" href="#">See a sample page</a><a class="ew-link" href="#">How pricing works</a></div>
  <div class="ew-stage ew-row" style="padding:20px"><a class="ew-btn ew-btn--on-orange" href="#">Install free</a><a class="ew-btn ew-btn--on-orange ew-btn--sm" href="#">Add to cart</a><span style="font-size:14px;color:var(--ink-fixed)">On orange, buttons are always ink.</span></div>
</div>`),
  ProductCard: doc('<!-- @dsCard group="Brand" height=470 subtitle="The mark grown into a page: photo window, title, price, buy button on the orange stage" -->', 'Product card', `<div class="ew-row" style="gap:20px;align-items:stretch">
  <div class="ew-stage" style="padding:32px;width:340px;max-width:100%">${card()}</div>
  <div class="ew-stage" style="padding:32px;width:340px;max-width:100%">${card({ building: true })}</div>
  <div class="ew-col" style="max-width:260px;justify-content:center"><span class="ew-eyebrow">States</span><p class="ew-p">Finished page, and the build moment: the window and lines fill in, then the button appears. With reduced motion, show the finished card.</p></div>
</div>`),
  Hero: doc('<!-- @dsCard group="Landing" height=560 width=1200 subtitle="The landing first screen: promise, price sentence, one action, the product card" -->', 'Hero', `<section class="ew-hero" style="max-width:1160px;margin:0 auto;padding:24px 0">
  <div class="ew-hero__text">
    <span class="ew-eyebrow">Shopify app for product testers</span>
    <h1 class="ew-h" style="font-size:68px;line-height:.98">A product page for every product you test.</h1>
    <p class="ew-p" style="font-size:20px;line-height:1.5">Pick a product from your catalog. Ecomwerce writes the page in your own theme, you preview it and decide when it goes live.</p>
    <div class="ew-row"><a class="ew-btn ew-btn--lg" href="#">Install free</a><a class="ew-btn ew-btn--secondary ew-btn--lg" href="#">See a sample page</a></div>
    <p class="ew-note">${PRICE_LINE}</p>
  </div>
  <div class="ew-stage ew-hero__stage">${card()}</div>
</section>`),
  Steps: doc('<!-- @dsCard group="Landing" height=260 width=1100 subtitle="How it works: three real steps, so the numbers mean order" -->', 'Steps', `<ol class="ew-steps">
  <li class="ew-step"><span class="ew-step__n">01</span><h3 class="ew-h" style="font-size:24px">Pick a product</h3><p class="ew-p">Choose a product from your Shopify catalog. Its photos and details are the starting point.</p></li>
  <li class="ew-step"><span class="ew-step__n">02</span><h3 class="ew-h" style="font-size:24px">Ecomwerce writes the page</h3><p class="ew-p">Headline, benefits, FAQ and sections, in your own theme. About two minutes per page.<sup>1</sup></p></li>
  <li class="ew-step"><span class="ew-step__n">03</span><h3 class="ew-h" style="font-size:24px">Preview, then go live</h3><p class="ew-p">See the page on your store first. It goes live only when you press Go live.</p></li>
</ol>
<p class="ew-note" style="margin-top:18px">1. Product page builds on our test store, October 2026: 3 of 4 finished within 1 min 57 s.</p>`),
  HonestyList: doc('<!-- @dsCard group="Landing" height=330 width=1000 subtitle="Real data only: what Ecomwerce never adds, and what stays yours" -->', 'Honesty list', `<div class="ew-honest">
  <div class="ew-honest__col ew-never"><h3 class="ew-h" style="font-size:24px">Never added by Ecomwerce</h3><ul>
    <li>${luc('x')}Invented reviews or star ratings</li><li>${luc('x')}Review counts and "people bought this" lines</li><li>${luc('x')}Stock bars and countdown timers</li><li>${luc('x')}"Verified" badges</li></ul></div>
  <div class="ew-honest__col ew-always"><h3 class="ew-h" style="font-size:24px">Always yours</h3><ul>
    <li>${luc('check')}Your photos and product data</li><li>${luc('check')}Your real reviews, when you add them</li><li>${luc('check')}Your theme, and your click to go live</li></ul></div>
</div>`),
  PricingCard: doc('<!-- @dsCard group="Landing" height=420 subtitle="Pay as you go: the same price sentence as the listing and the app" -->', 'Pricing card', `<div class="ew-price">
  <span class="ew-eyebrow">Pricing</span>
  <h3 class="ew-h" style="font-size:28px">Pay as you go</h3>
  <div class="ew-price__big"><b>$3</b><span class="ew-num">per product page</span></div>
  <ul><li>${luc('check')}Free to install, no monthly fee</li><li>${luc('check')}Your first 2 product pages are free</li><li>${luc('check')}Monthly cap of $60</li><li>${luc('check')}Billed on your Shopify invoice</li></ul>
  <a class="ew-btn ew-btn--block" href="#">Install free</a>
</div>`),
  FAQ: doc('<!-- @dsCard group="Landing" height=380 subtitle="Questions in the merchant\'s words; answers are drafts to verify before launch" -->', 'FAQ', `<div class="ew-faq">
  <details open><summary>Does it change my live store?</summary><p>No. Ecomwerce prepares the page and shows you a preview. Your store changes only when you press Go live.</p></details>
  <details><summary>Do you add reviews?</summary><p>Only real ones. Ecomwerce never invents reviews, ratings or counters.</p></details>
  <details><summary>What does it cost?</summary><p>${PRICE_LINE} The monthly cap is $60.</p></details>
  <details><summary>Which languages does it write in?</summary><p>English for now.</p></details>
</div>`),
  ListingImage: doc('<!-- @dsCard group="Listing" height=470 width=1200 subtitle="App Store feature image and screenshot frame, 1600 x 900, drawn at 0.36" -->', 'Listing image', `<div class="ew-frames">
  <div style="width:576px;height:324px"><div class="ew-frame" style="width:1600px;height:900px;transform:scale(.36);background:var(--orange);display:grid;grid-template-columns:1fr 1fr;align-items:center;padding:0 110px;gap:60px;color:var(--ink-fixed)">
    <div style="display:flex;flex-direction:column;gap:28px"><span style="font:500 28px var(--font-mono);letter-spacing:.06em;text-transform:uppercase">Ecomwerce</span><h2 class="ew-h" style="font-size:96px;line-height:.98">Your product, as a page in your theme</h2></div>
    <div style="justify-self:center;width:420px;height:760px;border-radius:56px;background:#1A1410;padding:18px;box-shadow:0 30px 60px -30px rgba(0,0,0,.5)"><div style="background:#fff;border-radius:40px;height:100%;overflow:hidden;display:flex;flex-direction:column"><div style="aspect-ratio:1">${PHOTO}</div><div style="padding:26px;display:flex;flex-direction:column;gap:14px"><b style="font:800 34px/1.1 var(--font-display);color:#1A1410">Ceramic pour-over set</b><span style="font:500 24px var(--font-mono);color:#1A1410">$34.00</span><span style="height:14px;border-radius:9px;background:#EDE7E1"></span><span style="height:14px;width:70%;border-radius:9px;background:#EDE7E1"></span><span style="margin-top:8px;height:72px;border-radius:999px;background:#1A1410;color:#fff;display:grid;place-items:center;font:600 26px var(--font-sans)">Add to cart</span></div></div></div>
  </div></div>
  <div style="width:576px;height:324px"><div class="ew-frame" style="width:1600px;height:900px;transform:scale(.36);background:var(--surface-2);padding:90px 110px;display:flex;flex-direction:column;gap:48px">
    <h2 class="ew-h" style="font-size:72px;color:var(--text)">Pick a product from your catalog</h2>
    <div style="flex:1;background:#fff;border-radius:28px;border:2px solid #E7E1DB;padding:40px;display:flex;flex-direction:column;gap:22px"><span style="height:22px;width:30%;border-radius:11px;background:#E7E1DB"></span>${[1, 2, 3].map(() => '<div style="display:flex;gap:22px;align-items:center"><span style="width:64px;height:64px;border-radius:12px;background:#F3EEE8"></span><span style="height:18px;width:40%;border-radius:9px;background:#EDE7E1"></span></div>').join('')}<span style="margin-top:auto;font:500 24px var(--font-mono);color:#736963">real UI crop of the builder goes here, no browser chrome</span></div>
  </div></div>
</div>`),
  AdCreative: doc('<!-- @dsCard group="Ads" height=560 width=1200 subtitle="1:1, 4:5 and 9:16 at real pixels, drawn at 0.25; the dashed box is the 9:16 safe zone" -->', 'Ad creative', `<div class="ew-frames" style="align-items:flex-end">
  ${[['1:1', 1080, 1080], ['4:5', 1080, 1350], ['9:16', 1080, 1920]].map(([n, w, h]) => {
    const tall = n === '9:16'; const top = tall ? 270 : 70
    return `<div class="ew-col" style="gap:8px"><div style="width:${w / 4}px;height:${h / 4}px"><div class="ew-frame" style="width:${w}px;height:${h}px;transform:scale(.25);background:var(--orange);color:var(--ink-fixed)">
      <div style="position:absolute;left:${tall ? 120 : 70}px;right:${tall ? 140 : 70}px;top:${top}px;display:flex;flex-direction:column;gap:36px;align-items:flex-start">
        ${at(files['ecomwerce-lockup-on-orange.svg'], 300, 60)}
        <h2 class="ew-h" style="font-size:${tall ? 96 : 88}px;line-height:.98">A product page for every product you test.</h2>
      </div>
      <div style="position:absolute;left:50%;transform:translateX(-50%);${n === '1:1' ? 'bottom:-170px;width:560px' : n === '4:5' ? 'bottom:-60px;width:600px' : 'top:600px;width:400px'}"><div style="background:#fff;border-radius:40px;padding:28px;display:flex;flex-direction:column;gap:22px;box-shadow:0 30px 60px -30px rgba(0,0,0,.45)"><div style="aspect-ratio:1;border-radius:26px;overflow:hidden">${PHOTO}</div><b style="font:800 40px/1.1 var(--font-display);color:#1A1410">Ceramic pour-over set</b><span style="height:84px;border-radius:999px;background:#1A1410;color:#fff;display:grid;place-items:center;font:600 30px var(--font-sans)">Add to cart</span></div></div>
      ${tall ? '<div class="ew-unsafe" style="top:0;height:270px"></div><div class="ew-unsafe" style="bottom:0;height:670px"></div><div class="ew-safe" style="left:120px;right:140px;top:270px;bottom:670px"></div>' : ''}
    </div></div><span class="ew-note">${n} · ${w} x ${h}</span></div>`
  }).join('')}
</div>`),
}

// the cover: palette blocks and the product-card motif, the name bottom-left
const cover = `<!-- @dsCard height=288 -->
<!doctype html>
<html><head><meta charset="utf-8"><title>Cover</title>${FONTS}
<style>
html,body{margin:0;background:var(--surface,#fff)}
.c{position:relative;width:960px;height:288px;overflow:hidden;background:var(--surface,#fff)}
svg{position:absolute;inset:0}
.o{fill:var(--orange,#FF6A13)}.k{fill:var(--text,#1A1410)}.t{fill:var(--orange-tint,#FFEADB)}.w{fill:var(--white-fixed,#fff)}.b{fill:var(--ink-fixed,#1A1410)}.s{fill:var(--surface,#fff)}
.big{rx:var(--radius-l,24px)}.win{rx:var(--radius-m,14px)}
.name{position:absolute;left:40px;bottom:58px;margin:0;font:800 80px/.92 var(--font-display,"Gabarito",system-ui,sans-serif);letter-spacing:-.03em;color:var(--text,#1A1410)}
.tag{position:absolute;left:42px;bottom:30px;margin:0;font:400 14px/1.3 var(--font-sans,"Host Grotesk",system-ui,sans-serif);color:var(--text-3,#736963);max-width:440px}
</style></head>
<body><div class="c">
<svg viewBox="0 0 960 288" width="960" height="288" aria-hidden="true">
<!-- blocks: orange (radius-l) 312 x 304 bleeding off the top, text-colour slab 128 x 184, orange-tint 128 x 96
     arrangement: one tall orange slab with two satellites on the right, all right of x = 480
     pattern: the literal motif, the product card (photo window, title line, buy pill) built from radius-m and pills, because the mark is a product card
     steps and radii: gaps 16 (space-4), insets 40 / 48, window radius-m 14, slabs radius-l 24, pills half their height -->
<rect class="o big" x="496" y="-16" width="312" height="304" rx="24"/>
<rect class="w win" x="544" y="32" width="168" height="168" rx="14"/>
<rect class="w" x="544" y="216" width="118" height="16" rx="8"/>
<rect class="b" x="544" y="244" width="168" height="44" rx="22"/>
<rect class="k big" x="824" y="0" width="136" height="184" rx="24"/>
<rect class="s" x="848" y="128" width="88" height="32" rx="16"/>
<rect class="t big" x="824" y="200" width="136" height="104" rx="24"/>
</svg>
<p class="name">Ecomwerce</p>
<p class="tag">A product page for every product you test.</p>
</div></body></html>
`

await mkdir(DS + 'components', { recursive: true })
await writeFile(DS + 'components/bundle.css', bundleCss)
for (const [n, html] of Object.entries(previews)) { await mkdir(DS + `components/${n}`, { recursive: true }); await writeFile(DS + `components/${n}/preview.html`, html) }
await mkdir(DS + 'components/Cover', { recursive: true }); await writeFile(DS + 'components/Cover/preview.html', cover)
console.log('logo files:', Object.keys(files).length + pngs.length, '| previews:', Object.keys(previews).length + 1, '| lockup viewBox width', lkW)
