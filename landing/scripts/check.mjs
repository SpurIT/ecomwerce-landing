#!/usr/bin/env node
// The checks of the built site (TASK.md phase 2, VERIFY). Run after npm run build:
//   npm run check [-- --no-lighthouse] [--only shots|blocks|clicks|tags|audit|lighthouse]
// 1. extra builds into .check/: gates g1, g2, g4 open; g3 open without its real build (must fail); fake tag ids
// 2. the html audit over dist/: gated words, the price sentence, every dollar amount, the order of the sections, voice,
//    robots and canonical, rating markup, fonts
// 3. screenshots into .check/shots/ with console errors and horizontal scroll: each variant and its opt-in copy at
//    1440 and 390, first screens at 390 x 844 (where phase 2 left them), no javascript, reduced motion, dark, in-app
//    browsers, legal, 404, 768
// 3b. phases 3 and 4 (blocks): per-section frames of what you get, how it works, pricing and the comparison
//    (.check/shots/p3-*.jpg, p4-*.jpg), the
//    bars to scale, step 2's build (finished without the script and with reduced motion; armed below the fold, once in
//    view, no replay), the orange share of the page, the stacking with g2, and how it works in WebKit
// 4. real clicks: Install links and utm, consent flows, "Privacy choices", Global Privacy Control, the faq, the keyboard
// 5. the tags with fake ids: nothing before consent in the opt-in copy, each tag after its consent, the Install events
// 6. Lighthouse mobile (13.5.0) on each variant
// Exits 1 on a failure; the summary goes to .check/report.json. playwright comes from the repo root; WebKit from
// EW_PLAYWRIGHT_WEBKIT when set (a playwright module path: on macOS 14, playwright 1.64 cannot drive its WebKit,
// landing/README.md).
import { chromium } from 'playwright';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync, readdirSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { startServer } from './serve.mjs';
import { LISTING_URL, SITE, VARIANTS } from '../src/data/landing.mjs';
import { DOLLARS as CMP_DOLLARS } from '../src/data/competitors.mjs';

