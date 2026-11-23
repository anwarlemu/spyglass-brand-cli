import { existsSync, readFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { brand } from '../lib/brand.js';
import { display, list, readPhoto, str, write, type Flags } from '../assets/io.js';
import { unknown } from '../assets/templates.js';
import { helpRow } from '../lib/help-row.js';
import { checkFigmaValues, dedupe } from '../figma/check.js';
import { figmaSvg, parseFigmaUrl, svgScript } from '../figma/push.js';
import { figmaTokens, figmaTokenScripts } from '../figma/tokens.js';
import { illustrate, STYLES, type StyleId } from '../illustrate/build.js';
import { readIndex } from '../library/registry.js';

// `figma` gives the Figma MCP tools what they need; the CLI never calls Figma itself. Every action writes files and
// prints the exact tool calls, in order, that an agent makes with them.

export const FIGMA_ACTIONS = ['tokens', 'push', 'pull', 'check'] as const;
export const PUSH_KINDS = ['illustration', 'asset', 'slide', 'component', 'page'] as const;
export const FIGMA_FLAGS = ['out', 'file', 'image', 'preset', 'variant', 'seed', 'example', 'url', 'width', 'browser'];

export type Step = { tool: string; args?: Record<string, unknown>; note: string };
type Result = { json: unknown; text: string; exitCode?: number };

const sessionSteps = (task: string, newFile: boolean): Step[] => [
	...(newFile ? [
		{ tool: 'whoami', note: 'Only if no planKey is known: read the plans and use the one plan, or ask which.' },
		{ tool: 'create_new_file', args: { fileName: `${brand().name} ${task}`, editorType: 'design', planKey: '<plan key>' }, note: 'Only when there is no target file yet (pass --file <key> to skip).' },
	] : []),
	{ tool: 'create_session', args: { fileKey: '<fileKey>', description: task }, note: 'Before any other file tool; pass the returned sessionId on every later call.' },
];
const USE_FIGMA = 'Load the figma-use skill (skill://figma/figma-use/SKILL.md) before the first use_figma call, and figma-generate-library for variables or figma-generate-design for visible frames; pass skillNames.';

export function figmaHelp(): string {
	const b = brand().bin;
	const row = (cmd: string, what: string) => helpRow(cmd, what, 66);
	return [
		'Work in Figma through its MCP tools. The CLI never calls Figma: each action writes files and prints the tool calls,',
		'in order, for an agent to make.',
		'',
		row(`${b} figma tokens`, 'The tokens as variables: tokens.json and use_figma scripts'),
		row(`${b} figma push illustration shader mark`, 'An illustration (style and subject, as illustrate takes)'),
		row(`${b} figma push asset imagery/post-offer.svg`, 'An image, slide or any SVG, PNG or JPEG'),
		row(`${b} figma push component button --example Variants`, 'A library preview as HTML for html_to_figma'),
		row(`${b} figma push page https://example.com/pricing`, 'A page (URL or saved HTML)'),
		row(`${b} figma pull "https://figma.com/design/KEY/x?node-id=1-2"`, 'The read steps for a frame, then check'),
		row(`${b} figma check figma/variables-1-2.json figma/design-1-2.txt`, 'Off-brand values with the nearest token (exit 1)'),
		'',
		'--out <dir> (default figma/). --file <key> skips the create-file steps.',
		'push component and push page capture in Chromium (playwright-core; --browser <path to Chromium> if it is not found).',
	].join('\n');
}

function steps(files: string[], cwd: string, doc: Record<string, unknown>, list: Step[], title: string): Result {
	const rel = files.map((f) => display(cwd, f));
	return {
		json: { ...doc, files: rel, steps: list },
		text: [title, ...rel.map((f) => `  wrote ${f}`), 'Figma MCP steps, in order:', ...list.map((s, i) => `  ${i + 1}. ${s.tool}${s.args ? ` ${JSON.stringify(s.args)}` : ''}\n     ${s.note}`)].join('\n'),
	};
}

function tokensAction(cwd: string, dir: string, flags: Flags): Result {
	const doc = figmaTokens();
	const scripts = figmaTokenScripts(doc);
	const files = [join(dir, 'tokens.json')];
	write(files[0]!, `${JSON.stringify(doc, null, 2)}\n`);
	scripts.forEach((s, i) => {
		const f = join(dir, `tokens-${i + 1}.js`);
		write(f, s);
		files.push(f);
	});
	const list: Step[] = [
		...sessionSteps('apply brand tokens as variables', !flags.file),
		...scripts.map((_, i) => ({ tool: 'use_figma', args: { fileKey: '<fileKey>', sessionId: '<sessionId>', code: `<contents of ${display(cwd, files[i + 1]!)}>`, skillNames: 'figma-use,figma-generate-library' }, note: i === 0 ? `${USE_FIGMA} Finds or creates "${doc.collection}" with modes ${doc.modes.join(', ')}; on a plan with one mode per collection it makes one collection per mode.` : 'Same collection; continues the variables.' })),
		{ tool: 'get_variable_defs', args: { fileKey: '<fileKey>', nodeId: '<a node bound to the variables>' }, note: 'Optional check once something is bound; save it and run figma check on it.' },
	];
	return steps(files, cwd, { collection: doc.collection, modes: doc.modes, variables: doc.variables.length, skipped: doc.skipped }, list, `${doc.variables.length} variables (${doc.modes.join(', ')}); ${doc.skipped.length} tokens have no Figma type.`);
}

async function snapshotHtml(url: string, width: number, browserPath?: string): Promise<string> {
	let chromium: { launch: (o: Record<string, unknown>) => Promise<{ newPage: (o: Record<string, unknown>) => Promise<{ goto: (u: string, o: Record<string, unknown>) => Promise<unknown>; evaluate: <T>(f: () => Promise<T>) => Promise<T> }>; close: () => Promise<void> }> };
	try {
		({ chromium } = (await import('playwright-core' as string)) as { chromium: typeof chromium });
	} catch {
		throw new Error('push component and push page capture the page in Chromium through playwright-core: npm i -D playwright-core, then pass --browser <Chromium path> if none is installed.');
	}
	const browser = await chromium.launch(browserPath ? { executablePath: browserPath } : {});
	try {
		const page = await browser.newPage({ viewport: { width, height: 900 } });
		await page.goto(url, { waitUntil: 'networkidle' });
		return await page.evaluate(async () => {
			const toData = async (src: string) => {
				try {
					const blob = await (await fetch(src)).blob();
					return await new Promise<string>((ok) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.readAsDataURL(blob); });
				} catch { return src; }
			};
			let css = '';
			for (const sheet of Array.from(document.styleSheets)) {
				try { css += Array.from(sheet.cssRules).map((r) => r.cssText).join('\n'); } catch {}
			}
			const doc = document.documentElement.cloneNode(true) as HTMLElement;
			doc.querySelectorAll('script, link[rel="stylesheet"], link[rel="preload"], noscript, nextjs-portal').forEach((n) => n.remove());
			for (const img of Array.from(doc.querySelectorAll('img'))) if (img.src) img.src = await toData(img.src);
			const style = document.createElement('style');
			style.textContent = css.replace(/url\((['"]?)(\/[^)'"]+)\1\)/g, (_m, _q, p) => `url(${location.origin}${p})`);
			doc.querySelector('head')?.appendChild(style);
			return `<!doctype html>\n${doc.outerHTML}`;
		});
	} finally {
		await browser.close();
	}
}

const TYPES: Record<string, string> = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' };

/** A file as upload steps (and, for a small SVG, a use_figma import script). */
function fileSteps(cwd: string, dir: string, file: string, frame: string, files: string[], out: Step[]) {
	const ext = extname(file).toLowerCase();
	const name = basename(file, ext);
	if (ext === '.html' || ext === '.htm') {
		const dest = join(dir, `${name}.html`);
		write(dest, readFileSync(file));
		files.push(dest);
		out.push({ tool: 'html_to_figma', args: { fileKey: '<fileKey>', sessionId: '<sessionId>', promptId: '<new uuid>' }, note: `POST ${display(cwd, dest)} (Content-Type text/html) to the returned single-use URL. The HTML must be self-contained (inline CSS, images as data URIs).` });
		return;
	}
	if (!TYPES[ext]) throw unknown('file type', ext || file, [...Object.keys(TYPES), '.html']);
	let upload = file;
	if (ext === '.svg') {
		const clean = figmaSvg(readFileSync(file, 'utf8'));
		upload = join(dir, `${name}.figma.svg`);
		write(upload, clean);
		files.push(upload);
		const script = svgScript(clean, frame);
		if (script) {
			const f = join(dir, `push-${name}.js`);
			write(f, script);
			files.push(f);
			out.push({ tool: 'use_figma', args: { fileKey: '<fileKey>', sessionId: '<sessionId>', code: `<contents of ${display(cwd, f)}>`, skillNames: 'figma-use,figma-generate-design' }, note: `${USE_FIGMA} Imports the SVG as editable layers in "${frame}", text as text layers in the brand fonts, placed clear of existing frames.` });
		}
	}
	out.push({ tool: 'upload_assets', args: { fileKey: '<fileKey>', count: 1 }, note: `${ext === '.svg' ? 'For an SVG too big for one script, or instead of it: ' : ''}POST ${display(cwd, upload)} with Content-Type ${TYPES[ext]} to the returned URL${ext === '.svg' ? ' (it arrives as editable vectors)' : ' (it arrives as an image fill in a new frame)'}.` });
}

async function pushAction(cwd: string, dir: string, args: string[], flags: Flags): Promise<Result> {
	const [kind, target, extra] = args;
	if (!kind) throw new Error(`Name what to push: ${PUSH_KINDS.join(', ')}.`);
	if (!(PUSH_KINDS as readonly string[]).includes(kind)) throw unknown('push kind', kind, [...PUSH_KINDS]);
	const files: string[] = [];
	const list: Step[] = [...sessionSteps(`push ${kind}${target ? ` ${target}` : ''}`, !flags.file)];
	const doc: Record<string, unknown> = { kind, target: target ?? null };
	if (kind === 'illustration') {
		if (!target) throw new Error(`Name a style: ${STYLES().join(', ')} (and a subject for the shader), as illustrate takes.`);
		if (!STYLES().includes(target as StyleId)) throw unknown('style', target, STYLES());
		const images = listOf(flags.image);
		const photo = images[0] ? await readPhoto(cwd, images[0], { alpha: true }) : undefined;
		const seed = flags.seed === undefined ? 0 : Number(flags.seed);
		const r = await illustrate({ style: target as StyleId, subject: extra, photo, preset: str(flags.preset), variant: str(flags.variant), seed });
		const name = [target, extra ?? (photo ? basename(images[0]!, extname(images[0]!)) : ''), str(flags.preset) ?? str(flags.variant) ?? ''].filter(Boolean).join('-');
		const svg = join(dir, `illustration-${name}.svg`);
		const png = join(dir, `illustration-${name}.png`);
		write(svg, r.svg);
		write(png, r.png);
		files.push(svg, png);
		fileSteps(cwd, dir, svg, `Illustration / ${name}`, files, list);
		doc.vector = r.vector;
	} else if (kind === 'asset' || kind === 'slide') {
		if (!target) throw new Error('Pass the file to push (SVG, PNG, JPEG, WebP, GIF or HTML).');
		const file = resolve(cwd, target);
		if (!existsSync(file)) throw new Error(`No such file: ${target}.`);
		fileSteps(cwd, dir, file, `${kind === 'slide' ? 'Slide' : 'Asset'} / ${basename(file, extname(file))}`, files, list);
	} else if (kind === 'component') {
		if (!target) throw new Error(`Name a library component (${brand().bin} list).`);
		const index = await readIndex();
		const item = index.find((i) => i.name === target);
		if (!item) throw unknown('component', target, index.map((i) => i.name));
		const example = str(flags.example) ?? item.examples[0];
		if (!example || !item.examples.includes(example)) throw unknown(`example for ${target}`, example ?? '', item.examples);
		const base = (str(flags.url) ?? brand().registryUrl).replace(/\/$/, '');
		const url = `${base}/preview/${target}/${example}`;
		const html = await snapshotHtml(url, Number(flags.width ?? 1440), str(flags.browser));
		const out = join(dir, `component-${target}-${example}.html`);
		write(out, html);
		files.push(out);
		doc.preview = url;
		list.push({ tool: 'html_to_figma', args: { fileKey: '<fileKey>', sessionId: '<sessionId>', promptId: '<new uuid>' }, note: `POST ${display(cwd, out)} (text/html) to the returned URL. Plain layers; rebuild as a component with use_figma and the variables when it must be reusable.` });
	} else {
		if (!target) throw new Error('Pass a page URL or a saved HTML file.');
		const html = /^https?:/.test(target) ? await snapshotHtml(target, Number(flags.width ?? 1440), str(flags.browser)) : readFileSync(resolve(cwd, target), 'utf8');
		const slug = (/^https?:/.test(target) ? new URL(target).pathname : basename(target)).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home';
		const out = join(dir, `page-${slug}.html`);
		write(out, html);
		files.push(out);
		list.push({ tool: 'html_to_figma', args: { fileKey: '<fileKey>', sessionId: '<sessionId>', promptId: '<new uuid>' }, note: `POST ${display(cwd, out)} (text/html) to the returned URL.` });
	}
	list.push({ tool: 'get_screenshot', args: { fileKey: '<fileKey>', nodeId: '<frameId from the last step>', sessionId: '<sessionId>' }, note: 'One screenshot to confirm the result; stop when it matches.' });
	return steps(files, cwd, doc, list, `Ready to push ${kind}${target ? ` ${target}` : ''}.`);
}

const listOf = (v: unknown) => list(v);

function pullAction(cwd: string, dir: string, url: string | undefined): Result {
	if (!url) throw new Error('Pass a Figma URL with a node-id (https://figma.com/design/<fileKey>/<name>?node-id=1-2).');
	const { fileKey, nodeId, kind } = parseFigmaUrl(url);
	if (kind !== 'design') throw new Error(`figma pull reads design files; this is a ${kind} URL.`);
	if (!nodeId) throw new Error('The URL has no node-id: select the frame in Figma and copy its link.');
	const vars = join(dir, `variables-${nodeId.replace(':', '-')}.json`);
	const ctx = join(dir, `design-${nodeId.replace(':', '-')}.txt`);
	const list: Step[] = [
		{ tool: 'create_session', args: { fileKey, description: `check node ${nodeId} against ${brand().name} tokens` }, note: 'First; pass the returned sessionId on the next calls.' },
		{ tool: 'get_variable_defs', args: { fileKey, nodeId, sessionId: '<sessionId>' }, note: `Save the JSON result to ${display(cwd, vars)}.` },
		{ tool: 'get_design_context', args: { fileKey, nodeId, sessionId: '<sessionId>', clientFrameworks: 'react', clientLanguages: 'typescript' }, note: `Load the figma-design-to-code skill first. Save the returned code to ${display(cwd, ctx)}.` },
		{ tool: 'shell', args: { run: `npx ${brand().bin} figma check ${display(cwd, vars)} ${display(cwd, ctx)}` }, note: 'Lists every value that is not a brand token, with the nearest one. Build with library items and tokens (theme classes or var(--ds-*)), never the raw values.' },
	];
	return steps([], cwd, { fileKey, nodeId, saveTo: { variables: display(cwd, vars), designContext: display(cwd, ctx) } }, list, `Figma file ${fileKey}, node ${nodeId}.`);
}

function checkAction(cwd: string, paths: string[]): Result {
	if (!paths.length) throw new Error('Pass the saved get_variable_defs JSON and/or get_design_context code.');
	const all = paths.flatMap((p) => {
		const abs = resolve(cwd, p);
		if (!existsSync(abs)) throw new Error(`No such file: ${p}.`);
		return checkFigmaValues(readFileSync(abs, 'utf8')).map((f) => ({ ...f, where: `${p} ${f.where}` }));
	});
	const findings = dedupe(all);
	const off = findings.filter((f) => !f.ok);
	const doc = { ok: off.length === 0, checked: all.length, offBrand: off, onBrand: findings.filter((f) => f.ok) };
	const text = (off.length ? [`${off.length} off-brand value${off.length === 1 ? '' : 's'}:`, ...off.map((f) => `  ${f.kind.padEnd(7)} ${f.message} (${f.count}x, first at ${f.where})`)] : [`All ${all.length} values are brand tokens.`]).join('\n');
	return { json: doc, text, exitCode: off.length ? 1 : 0 };
}

export async function runFigma(cwd: string, args: string[], flags: Flags): Promise<Result> {
	const [action, ...rest] = args;
	if (!action) throw new Error(`Name an action: ${FIGMA_ACTIONS.join(', ')}. ${brand().bin} figma --help`);
	if (!(FIGMA_ACTIONS as readonly string[]).includes(action)) throw unknown('figma action', action, [...FIGMA_ACTIONS]);
	if (action === 'check') return checkAction(cwd, rest);
	const dir = resolve(cwd, str(flags.out) ?? 'figma');
	if (action === 'tokens') {
		if (rest.length) throw new Error('figma tokens takes no arguments.');
		return tokensAction(cwd, dir, flags);
	}
	if (action === 'pull') return pullAction(cwd, dir, rest[0]);
	return pushAction(cwd, dir, rest, flags);
}
