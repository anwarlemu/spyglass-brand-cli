import type { Face } from './fonts.js';

// Measuring and wrapping against the real font, so a line breaks where it will draw.

export function measure(face: Face, text: string, size: number, trackingEm = 0): number {
	if (!text) return 0;
	const chars = [...text];
	const tracking = trackingEm * size * Math.max(0, chars.length - 1);
	return advance(face, text, size) + tracking;
}

/** The text's advance. opentype.js cannot apply some substitution lookups (DM Sans's contextual ones), so where its
 * shaper throws, the glyph advances and kerning pairs are summed directly (no ligatures, as the rasterizer draws them). */
function advance(face: Face, text: string, size: number): number {
	try {
		return face.font.getAdvanceWidth(text, size);
	} catch {
		const scale = size / face.font.unitsPerEm;
		let width = 0;
		let prev: ReturnType<Face['font']['charToGlyph']> | undefined;
		for (const ch of text) {
			const glyph = face.font.charToGlyph(ch);
			width += (glyph.advanceWidth ?? 0) * scale;
			if (prev) width += face.font.getKerningValue(prev, glyph) * scale;
			prev = glyph;
		}
		return width;
	}
}

/** Cap height of H, so a line can sit on its letters rather than on the font's accent box. */
export function capHeight(face: Face, size: number): number {
	const box = face.font.charToGlyph('H').getBoundingBox();
	return (box.y2 / face.font.unitsPerEm) * size;
}

/** Depth of y below the baseline. */
export function descent(face: Face, size: number): number {
	const box = face.font.charToGlyph('y').getBoundingBox();
	return Math.max(0, (-box.y1 / face.font.unitsPerEm) * size);
}

export type Fitted = { size: number; lines: string[] };

export function blockHeight(face: Face, lines: string[], size: number, leading: number): number {
	if (!lines.length) return 0;
	return capHeight(face, size) + (lines.length - 1) * size * leading + descent(face, size);
}

/**
 * Largest size in the range whose wrap fits the width, the line cap and the height.
 * Below the floor, the last line is cut with an ellipsis.
 */
export function fit(face: Face, text: string, maxWidth: number, opts: { maxSize: number; minSize: number; maxLines: number; leading: number; tracking: number; maxHeight: number }): Fitted {
	const clean = normalize(text);
	let size = Math.floor(opts.maxSize);
	const floor = Math.floor(opts.minSize);
	while (size >= floor) {
		const lines = wrap(face, clean, size, maxWidth, opts.tracking);
		const tooWide = lines.some((l) => measure(face, l, size, opts.tracking) > maxWidth + 0.5);
		if (!tooWide && lines.length <= opts.maxLines && blockHeight(face, lines, size, opts.leading) <= opts.maxHeight + 0.5) return { size, lines };
		size -= 1;
	}
	const lines = wrap(face, clean, floor, maxWidth, opts.tracking);
	const cut = lines.slice(0, opts.maxLines);
	if (lines.length > opts.maxLines && cut.length) {
		let last = cut[cut.length - 1] ?? '';
		const ellipsis = '...';
		while (last && measure(face, `${last}${ellipsis}`, floor, opts.tracking) > maxWidth) last = last.slice(0, -1).trimEnd();
		cut[cut.length - 1] = `${last.replace(/[.,;: ]+$/, '')}${ellipsis}`;
	}
	return { size: floor, lines: cut.length ? cut : [''] };
}

export function wrap(face: Face, text: string, size: number, maxWidth: number, tracking: number): string[] {
	const lines: string[] = [];
	for (const paragraph of text.split('\n')) {
		const words = paragraph.split(/\s+/).filter(Boolean);
		if (!words.length) continue;
		let line = '';
		for (const word of words) {
			const next = line ? `${line} ${word}` : word;
			if (measure(face, next, size, tracking) <= maxWidth) line = next;
			else {
				if (line) lines.push(line);
				line = measure(face, word, size, tracking) <= maxWidth ? word : breakWord(face, word, size, maxWidth, tracking, lines);
			}
		}
		if (line) lines.push(line);
	}
	return lines.length ? lines : [''];
}

function breakWord(face: Face, word: string, size: number, maxWidth: number, tracking: number, lines: string[]): string {
	let chunk = '';
	for (const ch of word) {
		const next = chunk + ch;
		if (measure(face, next, size, tracking) <= maxWidth) chunk = next;
		else {
			if (chunk) lines.push(chunk);
			chunk = ch;
		}
	}
	return chunk;
}

export function normalize(text: string): string {
	return text
		.replace(/\r\n/g, '\n')
		.split('\n')
		.map((l) => l.replace(/[ \t]+/g, ' ').trim())
		.join('\n')
		.trim();
}

/** The site's headlines carry a red full stop. Keep a stop the copy already has, including one before a closing quote, and add one when it has none. A quote by itself is not a stop. */
export function withStop(text: string): string {
	const t = normalize(text);
	if (/[.?!…]['"”’]*$/.test(t)) return t;
	return `${t}.`;
}
