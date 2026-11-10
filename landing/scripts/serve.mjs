#!/usr/bin/env node
// Local static server that behaves like the production edge (the CloudFront Function, then S3): every request goes
// through edge/geo.mjs, then the file is served from dist/ with the security headers of edge/headers.mjs. No dependencies.
//
//   node scripts/serve.mjs [--port 4321] [--country DE] [--dist dist]
//
// The country comes from the request's cloudfront-viewer-country header, as at the edge, else from --country;
// none at all is an unknown country (the opt-in copy).
import { createServer } from 'node:http';
import { readFileSync, statSync, createReadStream, existsSync } from 'node:fs';
import { join, resolve as resolvePath, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { route } from '../edge/geo.mjs';
import { SECURITY_HEADERS } from '../edge/headers.mjs';

const SITE = resolvePath(fileURLToPath(new URL('..', import.meta.url)));
const args = process.argv.slice(2);
const arg = (name, def) => { const i = args.indexOf('--' + name); return i === -1 ? def : args[i + 1]; };
const PORT = Number(arg('port', process.env.PORT || 4321));
const COUNTRY = arg('country', '');
const DIST = resolvePath(SITE, arg('dist', 'dist'));
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json',
};

function fileFor(dist, uri) {
  let rel;
  try { rel = decodeURIComponent(uri); } catch { return null; }
  const abs = resolvePath(dist, '.' + rel);
  if (abs !== dist && !abs.startsWith(dist + sep)) return null;
  try { return statSync(abs).isFile() ? abs : null; } catch { return null; }
}

// scripts/check.mjs starts several: { port, dist (absolute), country }
export function startServer({ port = PORT, dist = DIST, country = COUNTRY } = {}) {
  const DIST = dist;
  const COUNTRY = country;
  const server = createServer((req, res) => {
    const raw = req.url || '/';
    const q = raw.indexOf('?');
    const uri = q === -1 ? raw : raw.slice(0, q);
    const qs = q === -1 ? '' : raw.slice(q + 1);
    const headers = { ...SECURITY_HEADERS };
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { ...headers, Allow: 'GET, HEAD' }); return res.end();
    }
    const out = route(uri, qs, req.headers.host || '', req.headers['cloudfront-viewer-country'] || COUNTRY);
    if (out.type === 'redirect') {
      res.writeHead(301, { ...headers, Location: out.location }); return res.end();
    }
    const file = fileFor(DIST, out.type === 'rewrite' ? out.uri : uri);
    if (!file) {
      const page = join(DIST, '404.html');
      res.writeHead(404, { ...headers, 'Content-Type': TYPES['.html'] });
      return res.end(req.method === 'HEAD' ? undefined : (existsSync(page) ? readFileSync(page) : 'Not found\n'));
    }
    res.writeHead(200, { ...headers, 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream', 'Content-Length': statSync(file).size });
    if (req.method === 'HEAD') return res.end();
    createReadStream(file).pipe(res);
  });
  return new Promise((ok) => server.listen(port, () => ok(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = await startServer();
  console.log(`serving ${DIST} on http://localhost:${server.address().port} (country: ${COUNTRY || 'from the cloudfront-viewer-country header, else unknown'})`);
}
