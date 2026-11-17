import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { brand, packageRoot } from '../lib/brand.js';
import type { Face, Faces } from './fonts.js';
import { faces } from './fonts.js';
import { paperTheme, theme, type GroundId, type SizeSpec, type TemplateId, type Theme } from './spec.js';
import { blockHeight, capHeight, descent, fit, measure, withStop } from './text.js';

// Layouts follow the site: the heading face with a red full stop, the red tag for an eyebrow, the text face
// for the line under it, a hairline and the mark. The frame template uses the site's double rule.

export type ImageCopy = {
	template: TemplateId;
	ground: GroundId;
	title: string;
	text?: string;
	eyebrow?: string;
	by?: string;
	image?: { mime: string; data: Buffer };
};

type Box = { height: number; draw: (x: number, y: number) => string };

export async function draw(copy: ImageCopy, size: SizeSpec): Promise<string> {
	const loaded = await faces();
	const palette = theme(copy.ground);
	const body = copy.template === 'frame' ? frame(copy, size, loaded, palette) : poster(copy, size, loaded, palette);
	return document(size, palette, loaded, body);
}

function poster(copy: ImageCopy, size: SizeSpec, loaded: Faces, palette: Theme): string {
	const r = rhythm(size);
	const wide = size.width;
	const column = wide - r.padX * 2;
	const contentTop = r.padTop;
	const contentBottom = size.height - r.padBottom - r.mark - r.footerGap - r.ruleGap;
	const budget = contentBottom - contentTop;
	const quote = copy.template === 'quote';
	const announce = copy.template === 'announcement';
	const title = withStop(copy.title);
	const sub = (copy.text ?? '').trim();
	const showSub = !quote && copy.template !== 'headline' && sub.length > 0;
	const eyebrow = (copy.eyebrow ?? '').trim();
	const by = quote ? (copy.by ?? '').trim() : '';

	const tag = eyebrow ? fitTag(eyebrow, loaded.medium, r.eyebrow, column, palette) : undefined;
	const bySize = Math.round(r.body * 0.92);
	const byGap = by ? Math.round(r.gapBody * 0.9) : 0;
	const byH = by ? capHeight(loaded.medium, bySize) + descent(loaded.medium, bySize) : 0;
	const ruleBefore = announce && showSub ? Math.round(r.body * 0.85) : 0;
	const ruleAfter = announce && showSub ? Math.round(r.body * 0.95) : 0;
	const subGap = showSub ? (announce ? ruleBefore + 1 + ruleAfter : r.gapBody) : 0;
	const tagGap = tag ? r.gapTag : 0;
	const fixed = (tag?.height ?? 0) + tagGap + subGap + byGap + byH;
	const textBudget = Math.max(40, budget - fixed);

	const headingLeading = quote ? 1.14 : 1.1;
	const headlineMax = quote ? Math.round(r.headline * 0.86) : r.headline;
	const headlineLines = quote ? r.headlineLines + 2 : r.headlineLines;
	let subLines: string[] = [];
	let subSize = r.body;
	let head = fit(loaded.heading, title, column, { maxSize: headlineMax, minSize: r.headlineMin, maxLines: headlineLines, leading: headingLeading, tracking: palette.trackingDisplay, maxHeight: textBudget });

	if (showSub) {
		const maxSubLines = announce ? 2 : r.bodyLines;
		for (let guard = 0; guard < 80; guard++) {
			const headH = blockHeight(loaded.heading, head.lines, head.size, headingLeading);
			const room = textBudget - headH;
			subSize = r.body;
			let fitted = fit(loaded.text, sub, Math.min(column, Math.round(wide * 0.66)), { maxSize: r.body, minSize: r.bodyMin, maxLines: maxSubLines, leading: r.bodyLeading, tracking: 0, maxHeight: Math.max(r.body, room) });
			while (fitted.size > r.bodyMin && headH + blockHeight(loaded.text, fitted.lines, fitted.size, r.bodyLeading) > textBudget) {
				fitted = fit(loaded.text, sub, Math.min(column, Math.round(wide * 0.66)), { maxSize: fitted.size - 1, minSize: r.bodyMin, maxLines: maxSubLines, leading: r.bodyLeading, tracking: 0, maxHeight: textBudget });
				if (fitted.size <= r.bodyMin) break;
			}
			subLines = fitted.lines;
			subSize = fitted.size;
			const used = headH + blockHeight(loaded.text, subLines, subSize, r.bodyLeading);
			if (used <= textBudget + 0.5 || head.size <= r.headlineMin) break;
			head = fit(loaded.heading, title, column, { maxSize: head.size - 2, minSize: r.headlineMin, maxLines: headlineLines, leading: headingLeading, tracking: palette.trackingDisplay, maxHeight: textBudget });
		}
	}

	const boxes: Box[] = [];
	if (tag) {
		boxes.push(tag);
		boxes.push(gap(r.gapTag));
	}
	boxes.push(linesBox(loaded.heading, head.lines, head.size, headingLeading, palette.trackingDisplay, palette.fg, palette.accentText));
	if (showSub) {
		if (announce) {
			const ruleW = Math.max(48, ...head.lines.map((line) => measure(loaded.heading, line.endsWith('.') ? line.slice(0, -1) : line, head.size, palette.trackingDisplay)));
			boxes.push(gap(ruleBefore));
			boxes.push({ height: 1, draw: (x, y) => rect(x, y, ruleW, 1, palette.edge) });
			boxes.push(gap(ruleAfter));
		} else boxes.push(gap(r.gapBody));
		boxes.push(linesBox(loaded.text, subLines, subSize, r.bodyLeading, 0, palette.fgMuted, palette.fgMuted));
	}
	if (by) {
		boxes.push(gap(byGap));
		boxes.push(attribution(by, loaded.medium, bySize, column, palette));
	}

	const stackH = boxes.reduce((sum, b) => sum + b.height, 0);
	const slack = budget - stackH;
	const top = contentTop + Math.max(0, Math.round(slack * (quote ? 0.4 : 0.38)));
	return `${paint(boxes, r.padX, top)}${footer(size, r, loaded, palette)}`;
}

