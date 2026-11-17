import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Font } from 'opentype.js';
import { brand, packageRoot } from '../lib/brand.js';

// The brand ships woff2. The rasterizer reads TrueType, so each face is decoded once and cached.

const require = createRequire(import.meta.url);
const opentype = require('opentype.js') as { parse: (buffer: ArrayBuffer | Buffer) => Font };
const decompress = require('wawoff2').decompress as (src: Uint8Array) => Promise<Uint8Array>;

export type Face = {
	family: string;
	weight: number;
	file: string;
	ttf: Buffer;
	woff2: Buffer;
	ttfPath: string;
	font: Font;
};

export type Faces = { heading: Face; text: Face; medium: Face };

let pending: Promise<Faces> | undefined;

export function faces(): Promise<Faces> {
	pending ??= load().catch((err) => {
		pending = undefined;
		throw err;
	});
	return pending;
}

async function load(): Promise<Faces> {
	const files = brand().fonts.files;
	const heading = files.find((f) => f.role === 'heading');
	const text = files.find((f) => f.role === 'text' && f.weight === 400) ?? files.find((f) => f.role === 'text');
	const medium = files.find((f) => f.role === 'text' && f.weight === 500) ?? text;
	if (!heading || !text || !medium) throw new Error('The brand font list needs a heading face and a text face.');
	// One at a time: the decoder keeps a single wasm heap, and a parallel decode would overwrite a face before it is copied.
	const h = await loadFace(heading);
	const t = await loadFace(text);
	const m = medium.file === text.file ? t : await loadFace(medium);
	return { heading: h, text: t, medium: m };
}

async function loadFace(entry: { family: string; weight: number; file: string }): Promise<Face> {
	const woff2 = readFileSync(join(packageRoot, 'brand', 'fonts', entry.file));
	const decoded = Buffer.from(await decompress(woff2));
	const font = opentype.parse(decoded.buffer.slice(decoded.byteOffset, decoded.byteOffset + decoded.byteLength));
	const dir = join(tmpdir(), 'ds-image-fonts');
	mkdirSync(dir, { recursive: true });
	const ttfPath = join(dir, entry.file.replace(/\.woff2$/i, '.ttf'));
	writeFileSync(ttfPath, decoded);
	return { family: entry.family, weight: entry.weight, file: entry.file, ttf: decoded, woff2, ttfPath, font };
}

let codePending: Promise<Face> | undefined;

/** The code face (the brand's monospace, used by the ASCII texture), decoded for the rasterizer. */
export function codeFace(): Promise<Face> {
	codePending ??= (async () => {
		const entry = brand().fonts.files.find((f) => f.role === 'code');
		if (!entry) throw new Error('The brand font list has no code face.');
		return loadFace(entry);
	})().catch((err) => {
		codePending = undefined;
		throw err;
	});
	return codePending;
}
