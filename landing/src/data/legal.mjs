// The legal pages: clearly marked placeholders until the operator's texts come (copy.md, legal pages). The lines that
// are not placeholders state what the page does (src/scripts/landing.js), as a draft for legal to check and replace.
import { INPUTS } from './landing.mjs';

const ph = (v, label) => v || `[${label}]`;
const who = `${ph(INPUTS.legalName, 'legal name')}, ${ph(INPUTS.address, 'address')}. Contact: ${ph(INPUTS.supportEmail, 'support email')}.`;

export const LEGAL = {
  privacy: {
    path: '/privacy/',
    title: 'Privacy policy',
    sections: [
      { p: ["Placeholder: the privacy policy for this website goes here before launch. The lines below are a draft of what the page does, for legal to check."] },
      { h: 'Who runs this website', p: [who] },
      { h: 'What this website collects', p: ['It sets one cookie that remembers your privacy choice. With your consent, or in countries where no consent is needed for it, it loads Google Analytics, Google Ads, the Meta Pixel and the TikTok Pixel, which count visits and measure our ads (see the cookie policy).', 'It has no forms and no accounts. You install Ecomwerce on the Shopify App Store, under Shopify\'s terms.'] },
      { h: 'Your choices', p: ['"Privacy choices" at the bottom of every page changes your choice at any time. If your browser sends a Global Privacy Control signal, we treat it as a no to advertising.'] },
      { p: ['[Placeholder: legal bases, how long data is kept, transfers outside the EU, your rights, the supervisory authority, a link to the app\'s privacy policy.]'] },
    ],
  },
  terms: {
    path: '/terms/',
    title: 'Terms',
    sections: [
      { p: ["Placeholder: the terms of use for this website go here before launch, from our legal team."] },
      { h: 'Who runs this website', p: [who] },
      { p: ['You install Ecomwerce on the Shopify App Store, and its charges appear on your Shopify invoice. [Placeholder: the app\'s terms of service and where to find them.]'] },
    ],
  },
  cookies: {
    path: '/cookies/',
    title: 'Cookie policy',
    sections: [
      { p: ["Placeholder: the cookie policy for this website goes here before launch. The table is a draft of the cookies this website can set, for legal to check against each provider's current documentation."] },
      {
        h: 'Cookies on this website',
        table: [
          ['Necessary', 'ew_consent', 'Remembers your privacy choice.', '6 months'],
          ['Measurement', '_ga, _ga_<id> (Google Analytics)', 'Counts visits and tells visits apart.', 'up to 2 years'],
          ['Advertising', '_gcl_au (Google Ads)', 'Measures which Google ads bring visits.', '3 months'],
          ['Advertising', '_fbp (Meta)', 'Measures which Meta ads bring visits.', '3 months'],
          ['Advertising', '_ttp (TikTok)', 'Measures which TikTok ads bring visits.', '13 months'],
        ],
      },
      { h: 'Your choice', p: ['In the EEA, the UK and Switzerland nothing but the necessary cookie is set before you choose. Elsewhere measurement and advertising are on until you turn them off. "Privacy choices" at the bottom of every page changes your choice at any time.'] },
    ],
  },
};
