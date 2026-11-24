import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { brand, packageRoot } from '../lib/brand.js';
import { adapter, paint } from '../design/adapter.js';
import { runDesign } from '../design/index.js';
import type { ComposeBlock } from '../design/types.js';

// Recipes: compose designs ready to fill, for what no template covers (display ads, cards, documents, print, email,
// backgrounds). A recipe is blocks on the grid; the words are the person's (--set block.slot=words), or the sample copy
// with --sample. The file it writes is an ordinary compose design: `design revise`, `design compose` and the check work on it.

export type Recipe = { group: string; description: string; size: string; sizes?: string[]; theme: string; grid?: { cols: number; rows: number }; blocks: ComposeBlock[]; sample: Record<string, string>; options: Record<string, string | number | boolean> };

export function recipes(): Record<string, Recipe> {
	return (JSON.parse(readFileSync(join(packageRoot, 'brand', 'assets', 'recipes.json'), 'utf8')) as { recipes: Record<string, Recipe> }).recipes;
}

export const RECIPE_FLAGS = ['size', 'set', 'image', 'theme', 'sample', 'out', 'format', 'list'];

export function recipeHelp(): string {
	const b = brand().bin;
	const list = Object.entries(recipes()).map(([id, r]) => `  ${id.padEnd(20)}${r.group.padEnd(12)}${r.description}`).join('\n');
	return `Ready layouts of the brand's blocks for graphics no template covers: display ads, cards, print, email, backgrounds.

  ${b} recipe quote-card --set quote.text="..." --set quote.name="..."   A design file and its PNG
  ${b} recipe ad-300x250 --sample                                        The sample copy, to look at it
  ${b} recipe one-pager --sample --format pdf                            Print sizes write PDF too
  ${b} recipe launch-card --sample --size story                          Another size: the blocks keep their cells

Words go in by block and slot (--set headline.text=...); pictures by block (--image picture=shot.png). Only what you
pass is drawn; --sample fills the sample copy (Acme). The result is a compose design: change it with
${b} design revise <file> "..." or ${b} design compose add|move|remove <file> ...

${list}`;
}

/** Writes the recipe as a compose design file and draws it through the design commands (so the check runs). */
export async function runRecipe(cwd: string, args: string[], flags: Record<string, string | string[] | boolean>, log: (s: string) => void = console.log): Promise<number> {
	const all = recipes();
	if (flags.list || !args[0]) {
		log(recipeHelp());
		return 0;
	}
	const name = args[0];
	const r = all[name];
	if (!r) throw new Error(`Unknown recipe \`${name}\`. Recipes: ${Object.keys(all).join(', ')}.`);
	const size = typeof flags.size === 'string' ? flags.size : r.size;
	const out = resolve(cwd, typeof flags.out === 'string' ? (flags.out.endsWith('.json') ? flags.out : `${flags.out}.design.json`) : `${name}.design.json`);
	const io = { cwd, bin: brand().bin, out: log, err: (s: string) => log(s), paint };
	const code = await runDesign(['new', 'compose', '--size', size, '-o', out, '--force'], adapter(), io);
	if (code !== 0) return code;
	const doc = JSON.parse(readFileSync(out, 'utf8'));
	const sets = ([] as string[]).concat((flags.set as string | string[] | undefined) ?? []);
	const copy: Record<string, string> = flags.sample ? { ...r.sample } : {};
	for (const s of sets) {
		const at = s.indexOf('=');
		if (at < 1) throw new Error(`--set takes block.slot=words, not "${s}".`);
		copy[s.slice(0, at).trim()] = s.slice(at + 1);
	}
	const images: Record<string, string> = {};
	for (const s of ([] as string[]).concat((flags.image as string | string[] | undefined) ?? [])) {
		const at = s.indexOf('=');
		if (at < 1) throw new Error(`--image takes block=file.png, not "${s}".`);
		images[s.slice(0, at).trim()] = s.slice(at + 1);
	}
	Object.assign(doc, { blocks: r.blocks, grid: r.grid ?? { cols: 12, rows: 12 }, theme: typeof flags.theme === 'string' ? flags.theme : r.theme, copy, images, options: { ...doc.options, ...r.options } });
	writeFileSync(out, `${JSON.stringify(doc, null, 2)}\n`);
	const formats = typeof flags.format === 'string' ? flags.format : ['a4', 'letter', 'business-card'].includes(size) ? 'png,pdf' : 'png';
	return runDesign(['render', out, '--format', formats], adapter(), io);
}
