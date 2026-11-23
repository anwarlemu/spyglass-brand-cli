import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { createCanvas, ImageData, loadImage } from '@napi-rs/canvas';
import type { Photo } from './scene.js';

// Shared by the asset commands: reading pictures, flag values and writing files.

export type Flags = Record<string, string | boolean | string[] | undefined>;

export const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
export const list = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && !!x.trim()) : typeof v === 'string' && v.trim() ? [v.trim()] : []);

export function int(flags: Flags, key: string, fallback: number, min: number, max: number): number {
	const v = flags[key];
	if (v === undefined) return fallback;
	const n = Number(v);
	if (typeof v !== 'string' || !Number.isFinite(n) || !Number.isInteger(n)) throw new Error(`--${key} takes a whole number, not \`${String(v)}\`.`);
	if (n < min || n > max) throw new Error(`--${key} takes ${min} to ${max}.`);
	return n;
}

export function mimeOf(data: Buffer): 'image/png' | 'image/jpeg' | 'image/webp' | undefined {
	if (data.length > 8 && data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47) return 'image/png';
	if (data.length > 3 && data[0] === 0xff && data[1] === 0xd8) return 'image/jpeg';
	if (data.length > 12 && data.toString('latin1', 0, 4) === 'RIFF' && data.toString('latin1', 8, 12) === 'WEBP') return 'image/webp';
	return undefined;
}

/** Whether the file ends where its format ends: half a download decodes to a half-gray picture otherwise. */
function whole(data: Buffer, mime: string): boolean {
	if (mime === 'image/png') return data.subarray(-64).includes('IEND');
	if (mime === 'image/jpeg') return data.subarray(Math.max(0, data.length - 65536)).lastIndexOf(Buffer.from([0xff, 0xd9])) >= 0;
	return data.length >= data.readUInt32LE(4) + 8 - 1;
}

/** The longest side a picture is embedded at: more than any frame draws, small enough to keep the files light. */
const PHOTO_MAX = 3000;

/** Reads a picture: PNG, JPEG or WebP, turned the way its camera held it, scaled down when it is huge, and set on Black
 * where it is transparent (unless `alpha` keeps it). */
export async function readPhoto(cwd: string, path: string, opts: { alpha?: boolean } = {}): Promise<Photo> {
	const abs = isAbsolute(path) ? path : resolve(cwd, path);
	let data: Buffer;
	try {
		data = readFileSync(abs);
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === 'EISDIR') throw new Error(`${path} is a folder. Pass a picture.`);
		throw new Error(`No image at ${path}.`);
	}
	const mime = mimeOf(data);
	if (!mime) throw new Error(`Use a PNG, JPEG or WebP for a picture. ${path} is ${data.length ? 'none of them' : 'empty'}.`);
	let img: Awaited<ReturnType<typeof loadImage>>;
	try {
		if (!whole(data, mime)) throw new Error('cut short');
		img = await loadImage(data);
		if (!img.width || !img.height) throw new Error('no pixels');
	} catch {
		throw new Error(`${path} could not be read: the file is damaged or cut short. Export it again.`);
	}
	const k = Math.min(1, PHOTO_MAX / Math.max(img.width, img.height));
	const turned = mime === 'image/jpeg' && data.subarray(0, 65536).includes('Exif');
	const maybeAlpha = mime === 'image/webp' || (mime === 'image/png' && (data[25] === 4 || data[25] === 6 || data.subarray(0, 4096).includes('tRNS')));
	if (k === 1 && !turned && !maybeAlpha) return { mime, data };
	const w = Math.max(1, Math.round(img.width * k));
	const h = Math.max(1, Math.round(img.height * k));
	const canvas = createCanvas(w, h);
	const ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0, w, h);
	let clear = false;
	if (maybeAlpha) {
		const px = ctx.getImageData(0, 0, w, h).data;
		for (let i = 3; i < px.length && !clear; i += 4) if (px[i]! < 250) clear = true;
	}
	if (clear && opts.alpha) return { mime: 'image/png', data: canvas.toBuffer('image/png') };
	if (clear) {
		ctx.globalCompositeOperation = 'destination-over';
		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, w, h);
	} else if (k === 1 && !turned && mime === 'image/png') return { mime, data };
	return mime === 'image/jpeg' || k < 1 ? { mime: 'image/jpeg', data: canvas.toBuffer('image/jpeg', 92) } : { mime: 'image/png', data: canvas.toBuffer('image/png') };
}

export function write(path: string, data: Buffer | string) {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, data);
}

export function display(cwd: string, path: string): string {
	const rel = relative(cwd, path);
	return !rel || rel.startsWith('..') || isAbsolute(rel) ? path : rel;
}

/** The formats a command writes: one, a comma list, or `both` / `all`. */
export function formats(flags: Flags, allowed: string[], fallback: string[], groups: Record<string, string[]> = {}): string[] {
	const typed = str(flags.format);
	if (flags.format !== undefined && !typed) throw new Error('--format needs a value.');
	if (!typed) return fallback;
	const out = new Set<string>();
	for (const part of typed.toLowerCase().split(',').map((x) => x.trim()).filter(Boolean)) {
		const f = part === 'jpeg' ? 'jpg' : part;
		if (groups[f]) for (const g of groups[f]!) out.add(g);
		else if (allowed.includes(f)) out.add(f);
		else throw new Error(`--format takes ${[...allowed, ...Object.keys(groups)].join(', ')} (or several with commas), not \`${part}\`.`);
	}
	return [...out];
}

export function format(flags: Flags, allowed: string[], fallback: string): string {
	const f = (str(flags.format) ?? fallback).toLowerCase();
	if (!allowed.includes(f)) throw new Error(`--format takes ${allowed.join(', ')}, not \`${f}\`.`);
	return f;
}

/** Straight RGBA pixels as JPEG or WebP. */
export function encodePixels(pixels: Buffer, width: number, height: number, to: 'jpg' | 'webp'): Buffer {
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');
	ctx.putImageData(new ImageData(new Uint8ClampedArray(pixels.buffer, pixels.byteOffset, pixels.length), width, height), 0, 0);
	return to === 'jpg' ? canvas.toBuffer('image/jpeg', 92) : canvas.toBuffer('image/webp', 92);
}

/** The light source flag: the brand's heat map (default) or one generated from --seed. */
export function lightSource(flags: Flags): 'brand' | 'generated' {
	const v = str(flags.light) ?? 'brand';
	if (v !== 'brand' && v !== 'generated') throw new Error(`--light takes brand or generated, not \`${v}\`.`);
	return v;
}
