// The legal pages: the privacy policy, the terms of service and the cookie policy of ECOMWERCE INC, written on
// 2026-11-19 from what the website does (src/scripts/landing.js, src/config/tags.mjs) and what the app does (the app
// repository at 653139e: scopes, AI, hosting, uninstall and shop/redact; billing BL-1), for legal to review. The pages
// stay noindex until INPUTS.legalTextsConfirmed. Text in p and ul is html (links); table cells are plain text.
import { INPUTS, PRICE } from './landing.mjs';

const ph = (v, label) => v || `[${label}]`;
const NAME = ph(INPUTS.legalName, 'legal name');
const ADDRESS = ph(INPUTS.address, 'address');
const MAIL = INPUTS.supportEmail ? `<a href="mailto:${INPUTS.supportEmail}">${INPUTS.supportEmail}</a>` : '[support email]';
const a = (href, text) => `<a href="${href}" rel="noopener">${text}</a>`;
const CHOICES = '"Privacy choices" at the bottom of every page';
const FREE = PRICE.freePages;
const PER_PAGE = `$${PRICE.perPage}`;
const CAP = `$${PRICE.perPage * PRICE.capPages}`;
const contact = { h: 'Contact', p: [`${NAME}, ${ADDRESS}. Email: ${MAIL}.`] };

