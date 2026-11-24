import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { brand, tokens } from '../src/lib/brand.js';
import { illustrate, illustrateData, LIGHT_FRAMES, shaderSettings, STYLES, subjectShape } from '../src/illustrate/build.js';
import { subjectRect } from '../src/illustrate/shader.js';
import { runIllustrate } from '../src/commands/illustrate.js';
import { runFigma } from '../src/commands/figma.js';
import { figmaTokens, figmaTokenScripts } from '../src/figma/tokens.js';
import { checkFigmaValues } from '../src/figma/check.js';
import { fontsOf, figmaSvg, parseFigmaUrl } from '../src/figma/push.js';
import { manifest } from '../src/commands/manifest.js';

const bin = join(__dirname, '..', 'bin.js');
const sha = (data: string | Buffer) => createHash('sha256').update(data).digest('hex').slice(0, 16);
const pngSize = (png: Buffer) => ({ width: png.readUInt32BE(16), height: png.readUInt32BE(20) });
const tmp = () => mkdtempSync(join(tmpdir(), 'ds-ill-'));
const fails = (args: string[]) => {
	const r = spawnSync('node', [bin, ...args], { encoding: 'utf8' });
	return { status: r.status, err: r.stderr };
};
/** A 64 by 48 picture: a white disc on a flat gray ground (a cut-out to key, and a photo to split). */
async function picture(): Promise<Buffer> {
	const { Resvg } = await import('@resvg/resvg-js');
	return Buffer.from(new Resvg('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="48"><rect width="64" height="48" fill="#808080"/><circle cx="32" cy="24" r="14" fill="#ffffff"/></svg>').render().asPng());
}

