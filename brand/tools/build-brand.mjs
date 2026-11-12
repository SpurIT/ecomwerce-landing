// builds the Ecomwerce logo files (svg + png) and the design system previews from one geometry.
// run from the repo root: node brand/tools/build-brand.mjs
// needs playwright (repo devDependency) for the png exports; the wordmark outline comes from
// brand/tools/wordmark-path.json (made once by outline-wordmark.mjs from Gabarito ExtraBold).
import { readFile, writeFile, mkdir } from 'node:fs/promises'
// the comparison's facts, one source with the landing page (landing/src/data/competitors.mjs)
import { APPS as CMP_APPS, ROWS as CMP_ROWS, SOURCE as CMP_SOURCE } from '../../landing/src/data/competitors.mjs'
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
const FALLBACK = { orange: '#FF6A13', 'orange-text': '#C2410C', 'ink-fixed': '#1A1410', 'white-fixed': '#FFFFFF', surface: '#FFFFFF', 'surface-2': '#F5F3F0', text: '#1A1410', 'text-2': '#5E554F', 'text-3': '#736963', line: '#E7E1DB', 'control-border': '#8F857E', action: '#1A1410', 'on-action': '#FFFFFF', focus: '#1A1410', 'radius-m': '14px', 'radius-l': '24px', 'shadow-card': '0 1px 2px rgba(26,20,16,.06),0 10px 30px -14px rgba(26,20,16,.22)', 'heading-2': '30px', 'heading-3': '22px', 'text-lead': '20px', 'text-body': '17px', 'text-small': '15px', 'font-mono': "'Geist Mono',ui-monospace,monospace", 'font-display': "'Gabarito',system-ui,sans-serif", 'font-sans': "'Host Grotesk',system-ui,sans-serif" }
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

// the landing components (SiteHeader, SiteFooter, ConsentBanner, FinalCall, PageAnatomy), ProductCard's compact state
// and build motion, the type classes; staged in tasks/landing/components and approved 2026-11-10. Fallbacks added below.
const COMPACT = (s) => `${s}{display:grid;grid-template-columns:112px minmax(0,1fr);grid-template-rows:auto auto 1fr;gap:4px 14px;max-width:none}${s} .ew-card__window{grid-row:1/span 3;width:112px}${s} .ew-card__titlewrap{min-height:20px}${s} .ew-card__title{font-size:18px;line-height:1.15;margin:0}${s} .ew-card__buy{align-self:end;height:40px;font-size:14px}`
const LANDING_CSS = withFallbacks(`/* focus: a 2px surface gap, then a solid 2px focus ring */
.ew :where(a,button,summary,input):focus-visible{outline:none;box-shadow:0 0 0 2px var(--surface),0 0 0 4px var(--focus);border-radius:6px}
/* type: the tokens as classes; display-xl and display-l scale between 720 and 1440px and keep the token sizes at both ends */
.ew-display-xl{font:800 clamp(44px,4.4vw + 12px,72px)/.98 var(--font-display);letter-spacing:-.03em;margin:0;text-wrap:balance}
.ew-display-l{font:800 clamp(36px,2.6vw + 16px,52px)/1.02 var(--font-display);letter-spacing:-.025em;margin:0;text-wrap:balance}
.ew-heading-2{font:800 var(--heading-2)/1.15 var(--font-display);letter-spacing:-.02em;margin:0}
.ew-heading-3{font:700 var(--heading-3)/1.25 var(--font-display);letter-spacing:-.01em;margin:0}
.ew-lead{font-size:var(--text-lead);line-height:1.5;color:var(--text-2);margin:0;max-width:34em}
.ew-small{font-size:var(--text-small);line-height:1.5;color:var(--text-2);margin:0}
/* Button: a quiet text action beside a large button */
.ew-textlink{font:600 16px/1 var(--font-sans);color:var(--text);text-decoration:underline;text-underline-offset:4px;padding:12px 4px}
.ew-textlink:hover{color:var(--orange-text)}
/* Logo and the App Store badge: one of two files by theme */
.ew-dark-only{display:none!important}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .ew-light-only{display:none!important}:root:not([data-theme="light"]) .ew-dark-only{display:block!important}}
:root[data-theme="dark"] .ew-light-only{display:none!important}
:root[data-theme="dark"] .ew-dark-only{display:block!important}
/* ProductCard: the buy pill as a picture, the build motion, the compact state */
.ew-card__buy:not(a):not(button){pointer-events:none;cursor:default}
.ew-card__titlewrap{position:relative;min-height:24px}
.ew-card__titlewrap .ew-card__line{position:absolute;left:0;top:6px;width:70%;opacity:0}
.ew-card--build .ew-photo{animation:ew-fill .6s cubic-bezier(.2,.7,.2,1) .15s both}
.ew-card--build .ew-card__line{animation:ew-line 1.1s linear both}
.ew-card--build .ew-card__title{animation:ew-write .5s steps(18,end) .62s both}
.ew-card--build .ew-card__price{animation:ew-in .3s ease-out 1.05s both}
.ew-card--build .ew-card__buy{animation:ew-buy .35s ease-out 1.15s both}
@keyframes ew-fill{from{clip-path:inset(100% 0 0 0)}to{clip-path:inset(0)}}
@keyframes ew-line{0%,55%{opacity:1}100%{opacity:0}}
@keyframes ew-write{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0)}}
@keyframes ew-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
@keyframes ew-buy{from{opacity:.35}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.ew-card--build *{animation:none!important}}
${COMPACT('.ew-card--compact')}
@media (max-width:720px){${COMPACT('.ew-card--compact-sm')}}
/* SiteHeader */
.ew-header{position:sticky;top:0;z-index:20;background:var(--surface);border-bottom:1px solid var(--line)}
.ew-header__in{display:flex;align-items:center;justify-content:space-between;gap:16px;height:72px}
.ew-header__logo{display:block;line-height:0;border-radius:6px}
.ew-header__logo img,.ew-header__logo svg{display:block;height:32px;width:auto}
.ew-header__nav{display:flex;align-items:center;gap:20px}
.ew-header__link{font:500 15px/1 var(--font-sans);color:var(--text);text-decoration:none;padding:10px 4px}
.ew-header__link:hover{color:var(--orange-text);text-decoration:underline;text-underline-offset:4px}
/* FinalCall and the official badge */
.ew-final{padding:64px 48px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:28px}
.ew-final .ew-display-l{color:var(--ink-fixed);max-width:16em}
.ew-final__actions{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:28px}
.ew-final .ew-small{color:var(--ink-fixed)}
.ew-final :focus-visible{box-shadow:0 0 0 2px var(--orange),0 0 0 4px var(--ink-fixed)}
.ew-badge{display:inline-block;line-height:0;border-radius:6px}
.ew-badge img{display:block;height:56px;width:auto}
/* SiteFooter */
.ew-footer{background:var(--surface-2);padding:48px 0 40px}
.ew-footer__grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:24px;align-items:start}
.ew-footer__brand{grid-column:span 5;display:flex;flex-direction:column;gap:12px}
.ew-footer__brand img,.ew-footer__brand svg{height:28px;width:auto;align-self:flex-start}
.ew-footer__links{grid-column:span 4;list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.ew-footer__links a,.ew-footer__links button{display:inline-block;font:500 15px/1.5 var(--font-sans);color:var(--text);text-decoration:none;background:none;border:0;padding:4px 0;cursor:pointer;text-align:left}
.ew-footer__links a:hover,.ew-footer__links button:hover{text-decoration:underline;text-underline-offset:4px}
.ew-footer__badge{grid-column:span 3;justify-self:end}
.ew-footer__badge img{height:44px}
.ew-footer__legal{grid-column:1/-1;border-top:1px solid var(--line);padding-top:20px;display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 24px}
/* ConsentBanner */
.ew-consent{position:fixed;z-index:40;left:24px;bottom:24px;width:420px;max-width:calc(100% - 32px);background:var(--surface);color:var(--text);border:1px solid var(--line);border-radius:var(--radius-l);box-shadow:var(--shadow-card);padding:20px;display:flex;flex-direction:column;gap:14px}
.ew-consent[hidden],.ew-consent__part[hidden]{display:none}
.ew-consent__part{display:flex;flex-direction:column;gap:14px}
.ew-consent .ew-consent__title{font:600 17px/1.3 var(--font-sans);margin:0;color:var(--text)}
.ew-consent p{margin:0;font-size:var(--text-small);line-height:1.5;color:var(--text-2)}
.ew-consent__actions{display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.ew-consent__actions .ew-btn{flex:1 1 0;min-width:130px}
.ew-consent__more{display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:14px}
.ew-consent__more button,.ew-consent__more a{font:500 14px/1.4 var(--font-sans);color:var(--text);background:none;border:0;padding:6px 0;text-decoration:underline;text-underline-offset:3px;cursor:pointer}
.ew-consent__list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;border-top:1px solid var(--line)}
.ew-consent__list li{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:12px 0;border-bottom:1px solid var(--line)}
.ew-consent__list strong{display:block;font:600 15px/1.4 var(--font-sans)}
.ew-consent__list span{display:block;font-size:14px;line-height:1.45;color:var(--text-2)}
.ew-consent__list .ew-consent__note{font-size:13px;color:var(--text-3);margin-top:4px}
.ew-switch{appearance:none;-webkit-appearance:none;flex:none;width:44px;height:26px;border-radius:999px;background:var(--surface-2);box-shadow:inset 0 0 0 1.5px var(--control-border);position:relative;cursor:pointer;margin:2px 0 0}
.ew-switch::after{content:"";position:absolute;top:4px;left:4px;width:18px;height:18px;border-radius:999px;background:var(--control-border);transition:transform .15s}
.ew-switch:checked{background:var(--action);box-shadow:none}
.ew-switch:checked::after{transform:translateX(18px);background:var(--on-action)}
.ew-switch:disabled{opacity:.55;cursor:not-allowed}
@media (prefers-reduced-motion:reduce){.ew-switch::after{transition:none}}
/* PageAnatomy: a real page with labels on its parts; ew-ph is a layout placeholder, never for a published page */
.ew-anatomy{position:relative;margin:0;border:1px solid var(--line);border-radius:var(--radius-m);background:var(--surface-2);padding:24px}
.ew-anatomy__shot{display:grid;gap:12px;background:var(--surface);border-radius:10px;padding:16px;min-height:420px}
.ew-ph{border-radius:8px;background:repeating-linear-gradient(135deg,var(--line) 0 2px,transparent 2px 10px);display:flex;align-items:center;justify-content:center;font:500 12px/1.4 var(--font-mono);color:var(--text-3);text-align:center;padding:8px}
.ew-legend{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
.ew-legend li{display:flex;gap:12px;align-items:baseline}
.ew-legend b{flex:none;display:grid;place-items:center;width:24px;height:24px;border-radius:999px;background:var(--text);color:var(--surface);font:500 12px/1 var(--font-mono)}
/* PricingCard: the billing notes beside the card */
.ew-bill{list-style:none;margin:24px 0 0;padding:0;display:flex;flex-direction:column;gap:10px}
.ew-bill li{display:flex;gap:10px;align-items:flex-start;color:var(--text-2);font-size:var(--text-small);line-height:1.5}
.ew-bill li::before{content:"";flex:none;width:6px;height:6px;border-radius:999px;background:var(--text-3);margin-top:9px}
/* Steps: titles in heading-3, text in text-body */
.ew-step .ew-h{font-size:var(--heading-3);line-height:1.25}
.ew-step .ew-p{font-size:var(--text-body);line-height:1.6}
@media (max-width:720px){
.ew-display-xl{line-height:1}
.ew-header__in{height:56px}.ew-header__logo img,.ew-header__logo svg{height:28px}.ew-header__nav{gap:12px}
.ew-final{padding:40px 20px;gap:22px}.ew-badge img{height:48px}
.ew-footer__grid{grid-template-columns:1fr}.ew-footer__grid>*{grid-column:auto}.ew-footer__badge{justify-self:start}
.ew-consent{left:0;right:0;bottom:0;width:auto;max-width:none;border-radius:var(--radius-l) var(--radius-l) 0 0;border-width:1px 0 0;padding:18px 16px 20px}
.ew-anatomy__shot{min-height:360px}
}
@media (max-width:360px){.ew-header__link{display:none}}
`)