const HERE = new URL('..', import.meta.url).pathname;
const CHECK = HERE + '.check/';
const SHOTS = CHECK + 'shots/';
mkdirSync(SHOTS, { recursive: true });
const argv = process.argv.slice(2);
const only = argv.includes('--only') ? argv[argv.indexOf('--only') + 1] : null;
const step = (name) => !only || only === name;
const results = [];
const check = (label, ok, detail = '') => {
  results.push({ ok: !!ok, label, detail });
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? ` (${detail})` : ''}`);
};
const PRICE = 'Free to install. Your first 2 product pages are free, then $3 per product page.';
const GATED = {
  g1: [/a product page for every product you test/i],
  g2: [/no invented proof/i, /real data only/i, /does it add reviews or ratings/i, /never added by ecomwerce/i],
  g3: [/see a sample page/i, /a real page, built by ecomwerce/i, /what.s on the page/i],
  g4: [/about two minutes/i, /1 min 57 s/i, /4 of 5/i],
};
const TAG_HOSTS = /googletagmanager\.com|connect\.facebook\.net|analytics\.tiktok\.com/;
const listing = new URL(LISTING_URL);
// every dollar amount the page may show: the price and the chart (BL-1), the ad test's sourced figures, the placeholder
// product's price (TASK.md phase 3 RESEARCH), the comparison's prices from its one source and Shopify's $1 offer that the
// faq names (phase 4: the operator's fact, $1 a month for 3 months), and the floor of the liability cap in the terms
const DOLLARS = new Set(['$3', '$9', '$36', '$60', '$150', '$250', '$50', '$34.00', '$1', '$100', ...CMP_DOLLARS]);
// the order of the sections below the hero (3-landing-page.md, phase 5: how it works before what you get); a closed gate's section is absent
const ORDER = ['how', 'anatomy', 'honest', 'pricing', 'compare', 'faq'];
const REQUIRED = ['how', 'anatomy', 'pricing', 'compare', 'faq'];
// the card's top and bottom at 390 x 844 where phase 4 left them (TASK.md phase 4 VERIFY): the new headlines and leads
// moved it (phase 2 left 545-689, 616-760, 616-760); the first screen still holds the headline, Install and the card
// phase 5: the hero's stage is the build (ew-build, data-hero-build), taller on phones (233px at 390): whole in the first
// screen on default and first; on builder (one more headline line) its card part, 44 of its 65 units, is (operator,
// 2026-11-12: the switch below the line is fine, the stage waits until it shows anyway)
const FOLD_P2 = { default: '589-822', first: '589-822', builder: '660-893' };

// ---------- 1. extra builds ----------
const build = (env, out) => spawnSync('npx', ['astro', 'build'], { cwd: HERE, env: { ...process.env, ...env, OUT_DIR: out }, encoding: 'utf8' });
if (step('audit') || step('tags') || step('shots') || step('blocks')) {
  const gates = build({ EW_GATES_OPEN: 'g1,g2,g4' }, '.check/dist-gates');
  check('build with g1, g2 and g4 open', gates.status === 0, gates.status ? (gates.stdout + gates.stderr).slice(-400) : '');
  const g3 = build({ EW_GATES_OPEN: 'g3' }, '.check/dist-g3');
  check('build with g3 open and no real build refuses to build', g3.status !== 0 && /g3 is open/.test(g3.stdout + g3.stderr));
  const tagsBuild = build({ EW_TAGS: HERE + 'scripts/fixtures/tags.test.json' }, '.check/dist-tags');
  check('build with fake tag ids', tagsBuild.status === 0, tagsBuild.status ? (tagsBuild.stdout + tagsBuild.stderr).slice(-400) : '');
}

// ---------- 2. the html audit ----------
const htmlFiles = (dir) => readdirSync(dir, { recursive: true }).filter((f) => f.endsWith('.html')).map((f) => join(dir, f));
const textOf = (html) => html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&#39;|&#x27;|&rsquo;/g, '’').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ');
const withoutConfig = (html) => html.replace(/<script type="application\/json"[\s\S]*?<\/script>/, '');
if (step('audit')) {
  const dist = HERE + 'dist/';
  const files = htmlFiles(dist);
  check('13 pages built (3 variants and 3 legal pages, each also under /_optin/, and the 404)', files.length === 13, String(files.length));
  for (const f of files) {
    const rel = f.slice(dist.length);
    const html = readFileSync(f, 'utf8');
    const text = textOf(html);
    const raw = withoutConfig(html);
    const pub = '/' + rel.replace(/^_optin\//, '').replace(/index\.html$/, '');
    const gatedHits = Object.entries(GATED).flatMap(([g, res]) => res.filter((r) => r.test(raw)).map((r) => `${g} ${r.source}`));
    const voice = [];
    if (/—/.test(text)) voice.push('em dash');
    if (/!/.test(text)) voice.push('exclamation mark');
    if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text)) voice.push('emoji');
    const banned = text.match(/\b(magic|revolutionary|guaranteed|10x|explode your sales|winning product|done-for-you|ai-powered)\b/i);
    if (banned) voice.push(banned[0]);
    const problems = [...gatedHits, ...voice];
    if (/aggregateRating|ratingValue|reviewCount|itemprop="rating/i.test(html)) problems.push('rating markup');
    if (/fonts\.(googleapis|gstatic)\.com/.test(html)) problems.push('google fonts');
    if (rel === '404.html') {
      if (/<script[^>]+src=/.test(html) || /ew-config/.test(html)) problems.push('404 loads a script');
    } else {
      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
      if (canonical !== SITE.origin + pub) problems.push(`canonical ${canonical}`);
      const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1];
      if (robots !== (pub === '/' ? 'index, follow' : 'noindex, follow')) problems.push(`robots ${robots}`);
      if (!html.includes(`data-geo="${rel.startsWith('_optin/') ? 'optin' : 'optout'}"`)) problems.push('geo flag');
    }
    const variant = Object.entries(VARIANTS).find(([, v]) => v.path === pub);
    if (variant) {
      const prices = text.split(PRICE).length - 1;
      const caps = text.split('Monthly cap of $60').length - 1;
      // the cap is said in the pricing card, the faq and the final call; the hero's price sentence goes without it
      if (prices < 4 || caps < 3) problems.push(`price sentence ${prices}x, cap ${caps}x`);
      const order = [...html.matchAll(/<section class="lp-section[^"]*" id="([a-z]+)"/g)].map((m) => m[1]);
      if (order.join() !== ORDER.filter((id) => order.includes(id)).join() || !REQUIRED.every((id) => order.includes(id))) problems.push(`sections ${order.join(', ')}`);
    }
    const dollars = [...new Set(text.match(/\$\d+(?:,\d{3})*(?:\.\d+)?/g) || [])].filter((d) => !DOLLARS.has(d));
    if (dollars.length) problems.push(`dollar amounts ${dollars.join(', ')}`);
    check(`audit ${rel}`, !problems.length, problems.join('; '));
  }
  // the scenes live twice (the brand generators and HowItWorks.astro): the page's steps must be the Steps preview's,
  // but for the build hook (the page ships the scene finished with data-build, the preview builds on load)
  const flat = (h) => h.replace(/>\s+</g, '><').replace(/ data-build| ew-scene--build/g, '').trim();
  const stepsOf = (h) => flat((h.match(/<ol class="ew-steps ew-steps--pictured">[\s\S]*?<\/ol>/) || [''])[0]);
  const brandSteps = stepsOf(readFileSync(HERE + '../brand/design-system/project/components/Steps/preview.html', 'utf8'));
  const pageSteps = stepsOf(readFileSync(dist + 'index.html', 'utf8'));
  const at = [...pageSteps].findIndex((c, i) => c !== brandSteps[i]);
  check('how it works: the steps and scenes are the brand book\'s Steps markup (brand/tools/build-brand.mjs)', brandSteps.length > 0 && brandSteps === pageSteps,
    brandSteps === pageSteps ? `${pageSteps.length} characters` : `differs at ${at}: ${pageSteps.slice(Math.max(0, at), at + 60)} | ${brandSteps.slice(Math.max(0, at), at + 60)}`);
  // phase 4: the anatomy's legend and drawing and the comparison table are the brand book's markup too
  const brandDir = HERE + '../brand/design-system/project/components/';
  const home = readFileSync(dist + 'index.html', 'utf8');
  for (const [what, file, re] of [
    ['what you get: the legend', 'PageAnatomy', /<ol class="ew-legend ew-legend--described">[\s\S]*?<\/ol>/],
    ['what you get: the drawing', 'PageAnatomy', /<figure class="ew-anatomy--drawn">[\s\S]*?<\/figure>/],
    ['the comparison table', 'ComparisonTable', /<div class="ew-compare">[\s\S]*?<\/div>/],
  ]) {
    const b = flat((readFileSync(brandDir + file + '/preview.html', 'utf8').match(re) || [''])[0]);
    const pg = flat((home.match(re) || [''])[0]);
    const i = [...pg].findIndex((c, k) => c !== b[k]);
    check(`${what}: the brand book's ${file} markup (brand/tools/build-brand.mjs)`, b.length > 0 && b === pg, b === pg ? `${pg.length} characters` : `differs at ${i}: ${pg.slice(Math.max(0, i), i + 60)} | ${b.slice(Math.max(0, i), i + 60)}`);
  }
  const js = readdirSync(dist + '_astro').filter((f) => f.endsWith('.js'));
  const bytes = js.reduce((n, f) => n + statSync(dist + '_astro/' + f).size, 0);
  const gz = js.reduce((n, f) => n + gzipSync(readFileSync(dist + '_astro/' + f)).length, 0);
  check('page script under 50 KB before the ad tags', bytes < 50 * 1024, `${js.length} file, ${bytes} bytes, ${gz} gzipped`);
  const homeBytes = readFileSync(dist + 'index.html');
  check('home page html', true, `${homeBytes.length} bytes, ${gzipSync(homeBytes).length} gzipped, css inlined`);
  const open = readFileSync(CHECK + 'dist-gates/index.html', 'utf8');
  const openHits = ['g1', 'g2', 'g4'].map((g) => [g, GATED[g].filter((r) => r.test(open)).length, GATED[g].length]);
  check('gates-open build carries the target lines of g1, g2 and g4', openHits.every(([, n]) => n > 0), openHits.map(([g, n, of]) => `${g} ${n}/${of}`).join(', '));
  // phase 4: with g2 open real data only sits between how it works and pricing; the scope block is gone, and "Always
  // yours" keeps two lines (the go-live fact is in step 3 and the faq)
  const order = [...open.matchAll(/<section class="lp-section[^"]*" id="([a-z]+)"/g)].map((m) => m[1]);
  const always = (open.match(/ew-always"[\s\S]*?<\/ul>/) || [''])[0].split('<li').length - 1;
  check('gates-open build: how it works, what you get, real data only, pricing, the comparison, the faq; "Always yours" has two lines, no scope block',
    order.join() === 'how,anatomy,honest,pricing,compare,faq' && always === 2 && !/click to go live|The moment you go live|id="scope"/i.test(open), `${order.join(', ')}; always yours ${always}`);
}

// ---------- servers and the browser ----------
const servers = [];
const serve = async (dist, port, country = '') => { servers.push(await startServer({ port, dist: HERE + dist, country })); return port; };
const MAIN = await serve('dist', 4400);
const TAGS = await serve('.check/dist-tags', 4401);
const GATES = await serve('.check/dist-gates', 4402);
const browser = await chromium.launch();
const UA = {
  instagram: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 345.0.0.31.94 (iPhone15,2; iOS 17_5; en_US; en; scale=3.00; 1179x2556; 634108168)',
  facebook: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/470.0.0.40.97;FBBV/618436374;FBDV/iPhone15,2;FBMD/iPhone;FBSN/iOS;FBSV/17.5;FBSS/3;FBID/phone;FBLC/en_US;FBOP/5]',
  tiktok: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/AP2A.240805.005; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/127.0.6533.103 Mobile Safari/537.36 trill_360103 JsSdk/1.0 NetType/WIFI Channel/googleplay AppName/musical_ly app_version/36.1.3 ByteLocale/en ByteFullLocale/en Region/US BytedanceWebview/d8a21c6',
};

// WebKit (iPhone in-app browsers run it), launched on first use; EW_PLAYWRIGHT_WEBKIT names a playwright module this
// machine can drive WebKit with (playwright 1.64 on macOS 14 gets a frozen WebKit build it cannot open a page in)
let wk = null;
async function webkitBrowser() {
  if (!wk) wk = await (await import(process.env.EW_PLAYWRIGHT_WEBKIT || 'playwright')).webkit.launch();
  return wk;
}
const within = (p, ms, what) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error(`${what}: no answer in ${ms / 1000} s`)), ms))]);

