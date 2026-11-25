import { copyFileSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseBrief, parseLook, sizesFor, withImages } from '../src/assets/brief.js';
import { goalOf, validateBrief } from '../src/assets/ads.js';
import { runAd } from '../src/commands/ad.js';
import { adapter } from '../src/design/adapter.js';
import { checkDesign, errorsOf, infoFor, parseDoc } from '../src/design/index.js';

// `ad`: the brief format, the exact missing-field errors, the platform to size map, and whole runs that are the same
// bytes twice and pass the brand check file by file.

const root = join(import.meta.dirname, '..');
const md = (s: string) => s.replace(/^\t+/gm, '');

describe('brief parsing', () => {
	it('reads Markdown sections, keeps copy whole and takes off one pair of outer quotes', () => {
		const b = parseBrief(md(`# Spring launch
			<!-- a comment -->
			## Goal
			Launch Boards.
			## Platforms
			- LinkedIn
			- Instagram story
			## Headline
			"Boards are here."
			## Supporting line
			Save the ads your market runs,
			and share them.
			## CTA
			Try Boards
			## Features
			- Every network
			- Daily updates
			## Look
			dark, bold, type-led, brand light, ASCII
			## Images
			- shot.png: the Acme dashboard
			- creative=ad1.jpg: an Acme ad
			## Must-haves
			- the price
			## Don'ts
			- no texture
		`));
		expect(b.name).toBe('Spring launch');
		expect(b.goal).toBe('Launch Boards.');
		expect(b.platforms).toEqual(['LinkedIn', 'Instagram story']);
		expect(b.copy).toMatchObject({ headline: 'Boards are here.', supporting: 'Save the ads your market runs, and share them.', cta: 'Try Boards', features: 'Every network | Daily updates' });
		expect(b.look).toEqual({ tone: 'dark', style: 'bold', lead: 'type', elements: ['light', 'ascii'] });
		expect(b.images).toEqual([{ name: 'shot', file: 'shot.png', shows: 'the Acme dashboard', kind: 'screenshot' }, { name: 'creative', file: 'ad1.jpg', shows: 'an Acme ad', kind: 'creative' }]);
		expect(b.must).toEqual(['the price']);
		expect(b.donts).toEqual(['no texture']);
	});

	it('reads Key: value lines and JSON with the same names', () => {
		const a = parseBrief('Goal: Hiring\nPlatforms: X, LinkedIn\nHeadline: Join us.\nCTA: See the role\n');
		expect(a).toMatchObject({ goal: 'Hiring', platforms: ['X', 'LinkedIn'], copy: { headline: 'Join us.', cta: 'See the role' } });
		const j = parseBrief(JSON.stringify({ goal: 'Hiring', platforms: ['X'], headline: 'Join us.', callToAction: 'See the role', look: { tone: 'light theme' }, images: [{ file: 'a.png', shows: 'a photo' }] }));
		expect(j).toMatchObject({ goal: 'Hiring', platforms: ['X'], copy: { headline: 'Join us.', cta: 'See the role' }, look: { tone: 'light' }, images: [{ file: 'a.png', kind: 'photo' }] });
	});

	it('refuses an unknown section, a second one, text outside one, and words of the look it does not read', () => {
		expect(() => parseBrief('## Headline\nHi\n## Vibes\nfun')).toThrow(/line 3: unknown section "Vibes". Sections: Name, Goal/);
		expect(() => parseBrief('## Headline\nHi\n## Title\nAgain')).toThrow(/second Headline section/);
		expect(() => parseBrief('Some words\n## Headline\nHi')).toThrow(/line 1: "Some words" is outside a section/);
		expect(() => parseLook('dark, sparkly')).toThrow(/"sparkly" is not a look/);
		expect(() => parseLook('light')).toThrow(/could mean the light theme or the brand light/);
		expect(() => parseBrief('{"headline": 3}')).toThrow(/"headline" takes text/);
		expect(() => parseBrief('## Images\n- a photo of us')).toThrow(/names no PNG, JPEG or WebP/);
	});

	it('takes --image name=file beside the brief, replacing a picture of the same name', () => {
		const b = withImages(parseBrief('## Images\n- shot.png: the product UI'), ['shot=new.png', 'photo=team.jpg']);
		expect(b.images.map((i) => [i.name, i.file, i.kind])).toEqual([['shot', 'new.png', 'screenshot'], ['photo', 'team.jpg', 'photo']]);
		expect(() => withImages(b, ['shot=notes.txt'])).toThrow(/--image takes name=file.png/);
	});
});

