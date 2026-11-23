import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { adapter, paint } from '../../src/design/adapter.js';
import { runImage } from '../../src/commands/image.js';
import { runDeck } from '../../src/commands/deck.js';
import { designConformance } from './conformance.js';

// The shared conformance suite over this brand's adapter, with the plain image and deck commands as the byte reference.

const picture = join(__dirname, 'picture.jpg');
const quick = process.env.DESIGN_FULL ? undefined : (t: { id: string; sizes: string[] }) => t.sizes.filter((s) => s !== 'custom').filter((s, i) => i === 0 || ['og', 'story', 'x-banner', 'linkedin-page', 'youtube-thumbnail', 'email', 'square'].includes(s));

designConformance(adapter(), {
	paint,
	picture,
	sizes: quick,
	timeout: 600_000,
	async plain(doc) {
		if (doc.kind !== 'image' && doc.kind !== 'slide') return undefined;
		const dir = mkdtempSync(join(tmpdir(), 'design-plain-'));
		const flags: Record<string, string | string[] | boolean> = { format: 'png', out: 'out', ...doc.copy };
		const images = Object.keys(doc.images).sort().map((k) => doc.images[k]!);
		if (images.some((i) => i.startsWith('sample:'))) return undefined;
		if (images.length) flags.image = images.map(() => picture);
		if (doc.kind === 'image') await runImage(dir, [doc.template], { ...flags, size: doc.size.id, ...(doc.theme && doc.theme !== 'black' ? { theme: doc.theme } : {}) });
		else await runDeck(dir, [doc.template], flags);
		const out = join(dir, 'out');
		const file = readdirSync(out).find((f) => f.endsWith('.png'))!;
		return readFileSync(join(out, file));
	},
});
