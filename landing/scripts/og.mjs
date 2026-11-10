#!/usr/bin/env node
// The Open Graph image, 1200 x 630: the lockup and the product card on orange, from the brand's files, and the price
// sentence. No headline: one image serves every variant, and no gated words reach it. Writes src/assets/og-1200x630.png
// (committed). Run after a brand change: npm run og (playwright comes from the repo root's devDependencies).
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const ROOT = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT));
const font = (p) => `data:font/woff2;base64,${read(`landing/node_modules/${p}`).toString('base64')}`;
const lockup = read('brand/logo/ecomwerce-lockup-on-orange.svg').toString().replace('<svg ', '<svg role="img" aria-label="Ecomwerce" ');
const PHOTO = '<svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice"><rect width="400" height="400" fill="#F3EEE8"/><ellipse cx="200" cy="322" rx="122" ry="13" fill="#E4DBD1"/><path d="M118 128h164l-48 98h-68z" fill="#E7DCD1"/><rect x="140" y="216" width="120" height="14" rx="7" fill="#D7CBBF"/><path d="M128 238h144v46a40 40 0 0 1-40 40h-64a40 40 0 0 1-40-40z" fill="#FFFFFF" stroke="#D7CBBF" stroke-width="3"/><path d="M272 252h14a22 22 0 0 1 0 44h-10" fill="none" stroke="#D7CBBF" stroke-width="9"/></svg>';

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:"Gabarito";font-weight:800;src:url(${font('@fontsource/gabarito/files/gabarito-latin-800-normal.woff2')})}
@font-face{font-family:"Host Grotesk";font-weight:600;src:url(${font('@fontsource/host-grotesk/files/host-grotesk-latin-600-normal.woff2')})}
@font-face{font-family:"Geist Mono";font-weight:500;src:url(${font('@fontsource/geist-mono/files/geist-mono-latin-500-normal.woff2')})}
html,body{margin:0}
.c{position:relative;width:1200px;height:630px;background:#FF6A13;overflow:hidden;color:#1A1410}
.logo{position:absolute;left:80px;top:80px}
.logo svg{display:block;height:72px;width:auto}
.price{position:absolute;left:80px;bottom:80px;width:560px;margin:0;font:600 30px/1.3 "Host Grotesk";letter-spacing:-.005em}
.card{position:absolute;left:800px;top:64px;width:320px;display:flex;flex-direction:column;gap:14px}
.win{width:320px;height:320px;border-radius:20px;overflow:hidden;background:#fff;box-shadow:0 1px 2px rgba(26,20,16,.06),0 14px 40px -18px rgba(26,20,16,.32)}
.win svg{display:block;width:100%;height:100%}
.t{margin:6px 0 0;font:800 31px/1.12 "Gabarito";letter-spacing:-.015em}
.p{font:500 21px/1.3 "Geist Mono"}
.b{margin-top:6px;height:66px;border-radius:999px;background:#1A1410;color:#fff;display:grid;place-items:center;font:600 23px "Host Grotesk"}
</style></head><body><div class="c">
<div class="logo">${lockup}</div>
<p class="price">Free to install. Your first 2 product pages are free, then $3 per product page.</p>
<div class="card"><div class="win">${PHOTO}</div><p class="t">Ceramic pour-over set</p><span class="p">$34.00</span><span class="b">Add to cart</span></div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: new URL('../src/assets/og-1200x630.png', import.meta.url).pathname, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log('wrote src/assets/og-1200x630.png');