describe('missing fields', () => {
	const base = 'Goal: Launch Boards\nPlatforms: LinkedIn\n';
	it('names exactly the fields that are missing, with their headings', () => {
		expect(() => validateBrief(parseBrief('Headline: Hi\n'))).toThrow(/^The brief is missing goal \(## Goal\), platforms \(## Platforms\), cta \(## CTA\)\./);
		expect(() => validateBrief(parseBrief(base))).toThrow(/^The brief is missing headline \(## Headline\), cta \(## CTA\)\. Every word/);
		expect(() => validateBrief(parseBrief(`${base}Headline: Hi\n`))).toThrow(/^The brief is missing cta \(## CTA\)\./);
		// An offer needs the offer; a must-have names a field it then needs; a customer story needs the quote.
		expect(() => validateBrief(parseBrief('Goal: A price offer\nPlatforms: X\nHeadline: Hi\nCTA: Go\n'))).toThrow(/missing offer \(## Offer\)\./);
		expect(() => validateBrief(parseBrief(`${base}Headline: Hi\nCTA: Go\n## Must-haves\n- the supporting line\n`))).toThrow(/missing supporting \(## Supporting line\)\./);
		expect(() => validateBrief(parseBrief('Goal: A customer story\nPlatforms: X\nCTA: Read\n'))).toThrow(/missing quote \(## Quote\)\./);
	});

	it('fills only the missing copy with sample copy under --sample, and never pictures', () => {
		const r = validateBrief(parseBrief(`${base}Headline: Boards are here.\n`), { sample: true });
		expect(r.brief.copy.headline).toBe('Boards are here.');
		expect(r.sampled).toEqual(['cta']);
		expect(() => validateBrief(parseBrief(`${base}Headline: Hi\nCTA: Go\nLook: picture-led\n`), { sample: true })).toThrow(/picture-led but the brief has no pictures/);
	});

	it('reads the goal from its words', () => {
		expect(goalOf('Launch Boards')).toBe('launch');
		expect(goalOf('Sell the plan at a discount')).toBe('offer');
		expect(goalOf('Hiring a designer')).toBe('hiring');
		expect(goalOf('A customer story')).toBe('story');
		expect(goalOf('Something else')).toBe('awareness');
	});
});

describe('platforms to sizes', () => {
	it('maps each platform to the size ids, in order, each once', () => {
		expect(sizesFor(['X']).sizes).toEqual(['landscape']);
		expect(sizesFor(['LinkedIn', 'Instagram feed', 'Instagram portrait', 'Instagram story', 'Facebook', 'TikTok cover']).sizes).toEqual(['linkedin', 'square', 'portrait', 'story', 'facebook']);
		expect(sizesFor(['Google display']).sizes).toEqual(['ad-300x250', 'ad-336x280', 'ad-728x90', 'ad-300x600', 'ad-320x50', 'ad-160x600', 'ad-970x250']);
		expect(sizesFor(['all social', 'X']).sizes).toEqual(['landscape', 'linkedin', 'square', 'portrait', 'story', 'facebook']);
		expect(sizesFor(['ad-300x250', 'pinterest']).sizes).toEqual(['ad-300x250', 'pinterest']);
		expect(() => sizesFor(['Myspace'])).toThrow(/Unknown platform: "Myspace". Name All social, X post/);
	});
});

describe('ad runs', () => {
	const brief = md(`# Test
		Goal: Launch Boards
		Platforms: Instagram feed, Google display
		Headline: Boards are here.
		Supporting line: Save the ads your market runs.
		CTA: Try Boards
		Look: dark, type-led
	`);
	const pngs = (dir: string) => readdirSync(dir).filter((f) => f.endsWith('.png')).sort();

	it('writes the same bytes twice, every design passes the check on its own, and design files open as designs', { timeout: 300_000 }, async () => {
		const dir = mkdtempSync(join(tmpdir(), 'ads-'));
		writeFileSync(join(dir, 'brief.md'), brief);
		const r1 = await runAd(dir, ['brief.md'], { out: 'one' });
		const json = r1.json as { ads: { size: string; design: string; files: string[] }[]; sheet: string };
		// Two sizes per platform pick, 2 to 4 per size, and a sheet.
		const sizes = [...new Set(json.ads.map((a) => a.size))];
		expect(sizes).toEqual(['square', 'ad-300x250', 'ad-336x280', 'ad-728x90', 'ad-300x600', 'ad-320x50', 'ad-160x600', 'ad-970x250']);
		for (const s of sizes) expect(json.ads.filter((a) => a.size === s).length).toBeGreaterThanOrEqual(2);
		const first = pngs(join(dir, 'one')).map((f) => readFileSync(join(dir, 'one', f)));
		await runAd(dir, ['brief.md'], { out: 'one', force: true });
		expect(pngs(join(dir, 'one')).map((f) => readFileSync(join(dir, 'one', f)))).toEqual(first);
		const ad = adapter();
		for (const a of json.ads) {
			const doc = parseDoc(readFileSync(join(dir, a.design), 'utf8'), ad);
			const r = await ad.render(doc, join(dir, 'one'), { formats: ['png'], scale: 1 });
			expect(errorsOf(checkDesign({ doc, info: infoFor(ad, doc), layers: r.layers, adapter: ad, png: r.files.png })), a.design).toEqual([]);
			// Only the brief's words: nothing in the copy that the brief did not say.
			for (const v of Object.values(doc.copy)) expect(brief, a.design).toContain(v);
		}
	});

	it('refuses to write over an earlier set without --force, and draws pictures only from the brief', { timeout: 300_000 }, async () => {
		const dir = mkdtempSync(join(tmpdir(), 'ads-pic-'));
		copyFileSync(join(root, 'test', 'design', 'picture.jpg'), join(dir, 'photo.jpg'));
		writeFileSync(join(dir, 'brief.md'), 'Goal: Launch Boards\nPlatforms: Instagram feed\nHeadline: Boards are here.\nCTA: Try Boards\nLook: picture-led\n');
		await expect(runAd(dir, ['brief.md'], {})).rejects.toThrow(/picture-led but the brief has no pictures/);
		const r = await runAd(dir, ['brief.md'], { image: ['photo=photo.jpg'], variants: '2' });
		const ads = (r.json as { ads: { layout: string; pictures: string[] }[] }).ads;
		expect(ads.length).toBe(2);
		expect(ads.some((a) => a.pictures.includes('photo'))).toBe(true);
		await expect(runAd(dir, ['brief.md'], { image: ['photo=photo.jpg'], variants: '2' })).rejects.toThrow(/already exist.*--force/);
		await expect(runAd(dir, ['brief.md'], { variants: '5' })).rejects.toThrow(/--variants takes 2, 3 or 4/);
	});

	it('reads the brief on stdin', async () => {
		const dir = mkdtempSync(join(tmpdir(), 'ads-stdin-'));
		await expect(runAd(dir, ['-'], {}, async () => 'Goal: Launch\nPlatforms: X\n')).rejects.toThrow(/missing headline \(## Headline\), cta \(## CTA\)/);
	});

	it('every example brief in brand/briefs is complete', () => {
		const dir = join(root, 'brand', 'briefs');
		const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
		expect(files.length).toBeGreaterThanOrEqual(3);
		for (const f of files) expect(() => validateBrief(parseBrief(readFileSync(join(dir, f), 'utf8'), f)), f).not.toThrow();
	});
});
