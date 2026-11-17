import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inflateSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { runImage } from '../src/commands/image.js';
import { pngSize, renderImages, resolveRequest } from '../src/image/render.js';
import { SIZES, TEMPLATES, theme } from '../src/image/spec.js';

const bin = join(__dirname, '..', 'bin.js');
const root = join(__dirname, '..');

const copy: Record<string, { title: string; text?: string; eyebrow?: string; by?: string }> = {
	headline: { title: 'Context that stays current' },
	statement: { title: 'The right context, on every call', text: 'Store it, keep it current, and hand it to the model.', eyebrow: 'Context' },
	quote: { title: 'Search should return the passage, not the folder.', by: 'Acme platform' },
	announcement: { title: 'Sources sync themselves', text: 'Connect a source once.', eyebrow: 'Now shipping' },
	frame: { title: 'See what came back', text: 'Every result shows its source.' },
};

const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

describe('image', () => {
	it('names every template and the four sizes', () => {
		expect(TEMPLATES.map((t) => t.id)).toEqual(['headline', 'statement', 'quote', 'announcement', 'frame']);
		expect(SIZES.map((s) => [s.id, s.width, s.height])).toEqual([
			['og', 1200, 630],
			['square', 1080, 1080],
			['portrait', 1080, 1350],
			['landscape', 1200, 675],
		]);
		expect(resolveRequest({ size: 'all' }).sizes).toEqual(['og', 'square', 'portrait', 'landscape']);
		expect(resolveRequest({ size: '1200x630,1080×1080' }).sizes).toEqual(['og', 'square']);
	});

	it('renders every template at every size with the right dimensions', async () => {
		const mark = readFileSync(join(root, 'brand/logo/svg/mark.svg'), 'utf8');
		const pathStart = /d="([^"]{12})/.exec(mark)?.[1];
		for (const template of TEMPLATES) {
			for (const size of SIZES) {
				const [image] = await renderImages({ template: template.id, sizes: [size.id], ground: 'paper', format: 'both', ...copy[template.id] });
				expect(pngSize(image.png), `${template.id} ${size.id}`).toEqual({ width: size.width, height: size.height });
				expect(image.svg).toContain(`width="${size.width}"`);
				expect(image.svg).toContain(`height="${size.height}"`);
				expect(image.svg).toContain(theme('paper').bg);
				expect(image.svg).toContain('font/woff2');
				expect(image.svg).toContain(pathStart);
				expect(image.svg).toContain(`font-family="'${headingFamily()}'"`);
				expect(aboveFooter(image.svg), `${template.id} ${size.id}`).toBe(true);
			}
		}
	});

	it('renders the off-black ground and stays byte-for-byte stable', async () => {
		const once = await renderImages({ template: 'statement', sizes: ['og'], ground: 'ink', format: 'png', title: 'Keep the source', text: 'Connect it once.' });
		const twice = await renderImages({ template: 'statement', sizes: ['og'], ground: 'ink', format: 'png', title: 'Keep the source', text: 'Connect it once.' });
		expect(once[0].svg).toContain(theme('ink').bg);
		expect(once[0].svg).toContain(theme('ink').fg);
		expect(Buffer.compare(once[0].png, twice[0].png)).toBe(0);
		expect(once[0].svg).toBe(twice[0].svg);
	});

	it('paints the headline stop in the accent and accepts a screenshot', async () => {
		const [card] = await renderImages({ template: 'headline', sizes: ['og'], ground: 'paper', format: 'svg', title: 'Context that stays current' });
		expect(card.svg).toContain(`<tspan fill="${theme('paper').accentText}">.</tspan>`);
		const [quoted] = await renderImages({ template: 'headline', sizes: ['og'], ground: 'paper', format: 'svg', title: '"Acme"' });
		expect(quoted.svg).toContain(`&quot;Acme&quot;<tspan fill="${theme('paper').accentText}">.</tspan>`);
		const [inside] = await renderImages({ template: 'headline', sizes: ['og'], ground: 'paper', format: 'svg', title: 'Say "hello."' });
		expect(inside.svg).toContain(`hello<tspan fill="${theme('paper').accentText}">.</tspan>&quot;`);
		const [ellipsis] = await renderImages({ template: 'headline', sizes: ['og'], ground: 'paper', format: 'svg', title: 'Wait...' });
		expect(ellipsis.svg).not.toContain('<tspan');
		const plain = await renderImages({ template: 'frame', sizes: ['landscape'], ground: 'paper', format: 'png', title: 'What came back' });
		const shot = await renderImages({ template: 'frame', sizes: ['landscape'], ground: 'paper', format: 'png', title: 'What came back', image: { mime: 'image/png', data: tinyPng } });
		expect(pngSize(shot[0].png)).toEqual({ width: 1200, height: 675 });
		expect(Buffer.compare(plain[0].png, shot[0].png)).not.toBe(0);
	});

	it('refuses a missing title, an unknown template and a file that is not a PNG or JPEG', async () => {
		expect(() => resolveRequest({ template: 'poster' })).toThrow(/Unknown template/);
		expect(() => resolveRequest({ size: 'story' })).toThrow(/Unknown size/);
		await expect(runImage(root, [], {})).rejects.toThrow(/title is required/);
		const dir = mkdtempSync(join(tmpdir(), 'ds-image-'));
		await expect(runImage(dir, [], { title: 'Hello', image: 'missing.png' })).rejects.toThrow(/does not use --image/);
		await expect(runImage(dir, [], { template: 'frame', title: 'Hello', image: 'missing.png' })).rejects.toThrow(/No image at/);
		await expect(runImage(dir, [], { template: 'statement', title: 'Hello', by: 'Acme' })).rejects.toThrow(/does not draw --by/);
		await expect(runImage(dir, [], { title: 'Hello', text: 'One line', subtitle: 'Another' })).rejects.toThrow(/disagree/);
		writeFileSync(join(dir, 'notes.txt'), 'not an image');
		await expect(runImage(dir, [], { template: 'frame', title: 'Hello', image: 'notes.txt' })).rejects.toThrow(/PNG or JPEG/);
		await expect(runImage(dir, [], { template: 'headline', title: 'Hello', text: 'Left off the card.' })).rejects.toThrow(/does not draw --text/);
		await expect(runImage(dir, [], { template: 'quote', title: 'Hello', text: 'Not the speaker.' })).rejects.toThrow(/--by/);
		rmSync(dir, { recursive: true, force: true });
	});

	it('keeps a long tag inside the column and a long headline above the footer', async () => {
		const [card] = await renderImages({ template: 'statement', sizes: ['og'], ground: 'paper', format: 'svg', title: 'Every answer should point back at the passage it was taken from, including the one that ran long on purpose', text: 'A supporting line that also goes on so the card has to wrap the subtext several times without running into the footer.', eyebrow: 'M'.repeat(80) });
		expect(aboveFooter(card.svg)).toBe(true);
		const tag = accentRect(card.svg, theme('paper').accent);
		const column = footerRule(card.svg);
		expect(tag.x + tag.w).toBeLessThanOrEqual(column.x + column.w + 0.01);
	});

	it('draws a JPEG inside the frame', async () => {
		const jpeg = Buffer.from('/9j/4AAQSkZJRgABAgAAAQABAAD//gAQTGF2YzYwLjMxLjEwMgD/2wBDAAgEBAQEBAUFBQUFBQYGBgYGBgYGBgYGBgYHBwcICAgHBwcGBgcHCAgICAkJCQgICAgJCQoKCgwMCwsODg4RERT/xABNAAEBAAAAAAAAAAAAAAAAAAAABgEBAQEAAAAAAAAAAAAAAAAAAAYHEAEAAAAAAAAAAAAAAAAAAAAAEQEAAAAAAAAAAAAAAAAAAAAA/8AAEQgAWgCgAwEiAAIRAAMRAP/aAAwDAQACEQMRAD8AiwEo38AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/9k=', 'base64');
		const plain = await renderImages({ template: 'frame', sizes: ['og'], ground: 'paper', format: 'png', title: 'See the shot' });
		const shot = await renderImages({ template: 'frame', sizes: ['og'], ground: 'paper', format: 'png', title: 'See the shot', image: { mime: 'image/jpeg', data: jpeg } });
		expect(shot[0].svg).toContain('image/jpeg');
		const [r, g] = pixel(shot[0].png, 900, 300);
		expect(r).toBeGreaterThan(150);
		expect(g).toBeLessThan(80);
		expect(Buffer.compare(plain[0].png, shot[0].png)).not.toBe(0);
	});

	it('writes PNG and SVG and lists them as JSON from the command', async () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-image-'));
		const out = await runImage(dir, ['square'], { title: 'Context that stays current', text: 'Kept in sync.', json: true });
		const files = (out.json as { files: { path: string; width: number; height: number; format: string }[] }).files;
		expect(files.map((f) => f.format).sort()).toEqual(['png', 'svg']);
		expect(files.every((f) => f.width === 1080 && f.height === 1080)).toBe(true);
		for (const file of files) expect(readFileSync(join(dir, file.path)).length).toBeGreaterThan(500);
		const list = await runImage(dir, ['list'], {});
		expect((list.json as { templates: { id: string }[] }).templates.map((t) => t.id)).toContain('frame');
		rmSync(dir, { recursive: true, force: true });
	});

	it('prints image help and renders from the CLI', () => {
		const help = execFileSync('node', [bin, 'image', '--help'], { encoding: 'utf8' });
		expect(help).toContain('statement');
		expect(help).toContain('1200x630');
		expect(help).toContain('--json');
		const dir = mkdtempSync(join(tmpdir(), 'ds-image-'));
		const raw = execFileSync('node', [bin, 'image', '--cwd', dir, '--title', 'Context that stays current', '--size', 'og', '--format', 'png', '--json'], { encoding: 'utf8' });
		const parsed = JSON.parse(raw);
		expect(parsed.files[0]).toMatchObject({ format: 'png', size: 'og', width: 1200, height: 630 });
		expect(pngSize(readFileSync(join(dir, parsed.files[0].path)))).toEqual({ width: 1200, height: 630 });
		rmSync(dir, { recursive: true, force: true });
	});
});

