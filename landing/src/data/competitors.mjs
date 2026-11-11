// The comparison's one source (tasks/landing/copy.md, comparison; TASK.md phase 4 RESEARCH; DECISIONS.md 2026-11-11).
// Every price was re-checked on the app's Shopify App Store listing on CHECKED; how each one publishes comes from our
// own installs (kb walkthroughs, October 2026), PagePilot's from its listing. No speed row: all three generate faster.
// Read by src/components/Compare.astro, scripts/check.mjs (every dollar amount the page may show) and
// brand/tools/build-brand.mjs (the ComparisonTable preview). Re-check every price on the listings before a deploy.
import { PRICE } from './landing.mjs';

export const CHECKED = { iso: '2026-11-11', text: '11 November 2026' };

const usd = (n) => `$${n}`;

export const ROWS = [
  ['builds', 'What it builds'],
  ['pay', 'How you pay'],
  ['start', 'To start'],
  ['twelve', '12 product pages a month (3 tests a week)'],
  ['idle', 'A month without tests'],
  ['publish', 'Publishing'],
];

const pp = { lite: 39, litePages: 10, scaler: 59 };
const dm = { premium: 79 };
const fg = { builder: 29.99, builderPages: 20, top: 149.99, trialDays: 7, freeStores: 1 };

// prices: every dollar amount the app's cells show, as numbers (the html audit takes them from here)
export const APPS = [
  {
    name: 'Ecomwerce', us: true,
    prices: [PRICE.perPage, 12 * PRICE.perPage, 0],
    cells: {
      builds: 'A product page, in a new theme on your store',
      pay: `${usd(PRICE.perPage)} per product page`,
      start: `Free: your first ${PRICE.freePages} product pages, live on your store`,
      twelve: usd(12 * PRICE.perPage),
      idle: usd(0),
      publish: 'You preview it on your store, then press Go live',
    },
  },
  {
    name: 'PagePilot', listing: 'https://apps.shopify.com/pagepilotai',
    prices: [pp.lite, pp.scaler],
    cells: {
      builds: 'AI product pages, on the theme you run',
      pay: `A monthly plan: ${usd(pp.lite)} for ${pp.litePages} pages, ${usd(pp.scaler)} for unlimited`,
      start: `Free to build; publishing starts at ${usd(pp.lite)} a month`,
      twelve: `${usd(pp.scaler)} (Lite stops at ${pp.litePages})`,
      idle: `${usd(pp.lite)} or ${usd(pp.scaler)}, unless you cancel`,
      publish: 'On a paid plan, on the theme you run',
    },
  },
  {
    name: 'Dropmagic', listing: 'https://apps.shopify.com/dropmagic-ai',
    prices: [dm.premium],
    cells: {
      builds: 'A store around one product: a home page and product pages',
      pay: `A monthly plan: ${usd(dm.premium)}`,
      start: `Free to build; publishing needs the ${usd(dm.premium)} plan`,
      twelve: usd(dm.premium),
      idle: `${usd(dm.premium)}, unless you cancel`,
      publish: 'Straight into your live theme, with no confirmation step',
    },
  },
  {
    name: 'Forge AI', listing: 'https://apps.shopify.com/forge-ai-store-builder',
    prices: [fg.builder, fg.top],
    cells: {
      builds: 'A store: a home page and product pages, plus advertorials and listicles',
      pay: `A monthly plan: ${usd(fg.builder)} for ${fg.builderPages} pages, up to ${usd(fg.top)}`,
      start: `Free to build and preview ${fg.freeStores} store; paid plans start with a ${fg.trialDays}-day trial`,
      twelve: `${usd(fg.builder)} (up to ${fg.builderPages} pages)`,
      idle: `${usd(fg.builder)} or more, unless you cancel`,
      publish: 'Into a copy of your live theme, which you publish',
    },
  },
];

export const SOURCE = `Prices from each app’s Shopify App Store listing in USD, checked ${CHECKED.text}. How each one publishes: from our own installs in October 2026, PagePilot’s from its listing. Plans change, so check each listing before you choose.`;

// "$39", "$29.99": the amounts as the page writes them
export const DOLLARS = [...new Set(APPS.flatMap((a) => a.prices).map(usd))];
