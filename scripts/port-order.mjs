// The order to port the remaining items in: waves, each item after every item it (or one of its examples) requires,
// so a port agent never waits on a file another agent has not written yet. Items in one wave can run in parallel.
// It also names the hooks and controllers a port creates for a composable, and which item creates each.
//
//   node scripts/port-order.mjs [--flavor react|elements] [--json]
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const index = JSON.parse(readFileSync(join(root, 'apps/www/public/r/index.json'), 'utf8'));
const args = process.argv.slice(2);
const only = args.includes('--flavor') ? args[args.indexOf('--flavor') + 1] : undefined;
const flavors = only ? [only] : ['react', 'elements'];

// A composable's React hook (react/hooks/useX.ts) and element controller (elements/controllers/x.ts) are created by
// one item, the one whose component the composable belongs to; the others that use it come after it.
export const COMPOSABLES = {
	useAccordion: 'accordion', useCellBurst: 'cell-burst', useChart: 'chart', useDirection: 'direction', useDocumentDownload: 'document-download',
	useForm: 'form', useGlideMark: 'glide-mark', useParse: 'parse-page', useSearchResults: 'search-results', useSheet: 'sheet', useSteps: 'steps',
};

const out = {};
for (const flavor of flavors) {
	const done = new Set(index.items.filter((i) => i.flavors.includes(flavor)).map((i) => i.name));
	const needs = new Map();
	for (const i of index.items) {
		if (done.has(i.name)) continue;
		const detail = JSON.parse(readFileSync(join(root, 'apps/www/public/r', `${i.name}.json`), 'utf8'));
		const req = new Set([...i.requires, ...detail.examples.flatMap((e) => e.requires)]);
		const text = [...detail.files.map((f) => f.content), ...detail.examples.map((e) => e.content)].join('\n');
		for (const [c, owner] of Object.entries(COMPOSABLES)) if (owner !== i.name && text.includes(`composables/${c}'`)) req.add(owner);
		req.delete(i.name);
		needs.set(i.name, req);
	}
	// Items that need each other (tag's Loader, loader's example with a Tag) are one unit, ported together.
	const units = scc(needs);
	const unitOf = new Map();
	units.forEach((u, k) => u.forEach((n) => unitOf.set(n, k)));
	const waves = [];
	const placed = new Set();
	const left = new Set(units.map((_, k) => k));
	while (left.size) {
		const wave = [...left].filter((k) => units[k].every((n) => [...needs.get(n)].every((r) => done.has(r) || unitOf.get(r) === k || placed.has(unitOf.get(r)))));
		if (!wave.length) break;
		for (const k of wave) {
			placed.add(k);
			left.delete(k);
		}
		waves.push(wave.map((k) => units[k].sort().join(' + ')).sort());
	}
	out[flavor] = { ported: [...done].sort(), waves };
}
if (args.includes('--json')) console.log(JSON.stringify({ composables: COMPOSABLES, ...out }, null, 2));
else {
	for (const [flavor, { ported, waves }] of Object.entries(out)) {
		console.log(`${flavor}: ${ported.length} of ${index.items.length} ported`);
		waves.forEach((w, i) => console.log(`  wave ${i + 1} (${w.length}): ${w.join(', ')}`));
	}
	console.log(`\nComposables (the item that ports each, to react/hooks/useX.ts and elements/controllers/x.ts):\n${Object.entries(COMPOSABLES).map(([c, o]) => `  ${c}: ${o}`).join('\n')}`);
}

/** Strongly connected components (Tarjan): items that need one another, directly or around a loop. */
function scc(graph) {
	let index = 0;
	const stack = [];
	const on = new Set();
	const idx = new Map();
	const low = new Map();
	const out = [];
	const visit = (v) => {
		idx.set(v, index);
		low.set(v, index++);
		stack.push(v);
		on.add(v);
		for (const w of graph.get(v) ?? []) {
			if (!graph.has(w)) continue;
			if (!idx.has(w)) {
				visit(w);
				low.set(v, Math.min(low.get(v), low.get(w)));
			} else if (on.has(w)) low.set(v, Math.min(low.get(v), idx.get(w)));
		}
		if (low.get(v) === idx.get(v)) {
			const unit = [];
			let w;
			do {
				w = stack.pop();
				on.delete(w);
				unit.push(w);
			} while (w !== v);
			out.push(unit);
		}
	};
	for (const v of graph.keys()) if (!idx.has(v)) visit(v);
	return out;
}
