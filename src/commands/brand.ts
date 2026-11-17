import { brand } from '../lib/brand.js';
import { about, brandDocument, brandSection, principleSurfaces, sectionId, surfaceId, tokenByName, voice, type BrandSection, type PrincipleSurface } from '../brand/system.js';

type Flags = Record<string, string | boolean | string[] | undefined>;

export function brandHelp(): string {
	const b = brand().bin;
	return [
		'The brand system: tokens, fonts, logos and voice. Values are read from brand/. Unknown names error.',
		'',
		`  ${b} brand --json                         Every section`,
		`  ${b} brand --section color                color, type, spacing, radii, motion, fonts, logos, voice, other`,
		`  ${b} brand colour                         colour is color`,
		`  ${b} brand --token --ds-color-fg          One token by its full --ds- name`,
		'',
		'color, type, spacing, radii and motion are the --ds-* tokens in that group. Spacing includes space, size,',
		'layout and border. Type includes font, text and tracking. Motion includes duration and easing. The group',
		'field on each token says which. fonts are the faces named in brand/brand.json and the woff2 files next to',
		'them. logos are the files in brand/logo, with the fill of each SVG. voice is the Voice section of',
		'brand/principles.md. A token, file or section that is not there is an error.',
	].join('\n');
}

export function principlesHelp(): string {
	const b = brand().bin;
	return [
		'Design rules for product (the console) and for the website, from brand/principles.md and the comments in',
		'brand/tokens.css. The website list is only what those files say. Voice is included with either surface.',
		'',
		`  ${b} principles --json`,
		`  ${b} principles --surface product`,
		`  ${b} principles --surface website`,
	].join('\n');
}

export function runBrand(args: string[], flags: Flags): { json: unknown; text: string } {
	if (flags.help === true) return { json: { help: true }, text: brandHelp() };
	blank(flags, ['section', 'token']);
	if (args.length > 1) throw new Error('Pass one section.');
	const token = str(flags.token);
	const sectionFlag = str(flags.section);
	if (token && (sectionFlag || args[0])) throw new Error('Pass --token or a section, not both.');
	if (token) {
		const record = tokenByName(token);
		const dark = record.dark !== record.light ? `  (dark ${record.dark})` : '';
		return { json: { token: record }, text: `${record.name}  ${record.light}${dark}  [${record.section}/${record.group}]` };
	}
	if (sectionFlag && args[0] && sectionFlag.toLowerCase() !== args[0].toLowerCase()) throw new Error('--section and the section argument disagree.');
	const asked = sectionFlag || args[0];
	if (!asked) {
		const doc = brandDocument();
		return { json: doc, text: BRAND_SECTIONS_TEXT(doc.sections) };
	}
	const section = brandSection(sectionId(asked));
	return { json: section, text: formatSection(section) };
}

export function runPrinciples(args: string[], flags: Flags): { json: unknown; text: string } {
	if (flags.help === true) return { json: { help: true }, text: principlesHelp() };
	blank(flags, ['surface']);
	if (args.length > 1) throw new Error('Pass one surface.');
	const surfaceFlag = str(flags.surface);
	if (surfaceFlag && args[0] && surfaceFlag.toLowerCase() !== args[0].toLowerCase()) throw new Error('--surface and the surface argument disagree.');
	const asked = surfaceFlag || args[0];
	const surfaces = principleSurfaces();
	const voiceDoc = voice();
	const aboutText = about();
	if (!asked || asked.toLowerCase() === 'all') return { json: { about: aboutText, voice: voiceDoc, surfaces }, text: formatPrinciples(surfaces, voiceDoc.prose, voiceDoc.never) };
	const id = surfaceId(asked);
	return { json: { about: aboutText, voice: voiceDoc, surfaces: { [id]: surfaces[id] } }, text: `${formatSurface(surfaces[id])}\n\nVoice\n  ${voiceDoc.prose}\n  Never: ${voiceDoc.never.join(', ')}` };
}

function BRAND_SECTIONS_TEXT(sections: Record<BrandSection, ReturnType<typeof brandSection>>): string {
	return (Object.keys(sections) as BrandSection[]).map((id) => formatSection(sections[id])).join('\n\n');
}

function formatSection(section: ReturnType<typeof brandSection>): string {
	if ('tokens' in section && Array.isArray(section.tokens)) {
		const lines = section.tokens.map((token) => `  ${token.name.padEnd(42)} ${token.light}${token.dark !== token.light ? `  (dark ${token.dark})` : ''}`);
		return `${section.section} (${section.tokens.length})\n${lines.join('\n') || '  (none)'}`;
	}
	if ('files' in section && Array.isArray(section.files)) {
		return [`fonts`, ...section.files.map((file) => `  ${file.path}  ${file.family} ${file.weight} ${file.role}${file.present ? '' : '  MISSING'}`), section.note].join('\n');
	}
	if ('assets' in section && Array.isArray(section.assets)) {
		return [`logos`, ...section.assets.map((asset) => `  ${asset.path}`), ...section.rules.map((rule) => `  ${rule}`), ...section.missing.map((gap) => `  missing: ${gap}`)].join('\n');
	}
	if ('prose' in section && Array.isArray(section.never)) return `voice\n  ${section.prose}\n  Never: ${section.never.join(', ')}`;
	return section.section;
}

function formatPrinciples(surfaces: { product: PrincipleSurface; website: PrincipleSurface }, prose: string, never: string[]): string {
	return `${formatSurface(surfaces.product)}\n\n${formatSurface(surfaces.website)}\n\nVoice\n  ${prose}\n  Never: ${never.join(', ')}`;
}

function formatSurface(surface: PrincipleSurface): string {
	const lines = [`${surface.title} (${surface.id})`];
	if (surface.gap) lines.push(`  ${surface.gap}`);
	if (surface.do.length) lines.push('  Do:', ...surface.do.map((rule) => `    ${rule.id}: ${rule.text}`));
	if (surface.dont.length) lines.push('  Do not:', ...surface.dont.map((rule) => `    ${rule.id}: ${rule.text}`));
	if (surface.rules.length) lines.push('  Rules:', ...surface.rules.map((rule) => `    ${rule.id}: ${rule.text}`));
	return lines.join('\n');
}

function str(value: string | boolean | string[] | undefined): string | undefined {
	return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function blank(flags: Flags, names: string[]) {
	for (const name of names) if (flags[name] === '' || flags[name] === true) throw new Error(`--${name} needs a value.`);
}
