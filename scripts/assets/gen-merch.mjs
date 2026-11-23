// Writes brand/assets/merch.json: print files for merch. Lengths are inches from the trim's top left (the engine adds
// the bleed and converts to pixels at 300 per inch). Run: node scripts/assets/gen-merch.mjs brand/assets/merch.json
import { writeFileSync } from 'node:fs';
const logo = (box, lockup = 'horizontal', color = '$ink', align = 'center') => ({ type: 'logo', lockup, color, box, align });
const T = (slot, face, size, leading, x, top, w, o = {}) => ({ type: 'text', slot, face, size, leading, x, top, w, color: '$ink', ...o });
// Copy in a stack: it closes up around what is there and steps down together when it is long.
const I = (slot, face, size, leading, gap = 0, o = {}) => ({ type: 'text', slot, face, size, leading, gap, color: '$ink', ...o });
const S = (box, items, o = {}) => ({ type: 'stack', box, items, ...o });
const A = (o = {}) => ({ type: 'ascii', ...o });
// A light in inches: the same windows onto the brand heat map the posts use, scaled to the item.
const L = (b, shift, window) => (window ? { type: 'light', window, b, shift } : { type: 'light', b, shift });
const scale = (b, k, dx = 0, dy = 0) => [b[0] * k + dx, b[1] * k + dy, b[2] * k, b[3] * k];
const BAND = [-1331, -30, 2913.3, 1821.3]; // Post, headline over a band (966:4489), per 1080 canvas pixels
const CORNER = [-533, -33, 1725.57, 1112.77]; // Post, offer (966:4421)
const FIELD = [-929, -39, 2465.1, 1541.1]; // Ad, plan offer (966:4541)
const STRIP = [-134, -160, 2241, 1401]; // Post, light strips, left strip (966:4471)
const one = { white: { ink: 'white', ground: 'none' }, black: { ink: 'black', ground: 'none' } };
const full = { 'full-color': { ink: 'white', ground: 'black' } };
const CONFIRM = 'Confirm against the print vendor’s template for the exact blank before ordering.';
const items = [
  { id: 'cap-front', name: 'Cap front panel', size: [4, 1.75], bleed: 0, safe: 0.125, method: 'embroidery',
    source: 'Common front embroidery area on a structured six-panel cap: 4 by 1.75 in. Embroidery is thread, so one color per file and no bleed. ' + CONFIRM,
    variants: { ...one }, layers: [logo([0.125, 0.4, 3.75, 0.95])] },
  { id: 'tee-front', name: 'T-shirt front', size: [12, 16], bleed: 0, safe: 0.5, method: 'DTG or screen print',
    source: 'Common adult tee front print area: 12 by 16 in (DTG standard). Garment prints are not trimmed, so no bleed; keep art inside the safe area. ' + CONFIRM,
    variants: { ...full, ...one },
    layers: { 'full-color': [A({ size: 0.16 }), L(scale(BAND, 12 / 1080), 0.49, [0, 7, 12, 2.4]), logo([2, 3, 8, 1.22], 'horizontal', 'white'), S([1, 11.4, 10, 4], [I('headline', 'display', 0.6, 0.64, 0, { align: 'center', maxLines: 2 })], { align: 'center' })],
      default: [logo([1.5, 2, 9, 1.37]), S([1, 5, 10, 8], [I('headline', 'display', 0.6, 0.64, 0, { align: 'center', maxLines: 2 })], { align: 'center' })] },
    slots: { headline: '{tagline}' } },
  { id: 'tee-back', name: 'T-shirt back', size: [12, 16], bleed: 0, safe: 0.5, method: 'DTG or screen print',
    source: 'Common adult tee back print area: 12 by 16 in (DTG standard). No bleed. ' + CONFIRM,
    variants: { ...full, ...one },
    layers: { 'full-color': [A({ size: 0.16 }), L(scale(STRIP, 16 / 1080), 0.5, [0, 0, 2.4, 16]), L(scale([-2014, -160, 2241, 1401], 16 / 1080, 0, 0), 0.5, [9.6, 0, 2.4, 16]), S([3, 2, 6.2, 11.6], [I('headline', 'display', 0.9, 0.96, 0, { maxLines: 5 })]), T('url', 'label', 0.22, 0.22, 3, 14.6, 6, { maxLines: 1 })],
      default: [S([1.5, 2, 9, 9.8], [I('headline', 'display', 0.9, 0.96, 0, { maxLines: 5 })]), T('url', 'label', 0.22, 0.22, 1.5, 14.6, 6, { maxLines: 1 }), logo([1.5, 12.8, 1.6, 0.8], 'mark', '$ink', 'left')] },
    slots: { headline: 'Know what changed before your next meeting.', url: '{domain}' }, required: ['headline'] },
  { id: 'hoodie-front', name: 'Hoodie front', size: [12, 10], bleed: 0, safe: 0.5, method: 'DTG or screen print',
    source: 'Pullover hoodie front, above the pouch pocket: 12 by 10 in is a common area (vendors range from 11.5 by 11.5 to 12 by 12 in). No bleed. ' + CONFIRM,
    variants: { ...full, ...one },
    layers: { 'full-color': [A({ size: 0.16 }), L(scale(FIELD, 12 / 1080), 0.42, [0, 0, 12, 5.2]), logo([1.5, 6.4, 9, 1.37], 'horizontal', 'white')],
      default: [logo([1.5, 3.2, 9, 1.37])] } },
  { id: 'tote', name: 'Tote bag', size: [12, 14], bleed: 0, safe: 0.5, method: 'screen print or DTG',
    source: 'Print area on a standard 15 by 16 in canvas tote: 12 by 14 in is common. No bleed. ' + CONFIRM,
    variants: { ...full, ...one },
    layers: { 'full-color': [A({ size: 0.16 }), L(scale(CORNER, 14 / 1080, -1), 0.34), logo([3, 5.2, 6, 3.83], 'vertical', 'white')],
      default: [logo([3, 5.2, 6, 3.83], 'vertical')] } },
  { id: 'mug-wrap', name: 'Mug wrap, 11 oz', size: [9, 3.5], bleed: 0.125, safe: 0.25, method: 'sublimation',
    source: '11 oz mug wrap: 9 by 3.5 in is a common print area (vendors range from 8.5 to 9.5 in wide), with 0.125 in bleed for the full wrap. The lockup sits on each side of the handle. ' + CONFIRM,
    variants: { ...full, ...one },
    layers: { 'full-color': [A({ size: 0.1 }), L(scale(BAND, 9 / 1080), 0.37, [0, 1.15, 9, 1.2]), logo([0.5, 0.45, 2.6, 0.4], 'horizontal', 'white'), logo([6.4, 2.6, 2.1, 0.44], 'mark', 'white')],
      default: [logo([0.5, 1.35, 3.2, 0.49]), logo([6.2, 1.25, 1.4, 0.7], 'mark')] } },
  { id: 'sticker', name: 'Sticker, die-cut', size: [3, 1.75], bleed: 0.125, safe: 0.125, method: 'die-cut vinyl',
    source: 'Die-cut sticker 3 by 1.75 in, cut along the rounded rectangle (CutContour path in the SVG, a spot line the cutter reads; it is not printed), 0.125 in bleed past the cut and 0.125 in safe inside it. ' + CONFIRM,
    cut: { radius: 0.3 },
    variants: { 'full-color': { ink: 'white', ground: 'black' }, black: { ink: 'white', ground: 'black' }, white: { ink: 'black', ground: 'white' } },
    layers: { 'full-color': [L(scale(CORNER, 3 / 1080), 0.07), logo([0.75, 0.5, 1.5, 0.75], 'mark', 'white')],
      default: [logo([0.75, 0.5, 1.5, 0.75], 'mark')] } },
  { id: 'poster', name: 'Poster, 18 by 24 in', size: [18, 24], bleed: 0.125, safe: 0.5, method: 'digital or offset print',
    source: 'Standard 18 by 24 in poster with 0.125 in bleed on every side and a 0.5 in safe margin. ' + CONFIRM,
    variants: { ...full, black: { ink: 'white', ground: 'black' }, white: { ink: 'black', ground: 'white' } },
    layers: { 'full-color': [A({ size: 0.24 }), L(scale(FIELD, 18 / 1080), 0.62, [0, 0, 18, 10.2]), S([1.2, 11, 15.6, 9.9], [I('headline', 'display', 1.6, 1.71, 0, { maxLines: 3 }), I('body', 'body', 0.4, 0.53, 1, { w: 10, maxLines: 4 })], { prefer: 12 }), logo([1.2, 21.9, 3.66, 0.56], 'horizontal', 'white', 'left'), T('url', 'label', 0.22, 0.22, 10.8, 22.08, 6, { align: 'right', maxLines: 1 })],
      default: [S([1.2, 2.4, 15.6, 18.4], [I('headline', 'display', 1.6, 1.71, 0, { maxLines: 4 }), I('body', 'body', 0.4, 0.53, 1, { w: 10, maxLines: 6 })], { prefer: 4 }), logo([1.2, 21.9, 3.66, 0.56], 'horizontal', '$ink', 'left'), T('url', 'label', 0.22, 0.22, 10.8, 22.08, 6, { align: 'right', maxLines: 1 })] },
    slots: { headline: '{tagline}', body: 'AI search across millions of creatives. Ask a question and get instant, structured results.', url: '{domain}' }, required: ['headline'] },
  { id: 'socks', name: 'Socks, leg panel', size: [3.5, 7], bleed: 0.125, safe: 0.25, method: 'sublimation',
    source: 'Crew sock leg panel, one side: 3.5 by 7 in is a common sublimation area (print twice for a pair, or mirror for the outside faces); 0.125 in bleed. ' + CONFIRM,
    variants: { ...full, white: { ink: 'white', ground: 'black' } },
    layers: { 'full-color': [A({ size: 0.08 }), L(scale(STRIP, 7 / 1080, -0.4), 0.22, [0, 0, 1.2, 7]), logo([1.6, 2.6, 1.4, 0.7], 'mark', 'white'), logo([1.45, 5.6, 1.7, 0.26], 'horizontal', 'white')],
      default: [logo([0.95, 2.6, 1.6, 0.8], 'mark'), logo([0.75, 5.6, 2, 0.31], 'horizontal')] } },
];
writeFileSync(process.argv[2], JSON.stringify({
  $comment: 'Merch print files only (no mockups). Each item: trim size and bleed and safe area in inches with its source or convention, the variants it takes (full color: the light and the texture on Black; white or black: one color, transparent ground, an approved lockup only), and layouts in inches from the trim. Files are SVG at physical size and PNG at 300 dpi (--dpi) with the bleed included.',
  dpi: 300,
  items,
}, null, 1) + '\n');
console.log(items.length, 'items');