export const LEGAL = {
  privacy: {
    path: '/privacy/',
    title: 'Privacy policy',
    updated: '2026-11-19',
    sections: [
      { p: [`This policy explains what personal data ${NAME} ("Ecomwerce", "we", "us") collects through the website ecomwerce.com and the Ecomwerce app for Shopify, why we collect it, who we share it with and what choices you have.`] },
      { h: 'Who we are', p: [`${NAME}, ${ADDRESS}. Email: ${MAIL}. We decide how and why your personal data is used (we are the controller), except where this policy says we process data on behalf of a merchant.`] },
      {
        h: 'On ecomwerce.com',
        p: ['The website has no forms and no accounts. It collects:'],
        ul: [
          'Technical data that every web request carries, such as your IP address, browser, device and the page you ask for. Our hosting providers process it to deliver the page and keep the website secure.',
          'Your privacy choice, in a cookie that lasts 180 days.',
          'With your consent where the law requires it, and otherwise until you turn it off: data about your visit collected by Google Analytics, Google Ads, the Meta Pixel and the TikTok Pixel. This includes the pages and page version you see, whether you click Install, the ad or campaign that brought you, the kind of in-app browser you use, cookie identifiers, and the IP address and device data these providers collect.',
        ],
        after: ['We use this data to run and secure the website, to count visits, to learn which ads and page versions bring merchants to the app, and to show our ads to people who may be interested. The Install links take you to the Shopify App Store, where Shopify\'s privacy policy applies. The cookie policy lists every cookie.'],
      },
      {
        h: 'In the Ecomwerce app',
        p: ['When you install Ecomwerce, Shopify gives the app the access you approve: to read your themes and your store\'s legal policies, and to write products and themes. The app does not ask for access to your customers or your orders. It processes:'],
        ul: [
          'Store and account data: your store\'s domain and the access tokens Shopify issues to the app, and, when you open the app, the name, email address, language and role of the staff member Shopify identifies to it.',
          'Store content: your products (titles, descriptions, images, variants, prices, tags and similar details), your refund and shipping policies, and the product reviews and ratings stored in your store, which can include your customers\' names and photos.',
          'What you give the app: the products you pick, your settings, and any file you upload to describe your customers.',
          'What the app makes: the page text, generated images, and the themes and templates it writes to your store.',
          'Usage and billing data: your builds and their status, how many product pages your store has built, and the usage the app reports to Shopify for billing. Shopify takes the payments, and we never see your card details.',
          'Technical logs: error and request logs from our servers.',
        ],
        after: ['We use this data to build and update your pages, to show you your builds, to bill through Shopify, to answer your messages, and to keep the app secure and working.'],
      },
      {
        h: 'How the app uses AI',
        p: [`To write and illustrate your pages, the app sends your store content and settings to AI models through ${a('https://openrouter.ai/privacy', 'OpenRouter')}, which passes our requests to model providers such as ${a('https://www.anthropic.com/legal/privacy', 'Anthropic')} and ${a('https://openai.com/policies/privacy-policy/', 'OpenAI')}. They process it to return the text and images we ask for. We do not train AI models on your data.`],
      },
      {
        h: 'Data about your customers',
        p: ['Reviews in your store can name your customers. When the app reads them to write your pages, we process that data on your behalf and only to build your pages, and you stay responsible for it toward your customers. If you need a data processing agreement, write to us.'],
      },
      {
        h: 'Legal bases',
        p: ['If you are in the European Economic Area, the United Kingdom or Switzerland, we rely on:'],
        ul: [
          'our contract with you, to run the app and bill through Shopify;',
          'our legitimate interests, to secure the website and the app, fix errors, improve the product and answer messages;',
          `your consent, for analytics and advertising on the website, which you can withdraw at any time with ${CHOICES};`,
          'our legal obligations, for tax and accounting records.',
        ],
      },
      {
        h: 'Who we share it with',
        ul: [
          `${a('https://www.shopify.com/legal/privacy', 'Shopify')}, which runs your store, the App Store and billing.`,
          'Amazon Web Services, which hosts the app and its data in the United States, and the providers that host and deliver the website.',
          'OpenRouter, Anthropic and OpenAI, as the AI model providers described above.',
          `${a('https://policies.google.com/technologies/partner-sites', 'Google')}, ${a('https://www.facebook.com/privacy/policy/', 'Meta')} and ${a('https://www.tiktok.com/legal/privacy-policy', 'TikTok')}, for the website's analytics and advertising. They can also use this data for their own purposes under their own policies.`,
          'Professional advisers, authorities when the law requires it, and a buyer or successor if our business is sold or merged.',
        ],
        after: ['We do not sell personal data for money.'],
      },
      {
        h: 'If you live in a US state with a privacy law',
        p: [
          `The website's advertising cookies (Google Ads, Meta and TikTok) can count as "sharing" personal information for cross-context behavioral advertising, or as a "sale", under the privacy laws of California and other states. You can opt out with ${CHOICES}, and we treat a Global Privacy Control signal from your browser as an opt-out. We do not knowingly sell or share the personal information of anyone under 16.`,
          'You also have the right to know what personal information we hold about you, to get a copy, and to have it corrected or deleted. We will not treat you differently for using these rights.',
        ],
      },
      {
        h: 'Transfers outside your country',
        p: ['We are based in the United States, and our providers process data in the United States and other countries. When personal data leaves the European Economic Area, the United Kingdom or Switzerland, we rely on the EU-U.S. Data Privacy Framework and its UK and Swiss extensions where the recipient is certified, and otherwise on the European Commission\'s standard contractual clauses or another safeguard the law allows.'],
      },
      {
        h: 'How long we keep it',
        ul: [
          'Website: the privacy choice cookie lasts 180 days, and analytics and advertising cookies last as the cookie policy says. Server logs are kept only as long as needed for security.',
          `App: while the app is installed. When you uninstall it, we delete its access tokens at once. Shopify then asks us to erase your store's data, 48 hours after you uninstall, and we delete your store's records, builds and files within 30 days of that request. We keep your store's domain and how many product pages it has built, so the ${FREE} free product pages count once per store, and we keep the records the law requires for tax and accounting.`,
          'Messages to us: as long as we need them to help you and to keep a record of what we agreed.',
        ],
      },
      {
        h: 'Your rights',
        p: [
          `Depending on where you live, you can ask us to give you access to your personal data, correct it, delete it or send it to you in a portable form, and you can object to or ask us to restrict how we use it. Where we rely on your consent, you can withdraw it at any time. Write to ${MAIL}. We may need to confirm who you are first, and we answer within the time the law sets.`,
          'If you are in the European Economic Area, the United Kingdom or Switzerland, you can also complain to your data protection authority.',
        ],
      },
      { h: 'Security', p: ['We protect personal data with encryption in transit, access controls and limited staff access. No system is perfectly secure. If a breach affects your data, we will tell you and the authorities as the law requires.'] },
      { h: 'Children', p: ['The website and the app are for businesses. They are not directed to children, and we do not knowingly collect personal data from anyone under 16.'] },
      { h: 'Changes to this policy', p: ['We will post any change on this page and update the date at the top. If a change is significant, we will also tell app users in the app or by email.'] },
      contact,
    ],
  },
  terms: {
    path: '/terms/',
    title: 'Terms of service',
    updated: '2026-11-19',
    sections: [
      { p: [`These terms are an agreement between you and ${NAME} ("Ecomwerce", "we", "us"). They cover the website ecomwerce.com and the Ecomwerce app for Shopify (together, the "Service"). By installing the app or using the Service, you accept them. If you use the Service for a company, you accept them for that company and confirm you can bind it.`] },
      {
        h: 'The Service',
        p: [
          'Ecomwerce is an app for Shopify stores. You pick products from your Shopify catalog, and the app uses AI to write and build product pages for them as a theme in your store. You preview the result and decide whether and when it goes live.',
          'The Service is for businesses. To use it, you must be at least 18 and have a Shopify store.',
        ],
      },
      { h: 'Shopify', p: [`You install the app and pay for it through Shopify, so the ${a('https://www.shopify.com/legal/terms', 'Shopify Terms of Service')} also apply to you. If Shopify suspends your store or the app, the Service may stop working.`] },
      {
        h: 'Prices and billing',
        ul: [
          `Installing the app is free. Your first ${FREE} product pages are free, once per store, also if you reinstall the app.`,
          `After that, each product page costs ${PER_PAGE}. A build makes one product page for each product in it.`,
          'A product page is charged when its build is ready. A build that fails, or that you cancel before it starts, is not charged. If you cancel a build while it is running, its product pages are charged, because the AI has already worked on them.',
          `Charges are capped at ${CAP} per 30-day billing cycle (${PRICE.capPages} product pages). When you reach the cap, new builds wait until the next cycle.`,
          'Shopify bills the charges on your Shopify invoice in US dollars, with any taxes Shopify applies. If a charge looks wrong, write to us. Refunds, when we agree to one, go through Shopify.',
          'We can change prices with at least 30 days\' notice in the app or by email. A change does not affect product pages already charged.',
        ],
      },
      {
        h: 'Your content and what you publish',
        p: [
          'You keep all rights to the products, photos, texts and other content you give the Service ("Your Content"). You allow us to use Your Content only to provide the Service to you. You confirm that you have the rights to Your Content and that our use of it under these terms does not break the law or anyone\'s rights.',
          'AI writes and illustrates the pages. AI output can be wrong, incomplete, or similar to content made for others. Before a page goes live, check it: product facts, prices, claims about results or health, shipping, returns and guarantees, and anything that needs a licence or approval. You are responsible for what you publish and sell, and for following the laws and Shopify policies that apply to your store.',
          'The pages, texts and images the app makes for you ("Output") are yours to use in your store and your marketing. We do not claim ownership of Output. Because AI can make similar output for others, we cannot promise that Output is unique or protected by copyright.',
          'The themes the app builds are based on Shopify\'s Horizon theme, whose license from Shopify applies to its code. The pages are built with the app\'s blocks, so their content disappears from your store if you uninstall the app. The app tells you so before you go live.',
        ],
      },
      {
        h: 'Fair use',
        p: ['Do not use the Service to make content that is illegal, misleading, infringing, hateful or harmful, or to sell products that the law or Shopify forbids. Do not try to break or overload the Service, get around its limits or billing, copy or reverse engineer it, or use it to build a competing product.'],
      },
      { h: 'Other services', p: ['The Service relies on Shopify, AI model providers and hosting providers. We are not responsible for their services, and their own terms apply where you use them directly.'] },
      { h: 'Changes to the Service', p: ['We work to keep the Service available, but we do not promise that it will be uninterrupted or free of errors. We can change, add or remove features. If we stop the Service entirely, we will tell you at least 30 days ahead.'] },
      { h: 'Ending', p: ['You can stop at any time by uninstalling the app. The content of the pages built with the app\'s blocks then disappears from your store, and charges for product pages already built stay due. We can suspend or end your access if you break these terms, or if the law or Shopify requires it. The privacy policy says what happens to your data.'] },
      { h: 'No warranties', p: ['To the extent the law allows, the Service is provided "as is" and "as available", without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose and non-infringement. We do not promise any sales, conversions or other results from pages built with the Service.'] },
      { h: 'Limitation of liability', p: ['To the extent the law allows, we are not liable for indirect, incidental, special, consequential or punitive damages, or for lost profits, revenue, data or goodwill, and our total liability for all claims about the Service is limited to the greater of the amounts you paid us for the Service in the 12 months before the claim and US$100. Nothing in these terms limits liability that the law does not allow to be limited.'] },
      { h: 'Indemnity', p: ['You will defend and compensate us against claims by others that arise from Your Content, the pages you publish, the products you sell, or your breach of these terms.'] },
      { h: 'Governing law', p: ['These terms are governed by the laws of the State of Delaware, USA, without regard to its conflict of law rules. The state and federal courts in Delaware have exclusive jurisdiction over any dispute about them, unless the law of your country gives you the right to bring a claim at home.'] },
      { h: 'Changes to these terms', p: ['We may update these terms. We will post the new version here with its date and, for significant changes, tell app users in the app or by email at least 15 days before the changes apply. If you keep using the Service after that, the new terms apply to you.'] },
      contact,
    ],
  },
  cookies: {
    path: '/cookies/',
    title: 'Cookie policy',
    updated: '2026-11-19',
    sections: [
      { p: [`Cookies are small files a website stores in your browser. This policy lists the cookies ecomwerce.com can set and how you control them. The privacy policy explains how ${NAME} uses the data they collect.`] },
      {
        h: 'How we ask',
        p: [
          'If you visit from the European Economic Area, the United Kingdom or Switzerland, only the necessary cookie is set until you choose. The banner lets you accept all, reject all, or choose by category.',
          `Elsewhere, measurement and advertising cookies are on until you turn them off. In every country, ${CHOICES} changes your choice at any time, and a Global Privacy Control signal from your browser turns advertising off. Google's tags receive your choice through Google Consent Mode.`,
        ],
      },
      {
        h: 'Cookies on this website',
        table: {
          head: ['Kind', 'Cookie', 'Set by', 'What it does', 'Kept for'],
          rows: [
            ['Necessary', 'ew_consent', 'Ecomwerce', 'Remembers your privacy choice.', '180 days'],
            ['Measurement', '_ga', 'Google Analytics', 'Tells visitors apart to count visits.', '2 years'],
            ['Measurement', '_ga_<id>', 'Google Analytics', 'Keeps the state of your visit.', '2 years'],
            ['Advertising', '_gcl_au', 'Google Ads', 'Measures which Google ads bring visits and installs.', '90 days'],
            ['Advertising', '_gcl_aw', 'Google Ads', 'Keeps the ad click when you arrive from a Google ad.', '90 days'],
            ['Advertising', '_fbp', 'Meta', 'Tells browsers apart to measure Meta ads.', '90 days'],
            ['Advertising', '_fbc', 'Meta', 'Keeps the ad click when you arrive from a Meta ad.', '90 days'],
            ['Advertising', '_ttp', 'TikTok', 'Tells browsers apart to measure TikTok ads.', '13 months'],
          ],
        },
        after: [`Google, Meta and TikTok can also set cookies of their own on their domains, and they change their cookies from time to time. Their policies list them: ${a('https://policies.google.com/technologies/partner-sites', 'Google')}, ${a('https://www.facebook.com/privacy/policy/', 'Meta')}, ${a('https://www.tiktok.com/legal/privacy-policy', 'TikTok')}.`],
      },
      { h: 'Your browser', p: [`You can also block or delete cookies in your browser settings, and you can install ${a('https://tools.google.com/dlpage/gaoptout', 'Google\'s opt-out add-on')} for Google Analytics. If you block the necessary cookie, the website asks for your choice again on every visit.`] },
      { h: 'Changes to this policy', p: ['We will post any change on this page and update the date at the top.'] },
      contact,
    ],
  },
};
