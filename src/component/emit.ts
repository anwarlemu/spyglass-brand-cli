import { existsSync } from 'node:fs';
import { join, posix } from 'node:path';
import { brand } from '../lib/brand.js';
import { reactApiOf, view, type Api } from '../commands/library.js';
import { readProject } from '../library/project.js';
import { readIndex, readItem, type RegistryItem } from '../library/registry.js';

// List, inspect and emit the library's real components. States come from prop unions, boolean props and example
// files. A value that is not in the source is an error. Emit does not invent slot text or object props.

export type StateSpec = { id: string; props?: Record<string, string | boolean>; example?: string };

export function componentPartName(item: string): string {
	return item.split('-').filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

export function unionLiterals(type: string): string[] | undefined {
	const paren = type.match(/\(([^()]*)\)\s*$/);
	const body = (paren ? paren[1] : type).trim();
	if (!body.includes('|') && !/^['"]/.test(body)) return undefined;
	const parts = body.split('|').map((part) => part.trim()).filter(Boolean);
	const values: string[] = [];
	for (const part of parts) {
		const match = part.match(/^(['"])(.*)\1$/);
		if (!match) return undefined;
		values.push(match[2]);
	}
	return values.length ? values : undefined;
}

function literalDefault(raw: string): string | boolean | undefined {
	const text = raw.trim();
	if (text === 'true') return true;
	if (text === 'false') return false;
	const str = text.match(/^(['"])(.*)\1$/);
	if (str) return str[2];
	if (/^-?\d+(\.\d+)?$/.test(text)) return text;
	return undefined;
}

function defaultProps(api: Api): Record<string, string | boolean> {
	const props: Record<string, string | boolean> = {};
	for (const prop of api.props) {
		if (prop.default === undefined) continue;
		const value = literalDefault(prop.default);
		if (value !== undefined) props[prop.name] = value;
	}
	return props;
}

export function statesOf(api: Api, exampleNames: string[]): StateSpec[] {
	const defaults = defaultProps(api);
	const states: StateSpec[] = [{ id: 'rest', props: { ...defaults } }];
	for (const prop of api.props) {
		const literals = unionLiterals(prop.type);
		if (literals) {
			for (const value of literals) states.push({ id: `${prop.name}:${value}`, props: { ...defaults, [prop.name]: value } });
			continue;
		}
		if (prop.type.trim() === 'boolean') {
			states.push({ id: `${prop.name}:true`, props: { ...defaults, [prop.name]: true } });
			states.push({ id: `${prop.name}:false`, props: { ...defaults, [prop.name]: false } });
		}
	}
	for (const name of exampleNames) states.push({ id: `example:${name}`, example: name });
	return states;
}

type GivenProp = { name: string; type: string; required: boolean; default?: string };
type GivenComponent = { name: string; file: string; props: GivenProp[] };

/** The React components of an item and their props (from the registry's API, else read from the source). Callbacks
 * are its events and children its slot; className is left out. */
function componentApis(item: RegistryItem): Api[] {
	const given = (item.flavors?.react?.api as { components?: GivenComponent[] } | undefined)?.components;
	if (given?.length) {
		return given.map((c) => ({
			file: c.file,
			component: c.name,
			props: c.props.filter((p) => !/^on[A-Z]/.test(p.name) && p.name !== 'children' && p.name !== 'className'),
			models: [],
			emits: c.props.filter((p) => /^on[A-Z]/.test(p.name)).map((p) => p.name),
			slots: c.props.some((p) => p.name === 'children') || /\bchildren\b/.test(item.files.find((f) => f.path === c.file)?.content ?? '') ? ['children'] : [],
		}));
	}
	return item.files.filter((f) => /^react\/components\/.*\.tsx$/.test(f.path)).flatMap((f) => reactApiOf(f.path, f.content));
}

export function choosePart(apis: Api[], item: string, requested?: string): Api {
	if (requested) {
		const hit = apis.find((api) => api.component === requested);
		if (!hit) throw new Error(`Unknown part \`${requested}\` on ${item}. Parts: ${apis.map((api) => api.component).join(', ') || 'none'}.`);
		return hit;
	}
	const named = apis.find((api) => api.component === componentPartName(item));
	if (named) return named;
	if (apis.length === 1) return apis[0];
	throw new Error(`${item} has more than one component and none is named ${componentPartName(item)}. Pass --part. Parts: ${apis.map((api) => api.component).join(', ')}.`);
}

export type CatalogPart = { component: string; states: string[] };

export type CatalogEntry = {
	name: string;
	title: string;
	group: string;
	groupLabel: string;
	description: string;
	use_for: string;
	never: string[];
	part?: string;
	parts: CatalogPart[];
	states: string[];
	examples: string[];
};

export async function componentCatalog(): Promise<CatalogEntry[]> {
	const index = await readIndex();
	const out: CatalogEntry[] = [];
	for (const entry of [...index].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
		const item = await readItem(entry.name);
		const apis = componentApis(item);
		const examples = item.examples.map((example) => example.name);
		const named = apis.find((api) => api.component === componentPartName(item.name));
		const part = named ?? (apis.length === 1 ? apis[0] : undefined);
		const parts = apis.map((api) => ({ component: api.component, states: statesOf(api, examples).map((state) => state.id) }));
		out.push({
			name: item.name,
			title: item.title,
			group: item.group,
			groupLabel: brand().groups[item.group] ?? item.group,
			description: item.description,
			use_for: item.use_for,
			never: item.never,
			part: part?.component,
			parts,
			states: parts.find((entry) => entry.component === part?.component)?.states ?? [],
			examples,
		});
	}
	return out;
}

export async function componentList(group?: string): Promise<CatalogEntry[]> {
	if (group && !(group in brand().groups)) throw new Error(`Unknown group \`${group}\`. Groups: ${Object.keys(brand().groups).join(', ')}.`);
	const all = await componentCatalog();
	return group ? all.filter((item) => item.group === group) : all;
}

export async function inspectComponent(root: string, name: string, opts: { source: boolean }) {
	const [viewed] = await view(root, [name]);
	const item = await readItem(viewed.name);
	const apis = componentApis(item);
	const examples = item.examples.map((example) => example.name);
	return {
		name: viewed.name,
		title: viewed.title,
		group: item.group,
		groupLabel: viewed.group,
		description: viewed.description,
		use_for: viewed.use_for,
		never: viewed.never,
		install: viewed.install,
		imports: viewed.imports,
		requires: viewed.requires,
		packages: viewed.packages,
		via: viewed.via,
		parts: apis.map((api) => ({
			component: api.component,
			file: api.file,
			props: api.props,
			models: api.models,
			emits: api.emits,
			slots: api.slots,
			states: statesOf(api, examples),
		})),
		examples: item.examples.map((example) => (opts.source ? example : { name: example.name, label: example.label, path: example.path })),
		files: opts.source ? item.files : undefined,
	};
}

function coerce(prop: Api['props'][number], value: string): string | boolean {
	if (/["'<>\n\r]/.test(value)) throw new Error(`--prop ${prop.name} contains a character that cannot go in the emitted attribute. Use --state example:<Name> for real markup.`);
	const literals = unionLiterals(prop.type);
	if (literals) {
		if (!literals.includes(value)) throw new Error(`Unknown value \`${value}\` for \`${prop.name}\`. Values: ${literals.join(', ')}.`);
		return value;
	}
	const type = prop.type.trim();
	if (type === 'boolean') {
		if (value !== 'true' && value !== 'false') throw new Error(`--prop ${prop.name} is boolean. Pass true or false.`);
		return value === 'true';
	}
	if (type === 'number') {
		if (!/^-?\d+(\.\d+)?$/.test(value)) throw new Error(`--prop ${prop.name} is a number.`);
		return value;
	}
	if (type === 'string') return value;
	throw new Error(`Prop \`${prop.name}\` is ${prop.type}, which emit cannot set from --prop. Use --state example:<Name> for markup that already sets it.`);
}

function applyProps(api: Api, base: Record<string, string | boolean>, extras: string[]): Record<string, string | boolean> {
	const props = { ...base };
	for (const raw of extras) {
		const eq = raw.indexOf('=');
		if (eq <= 0) throw new Error(`--prop must be name=value, not \`${raw}\`.`);
		const name = raw.slice(0, eq);
		const spec = api.props.find((prop) => prop.name === name);
		if (!spec) throw new Error(`Unknown prop \`${name}\` on ${api.component}. Props: ${api.props.map((prop) => prop.name).join(', ') || 'none'}.`);
		props[name] = coerce(spec, raw.slice(eq + 1));
	}
	return props;
}

function componentImport(root: string, component: string, file: string): { line: string; note?: string } {
	const project = existsSync(join(root, 'package.json')) ? readProject(root) : undefined;
	const rel = file.replace(/^react\//, '').replace(/\.tsx?$/, '');
	if (!project || project.alias) return { line: `import { ${component} } from '@/${rel}'` };
	const src = project.srcDir === '.' ? '' : project.srcDir;
	const spec = src ? `./${posix.join(src, rel)}` : `./${rel}`;
	return { line: `import { ${component} } from '${spec}'`, note: 'This app has no @ alias. The import is relative to a file in the source root; adjust the prefix if the file is nested.' };
}

function hasChildren(api: Api): boolean {
	return api.slots.includes('children');
}

function attr(prop: Api['props'][number] | undefined, name: string, value: string | boolean): string {
	if (value === true) return name;
	if (value === false) return `${name}={false}`;
	if (prop && prop.type.trim() === 'number') return `${name}={${value}}`;
	return `${name}="${value}"`;
}

function jsxMarkup(component: string, importLine: string, api: Api, props: Record<string, string | boolean>, slotted: boolean): string {
	const attrs = Object.entries(props).map(([name, value]) => attr(api.props.find((prop) => prop.name === name), name, value)).join(' ');
	const open = attrs ? `<${component} ${attrs}` : `<${component}`;
	const tag = slotted ? `${open}></${component}>` : `${open} />`;
	return `${importLine}\n\nexport default function Example() {\n  return ${tag}\n}\n`;
}

export async function emitComponent(root: string, name: string, opts: { part?: string; state?: string; props: string[] }) {
	const [viewed] = await view(root, [name]);
	const item = await readItem(viewed.name);
	const apis = componentApis(item);
	const api = choosePart(apis, item.name, opts.part);
	const examples = item.examples.map((example) => example.name);
	const states = statesOf(api, examples);
	const stateId = opts.state ?? 'rest';
	const state = states.find((itemState) => itemState.id === stateId);
	if (!state) throw new Error(`Unknown state \`${stateId}\` on ${api.component}. States: ${states.map((itemState) => itemState.id).join(', ')}.`);
	if (state.example) {
		if (opts.props.length) throw new Error('--prop cannot change an example. The example is copied as it is.');
		const example = item.examples.find((itemExample) => itemExample.name === state.example);
		if (!example) throw new Error(`Example \`${state.example}\` is not in ${item.name}.`);
		return { name: item.name, part: api.component, state: state.id, source: example.path, examples, markup: example.content, note: 'Example file, copied unchanged.' };
	}
	const props = applyProps(api, { ...(state.props ?? {}) }, opts.props);
	const missing = api.props.filter((prop) => prop.required && !(prop.name in props)).map((prop) => `${prop.name}: ${prop.type}`);
	if (missing.length) throw new Error(`Missing required prop ${missing.join('; ')} on ${api.component}. Pass --prop name=value, or --state example:<Name>. States: ${states.map((itemState) => itemState.id).join(', ')}.`);
	const slotted = hasChildren(api);
	const imported = componentImport(root, api.component, api.file);
	const note = [imported.note, slotted ? 'The children are empty. Copy an example for real children.' : undefined].filter(Boolean).join(' ');
	const markup = jsxMarkup(api.component, imported.line, api, props, slotted);
	return {
		name: item.name,
		part: api.component,
		state: state.id,
		props,
		import: imported.line,
		slots: api.slots,
		examples,
		markup: note ? `// ${note}\n${markup}` : markup,
		note: note || undefined,
	};
}
