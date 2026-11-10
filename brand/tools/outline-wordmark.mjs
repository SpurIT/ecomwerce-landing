import opentype from 'opentype.js'
import { writeFile } from 'node:fs/promises'
const font = opentype.loadSync('gabarito-800.ttf')
const upm = font.unitsPerEm
const xh = font.tables.os2.sxHeight, cap = font.tables.os2.sCapHeight
// build "ecomwerce" glyph by glyph; variant 'turned' draws the w as a 180-degree turned m
function build(text, { tracking = -0.02, turned = false } = {}) {
  const size = 1000, scale = size / upm; let x = 0; const parts = []
  const glyphs = font.stringToGlyphs(text)
  glyphs.forEach((g, i) => {
    let path, adv
    if (turned && text[i] === 'w') {
      const m = font.charToGlyph('m'); const bb = m.getBoundingBox(); adv = m.advanceWidth
      const p = m.getPath(0, 0, size)
      // turn 180 degrees around the centre of the glyph box (x-height band), then place at x
      const cx = (bb.x1 + bb.x2) / 2 * scale, cy = -(xh / 2) * scale
      p.commands.forEach(c => { for (const [kx, ky] of [['x', 'y'], ['x1', 'y1'], ['x2', 'y2']]) if (c[kx] !== undefined) { c[kx] = 2 * cx - c[kx] + x; c[ky] = 2 * cy - c[ky] } })
      path = p
    } else { path = g.getPath(x, 0, size); adv = g.advanceWidth }
    parts.push(path.toPathData(2))
    const next = glyphs[i + 1]; const kern = next ? font.getKerningValue(g, next) : 0
    x += (adv + kern) * scale + tracking * size
  })
  return { d: parts.join(' '), width: x - tracking * size, xh: xh * scale, cap: cap * scale, size }
}
const out = {}
for (const [k, o] of Object.entries({ plain: {}, turned: { turned: true } })) {
  const r = build('ecomwerce', o); out[k] = r
  const pad = 40, asc = 760, desc = 240
  await writeFile(`wordmark-${k}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-asc} ${r.width + pad * 2} ${asc + desc}"><path d="${r.d}" fill="#1A1410"/></svg>`)
}
await writeFile('wordmark.json', JSON.stringify(out))
console.log('upm', upm, 'xHeight', xh, 'cap', cap, 'width plain', Math.round(out.plain.width), 'turned', Math.round(out.turned.width))