function frame(copy: ImageCopy, size: SizeSpec, loaded: Faces, palette: Theme): string {
	const r = rhythm(size);
	const sub = (copy.text ?? '').trim();
	const eyebrow = (copy.eyebrow ?? '').trim();
	const title = withStop(copy.title);
	const wide = size.width / size.height > 1.35;
	const contentTop = r.padTop;
	const contentBottom = size.height - r.padBottom - r.mark - r.footerGap - r.ruleGap;
	const contentH = contentBottom - contentTop;
	const innerW = size.width - r.padX * 2;
	const gutter = Math.round(r.padX * 0.7);
	const textW = wide ? Math.round(innerW * 0.38) : innerW;
	const frameW = wide ? innerW - textW - gutter : innerW;
	const frameX = wide ? r.padX + textW + gutter : r.padX;

	const tag = eyebrow ? fitTag(eyebrow, loaded.medium, Math.round(r.eyebrow * 0.92), textW, palette) : undefined;
	const headMax = wide ? Math.min(r.headline, Math.round(textW * 0.16)) : Math.round(r.headline * 0.62);
	const tagH = tag ? tag.height + Math.round(r.gapTag * 0.75) : 0;
	const subGap = sub ? Math.round(r.gapBody * 0.8) : 0;
	const textBudget = wide ? contentH - tagH - subGap : contentH * 0.34;
	const head = fit(loaded.heading, title, textW, { maxSize: headMax, minSize: Math.min(r.headlineMin, 26), maxLines: wide ? 4 : 3, leading: 1.08, tracking: palette.trackingDisplay, maxHeight: Math.max(48, textBudget * (sub ? 0.62 : 1)) });
	const headH = blockHeight(loaded.heading, head.lines, head.size, 1.08);
	let subFit = sub ? fit(loaded.text, sub, textW, { maxSize: wide ? Math.round(r.body * 0.95) : r.body, minSize: r.bodyMin, maxLines: wide ? 4 : 2, leading: r.bodyLeading, tracking: 0, maxHeight: Math.max(r.body, textBudget - headH) }) : undefined;
	if (subFit && !wide && tagH + headH + subGap + blockHeight(loaded.text, subFit.lines, subFit.size, r.bodyLeading) > contentH * 0.42) {
		subFit = fit(loaded.text, sub, textW, { maxSize: subFit.size, minSize: r.bodyMin, maxLines: 2, leading: r.bodyLeading, tracking: 0, maxHeight: contentH * 0.42 - tagH - headH - subGap });
	}
	const subH = subFit ? blockHeight(loaded.text, subFit.lines, subFit.size, r.bodyLeading) : 0;
	const textH = tagH + headH + (subFit ? subGap + subH : 0);

	let frameY = contentTop;
	let frameH = contentH;
	let textY = contentTop;
	if (wide) {
		textY = contentTop + Math.max(0, Math.round((contentH - textH) * 0.46));
	} else {
		const gap = Math.round(r.gapBody * 1.1);
		frameY = contentTop + textH + gap;
		frameH = Math.max(80, contentBottom - frameY);
	}

	const boxes: Box[] = [];
	if (tag) {
		boxes.push(tag);
		boxes.push(gap(Math.round(r.gapTag * 0.75)));
	}
	boxes.push(linesBox(loaded.heading, head.lines, head.size, 1.08, palette.trackingDisplay, palette.fg, palette.accentText));
	if (subFit) {
		boxes.push(gap(subGap));
		boxes.push(linesBox(loaded.text, subFit.lines, subFit.size, r.bodyLeading, 0, palette.fgMuted, palette.fgMuted));
	}

	const shot = copy.image ? imageFill(copy.image, frameX, frameY, frameW, frameH, palette) : miniature(frameX, frameY, frameW, frameH, palette);
	return `${shot}${paint(boxes, r.padX, textY)}${footer(size, r, loaded, palette)}`;
}

