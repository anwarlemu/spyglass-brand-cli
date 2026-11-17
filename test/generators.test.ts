import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

// The brand light and the ASCII texture as the CLI and the templates run them (build/generators, bundled from
// registry/lib/light.ts and ascii.ts by the build): deterministic, seeded, and true to the brand's own windows.

const root = join(__dirname, '..');
const bin = join(root, 'bin.js');
type Light = typeof import('../registry/lib/light.ts');
type Ascii = typeof import('../registry/lib/ascii.ts');
const light = (await import(pathToFileURL(join(root, 'build/generators/light.mjs')).href)) as Light;
const ascii = (await import(pathToFileURL(join(root, 'build/generators/ascii.mjs')).href)) as Ascii;
const brand = JSON.parse(readFileSync(join(root, 'brand/brand.json'), 'utf8'));

describe('the brand light', () => {
	it('draws the same light for the same options, and another for another seed, in every variant and source', () => {
		for (const variant of light.LIGHT_VARIANTS) {
			for (const source of ['brand', 'generated'] as const) {
				const a = light.lightSvg({ width: 540, height: 300, variant, seed: 7, source });
				expect(light.lightSvg({ width: 540, height: 300, variant, seed: 7, source }), `${variant} ${source}`).toBe(a);
				expect(a).toContain('mix-blend-mode:plus-lighter');
				expect(a).toContain('fill-rule="evenodd"');
				if (variant !== 'curved-strip' && source === 'generated') expect(light.lightSvg({ width: 540, height: 300, variant, seed: 8, source }), variant).not.toBe(a);
			}
		}
	});
	it('uses the three layers and their opacities from brand.json: Blue, Green and Red, shifted 0, 1 and 2 offsets', () => {
		expect(light.LIGHT_LAYERS.map((l) => [l.color, l.opacity, l.shift])).toEqual(brand.light.layers.map((l: { color: string; opacity: number; shift: number }) => [l.color, l.opacity, l.shift]));
		expect(light.LIGHT_OFFSET).toBe(brand.light.offset);
		expect(light.LIGHT_BLUR).toBe(brand.light.blur);
		const g = light.lightGeometry({ width: 1080, height: 200.291, variant: 'band', seed: 0 });
		// The Agents post's band: the heat map 2860.3 wide in a 1080 frame, so 43.5px between layers and a 7.7px blur.
		expect(g.offset).toBeCloseTo(2860.331 * light.LIGHT_OFFSET, 1);
		expect(g.blur).toBeCloseTo(2860.331 * light.LIGHT_BLUR, 1);
	});
	it("reproduces the brand assets' own windows for seeds below their count, and moves them only a little past it", () => {
		// Post, Offer: the heat map frame at (-533, -33), its vector 1725.57 wide, in a 1080 by 1080 window.
		const w = light.lightWindow('corner', 0, 1080, 1080);
		expect(w.from).toBe('Post, Offer');
		expect(w.x).toBeCloseTo(533 / 1725.57, 3);
		expect(w.y).toBeCloseTo(33 / 1725.57, 3);
		expect(w.w).toBeCloseTo(1080 / 1725.57, 4);
		expect(light.lightWindow('strip-left', 0, 160, 1080).from).toBe('Post, Every market (left)');
		expect(light.lightWindow('tile', 4, 200, 200).from).toBe('Post, Any brand or creator');
		const moved = light.lightWindow('corner', 2, 1080, 1080); // the same window (2 mod 2), moved
		expect(Math.abs(moved.w - w.w) / w.w).toBeLessThan(0.1);
	});
	it('the filter blend (for rasterizers) and the CSS blend draw the same shape and offsets', () => {
		const css = light.lightSvg({ width: 400, height: 400, variant: 'tile', seed: 1 });
		const filter = light.lightSvg({ width: 400, height: 400, variant: 'tile', seed: 1, blend: 'filter' });
		const d = (svg: string) => svg.match(/ d="([^"]+)"/)![1];
		expect(d(filter)).toBe(d(css));
		expect(filter).toContain('operator="arithmetic"');
		expect(filter).not.toContain('plus-lighter');
	});
	it('refuses a variant it does not have and an empty frame', () => {
		expect(() => light.lightGeometry({ width: 100, height: 100, variant: 'spiral' as never })).toThrow(/Unknown light variant/);
		expect(() => light.lightGeometry({ width: 0, height: 100 })).toThrow(/width and a height/);
	});
});

