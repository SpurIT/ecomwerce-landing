// Build-time lookups shared by the components: gates, Install links, the tag ids in use and the content security policy.
import { readFileSync } from 'node:fs';
import { GATES, GATE_FACT, LISTING_URL, UTM_DEFAULTS } from '../data/landing.mjs';
import { TAGS } from '../config/tags.mjs';

// EW_GATES_OPEN=g1,g2,g4 and EW_TAGS=<json with fake ids> are for the check builds only (scripts/check.mjs);
// the deploy refuses a build made with either.
const forced = new Set((process.env.EW_GATES_OPEN || '').split(',').filter(Boolean));
export const isOpen = (g) => forced.has(g) || GATES[GATE_FACT[g]] === true;
export const tags = process.env.EW_TAGS ? { ...TAGS, ...JSON.parse(readFileSync(process.env.EW_TAGS, 'utf8')) } : TAGS;

// The variant's text for a gated pair { gate, target, launch }: the target once its gate is open.
export const gated = (t) => (t.gate && !isOpen(t.gate) ? t.launch : t.target);

// An Install link: the listing with the landing's utm defaults; the script swaps in the visit's utm parameters.
export function installHref(campaign, placement) {
  const url = new URL(LISTING_URL);
  for (const [k, v] of Object.entries({ ...UTM_DEFAULTS, utm_campaign: campaign, utm_content: placement })) url.searchParams.set(k, v);
  return url.toString();
}

// The hosts each tag needs, from the vendors' content security policy guidance; check each tag in its debug tool once
// the ids exist (TASK.md phase 2). An id left empty adds no host.
// Google Ads also reports to ad.doubleclick.net (seen in the check with fake ids, 2026-11-10) and, for audiences, to the
// Google domain of the visitor's country: the launch geos' domains are listed.
const GOOGLE_TLDS = ['com', 'co.uk', 'ca', 'com.au', 'fr', 'de', 'es', 'it', 'nl'].map((t) => `https://www.google.${t}`);
const HOSTS = {
  google: { script: ['https://www.googletagmanager.com'], connect: ['https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://*.googletagmanager.com', 'https://*.doubleclick.net', 'https://www.google.com'], img: ['https://*.google-analytics.com', 'https://*.googletagmanager.com', 'https://*.doubleclick.net', 'https://www.google.com'] },
  googleAds: { script: ['https://www.googleadservices.com', 'https://googleads.g.doubleclick.net', 'https://www.google.com'], connect: [...GOOGLE_TLDS, 'https://www.googleadservices.com', 'https://pagead2.googlesyndication.com'], img: [...GOOGLE_TLDS, 'https://www.googleadservices.com', 'https://pagead2.googlesyndication.com'], frame: ['https://td.doubleclick.net', 'https://www.googletagmanager.com'] },
  meta: { script: ['https://connect.facebook.net'], connect: ['https://www.facebook.com', 'https://connect.facebook.net'], img: ['https://www.facebook.com'] },
  tiktok: { script: ['https://analytics.tiktok.com'], connect: ['https://analytics.tiktok.com', 'https://analytics-ipv6.tiktokw.us'], img: ['https://analytics.tiktok.com'] },
};

// The page's policy as a meta tag (the header adds frame-ancestors, which a meta tag cannot carry: edge/headers.mjs).
export function csp(t) {
  const use = [];
  if (t.ga4 || t.googleAds) use.push(HOSTS.google);
  if (t.googleAds) use.push(HOSTS.googleAds);
  if (t.metaPixel) use.push(HOSTS.meta);
  if (t.tiktokPixel) use.push(HOSTS.tiktok);
  const list = (k) => [...new Set(use.flatMap((h) => h[k] || []))];
  const src = (k) => ["'self'", ...list(k)].join(' ');
  const frame = list('frame');
  return [
    "default-src 'self'",
    `script-src ${src('script')}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${src('img')}`,
    "font-src 'self'",
    `connect-src ${src('connect')}`,
    `frame-src ${frame.length ? frame.join(' ') : "'none'"}`,
    "base-uri 'self'",
    "form-action 'none'",
    "object-src 'none'",
  ].join('; ');
}