function imageFill(image: { mime: string; data: Buffer }, x: number, y: number, w: number, h: number, palette: Theme): string {
	const inset = Math.max(8, Math.round(w * 0.018));
	const ix = x + inset;
	const iy = y + inset;
	const iw = w - inset * 2;
	const ih = h - inset * 2;
	const href = `data:${image.mime};base64,${image.data.toString('base64')}`;
	return [
		rect(x, y, w, h, 'none', palette.edgeStrong),
		rect(ix, iy, iw, ih, 'none', palette.edgeStrong),
		`<clipPath id="shot"><rect x="${fmt(ix + 1)}" y="${fmt(iy + 1)}" width="${fmt(iw - 2)}" height="${fmt(ih - 2)}"/></clipPath>`,
		`<image href="${href}" x="${fmt(ix + 1)}" y="${fmt(iy + 1)}" width="${fmt(iw - 2)}" height="${fmt(ih - 2)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#shot)"/>`,
	].join('');
}

function miniature(x: number, y: number, w: number, h: number, palette: Theme): string {
	const inset = Math.max(8, Math.round(w * 0.018));
	const ix = x + inset + 1;
	const iy = y + inset + 1;
	const iw = w - inset * 2 - 2;
	const ih = h - inset * 2 - 2;
	const light = paperTheme();
	const rail = Math.round(iw * 0.3);
	const parts = [rect(x, y, w, h, 'none', palette.edgeStrong), rect(ix - 1, iy - 1, iw + 2, ih + 2, 'none', palette.edgeStrong), rect(ix, iy, iw, ih, light.bg), rect(ix, iy, rail, ih, light.bgSubtle), rect(ix + rail, iy, 1, ih, light.edge)];
	const markH = Math.max(16, Math.round(ih * 0.07));
	const markX = ix + Math.round(rail * 0.14);
	const markY = iy + Math.round(ih * 0.055);
	parts.push(markAt(light.fg, markX, markY, markH));
	const rows = 6;
	const rowTop = markY + markH + Math.round(ih * 0.06);
	const rowSpan = ih - (rowTop - iy) - Math.round(ih * 0.06);
	const rowH = rowSpan / rows;
	for (let i = 0; i < rows; i++) {
		const ry = rowTop + i * rowH;
		const active = i === 1;
		const barH = Math.max(4, Math.round(rowH * 0.16));
		// The console's active page: a 2px accent at the sidebar's edge, most of the row tall (SidebarLink).
		if (active) {
			const tickH = Math.max(8, rowH * 0.58);
			parts.push(rect(ix, ry + (rowH - tickH) / 2, 2, tickH, light.edgeAccent));
		}
		const barW = (rail - (markX - ix)) * (active ? 0.62 : 0.4 + (i % 3) * 0.08);
		parts.push(rect(markX, ry + (rowH - barH) / 2, barW, barH, active ? light.fg : light.edgeStrong));
	}
	const mx = ix + rail + Math.round(iw * 0.055);
	const mw = iw - (mx - ix) - Math.round(iw * 0.055);
	const fracs = [0.46, 0.94, 0.88, 0.8, 0.5, 0.92, 0.84, 0.62];
	const blockTop = iy + ih * 0.09;
	const step = (ih * 0.78) / fracs.length;
	fracs.forEach((frac, i) => {
		const barH = Math.max(5, i === 0 ? ih * 0.028 : ih * 0.014);
		parts.push(rect(mx, blockTop + i * step, mw * frac, barH, i === 0 ? light.fg : light.edge));
	});
	return parts.join('');
}