const card = ({ title = 'Ceramic pour-over set', price = '$34.00', buy = 'Add to cart', building = false } = {}) => `<div class="ew-card">
  <div class="ew-card__window${building ? ' ew-skel' : ''}">${building ? '' : PHOTO}</div>
  ${building ? '<div class="ew-card__line ew-skel"></div><div class="ew-card__line ew-skel" style="width:35%"></div>' : `<p class="ew-card__title">${title}</p><span class="ew-card__price">${price}</span>`}
  <a class="ew-btn ew-btn--on-orange ew-btn--block" href="#" ${building ? 'aria-disabled="true" style="opacity:.35"' : ''}>${buy}</a>
</div>`

const PRICE_LINE = 'Free to install. Your first 2 product pages are free, then $3 per product page.'
// the official "Find it on the Shopify App Store" badges, unaltered (brand/shopify/README.md): black for light grounds, white for dark
const BADGE = 'data:image/svg+xml;base64,' + (await readFile(ROOT + 'shopify/badge-shopify-app-store-dark.svg')).toString('base64')
const BADGE_WHITE = 'data:image/svg+xml;base64,' + (await readFile(ROOT + 'shopify/badge-shopify-app-store-light.svg')).toString('base64')
// both lockups at a tile height; the theme shows one (ew-light-only, ew-dark-only)
const lockups = (h) => ['ecomwerce-lockup.svg', 'ecomwerce-lockup-white.svg'].map((f, i) => files[f].replace('<svg ', `<svg class="${i ? 'ew-dark-only' : 'ew-light-only'}" width="${Math.round(h * lkW / 1200)}" height="${h}" style="height:${h}px" role="img" aria-label="Ecomwerce" `)).join('')
// the header's offer and Install (phase 5): "No monthly fee" links to pricing, the button carries the free pages
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'
// top: the hero's Install is in view, so the header holds the lockup and "No monthly fee"; scrolled: the button joins it
// (on phones the button takes the offer's place)
// the header's chips, two or three words each (phase 5, operator: marketing, not descriptions; one to how it works, one
// to the comparison): "Zero setup" (the builder's defaults: nothing to set before the first build), "Go live free"
// (publishing is never charged, pages are; every other app in the comparison needs a paid plan to publish), "No
// monthly fee" next to the button
const HEADER_CHIPS = [
  ['how', '#how', 'Zero setup', 'see how it works'],
  ['compare', '#compare', 'Go live free', 'see the comparison'],
  ['pricing', '#pricing', 'No monthly fee', 'see pricing'],
]
const headerChips = (base = '') => `<span class="ew-header__chips">${HEADER_CHIPS.map(([k, href, t, more]) => `<a class="ew-header__offer ew-header__offer--${k}" href="${base}${href}" aria-label="${t}, ${more}">${t}</a>`).join('')}</span>`
const headerIn = (h, state = 'scrolled') => `<a class="ew-header__logo" href="#">${lockups(h)}</a><nav class="ew-header__nav"><span class="ew-header__cta${state === 'top' ? ' ew-header__cta--top' : ''}">${headerChips()}<a class="ew-btn ew-header__go" href="#">Get 2 pages free${ARROW}</a></span></nav>`
const compactCard = ({ building = false } = {}) => `<div class="ew-stage" style="padding:16px;width:358px;max-width:100%"><div class="ew-card ew-card--compact">
  <div class="ew-card__window${building ? ' ew-skel' : ''}">${building ? '' : PHOTO}</div>
  ${building ? '<div class="ew-card__line ew-skel"></div><div class="ew-card__line ew-skel" style="width:35%"></div>' : '<p class="ew-card__title">Ceramic pour-over set</p><span class="ew-card__price">$34.00</span>'}
  <span class="ew-btn ew-btn--on-orange ew-btn--block ew-card__buy"${building ? ' style="opacity:.35"' : ''}>Add to cart</span>
</div></div>`
const SWITCH = (label, on, disabled) => `<input class="ew-switch" type="checkbox" role="switch"${on ? ' checked' : ''}${disabled ? ' disabled' : ''} aria-label="${label}">`
// phase 3 (2026-11-11, operator): Steps' pictured state with three drawn scenes, CostChart and ScopeList (tasks/landing/
// BRIEF-phase-3.md; ScopeList left with the scope block in phase 4). A scene is drawn at a nominal 360 x 270 and scales with its width: every size inside it is
// calc(var(--u) * n), with --u at 1cqi (3.6px at the nominal width) and at 3.6px where container units are unknown
// (Safari before 16, so iPhone in-app browsers there still draw the scene at its nominal size). Its colours are fixed,
// like the product card's, so it reads the same in both themes. Grey lines stand for text: a scene is a schematic,
// never a screenshot, and shows nothing the launch app does not do (no time, review, star or stock bar).
const u = (px) => `calc(var(--u) * ${+(px / 3.6).toFixed(3)})`
const FX = { ink: '#1A1410', white: '#FFFFFF', muted: '#5E554F', faint: '#736963', line: '#E9E2DB', tint: '#FFEADB', photo: '#F3EEE8', box: '#8F857E' }
const PHASE3_CSS = withFallbacks(`/* Steps, pictured: a drawn scene above each step's text */
.ew-steps--pictured{row-gap:48px}
.ew-steps--pictured .ew-step{border-top:0;padding-top:0;gap:20px}
.ew-step__pic{margin:0}
.ew-step__text{display:flex;flex-direction:column;gap:10px;padding-top:16px;border-top:2px solid var(--text)}
@media (min-width:721px) and (max-width:1099px){.ew-steps--pictured{grid-template-columns:1fr;row-gap:40px}.ew-steps--pictured .ew-step{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:32px;align-items:center}}
/* the scenes: the orange stage at 4:3, white panels with fixed colours */
.ew-scene{--u:1cqi;position:relative;display:block;aspect-ratio:4/3;container-type:inline-size;overflow:hidden;border-radius:var(--radius-l);background:var(--orange);color:${FX.ink}}
@supports not (width:1cqi){.ew-scene{--u:3.6px}}
:where(.ew-scene) span{display:block}
.ew-scene__panel{position:absolute;background:${FX.white};border-radius:${u(14)};box-shadow:var(--shadow-card)}
.ew-scene__label{font:500 ${u(11)}/1.3 var(--font-mono);letter-spacing:.06em;text-transform:uppercase;color:${FX.faint};white-space:nowrap}
.ew-scene__line{height:${u(8)};border-radius:999px;background:${FX.line}}
.ew-scene .ew-photo{display:block;width:100%;height:100%}
/* 01 pick: the catalog as a list, one product picked */
.ew-scene--pick .ew-scene__panel{left:${u(28)};right:${u(28)};top:${u(26)};bottom:${u(26)};padding:${u(14)};display:flex;flex-direction:column;gap:${u(10)}}
.ew-pick{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:${u(6)}}
.ew-pick li{display:flex;align-items:center;gap:${u(10)};height:${u(36)};padding:0 ${u(8)};border-radius:${u(10)}}
.ew-pick__box{flex:none;display:grid;place-items:center;width:${u(16)};height:${u(16)};border-radius:${u(4)};box-shadow:inset 0 0 0 ${u(1.5)} ${FX.box}}
.ew-pick__box svg{width:78%;height:78%}
.ew-pick__thumb{flex:none;width:${u(26)};height:${u(26)};border-radius:${u(6)};overflow:hidden;background:${FX.photo}}
.ew-pick .ew-scene__line{flex:none}
.ew-pick__on{background:${FX.tint}}
.ew-pick__on .ew-pick__box{background:${FX.ink};box-shadow:none;color:${FX.white}}
.ew-pick__name{flex:1 1 auto;min-width:0;font:600 ${u(13)}/1.2 var(--font-sans);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ew-pick__price{flex:none;font:500 ${u(12)}/1 var(--font-mono)}
/* 02 write: a product page that fills in; it runs past the stage's bottom edge */
.ew-scene--write .ew-scene__panel{left:${u(36)};right:${u(36)};top:${u(22)};bottom:${u(-20)};padding:${u(14)};display:flex;flex-direction:column;gap:${u(10)}}
.ew-write__top{display:flex;gap:${u(12)};align-items:flex-start}
.ew-write__photo{flex:none;width:${u(70)};aspect-ratio:1;border-radius:${u(9)};overflow:hidden;background:${FX.photo}}
.ew-write__head{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:${u(6)}}
.ew-write__h{height:${u(8)};border-radius:999px;background:${FX.ink}}
.ew-write__buy{height:${u(18)};width:52%;margin-top:${u(6)};border-radius:999px;background:${FX.ink}}
.ew-write__block{display:flex;flex-direction:column;gap:${u(5)}}
.ew-write__four{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:${u(6)}}
.ew-write__four span{height:${u(20)};border-radius:${u(6)};background:${FX.tint}}
.ew-write__q{display:flex;align-items:center;justify-content:space-between;gap:${u(8)};height:${u(12)}}
.ew-write__q::after{content:"+";font:400 ${u(12)}/1 var(--font-mono);color:${FX.faint}}
/* the build: the photo fills, the headline writes in, the buy pill appears, then benefits, reasons and the faq, once,
   about 1.8 s. armed (the landing's script, while the scene is below the viewport) holds the first frame */
.ew-scene--build .ew-write__photo .ew-photo{animation:ew-fill .55s cubic-bezier(.2,.7,.2,1) .1s both}
.ew-scene--build .ew-write__head .ew-scene__label{animation:ew-in .3s ease-out .35s both}
.ew-scene--build .ew-write__h{animation:ew-write .45s steps(14,end) .45s both}
.ew-scene--build .ew-write__h+.ew-write__h{animation-delay:.62s}
.ew-scene--build .ew-write__buy{animation:ew-buy .3s ease-out .85s both}
.ew-scene--build .ew-write__block{animation:ew-in .35s ease-out 1s both}
.ew-scene--build .ew-write__block+.ew-write__block{animation-delay:1.2s}
.ew-scene--build .ew-write__block+.ew-write__block+.ew-write__block{animation-delay:1.4s}
.ew-scene--armed,.ew-scene--armed *{animation-play-state:paused!important}
@media (prefers-reduced-motion:reduce){.ew-scene--build,.ew-scene--build *{animation:none!important}}
/* 03 live: the page on a phone, Go live, the current theme kept in the theme library */
.ew-live__phone{position:absolute;left:${u(34)};top:${u(22)};width:${u(118)};height:${u(236)};padding:${u(6)};border-radius:${u(22)};background:${FX.ink};box-shadow:var(--shadow-card)}
.ew-live__screen{height:100%;padding:${u(8)};border-radius:${u(17)};overflow:hidden;background:${FX.white};display:flex;flex-direction:column;gap:${u(7)}}
.ew-live__img{aspect-ratio:1;border-radius:${u(8)};overflow:hidden;background:${FX.photo}}
.ew-live__t{height:${u(8)};width:80%;border-radius:999px;background:${FX.ink}}
.ew-live__p{height:${u(6)};width:40%;border-radius:999px;background:${FX.line}}
.ew-live__buy{height:${u(16)};border-radius:999px;background:${FX.ink}}
.ew-live__l{height:${u(6)};border-radius:999px;background:${FX.line}}
.ew-live__side{position:absolute;left:${u(168)};right:${u(20)};top:${u(66)};display:flex;flex-direction:column;gap:${u(14)}}
.ew-live__go{display:flex;align-items:center;justify-content:center;height:${u(36)};border-radius:999px;background:${FX.ink};color:${FX.white};font:600 ${u(14)}/1 var(--font-sans)}
.ew-scene .ew-live__lib{position:static;padding:${u(12)};display:flex;flex-direction:column;gap:${u(8)}}
.ew-live__theme{display:flex;align-items:center;gap:${u(9)}}
.ew-live__swatch{flex:none;width:${u(24)};height:${u(24)};border-radius:${u(6)};background:${FX.tint};box-shadow:inset 0 0 0 ${u(1)} ${FX.line}}
.ew-live__theme b{display:block;font:600 ${u(12.5)}/1.2 var(--font-sans);color:${FX.ink}}
.ew-live__theme span span{font:400 ${u(11)}/1.3 var(--font-sans);color:${FX.muted}}
/* CostChart: every dollar on one scale, $0 to the top of an ad test; our bars orange, the ad test neutral; each bar
   labelled, no hover, no motion, so it reads the same without the script */
.ew-cost{--ew-cost-ours:var(--orange-text);display:flex;flex-direction:column;gap:20px;padding:28px;border:1px solid var(--line);border-radius:var(--radius-l);background:var(--surface)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .ew-cost{--ew-cost-ours:var(--orange)}}
:root[data-theme="dark"] .ew-cost{--ew-cost-ours:var(--orange)}
.ew-cost__head{display:flex;flex-direction:column;gap:8px}
.ew-cost__rows{margin:0;display:flex;flex-direction:column;gap:16px}
.ew-cost__row{position:relative}
.ew-cost__row dt{padding-right:4.5em;font-size:var(--text-small);line-height:1.4;color:var(--text)}
.ew-cost__row dd{margin:0}
.ew-cost__val{position:absolute;top:0;right:0;font:500 15px/1.4 var(--font-mono);font-variant-numeric:tabular-nums;color:var(--text);white-space:nowrap}
.ew-cost__track{display:flex;gap:2px;height:12px;margin-top:6px;border-radius:0 4px 4px 0;background:var(--surface-2)}
.ew-cost__bar{flex:none;display:block;height:100%;min-width:3px;border-radius:0 4px 4px 0;background:var(--ew-cost-ours)}
.ew-cost__bar--ads{background:var(--control-border);border-radius:0}
.ew-cost__bar--more{background:repeating-linear-gradient(135deg,var(--control-border) 0 2px,transparent 2px 6px)}
.ew-cost__row--ads{padding-bottom:16px;border-bottom:1px solid var(--line)}
.ew-cost__row--ads dt{padding-right:8.5em}
.ew-cost__notes{display:flex;flex-direction:column;gap:8px}
@media (max-width:720px){.ew-cost{padding:20px}}
`)

