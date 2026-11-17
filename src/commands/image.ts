import { readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { brand } from '../lib/brand.js';
import { mimeOf, renderImages, resolveRequest, writeImages, type Written } from '../image/render.js';
import { catalog, TEMPLATE_FIELDS, type TemplateId } from '../image/spec.js';

// `image` renders Open Graph and social cards from copy. It does not need an app: the type, colors and mark come
// from the package.

type Flags = Record<string, string | boolean | string[] | undefined>;

export function imageHelp(): string {
	const b = brand().bin;
	const row = (cmd: string, what: string) => `  ${cmd.padEnd(46)}${what}`;
	return [
		`Open Graph and social images from the brand's type, colors and logo.`,
		'Headless: the same copy gives the same file.',
		'',
		row(`${b} image --title "..." --text "..."`, 'A statement at Open Graph size, PNG and SVG'),
		row(`${b} image --size all --title "..."`, 'That card at every size'),
		row(`${b} image --template quote --title "..." --by "Acme" --size square`, 'A square quotation'),
		row(`${b} image --template frame --title "..." --image shot.png --size og,landscape`, 'A screenshot in the double rule'),
		row(`${b} image --ground ink --out out --json`, 'Off-black, with a machine-readable file list'),
		row(`${b} image --list`, 'Templates, sizes and grounds'),
		'',
		'Templates: headline, statement (the default), quote, announcement, frame.',
		'Sizes: og 1200x630, square 1080x1080, portrait 1080x1350, landscape 1200x675. --size all writes every one.',
		'--ground paper (the default) or ink. --format png, svg or both (the default). --out is a directory, or one file when there is one size.',
		'--text is the line under the headline on statement, announcement and frame (--subtitle too). Headline and quote do not draw it; a quote\'s speaker is --by (or --author).',
		'--eyebrow is the red tag. A template that does not draw a field rejects it.',
		'--image is a PNG or JPEG for the frame template. Without it, the frame holds a quiet stand-in of the console. Other templates reject --image.',
		'--by is the speaker on a quote. Other templates reject it. --text and --subtitle must match when both are set; so must --by and --author.',
		'A headline ends in a red full stop, as the site\'s headlines do. Write the copy in sentence case.',
	].join('\n');
}

export async function runImage(cwd: string, args: string[], flags: Flags): Promise<{ json: unknown; text: string }> {
	if (flags.list === true || args[0] === 'list') {
		const spec = catalog();
		const text = [
			'Templates',
			...spec.templates.map((t) => `  ${t.id.padEnd(16)}${t.description}`),
			'',
			'Sizes',
			...spec.sizes.map((s) => `  ${s.id.padEnd(16)}${String(s.width).padStart(4)}x${s.height}  ${s.description}`),
			'',
			'Grounds',
			...spec.grounds.map((g) => `  ${g.id.padEnd(16)}${g.description}`),
		].join('\n');
		return { json: spec, text };
	}

	for (const name of ['title', 'text', 'subtitle', 'eyebrow', 'by', 'author', 'image', 'template', 'size', 'ground', 'out', 'format']) {
		if (flags[name] === '' || flags[name] === true) throw new Error(`--${name} needs a value.`);
	}

	const positional: string[] = [];
	const fromArgs: string[] = [];
	for (const arg of args) {
		if (arg.toLowerCase() === 'all' || /^\d+\s*[x×]\s*\d+$/i.test(arg) || ['og', 'square', 'portrait', 'landscape'].includes(arg.toLowerCase())) fromArgs.push(arg);
		else positional.push(arg);
	}
	if (positional.length > 1 || (positional.length === 1 && str(flags.title))) throw new Error(`Unexpected \`${positional.join(' ')}\`. Pass the title with --title.`);
	const title = str(flags.title) || positional[0];
	if (!title) throw new Error(`A title is required. ${brand().bin} image --title "..." (--list shows templates and sizes).`);
	const textFlag = str(flags.text);
	const subtitle = str(flags.subtitle);
	if (textFlag && subtitle && textFlag !== subtitle) throw new Error('--text and --subtitle disagree. Pass one.');
	const byFlag = str(flags.by);
	const author = str(flags.author);
	if (byFlag && author && byFlag !== author) throw new Error('--by and --author disagree. Pass one.');

	const requested = resolveRequest({
		template: str(flags.template),
		size: [str(flags.size), ...fromArgs].filter(Boolean).join(','),
		ground: str(flags.ground),
		format: str(flags.format),
	});
	const text = textFlag || subtitle;
	const by = byFlag || author;
	refuseUnused(requested.template, { text, by, image: str(flags.image), eyebrow: str(flags.eyebrow) });
	const imagePath = str(flags.image);
	const image = imagePath ? readImage(cwd, imagePath) : undefined;
	const rendered = await renderImages({
		...requested,
		title,
		text,
		eyebrow: str(flags.eyebrow),
		by,
		image,
	});
	const files = writeImages(cwd, str(flags.out), rendered, requested.format);
	return { json: { template: requested.template, ground: requested.ground, files: files.map(fileJson) }, text: formatWrote(files) };
}

function refuseUnused(template: TemplateId, present: { text?: string; by?: string; image?: string; eyebrow?: string }) {
	const policy = TEMPLATE_FIELDS[template];
	const label = template.charAt(0).toUpperCase() + template.slice(1);
	if (present.text && policy.refuses.includes('text')) {
		if (template === 'headline') throw new Error('Headline does not draw --text. Use --template statement for a line under the title.');
		if (template === 'quote') throw new Error('Quote does not draw --text. Pass the speaker with --by.');
		throw new Error(`${label} does not draw --text.`);
	}
	if (present.by && policy.refuses.includes('by')) throw new Error(`${label} does not draw --by. --by is the speaker on a quote.`);
	if (present.image && policy.refuses.includes('image')) throw new Error(`${label} does not use --image. --image is for the frame template.`);
	if (present.eyebrow && policy.refuses.includes('eyebrow')) throw new Error(`${label} does not draw --eyebrow.`);
}

function readImage(cwd: string, path: string): { mime: 'image/png' | 'image/jpeg'; data: Buffer } {
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

function fileJson(file: Written) {
	return { path: file.path, format: file.format, template: file.template, size: file.size, ground: file.ground, width: file.width, height: file.height };
}

function formatWrote(files: Written[]): string {
	return files.map((f) => `${f.path}  ${f.width}x${f.height}`).join('\n');
}

function str(value: string | boolean | string[] | undefined): string | undefined {
	return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