function headingFamily(): string {
	const brand = JSON.parse(readFileSync(join(root, 'brand/brand.json'), 'utf8')) as { fonts: { files: { role: string; family: string }[] } };
	return brand.fonts.files.find((f) => f.role === 'heading')?.family ?? '';
}

/** Content baselines sit above the footer rule, and the host sits below it. */
function aboveFooter(svg: string): boolean {
	const textYs = [...svg.matchAll(/<text\b[^>]*\sy="([\d.]+)"/g)].map((m) => Number(m[1]));
	const rule = footerRule(svg);
	const content = textYs.filter((y) => y < rule.y);
	const below = textYs.filter((y) => y >= rule.y);
	return content.length > 0 && below.length === 1 && rule.y - Math.max(...content) > 8;
}

function footerRule(svg: string): { x: number; y: number; w: number } {
	const rules = [...svg.matchAll(/<rect\b[^>]*\sx="([\d.]+)"[^>]*\sy="([\d.]+)"[^>]*\swidth="([\d.]+)"[^>]*\sheight="1"/g)].map((m) => ({ x: Number(m[1]), y: Number(m[2]), w: Number(m[3]) }));
	return rules.sort((a, b) => b.w - a.w)[0];
}

function accentRect(svg: string, fill: string): { x: number; w: number } {
	const rects = [...svg.matchAll(new RegExp(`<rect\\b[^>]*\\sx="([\\d.]+)"[^>]*\\swidth="([\\d.]+)"[^>]*\\sfill="${fill}"`, 'g'))];
	const hit = rects.map((m) => ({ x: Number(m[1]), w: Number(m[2]) })).sort((a, b) => b.w - a.w)[0];
	if (!hit) throw new Error('No accent rect.');
	return hit;
}

