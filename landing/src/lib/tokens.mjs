// tokens.css for the page, written from the brand's tokens.json at every build start (astro.config.mjs); never edit
// the output (src/styles/tokens.generated.css, git-ignored). The tokens carry desktop sizes; the phone sizes are the
// brand README's Type rule (brand/design-system/project/README.md).
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = new URL('../../../brand/design-system/project/tokens.json', import.meta.url);
const OUT = new URL('../styles/tokens.generated.css', import.meta.url);
const PHONE = { 'display-xl': '44px', 'display-l': '36px', 'heading-1': '32px', 'heading-2': '26px', 'heading-3': '20px', 'text-lead': '18px' };
const FAMILY = { display: 'font-display', sans: 'font-sans', mono: 'font-mono' };

export function tokensCss(t) {
  const first = t.color.themes[0].id;
  const val = (v, theme) => (typeof v === 'string' ? v : v[theme] ?? v[first]);
  const decl = (list, theme) => list.map((x) => `--${x.name}:${val(x.value, theme)}`);
  const shadows = t.shadow?.tokens || [];
  const root = [
    'color-scheme:light dark',
    ...decl(t.color.tokens, first),
    ...Object.entries(t.type.families).map(([k, v]) => `--${FAMILY[k] || 'font-' + k}:${v}`),
    ...decl(t.spacing.tokens, first),
    ...decl(t.radius.tokens, first),
    ...t.type.groups.flatMap((g) => g.styles.map((s) => `--${s.name}:${s.fontSize}`)),
    ...decl(shadows, first),
  ];
  const differs = (list) => list.filter((x) => typeof x.value !== 'string' && x.value.dark && x.value.dark !== x.value[first]);
  const dark = [...decl(differs(t.color.tokens), 'dark'), ...decl(differs(shadows), 'dark')];
  return `/* generated from brand/design-system/project/tokens.json (version ${t.version}) by src/lib/tokens.mjs; do not edit */\n`
    + `:root{${root.join(';')}}\n`
    + `@media (max-width:720px){:root{${Object.entries(PHONE).map(([k, v]) => `--${k}:${v}`).join(';')}}}\n`
    + `@media (prefers-color-scheme:dark){:root{${dark.join(';')}}}\n`;
}

export function writeTokensCss() {
  writeFileSync(OUT, tokensCss(JSON.parse(readFileSync(SRC, 'utf8'))));
}
