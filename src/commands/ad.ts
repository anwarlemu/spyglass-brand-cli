import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { brand } from '../lib/brand.js';
import { docText, type Format } from '../design/index.js';
import { paint } from '../design/adapter.js';
import { PLATFORM_SIZES, SECTIONS, parseBrief, sizesFor, withImages, type Brief } from '../assets/brief.js';
import { adSheet, makeAds, type AdsResult } from '../assets/ads.js';
import { helpRow } from '../lib/help-row.js';

// `ad brief.md`: static ads from a brief. Reads the brief (Markdown, JSON, or stdin), picks the layouts that carry it
// at each size, and writes every ad as a design file with its PNG (and JPG or WebP), plus one labeled contact sheet.
// Everything is drawn and checked before anything is written.

export const AD_FLAGS = ['image', 'format', 'out', 'variants', 'sample', 'force'];
const FORMATS: Format[] = ['png', 'jpg', 'webp'];

export function adHelp(): string {
	const b = brand().bin;
	const row = (cmd: string, what: string) => helpRow(cmd, what, 54);
	return [
		'Static ads from a brief: 2 to 4 distinct ads per size, each a design file `design revise` works on, and a labeled',
		'contact sheet. Words and pictures are only ever the brief\'s; every ad passes the brand check. Same brief, same bytes.',
		'',
		row(`${b} ad brief.md`, 'Ads in ads/<brief>/ and ads/<brief>/sheet.png'),
		row(`${b} ad brief.json --out launch-ads`, 'A JSON brief, written to launch-ads/'),
		row(`cat brief.md | ${b} ad -`, 'The brief on stdin (paths are read from the current folder)'),
		row(`${b} ad brief.md --image screenshot=shot.png`, 'A picture beside the brief\'s (a name the brief uses replaces its file)'),
		row(`${b} ad brief.md --variants 4 --format png,jpg,webp`, 'Four per size, and JPG and WebP beside the PNG'),
		row(`${b} ad brief.md --sample`, 'Fill missing copy with sample copy (Acme), to look at the layouts'),
		'',
		'A brief is plain sections (## Heading, or Key: value lines; JSON takes the same keys):',
		...Object.values(SECTIONS).map((s) => `  ${s.heading.padEnd(16)}${s.about}`),
		'',
		`Platforms: ${PLATFORM_SIZES.map((p) => `${p.label} (${p.sizes.join(', ')})`).join('; ')}; or any size id.`,
		'Headline and CTA are required (an offer brief also needs Offer, a customer story Quote); a missing one fails and',
		'names it. --force writes over an earlier set. Examples: brand/briefs/*.md.',
		`Change one ad after you look at the sheet: ${b} design revise ads/<brief>/<ad>.design.json "bigger headline".`,
	].join('\n');
}

type Flags = Record<string, string | boolean | string[]>;

