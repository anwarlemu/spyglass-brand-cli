// Writes the ink map next to each piece of the brand's pre-made art in brand/assets/art (run: node
// scripts/assets/make-art.mjs). The map lists where the art is lit, in 16px cells of its own pixels, merged into runs
// along each row: the scene engine keeps copy and the logo clear of those cells. The art itself is the site's own
// (public/brand/light/*.webp and public/og/pitch-light.png, re-encoded as JPEG or PNG because the rasterizer reads no
// WebP); ascii.png, the texture tile, has no map.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const dir = join(import.meta.dirname, '..', '..', 'brand', 'assets', 'art');
const CELL = 16;
// A cell is lit when its brightest pixel passes this (0 to 255): the soft edge of a light is lit, its Black is not.
const LIT = 48;
for (const name of readdirSync(dir)) {
	const m = /^(.+)\.(jpg|png)$/.exec(name);
	if (!m || m[1] === 'ascii') continue;
	const data = readFileSync(join(dir, name));
	const mime = m[2] === 'jpg' ? 'jpeg' : 'png';

	const { width, height } = sizeOf(data, mime);
	const r = new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#000"/><image href="data:image/${mime};base64,${data.toString('base64')}" width="${width}" height="${height}"/></svg>`).render();
	const px = r.pixels;
	const ink = [];
	for (let y = 0; y < height; y += CELL) {
		let run;
		for (let x = 0; x < width; x += CELL) {
			let lit = false;
			for (let yy = y; yy < Math.min(height, y + CELL) && !lit; yy += 2)
				for (let xx = x; xx < Math.min(width, x + CELL); xx += 2) {
					const i = (yy * width + xx) * 4;
					if (Math.max(px[i], px[i + 1], px[i + 2]) > LIT) { lit = true; break; }
				}
			if (lit) run ? (run[2] += CELL) : ink.push((run = [x, y, CELL, CELL]));
			else run = undefined;
		}
	}
	writeFileSync(join(dir, `${m[1]}.json`), JSON.stringify({ $comment: 'Where the art is lit, in its own pixels (16px cells), for the clear-space checks.', width, height, ink }) + '\n');
	console.log(m[1], width, height, ink.length, 'runs');
}

/** Width and height from the file's header. */
function sizeOf(b, mime) {
	if (mime === 'png') return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
	for (let i = 2; i < b.length; ) {
		const marker = b[i + 1];
		const len = b.readUInt16BE(i + 2);
		if (marker >= 0xc0 && marker <= 0xc3) return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
		i += 2 + len;
	}
	throw new Error('no JPEG size');
}
