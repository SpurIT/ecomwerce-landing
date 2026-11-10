// The ad and analytics ids. An empty id loads nothing; no accounts exist yet (2026-11-10, TASK.md phase 2).
// The App Store listing's tracking fields take the same GA4 and Meta ids. The page's content security policy allows
// only the hosts of the ids set here (src/lib/csp.mjs), so a new id needs nothing but a deploy.
export const TAGS = {
  ga4: '', // G-XXXXXXXXXX: the GA4 web stream of ecomwerce.com; mark install_click as a key event in GA4
  googleAds: '', // AW-XXXXXXXXX: the Google Ads account's tag
  googleAdsInstallLabel: '', // the label of the conversion action for the Install click
  metaPixel: '', // the Meta dataset (pixel) id
  tiktokPixel: '', // the TikTok pixel code
};