async function open(port, path, o = {}) {
  const ctx = await (o.engine === 'webkit' ? await webkitBrowser() : browser).newContext({
    viewport: { width: o.width || 1440, height: o.height || 900 }, deviceScaleFactor: 1,
    javaScriptEnabled: o.js !== false, userAgent: o.ua, reducedMotion: o.motion || 'no-preference', colorScheme: o.scheme || 'light',
    extraHTTPHeaders: { 'cloudfront-viewer-country': o.country ?? 'US' },
  });
  if (o.gpc) await ctx.addInitScript(() => Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: () => true }));
  if (o.clipboard) await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: `http://localhost:${port}` });
  const hits = [];
  await ctx.route(`${listing.origin}/**`, (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<title>listing</title>' }));
  // the tags' collection endpoints answer locally: nothing reaches Google, Meta or TikTok
  await ctx.route(/google-analytics\.com\/g\/collect|googleadservices\.com\/pagead|doubleclick\.net\/pagead|google\.com\/(pagead|ccm)|facebook\.com\/tr|analytics\.tiktok\.com\/api/, (r) => {
    hits.push(`${r.request().url()} ${r.request().postData() || ''}`);
    r.fulfill({ status: 204 });
  });
  const page = await within(ctx.newPage(), 20000, `${o.engine || 'chromium'} newPage`);
  const errors = [];
  const requests = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', (r) => requests.push(r.url()));
  await page.goto(`http://localhost:${port}${path}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  return { ctx, page, errors, requests, hits };
}
const cookie = async (ctx) => (await ctx.cookies()).find((c) => c.name === 'ew_consent')?.value || '';
const visible = (page, sel) => page.locator(sel).first().isVisible();

// ---------- 3. screenshots ----------
async function shot(name, port, path, o = {}, full = true) {
  const s = await open(port, path, o);
  if (o.before) await o.before(s.page);
  await s.page.waitForTimeout(o.motion === 'reduce' ? 50 : 1800);
  // lazy images (the footer badges) load before a full-page shot
  if (full) { await s.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await s.page.waitForTimeout(600); await s.page.evaluate(() => window.scrollTo(0, 0)); await s.page.waitForTimeout(150); }
  const overflow = await s.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await s.page.screenshot({ path: `${SHOTS}${name}.jpg`, type: 'jpeg', quality: 80, fullPage: full });
  // the 404 page answers 404 itself, and Chrome logs that for the document
  const errors = o.expect404 ? s.errors.filter((e) => !/status of 404/.test(e)) : s.errors;
  check(`shot ${name}: clean console, no horizontal scroll`, !errors.length && overflow <= 0, [...errors.slice(0, 3), overflow > 0 ? `overflow ${overflow}px` : ''].filter(Boolean).join(' | '));
  if (o.after) await o.after(s);
  await s.ctx.close();
}
if (step('shots')) {
  for (const [id, v] of Object.entries(VARIANTS)) {
    for (const [geo, country] of [['us', 'US'], ['de', 'DE']]) {
      await shot(`${id}-${geo}-1440`, MAIN, v.path, { country });
      await shot(`${id}-${geo}-390`, MAIN, v.path, { country, width: 390, height: 844 });
    }
    await shot(`${id}-fold-390`, MAIN, v.path, {
      width: 390, height: 844,
      after: async ({ page }) => {
        const box = async (sel) => page.locator(sel).first().boundingBox();
        const h1 = await box('h1'); const btn = await box('[data-install="hero"]'); const stage = await box('[data-hero-build]');
        const card = `${Math.round(stage.y)}-${Math.round(stage.y + stage.height)}`;
        const shown = id === 'builder' ? stage.y + stage.height * 44 / 65 : stage.y + stage.height;
        check(`first screen 390x844 ${id}: headline, Install and the stage (${id === 'builder' ? 'its card part' : 'whole'}), the stage where phase 5 left it (${FOLD_P2[id]})`, h1.y + h1.height <= 844 && btn.y + btn.height <= 844 && shown <= 844 && card === FOLD_P2[id],
          `headline ${Math.round(h1.y + h1.height)}, button ${Math.round(btn.y + btn.height)}, card ${card}`);
      },
    }, false);
  }
  await shot('default-de-fold-390', MAIN, '/', {
    width: 390, height: 844, country: 'DE',
    after: async ({ page }) => {
      const btn = await page.locator('[data-install="hero"]').boundingBox(); const sheet = await page.locator('#consent').boundingBox();
      check('opt-in first screen 390x844: the hero Install stays above the banner sheet', btn.y + btn.height <= sheet.y, `button ${Math.round(btn.y + btn.height)}, sheet from ${Math.round(sheet.y)}`);
    },
  }, false);
  await shot('default-nojs-1440', MAIN, '/', { js: false });
  await shot('default-nojs-390', MAIN, '/', {
    js: false, width: 390, height: 844, country: 'DE',
    after: async ({ page }) => {
      const hidden = await page.evaluate(() => ['#consent', '[data-consent-link]', '[data-inapp]'].map((s) => document.querySelector(s)?.hidden));
      check('no javascript: no banner, no "Privacy choices", no in-app hint; Install links keep the defaults', hidden.every(Boolean) && (await page.locator('[data-install="hero"]').getAttribute('href')).includes('utm_content=hero'));
      await page.locator('.lp-hero .lp-nostore summary').click();
      check('no javascript: "No Shopify store yet?" still opens', await page.locator('.lp-hero .lp-nostore').evaluate((d) => d.open));
    },
  });
  await shot('default-reduced-390', MAIN, '/', {
    width: 390, height: 844, motion: 'reduce',
    after: async ({ page }) => {
      const names = await page.evaluate(() => [...document.querySelectorAll('[data-hero-build], [data-hero-build] *')].map((e) => getComputedStyle(e).animationName).filter((n) => n !== 'none'));
      check('reduced motion: the hero stage shows the finished page at once, no animation', names.length === 0, names.join(','));
    },
  }, false);
  await shot('default-motion-mid-390', MAIN, '/', { width: 390, height: 844, motion: 'no-preference', before: async (p) => { await p.reload(); await p.waitForTimeout(500); await p.screenshot({ path: `${SHOTS}default-motion-500ms-390.jpg`, type: 'jpeg', quality: 80 }); } }, false);
  await shot('default-dark-390', MAIN, '/', { width: 390, height: 844, scheme: 'dark' });
  // "No Shopify store yet?" opened: the p1 hero at 390 (light and dark) and the final call at 1440
  const openNoStore = (sel) => async (p) => { await p.locator(`${sel} .lp-nostore summary`).click(); };
  await shot('first-nostore-open-390', MAIN, '/first-product-page/', { width: 390, height: 844, before: openNoStore('.lp-hero') }, false);
  await shot('first-nostore-open-dark-390', MAIN, '/first-product-page/', { width: 390, height: 844, scheme: 'dark', before: openNoStore('.lp-hero') }, false);
  const openFinal = async (p) => { await openNoStore('.ew-final')(p); await p.locator('.ew-final').evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' })); };
  await shot('default-final-nostore-1440', MAIN, '/', { before: openFinal }, false);
  await shot('default-nostore-open-1440', MAIN, '/', { before: openNoStore('.lp-hero') }, false);
  await shot('first-final-nostore-open-390', MAIN, '/first-product-page/', { width: 390, height: 844, before: openFinal }, false);
  await shot('default-dark-1440', MAIN, '/', { scheme: 'dark' }, false);
  await shot('default-768', MAIN, '/', { width: 768, height: 1024 });
  await shot('privacy-1440', MAIN, '/privacy/', {});
  await shot('cookies-390', MAIN, '/cookies/', { width: 390, height: 844 });
  await shot('terms-390', MAIN, '/terms/', { width: 390, height: 844, country: 'DE' });
  await shot('404-390', MAIN, '/no-such-page/', { width: 390, height: 844, expect404: true });
  await shot('gates-open-1440', GATES, '/', {});
  await shot('gates-open-390', GATES, '/', { width: 390, height: 844 });
  for (const [name, o] of [['instagram', { clipboard: true }], ['tiktok', {}]]) {
    await shot(`inapp-${name}-390`, MAIN, '/?utm_source=x&utm_campaign=c9&ttclid=abc', {
      width: 390, height: 844, ua: UA[name], ...o,
      before: async (page) => { await page.locator('[data-copy-link]').click(); await page.waitForTimeout(200); },
      after: async ({ page }) => {
        const url = page.url();
        const label = await page.locator('[data-copy-link]').textContent();
        const field = await page.locator('#page-link').isVisible() ? await page.locator('#page-link').inputValue() : '';
        const clip = label === 'Link copied' ? await page.evaluate(() => navigator.clipboard.readText().catch(() => '')) : '';
        check(`in-app ${name}: the hint shows and "Copy link" gives this page's url with its parameters`, await visible(page, '[data-inapp]') && (clip === url || field === url),
          label === 'Link copied' ? `clipboard ${clip === url ? 'holds the url' : 'differs: ' + clip}` : `fallback field ${field === url ? 'holds the url' : 'differs'}`);
      },
    }, false);
  }
  const fb = await open(MAIN, '/', { width: 390, height: 844, ua: UA.facebook });
  const plain = await open(MAIN, '/', { width: 390, height: 844 });
  check('in-app: the hint shows in the Facebook browser and not in a regular one', (await visible(fb.page, '[data-inapp]')) && !(await visible(plain.page, '[data-inapp]')));
  await fb.ctx.close(); await plain.ctx.close();
}