type Rhythm = {
	padX: number;
	padTop: number;
	padBottom: number;
	mark: number;
	url: number;
	footerGap: number;
	ruleGap: number;
	headline: number;
	headlineMin: number;
	headlineLines: number;
	body: number;
	bodyMin: number;
	bodyLines: number;
	bodyLeading: number;
	eyebrow: number;
	gapTag: number;
	gapBody: number;
};

function rhythm(size: SizeSpec): Rhythm {
	// Tuned per canvas. The headline leading matches the site headline's 1.1 line-height.
	if (size.id === 'square') return { padX: 76, padTop: 76, padBottom: 44, mark: 34, url: 18, footerGap: 22, ruleGap: 36, headline: 108, headlineMin: 34, headlineLines: 4, body: 26, bodyMin: 18, bodyLines: 4, bodyLeading: 1.4, eyebrow: 16, gapTag: 30, gapBody: 22 };
	if (size.id === 'portrait') return { padX: 80, padTop: 88, padBottom: 52, mark: 38, url: 20, footerGap: 24, ruleGap: 40, headline: 112, headlineMin: 36, headlineLines: 5, body: 28, bodyMin: 18, bodyLines: 4, bodyLeading: 1.4, eyebrow: 17, gapTag: 34, gapBody: 24 };
	if (size.id === 'landscape') return { padX: 64, padTop: 52, padBottom: 34, mark: 28, url: 16, footerGap: 18, ruleGap: 26, headline: 64, headlineMin: 30, headlineLines: 3, body: 22, bodyMin: 16, bodyLines: 2, bodyLeading: 1.35, eyebrow: 14, gapTag: 20, gapBody: 16 };
	return { padX: 64, padTop: 54, padBottom: 34, mark: 28, url: 16, footerGap: 18, ruleGap: 28, headline: 72, headlineMin: 32, headlineLines: 3, body: 22, bodyMin: 16, bodyLines: 3, bodyLeading: 1.4, eyebrow: 15, gapTag: 24, gapBody: 18 };
}

