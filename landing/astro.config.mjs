// @ts-check
// ecomwerce.com: the landing page as a static build (landing/README.md, tasks/landing/BRIEF-phase-2.md).
import { defineConfig } from 'astro/config';
import { writeTokensCss } from './src/lib/tokens.mjs';

// tokens.css is written from the brand's tokens.json at every start, so brand/ stays the one source of the values
writeTokensCss();

// URL format like spur-i-t.com: lowercase, trailing slash, every page built as /path/index.html.
// Stylesheets are inlined (one request less before the first paint); scripts stay files, because the content
// security policy (src/lib/csp.mjs) allows no inline script. OUT_DIR is for the check builds only (scripts/check.mjs).
export default defineConfig({
  site: 'https://ecomwerce.com',
  trailingSlash: 'always',
  outDir: process.env.OUT_DIR || './dist',
  build: { format: 'directory', inlineStylesheets: 'always' },
  prefetch: false,
  devToolbar: { enabled: false },
  vite: {
    build: { assetsInlineLimit: 0 },
    // tokens, logos and the badges are read from brand/ one level up
    server: { fs: { allow: ['..'] } },
  },
});
