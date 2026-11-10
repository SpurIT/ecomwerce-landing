// node --test 'edge/*.test.mjs' (npm test): the viewer-request logic shared by the local server and CloudFront.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isOptin, route } from './geo.mjs';

test('opt-in countries, the rest, unknown', () => {
  for (const c of ['DE', 'FR', 'ES', 'IT', 'NL', 'GB', 'CH', 'NO', 'IS', 'LI', 'IE', 'RE', 'GI']) assert.equal(isOptin(c), true, c);
  for (const c of ['US', 'CA', 'AU', 'BR', 'IN', 'TR', 'UA']) assert.equal(isOptin(c), false, c);
  for (const c of [undefined, '', 'XX1', 'de', 'D']) assert.equal(isOptin(c), true, String(c));
});

test('a page goes to its copy by country, with index.html for S3', () => {
  assert.deepEqual(route('/', '', 'ecomwerce.com', 'US'), { type: 'rewrite', uri: '/index.html' });
  assert.deepEqual(route('/', 'utm_source=meta', 'ecomwerce.com', 'DE'), { type: 'rewrite', uri: '/_optin/index.html' });
  assert.deepEqual(route('/first-product-page/', '', 'ecomwerce.com', 'GB'), { type: 'rewrite', uri: '/_optin/first-product-page/index.html' });
  assert.deepEqual(route('/product-page-builder/', '', 'ecomwerce.com', 'CA'), { type: 'rewrite', uri: '/product-page-builder/index.html' });
  assert.deepEqual(route('/privacy/', '', 'ecomwerce.com', ''), { type: 'rewrite', uri: '/_optin/privacy/index.html' });
});

test('files pass, page paths get their slash, the query survives every redirect', () => {
  assert.deepEqual(route('/_astro/page.abc123.js', '', 'ecomwerce.com', 'DE'), { type: 'pass' });
  assert.deepEqual(route('/robots.txt', '', 'ecomwerce.com', 'US'), { type: 'pass' });
  assert.deepEqual(route('/first-product-page', 'utm_source=meta&fbclid=x', 'ecomwerce.com', 'US'), { type: 'redirect', location: '/first-product-page/?utm_source=meta&fbclid=x' });
  assert.deepEqual(route('/index.html', 'a=1', 'ecomwerce.com', 'US'), { type: 'redirect', location: '/?a=1' });
  assert.deepEqual(route('/privacy/index.html', '', 'ecomwerce.com', 'US'), { type: 'redirect', location: '/privacy/' });
});

test('an opt-in copy is never served by its own path', () => {
  assert.deepEqual(route('/_optin/', '', 'ecomwerce.com', 'US'), { type: 'redirect', location: '/' });
  assert.deepEqual(route('/_optin', '', 'ecomwerce.com', 'US'), { type: 'redirect', location: '/' });
  assert.deepEqual(route('/_optin/first-product-page/', 'x=1', 'ecomwerce.com', 'DE'), { type: 'redirect', location: '/first-product-page/?x=1' });
  assert.deepEqual(route('/_optin/index.html', '', 'ecomwerce.com', 'US'), { type: 'redirect', location: '/index.html' });
});

test('www goes to the bare domain in one redirect', () => {
  assert.deepEqual(route('/first-product-page/', 'utm_source=google', 'www.ecomwerce.com', 'US'), { type: 'redirect', location: 'https://ecomwerce.com/first-product-page/?utm_source=google' });
});
