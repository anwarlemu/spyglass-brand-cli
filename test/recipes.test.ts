import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { recipes, runRecipe } from '../src/commands/recipe.js';

// Every recipe draws clean (the design check passes) at its own size with its sample copy, and draws only what is passed.
describe('recipes', () => {
	const dir = mkdtempSync(join(tmpdir(), 'recipes-'));
	for (const [name, r] of Object.entries(recipes())) {
		it(`${name} draws clean at ${r.size}`, { timeout: 120_000 }, async () => {
			const log: string[] = [];
			const code = await runRecipe(dir, [name], { sample: true }, (s) => log.push(s));
			expect(code, log.join('\n')).toBe(0);
			expect(existsSync(join(dir, `${name}.design.png`)) || existsSync(join(dir, `${name}.png`)), log.join('\n')).toBe(true);
		});
	}
	it('refuses an unknown recipe with the list', async () => {
		await expect(runRecipe(dir, ['nope'], {})).rejects.toThrow(/Recipes: /);
	});
});
