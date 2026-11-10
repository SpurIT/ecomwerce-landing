// The viewer-request logic of ecomwerce.com, shared by the local server (scripts/serve.mjs) and the CloudFront Function
// (wave 5 builds it from this file with `export` stripped, so: no imports, plain functions, no Set or Map).
// CloudFront passes the viewer's country only when the cloudfront-viewer-country header is allowed in the origin
// request policy (AWS docs, read 2026-11-10); a missing header counts as an unknown country.

// The EEA, the UK and Switzerland, with territories under the same rules; their visitors and unknown countries get the
// opt-in copy (the banner, nothing loads before a choice: TASK.md q4).
var OPTIN_COUNTRIES = ' AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE IS LI NO GB CH AX GF GP MQ RE YT MF GI IM JE GG ';
var OPTIN_PREFIX = '/_optin';

export function isOptin(country) {
  if (!country || !/^[A-Z]{2}$/.test(country)) return true;
  return OPTIN_COUNTRIES.indexOf(' ' + country + ' ') !== -1;
}

// uri: the request path; qs: the raw query string without '?'; host: the Host header; country: the two-letter code.
// Returns { type: 'redirect', location } (301), { type: 'rewrite', uri } (the S3 object to serve) or { type: 'pass' }.
export function route(uri, qs, host, country) {
  var q = qs ? '?' + qs : '';
  if (host && host.indexOf('www.') === 0) return { type: 'redirect', location: 'https://' + host.slice(4) + uri + q };
  // an opt-in copy is never addressed directly: its public path decides by country
  if (uri === OPTIN_PREFIX || uri.indexOf(OPTIN_PREFIX + '/') === 0) return { type: 'redirect', location: (uri.slice(OPTIN_PREFIX.length) || '/') + q };
  // /index.html and /x/index.html fold into their directory path
  if (/\/index\.html$/.test(uri)) return { type: 'redirect', location: uri.slice(0, -10) + q };
  var last = uri.slice(uri.lastIndexOf('/') + 1);
  // a page path without its trailing slash (no dot in the last segment)
  if (last && last.indexOf('.') === -1) return { type: 'redirect', location: uri + '/' + q };
  if (uri.charAt(uri.length - 1) === '/') return { type: 'rewrite', uri: (isOptin(country) ? OPTIN_PREFIX : '') + uri + 'index.html' };
  return { type: 'pass' };
}