// ---------- 3b. phase 3: how it works, the scope block and pricing (TASK.md phase 3 PLAN) ----------
// A frame is a clip of a full-page shot (the sticky header stays at the page's top, off the section). How it works is
// shot played: step 2's scene scrolled into view, then 2.5 s.
const SCENE = '.ew-scene--write';
const play = async (page) => { await page.locator(SCENE).evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(2500); };
const sceneState = (page) => page.locator(SCENE).evaluate((el) => ({
  cls: [...el.classList].filter((c) => /--(build|armed)$/.test(c)),
  anims: el.getAnimations({ subtree: true }).map((a) => a.playState),
  names: [...el.querySelectorAll('*')].map((e) => getComputedStyle(e).animationName).filter((n) => n !== 'none'),
  starts: window.__starts ?? null,
}));
async function frame(name, port, path, sel, o = {}) {
  const s = await open(port, path, { width: 390, height: 844, ...o });
  try {
    // played, then back to the top: a full-page shot draws the sticky header where the viewport is
    if (o.play) { await play(s.page); await s.page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await s.page.waitForTimeout(150); }
    const clip = await s.page.evaluate((sel) => {
      const els = sel.split(',').map((x) => document.querySelector(x.trim()));
      const top = Math.min(...els.map((e) => e.getBoundingClientRect().top)) + scrollY;
      const bottom = Math.max(...els.map((e) => e.getBoundingClientRect().bottom)) + scrollY;
      return { x: 0, y: Math.floor(top), width: document.documentElement.clientWidth, height: Math.ceil(bottom - top) };
    }, sel);
    const overflow = await s.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await s.page.screenshot({ path: `${SHOTS}${o.prefix || 'p3'}-${name}.jpg`, type: 'jpeg', quality: 80, fullPage: true, clip });
    check(`frame ${o.prefix || 'p3'}-${name}: clean console, no horizontal scroll`, !s.errors.length && overflow <= 0, [...s.errors.slice(0, 3), overflow > 0 ? `overflow ${overflow}px` : ''].filter(Boolean).join(' | '));
    if (o.after) await o.after(s);
  } finally { await s.ctx.close(); }
}
// each bar's width over its track is its amount over the scale ($350), at least 3px; the ad test solid to its low end
const SCALE = 350;
async function barsToScale(page, label) {
  const rows = await page.$$eval('.ew-cost__row', (rs) => rs.map((r) => ({
    val: r.querySelector('.ew-cost__val').textContent.trim(),
    track: r.querySelector('.ew-cost__track').getBoundingClientRect().width,
    bars: [...r.querySelectorAll('.ew-cost__bar')].map((b) => b.getBoundingClientRect().width),
  })));
  const off = rows.flatMap((r) => {
    const [lo, hi] = (r.val.match(/\d+/g) || []).map(Number);
    const want = [Math.max(3, lo / SCALE * r.track)];
    const got = [r.bars[0]];
    if (hi) { want.push(hi / SCALE * r.track); got.push(r.bars[0] + 2 + r.bars[1]); }
    return want.some((w, i) => Math.abs(w - got[i]) > 1) ? [`${r.val}: ${got.map((g) => g.toFixed(1))} of ${r.track.toFixed(0)}px, want ${want.map((w) => w.toFixed(1))}`] : [];
  });
  check(`bars to scale ${label}: each bar is its amount over $${SCALE} of its track, at least 3px`, rows.length === 5 && !off.length, off.length ? off.join('; ') : rows.map((r) => `${r.val} ${r.bars.map((b) => b.toFixed(1)).join('+')}px`).join(', '));
}
// the orange share: saturated orange pixels (the brand orange and orange-text, hue 8-40, not the pale tint) over the page
async function orangeShare(page) {
  const png = await page.screenshot({ fullPage: true, type: 'png' });
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  const r = await p.evaluate(async (b64) => {
    const img = new Image(); img.src = `data:image/png;base64,${b64}`; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) {
      const R = d[i], G = d[i + 1], B = d[i + 2], max = Math.max(R, G, B), min = Math.min(R, G, B);
      if (max !== R || max === min) continue;
      const l = (max + min) / 510, s = (max - min) / (255 - Math.abs(max + min - 255)), h = 60 * (G - B) / (max - min);
      if (h >= 8 && h <= 40 && s >= 0.55 && l >= 0.25 && l <= 0.75) n++;
    }
    return { share: n / (c.width * c.height), w: c.width, h: c.height };
  }, png.toString('base64'));
  await ctx.close();
  return r;
}
if (step('blocks')) {
  const noMotion = (why) => async ({ page }) => {
    const st = await sceneState(page);
    check(`step 2 ${why}: the scene is finished from the start, no animation`, !st.cls.length && !st.anims.length && !st.names.length, `classes ${st.cls.join(' ') || 'none'}, animations ${st.anims.length}, names ${st.names.join(',') || 'none'}`);
  };
  for (const [w, h] of [[1440, 900], [768, 1024], [390, 844]]) await frame(`how-${w}`, MAIN, '/', '#how', { width: w, height: h, play: true });
  await frame('how-dark-390', MAIN, '/', '#how', { scheme: 'dark', play: true });
  await frame('how-dark-1440', MAIN, '/', '#how', { width: 1440, height: 900, scheme: 'dark', play: true });
  await frame('how-reduced-390', MAIN, '/', '#how', { motion: 'reduce', after: noMotion('with reduced motion') });
  await frame('how-nojs-390', MAIN, '/', '#how', { js: false, after: noMotion('without javascript') });
  try {
    await frame('how-webkit-390', MAIN, '/', '#how', { engine: 'webkit', play: true, after: async ({ page }) => {
      const st = await sceneState(page);
      // how it works' three scenes at 4:3, the anatomy drawing at 4:5 (phase 4); insides in scene units
      const boxes = await page.$$eval('#how .ew-scene, #anatomy .ew-scene', (ss) => ss.map((s) => { const r = s.getBoundingClientRect(); const i = s.querySelector('.ew-scene__panel, .ew-live__phone').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), Math.round(i.left - r.left), s.closest('#anatomy') ? 5 / 4 : 3 / 4]; }));
      check('WebKit 390: the scenes keep their ratio (4:3, the anatomy 4:5) and draw their insides in scene units, step 2 finished after playing', boxes.length === 4 && boxes.every(([w, h, x, k]) => Math.abs(w * k - h) <= 1 && x > 20) && st.anims.every((a) => a === 'finished'), `${boxes.map((b) => b.slice(0, 3).join('x')).join(', ')}; ${st.anims.length} animations ${[...new Set(st.anims)].join(',')}`);
    } });
  } catch (e) {
    check('frame p3-how-webkit-390: WebKit opens the page', false, `${String(e.message || e).split('\n')[0]}; set EW_PLAYWRIGHT_WEBKIT (landing/README.md)`);
  }
  // step 2 with motion: armed below the fold, plays once in view, finished after 2.5 s, no replay after scrolling back
  {
    const s = await open(MAIN, '/', { width: 390, height: 844 });
    await s.page.evaluate(() => { window.__starts = 0; document.addEventListener('animationstart', (e) => { if (e.target.closest('.ew-scene--write')) window.__starts += 1; }); });
    const armed = await sceneState(s.page);
    await s.page.locator(SCENE).evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await s.page.waitForTimeout(600);
    await s.page.screenshot({ path: `${SHOTS}p3-how-mid-build-390.jpg`, type: 'jpeg', quality: 80 });
    await s.page.waitForTimeout(1900);
    const played = await sceneState(s.page);
    await s.page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await s.page.waitForTimeout(400);
    await s.page.locator(SCENE).evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await s.page.waitForTimeout(2500);
    const again = await sceneState(s.page);
    const n = armed.anims.length;
    check('step 2 with motion: armed below the fold, plays once in view, every animation finished after 2.5 s, no replay after scrolling away and back',
      n > 0 && armed.cls.join() === 'ew-scene--build,ew-scene--armed' && armed.anims.every((a) => a === 'paused') && armed.starts === 0
      && played.cls.join() === 'ew-scene--build' && played.anims.length === n && played.anims.every((a) => a === 'finished') && played.starts === n
      && again.anims.every((a) => a === 'finished') && again.starts === n && !s.errors.length,
      `armed: ${armed.cls.join(' ')}, ${n} ${[...new Set(armed.anims)]}; in view: ${[...new Set(played.anims)]}, ${played.starts} starts; back again: ${again.starts} starts`);
    await s.ctx.close();
  }
  for (const [w, h] of [[1440, 900], [768, 1024], [390, 844]]) await frame(`pricing-${w}`, MAIN, '/', '#pricing', { width: w, height: h, after: w === 768 ? undefined : ({ page }) => barsToScale(page, `at ${w}`) });
  await frame('pricing-dark-390', MAIN, '/', '#pricing', { scheme: 'dark' });
  await frame('gates-g2-1440', GATES, '/', '#honest', { width: 1440, height: 900, prefix: 'p4' });
  await frame('gates-g2-390', GATES, '/', '#honest', { prefix: 'p4' });
  // phase 4: what you get and the comparison; at 390 the comparison is one card per question with four answers
  for (const [w, h] of [[1440, 900], [768, 1024], [390, 844]]) await frame(`anatomy-${w}`, MAIN, '/', '#anatomy', { width: w, height: h, prefix: 'p4' });
  await frame('anatomy-dark-390', MAIN, '/', '#anatomy', { scheme: 'dark', prefix: 'p4' });
  // our app icon before our name in the head row, no other app's (DECISIONS.md 2026-11-11): on the name's line at 1440,
  // hidden at 768, where a column no longer fits both
  for (const [w, h] of [[1440, 900], [768, 1024]]) await frame(`compare-${w}`, MAIN, '/', '#compare', { width: w, height: h, prefix: 'p4', after: async ({ page }) => {
    const r = await page.evaluate(() => {
      const ths = [...document.querySelectorAll('.ew-compare thead th')];
      const us = ths[0]; const ic = us.querySelector('svg.ew-compare__icon');
      const range = document.createRange(); range.selectNodeContents(us.lastChild);
      const t = range.getBoundingClientRect(); const i = ic.getBoundingClientRect();
      return { icons: ths.map((th) => th.querySelectorAll('svg, img').length).join(''), name: us.textContent, hidden: ic.getAttribute('aria-hidden'),
        shown: getComputedStyle(ic).display !== 'none', size: [i.width, i.height], mid: Math.abs((i.top + i.bottom) / 2 - (t.top + t.bottom) / 2), lines: range.getClientRects().length, before: i.right <= t.left };
    });
    const ok = r.icons === '1000' && r.name === 'Ecomwerce' && r.hidden === 'true' && r.lines === 1 && (w === 1440 ? r.shown && r.size.join() === '20,20' && r.mid <= 3 && r.before : !r.shown);
    check(`comparison at ${w}: our app icon only, ${w === 1440 ? 'before our name on its line' : 'hidden (a column is too narrow for both)'}, the name on one line`, ok,
      `icons per column ${r.icons}, ${r.shown ? `shown ${r.size.join('x')}, ${r.mid.toFixed(1)}px off the name's centre` : 'hidden'}, name lines ${r.lines}`);
  } });
  await frame('compare-390', MAIN, '/', '#compare', { prefix: 'p4', after: async ({ page }) => {
    const r = await page.evaluate(() => {
      const t = document.querySelector('.ew-compare');
      const head = t.querySelector('thead').getBoundingClientRect();
      const cards = [...t.querySelectorAll('tbody tr')].map((tr) => ({ answers: [...tr.querySelectorAll('td')].filter((td) => td.getBoundingClientRect().height > 0).length, w: tr.getBoundingClientRect().width, block: getComputedStyle(tr).display }));
      return { head: [head.width, head.height], cards, wide: t.scrollWidth - t.clientWidth };
    });
    check('comparison at 390: one card per question with its four answers, the column names hidden, nothing wider than the screen',
      r.cards.length === 6 && r.cards.every((c) => c.answers === 4 && c.block === 'block' && c.w <= 390) && r.head[0] <= 1 && r.wide <= 0, `${r.cards.length} cards, answers ${r.cards.map((c) => c.answers).join('/')}, head ${r.head.join('x')}`);
  } });
  await frame('compare-dark-390', MAIN, '/', '#compare', { scheme: 'dark', prefix: 'p4' });
  await frame('pricing-ads-first-390', MAIN, '/', '#pricing', { prefix: 'p4', after: async ({ page }) => {
    const first = await page.$eval('.ew-cost__row', (r) => r.classList.contains('ew-cost__row--ads'));
    check('pricing: the ad test is the chart\'s first row (an anchor)', first);
  } });
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const s = await open(MAIN, '/', { width: w, height: h, motion: 'reduce' });
    const o = await orangeShare(s.page);
    check(`orange share of the page at ${w}: about 15 % (the brand), 20 % at most`, o.share <= 0.2, `${(o.share * 100).toFixed(1)} % of ${o.w} x ${o.h}`);
    await s.ctx.close();
  }
}

