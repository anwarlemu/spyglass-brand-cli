import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
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

export function mimeOf(data: Buffer): 'image/png' | 'image/jpeg' | undefined {
	if (data.length > 8 && data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47) return 'image/png';
	if (data.length > 3 && data[0] === 0xff && data[1] === 0xd8) return 'image/jpeg';
	return undefined;
}

export function readPhoto(cwd: string, path: string): Photo {
	const abs = isAbsolute(path) ? path : resolve(cwd, path);
	let data: Buffer;
	try {
		data = readFileSync(abs);
	} catch {
		throw new Error(`No image at ${path}.`);
	}
	const mime = mimeOf(data);
	if (!mime) throw new Error(`Use a PNG or JPEG for --image. ${path} is neither.`);
	return { mime, data };
}

export function write(path: string, data: Buffer | string) {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, data);
}

export function display(cwd: string, path: string): string {
	const rel = relative(cwd, path);
	return !rel || rel.startsWith('..') || isAbsolute(rel) ? path : rel;
}

export type Format = 'png' | 'svg' | 'both';
export function format(flags: Flags, allowed: string[], fallback: string): string {
	const f = (str(flags.format) ?? fallback).toLowerCase();
	if (!allowed.includes(f)) throw new Error(`--format takes ${allowed.join(', ')}, not \`${f}\`.`);
	return f;
}

/** The light source flag: the brand's heat map (default) or one generated from --seed. */
export function lightSource(flags: Flags): 'brand' | 'generated' {
	const v = str(flags.light) ?? 'brand';
	if (v !== 'brand' && v !== 'generated') throw new Error(`--light takes brand or generated, not \`${v}\`.`);
	return v;
}
