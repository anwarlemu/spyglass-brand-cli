import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// The docs site renders each React example as a server component. An example that hands a function to a component
// (a render prop, a formatter, a disabled-day test) must be client code, or the page fails to prerender (the
// collapsible, calendar, carousel, chart and data table examples once did).
const dir = join(import.meta.dirname, '..', 'registry', 'react', 'examples');
const PASSES_FUNCTION = /\s[a-zA-Z]+=\{\s*(\([^)]*\)|[a-z]\w*)\s*=>|\s(format|disabled|slide|render|trigger)=\{[a-z]\w*\}|render:\s*\(|=\{\{[^\n]*=>/;

describe('React examples', () => {
	it('are client code when they pass a function to a component', () => {
		const offenders: string[] = [];
		for (const item of readdirSync(dir)) {
			for (const f of readdirSync(join(dir, item))) {
				const text = readFileSync(join(dir, item, f), 'utf8');
				if (PASSES_FUNCTION.test(text) && !/^\s*['"]use client['"]/.test(text)) offenders.push(`${item}/${f}`);
			}
		}
		expect(offenders).toEqual([]);
	});
});