// ---------- 4. real clicks ----------
if (step('clicks')) {
  for (const [id, v] of Object.entries(VARIANTS)) {
    const { ctx, page } = await open(MAIN, v.path);
    const links = await page.$$eval('a[data-install]', (as) => as.map((a) => [a.dataset.install, a.href]));
    const bad = links.filter(([place, href]) => {
      const u = new URL(href);
      return u.origin + u.pathname !== listing.origin + listing.pathname || u.searchParams.get('q') !== listing.searchParams.get('q')
        || u.searchParams.get('utm_source') !== 'ecomwerce.com' || u.searchParams.get('utm_medium') !== 'landing'
        || u.searchParams.get('utm_campaign') !== id || u.searchParams.get('utm_content') !== place;
    });
    check(`Install links on ${v.path}: the listing, the landing's utm, the variant and the placement`, links.length === 8 && !bad.length, `${links.length} links: ${links.map(([p]) => p).join(', ')}${bad.length ? '; bad ' + bad.map(([p]) => p) : ''}`);
    await ctx.close();
  }
  {
    const { ctx, page } = await open(MAIN, '/first-product-page/?utm_source=meta&utm_medium=paid_social&utm_campaign=p1-test&utm_content=ad7&fbclid=abc');
    const hrefs = await page.$$eval('a[data-install]', (as) => as.map((a) => a.href));
    const ok = hrefs.every((h) => { const u = new URL(h); return u.searchParams.get('utm_source') === 'meta' && u.searchParams.get('utm_medium') === 'paid_social' && u.searchParams.get('utm_campaign') === 'p1-test' && u.searchParams.get('utm_content') === 'ad7' && !u.searchParams.has('fbclid') && u.searchParams.get('q') === 'ecomwerce'; });
    check('a visit with utm passes exactly its utm to every Install link', ok && hrefs.length === 8);
    const want = await page.locator('[data-install="hero"]').getAttribute('href');
    await Promise.all([page.waitForURL(`${listing.origin}/**`), page.locator('[data-install="hero"]').click()]);
    check('a real click on the hero Install opens the listing with the utm', page.url() === want, page.url());
    await ctx.close();
  }
  {
    // "No Shopify store yet?" (2026-11-11): right under Install on the p1 page, last in the hero text elsewhere; closed on
    // arrival; opens on a click; its Install has its own placement and opens the listing
    const under = async (path) => {
      const { ctx, page } = await open(MAIN, path, { width: 390, height: 844 });
      const s = await page.locator('.lp-hero .lp-nostore summary').boundingBox();
      const price = await page.locator('.lp-hero__fine .ew-small').boundingBox();
      await ctx.close();
      return s.y < price.y;
    };
    const [p1, p2, google] = [await under('/first-product-page/'), await under('/'), await under('/product-page-builder/')];
    check('no store yet: right under Install on /first-product-page/, after the price sentence on / and /product-page-builder/', p1 && !p2 && !google);
    const { ctx, page } = await open(MAIN, '/first-product-page/', { width: 390, height: 844 });
    const d = page.locator('.lp-hero .lp-nostore');
    const inner = d.locator('a[data-install]');
    const closed = !(await d.evaluate((el) => el.open)) && !(await inner.isVisible());
    await d.locator('summary').click();
    const href = await inner.getAttribute('href');
    check('no store yet: closed on arrival, opens on a click, its Install has the placement no-store-hero', closed && (await inner.isVisible()) && new URL(href).searchParams.get('utm_content') === 'no-store-hero', href);
    await Promise.all([page.waitForURL(`${listing.origin}/**`), inner.click()]);
    check('a real click on the no-store Install opens the listing', page.url() === href, page.url());
    await ctx.close();
  }
  {
    // the opt-in copy: the banner, reject, accept, choose and save, "Privacy choices", the keyboard
    let s = await open(MAIN, '/', { country: 'DE' });
    check('opt-in copy (DE): the banner shows on arrival, no cookie yet', (await visible(s.page, '#consent [data-consent-part="summary"]')) && !(await cookie(s.ctx)));
    await s.page.keyboard.press('Tab');
    check('opt-in copy: the first tab stop is "Reject all"', (await s.page.evaluate(() => document.activeElement?.textContent)) === 'Reject all');
    await s.page.getByRole('button', { name: 'Reject all' }).click();
    check('"Reject all" closes the banner and stores m0a0', !(await visible(s.page, '#consent')) && /^m0a0\.\d{8}$/.test(await cookie(s.ctx)), await cookie(s.ctx));
    await s.page.reload({ waitUntil: 'networkidle' });
    check('the choice holds on the next page view', !(await visible(s.page, '#consent')));
    await s.ctx.close();
    s = await open(MAIN, '/product-page-builder/', { country: 'FR', width: 390, height: 844 });
    await s.page.getByRole('button', { name: 'Accept all' }).first().click();
    check('"Accept all" stores m1a1', /^m1a1\.\d{8}$/.test(await cookie(s.ctx)), await cookie(s.ctx));
    await s.ctx.close();
    s = await open(MAIN, '/', { country: 'GB' });
    await s.page.getByRole('button', { name: 'Choose' }).click();
    const focused = await s.page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
    await s.page.getByRole('switch', { name: 'Measurement cookies' }).check();
    await s.page.getByRole('button', { name: 'Save choices' }).click();
    check('"Choose", Measurement on, "Save choices" stores m1a0', /^m1a0\.\d{8}$/.test(await cookie(s.ctx)), `focus went to: ${focused}`);
    const choices = s.page.getByRole('button', { name: 'Privacy choices' });
    await choices.click();
    const kept = [await s.page.getByRole('switch', { name: 'Measurement cookies' }).isChecked(), await s.page.getByRole('switch', { name: 'Advertising cookies' }).isChecked()];
    await s.page.getByRole('button', { name: 'Save choices' }).click();
    const back = await s.page.evaluate(() => document.activeElement?.textContent);
    check('"Privacy choices" reopens the settings with the saved choice; focus returns to it after saving', kept[0] && !kept[1] && back === 'Privacy choices', `switches ${kept}, focus ${back}`);
    await s.ctx.close();
    s = await open(MAIN, '/', { country: 'US' });
    const noBanner = !(await visible(s.page, '#consent'));
    await s.page.getByRole('button', { name: 'Privacy choices' }).click();
    const on = [await s.page.getByRole('switch', { name: 'Measurement cookies' }).isChecked(), await s.page.getByRole('switch', { name: 'Advertising cookies' }).isChecked()];
    await s.page.getByRole('switch', { name: 'Advertising cookies' }).uncheck();
    await s.page.getByRole('button', { name: 'Save choices' }).click();
    check('elsewhere (US): no banner, "Privacy choices" shows both on, turning advertising off stores m1a0', noBanner && on[0] && on[1] && /^m1a0\./.test(await cookie(s.ctx)), `${on}`);
    await s.ctx.close();
    s = await open(MAIN, '/', { country: 'US', gpc: true });
    await s.page.getByRole('button', { name: 'Privacy choices' }).click();
    const adv = s.page.getByRole('switch', { name: 'Advertising cookies' });
    check('Global Privacy Control (US): Advertising is off, disabled and says why', !(await adv.isChecked()) && (await adv.isDisabled()) && (await visible(s.page, '#consent-gpc')));
    await s.ctx.close();
    s = await open(MAIN, '/', { country: 'DE', gpc: true });
    await s.page.getByRole('button', { name: 'Accept all' }).first().click();
    check('Global Privacy Control (DE): "Accept all" still stores advertising off (m1a0)', /^m1a0\./.test(await cookie(s.ctx)), await cookie(s.ctx));
    await s.ctx.close();
  }
  {
    const { ctx, page } = await open(MAIN, '/');
    const item = page.locator('.ew-faq details').nth(1);
    await item.locator('summary').click();
    check('faq: an item opens on a click', await item.evaluate((d) => d.open));
    // keyboard: every stop has a visible focus ring, in page order
    const stops = [];
    for (let i = 0; i < 70; i++) {
      await page.keyboard.press('Tab');
      stops.push(await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null; // past the last stop: the browser's own ui
        const cs = getComputedStyle(el);
        const ring = cs.boxShadow !== 'none' || (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0);
        return { name: (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 28), install: el.dataset?.install || '', ring };
      }));
    }
    const real = stops.filter(Boolean);
    const noRing = real.filter((x) => !x.ring);
    const installs = new Set(real.filter((x) => x.install).map((x) => x.install));
    // phase 5: the header's Install shows only while no other is in view, so tabbing down from the top passes the header
    // before it shows; reached: hero, pricing, faq, final, final-badge (the footer badge left in phase 5)
    check('keyboard: every tab stop has a visible focus ring; every Install in the page reached (the header\'s shows only past the hero)', !noRing.length && installs.size === 5, `${real.length} stops: ${real.map((x) => x.install || x.name).join(' > ').slice(0, 520)}${noRing.length ? ' | no ring: ' + noRing.map((x) => x.name) : ''}`);
    await ctx.close();
  }
}

