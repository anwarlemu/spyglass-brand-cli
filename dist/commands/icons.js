import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { brand, packageRoot } from '../lib/brand.js';
// The favicon set and app icons from the brand's own favicon (the White logomark on Black, from logo/svg), set as the
// site sets its icon (src/app/icon.svg: the mark 208 of 400 wide, centered on Black): favicon.svg, favicon.ico (16, 32
// and 48 inside), PNGs at 16, 32, 180 (Apple touch), 192 and 512, a maskable 512 (the mark already sits inside the
// middle 80% the platforms keep), social avatars at 400 and 800, and a web manifest. Nothing is redrawn.
const require = createRequire(import.meta.url);
const { Resvg } = require('@resvg/resvg-js');
export const ICONS_FLAGS = ['out', 'list'];
const SIZES = [['favicon-16.png', 16], ['favicon-32.png', 32], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512], ['avatar-400.png', 400], ['avatar-800.png', 800]];
const png = (svg, size) => new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
/** The brand favicon (the mark 48 of 64 wide) at the site's icon proportions: the mark 52% of the square, centered. */
function siteIcon(favicon) {
    const inner = favicon.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<rect width="64" height="64" fill="#000000"\/>/, '');
    const k = 208 / 400 / (48 / 64);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#000000"/><g transform="translate(32 32) scale(${k.toFixed(4)}) translate(-32 -32)">${inner}</g></svg>`;
}
/** An .ico holding PNG images, as current browsers read them. */
function ico(images) {
    const head = Buffer.alloc(6 + images.length * 16);
    head.writeUInt16LE(0, 0);
    head.writeUInt16LE(1, 2);
    head.writeUInt16LE(images.length, 4);
    let offset = head.length;
    images.forEach((im, i) => {
        const o = 6 + i * 16;
        head.writeUInt8(im.size >= 256 ? 0 : im.size, o);
        head.writeUInt8(im.size >= 256 ? 0 : im.size, o + 1);
        head.writeUInt8(0, o + 2);
        head.writeUInt8(0, o + 3);
        head.writeUInt16LE(1, o + 4);
        head.writeUInt16LE(32, o + 6);
        head.writeUInt32LE(im.data.length, o + 8);
        head.writeUInt32LE(offset, o + 12);
        offset += im.data.length;
    });
    return Buffer.concat([head, ...images.map((im) => im.data)]);
}
export function iconsHelp() {
    const b = brand().bin;
    return `The favicon set, app icons and social avatars from the brand's own favicon (the White logomark on Black, at the site's icon proportions).

  ${b} icons                 Writes icons/: favicon.svg, favicon.ico, PNGs at 16, 32, 180, 192 and 512, a maskable 512,
                             avatars at 400 and 800, and site.webmanifest
  ${b} icons --out public    Somewhere else

Link them: <link rel="icon" href="/favicon.ico" sizes="any">, <link rel="icon" href="/favicon.svg" type="image/svg+xml">,
<link rel="apple-touch-icon" href="/apple-touch-icon.png">, <link rel="manifest" href="/site.webmanifest">.`;
}
export function runIcons(cwd, flags, log = console.log) {
    if (flags.list) {
        log(iconsHelp());
        return [];
    }
    const out = resolve(cwd, typeof flags.out === 'string' ? flags.out : 'icons');
    mkdirSync(out, { recursive: true });
    const favicon = siteIcon(readFileSync(join(packageRoot, 'brand', 'logo', 'svg', 'favicon.svg'), 'utf8'));
    const written = [];
    const put = (name, data) => {
        writeFileSync(join(out, name), data);
        written.push(join(out, name));
    };
    put('favicon.svg', favicon);
    for (const [name, size] of SIZES)
        put(name, png(favicon, size));
    put('icon-maskable-512.png', png(favicon, 512));
    put('favicon.ico', ico([16, 32, 48].map((size) => ({ size, data: png(favicon, size) }))));
    const b = brand();
    put('site.webmanifest', `${JSON.stringify({ name: b.name, short_name: b.name, icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }], theme_color: '#000000', background_color: '#000000', display: 'standalone' }, null, 2)}\n`);
    for (const f of written)
        log(f);
    return written;
}