describe('illustrate', () => {
	it('has every style with a source, and every look color is a brand token', () => {
		const d = illustrateData();
		expect(STYLES()).toEqual(['pattern', 'light', 'texture', 'split', 'shader']);
		for (const s of Object.values(d.styles)) expect(s.from).toMatch(/\S/);
		for (const s of Object.values(d.subjects)) expect(s.from).toMatch(/\S/);
		const t = tokens();
		for (const [id, look] of Object.entries(d.shader.looks)) for (const [, c] of [...look.trail, ...look.split]) expect(t[`--ds-color-${c}`], `${id} ${c}`).toBeDefined();
		for (const c of [...d.shader.colors.edge, d.shader.colors.ink, ...d.shader.colors.tileDark, ...d.shader.colors.tileLight]) expect(t[`--ds-color-${c}`], c).toBeDefined();
		// The spectrum look runs the brand spectrum in its order.
		expect(d.shader.looks.spectrum!.trail.map(([, c]) => c)).toEqual(['magenta', 'red', 'orange', 'yellow', 'green', 'cyan', 'blue']);
	});

	it('draws every style at its size, deterministic per seed (output hashes)', async () => {
		const photo = { mime: 'image/png', data: await picture() };
		const jobs = [
			{ style: 'pattern' as const }, { style: 'texture' as const }, { style: 'split' as const, photo },
			...Object.keys(LIGHT_FRAMES).map((variant) => ({ style: 'light' as const, variant })),
			{ style: 'shader' as const, subject: 'lockup' }, { style: 'shader' as const, subject: 'wave', preset: 'glass-split' },
			{ style: 'shader' as const, photo, set: { effect: 'burst' } },
		];
		for (const job of jobs) {
			const a = await illustrate({ ...job, seed: 3 });
			const b = await illustrate({ ...job, seed: 3 });
			expect(sha(a.png), JSON.stringify(job.style)).toBe(sha(b.png));
			expect(sha(a.svg)).toBe(sha(b.svg));
			expect(pngSize(a.png)).toEqual({ width: a.width, height: a.height });
			expect(a.svg).toMatch(/^<\?xml[\s\S]*<svg[^>]*width="\d+"/);
		}
		expect((await illustrate({ style: 'light', variant: 'band' })).width).toBe(1080);
		expect((await illustrate({ style: 'split', photo })).width).toBe(1080);
		// Seeds move a generated light and the grain.
		const g1 = await illustrate({ style: 'pattern', source: 'generated', seed: 1 });
		const g2 = await illustrate({ style: 'pattern', source: 'generated', seed: 2 });
		expect(sha(g1.png)).not.toBe(sha(g2.png));
		const s1 = await illustrate({ style: 'shader', subject: 'mark', preset: 'burst', seed: 1 });
		const s2 = await illustrate({ style: 'shader', subject: 'mark', preset: 'burst', seed: 2 });
		expect(sha(s1.png)).not.toBe(sha(s2.png));
	});

	it('keeps the subject on top: the logomark stays White in the middle of a glass icon', async () => {
		const r = await illustrate({ style: 'shader', subject: 'mark', preset: 'glass-icon', set: { grain: '0' } });
		expect(r.vector).toBe(true);
		expect(r.svg).toMatch(/<svg id="subject"[^>]*>[\s\S]*fill="#FFFFFF"/);
		// The vector subject and the light picture are both in the file.
		expect(r.svg).toMatch(/<image id="light" href="data:image\/png;base64,/);
	});

	it('draws the logo subjects above their minimum heights in every preset', () => {
		const spec = brand().logo!;
		const d = illustrateData();
		for (const preset of Object.keys(d.shader.presets)) {
			const { settings } = shaderSettings({ preset });
			for (const [subject, lockup] of [['lockup', 'horizontal'], ['mark', 'mark']] as const) {
				const s = subjectShape(subject);
				const r = subjectRect(settings, s.vw / s.vh);
				expect(r.h, `${preset} ${subject}`).toBeGreaterThanOrEqual(spec.minHeight[lockup]!);
			}
		}
	});

	it('refuses what a style does not take, and unknown names exit 1 with suggestions', async () => {
		await expect(illustrate({ style: 'texture', subject: 'mark' })).rejects.toThrow(/draws no subject/);
		await expect(illustrate({ style: 'split' })).rejects.toThrow(/needs a picture/);
		await expect(illustrate({ style: 'shader', set: { copies: '99' } })).rejects.toThrow(/3 to 32/);
		await expect(illustrate({ style: 'shader', set: { look: 'prism' } })).rejects.toThrow(/Unknown look/);
		for (const [args, re] of [
			[['illustrate', 'patern'], /Did you mean `pattern`/],
			[['illustrate', 'shader', 'mak'], /Did you mean `mark`/],
			[['illustrate', 'shader', '--preset', 'bust'], /Did you mean `burst`/],
			[['illustrate', 'light', '--variant', 'strip'], /strip-left/],
			[['illustrate', 'shader', '--set', 'glw=3'], /Unknown setting `glw`/],
			[['illustrat'], /Did you mean `illustrate`/],
		] as const) {
			const r = fails([...args]);
			expect(r.status, args.join(' ')).toBe(1);
			expect(r.err).toMatch(re);
		}
	});

	it('writes files from the command, one named file or a directory', async () => {
		const dir = tmp();
		const one = await runIllustrate(dir, ['light'], { variant: 'tile', out: 'tile.png' });
		expect((one.json as { files: unknown[] }).files).toHaveLength(1);
		expect(pngSize(readFileSync(join(dir, 'tile.png')))).toEqual({ width: 200, height: 200 });
		await runIllustrate(dir, ['shader', 'orb'], { preset: 'burst', width: '400', height: '400' });
		expect(existsSync(join(dir, 'illustrations', 'shader-orb-burst-0.png'))).toBe(true);
		expect(existsSync(join(dir, 'illustrations', 'shader-orb-burst-0.svg'))).toBe(true);
		const list = await runIllustrate(dir, [], { list: true });
		expect((list.json as { presets: { id: string }[] }).presets.map((p) => p.id)).toContain('glass-icon');
	});
});

describe('figma', () => {
	it('turns the tokens into variables with both themes, in scripts under the tool limit', () => {
		const doc = figmaTokens();
		expect(doc.modes).toEqual(['Dark', 'Light']);
		const surface = doc.variables.find((v) => v.css === '--ds-color-surface')!;
		expect(surface.values).toEqual([[0, 0, 0, 1], [1, 1, 1, 1]]);
		expect(doc.variables.find((v) => v.css === '--ds-font-heading')!.values[0]).toBe('Funnel Display');
		expect(doc.variables.find((v) => v.css === '--ds-color-scrim')!.values[0]).toEqual([0, 0, 0, 0.72]);
		const scripts = figmaTokenScripts(doc);
		for (const s of scripts) expect(s.length).toBeLessThanOrEqual(45000);
		expect(scripts.join('')).toContain('"Spyglass tokens"'.replace('Spyglass', brand().name));
	});

	it('checks Figma values against the tokens, naming the nearest one', () => {
		const found = checkFigmaValues('<div className="bg-[#1B1DFF] text-[#ff7ad9] rounded-[10px] font-[Inter] text-[24px]"/>');
		expect(found.find((f) => f.value === '#1B1DFF')).toMatchObject({ ok: true, token: '--ds-color-blue' });
		expect(found.find((f) => f.value === '#ff7ad9')).toMatchObject({ ok: false, nearest: '--ds-color-magenta-10' });
		expect(found.find((f) => f.kind === 'font')).toMatchObject({ ok: false });
		expect(found.find((f) => f.kind === 'radius')).toMatchObject({ ok: true });
		const vars = checkFigmaValues(JSON.stringify({ Ground: '#000000', Card: '#171717' }));
		expect(vars.every((f) => f.ok)).toBe(true);
	});

	it('pushes an image as an import script with its fonts, and exits 1 on off-brand values', async () => {
		const dir = tmp();
		const svg = '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><defs><style type="text/css"><![CDATA[@font-face{font-family:"DM Sans";src:url(data:x)}]]></style></defs><text font-family="\'DM Sans\'" font-weight="500">A</text><text font-family="\'Funnel Display\'" font-weight="400">B</text></svg>';
		writeFileSync(join(dir, 'a.svg'), svg);
		expect(fontsOf(svg)).toEqual([['DM Sans', 'Medium'], ['Funnel Display', 'Regular']]);
		expect(figmaSvg(svg)).not.toMatch(/@font-face|<\?xml/);
		const r = await runFigma(dir, ['push', 'asset', 'a.svg'], { file: 'KEY' });
		const doc = r.json as { files: string[]; steps: { tool: string }[] };
		expect(doc.steps.map((s) => s.tool)).toEqual(['create_session', 'use_figma', 'upload_assets', 'get_screenshot']);
		expect(readFileSync(join(dir, 'figma', 'push-a.js'), 'utf8')).toContain('loadFontAsync');
		const ill = await runFigma(dir, ['push', 'illustration', 'shader', 'mark'], { preset: 'glass-icon', file: 'KEY' });
		expect((ill.json as { files: string[] }).files.some((f) => f.endsWith('.png'))).toBe(true);
		expect(parseFigmaUrl('https://www.figma.com/design/Qx2i6GhXZD1V4O7RE7hYQi/x?node-id=966-4421')).toEqual({ fileKey: 'Qx2i6GhXZD1V4O7RE7hYQi', nodeId: '966:4421', kind: 'design' });
		writeFileSync(join(dir, 'd.txt'), 'text-[#ff7ad9]');
		expect(fails(['figma', 'check', join(dir, 'd.txt')]).status).toBe(1);
		writeFileSync(join(dir, 'ok.txt'), 'bg-[#000000]');
		expect(spawnSync('node', [bin, 'figma', 'check', join(dir, 'ok.txt')]).status).toBe(0);
		const bad = fails(['figma', 'pusj']);
		expect(bad.status).toBe(1);
		expect(bad.err).toMatch(/Did you mean `push`/);
	});
});

describe('manifest', () => {
	it('lists illustrate and figma with their names', async () => {
		const doc = (await manifest()) as { commands: { name: string }[]; illustrate: { styles: { id: string }[]; presets: unknown[]; subjects: unknown[] }; figma: { actions: string[]; callsFigma: boolean } };
		expect(doc.commands.map((c) => c.name)).toEqual(expect.arrayContaining(['illustrate', 'figma']));
		expect(doc.illustrate.styles.map((s) => s.id)).toEqual(STYLES());
		expect(doc.figma.actions).toEqual(['tokens', 'push', 'pull', 'check']);
		expect(doc.figma.callsFigma).toBe(false);
	});
});