// the scenes' markup: one place for the previews; the landing's HowItWorks.astro writes the same markup
const PHOTO_D = PHOTO.replace(' role="img" aria-label="Product photo placeholder"', ' aria-hidden="true" focusable="false"')
const CHECK_W = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'
const SCENE_ALT = {
  pick: 'Illustration: products from your Shopify catalog in a list, with one of them, a ceramic pour-over set, picked.',
  write: 'Illustration: a product page filling in with a headline, benefits, reasons it stands out and an FAQ.',
  live: 'Illustration: the new product page on a phone, a Go live button, and your current theme kept in your theme library.',
}
const pickRow = (w) => `<li><span class="ew-pick__box"></span><span class="ew-pick__thumb"></span><span class="ew-scene__line" style="width:${w}%"></span></li>`
const scenePick = () => `<div class="ew-scene ew-scene--pick" role="img" aria-label="${SCENE_ALT.pick}"><div class="ew-scene__panel" aria-hidden="true"><span class="ew-scene__label">Shopify catalog</span><ul class="ew-pick">${pickRow(46)}<li class="ew-pick__on"><span class="ew-pick__box">${CHECK_W}</span><span class="ew-pick__thumb">${PHOTO_D}</span><span class="ew-pick__name">Ceramic pour-over set</span><span class="ew-pick__price">$34.00</span></li>${pickRow(38)}${pickRow(52)}</ul></div></div>`
const sceneWrite = ({ build = false } = {}) => `<div class="ew-scene ew-scene--write${build ? ' ew-scene--build' : ''}" role="img" aria-label="${SCENE_ALT.write}"><div class="ew-scene__panel" aria-hidden="true"><span class="ew-write__top"><span class="ew-write__photo">${PHOTO_D}</span><span class="ew-write__head"><span class="ew-scene__label">Headline</span><span class="ew-write__h"></span><span class="ew-write__h" style="width:62%"></span><span class="ew-write__buy"></span></span></span><span class="ew-write__block"><span class="ew-scene__label">Benefits</span><span class="ew-scene__line"></span><span class="ew-scene__line" style="width:78%"></span></span><span class="ew-write__block"><span class="ew-scene__label">Why it stands out</span><span class="ew-write__four"><span></span><span></span><span></span><span></span></span></span><span class="ew-write__block"><span class="ew-scene__label">FAQ</span><span class="ew-write__q"><span class="ew-scene__line" style="width:70%"></span></span><span class="ew-write__q"><span class="ew-scene__line" style="width:56%"></span></span></span></div></div>`
const sceneLive = () => `<div class="ew-scene ew-scene--live" role="img" aria-label="${SCENE_ALT.live}"><span class="ew-live__phone" aria-hidden="true"><span class="ew-live__screen"><span class="ew-live__img">${PHOTO_D}</span><span class="ew-live__t"></span><span class="ew-live__p"></span><span class="ew-live__buy"></span><span class="ew-live__l"></span><span class="ew-live__l" style="width:72%"></span></span></span><span class="ew-live__side" aria-hidden="true"><span class="ew-live__go">Go live</span><span class="ew-scene__panel ew-live__lib"><span class="ew-scene__label">Theme library</span><span class="ew-live__theme"><span class="ew-live__swatch"></span><span><b>Your current theme</b><span>Switch back any time</span></span></span></span></span></div>`
const STEPS3 = [
  ['01', 'Pick a product', 'Choose products from your Shopify catalog. Their photos and details are where the page starts.', scenePick()],
  ['02', 'Ecomwerce writes the page', 'A headline, benefits, reasons it stands out and an FAQ, in English, in a new theme on your store. It takes minutes. The app shows its estimate before you start, and you can close it while it works.', sceneWrite({ build: true })],
  ['03', 'Preview, then go live', 'See the page on your store first. It goes live only when you press Go live, and your current theme stays in your theme library.', sceneLive()],
]
// CostChart: the price facts once (docs/specs/billing.md BL-1); every bar on one scale, $0 to the top of an ad test
const PRICE = { perPage: 3, freePages: 2, capPages: 20 }
const SCALE = 350
const share = (usd) => `${+(usd / SCALE * 100).toFixed(3)}%`
const COST_ROWS = [['One product page', 1], ['A week at 3 products', 3], ['4 weeks at 3 products a week', 12], ['20 product pages, the monthly cap', PRICE.capPages]]
const ADS = { low: 150, high: 350, label: 'Ads to test one product', value: 'about $150-350' }
const costChart = () => `<div class="ew-cost"><div class="ew-cost__head"><h3 class="ew-heading-3">What testing costs</h3><p class="ew-small">After your ${PRICE.freePages} free product pages, each product you test is one product page at $${PRICE.perPage}.</p></div>
<dl class="ew-cost__rows"><div class="ew-cost__row ew-cost__row--ads"><dt>${ADS.label}</dt><dd><span class="ew-cost__val">${ADS.value}</span><span class="ew-cost__track" aria-hidden="true"><span class="ew-cost__bar ew-cost__bar--ads" style="width:${share(ADS.low)}"></span><span class="ew-cost__bar ew-cost__bar--more" style="width:calc(${share(ADS.high - ADS.low)} - 2px)"></span></span></dd></div>${COST_ROWS.map(([label, pages]) => `<div class="ew-cost__row"><dt>${label}</dt><dd><span class="ew-cost__val">$${pages * PRICE.perPage}</span><span class="ew-cost__track" aria-hidden="true"><span class="ew-cost__bar" style="width:${share(pages * PRICE.perPage)}"></span></span></dd></div>`).join('')}</dl>
<div class="ew-cost__notes"><p class="ew-note">At the $${PRICE.capPages * PRICE.perPage} cap, building pauses until your next 30 days start.</p><p class="ew-note">Ads: what dropshippers report in Reddit posts from October 2025 to October 2026, a median of $50 a day for a median of 3 days, up to the $250-350 a much-upvoted post calls the most suggested test budget.</p></div></div>`
// phase 4 (2026-11-11, operator): the page sells to ad traffic (tasks/landing/BRIEF-phase-4.md). PageAnatomy gets a
// drawn state in the scenes' style (scene units, fixed colours, the placeholder product, grey lines for text) with six
// numbered parts and a legend that says what each part does; it stays still and is replaced by the real screenshot
// when g3 clears. ComparisonTable: apps in columns, questions in rows, Ecomwerce first and marked (a tint, and our app
// icon before our name in the head row: the small version, as at 20 px in Logo; never another app's icon); at 720px and below
// one card per question (ew-compare--stacked forces that layout in a preview). Its facts come from
// landing/src/data/competitors.mjs, never typed here; the landing's Anatomy.astro and Compare.astro write the same markup.
const STACKED = (c) => `${c}{border:0;border-radius:0;background:none;overflow:visible}
${c} table,${c} tbody,${c} tr,${c} th,${c} td{display:block;width:auto}
${c} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
${c} tbody{display:flex;flex-direction:column;gap:12px}
${c} tbody tr{border:1px solid var(--line);border-radius:var(--radius-m);background:var(--surface);overflow:hidden}
${c} tbody th{width:auto;padding:14px 16px 10px;font-size:var(--text-body)}
${c} td{display:grid;grid-template-columns:6.5em minmax(0,1fr);gap:12px;padding:10px 16px;border-top:1px solid var(--line)}
${c} td::before{content:attr(data-label);font-weight:500;color:var(--text-2)}
${c} td.ew-compare__us::before{color:var(--text)}`
const PHASE4_CSS = withFallbacks(`/* PageAnatomy, drawn (until g3): a tall product page on the orange stage, six numbered parts; still, no motion */
.ew-anatomy--drawn{margin:0}
.ew-scene--anatomy{aspect-ratio:4/5}
.ew-scene--anatomy .ew-scene__panel{left:${u(30)};right:${u(30)};top:${u(26)};bottom:${u(-18)};padding:${u(16)};display:flex;flex-direction:column;gap:${u(14)}}
.ew-an__top{display:flex;gap:${u(12)};align-items:flex-start}
.ew-an__photo{flex:none;width:${u(112)};aspect-ratio:1;border-radius:${u(9)};overflow:hidden;background:${FX.photo}}
.ew-an__info{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:${u(12)}}
.ew-an__part{position:relative;display:flex;flex-direction:column;gap:${u(6)}}
.ew-an__price{height:${u(7)};width:38%;border-radius:999px;background:${FX.muted}}
.ew-scene .ew-an__chips{display:flex;gap:${u(5)}}
.ew-an__chips span{width:${u(24)};height:${u(13)};border-radius:999px;box-shadow:inset 0 0 0 ${u(1.2)} ${FX.box}}
.ew-an__buy{height:${u(20)};border-radius:999px;background:${FX.ink}}
.ew-scene .ew-an__ben{display:flex;flex-direction:column;gap:${u(5)}}
.ew-scene .ew-an__why{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:${u(8)}}
.ew-an__img{position:relative;height:${u(64)};border-radius:${u(8)};overflow:hidden;background:${FX.photo}}
.ew-scene .ew-an__four{display:grid;grid-template-columns:1fr 1fr;gap:${u(5)}}
.ew-an__four span{height:${u(29.5)};border-radius:${u(6)};background:${FX.tint}}
.ew-scene .ew-mark{position:absolute;left:${u(-12)};top:${u(-9)};z-index:1;display:grid;place-items:center;width:${u(20)};height:${u(20)};border-radius:999px;background:${FX.ink};color:${FX.white};font:500 ${u(11)}/1 var(--font-mono);box-shadow:0 0 0 ${u(2)} ${FX.white}}
.ew-scene .ew-an__img .ew-mark{left:${u(6)};top:${u(6)}}
.ew-an__part>.ew-scene__label{padding-left:${u(13)}}
/* the legend with what each part does */
.ew-legend--described{gap:18px}
.ew-legend--described li{align-items:flex-start}
.ew-legend--described b{margin-top:1px}
.ew-legend__t{display:block;font-weight:600;line-height:1.4;color:var(--text)}
.ew-legend__d{display:block;margin-top:2px;font-size:var(--text-small);line-height:1.5;color:var(--text-2)}
/* ComparisonTable: apps in columns, questions in rows, Ecomwerce first and marked with a tint of orange */
.ew-compare{--ew-compare-us:var(--surface-2);border:1px solid var(--line);border-radius:var(--radius-l);background:var(--surface);overflow:hidden}
@supports (background:color-mix(in srgb,red 10%,white)){.ew-compare{--ew-compare-us:color-mix(in srgb,var(--orange) 9%,var(--surface))}}
.ew-compare table{width:100%;border-collapse:collapse;table-layout:fixed}
.ew-compare th,.ew-compare td{padding:16px 18px;text-align:left;vertical-align:top;font-size:var(--text-small);line-height:1.45;font-weight:400;color:var(--text)}
.ew-compare tbody tr{border-top:1px solid var(--line)}
.ew-compare thead th{padding-top:20px;padding-bottom:14px;font:600 var(--text-body)/1.3 var(--font-sans)}
.ew-compare thead td,.ew-compare tbody th{width:20%}
.ew-compare tbody th{font-weight:600}
.ew-compare .ew-compare__us{background:var(--ew-compare-us);font-weight:600}
/* our app icon before our name; hidden below 860px, where a column no longer fits it beside the name (phones show cards, without the head row) */
.ew-compare__icon{display:inline-block;width:20px;height:20px;margin-right:8px;vertical-align:middle}
@media (max-width:859px){.ew-compare__icon{display:none}}
.ew-compare__src{margin-top:14px}
@media (max-width:720px){${STACKED('.ew-compare')}}
${STACKED('.ew-compare.ew-compare--stacked')}
`)
const ANATOMY_ALT = 'Illustration: a product page with six numbered parts: a headline beside the photo, the price with variants and Add to cart, benefits, four reasons it stands out beside an image, and an FAQ.'
const LEGEND6 = [
  ['A hook headline', 'The first thing a visitor from your ad reads: what the product does for them.'],
  ['Your price, variants and Add to cart', 'Horizon’s own buy buttons, so the cart and checkout are Shopify’s.'],
  ['Benefits', 'What the buyer gets, in short lines they can scan.'],
  ['Four reasons it stands out', 'Why this product, set beside an image.'],
  ['AI images, if you want them', 'On by default. You can switch them off before a build.'],
  ['An FAQ', 'Up to 5 answers to the questions that hold a buyer back.'],
]
const anatomyLegend = () => `<ol class="ew-legend ew-legend--described">${LEGEND6.map(([t, d], i) => `<li data-part="${i + 1}"><b>${i + 1}</b><span><span class="ew-legend__t">${t}</span><span class="ew-legend__d">${d}</span></span></li>`).join('')}</ol>`
const mark = (n) => `<span class="ew-mark">${n}</span>`
const anatomyDrawn = () => `<figure class="ew-anatomy--drawn"><div class="ew-scene ew-scene--anatomy" role="img" aria-label="${ANATOMY_ALT}"><div class="ew-scene__panel" aria-hidden="true"><span class="ew-an__top"><span class="ew-an__photo">${PHOTO_D}</span><span class="ew-an__info"><span class="ew-an__part" data-part="1">${mark(1)}<span class="ew-write__h"></span><span class="ew-write__h" style="width:62%"></span></span><span class="ew-an__part" data-part="2">${mark(2)}<span class="ew-an__price"></span><span class="ew-an__chips"><span></span><span></span><span></span></span><span class="ew-an__buy"></span></span></span></span><span class="ew-an__part" data-part="3">${mark(3)}<span class="ew-scene__label">Benefits</span><span class="ew-an__ben"><span class="ew-scene__line"></span><span class="ew-scene__line" style="width:84%"></span><span class="ew-scene__line" style="width:70%"></span></span></span><span class="ew-an__part" data-part="4">${mark(4)}<span class="ew-scene__label">Why it stands out</span><span class="ew-an__why"><span class="ew-an__img" data-part="5">${mark(5)}${PHOTO_D}</span><span class="ew-an__four"><span></span><span></span><span></span><span></span></span></span></span><span class="ew-an__part" data-part="6">${mark(6)}<span class="ew-scene__label">FAQ</span><span class="ew-write__q"><span class="ew-scene__line" style="width:70%"></span></span><span class="ew-write__q"><span class="ew-scene__line" style="width:56%"></span></span><span class="ew-write__q"><span class="ew-scene__line" style="width:62%"></span></span></span></div></div></figure>`
const others = CMP_APPS.filter((a) => !a.us).map((a) => a.name)
const CMP_LABEL = `Ecomwerce compared with ${others.slice(0, -1).join(', ')} and ${others.at(-1)}`
// decorative: the name beside it is the text; Compare.astro writes the same string
const CMP_ICON = `<svg class="ew-compare__icon" viewBox="0 0 1200 1200" width="20" height="20" aria-hidden="true" focusable="false"><rect width="1200" height="1200" rx="264" fill="${C.orange}"/>${rect(GS.window, C.white)}${rect(GS.buy, C.ink)}</svg>`
const compareTable = ({ stacked = false } = {}) => `<div class="ew-compare${stacked ? ' ew-compare--stacked' : ''}"><table role="table" aria-label="${CMP_LABEL}"><thead role="rowgroup"><tr role="row"><td role="cell"></td>${CMP_APPS.map((a) => `<th role="columnheader" scope="col"${a.us ? ' class="ew-compare__us"' : ''}>${a.us ? CMP_ICON : ''}${a.name}</th>`).join('')}</tr></thead><tbody role="rowgroup">${CMP_ROWS.map(([k, label]) => `<tr role="row"><th role="rowheader" scope="row">${label}</th>${CMP_APPS.map((a) => `<td role="cell"${a.us ? ' class="ew-compare__us"' : ''} data-label="${a.name}">${a.cells[k]}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`

// ---------- the hero build (phase 5, 2026-11-12, operator: longer, more of the mark, a before and after) ----------
// The stage opens as the app icon; the mark turns into the product card (before: what a theme's product page starts
// with); then Ecomwerce writes the page around it (after: a hook headline, variants, benefits, four reasons, an FAQ).
// Once, about 4.7 s, in css, so it plays without the script too and ends on the finished page; the landing's script
// adds a Before / After switch that puts the card back or writes the page again. Geometry in units of 1% of the
// stage's width (--u): a square stage above 900px (the icon's shape), a landscape one below (the card on its side).
const hu = (n) => (Math.abs(n) < 1e-9 ? '0' : `calc(var(--u)*${+n.toFixed(3)})`)
const hpos = (b) => `left:${hu(b.x)};top:${hu(b.y)}${b.w != null ? `;width:${hu(b.w)}` : ''}${b.h != null ? `;height:${hu(b.h)}` : ''}`
const hmove = (a, b, sx = 1, sy = sx) => `translate(${hu(b.x - a.x)},${hu(b.y - a.y)})${sx !== 1 || sy !== 1 ? ` scale(${+sx.toFixed(4)}${sy !== sx ? `,${+sy.toFixed(4)}` : ''})` : ''}`
const glyphIn = (t, e) => ({ x: t.x + e.x / 1200 * t.s, y: t.y + e.y / 1200 * t.s, w: e.w / 1200 * t.s, h: e.h / 1200 * t.s })
// after = where the parts rest (the html's finished page); before = the product card; the mark = the icon's glyph in the tile
const HB = {
  sq: { H: 100, tile: { x: 0, y: 0, s: 100 }, sec: 2.3, chip: { w: 7.5, h: 4.4, g: 1.5 }, buyF: 2.56, ui: { y: 87.5, h: 7.6 },
    after: { win: { x: 6, y: 6, w: 38 }, tw: { x: 48, y: 6, f: 3.1 }, price: { x: 48, y: 24.2, f: 2.9 }, buy: { x: 48, y: 36, w: 40, h: 8 },
      h1: { x: 48, y: 12, w: 46, h: 3.8 }, h2: { x: 48, y: 17.4, w: 32, h: 3.8 }, chips: { x: 48, y: 29.8 }, secs: { y: 49.5, x: [6, 37, 68], w: 26 } },
    before: { win: { x: 25, y: 5.5, w: 50 }, tw: { x: 25, y: 58.5, f: 4.3 }, price: { x: 25, y: 65.5, f: 3.2 }, buy: { x: 25, y: 72, w: 50, h: 10 }, line: { x: 25, y: 59.9, w: 35, h: 2.3 } } },
  ls: { H: 65, tile: { x: 17.5, y: 0, s: 65 }, sec: 2.4, chip: { w: 6, h: 3.4, g: 1.2 }, buyF: 2.4, ui: { y: 54, h: 8 },
    after: { win: { x: 4.5, y: 4.5, w: 26 }, tw: { x: 34.5, y: 4.4, f: 3.6 }, price: { x: 34.5, y: 18.6, f: 3 }, buy: { x: 34.5, y: 23.6, w: 34.5, h: 6.9 },
      h1: { x: 34.5, y: 10, w: 61, h: 2.9 }, h2: { x: 34.5, y: 14, w: 42, h: 2.9 }, chips: { x: 47.5, y: 18.7 }, secs: { y: 34.5, x: [4.5, 36.5, 68.5], w: 27 } },
    before: { win: { x: 4.5, y: 13, w: 31 }, tw: { x: 39.5, y: 13.4, f: 5 }, price: { x: 39.5, y: 21, f: 3.9 }, buy: { x: 39.5, y: 32.8, w: 56, h: 11.2 }, line: { x: 39.5, y: 15, w: 39, h: 2.6 } } },
}
const hbLayout = (L) => {
  const A = L.after, B = L.before, mw = glyphIn(L.tile, G.window), ml = glyphIn(L.tile, G.title), mb = glyphIn(L.tile, G.buy)
  return [
    `.ew-build{aspect-ratio:100/${L.H};--scan:${hu(L.H + 3)}}`,
    `.ew-b-win{${hpos({ ...A.win, h: A.win.w })};--mk:${hmove(A.win, mw, mw.w / A.win.w)};--bf:${hmove(A.win, B.win, B.win.w / A.win.w)}}`,
    `.ew-b-tw{${hpos(A.tw)};font-size:${hu(A.tw.f)};--bf:${hmove(A.tw, B.tw, B.tw.f / A.tw.f)}}`,
    `.ew-b-price{${hpos(A.price)};font-size:${hu(A.price.f)};--bf:${hmove(A.price, B.price, B.price.f / A.price.f)}}`,
    `.ew-b-buy{${hpos(A.buy)};font-size:${hu(L.buyF)};--bf:${hmove(A.buy, B.buy, B.buy.w / A.buy.w)}}`,
    `.ew-b-ml{${hpos(ml)};--to:${hmove(ml, B.line, B.line.w / ml.w, B.line.h / ml.h)}}`,
    `.ew-b-mb{${hpos(mb)};--to:${hmove(mb, B.buy, B.buy.w / mb.w, B.buy.h / mb.h)}}`,
    `.ew-b-h1{${hpos(A.h1)}}.ew-b-h2{${hpos(A.h2)}}`,
    `.ew-b-chips{${hpos(A.chips)};gap:${hu(L.chip.g)}}.ew-b-chips i{width:${hu(L.chip.w)};height:${hu(L.chip.h)}}`,
    `.ew-b-sec{top:${hu(A.secs.y)};width:${hu(A.secs.w)};font-size:${hu(L.sec)}}.ew-b-ben{left:${hu(A.secs.x[0])}}.ew-b-why{left:${hu(A.secs.x[1])}}.ew-b-faq{left:${hu(A.secs.x[2])}}`,
    `.ew-build__status,.ew-build__switch{top:${hu(L.ui.y)};height:max(32px,${hu(L.ui.h)})}`,
  ].join('\n')
}
const EASE = 'cubic-bezier(.2,.7,.2,1)', SWAY = 'cubic-bezier(.65,0,.35,1)'
const ON = '.ew-build:is(.ew-build--intro,.ew-build--replay)'
// the writing, in seconds after the card starts to move (2.2 s into the intro, at once on a replay)
const tAt = (s) => `calc(var(--t0) + ${s}s)`
const HERO_CSS = withFallbacks(`/* Hero: the build on the orange stage (phase 5). The parts rest where the finished page has them; the intro and the
   switch's "Before" move them with transforms and fade them, so the stage never shifts the layout. */
.ew-build{--u:1cqi;--t0:0s;position:relative;display:block;width:100%;padding:0;container-type:inline-size;overflow:hidden;border-radius:var(--radius-l);background:var(--orange);color:#1A1410}
@supports not (width:1cqi){.ew-build{--u:5.1px}}
.ew-build__art{position:absolute;inset:0}
.ew-build :where(span,i,b){display:block;font-style:normal}
.ew-b{position:absolute;transform-origin:0 0}
.ew-b-win{z-index:1;overflow:hidden;border-radius:12.5%;background:#FFFFFF;box-shadow:0 ${hu(1.2)} ${hu(3.4)} ${hu(-1.6)} rgba(26,20,16,.3)}
.ew-b-win .ew-photo{display:block;width:100%;height:100%}
.ew-b-win img.ew-photo{object-fit:cover}
.ew-b-tw{white-space:nowrap}
.ew-b-title{margin:0;font-family:var(--font-display);font-weight:800;font-size:1em;line-height:1.15;letter-spacing:-.015em;color:#1A1410}
.ew-b-price{font-family:var(--font-mono);font-weight:500;line-height:1.3;color:#1A1410;white-space:nowrap}
.ew-b-buy{display:flex;align-items:center;justify-content:center;border-radius:999px;background:#1A1410;color:#FFFFFF;font-family:var(--font-sans);font-weight:600;line-height:1;white-space:nowrap}
.ew-b-ml,.ew-b-mb{border-radius:999px;opacity:0}
.ew-b-ml{background:#FFFFFF}
.ew-b-mb{background:#1A1410}
.ew-b-h1,.ew-b-h2{border-radius:999px;background:#1A1410}
.ew-b-chips{display:flex}
.ew-b-chips i{border-radius:999px;background:#FFFFFF}
.ew-b-chips i:first-child{box-shadow:inset 0 0 0 ${hu(0.45)} #1A1410}
.ew-b-sec{display:flex;flex-direction:column;gap:.7em}
.ew-b-sec b{font-family:var(--font-mono);font-weight:500;font-size:1em;line-height:1.25;letter-spacing:.04em;text-transform:uppercase;color:#1A1410;white-space:nowrap}
.ew-b-ben i{--c:1.5em;position:relative;height:var(--c);display:flex;align-items:center;gap:.55em}
.ew-b-ben i::before{content:"";flex:none;width:var(--c);height:var(--c);border-radius:999px;background:#1A1410}
.ew-b-ben i::after{content:"";flex:0 1 auto;width:72%;height:.85em;border-radius:999px;background:#FFFFFF}
.ew-b-ben i:nth-of-type(2)::after{width:58%}.ew-b-ben i:nth-of-type(3)::after{width:66%}.ew-b-ben i:nth-of-type(4)::after{width:50%}
.ew-b-ben i span{position:absolute;left:calc(var(--c) / 2 - .28em);top:calc(var(--c) / 2 - .26em);width:.56em;height:.3em;border:solid #FFFFFF;border-width:0 0 .16em .16em;transform:rotate(-45deg)}
.ew-b-img{height:4.8em;border-radius:.6em;overflow:hidden;background:#F3EEE8}
.ew-b-img svg{display:block;width:100%;height:100%}
.ew-b-tiles{display:grid;grid-template-columns:1fr 1fr;gap:.7em}
.ew-b-tiles i{position:relative;height:2.9em;border-radius:.5em;background:#FFFFFF}
.ew-b-tiles i::before{content:"";position:absolute;left:.55em;top:.5em;width:1em;height:1em;border-radius:999px;background:#1A1410}
.ew-b-tiles i::after{content:"";position:absolute;left:.55em;right:.9em;bottom:.55em;height:.42em;border-radius:999px;background:#E9E2DB}
.ew-b-faq i{position:relative;height:1.7em;border-radius:999px;background:#FFFFFF}
.ew-b-faq i::before{content:"";position:absolute;left:.7em;top:50%;width:52%;height:.42em;margin-top:-.21em;border-radius:999px;background:#E9E2DB}
.ew-b-faq i:nth-of-type(2)::before{width:40%}.ew-b-faq i:nth-of-type(3)::before{width:47%}.ew-b-faq i:nth-of-type(4)::before{width:36%}
.ew-b-faq i::after{content:"+";position:absolute;right:.55em;top:50%;transform:translateY(-52%);font:500 1.25em/1 var(--font-mono);color:#1A1410}
.ew-b-scan{left:0;right:0;top:${hu(-3)};height:${hu(3)};opacity:0;background:linear-gradient(to bottom,rgba(255,255,255,0),rgba(255,255,255,.5));box-shadow:0 1px 0 #FFFFFF,0 0 ${hu(2)} rgba(255,255,255,.75);pointer-events:none}
/* the line under the stage's story (the intro only) and the switch the script shows */
.ew-build__status,.ew-build__switch{position:absolute;left:50%;transform:translateX(-50%);border-radius:999px;background:#FFFFFF;box-shadow:0 ${hu(0.6)} ${hu(2.4)} ${hu(-0.8)} rgba(26,20,16,.35)}
.ew-build__status{display:grid;place-items:center;padding:0 max(14px,${hu(3)});opacity:0;font-family:var(--font-mono);font-weight:500;font-size:max(11px,${hu(2.1)});line-height:1;letter-spacing:.06em;text-transform:uppercase;color:#1A1410;white-space:nowrap;pointer-events:none}
.ew-build__status>span{grid-area:1/1;display:flex;align-items:center;gap:.7em;opacity:0}
.ew-build__status i{flex:none;width:.75em;height:.75em;border-radius:999px;background:var(--orange)}
.ew-build__status>span:last-child i{width:.8em;height:.45em;border-radius:0;background:none;border:solid #1A1410;border-width:0 0 .17em .17em;transform:translateY(-.12em) rotate(-45deg)}
.ew-build__switch{display:grid;grid-template-columns:1fr 1fr;padding:3px}
.ew-build__switch[hidden]{display:none}
.ew-build__knob{position:absolute;left:3px;top:3px;bottom:3px;width:calc(50% - 3px);border-radius:999px;background:#1A1410;transform:translateX(100%);transition:transform .35s ${EASE}}
.ew-build.is-before .ew-build__knob{transform:none}
.ew-build__switch button{position:relative;margin:0;padding:0 max(14px,${hu(2.6)});min-width:64px;border:0;border-radius:999px;background:none;font-family:var(--font-sans);font-weight:600;font-size:max(13px,${hu(2.5)});line-height:1;color:#1A1410;cursor:pointer;transition:color .25s}
.ew-build:not(.is-before) .ew-build__switch [data-show="after"],.ew-build.is-before .ew-build__switch [data-show="before"]{color:#FFFFFF}
.ew-build__switch button:focus-visible{outline:none;box-shadow:0 0 0 2px #FFFFFF,0 0 0 4px #1A1410}
/* Before (the script): the card again, the writing hidden */
.ew-b-win,.ew-b-tw,.ew-b-price,.ew-b-buy{transition:transform .5s ${SWAY}}
.ew-b-h1,.ew-b-h2,.ew-b-chips,.ew-b-sec{transition:opacity .2s}
.ew-build.is-before :is(.ew-b-win,.ew-b-tw,.ew-b-price,.ew-b-buy){transform:var(--bf)}
.ew-build.is-before :is(.ew-b-h1,.ew-b-h2,.ew-b-chips,.ew-b-sec){opacity:0}
/* the intro: 0-0.6 s the icon; to 1.55 s the mark becomes the card (the window fills, the title writes in over the
   mark's line, the buy pill takes the mark's button, the price); to 2.2 s the card; then the writing below */
.ew-build--intro{--t0:2.2s;animation:ew-b-tile .55s ${EASE} .6s both}
.ew-build--intro .ew-b-ml{animation:ew-b-to .55s ${EASE} .6s both,ew-b-out .35s ease-in 1.1s both}
.ew-build--intro .ew-b-mb{animation:ew-b-to .55s ${EASE} .6s both,ew-b-out .2s ease-in 1.15s both}
.ew-build--intro .ew-b-win{animation:ew-b-mk .55s ${EASE} .6s both,ew-b-bf .55s ${SWAY} 2.2s forwards}
.ew-build--intro .ew-b-win .ew-photo{animation:ew-fill .6s ${EASE} .95s both}
.ew-build--intro .ew-b-title{animation:ew-write .5s steps(18,end) 1s both}
.ew-build--intro .ew-b-buy{animation:ew-b-bf .55s ${SWAY} 2.2s both,ew-b-in .25s ease-out 1.05s both}
.ew-build--intro .ew-b-price{animation:ew-b-bf .55s ${SWAY} 2.2s both,ew-b-in .3s ease-out 1.3s both}
.ew-build--intro .ew-b-tw,.ew-build--replay :is(.ew-b-win,.ew-b-tw,.ew-b-price,.ew-b-buy){animation:ew-b-bf .55s ${SWAY} var(--t0) both}
.ew-build--intro .ew-build__status{animation:ew-b-in .25s ease-out 1.3s both,ew-b-out .25s ease-in 4.45s forwards}
.ew-build--intro .ew-build__status>span:nth-child(1){animation:ew-b-in .2s ease-out 1.3s both,ew-b-out .15s ease-in 2.2s forwards}
.ew-build--intro .ew-build__status>span:nth-child(2){animation:ew-b-in .2s ease-out 2.25s both,ew-b-out .15s ease-in 4s forwards}
.ew-build--intro .ew-build__status>span:nth-child(2) i{animation:ew-b-pulse .45s ease-in-out 2.25s 4 alternate both}
.ew-build--intro .ew-build__status>span:nth-child(3){animation:ew-b-in .2s ease-out 4.05s both}
.ew-build--intro .ew-build__switch{animation:ew-b-show .3s ease-out 4.5s both}
${ON} .ew-b-h1{animation:ew-write .4s cubic-bezier(.4,0,.2,1) ${tAt(0.4)} both}
${ON} .ew-b-h2{animation:ew-write .35s cubic-bezier(.4,0,.2,1) ${tAt(0.6)} both}
${ON} .ew-b-chips i{animation:ew-b-pop .3s cubic-bezier(.3,1.5,.5,1) ${tAt(0.8)} both}
${ON} .ew-b-chips i:nth-child(2){animation-delay:${tAt(0.87)}}
${ON} .ew-b-chips i:nth-child(3){animation-delay:${tAt(0.94)}}
${ON} .ew-b-sec b{animation:ew-b-in .3s ease-out ${tAt(1)} both}
${ON} .ew-b-why b{animation-delay:${tAt(1.1)}}
${ON} .ew-b-faq b{animation-delay:${tAt(1.2)}}
${ON} :is(.ew-b-ben,.ew-b-faq) i{animation:ew-b-row .35s ${EASE} ${tAt(1.1)} both}
${ON} .ew-b-ben i:nth-of-type(2){animation-delay:${tAt(1.2)}}
${ON} .ew-b-ben i:nth-of-type(3){animation-delay:${tAt(1.3)}}
${ON} .ew-b-ben i:nth-of-type(4){animation-delay:${tAt(1.4)}}
${ON} .ew-b-faq i{animation-delay:${tAt(1.25)}}
${ON} .ew-b-faq i:nth-of-type(2){animation-delay:${tAt(1.35)}}
${ON} .ew-b-faq i:nth-of-type(3){animation-delay:${tAt(1.45)}}
${ON} .ew-b-faq i:nth-of-type(4){animation-delay:${tAt(1.55)}}
${ON} .ew-b-img{animation:ew-fill .45s ${EASE} ${tAt(1.1)} both}
${ON} .ew-b-tiles i{animation:ew-b-pop .3s cubic-bezier(.3,1.5,.5,1) ${tAt(1.3)} both}
${ON} .ew-b-tiles i:nth-child(2){animation-delay:${tAt(1.38)}}
${ON} .ew-b-tiles i:nth-child(3){animation-delay:${tAt(1.46)}}
${ON} .ew-b-tiles i:nth-child(4){animation-delay:${tAt(1.54)}}
${ON} .ew-b-scan{animation:ew-b-scan 1.4s cubic-bezier(.45,.05,.55,.95) ${tAt(0.35)} both}
/* armed (the landing's script, while less than 60 % of the stage shows): the intro waits on the icon */
.ew-build--armed,.ew-build--armed *{animation-play-state:paused!important}
@keyframes ew-b-tile{from{border-radius:22%}to{border-radius:var(--radius-l)}}
@keyframes ew-b-mk{from{transform:var(--mk)}to{transform:var(--bf)}}
@keyframes ew-b-bf{from{transform:var(--bf)}to{transform:none}}
@keyframes ew-b-to{to{transform:var(--to)}}
@keyframes ew-b-in{from{opacity:0}to{opacity:1}}
@keyframes ew-b-out{from{opacity:1}to{opacity:0}}
@keyframes ew-b-show{from{opacity:0;visibility:hidden}to{opacity:1;visibility:visible}}
@keyframes ew-b-pop{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:none}}
@keyframes ew-b-row{from{opacity:0;clip-path:inset(0 100% 0 0)}to{opacity:1;clip-path:inset(0)}}
@keyframes ew-b-pulse{from{transform:scale(1)}to{transform:scale(.45)}}
@keyframes ew-b-scan{0%{opacity:0;transform:none}12%,82%{opacity:1}100%{opacity:0;transform:translateY(var(--scan))}}
${hbLayout(HB.sq)}
@media (max-width:900px){
.ew-build--intro{animation:none}
${hbLayout(HB.ls)}
.ew-b-sec{gap:.5em}
.ew-b-sec b{letter-spacing:.02em}
.ew-b-ben i{--c:1.25em}
.ew-b-faq i{height:1.45em}
.ew-b-ben i:nth-of-type(4),.ew-b-faq i:nth-of-type(4){display:none}
.ew-b-img{height:2.6em;border-radius:.45em}
.ew-b-tiles{grid-template-columns:repeat(4,minmax(0,1fr));gap:.45em}
.ew-b-tiles i{height:2.1em;border-radius:.4em}
.ew-b-tiles i::before{left:.4em;top:.4em;width:.8em;height:.8em}
.ew-b-tiles i::after{left:.4em;right:.4em;bottom:.4em;height:.35em}
}
@supports not (width:1cqi){@media (max-width:900px){.ew-build{--u:3.6px}}}
@media (prefers-reduced-motion:reduce){.ew-build,.ew-build *{animation:none!important;transition:none!important}}
`)
// the image beside the four reasons: the product in use (drawn, like the photo), not a second crop of the photo
const PHOTO_WHY = '<svg viewBox="0 0 260 110" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><rect width="260" height="110" fill="#F3EEE8"/><circle cx="74" cy="42" r="24" fill="#FFEADB"/><rect y="80" width="260" height="30" fill="#E4DBD1"/><path d="M146 50h56v20a16 16 0 0 1-16 16h-24a16 16 0 0 1-16-16z" fill="#FFFFFF" stroke="#D7CBBF" stroke-width="2.5"/><path d="M202 56h7a9 9 0 0 1 0 18h-5" fill="none" stroke="#D7CBBF" stroke-width="5"/><path d="M164 42c-5-6 5-9 0-16M184 42c-5-6 5-9 0-16" fill="none" stroke="#D7CBBF" stroke-width="3" stroke-linecap="round"/></svg>'
// PageAnatomy, phase 5 (2026-11-12): the legend and the drawing point at each other
const tourAt = (n) => `${((n - 1) * 0.55).toFixed(2)}s`
const ANATOMY5_CSS = withFallbacks(`/* PageAnatomy, phase 5: point at a part in the legend or on the drawing and the drawing rings it while the legend
   tints its line (ew-explore holds both). Once in view the landing's script walks through the six parts (ew-explore--tour,
   about 3.6 s, once, backwards fill only so pointing works after it); with reduced motion it does not. The words carry
   everything, so this is for the pointer only: no new tab stops. */
.ew-explore .ew-legend--described li{margin:-8px -12px;padding:8px 12px;border-radius:12px;transition:background-color .15s}
.ew-explore .ew-legend--described b{transition:background-color .15s,color .15s}
.ew-explore .ew-scene [data-part]{border-radius:${u(9)};outline:${u(2.2)} solid transparent;outline-offset:${u(5)};transition:outline-color .15s}
.ew-explore .ew-scene .ew-mark{transition:background-color .15s,color .15s,transform .15s}
.ew-explore:has([data-part="1"]:hover) li[data-part="1"],.ew-explore:has([data-part="2"]:hover) li[data-part="2"],.ew-explore:has([data-part="3"]:hover) li[data-part="3"],.ew-explore:has([data-part="4"]:hover) li[data-part="4"],.ew-explore:has([data-part="5"]:hover) li[data-part="5"],.ew-explore:has([data-part="6"]:hover) li[data-part="6"]{background:var(--orange-tint)}
.ew-explore:has([data-part="1"]:hover) li[data-part="1"] b,.ew-explore:has([data-part="2"]:hover) li[data-part="2"] b,.ew-explore:has([data-part="3"]:hover) li[data-part="3"] b,.ew-explore:has([data-part="4"]:hover) li[data-part="4"] b,.ew-explore:has([data-part="5"]:hover) li[data-part="5"] b,.ew-explore:has([data-part="6"]:hover) li[data-part="6"] b{background:#FF6A13;color:#1A1410}
.ew-explore:has([data-part="1"]:hover) .ew-scene [data-part="1"],.ew-explore:has([data-part="2"]:hover) .ew-scene [data-part="2"],.ew-explore:has([data-part="3"]:hover) .ew-scene [data-part="3"],.ew-explore:has([data-part="4"]:hover) .ew-scene [data-part="4"],.ew-explore:has([data-part="5"]:hover) .ew-scene [data-part="5"],.ew-explore:has([data-part="6"]:hover) .ew-scene [data-part="6"]{outline-color:#FF6A13}
.ew-explore:has([data-part="1"]:hover) .ew-scene [data-part="1"]>.ew-mark,.ew-explore:has([data-part="2"]:hover) .ew-scene [data-part="2"]>.ew-mark,.ew-explore:has([data-part="3"]:hover) .ew-scene [data-part="3"]>.ew-mark,.ew-explore:has([data-part="4"]:hover) .ew-scene [data-part="4"]>.ew-mark,.ew-explore:has([data-part="5"]:hover) .ew-scene [data-part="5"]>.ew-mark,.ew-explore:has([data-part="6"]:hover) .ew-scene [data-part="6"]>.ew-mark{background:#FF6A13;color:#1A1410;transform:scale(1.2)}
.ew-explore--tour li[data-part="1"]{animation:ew-tour-li .8s ease-in-out ${tourAt(1)} backwards}.ew-explore--tour li[data-part="1"] b{animation:ew-tour-b .8s ease-in-out ${tourAt(1)} backwards}.ew-explore--tour .ew-scene [data-part="1"]{animation:ew-tour-ring .8s ease-in-out ${tourAt(1)} backwards}.ew-explore--tour .ew-scene [data-part="1"]>.ew-mark{animation:ew-tour-mark .8s ease-in-out ${tourAt(1)} backwards}\n.ew-explore--tour li[data-part="2"]{animation:ew-tour-li .8s ease-in-out ${tourAt(2)} backwards}.ew-explore--tour li[data-part="2"] b{animation:ew-tour-b .8s ease-in-out ${tourAt(2)} backwards}.ew-explore--tour .ew-scene [data-part="2"]{animation:ew-tour-ring .8s ease-in-out ${tourAt(2)} backwards}.ew-explore--tour .ew-scene [data-part="2"]>.ew-mark{animation:ew-tour-mark .8s ease-in-out ${tourAt(2)} backwards}\n.ew-explore--tour li[data-part="3"]{animation:ew-tour-li .8s ease-in-out ${tourAt(3)} backwards}.ew-explore--tour li[data-part="3"] b{animation:ew-tour-b .8s ease-in-out ${tourAt(3)} backwards}.ew-explore--tour .ew-scene [data-part="3"]{animation:ew-tour-ring .8s ease-in-out ${tourAt(3)} backwards}.ew-explore--tour .ew-scene [data-part="3"]>.ew-mark{animation:ew-tour-mark .8s ease-in-out ${tourAt(3)} backwards}\n.ew-explore--tour li[data-part="4"]{animation:ew-tour-li .8s ease-in-out ${tourAt(4)} backwards}.ew-explore--tour li[data-part="4"] b{animation:ew-tour-b .8s ease-in-out ${tourAt(4)} backwards}.ew-explore--tour .ew-scene [data-part="4"]{animation:ew-tour-ring .8s ease-in-out ${tourAt(4)} backwards}.ew-explore--tour .ew-scene [data-part="4"]>.ew-mark{animation:ew-tour-mark .8s ease-in-out ${tourAt(4)} backwards}\n.ew-explore--tour li[data-part="5"]{animation:ew-tour-li .8s ease-in-out ${tourAt(5)} backwards}.ew-explore--tour li[data-part="5"] b{animation:ew-tour-b .8s ease-in-out ${tourAt(5)} backwards}.ew-explore--tour .ew-scene [data-part="5"]{animation:ew-tour-ring .8s ease-in-out ${tourAt(5)} backwards}.ew-explore--tour .ew-scene [data-part="5"]>.ew-mark{animation:ew-tour-mark .8s ease-in-out ${tourAt(5)} backwards}\n.ew-explore--tour li[data-part="6"]{animation:ew-tour-li .8s ease-in-out ${tourAt(6)} backwards}.ew-explore--tour li[data-part="6"] b{animation:ew-tour-b .8s ease-in-out ${tourAt(6)} backwards}.ew-explore--tour .ew-scene [data-part="6"]{animation:ew-tour-ring .8s ease-in-out ${tourAt(6)} backwards}.ew-explore--tour .ew-scene [data-part="6"]>.ew-mark{animation:ew-tour-mark .8s ease-in-out ${tourAt(6)} backwards}\n@keyframes ew-tour-li{from,to{background-color:transparent}20%,75%{background-color:var(--orange-tint)}}
@keyframes ew-tour-b{from,to{background-color:var(--text);color:var(--surface)}20%,75%{background-color:#FF6A13;color:#1A1410}}
@keyframes ew-tour-ring{from,to{outline-color:transparent}20%,75%{outline-color:#FF6A13}}
@keyframes ew-tour-mark{from,to{background-color:#1A1410;color:#FFFFFF;transform:none}20%,75%{background-color:#FF6A13;color:#1A1410;transform:scale(1.2)}}
@media (prefers-reduced-motion:reduce){.ew-explore *{animation:none!important;transition:none!important}}
`)
// FAQ, phase 5 (2026-11-12, operator: the faq)
const FAQ5_CSS = withFallbacks(`/* FAQ, phase 5: an aside beside the questions (sticky on wide screens, after them on phones): the quickest answer is
   the merchant's own page, the offer, the Install button and the support contact. Answers open with a short height
   transition where the browser animates to auto (interpolate-size), at once elsewhere and with reduced motion. */
.ew-faq__aside{display:flex;flex-direction:column;gap:14px;padding:24px;border-radius:var(--radius-l);background:var(--surface-2)}
.ew-faq__aside .ew-heading-3{margin:0;text-wrap:balance}
.ew-faq summary:hover{color:var(--orange-text)}
@supports (interpolate-size:allow-keywords){
.ew-faq{interpolate-size:allow-keywords}
.ew-faq details::details-content{block-size:0;overflow:clip;transition:block-size .25s ease,content-visibility .25s allow-discrete}
.ew-faq details[open]::details-content{block-size:auto}
}
@media (prefers-reduced-motion:reduce){.ew-faq details::details-content{transition:none}}
`)
// SiteFooter and FinalCall, phase 5 (2026-11-12, operator: the footer)
const FOOTER5_CSS = withFallbacks(`/* SiteFooter and FinalCall, phase 5: the page ends in the mark's colours. The final call opens with the glyph (the
   hero opened with the icon) and, on the landing page, sits over the footer's top edge (page layout, landing.css); the
   footer is ink in both themes: the white lockup, what is on this page, the legal links and the support contact. The
   official badge stays in the final call only, the footer no longer repeats it. */
.ew-final__mark{display:block;flex:none;height:56px;width:auto}
.ew-footer{--ew-f-text:#FFFFFF;--ew-f-muted:rgba(255,255,255,.68);--ew-f-line:rgba(255,255,255,.14);background:var(--ink-fixed);color:var(--ew-f-text);padding:56px 0 40px}
.ew-footer .ew-small,.ew-footer .ew-note{color:var(--ew-f-muted)}
.ew-footer a{color:var(--ew-f-text)}
.ew-footer__brand{grid-column:span 6}
.ew-footer__col{grid-column:span 3;display:flex;flex-direction:column;gap:10px}
.ew-footer__h{margin:0;font:500 12px/1.4 var(--font-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--ew-f-muted)}
.ew-footer__links a,.ew-footer__links button{color:var(--ew-f-text)}
.ew-footer__legal{border-top-color:var(--ew-f-line)}
.ew-footer :where(a,button):focus-visible{outline:none;box-shadow:0 0 0 2px var(--ink-fixed),0 0 0 4px #FFFFFF;border-radius:6px}
@media (max-width:720px){
.ew-final__mark{height:48px}
.ew-footer__grid{grid-template-columns:1fr 1fr;gap:28px 16px}
.ew-footer__grid>.ew-footer__brand,.ew-footer__grid>.ew-footer__legal{grid-column:1/-1}
.ew-footer__grid>.ew-footer__col{grid-column:auto}
}
`)
// SiteHeader, phase 5 (2026-11-12, operator: the header's button should carry value, not sit there for its own sake)
const HEADER5_CSS = withFallbacks(`/* SiteHeader, phase 5: three chips, each a fact that links to its section ("Zero setup" to how it works, "Go live
   free" to the comparison, "No monthly fee" to pricing), and the Install button with the offer,
   "Get 2 pages free". On the landing page (ew-header--reveal) the button shows only while the hero's Install is out of
   view (is-cta, set by the landing's script), so one Install button is in view at a time: it waits at the header's end
   and the chips step aside for it (on phones it takes their place), transforms and opacity only, so nothing shifts.
   Without the script it always shows (the page's noscript style). Fewer chips on narrower screens: all three above
   800px, two to 721px, "No monthly fee" alone on phones. ew-header__cta--top draws the state over the hero in previews. */
.ew-header__cta{--go-w:176px;position:relative;display:inline-flex;align-items:center;gap:12px}
.ew-header__chips{display:inline-flex;align-items:center;gap:8px}
.ew-header__offer{display:inline-flex;align-items:center;height:32px;padding:0 12px;border-radius:999px;background:var(--orange-tint);color:var(--text);font:600 14px/1 var(--font-sans);text-decoration:none;white-space:nowrap}
.ew-header__offer:hover{text-decoration:underline;text-underline-offset:3px}
.ew-btn.ew-header__go{gap:6px;width:var(--go-w);height:40px;padding:0;font-size:15px}
.ew-header__go svg{flex:none;width:16px;height:16px}
.ew-header__cta--top .ew-header__go{display:none}
.ew-header--reveal .ew-header__go{position:absolute;right:0;top:50%;margin-top:-20px;visibility:hidden;opacity:0;transform:translateX(8px);transition:opacity .2s ease-out,transform .25s ${EASE},visibility 0s linear .25s}
.ew-header--reveal.is-cta .ew-header__go{visibility:visible;opacity:1;transform:none;transition:opacity .2s ease-out .05s,transform .25s ${EASE} .05s,visibility 0s}
.ew-header--reveal .ew-header__chips{transition:transform .25s ${EASE},opacity .2s ease-out,visibility 0s}
.ew-header--reveal.is-cta .ew-header__chips{transform:translateX(calc(-1 * (var(--go-w) + 12px)))}
@media (max-width:800px){.ew-header__offer--how{display:none}}
@media (max-width:720px){
.ew-header__cta{--go-w:160px}
.ew-header__offer--compare{display:none}
.ew-btn.ew-header__go{height:36px;font-size:14px}
.ew-header--reveal .ew-header__go{margin-top:-18px}
.ew-header--reveal.is-cta .ew-header__chips{transform:none;opacity:0;visibility:hidden;transition:opacity .15s ease-in,visibility 0s linear .15s}
.ew-header:not(.ew-header--reveal) .ew-header__cta:not(.ew-header__cta--top) .ew-header__chips{display:none}
}
@media (max-width:380px){.ew-header__cta{--go-w:138px}.ew-header__go svg{display:none}}
@media (prefers-reduced-motion:reduce){.ew-header__go,.ew-header__chips{transition:none!important}}
`)
const HERO_ALT = 'Illustration: the Ecomwerce mark turns into a product card with a photo of a ceramic pour-over set, its title, the price $34.00 and Add to cart, then Ecomwerce writes the page around it: a hook headline, variants, benefits, four reasons it stands out and an FAQ.'
const heroBuild = ({ photo = PHOTO_D, title = 'Ceramic pour-over set', price = '$34.00', alt = HERO_ALT } = {}) => `<div class="ew-stage ew-build ew-build--intro" data-hero-build><div class="ew-build__art" role="img" aria-label="${alt}"><span class="ew-b ew-b-ml"></span><span class="ew-b ew-b-mb"></span><span class="ew-b ew-b-win">${photo}</span><span class="ew-b ew-b-tw"><span class="ew-b-title">${title}</span></span><span class="ew-b ew-b-price">${price}</span><span class="ew-b ew-b-buy">Add to cart</span><span class="ew-b ew-b-h1"></span><span class="ew-b ew-b-h2"></span><span class="ew-b ew-b-chips"><i></i><i></i><i></i></span><span class="ew-b ew-b-sec ew-b-ben"><b>Benefits</b><i><span></span></i><i><span></span></i><i><span></span></i><i><span></span></i></span><span class="ew-b ew-b-sec ew-b-why"><b>Why it stands out</b><span class="ew-b-img">${PHOTO_WHY}</span><span class="ew-b-tiles"><i></i><i></i><i></i><i></i></span></span><span class="ew-b ew-b-sec ew-b-faq"><b>FAQ</b><i></i><i></i><i></i><i></i></span><span class="ew-b ew-b-scan"></span></div><span class="ew-build__status" aria-hidden="true"><span>Your product</span><span><i></i>AI writing sales copy</span><span><i></i>Ready</span></span><div class="ew-build__switch" role="group" aria-label="The product page, before and after Ecomwerce" hidden><span class="ew-build__knob" aria-hidden="true"></span><button type="button" data-show="before" aria-pressed="false">Before</button><button type="button" data-show="after" aria-pressed="true">After</button></div></div>`
// the switch, as in landing/src/scripts/landing.js (section 7), for the previews
const HERO_SWITCH_JS = `<script>for(const hb of document.querySelectorAll('[data-hero-build]')){const sw=hb.querySelector('.ew-build__switch');const bs=sw.querySelectorAll('button');sw.hidden=false;sw.addEventListener('click',(e)=>{const b=e.target.closest('button[data-show]');if(!b||b.getAttribute('aria-pressed')==='true')return;for(const x of bs)x.setAttribute('aria-pressed',String(x===b));hb.classList.remove('ew-build--intro','ew-build--replay');if(b.dataset.show==='before'){hb.classList.add('is-before');return}hb.classList.remove('is-before');void hb.offsetWidth;hb.classList.add('ew-build--replay')})}</script>`
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
  ProductCard: doc('<!-- @dsCard group="Brand" height=690 subtitle="The mark grown into a page: photo window, title, price, buy button on the orange stage; compact on phones" -->', 'Product card', `<div class="ew-row" style="gap:20px;align-items:stretch">
  <div class="ew-stage" style="padding:32px;width:340px;max-width:100%">${card()}</div>
  <div class="ew-stage" style="padding:32px;width:340px;max-width:100%">${card({ building: true })}</div>
  <div class="ew-col" style="max-width:260px;justify-content:center"><span class="ew-eyebrow">States</span><p class="ew-p">Finished page, and the build moment: the window and lines fill in, then the button appears. With reduced motion, show the finished card.</p></div>
</div>
<div class="ew-row" style="gap:20px;align-items:stretch;margin-top:20px">${compactCard()}${compactCard({ building: true })}
  <div class="ew-col" style="max-width:260px;justify-content:center"><span class="ew-eyebrow">Compact</span><p class="ew-p">On phones the hero card lies on its side, so the first screen holds the headline, the card and the Install button.</p></div>
</div>`),
  Hero: doc('<!-- @dsCard group="Landing" height=560 width=1200 subtitle="The landing first screen: promise, price sentence, one action, the stage where the mark becomes a product page" -->', 'Hero', `<section class="ew-hero" style="max-width:1160px;margin:0 auto;padding:24px 0">
  <div class="ew-hero__text">
    <span class="ew-eyebrow">Shopify app for product testers</span>
    <h1 class="ew-h" style="font-size:68px;line-height:.98">Your product page, ready for ads in minutes.</h1>
    <p class="ew-p" style="font-size:20px;line-height:1.5">Pick a product in your Shopify store. Ecomwerce writes and builds the page your ads send people to: a hook headline, benefits, reasons to buy and an FAQ.</p>
    <div class="ew-row"><a class="ew-btn ew-btn--lg" href="#">Build my first page free</a><a class="ew-btn ew-btn--secondary ew-btn--lg" href="#">See a sample page</a></div>
    <p class="ew-note">${PRICE_LINE}</p>
  </div>
  ${heroBuild()}
</section>
<p class="ew-note" style="max-width:1160px;margin:16px auto 0">The stage plays once on arrival: the app icon, the mark turning into the product card (before), then the page written around it (after). The switch puts the card back or writes the page again. Below 900px the stage lies on its side. With reduced motion the finished page shows at once, and without the script there is no switch.</p>${HERO_SWITCH_JS}`),
  Steps: doc('<!-- @dsCard group="Landing" height=600 width=1200 subtitle="How it works: three real steps, each with a drawn scene on the orange stage; the middle one builds once" -->', 'Steps', `<ol class="ew-steps ew-steps--pictured">${STEPS3.map(([n, h, p, pic]) => `<li class="ew-step"><div class="ew-step__pic">${pic}</div><div class="ew-step__text"><span class="ew-step__n">${n}</span><h3 class="ew-h">${h}</h3><p class="ew-p">${p}</p></div></li>`).join('')}</ol>
<p class="ew-note" style="margin-top:20px">The middle scene builds once: here on load, on the landing page when it comes into view. With reduced motion or without the script every scene is finished from the start. The scenes are drawn until the launch interface ships; then real crops replace them.</p>`),
  HonestyList: doc('<!-- @dsCard group="Landing" height=330 width=1000 subtitle="Real data only: what Ecomwerce never adds, and what stays yours" -->', 'Honesty list', `<div class="ew-honest">
  <div class="ew-honest__col ew-never"><h3 class="ew-h" style="font-size:24px">Never added by Ecomwerce</h3><ul>
    <li>${luc('x')}Invented reviews or star ratings</li><li>${luc('x')}Review counts and "people bought this" lines</li><li>${luc('x')}Stock bars and countdown timers</li><li>${luc('x')}"Verified" badges</li></ul></div>
  <div class="ew-honest__col ew-always"><h3 class="ew-h" style="font-size:24px">Always yours</h3><ul>
    <li>${luc('check')}Your photos and product data</li><li>${luc('check')}Your real reviews, when you add them</li></ul></div>
</div>`),
  PricingCard: doc('<!-- @dsCard group="Landing" height=420 subtitle="Pay as you go: the same price sentence as the listing and the app" -->', 'Pricing card', `<div class="ew-price">
  <span class="ew-eyebrow">Pricing</span>
  <h3 class="ew-h" style="font-size:28px">Pay as you go</h3>
  <div class="ew-price__big"><b>$3</b><span class="ew-num">per product page</span></div>
  <ul><li>${luc('check')}Free to install, no monthly fee</li><li>${luc('check')}Your first 2 product pages are free</li><li>${luc('check')}Monthly cap of $60</li><li>${luc('check')}Billed on your Shopify invoice</li></ul>
  <a class="ew-btn ew-btn--block" href="#">Install free</a>
</div>`),
  FAQ: doc('<!-- @dsCard group="Landing" height=380 subtitle="Questions in the merchant\'s words beside an aside with the offer and the support contact; answers are drafts to verify before launch" -->', 'FAQ', `<div style="display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:32px;align-items:start"><aside class="ew-faq__aside" aria-label="Try it on your store"><h3 class="ew-heading-3">The quickest answer is your own page</h3><p class="ew-small">Your first 2 product pages are free, and nothing goes live until you press Go live.</p><a class="ew-btn ew-btn--block" href="#">Build my first page free</a><p class="ew-note">Other questions? Write to [support email].</p></aside><div class="ew-faq">
  <details open><summary>Does it change my live store?</summary><p>No. Ecomwerce prepares the page and shows you a preview. Your store changes only when you press Go live.</p></details>
  <details><summary>Do you add reviews?</summary><p>Only real ones. Ecomwerce never invents reviews, ratings or counters.</p></details>
  <details><summary>What does it cost?</summary><p>${PRICE_LINE} The monthly cap is $60.</p></details>
  <details><summary>Which languages does it write in?</summary><p>English for now.</p></details>
</div></div>`),
  SiteHeader: doc('<!-- @dsCard group="Landing" height=470 width=1100 subtitle="The landing header: the lockup and three chips over the hero; past its button, Get 2 pages free joins them; sticky" -->', 'Site header', `<p class="ew-eyebrow" style="margin:0 0 8px">Desktop, 72px, over the hero (its Install button is in view)</p>
<header class="ew-header" style="position:static"><div class="ew-header__in" style="padding:0 24px">${headerIn(32, 'top')}</div></header>
<p class="ew-eyebrow" style="margin:20px 0 8px">Desktop, past the hero's button</p>
<header class="ew-header" style="position:static"><div class="ew-header__in" style="padding:0 24px">${headerIn(32)}</div></header>
<div class="ew-row" style="gap:24px;align-items:flex-start;margin-top:20px">
<div><p class="ew-eyebrow" style="margin:0 0 8px">Phone, 56px, over the hero</p><div style="width:390px;max-width:100%;border:1px solid var(--line)"><header class="ew-header" style="position:static"><div class="ew-header__in" style="height:56px;padding:0 16px">${headerIn(28, 'top')}</div></header></div></div>
<div><p class="ew-eyebrow" style="margin:0 0 8px">Phone, past the hero's button</p><div style="width:390px;max-width:100%;border:1px solid var(--line)"><header class="ew-header" style="position:static"><div class="ew-header__in" style="height:56px;padding:0 16px">${headerIn(28)}</div></header></div></div>
</div>
<p class="ew-note" style="margin-top:16px">One Install button in view at a time: over the hero the header leaves it to the hero's big button; once that scrolls away, the header shows the offer and its own. "No monthly fee" links to pricing; on phones only the button shows. Without the script both always show.</p>`),
  SiteFooter: doc('<!-- @dsCard group="Landing" height=330 width=1100 subtitle="Ink, in the mark\'s colours: who makes Ecomwerce, the contact, what is on the page, the legal links" -->', 'Site footer', `<footer class="ew-footer"><div class="ew-footer__grid" style="padding:0 24px">
<div class="ew-footer__brand">${files['ecomwerce-lockup-white.svg'].replace('<svg ', `<svg width="${Math.round(28 * lkW / 1200)}" height="28" style="height:28px" role="img" aria-label="Ecomwerce" `)}<p class="ew-small">Made by SpurIT</p><p class="ew-small">Support: [support email]</p></div>
<nav class="ew-footer__col" aria-label="On this page"><p class="ew-footer__h">On this page</p><ul class="ew-footer__links"><li><a href="#">How it works</a></li><li><a href="#">What you get</a></li><li><a href="#">Pricing</a></li><li><a href="#">Compare</a></li><li><a href="#">FAQ</a></li></ul></nav>
<div class="ew-footer__col"><p class="ew-footer__h">Legal</p><ul class="ew-footer__links" aria-label="Legal"><li><a href="#">Privacy policy</a></li><li><a href="#">Terms</a></li><li><a href="#">Cookies</a></li><li><a href="#">Legal notice</a></li><li><button type="button">Privacy choices</button></li></ul></div>
<div class="ew-footer__legal"><p class="ew-note">Shopify is a trademark of Shopify Inc.</p><p class="ew-note">&copy; 2026 SpurIT</p></div>
</div></footer>`),
  ConsentBanner: doc('<!-- @dsCard group="Landing" height=470 width=1000 subtitle="Asks before any tag loads (EEA, UK, Switzerland); reject as easy as accept" -->', 'Consent banner', `<div class="ew-row" style="align-items:flex-start;gap:24px">
<div><p class="ew-eyebrow" style="margin:0 0 8px">Summary</p><div class="ew-consent" style="position:static" role="dialog" aria-modal="false" aria-labelledby="c1"><div class="ew-consent__part"><p class="ew-consent__title" id="c1">Cookies for measuring our ads</p><p>We use cookies to count visits and see which ads bring people here (Google, Meta and TikTok). They stay off unless you allow them.</p><div class="ew-consent__actions"><button type="button" class="ew-btn ew-btn--secondary">Reject all</button><button type="button" class="ew-btn ew-btn--secondary">Accept all</button></div><div class="ew-consent__more"><button type="button">Choose</button><a href="#">Cookie policy</a></div></div></div></div>
<div><p class="ew-eyebrow" style="margin:0 0 8px">Settings, Global Privacy Control on</p><div class="ew-consent" style="position:static" role="dialog" aria-modal="false" aria-labelledby="c2"><div class="ew-consent__part"><p class="ew-consent__title" id="c2">Choose cookies</p><ul class="ew-consent__list"><li><div><strong>Necessary</strong><span>Keeps the page working and remembers your choice. Always on.</span></div>${SWITCH('Necessary cookies, always on', true, true)}</li><li><div><strong>Measurement</strong><span>Google Analytics counts visits and which page versions people use.</span></div>${SWITCH('Measurement cookies')}</li><li><div><strong>Advertising</strong><span>Meta, TikTok and Google Ads measure our ads and show them to people like you.</span><span class="ew-consent__note">Off, because your browser sends a Global Privacy Control signal.</span></div>${SWITCH('Advertising cookies', false, true)}</li></ul><div class="ew-consent__actions"><button type="button" class="ew-btn ew-btn--secondary">Save choices</button><button type="button" class="ew-btn ew-btn--secondary">Accept all</button></div><div class="ew-consent__more"><a href="#">Cookie policy</a></div></div></div></div>
</div>`),
  FinalCall: doc('<!-- @dsCard group="Landing" height=400 width=1100 subtitle="The glyph, the promise again on orange, one Install button, the official badge; on the page it sits over the footer" -->', 'Final call', `<div class="ew-stage ew-final">${files['ecomwerce-mark-on-orange.svg'].replace('<svg ', '<svg class="ew-final__mark" width="33" height="56" aria-hidden="true" focusable="false" ')}<h2 class="ew-display-l">Your product page, ready for ads in minutes.</h2><div class="ew-final__actions"><a class="ew-btn ew-btn--on-orange ew-btn--lg" href="#">Build my first page free</a><a class="ew-badge" href="#"><img src="${BADGE}" width="211" height="56" alt="Find it on the Shopify App Store"></a></div><p class="ew-small">${PRICE_LINE} Monthly cap of $60.</p></div>`),
  PageAnatomy: doc('<!-- @dsCard group="Landing" height=640 width=1100 subtitle="What you get: six numbered parts with what each does, beside a drawn page until the real build (g3)" -->', 'Page anatomy', `<div class="ew-explore" style="display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:40px;align-items:center"><div style="max-width:440px">${anatomyDrawn()}</div>${anatomyLegend()}</div><p class="ew-note" style="margin-top:16px">Point at a part in the legend or on the drawing: the drawing rings it and the legend tints its line. On the landing page the drawing walks through the six parts once when it comes into view.</p>`),
  CostChart: doc('<!-- @dsCard group="Landing" height=900 width=1100 subtitle="What testing costs: every dollar on one scale, our price next to one ad test" -->', 'Cost chart', `<div class="ew-row" style="align-items:flex-start;gap:24px"><div style="width:640px;max-width:100%">${costChart()}</div><div style="width:358px;max-width:100%">${costChart()}</div></div>`),
  ComparisonTable: doc('<!-- @dsCard group="Landing" height=1500 width=1100 subtitle="Pay per test, not per month: apps in columns, questions in rows, Ecomwerce first; one card per row on phones" -->', 'Comparison table', `<p class="ew-eyebrow" style="margin:0 0 12px">From 721px (our icon from 860px)</p>${compareTable()}<p class="ew-note ew-compare__src">${CMP_SOURCE}</p><p class="ew-eyebrow" style="margin:40px 0 12px">720px and below (ew-compare--stacked, shown at 358px)</p><div style="width:358px;max-width:100%">${compareTable({ stacked: true })}<p class="ew-note ew-compare__src">${CMP_SOURCE}</p></div>`),
  ListingImage: doc('<!-- @dsCard group="Listing" height=470 width=1200 subtitle="App Store feature image and screenshot frame, 1600 x 900, drawn at 0.36" -->', 'Listing image', `<div class="ew-frames">
  <div style="width:576px;height:324px"><div class="ew-frame" style="width:1600px;height:900px;transform:scale(.36);background:var(--orange);display:grid;grid-template-columns:1fr 1fr;align-items:center;padding:0 110px;gap:60px;color:var(--ink-fixed)">
    <div style="display:flex;flex-direction:column;gap:28px"><span style="font:500 28px var(--font-mono);letter-spacing:.06em;text-transform:uppercase">Ecomwerce</span><h2 class="ew-h" style="font-size:96px;line-height:.98">Your product, as a page on your store</h2></div>
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
await writeFile(DS + 'components/bundle.css', bundleCss + LANDING_CSS + PHASE3_CSS + PHASE4_CSS + HERO_CSS + HEADER5_CSS + ANATOMY5_CSS + FOOTER5_CSS + FAQ5_CSS)
for (const [n, html] of Object.entries(previews)) { await mkdir(DS + `components/${n}`, { recursive: true }); await writeFile(DS + `components/${n}/preview.html`, html) }
await mkdir(DS + 'components/Cover', { recursive: true }); await writeFile(DS + 'components/Cover/preview.html', cover)
console.log('logo files:', Object.keys(files).length + pngs.length, '| previews:', Object.keys(previews).length + 1, '| lockup viewBox width', lkW)