function pixel(png: Buffer, x: number, y: number): [number, number, number] {
	let pos = 8;
	let width = 0;
	let height = 0;
	let color = 0;
	const idat: Buffer[] = [];
	while (pos < png.length) {
		const n = png.readUInt32BE(pos);
		const typ = png.toString('ascii', pos + 4, pos + 8);
		const chunk = png.subarray(pos + 8, pos + 8 + n);
		pos += 12 + n;
		if (typ === 'IHDR') {
			width = chunk.readUInt32BE(0);
			height = chunk.readUInt32BE(4);
			color = chunk[9];
		} else if (typ === 'IDAT') idat.push(chunk);
		else if (typ === 'IEND') break;
	}
	if (x < 0 || y < 0 || x >= width || y >= height) throw new Error('Pixel is outside the PNG.');
	const raw = inflateSync(Buffer.concat(idat));
	const bpp = color === 2 ? 3 : 4;
	const stride = width * bpp;
	let i = 0;
	let prev = Buffer.alloc(stride);
	let row = Buffer.alloc(stride);
	for (let yy = 0; yy <= y; yy++) {
		const filter = raw[i];
		i += 1;
		const got = Buffer.from(raw.subarray(i, i + stride));
		i += stride;
		row = Buffer.alloc(stride);
		for (let p = 0; p < stride; p++) {
			const a = p >= bpp ? row[p - bpp] : 0;
			const b = prev[p];
			const c = p >= bpp ? prev[p - bpp] : 0;
			let v = got[p];
			if (filter === 1) v += a;
			else if (filter === 2) v += b;
			else if (filter === 3) v += Math.floor((a + b) / 2);
			else if (filter === 4) {
				const pred = a + b - c;
				const pa = Math.abs(pred - a);
				const pb = Math.abs(pred - b);
				const pc = Math.abs(pred - c);
				v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
			}
			row[p] = v & 255;
		}
		prev = row;
	}
	const o = x * bpp;
	return [row[o], row[o + 1], row[o + 2]];
}
