import { brand } from '../lib/brand.js';
import { logos, principleSurfaces, tokenRecords, BRAND_SECTIONS, SURFACE_IDS } from '../brand/system.js';
import { componentCatalog } from '../component/emit.js';
import { catalogOf } from '../assets/templates.js';
import { merchCatalog } from '../assets/merch.js';
import { videoCatalog } from './video.js';
import { IMAGE_FLAGS } from './image.js';
import { DECK_FLAGS } from './deck.js';
import { VIDEO_FLAGS } from './video.js';
import { MERCH_FLAGS } from './merch.js';
import { slotNames } from '../assets/templates.js';
import { ILLUSTRATE_FLAGS } from './illustrate.js';
import { FIGMA_ACTIONS, FIGMA_FLAGS, PUSH_KINDS } from './figma.js';
import { illustrateData, LIGHT_FRAMES } from '../illustrate/build.js';
import { designManifest } from '../design/index.js';
import { recipes, RECIPE_FLAGS } from './recipe.js';
import { ICONS_FLAGS } from './icons.js';
import { EMAIL_FLAGS, EMAILS } from './email.js';
import { COVERAGE } from './coverage.js';
import { adapter } from '../design/adapter.js';
import { SIZES } from '../assets/sizes.js';

// The one document an agent reads first. It names every command, template, size, component, token and rule.
// Commands reject anything that is not in here.

const COMMANDS = [
	{ name: 'manifest', summary: 'This document. `describe` is the same command.', flags: ['help'] },
	{ name: 'describe', summary: 'Alias of manifest.', flags: ['help'] },
	{ name: 'brand', summary: 'Tokens (color, type, spacing, radii, motion), fonts, logos and voice.', flags: ['section', 'token', 'help'] },
	{ name: 'principles', summary: 'Product and website rules, with do and do-not lists. Voice is included.', flags: ['surface', 'help'] },
	{ name: 'component', summary: 'list, inspect and emit React for a real component, including props and states.', flags: ['group', 'part', 'state', 'prop', 'source', 'help'] },
	{ name: 'image', summary: 'Posts, ads, banners, avatar, logo backgrounds, Open Graph and story images (PNG and SVG) from the brand assets layouts.', get flags() { return [...IMAGE_FLAGS, ...slotNames('image'), 'help']; } },
	{ name: 'deck', summary: 'Pitch deck slides at 1920 by 1080: PNG per slide and one PDF.', get flags() { return [...DECK_FLAGS, ...slotNames('deck'), 'help']; } },
	{ name: 'video', summary: 'Seamless loops of the brand light: MP4 and WebM through ffmpeg, else PNG frames and a Motion JPEG MP4.', flags: [...VIDEO_FLAGS, 'help'] },
	{ name: 'merch', summary: 'Merch print files: SVG at physical size and PNG at 300 dpi with bleed and safe area.', flags: [...MERCH_FLAGS, 'help'] },
	{ name: 'light', summary: 'The brand light as SVG or PNG, seeded: windows onto the brand heat map or a generated one.', flags: ['variant', 'seed', 'source', 'width', 'height', 'out', 'format', 'ground', 'list', 'help'] },
	{ name: 'ascii', summary: 'The ASCII texture as SVG or PNG, seeded.', flags: ['seed', 'width', 'height', 'density', 'out', 'format', 'ground', 'help'] },
	{ name: 'recipe', summary: 'Ready compose layouts for what no template covers: display ads, cards, print, email and backgrounds; writes a design file and draws it (the check runs).', flags: [...RECIPE_FLAGS, 'help'] },
	{ name: 'email', summary: 'Emails as mail clients read them: one 600px table, inline styles, the brand colors and faces, the lockup as a PNG. Kinds: newsletter, announcement, receipt, password-reset.', flags: [...EMAIL_FLAGS, 'help'] },
	{ name: 'icons', summary: 'The favicon set (svg, ico, 16, 32), app icons (180, 192, 512, maskable), avatars and the web manifest, from the brand favicon.', flags: [...ICONS_FLAGS, 'help'] },
	{ name: 'illustrate', summary: "The brand's own imagery as PNG and SVG: pattern (the light with the texture behind it), light (any variant), texture, split (a picture split into its color channels) and shader (a subject or picture turned into spectral light).", flags: [...ILLUSTRATE_FLAGS, 'help'] },
	{ name: 'design', summary: 'Make a design (an image, slide, print item, illustration or loop) as a small JSON file, revise it in plain words or exact edits, undo, variants, sizes, compare and check. Every write is checked against the brand; errors change nothing. design --help.', flags: ['json', 'help'] },
	{ name: 'figma', summary: 'Figma through its MCP tools, which the CLI never calls itself: tokens (variables and use_figma scripts), push (illustration, asset, slide, component, page), pull (read steps for a frame), check (off-brand values with the nearest token; exit 1).', flags: [...FIGMA_FLAGS, 'help'] },
	{ name: 'list', summary: 'Every library item. In JSON, group is the label and groupId is the id (the groups in this document).', flags: [] },
	{ name: 'view', summary: 'How to use an item: rules, props, slots, events, examples. show is the same command.', flags: ['source', 'full'] },
	{ name: 'add', summary: 'Copy items and what they need into an app: React in React apps, web components everywhere else.', flags: ['dry-run', 'overwrite', 'install', 'framework', 'update'] },
	{ name: 'search', summary: 'Find items by what they do.', flags: [] },
	{ name: 'diff', summary: 'Compare an installed item with the library.', flags: [] },
	{ name: 'apply', summary: 'Restyle an app onto the tokens and the library look, without changing copy or behavior.', flags: ['components', 'pages', 'with-shared', 'dry-run', 'redo'] },
	{ name: 'init', summary: 'Install the stylesheet, theme, fonts and the agent contract.', flags: ['dry-run'] },
	{ name: 'info', summary: 'The app setup, installed items and what to run next.', flags: [] },
	{ name: 'check', summary: 'Report values that are off the tokens.', flags: ['fix', 'all'] },
	{ name: 'tokens', summary: 'Find tokens by name or value. No match is an error. For one exact token, use brand --token.', flags: [] },
] as const;

