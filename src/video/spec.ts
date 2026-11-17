import { suggest } from '../lib/names.js';
import { GROUNDS, groundById, type GroundId } from '../image/spec.js';

// Fixed video templates and sizes. A name that is not in this file is an error. There is no default template:
// an omitted template would be a guess.

export const VIDEO_FPS = 12;
export const VIDEO_FRAMES = 18;
export const VIDEO_JPEG_QUALITY = 90;
export const VIDEO_CODEC = 'mjpeg';
export const VIDEO_CONTAINER = 'mp4';

export const VIDEO_SIZES = [
	{ id: 'square', width: 1080, height: 1080, description: 'Square, 1080 by 1080.' },
	{ id: 'vertical', width: 1080, height: 1920, description: 'Vertical 9:16, 1080 by 1920.' },
	{ id: 'landscape', width: 1920, height: 1080, description: 'Landscape 16:9, 1920 by 1080.' },
] as const;

export const VIDEO_TEMPLATES = [
	{ id: 'headline', description: 'A headline settles in, with the red stop. A short social clip.' },
	{ id: 'statement', description: 'A headline, then one line under it.' },
	{ id: 'announcement', description: 'A tag, a headline, a rule and one line. An announcement clip.' },
	{ id: 'logo', description: 'The primary logo, redrawn in the ground foreground. It takes no title.' },
] as const;

export const VIDEO_FIELDS: Record<(typeof VIDEO_TEMPLATES)[number]['id'], { requires: string[]; accepts: string[]; refuses: string[] }> = {
	headline: { requires: ['title'], accepts: ['eyebrow'], refuses: ['text'] },
	statement: { requires: ['title'], accepts: ['text', 'eyebrow'], refuses: [] },
	announcement: { requires: ['title'], accepts: ['text', 'eyebrow'], refuses: [] },
	logo: { requires: [], accepts: [], refuses: ['title', 'text', 'eyebrow'] },
};

export type VideoSizeId = (typeof VIDEO_SIZES)[number]['id'];
export type VideoTemplateId = (typeof VIDEO_TEMPLATES)[number]['id'];
export type VideoSize = (typeof VIDEO_SIZES)[number];

const SIZE_BY_PX = new Map(VIDEO_SIZES.map((size) => [`${size.width}x${size.height}`, size.id]));

export function videoCatalog() {
	return {
		templates: VIDEO_TEMPLATES.map((template) => ({ ...template, ...VIDEO_FIELDS[template.id] })),
		sizes: [...VIDEO_SIZES],
		grounds: [...GROUNDS],
		defaults: { size: 'square' as VideoSizeId, ground: 'paper' as GroundId },
		fps: VIDEO_FPS,
		frames: VIDEO_FRAMES,
		seconds: VIDEO_FRAMES / VIDEO_FPS,
		codec: VIDEO_CODEC,
		container: VIDEO_CONTAINER,
		jpegQuality: VIDEO_JPEG_QUALITY,
		sampleEntry: 'jpeg',
		renderer: 'Each frame is an SVG drawn from the tokens, the vendored faces and the logo files, rasterized by resvg with system fonts off, encoded as baseline JPEG, and muxed into a Motion JPEG MP4. The same inputs write the same bytes.',
	};
}

export function videoSize(id: string): VideoSize | undefined {
	const norm = id.trim().toLowerCase().replace('×', 'x').replace(/\s+/g, '');
	const named = VIDEO_SIZES.find((size) => size.id === norm);
	if (named) return named;
	const fromPx = SIZE_BY_PX.get(norm);
	return fromPx ? VIDEO_SIZES.find((size) => size.id === fromPx) : undefined;
}

export function videoTemplate(id: string): VideoTemplateId | undefined {
	return VIDEO_TEMPLATES.find((template) => template.id === id.trim().toLowerCase())?.id;
}

function unknown(kind: string, value: string, allowed: string[]): Error {
	const near = suggest(value, allowed);
	return new Error(`Unknown ${kind} \`${value}\`. ${kind[0].toUpperCase()}${kind.slice(1)}s: ${allowed.join(', ')}.${near.length ? ` Did you mean ${near.map((name) => `\`${name}\``).join(', ')}?` : ''}`);
}

export function resolveVideo(input: { template?: string; size?: string; ground?: string }): { template: VideoTemplateId; sizes: VideoSizeId[]; ground: GroundId } {
	if (!input.template?.trim()) throw new Error(`--template is required. Templates: ${VIDEO_TEMPLATES.map((template) => template.id).join(', ')}.`);
	const template = videoTemplate(input.template);
	if (!template) throw unknown('template', input.template, VIDEO_TEMPLATES.map((item) => item.id));
	const ground = groundById(input.ground || 'paper');
	if (!ground) throw unknown('ground', input.ground ?? '', GROUNDS.map((item) => item.id));
	const tokens = (input.size ?? '').split(',').map((token) => token.trim()).filter(Boolean);
	const asked = tokens.length ? tokens : ['square'];
	const sizes: VideoSizeId[] = [];
	for (const token of asked) {
		if (token.toLowerCase() === 'all') {
			for (const size of VIDEO_SIZES) if (!sizes.includes(size.id)) sizes.push(size.id);
			continue;
		}
		const size = videoSize(token);
		if (!size) throw unknown('size', token, [...VIDEO_SIZES.map((item) => item.id), 'all']);
		if (!sizes.includes(size.id)) sizes.push(size.id);
	}
	return { template, sizes, ground };
}

export function refuseVideo(template: VideoTemplateId, present: { title?: string; text?: string; eyebrow?: string }) {
	const policy = VIDEO_FIELDS[template];
	const label = template.charAt(0).toUpperCase() + template.slice(1);
	if (policy.requires.includes('title') && !present.title) throw new Error(`A title is required for ${template}.`);
	if (present.title && policy.refuses.includes('title')) throw new Error(`${label} does not draw a title. It uses brand/logo/svg/horizontal-white.svg.`);
	if (present.text && policy.refuses.includes('text')) {
		if (template === 'headline') throw new Error('Headline does not draw --text. Use --template statement for a line under the title.');
		throw new Error(`${label} does not draw --text.`);
	}
	if (present.eyebrow && policy.refuses.includes('eyebrow')) throw new Error(`${label} does not draw --eyebrow.`);
}
