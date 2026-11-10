// The static security headers of every response (wave 5 puts the same into the CloudFront response headers policy;
// the local server sends them too). The page's own content security policy is a meta tag built from the tag ids in use
// (src/lib/site.mjs); this header adds what a meta tag cannot carry. Strict-Transport-Security is set at CloudFront only.
export const SECURITY_HEADERS = {
  'content-security-policy': "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
};
