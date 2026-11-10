// The page's one script (budget: under 50 KB before the ad tags). It does five things:
// 1. consent: the banner in the opt-in copy until a choice, the settings, "Privacy choices", a first-party cookie,
//    and Global Privacy Control as a no to advertising (TASK.md q4);
// 2. the tag loader: the Google tag (GA4, Google Ads) with Consent Mode v2 signals, the Meta Pixel and the TikTok Pixel,
//    each only after its consent and only when its id is set (src/config/tags.mjs);
// 3. the events: a page view, and on every Install click InstallClick (Meta, TikTok), install_click (GA4) and the
//    Google Ads conversion, with variant, placement, utm_source and in_app; the navigation waits 300 ms at most;
// 4. the visit's utm parameters on every Install link (the html carries the landing's defaults);
// 5. in the Instagram, Facebook and TikTok browsers only: the hint under the hero button and "Copy link".
// The build motion is css (bundle.css, ew-card--build). The config comes from <script id="ew-config"> (Base.astro).
const config = JSON.parse(document.getElementById('ew-config')?.textContent || '{}');
const optinCopy = config.geo !== 'optout';
const params = new URLSearchParams(location.search);
const gpc = navigator.globalPrivacyControl === true;
const ua = navigator.userAgent;
const inApp = /Instagram/i.test(ua) ? 'instagram'
  : /FBAN|FBAV|FB_IAB|FB4A|FBIOS/.test(ua) ? 'facebook'
  : /BytedanceWebview|musical_ly|TikTok|trill/i.test(ua) ? 'tiktok' : 'none';