// ---------- 5. the tags with fake ids (dist-tags) ----------
if (step('tags')) {
  const tagReq = (reqs) => ({ google: reqs.some((u) => u.includes('googletagmanager.com/gtag/js')), meta: reqs.some((u) => u.includes('connect.facebook.net/en_US/fbevents.js')), tiktok: reqs.some((u) => u.includes('analytics.tiktok.com/i18n/pixel/events.js')) });
  let s = await open(TAGS, '/', { country: 'DE' });
  await s.page.waitForTimeout(1500);
  check('opt-in copy with ids: no tag host is contacted before a choice', !s.requests.some((u) => TAG_HOSTS.test(u)), s.requests.filter((u) => TAG_HOSTS.test(u)).join(' '));
  await s.page.getByRole('button', { name: 'Accept all' }).first().click();
  await s.page.waitForTimeout(2500);
  let t = tagReq(s.requests);
  check('opt-in copy, "Accept all": the Google tag, the Meta Pixel and the TikTok Pixel load', t.google && t.meta && t.tiktok, JSON.stringify(t));
  await s.ctx.close();
  s = await open(TAGS, '/', { country: 'DE' });
  await s.page.getByRole('button', { name: 'Reject all' }).click();
  await s.page.waitForTimeout(1500);
  check('opt-in copy, "Reject all": no tag loads', !s.requests.some((u) => TAG_HOSTS.test(u)));
  await s.ctx.close();
  s = await open(TAGS, '/', { country: 'NL' });
  await s.page.getByRole('button', { name: 'Choose' }).click();
  await s.page.getByRole('switch', { name: 'Measurement cookies' }).check();
  await s.page.getByRole('button', { name: 'Save choices' }).click();
  await s.page.waitForTimeout(2000);
  t = tagReq(s.requests);
  const dl = await s.page.evaluate(() => JSON.stringify((window.dataLayer || []).map((a) => Array.from(a)).filter((a) => a[0] === 'consent')));
  check('opt-in copy, Measurement only: the Google tag with analytics granted and ads denied, no Meta or TikTok', t.google && !t.meta && !t.tiktok && /"analytics_storage":"granted"/.test(dl) && /"ad_storage":"denied"/.test(dl), dl);
  await s.ctx.close();
  s = await open(TAGS, '/', { country: 'US', gpc: true });
  await s.page.waitForTimeout(2000);
  t = tagReq(s.requests);
  check('elsewhere with Global Privacy Control: the Google tag for GA4 only, no Meta or TikTok', t.google && !t.meta && !t.tiktok, JSON.stringify(t));
  await s.ctx.close();
  s = await open(TAGS, '/?utm_source=meta&utm_campaign=p2', { country: 'US', width: 390, height: 844 });
  await s.page.waitForTimeout(2500);
  t = tagReq(s.requests);
  check('elsewhere (US): every tag loads without a banner', t.google && t.meta && t.tiktok && !(await visible(s.page, '#consent')), JSON.stringify(t));
  const before = s.hits.length;
  const t0 = Date.now();
  await Promise.all([s.page.waitForURL(`${listing.origin}/**`, { timeout: 5000 }), s.page.locator('[data-install="hero"]').click()]);
  const waited = Date.now() - t0;
  await s.page.waitForTimeout(300);
  const after = s.hits.slice(before).join('\n');
  const ev = { ads: /TestInstallLabel|\/conversion\//.test(after), meta: /ev=InstallClick/.test(after), tiktok: /InstallClick/.test(after.replace(/ev=InstallClick/g, '')) };
  check('Install click: the listing opens within about 300 ms', waited < 900, `${waited} ms`);
  check('Install click: the Ads conversion and InstallClick (Meta, TikTok) leave before the navigation', ev.ads && ev.meta && ev.tiktok, JSON.stringify(ev));
  const csp = s.errors.filter((e) => /Content Security Policy|Refused to/i.test(e));
  check('with every tag loaded: no content security policy refusal', !csp.length, csp.slice(0, 3).join(' | '));
  // GA4 batches events and sends them when the page goes away; a beacon from a leaving page escapes the browser's
  // request interception, so GA4's hits go to a local sink here (transport_url, a test-only wrapper; csp bypassed)
  {
    const got = [];
    const sink = createServer((req, res) => { let b = ''; req.on('data', (c) => { b += c; }); req.on('end', () => { got.push(decodeURIComponent(req.url + ' ' + b)); res.writeHead(204); res.end(); }); }).listen(4499);
    const ctx = await browser.newContext({ bypassCSP: true, extraHTTPHeaders: { 'cloudfront-viewer-country': 'US' } });
    await ctx.route(`${listing.origin}/**`, (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<title>listing</title>' }));
    await ctx.addInitScript(() => {
      let g;
      Object.defineProperty(window, 'gtag', { configurable: true, get: () => g, set(fn) { g = function () { const a = Array.from(arguments); if (a[0] === 'config' && /^G-/.test(a[1])) a[2] = { ...(a[2] || {}), transport_url: 'http://localhost:4499' }; return fn.apply(this, a); }; } });
    });
    const p = await ctx.newPage();
    await p.goto(`http://localhost:${TAGS}/first-product-page/`, { waitUntil: 'load' });
    await p.waitForTimeout(2500);
    await Promise.all([p.waitForURL(`${listing.origin}/**`), p.locator('[data-install="pricing"]').click()]);
    await p.waitForTimeout(2000);
    const hit = got.find((g) => /en=install_click/.test(g)) || '';
    check('Install click: install_click reaches GA4 when the page leaves for the listing, with variant, placement, utm_source and in_app', /ep\.variant=first/.test(hit) && /ep\.placement=pricing/.test(hit) && /ep\.in_app=none/.test(hit) && /ep\.utm_source=/.test(hit), hit.match(/ep\.[a-z_]+=[^&\s]*/g)?.join(' ') || 'no hit');
    await ctx.close();
    sink.close();
  }
  console.log('  console of the tags page:', s.errors.filter((e) => !/Content Security Policy|Refused to/i.test(e)).slice(0, 5).join(' | ') || 'clean');
  await s.ctx.close();
}

// ---------- 6. Lighthouse mobile ----------
if (step('lighthouse') && !argv.includes('--no-lighthouse')) {
  const LH = await serve('dist', 4403, 'US');
  const LH_DE = await serve('dist', 4404, 'DE');
  for (const [id, v] of [...Object.entries(VARIANTS).map(([id, v]) => [id, v, LH]), ['default-de', VARIANTS.default, LH_DE]]) {
    const out = `${CHECK}lighthouse-${id}.json`;
    // async: the servers live in this process, a blocking spawn would starve them
    const r = await new Promise((done) => {
      const p = spawn('npx', ['--yes', 'lighthouse@13.5.0', `http://localhost:${typeof v === 'object' && id === 'default-de' ? LH_DE : LH}${v.path}`, '--quiet', '--output=json', `--output-path=${out}`,
        '--only-categories=performance,accessibility,best-practices,seo', '--chrome-flags=--headless=new'], { cwd: HERE }); // the installed Chrome (Chrome for Testing 1248 closes the target under Lighthouse 13)
      let stderr = '';
      p.stderr.on('data', (c) => { stderr += c; });
      p.on('close', (status) => done({ status, stderr }));
    });
    if (r.status !== 0) { check(`lighthouse ${id}`, false, (r.stderr || '').slice(-300)); continue; }
    const j = JSON.parse(readFileSync(out, 'utf8'));
    const sc = (k) => Math.round((j.categories[k]?.score ?? 0) * 100);
    const lcp = j.audits['largest-contentful-paint'].numericValue;
    const cls = j.audits['cumulative-layout-shift'].numericValue;
    const failedA11y = Object.values(j.audits).filter((a) => a.score === 0 && j.categories.accessibility.auditRefs.some((x) => x.id === a.id)).map((a) => a.id);
    check(`lighthouse mobile ${id}: LCP < 2.0 s, CLS < 0.05, performance >= 90, accessibility 100`, lcp < 2000 && cls < 0.05 && sc('performance') >= 90 && sc('accessibility') === 100,
      `LCP ${(lcp / 1000).toFixed(2)} s, CLS ${cls.toFixed(3)}, TBT ${Math.round(j.audits['total-blocking-time'].numericValue)} ms, performance ${sc('performance')}, accessibility ${sc('accessibility')}, best practices ${sc('best-practices')}, seo ${sc('seo')}${failedA11y.length ? ', a11y fails: ' + failedA11y : ''}`);
  }
}

await browser.close();
if (wk) await wk.close();
for (const s of servers) s.close();
const failed = results.filter((r) => !r.ok);
writeFileSync(CHECK + 'report.json', JSON.stringify({ at: new Date().toISOString(), failed: failed.length, results }, null, 2));
console.log(failed.length ? `\n${failed.length} failure(s)` : '\nall clean');
process.exit(failed.length ? 1 : 0);
