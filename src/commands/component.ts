import { brand } from '../lib/brand.js';
import { componentList, emitComponent, inspectComponent } from '../component/emit.js';

type Flags = Record<string, string | boolean | string[] | undefined>;

export function componentHelp(): string {
	const b = brand().bin;
	return [
		'The component library: list, inspect, and emit Vue for a real component. Names, props, states and examples',
		'come from the registry. An unknown name, group, part, state, prop or prop value is an error.',
		'',
		`  ${b} component list --json`,
		`  ${b} component list --group ui`,
		`  ${b} component inspect button --json`,
		`  ${b} component inspect button --source`,
		`  ${b} component emit button --state variant:dark --json`,
		`  ${b} component emit button --part PixelButton --state rest`,
		`  ${b} component emit button --state example:Dark`,
		`  ${b} component emit field --prop label=Email`,
		'',
		'Groups are ui, product, site, visuals (the ids, not the labels list prints).',
		'States are rest, <prop>:<value> for each union or boolean, and example:<Name> for each example file.',
		'example:<Name> copies that example unchanged. Generated markup leaves the default slot empty and says so in a comment.',
		'A required prop with no default must be passed with --prop, or you emit an example. --part selects one component when an item has several.',
	].join('\n');
}

export async function runComponent(root: string, args: string[], flags: Flags): Promise<{ json: unknown; text: string }> {
	if (flags.help === true) return { json: { help: true }, text: componentHelp() };
	const action = args[0];
	if (!action) throw new Error(`Pass list, inspect or emit. ${brand().bin} component list`);
	if (action !== 'list' && action !== 'inspect' && action !== 'emit') throw new Error(`Unknown component action \`${action}\`. Actions: list, inspect, emit.`);
	if (action === 'list') {
		if (args.length > 1) throw new Error('component list takes no item. Use component inspect <item>.');
		if (flags.state !== undefined || flags.part !== undefined || flags.prop !== undefined || flags.source === true) throw new Error('component list only takes --group.');
		if (flags.group !== undefined && !str(flags.group)) throw new Error('--group needs a group id. Groups: ui, product, site, visuals.');
		const items = await componentList(str(flags.group));
		const text = items.map((item) => `${item.name.padEnd(22)} ${item.group.padEnd(10)} ${item.part ?? item.parts.map((part) => part.component).join(', ')}  ${item.description}`).join('\n');
		return { json: { components: items }, text: text || 'No components.' };
	}
	if (args.length !== 2) throw new Error(`Name one item: ${brand().bin} component ${action} button`);
	if (flags.group !== undefined) throw new Error('--group is for component list.');
	if (action === 'inspect') {
		if (flags.state !== undefined || flags.prop !== undefined || flags.part !== undefined) throw new Error('component inspect does not take --state, --prop or --part. Use component emit.');
		const result = await inspectComponent(root, args[1], { source: flags.source === true });
		return { json: result, text: formatInspect(result) };
	}
	if (flags.source === true) throw new Error('--source is for component inspect.');
	if (flags.state === '' || flags.state === true) throw new Error('--state needs a value. component inspect lists the states.');
	if (flags.part === '' || flags.part === true) throw new Error('--part needs a component name.');
	const result = await emitComponent(root, args[1], { part: str(flags.part), state: str(flags.state), props: propList(flags.prop) });
	return { json: result, text: result.markup };
}

function formatInspect(result: Awaited<ReturnType<typeof inspectComponent>>): string {
	const lines = [`${result.title} (${result.name}, ${result.group})`, '', result.description, '', `Use for: ${result.use_for}`];
	if (result.never.length) lines.push('Never:', ...result.never.map((rule) => `  - ${rule}`));
	for (const part of result.parts) {
		lines.push('', `<${part.component}>  ${part.file}`);
		if (part.props.length) lines.push('  Props:', ...part.props.map((prop) => `    ${prop.name}${prop.required ? '' : '?'}: ${prop.type}${prop.default ? `  (default ${prop.default})` : ''}`));
		if (part.slots.length) lines.push(`  Slots: ${part.slots.join(', ')}`);
		lines.push(`  States: ${part.states.map((state) => state.id).join(', ')}`);
	}
	lines.push('', `Examples: ${result.examples.map((example) => example.name).join(', ') || 'none'}`);
	return lines.join('\n');
}

function propList(value: string | boolean | string[] | undefined): string[] {
	if (value === undefined) return [];
	if (typeof value === 'boolean') throw new Error('--prop must be name=value.');
	return Array.isArray(value) ? value : [value];
}

function str(value: string | boolean | string[] | undefined): string | undefined {
	return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
