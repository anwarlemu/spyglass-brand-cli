// The docs site's Assets page: every image template, the deck slides and the merch print files, rendered small by the
// same engine as the CLI (dist/), into apps/www/public/assets/ with a catalog in apps/www/lib/assets.generated.json.
// Run after the build (bun run registry runs it).
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const { templates, sceneFor, catalogOf } = await import(join(root, 'dist/assets/templates.js'));
const { drawScene, rasterizeScene } = await import(join(root, 'dist/assets/scene.js'));
const { merchItems, merchScene, merchCatalog } = await import(join(root, 'dist/assets/merch.js'));
const { videoCatalog } = await import(join(root, 'dist/commands/video.js'));

const out = join(root, 'apps/www/public/assets');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const shot = async (scene, file, longest) => {
	const d = await drawScene(scene);
	const r = await rasterizeScene(d, { scale: Math.min(1, longest / Math.max(d.width, d.height)) });
	writeFileSync(join(out, file), r.png);
	return { src: `/assets/${file}`, width: r.width, height: r.height };
};

const images = [];
for (const t of templates('image')) {
	for (const [size, layout] of Object.entries(t.sizes)) {
		for (const variant of t.variants ? Object.keys(t.variants) : [undefined]) {
			const name = `${t.id}${Object.keys(t.sizes).length > 1 ? `-${size}` : ''}${variant ? `-${variant}` : ''}`;
			const img = await shot(sceneFor(t, { size, variant }).scene, `${name}.png`, 720);
			images.push({ name, template: t.id, group: t.group, title: t.name, size, variant, canvas: `${layout.width}x${layout.height}`, ...img });
		}
	}
}
const slides = [];
for (const [i, t] of templates('deck').entries()) slides.push({ name: t.id, title: t.name, group: t.group, ...(await shot(sceneFor(t, { seed: i }).scene, `deck-${t.id}.png`, 960)) });
const merch = [];
for (const item of merchItems()) {
	for (const variant of Object.keys(item.variants)) {
		const { scene } = merchScene(item, { variant });
		merch.push({ name: `${item.id}-${variant}`, item: item.id, title: item.name, variant, ...(await shot(scene, `merch-${item.id}-${variant}.png`, 640)) });
	}
}
const doc = { images, slides, merch, catalog: { image: catalogOf('image'), deck: catalogOf('deck'), merch: merchCatalog(), video: videoCatalog() } };
writeFileSync(join(root, 'apps/www/lib/assets.generated.json'), JSON.stringify(doc, null, 1) + '\n');
console.log(`assets docs: ${images.length} images, ${slides.length} slides, ${merch.length} print files -> apps/www/public/assets`);