export function manifestHelp(): string {
	return [`${brand().bin} manifest lists every command, template, size, component, token and rule.`, 'Pass --json. If a name is not in that document, the command exits 1. Do not invent a substitute.'].join('\n');
}

export async function manifest(): Promise<Record<string, unknown>> {
	const components = await componentCatalog();
	const principles = principleSurfaces();
	const image = { templates: catalogOf('image'), sizes: SIZES, custom: 'Any size with --size custom --width --height (200 to 4000), on templates that flow' };
	const deck = { slides: catalogOf('deck') };
	const video = videoCatalog();
	const merch = { items: merchCatalog() };
	const logo = logos();
	const ill = illustrateData();
	const illustrate = {
		styles: Object.entries(ill.styles).map(([id, st]) => ({ id, name: st.name, description: st.description, from: st.from, subjects: st.subjects, image: st.image })),
		subjects: Object.entries(ill.subjects).map(([id, st]) => ({ id, name: st.name, from: st.from })),
		variants: Object.entries(LIGHT_FRAMES).map(([id, [width, height]]) => ({ id, width, height })),
		presets: Object.entries(ill.shader.presets).map(([id, p]) => ({ id, name: p.name, width: p.width, height: p.height, effect: p.effect })),
		looks: Object.entries(ill.shader.looks).map(([id, l]) => ({ id, name: l.name, from: l.from })),
		settings: { ranges: ill.shader.ranges, choices: { ...ill.shader.choices, look: Object.keys(ill.shader.looks) } },
		rules: 'brand/illustration.md',
	};
	const figma = { actions: [...FIGMA_ACTIONS], push: [...PUSH_KINDS], callsFigma: false, workflow: 'brand/agent-guide.md (Work in Figma)' };
	const rules = (['product', 'website'] as const).flatMap((id) => {
		const surface = principles[id];
		return [...surface.do, ...surface.dont, ...surface.rules].map((rule) => ({ surface: id, id: rule.id, text: rule.text, source: rule.source ?? surface.source }));
	});
	return {
		schemaVersion: 1,
		name: brand().name,
		bin: brand().bin,
		entry: 'manifest',
		alias: 'describe',
		validation: 'Every command checks its inputs against this document. An unknown command, flag, template, size, ground, format, section, surface, group, component, part, state, prop, prop value or token exits 1 and names what is allowed. The CLI does not substitute a nearby value.',
		commands: COMMANDS,
		commonFlags: ['cwd', 'json', 'help'],
		brand: {
			sections: [...BRAND_SECTIONS],
			aliases: { colour: 'color' },
			tokens: tokenRecords().map((token) => ({ name: token.name, section: token.section, group: token.group })),
		},
		fonts: 'brand --section fonts',
		logos: 'brand --section logos',
		voice: 'brand --section voice',
		principles: { surfaces: [...SURFACE_IDS], also: 'all', rules },
		groups: Object.entries(brand().groups).map(([id, label]) => ({ id, label })),
		components: components.map((item) => ({ name: item.name, group: item.group, part: item.part, parts: item.parts, states: item.states, examples: item.examples, description: item.description, use_for: item.use_for, never: item.never })),
		// Page templates and blocks are library items too (groups pages and blocks): `add <name>` copies one with the items
		// it is built from, and its copy lives in a lib file beside it.
		pages: components.filter((item) => item.group === 'pages').map((item) => ({ name: item.name, title: item.title, description: item.description, add: `${brand().bin} add ${item.name}` })),
		blocks: components.filter((item) => item.group === 'blocks').map((item) => ({ name: item.name, title: item.title, description: item.description, add: `${brand().bin} add ${item.name}` })),
		image,
		deck,
		video,
		merch,
		illustrate,
		figma,
		design: designManifest(adapter(), brand().bin),
		recipes: Object.entries(recipes()).map(([id, r]) => ({ id, group: r.group, description: r.description, size: r.size, blocks: r.blocks.map((b) => ({ id: b.id, type: b.type })), make: `${brand().bin} recipe ${id} --set <block>.<slot>=...` })),
		emails: Object.entries(EMAILS).map(([id, k]) => ({ id, description: k.description, slots: k.slots })),
		// What to run for each kind of graphic, page or part: the agent guide's decision table as data.
		coverage: COVERAGE,
		gaps: [...logo.missing, principles.website.gap].filter((gap): gap is string => Boolean(gap)),
	};
}

