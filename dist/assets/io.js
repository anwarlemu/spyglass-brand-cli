import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
export const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
export const list = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && !!x.trim()) : typeof v === 'string' && v.trim() ? [v.trim()] : []);
export function int(flags, key, fallback, min, max) {
    const v = flags[key];
    if (v === undefined)
        return fallback;
    const n = Number(v);
    if (typeof v !== 'string' || !Number.isFinite(n) || !Number.isInteger(n))
        throw new Error(`--${key} takes a whole number, not \`${String(v)}\`.`);
    if (n < min || n > max)
        throw new Error(`--${key} takes ${min} to ${max}.`);
    return n;
}
export function mimeOf(data) {
    if (data.length > 8 && data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47)
        return 'image/png';
    if (data.length > 3 && data[0] === 0xff && data[1] === 0xd8)
        return 'image/jpeg';
    return undefined;
}
export function readPhoto(cwd, path) {
    const abs = isAbsolute(path) ? path : resolve(cwd, path);
    let data;
    try {
        data = readFileSync(abs);
    }
    catch {
        throw new Error(`No image at ${path}.`);
    }
    const mime = mimeOf(data);
    if (!mime)
        throw new Error(`Use a PNG or JPEG for --image. ${path} is neither.`);
    return { mime, data };
}
export function write(path, data) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, data);
}
export function display(cwd, path) {
    const rel = relative(cwd, path);
    return !rel || rel.startsWith('..') || isAbsolute(rel) ? path : rel;
}
export function format(flags, allowed, fallback) {
    const f = (str(flags.format) ?? fallback).toLowerCase();
    if (!allowed.includes(f))
        throw new Error(`--format takes ${allowed.join(', ')}, not \`${f}\`.`);
    return f;
}
/** The light source flag: the brand's heat map (default) or one generated from --seed. */
export function lightSource(flags) {
    const v = str(flags.light) ?? 'brand';
    if (v !== 'brand' && v !== 'generated')
        throw new Error(`--light takes brand or generated, not \`${v}\`.`);
    return v;
}
