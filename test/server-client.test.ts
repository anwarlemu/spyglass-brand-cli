import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// A React server component may not hand a function to a client component (a render prop, an onX handler, a function
// as children): Next refuses to prerender it, and the docs build fails. Every page, block and example that passes a
// function to a client item must itself start with 'use client'.
const root = join(__dirname, '..', 'registry');
const isClient = (src: string) => /^\s*['"]use client['"]/.test(src);
const files = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : e.name.endsWith('.tsx') ? [join(dir, e.name)] : []));
const resolve = (spec: string) => [`${spec}.tsx`, `${spec}.ts`].map((p) => join(root, p.replace(/^@\//, ''))).find(existsSync);

/** The opening tag of each <Name ...> (brace-aware) and what follows it. */
function tags(src: string, name: string): { open: string; after: string }[] {
	const out: { open: string; after: string }[] = [];
	const re = new RegExp(`<${name}[\\s/>]`, 'g');
	for (let m = re.exec(src); m; m = re.exec(src)) {
		let depth = 0;
		let i = m.index + 1;
		for (; i < src.length; i++) {
			const c = src[i];
			if (c === '{') depth++;
			else if (c === '}') depth--;
			else if (c === '>' && depth === 0 && src[i - 1] !== '=') break;
		}
		out.push({ open: src.slice(m.index, i + 1), after: src.slice(i + 1, i + 200) });
	}
	return out;
}

const ARROW = /=\{\s*(?:async\s*)?(?:\([^()]*\)|[\w$]+)\s*=>/;
const CHILD = /^\s*\{\s*(?:async\s*)?(?:\([^()]*\)|[\w$]+)\s*=>/;

describe('server components', () => {
	it('never pass a function to a client component', () => {
		const bad: string[] = [];
		for (const f of [...files(join(root, 'react', 'components')), ...files(join(root, 'react', 'examples'))]) {
			const src = readFileSync(f, 'utf8');
			if (isClient(src)) continue;
			for (const [, names, spec] of src.matchAll(/import \{([^}]*)\} from '(@\/[^']+)'/g)) {
				const target = resolve(spec);
				if (!target || !isClient(readFileSync(target, 'utf8'))) continue;
				for (const name of names.split(',').map((n) => n.trim().split(/\s+as\s+/).pop()!).filter((n) => /^[A-Z]/.test(n))) {
					for (const t of tags(src, name)) if (ARROW.test(t.open) || (!t.open.endsWith('/>') && CHILD.test(t.after))) bad.push(`${f.slice(root.length + 1)}: <${name}> gets a function`);
				}
			}
		}
		expect(bad).toEqual([]);
	});
});