function fitTag(label: string, face: Face, size: number, maxWidth: number, palette: Theme): Box | undefined {
	let s = size;
	let text = label.trim().toUpperCase();
	if (!text || maxWidth < 8) return undefined;
	// The red box includes its own padding, so the label is fitted to what is left of the column.
	const padXFor = (n: number) => Math.round(n * 0.48);
	const boxWidth = (n: number, value: string) => tagWidth(face, value, n, palette.trackingTag) + padXFor(n) * 2;
	while (boxWidth(s, text) > maxWidth && s > 11) s -= 1;
	if (boxWidth(s, text) > maxWidth) {
		while (text.length > 0 && boxWidth(s, `${text}...`) > maxWidth) text = text.slice(0, -1).trimEnd();
		text = text ? `${text}...` : '';
	}
	if (!text || boxWidth(s, text) > maxWidth) return undefined;
	const cap = capHeight(face, s);
	const padX = padXFor(s);
	const padY = Math.round(s * 0.36);
	const height = Math.ceil(cap + padY * 2);
	const boxW = Math.min(maxWidth, Math.ceil(boxWidth(s, text)));
	return {
		height,
		draw: (x, y) => `${rect(x, y, boxW, height, palette.accent)}${textAt(face, text, x + padX, y + padY + cap, s, palette.trackingTag, palette.onAccent)}`,
	};
}

function tagWidth(face: Face, text: string, size: number, tracking: number): number {
	return measure(face, text, size, tracking);
}

function attribution(name: string, face: Face, size: number, maxWidth: number, palette: Theme): Box {
	const square = Math.max(7, Math.round(size * 0.42));
	const gap = Math.round(square * 1.15);
	let s = size;
	while (s > 12 && measure(face, name, s, 0) + square + gap > maxWidth) s -= 1;
	let text = name;
	if (measure(face, text, s, 0) + square + gap > maxWidth) {
		while (text.length > 1 && measure(face, `${text}...`, s, 0) + square + gap > maxWidth) text = text.slice(0, -1).trimEnd();
		text = `${text}...`;
	}
	const cap = capHeight(face, s);
	const drop = descent(face, s);
	const height = cap + drop;
	return {
		height,
		draw: (x, y) => {
			const baseline = y + cap;
			const sy = baseline - cap + (cap - square) / 2;
			return `${rect(x, sy, square, square, palette.accentText)}${textAt(face, text, x + square + gap, baseline, s, 0, palette.fg)}`;
		},
	};
}

function linesBox(face: Face, lines: string[], size: number, leading: number, tracking: number, fill: string, stop: string): Box {
	const height = blockHeight(face, lines, size, leading);
	return {
		height,
		draw: (x, y) => {
			let baseline = y + capHeight(face, size);
			return lines
				.map((line, i) => {
					const painted = paintLine(face, line, x, baseline, size, tracking, fill, i === lines.length - 1 ? stop : fill);
					baseline += size * leading;
					return painted;
				})
				.join('');
		},
	};
}

function paintLine(face: Face, line: string, x: number, baseline: number, size: number, tracking: number, fill: string, stop: string): string {
	// The stop stays in the same run, so its side bearing matches the heading on the site. A closing quote can follow it.
	const parts = stop === fill ? undefined : splitStop(line);
	if (parts) {
		const ls = tracking ? ` letter-spacing="${fmt(tracking * size)}"` : '';
		return `<text x="${fmt(x)}" y="${fmt(baseline)}" fill="${fill}" ${familyAttr(face)} font-size="${fmt(size)}" font-weight="${face.weight}"${ls}>${esc(parts.body)}<tspan fill="${stop}">.</tspan>${esc(parts.tail)}</text>`;
	}
	return textAt(face, line, x, baseline, size, tracking, fill);
}

