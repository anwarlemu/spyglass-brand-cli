// brand/logo/source (the SVGs Figma exports) -> brand/logo/svg: every lockup in Black and White, split from the given
// paths, never redrawn. The horizontal lockup's first path is the logomark and the other eight the wordmark; the 3D
// lockup's first path is the 3D logomark. The vertical lockups are placed as Figma's "Vertical combination mark" and
// "3D vertical combination mark" frames place them (page "8. Brand assets").
//
//   node scripts/make-logos.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const src = (f) => readFileSync(join(root, 'brand', 'logo', 'source', f), 'utf8');
const paths = (svg) => [...svg.matchAll(/<path\b[^>]*\/>/g)].map((m) => m[0].replace(/\s*fill="[^"]*"/, ''));

const flat = paths(src('logo-horizontal.svg'));
const deep = paths(src('logo-3d-horizontal.svg'));
const mark = flat.slice(0, 1);
const word = flat.slice(1);
const mark3d = deep.slice(0, 1);

// Bounding boxes of the source paths (measured in Chromium with getBBox, in the source's own units).
const BOX = {
	mark: { x: 0, y: 10.1961, w: 267.936, h: 133.3333 },
	word: { x: 323.1, y: 0, w: 725.79, h: 160 },
	mark3d: { x: 0, y: 0, w: 186, h: 139 },
	word3d: { x: 226, y: 17, w: 473, h: 104 },
};
const n = (v) => +v.toFixed(4);
const group = (ps, box, x, y, w) => {
	const s = w / box.w;
	return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(s)}) translate(${n(-box.x)} ${n(-box.y)})">${ps.join('')}</g>`;
};
const svg = (w, h, body, fill, title) => `<svg xmlns="http://www.w3.org/2000/svg" width="${n(w)}" height="${n(h)}" viewBox="0 0 ${n(w)} ${n(h)}" fill="${fill}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;

const lockups = {
	// The logomark alone, cropped to its box.
	mark: { w: BOX.mark.w, h: BOX.mark.h, body: group(mark, BOX.mark, 0, 0, BOX.mark.w), title: 'Spyglass logomark' },
	// The wordmark alone.
	wordmark: { w: BOX.word.w, h: BOX.word.h, body: group(word, BOX.word, 0, 0, BOX.word.w), title: 'Spyglass' },
	// The horizontal combination mark as given (1049x160).
	horizontal: { w: 1049, h: 160, body: [...mark, ...word].join(''), title: 'Spyglass' },
	// Vertical: Figma frame 281.786x180, logomark 184.032 wide at (48.877, 0), wordmark 281.786 wide at (0, 117.880).
	vertical: { w: 281.786, h: 180, body: group(mark, BOX.mark, 48.8771, 0, 184.0324) + group(word, BOX.word, 0, 117.8804, 281.7859), title: 'Spyglass' },
	// The 3D logomark alone.
	'mark-3d': { w: BOX.mark3d.w, h: BOX.mark3d.h, body: group(mark3d, BOX.mark3d, 0, 0, BOX.mark3d.w), title: 'Spyglass 3D logomark' },
	// The 3D horizontal combination mark as given (699x139).
	'horizontal-3d': { w: 699, h: 139, body: deep.join(''), title: 'Spyglass' },
	// 3D vertical: Figma frame 258.146x180, 3D logomark 131.707 wide at (63.220, 0), wordmark 258.146 wide at (0, 122.927).
	'vertical-3d': { w: 258.1463, h: 180, body: group(mark3d, BOX.mark3d, 63.2195, 0, 131.7073) + group(word, BOX.word, 0, 122.9268, 258.1463), title: 'Spyglass' },
};

const out = join(root, 'brand', 'logo', 'svg');
mkdirSync(out, { recursive: true });
const written = [];
for (const [name, l] of Object.entries(lockups)) {
	for (const [tone, fill] of [['black', '#000000'], ['white', '#FFFFFF']]) {
		writeFileSync(join(out, `${name}-${tone}.svg`), svg(l.w, l.h, l.body, fill, l.title));
		written.push(`${name}-${tone}.svg`);
	}
}
// The favicon and the avatar: the white logomark on Black (guidelines "Favicon"; Figma "Primary logo background").
// The mark fills 240 of a 600 frame's width there (40%); the favicon gives it 75% of a small square to stay legible.
const square = (size, share, ground, fill) => {
	const w = size * share;
	const h = (w * BOX.mark.h) / BOX.mark.w;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${ground}"/><g fill="${fill}">${group(mark, BOX.mark, (size - w) / 2, (size - h) / 2, w)}</g></svg>\n`;
};
writeFileSync(join(out, 'favicon.svg'), square(64, 0.75, '#000000', '#FFFFFF'));
writeFileSync(join(out, 'avatar-black.svg'), square(600, 0.4, '#000000', '#FFFFFF'));
writeFileSync(join(out, 'avatar-white.svg'), square(400, 0.5, '#FFFFFF', '#000000'));
written.push('favicon.svg', 'avatar-black.svg', 'avatar-white.svg');
console.log(`logos: ${written.length} files -> brand/logo/svg`);
