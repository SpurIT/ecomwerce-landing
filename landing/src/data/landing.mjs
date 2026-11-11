// The one source of the landing page's state. Copy comes from tasks/landing/copy.md: change it there first.
// Made from tasks/landing/design/variants.js (phase 1); each variant is a static page at its own path, built twice:
// at its path and, for the EEA, the UK, Switzerland and unknown countries, under OPTIN_PREFIX (edge/geo.mjs).

export const SITE = {
  origin: 'https://ecomwerce.com',
  name: 'Ecomwerce',
  description: 'Pick a product from your Shopify catalog. Ecomwerce writes its product page, you preview it on your store and go live when you decide. Free to install. Your first 2 product pages are free, then $3 per product page.',
};

export const OPTIN_PREFIX = '/_optin';

// The price (docs/specs/billing.md BL-1): $3 per product page, the first 2 free for the life of the shop, the $60 cap
// is 20 paid pages a 30-day cycle and building pauses at it. CostChart.astro and the comparison compute from it.
export const PRICE = { perPage: 3, freePages: 2, capPages: 20 };

// The App Store listing. The app is not listed yet: a search url stands in (it cannot land on another company's app);
// replace it with https://apps.shopify.com/<handle> when the operator gives the handle.
export const LISTING_URL = 'https://apps.shopify.com/search?q=ecomwerce';

// Gates are facts about the app and the evidence, never conclusions. All false on 2026-11-10. A part whose gate is
// closed is left out of the html and its launch stand-in is built instead (copy.md, gates).
export const GATES = {
  ec37Shipped: false, // g1: the next product lands in the existing theme on production (NP-1, EC-37, D11)
  proofFixesShipped: false, // g2: PL-01 to PL-04 fixed and re-checked in the app source
  sampleBuildExists: false, // g3: a product page built by Ecomwerce on a development store, our product, real photos
  timeClaimCleared: false, // g4: D1 decided and the build time re-measured on the production app
};
export const GATE_FACT = { g1: 'ec37Shipped', g2: 'proofFixesShipped', g3: 'sampleBuildExists', g4: 'timeClaimCleared' };

// g3's inputs: the real build. An image is { src (imported from src/assets), width, height, alt }; the build fails
// when g3 opens while one of them is empty, so a placeholder never ships.
export const SAMPLE = {
  heroPhoto: null, // the product photo in the hero card, AVIF or WebP, square
  heroTitle: '', // that product's title as on the store
  heroPrice: '', // its price as on the store, for example $34.00
  screenshot: null, // the built product page without browser chrome
  product: '', // the product's name for the caption
  built: '', // the build date for the caption, for example 2 December 2026
};

// A variant changes only the eyebrow, the headline (hero and final call, and the title), the lead, the hero visual and
// where "No Shopify store yet?" sits in the hero: noStore 'under-install' on the p1 page, whose visitors arrive without
// a store most often (personas p1), else last in the hero text (2026-11-11).
export const VARIANTS = {
  default: {
    path: '/',
    angle: 'p2 product tester (Meta, TikTok)',
    eyebrow: 'Shopify app for product testers',
    headline: { gate: 'g1', target: 'A product page for every product you test.', launch: 'Your product page, ready for ads in minutes.' },
    title: { gate: 'g1', target: 'Ecomwerce: a product page for every product you test', launch: 'Ecomwerce: your product page, ready for ads in minutes' },
    lead: 'Pick a product in your Shopify store. Ecomwerce writes and builds the page your ads send people to: a hook headline, benefits, reasons to buy and an FAQ.',
  },
  first: {
    path: '/first-product-page/',
    angle: 'p1 first-store beginner with a product (Meta, TikTok)',
    eyebrow: 'Shopify app for new stores',
    headline: { target: 'Your first product page, built for you in minutes.' },
    title: { target: 'Ecomwerce: your first product page, built for you in minutes' },
    lead: 'Already have a product in your Shopify store? Pick it, and Ecomwerce writes and builds its page: a hook headline, benefits, reasons to buy and an FAQ.',
    noStore: 'under-install',
  },
  builder: {
    path: '/product-page-builder/',
    angle: 'Google search, ad group "product page builder"',
    eyebrow: 'Product page builder for Shopify',
    headline: { target: 'The product page builder that writes the page in minutes.' },
    title: { target: 'Ecomwerce: the product page builder that writes the page in minutes' },
    lead: 'No drag and drop. Pick a product from your catalog, and Ecomwerce writes and builds its page: a hook headline, benefits, reasons to buy and an FAQ. You can still edit it in the Shopify theme editor.',
  },
};

// Defaults for the Install links when a visit carries no utm parameters (copy.md, message match); utm_campaign is the
// variant (or legal, 404), utm_content the placement of the link.
export const UTM_DEFAULTS = { utm_source: 'ecomwerce.com', utm_medium: 'landing' };

// The operator's inputs; an empty one shows its marked placeholder (copy.md, inputs).
export const INPUTS = {
  supportEmail: '',
  legalName: '',
  address: '',
  register: '',
  vatId: '',
  representative: '',
  legalTextsConfirmed: false, // the privacy, terms, cookie and legal notice texts confirmed by legal
};