describe('the ASCII texture', () => {
	it('writes the same characters for the same seed, only from the ramp, and keeps clear areas empty', () => {
		const a = ascii.asciiLines({ cols: 120, rows: 60, seed: 4 });
		expect(ascii.asciiLines({ cols: 120, rows: 60, seed: 4 })).toEqual(a);
		expect(ascii.asciiLines({ cols: 120, rows: 60, seed: 5 })).not.toEqual(a);
		expect(a).toHaveLength(60);
		const text = a.join('');
		expect(text.trim().length).toBeGreaterThan(0);
		for (const ch of new Set(text)) expect(ascii.ASCII_RAMP.includes(ch) || ch === ' ', JSON.stringify(ch)).toBe(true);
		const cleared = ascii.asciiLines({ cols: 120, rows: 60, seed: 4, clear: [{ x: 0, y: 0, w: 120, h: 60 }] });
		expect(cleared.join('').replace(/[\s ]/g, '')).toBe('');
	});
	it('sets Geist Mono at the canvas size and opacity from brand.json', () => {
		expect(ascii.ASCII_RAMP).toBe(brand.ascii.ramp);
		expect(ascii.ASCII_FONT.size).toBe(brand.ascii.size);
		expect(ascii.ASCII_FONT.opacity).toBe(brand.ascii.opacity);
		const grid = ascii.asciiGrid(1080, 1080);
		expect([grid.cols, grid.rows]).toEqual([Math.ceil(1080 / (13.333 * 0.6)), Math.ceil(1080 / (13.333 * 1.2))]);
		const svg = ascii.asciiSvg({ width: 1080, height: 1080, seed: 4 });
		expect(svg).toContain('fill-opacity="0.35"');
		expect(svg).toContain('Geist Mono');
	});
});

describe('light and ascii from the command line', () => {
	const run = (cwd: string, ...args: string[]) => execFileSync('node', [bin, ...args, '--cwd', cwd], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
	it('writes the same SVG twice and a PNG of the frame size', () => {
		const dir = mkdtempSync(join(tmpdir(), 'spyglass-light-'));
		run(dir, 'light', '--variant', 'band', '--seed', '1', '--out', 'a.svg');
		run(dir, 'light', '--variant', 'band', '--seed', '1', '--out', 'b.svg');
		expect(readFileSync(join(dir, 'a.svg'), 'utf8')).toBe(readFileSync(join(dir, 'b.svg'), 'utf8'));
		const r = JSON.parse(run(dir, 'light', '--variant', 'corner', '--format', 'png', '--width', '540', '--height', '540', '--out', 'c.png', '--json'));
		expect(r).toMatchObject({ variant: 'corner', source: 'brand', seed: 0, width: 540, height: 540, format: 'png' });
		expect(r.from).toContain('Post, Offer');
		const png = readFileSync(join(dir, 'c.png'));
		expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([540, 540]);
		run(dir, 'ascii', '--seed', '4', '--out', 't.svg');
		run(dir, 'ascii', '--seed', '4', '--out', 'u.svg');
		expect(readFileSync(join(dir, 't.svg'), 'utf8')).toBe(readFileSync(join(dir, 'u.svg'), 'utf8'));
		const list = JSON.parse(run(dir, 'light', '--list', '--json'));
		expect(list.variants.map((v: { variant: string }) => v.variant)).toEqual(light.LIGHT_VARIANTS);
	});
	it('exits 1 on an unknown variant, with the closest name, and on a bad option', () => {
		const dir = mkdtempSync(join(tmpdir(), 'spyglass-light-'));
		const fail = (...args: string[]) => {
			try {
				run(dir, ...args);
			} catch (e) {
				return { code: (e as { status: number }).status, err: (e as { stderr: string }).stderr };
			}
			return { code: 0, err: '' };
		};
		const bad = fail('light', '--variant', 'bandd');
		expect(bad.code).toBe(1);
		expect(bad.err).toContain('Unknown variant `bandd`');
		expect(bad.err).toContain('Did you mean band?');
		expect(fail('light', '--source', 'stock').err).toContain('--source takes brand or generated');
		expect(fail('ascii', '--density', '2').err).toContain('--density takes 0 to 1');
		expect(fail('light', '--nope').err).toContain('Unknown option');
	});
});