/** A final full stop, not an ellipsis, with any closing quotes after it. */
function splitStop(line: string): { body: string; tail: string } | undefined {
	const m = /^(.*)\.((?:['"”’])*)$/.exec(line);
	if (!m || m[1].endsWith('.')) return undefined;
	return { body: m[1], tail: m[2] };
}

function footer(size: SizeSpec, r: Rhythm, loaded: Faces, palette: Theme): string {
	const y = size.height - r.padBottom - r.mark;
	const ruleY = y - r.footerGap;
	const host = siteHost(brand().site);
	let urlSize = r.url;
	const room = size.width - r.padX * 2 - r.mark * (149 / 134) - 24;
	while (urlSize > 11 && measure(loaded.text, host, urlSize, 0) > room) urlSize -= 1;
	const cap = capHeight(loaded.text, urlSize);
	const drop = descent(loaded.text, urlSize);
	const baseline = y + (r.mark - (cap + drop)) / 2 + cap;
	const urlW = measure(loaded.text, host, urlSize, 0);
	return [
		rect(r.padX, ruleY, size.width - r.padX * 2, 1, palette.edge),
		markAt(palette.fg, r.padX, y, r.mark),
		textAt(loaded.text, host, size.width - r.padX - urlW, baseline, urlSize, 0, palette.fgMuted),
	].join('');
}

function gap(height: number): Box {
	return { height, draw: () => '' };
}

function paint(boxes: Box[], x: number, top: number): string {
	let y = top;
	return boxes
		.map((b) => {
			const svg = b.draw(x, y);
			y += b.height;
			return svg;
		})
		.join('');
}

let markCache: { viewBox: string; body: string; vw: number; vh: number } | undefined;

function markAt(fill: string, x: number, y: number, height: number): string {
	markCache ??= readMark();
	const width = height * (markCache.vw / markCache.vh);
	const body = markCache.body.replaceAll('__FILL__', fill);
	return `<svg x="${fmt(x)}" y="${fmt(y)}" width="${fmt(width)}" height="${fmt(height)}" viewBox="${markCache.viewBox}">${body}</svg>`;
}

function readMark(): { viewBox: string; body: string; vw: number; vh: number } {
	const raw = readFileSync(join(packageRoot, 'brand', 'logo', 'svg', 'mark-white.svg'), 'utf8');
	const viewBox = /viewBox="([^"]+)"/.exec(raw)?.[1] ?? '0 0 149 134';
	const parts = viewBox.split(/[\s,]+/).map(Number);
	const body = raw
		.replace(/<\?xml[\s\S]*?\?>/g, '')
		.replace(/<svg[^>]*>/, '')
		.replace(/<\/svg>\s*$/, '')
		.replace(/fill="#[0-9A-Fa-f]{3,8}"/g, 'fill="__FILL__"');
	return { viewBox, body, vw: parts[2] || 149, vh: parts[3] || 134 };
}

function document(size: SizeSpec, palette: Theme, loaded: Faces, body: string): string {
	const css = [loaded.heading, loaded.text, loaded.medium]
		.filter((face, i, all) => all.findIndex((f) => f.family === face.family && f.weight === face.weight) === i)
		.map((face) => `@font-face{font-family:"${face.family}";font-weight:${face.weight};font-style:normal;src:url("data:font/woff2;base64,${face.woff2.toString('base64')}") format("woff2");}`)
		.join('');
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}">
<defs><style type="text/css"><![CDATA[${css}]]></style></defs>
${rect(0, 0, size.width, size.height, palette.bg)}
${body}
</svg>
`;
}

function familyAttr(face: Face): string {
	// Quoted, so a family with a space (the heading face) is one name. Unquoted, a browser reads it as two families and skips the embedded face.
	return `font-family="'${esc(face.family)}'"`;
}

function textAt(face: Face, text: string, x: number, y: number, size: number, tracking: number, fill: string): string {
	const ls = tracking ? ` letter-spacing="${fmt(tracking * size)}"` : '';
	return `<text x="${fmt(x)}" y="${fmt(y)}" fill="${fill}" ${familyAttr(face)} font-size="${fmt(size)}" font-weight="${face.weight}"${ls}>${esc(text)}</text>`;
}

function rect(x: number, y: number, w: number, h: number, fill: string, stroke?: string): string {
	const s = stroke ? ` fill="${fill}" stroke="${stroke}" stroke-width="1"` : ` fill="${fill}"`;
	return `<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(w)}" height="${fmt(h)}"${s} shape-rendering="crispEdges"/>`;
}

function siteHost(site: string): string {
	try {
		return new URL(site).host.replace(/^www\./, '');
	} catch {
		return site.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
	}
}

function fmt(n: number): string {
	const r = Math.round(n * 100) / 100;
	return Object.is(r, -0) ? '0' : String(r);
}

function esc(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
