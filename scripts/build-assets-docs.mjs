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
const { illustrate, illustrateData, LIGHT_FRAMES } = await import(join(root, 'dist/illustrate/build.js'));
const { Resvg } = await import('@resvg/resvg-js');
const { recipes } = await import(join(root, 'dist/commands/recipe.js'));
const { drawCompose } = await import(join(root, 'dist/assets/compose.js'));
const { adapter } = await import(join(root, 'dist/design/adapter.js'));
const { COVERAGE } = await import(join(root, 'dist/commands/coverage.js'));

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
	// t.sizes is the list of size ids (layouts are functions of the canvas since the layout engine).
	for (const size of t.sizes) {
		for (const variant of t.variants ? Object.keys(t.variants) : [undefined]) {
			const name = `${t.id}${t.sizes.length > 1 ? `-${size}` : ''}${variant ? `-${variant}` : ''}`;
			const drawn = sceneFor(t, { size, variant, sample: true });
			const img = await shot(drawn.scene, `${name}.png`, 720);
			images.push({ name, template: t.id, group: t.group, title: t.name, size, variant, canvas: `${drawn.width}x${drawn.height}`, ...img });
		}
	}
}
const slides = [];
for (const [i, t] of templates('deck').entries()) slides.push({ name: t.id, title: t.name, group: t.group, ...(await shot(sceneFor(t, { seed: i, sample: true }).scene, `deck-${t.id}.png`, 960)) });
const merch = [];
for (const item of merchItems()) {
	for (const variant of Object.keys(item.variants)) {
		const { scene } = merchScene(item, { variant, sample: true });
		merch.push({ name: `${item.id}-${variant}`, item: item.id, title: item.name, variant, ...(await shot(scene, `merch-${item.id}-${variant}.png`, 640)) });
	}
}
// Illustrations: each style at its own size, scaled down for the page (the PNG the CLI writes, resized by resvg).
const illustrations = [];
const small = async (req, file, title, detail, longest = 720) => {
	const r = await illustrate(req);
	const k = Math.min(1, longest / Math.max(r.width, r.height));
	const w = Math.round(r.width * k);
	const h = Math.round(r.height * k);
	const png = Buffer.from(new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><image href="data:image/png;base64,${r.png.toString('base64')}" width="${w}" height="${h}"/></svg>`).render().asPng());
	writeFileSync(join(out, file), png);
	illustrations.push({ name: file.replace(/\.png$/, ''), title, detail, style: req.style, src: `/assets/${file}`, width: w, height: h, canvas: `${r.width}x${r.height}` });
};
const ill = illustrateData();
await small({ style: 'pattern' }, 'ill-pattern.png', 'Brand pattern', 'pattern, corner light and texture');
await small({ style: 'pattern', variant: 'band', source: 'generated', seed: 4 }, 'ill-pattern-generated.png', 'Brand pattern', 'pattern --variant band --source generated --seed 4');
await small({ style: 'texture' }, 'ill-texture.png', 'ASCII texture', 'texture');
for (const v of Object.keys(LIGHT_FRAMES)) await small({ style: 'light', variant: v }, `ill-light-${v}.png`, 'Brand light', `light --variant ${v}`, 480);
// The split needs a picture; the docs use the brand's own art (the corner light) rather than a stock photo.
const art = await illustrate({ style: 'light', variant: 'corner', seed: 1 });
await small({ style: 'split', photo: { mime: 'image/png', data: art.png } }, 'ill-split.png', 'Photo light split', 'split --image (here the brand light itself)');
for (const [preset, subject] of [['wordmark-trails', 'lockup'], ['trail-one-side', 'lockup'], ['banner-trails', 'lockup'], ['glass-icon', 'mark'], ['glass-split', 'wave'], ['burst', 'orb']]) await small({ style: 'shader', subject, preset }, `ill-shader-${preset}.png`, ill.shader.presets[preset].name, `shader ${subject} --preset ${preset}`);
for (const look of Object.keys(ill.shader.looks)) await small({ style: 'shader', subject: 'mark', set: { look, effect: 'burst' } }, `ill-look-${look}.png`, ill.shader.looks[look].name, `shader mark --set effect=burst --set look=${look}`, 480);
// Recipes: each compose layout with its sample copy, drawn by the same compose engine as `recipe`.
const recipeShots = [];
for (const [id, r] of Object.entries(recipes())) {
	const base = adapter().defaults('compose', r.size);
	const d = { ...base, version: 1, kind: 'image', template: 'compose', copy: { ...r.sample }, images: {}, layers: {}, blocks: r.blocks, grid: r.grid ?? { cols: 12, rows: 12 }, theme: r.theme, options: { ...r.options } };
	const { drawn } = await drawCompose(d, {});
	const k = Math.min(1, 480 / Math.max(drawn.width, drawn.height));
	const ras = await rasterizeScene(drawn, { scale: k });
	writeFileSync(join(out, `recipe-${id}.png`), ras.png);
	recipeShots.push({ name: id, title: id, group: r.group, description: r.description, size: r.size, src: `/assets/recipe-${id}.png`, width: ras.width, height: ras.height });
}
const doc = { recipes: recipeShots, coverage: COVERAGE, images, slides, merch, illustrations, illustrate: { styles: ill.styles, subjects: ill.subjects, presets: ill.shader.presets, looks: ill.shader.looks, notes: ill.shader.notes }, catalog: { image: catalogOf('image'), deck: catalogOf('deck'), merch: merchCatalog(), video: videoCatalog() } };
writeFileSync(join(root, 'apps/www/lib/assets.generated.json'), JSON.stringify(doc, null, 1) + '\n');
console.log(`assets docs: ${recipeShots.length} recipes, ${illustrations.length} illustrations, ${images.length} images, ${slides.length} slides, ${merch.length} print files -> apps/www/public/assets`);
