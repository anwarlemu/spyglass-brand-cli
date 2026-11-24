// Finds, per template, the corners the logo can move to and keep its clear space at every size (with the shared
// conformance's short copy). Run after a build: node scripts/assets/logo-anchors.mjs [template...]; copy the result into
// brand/assets/image.json (logoAnchors) and scripts/assets/gen-deck.mjs (LOGO_ANCHORS).
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
const R = new URL('../../dist/', import.meta.url).href
const { adapter } = await import(R + 'design/adapter.js')
const { create, checkDesign } = await import(R + 'design/index.js')
const a = adapter()
const dir = mkdtempSync(join(tmpdir(), 'anchors-'))
const out = {}
const only = process.argv.slice(2)
for (const t of a.templates().filter((x) => (x.kind === 'image' || x.kind === 'slide') && (!only.length || only.includes(x.id)))) {
  const logo = t.layers.find((l) => l.id === 'logo')
  if (!logo?.can.anchors) continue
  const copy = Object.fromEntries(t.copy.map((c) => [c.id, /stat|number|figure/.test(c.id) ? '42%' : c.id === 'headline' || c.id === 'title' || c.id === 'quote' ? 'Ship your next idea today' : 'One line about it']))
  const ok = []
  for (const anchor of logo.can.anchors) {
    let good = true
    for (const s of t.sizes.filter((x) => x !== 'custom')) {
      const pics = t.images.filter((i) => i.required).map((i) => ({ op: 'image', slot: i.id, value: i.values?.find((v) => v !== 'none') }))
      let doc
      try { doc = create(a, t.id, s, [...Object.entries(copy).map(([slot, value]) => ({ op: 'copy', slot, value })), ...pics, { op: 'layer', layer: 'logo', set: { anchor } }]).doc } catch { continue }
      try {
        const r = await a.render(doc, dir, { formats: ['png'], scale: 1 })
        const f = checkDesign({ doc, info: t, layers: r.layers, adapter: a, png: r.files.png })
        if (f.some((x) => x.rule.startsWith('logo') && x.severity === 'error')) { good = false; break }
      } catch { /* refused as too long: not the logo's doing */ }
    }
    if (good) ok.push(anchor)
  }
  out[t.id] = ok
  console.log(t.id, ok.join(','))
}
console.log(JSON.stringify(out))