// ---------- 1. consent ----------
// the cookie holds the choice and its date, for 180 days: ew_consent=m1a0.20261110
const COOKIE = 'ew_consent';
function readChoice() {
  const m = document.cookie.match(/(?:^|;\s*)ew_consent=m([01])a([01])\.\d{8}(?:;|$)/);
  return m ? { measurement: m[1] === '1', advertising: m[2] === '1' } : null;
}
function writeChoice(c) {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  document.cookie = `${COOKIE}=m${c.measurement ? 1 : 0}a${c.advertising ? 1 : 0}.${day}; Max-Age=${180 * 86400}; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
}
const stored = readChoice();
// in force: a stored choice; else nothing in the opt-in copy and everything elsewhere; GPC always says no to advertising
let consent = stored || { measurement: !optinCopy, advertising: !optinCopy };
if (gpc) consent = { ...consent, advertising: false };

const banner = document.getElementById('consent');
const part = (name) => banner.querySelector(`[data-consent-part="${name}"]`);
const switchFor = (cat) => banner.querySelector(`[data-consent-cat="${cat}"]`);
let opener = null;

function openBanner(which, from) {
  if (!banner) return;
  opener = from || null;
  banner.hidden = false;
  part('summary').hidden = which === 'settings';
  part('settings').hidden = which !== 'settings';
  switchFor('measurement').checked = consent.measurement;
  const adv = switchFor('advertising');
  adv.checked = consent.advertising;
  if (gpc) {
    adv.checked = false;
    adv.disabled = true;
    adv.setAttribute('aria-describedby', 'consent-gpc');
    document.getElementById('consent-gpc').hidden = false;
  }
  if (which === 'settings' && from) switchFor('measurement').focus();
}
function decide(measurement, advertising) {
  consent = { measurement, advertising: advertising && !gpc };
  writeChoice(consent);
  banner.hidden = true;
  if (opener) opener.focus();
  applyConsent();
}
if (banner) {
  banner.addEventListener('click', (e) => {
    const act = e.target.closest('[data-consent]')?.dataset.consent;
    if (act === 'accept') decide(true, true);
    else if (act === 'reject') decide(false, false);
    else if (act === 'save') decide(switchFor('measurement').checked, switchFor('advertising').checked);
    else if (act === 'choose') { openBanner('settings', opener); switchFor('measurement').focus(); }
  });
  for (const li of document.querySelectorAll('[data-consent-link]')) li.hidden = false;
  for (const btn of document.querySelectorAll('[data-consent-open]')) btn.addEventListener('click', () => openBanner('settings', btn));
  if (optinCopy && !stored) openBanner('summary');
}

// ---------- 2. tags ----------
const loaded = { google: false, ga4: false, ads: false, meta: false, tiktok: false };
function addScript(src) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.append(s);
}
function googleConsent() {
  const ad = consent.advertising ? 'granted' : 'denied';
  return { ad_storage: ad, ad_user_data: ad, ad_personalization: ad, analytics_storage: consent.measurement ? 'granted' : 'denied' };
}
function google() {
  const wantGa4 = consent.measurement && config.ga4;
  const wantAds = consent.advertising && config.googleAds;
  if (!loaded.google && (wantGa4 || wantAds)) {
    loaded.google = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', googleConsent());
    window.gtag('js', new Date());
    addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.ga4 || config.googleAds)}`);
  } else if (loaded.google) {
    window.gtag('consent', 'update', googleConsent());
  }
  if (loaded.google) window.gtag('set', 'ads_data_redaction', !consent.advertising);
  if (wantGa4 && !loaded.ga4) { loaded.ga4 = true; window.gtag('config', config.ga4, { variant: config.campaign }); }
  if (wantAds && !loaded.ads) { loaded.ads = true; window.gtag('config', config.googleAds); }
}
function meta() {
  if (!(consent.advertising && config.metaPixel)) { if (loaded.meta) window.fbq('consent', 'revoke'); return; }
  if (loaded.meta) { window.fbq('consent', 'grant'); return; }
  loaded.meta = true;
  // the Meta Pixel base code, written out: a queue until fbevents.js takes over
  const fbq = function fbq() { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
  window.fbq = fbq;
  if (!window._fbq) window._fbq = fbq;
  Object.assign(fbq, { push: fbq, loaded: true, version: '2.0', queue: [] });
  addScript('https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', config.metaPixel);
  fbq('track', 'PageView');
}
function tiktok() {
  if (!(consent.advertising && config.tiktokPixel)) { if (loaded.tiktok) window.ttq.revokeConsent(); return; }
  if (loaded.tiktok) { window.ttq.grantConsent(); return; }
  loaded.tiktok = true;
  // the TikTok Pixel base code, written out: methods queue until events.js takes over
  window.TiktokAnalyticsObject = 'ttq';
  const ttq = (window.ttq = window.ttq || []);
  ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent'];
  ttq.setAndDefer = (t, m) => { t[m] = function () { t.push([m].concat(Array.prototype.slice.call(arguments, 0))); }; };
  for (const m of ttq.methods) ttq.setAndDefer(ttq, m);
  ttq.instance = (id) => { const e = ttq._i[id] || []; for (const m of ttq.methods) ttq.setAndDefer(e, m); return e; };
  ttq.load = (id, opts) => {
    const src = 'https://analytics.tiktok.com/i18n/pixel/events.js';
    ttq._i = ttq._i || {}; ttq._i[id] = []; ttq._i[id]._u = src;
    ttq._t = ttq._t || {}; ttq._t[id] = +new Date();
    ttq._o = ttq._o || {}; ttq._o[id] = opts || {};
    addScript(`${src}?sdkid=${encodeURIComponent(id)}&lib=ttq`);
  };
  ttq.load(config.tiktokPixel);
  ttq.page();
}
function applyConsent() {
  google();
  meta();
  tiktok();
}
applyConsent();

// ---------- 3. events on every Install click ----------
document.addEventListener('click', (e) => {
  const a = e.target.closest?.('a[data-install]');
  if (!a) return;
  const data = { variant: config.campaign, placement: a.dataset.install, utm_source: params.get('utm_source') || '(none)', in_app: inApp };
  const waits = [];
  if (loaded.ga4 && consent.measurement) waits.push((done) => window.gtag('event', 'install_click', { ...data, send_to: config.ga4, transport_type: 'beacon', event_callback: done, event_timeout: 300 }));
  if (loaded.ads && consent.advertising && config.googleAdsInstallLabel) waits.push((done) => window.gtag('event', 'conversion', { send_to: `${config.googleAds}/${config.googleAdsInstallLabel}`, event_callback: done, event_timeout: 300 }));
  let beacons = false;
  if (loaded.meta && consent.advertising) { window.fbq('trackCustom', 'InstallClick', data); beacons = true; }
  if (loaded.tiktok && consent.advertising) { window.ttq.track('InstallClick', data); beacons = true; }
  if (!waits.length && !beacons) return;
  const plain = e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !a.target;
  if (!plain) { for (const w of waits) w(() => {}); return; }
  e.preventDefault();
  let left = waits.length;
  let gone = false;
  const go = () => { if (!gone) { gone = true; location.href = a.href; } };
  for (const w of waits) w(() => { left -= 1; if (left <= 0 && !beacons) go(); });
  setTimeout(go, 300);
});

// ---------- 4. the visit's utm parameters on every Install link ----------
const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
const visitUtm = UTM.filter((k) => params.get(k)).map((k) => [k, params.get(k)]);
if (visitUtm.length) {
  for (const a of document.querySelectorAll('a[data-install]')) {
    const url = new URL(a.href);
    for (const k of UTM) url.searchParams.delete(k);
    for (const [k, v] of visitUtm) url.searchParams.set(k, v);
    a.href = url.toString();
  }
}

// ---------- 5. in-app browsers: the hint and "Copy link" (this page's url with its parameters) ----------
const hint = document.querySelector('[data-inapp]');
if (hint && inApp !== 'none') {
  hint.hidden = false;
  const btn = hint.querySelector('[data-copy-link]');
  const field = hint.querySelector('[data-copy-field]');
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      btn.textContent = 'Link copied';
    } catch {
      // no clipboard here: a selectable field instead
      const input = field.querySelector('input');
      input.value = location.href;
      field.hidden = false;
      input.focus();
      input.select();
    }
  });
}