export async function runAd(cwd: string, args: string[], flags: Flags, stdin: () => Promise<string> = readStdin): Promise<{ json: unknown; text: string }> {
	if (args.length > 1) throw new Error(`ad takes one brief: ${brand().bin} ad brief.md.`);
	const typed = args[0];
	let text: string;
	let name: string;
	let briefDir = cwd;
	if (!typed || typed === '-') {
		text = await stdin();
		if (!text.trim()) throw new Error(`Name a brief: ${brand().bin} ad brief.md (or pipe one in with -). Examples are in brand/briefs/.`);
		name = 'ads';
	} else {
		const path = resolve(cwd, typed);
		if (!existsSync(path)) throw new Error(`There is no brief at ${typed}.`);
		text = readFileSync(path, 'utf8');
		name = basename(path).replace(/\.(md|markdown|json|txt)$/i, '');
		briefDir = dirname(path);
	}
	const fromCli = new Set<string>();
	let brief: Brief = parseBrief(text, typed && typed !== '-' ? basename(typed) : 'The brief');
	const extra = ([] as string[]).concat((flags.image as string | string[] | undefined) ?? []);
	if (extra.length) {
		brief = withImages(brief, extra);
		for (const f of extra) fromCli.add(/^([\w-]+)=/.exec(f)?.[1] ?? f.replace(/^.*[\\/]/, '').replace(/\.\w+$/, ''));
	}
	const variants = flags.variants === undefined ? 3 : Number(flags.variants);
	if (!Number.isInteger(variants) || variants < 2 || variants > 4) throw new Error(`--variants takes 2, 3 or 4, not ${String(flags.variants)}.`);
	const formats = formatsOf(flags.format);
	const outDir = resolve(cwd, typeof flags.out === 'string' ? flags.out : join('ads', name));

	const r = await makeAds(brief, { variants, sample: flags.sample === true, outDir, imageDir: (img) => (fromCli.has(img.name) ? cwd : briefDir), formats });
	const base = (a: AdsResult['ads'][number]) => join(outDir, `${a.size}-${a.n}-${a.layout}`);
	const targets = [...r.ads.map((a) => `${base(a)}.design.json`), join(outDir, 'sheet.png')];
	const there = targets.filter((t) => existsSync(t));
	if (there.length && flags.force !== true) throw new Error(`${show(cwd, there[0]!)}${there.length > 1 ? ` and ${there.length - 1} more` : ''} already exist${there.length > 1 ? '' : 's'}: a design there may have been revised. Pass --force to write over them, or --out another folder.`);

	const { from } = sizesFor(brief.platforms);
	const notes = [
		`${brief.name ?? name}: goal ${r.goal}. Every ad passed the brand check; copy and pictures are the brief's only.`,
		...(r.sampled.length ? [`Sample copy (Acme) fills ${r.sampled.join(', ')}: replace it before use.`] : []),
		...r.unchecked.map((u) => `To check by eye (${u.split(':')[0]}): ${u.slice(u.indexOf(':') + 1).trim()}`),
	];
	const sheet = await paint(adSheet(r.ads, notes.flatMap((n) => wrap(n, 180)), from));

	mkdirSync(outDir, { recursive: true });
	// A set written over replaces the earlier one: the files the earlier manifest lists go (only those), so no stale ad stays.
	const manifestPath = join(outDir, 'ads.json');
	if (existsSync(manifestPath)) {
		try {
			const before = JSON.parse(readFileSync(manifestPath, 'utf8')) as { written?: string[] };
			for (const f of before.written ?? []) if (/^[\w.-]+$/.test(f) && f !== 'ads.json') rmSync(join(outDir, f), { force: true });
		} catch {
			// An unreadable manifest is left as it is; the new set still writes over files of the same name.
		}
	}
	const listed: string[] = ['sheet.png', 'ads.json'];
	const files: { size: string; n: number; layout: string; alternate?: string; theme?: string; seed?: number; design: string; files: string[]; draws: string[]; leftOut: string[]; pictures: string[]; warnings: string[] }[] = [];
	for (const a of r.ads) {
		const design = `${base(a)}.design.json`;
		writeFileSync(design, docText(a.doc));
		listed.push(basename(design));
		const written: string[] = [];
		for (const f of formats) {
			const data = a.files[f];
			if (!data) continue;
			writeFileSync(`${base(a)}.${f}`, data);
			listed.push(basename(`${base(a)}.${f}`));
			written.push(show(cwd, `${base(a)}.${f}`));
		}
		files.push({ size: a.size, n: a.n, layout: a.layout, alternate: a.alternate, theme: a.theme, seed: a.seed, design: show(cwd, design), files: written, draws: a.draws, leftOut: a.leftOut, pictures: a.pictures, warnings: a.findings.map((f) => f.message) });
	}
	const sheetPath = join(outDir, 'sheet.png');
	writeFileSync(sheetPath, sheet);
	const json = { ok: true, brief: brief.name ?? name, goal: r.goal, sizes: r.sizes, sheet: show(cwd, sheetPath), ads: files, skipped: r.skipped, unchecked: r.unchecked, sampled: r.sampled };
	const lines = [
		...r.sizes.flatMap((s) => [`${s}:`, ...files.filter((f) => f.size === s).map((f) => `  ${f.design}  ${f.layout}${f.alternate ? ` ${f.alternate}` : ''}${f.theme && f.theme !== 'black' ? `, ${f.theme}` : ''}${f.leftOut.length ? `  (leaves out ${f.leftOut.join(', ')})` : ''}${f.warnings.length ? `\n    warning: ${f.warnings.join(' ')}` : ''}`)]),
		`Sheet: ${show(cwd, sheetPath)}`,
		...(r.sampled.length ? [`note: sample copy (Acme) fills ${r.sampled.join(', ')}.`] : []),
		...r.unchecked.map((u) => `check by eye: ${u}`),
		`Look at the sheet, then change one: ${brand().bin} design revise ${files[0]!.design} "bigger headline".`,
	];
	writeFileSync(manifestPath, `${JSON.stringify({ ...json, written: listed }, null, '\t')}\n`);
	return { json, text: lines.join('\n') };
}

function formatsOf(v: unknown): Format[] {
	if (v === undefined) return ['png'];
	if (typeof v !== 'string' || !v.trim()) throw new Error('--format takes png, jpg or webp, several with commas.');
	const out = new Set<Format>(['png']);
	for (const s of v.split(',')) {
		const f = s.trim().toLowerCase().replace(/^jpeg$/, 'jpg') as Format;
		if (!FORMATS.includes(f)) throw new Error(`--format takes png, jpg or webp, not ${s.trim()}. Ads are pictures; PNG is always written.`);
		out.add(f);
	}
	return FORMATS.filter((f) => out.has(f));
}

const show = (cwd: string, p: string) => {
	const r = relative(cwd, p);
	return r && !r.startsWith('..') ? r : p;
};

function wrap(text: string, max: number): string[] {
	const out: string[] = [];
	let line = '';
	for (const w of text.split(/\s+/)) {
		if (line && line.length + 1 + w.length > max) {
			out.push(line);
			line = w;
		} else line = line ? `${line} ${w}` : w;
	}
	if (line) out.push(line);
	return out;
}

function readStdin(): Promise<string> {
	return new Promise((done) => {
		if (process.stdin.isTTY) return done('');
		let data = '';
		process.stdin.setEncoding('utf8');
		process.stdin.on('data', (c) => (data += c));
		process.stdin.on('end', () => done(data));
	});
}