export function formatManifest(doc: Record<string, unknown>): string {
	const commands = doc.commands as { name: string; summary: string }[];
	const image = doc.image as { templates: { id: string; sizes: { id: string; width: number; height: number }[] }[] };
	const deck = doc.deck as { slides: { id: string }[] };
	const video = doc.video as { templates: { id: string }[]; sizes: { id: string; width: number; height: number }[]; fps: number; seconds: number };
	const merch = doc.merch as { items: { id: string; trim: { width: number; height: number } }[] };
	const components = doc.components as { name: string; group: string }[];
	const pages = (doc.pages as { name: string }[] | undefined) ?? [];
	const blocks = (doc.blocks as { name: string }[] | undefined) ?? [];
	const rules = (doc.principles as { rules: { surface: string; id: string }[] }).rules;
	const gaps = doc.gaps as string[];
	const brandInfo = doc.brand as { sections: string[]; tokens: unknown[] };
	return [
		`${doc.name} (${doc.bin}). Start here: ${doc.bin} manifest --json`,
		'',
		'Commands',
		...commands.map((command) => `  ${command.name.padEnd(14)} ${command.summary}`),
		'',
		`Brand sections: ${brandInfo.sections.join(', ')} (${brandInfo.tokens.length} tokens in --json)`,
		`Principles: ${rules.map((rule) => `${rule.surface}:${rule.id}`).join(', ')}`,
		'',
		`Image templates: ${image.templates.map((t) => `${t.id} (${t.sizes.map((s) => `${s.width}x${s.height}`).join(', ')})`).join(', ')}`,
		`Deck slides: ${deck.slides.map((s) => s.id).join(', ')}`,
		`Video templates: ${video.templates.map((template) => template.id).join(', ')}`,
		`Video sizes: ${video.sizes.map((size) => `${size.id} ${size.width}x${size.height}`).join(', ')}; ${video.seconds} s at ${video.fps} fps`,
		`Merch: ${merch.items.map((i) => `${i.id} ${i.trim.width}x${i.trim.height} in`).join(', ')}`,
		`Illustrate: styles ${(doc.illustrate as { styles: { id: string }[] }).styles.map((x) => x.id).join(', ')}; subjects ${(doc.illustrate as { subjects: { id: string }[] }).subjects.map((x) => x.id).join(', ')}; presets ${(doc.illustrate as { presets: { id: string }[] }).presets.map((x) => x.id).join(', ')}`,
		`Figma: ${(doc.figma as { actions: string[] }).actions.join(', ')} (push ${(doc.figma as { push: string[] }).push.join(', ')})`,
		'',
		`Page templates: ${pages.map((page) => page.name).join(', ') || 'none'}`,
		`Blocks: ${blocks.map((block) => block.name).join(', ') || 'none'}`,
		'',
		`Components (${components.length})`,
		...components.map((item) => `  ${item.name.padEnd(22)} ${item.group}`),
		'',
		'Gaps',
		...gaps.map((gap) => `  ${gap}`),
	].join('\n');
}
