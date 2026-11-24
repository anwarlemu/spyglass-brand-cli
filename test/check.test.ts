import { describe, expect, it } from 'vitest';
import { checkText } from '../src/check/engine.js';

const rules = (path: string, text: string) => checkText(path, text).findings.map((f) => f.rule);

describe('value check', () => {
	it('flags raw colors and offers the token for a brand hex', () => {
		const { findings } = checkText('a.css', '.a { color: #000000; background: #123456; }');
		expect(findings.map((f) => f.rule)).toEqual(['raw-color', 'raw-color']);
		expect(findings[0].hint).toContain('var(--ds-color-');
		expect(findings[1].hint).not.toContain('var(--ds-color-black)');
	});
	it('accepts brand variables and color-mix of them', () => {
		expect(rules('a.css', '.a { color: var(--ds-color-fg); background: color-mix(in srgb, var(--ds-color-edge) 50%, transparent); }')).toEqual([]);
	});
	it('flags transition-all, ease-in and durations off the steps, but not delays or token durations', () => {
		expect(rules('a.css', '.a { transition: all 150ms ease; }')).toContain('motion');
		expect(rules('a.css', '.a { transition: opacity var(--ds-duration-micro) ease-in; }')).toEqual(['motion']);
		expect(rules('a.css', '.a { transition: opacity 133ms ease-out; }')).toEqual(['motion']);
		expect(rules('a.css', '.a { transition: opacity var(--ds-duration-micro) ease-out 40ms; }')).toEqual([]);
		expect(rules('a.css', '.a { transition: opacity var(--ds-duration-press) ease calc(var(--i) * 1ms); }')).toEqual([]);
		expect(rules('a.css', '.a { transition: opacity var(--ds-duration-micro) ease-in-out; }')).toEqual([]);
	});
	it('allows looping animations such as a loader', () => {
		expect(rules('a.css', '.a { animation: blink 900ms steps(1, end) infinite; }')).toEqual([]);
	});
	it('flags radii off the scale, shadows and unknown tokens', () => {
		expect(rules('a.css', '.a { border-radius: 6px; }')).toEqual(['off-scale']);
		expect(rules('a.css', '.a { border-radius: 10px; }')).toEqual(['off-scale']);
		expect(rules('a.css', '.a { box-shadow: 0 1px 2px var(--ds-color-fg); }')).toEqual(['shadow']);
		expect(rules('a.css', '.a { color: var(--ds-color-nope); }')).toEqual(['unknown-token']);
	});
	it('reads Vue templates: classes, bound classes, styles and imports', () => {
		const vue = `<script setup lang="ts">
import { X } from '@heroicons/react/24/outline'
const cls = 'bg-blue-500 text-white'
</script>
<template>
  <div class="bg-surface text-fg shadow-md transition-all ease-in duration-133 rounded-lg text-sm" :class="ok && 'bg-[#ff0000]'" style="color: #abcdef" />
</template>
<style>
.x { transition: transform var(--ds-duration-glide) var(--ds-easing-out); }
</style>`;
		const found = rules('C.vue', vue);
		expect(found.filter((r) => r === 'raw-color').length).toBe(4);
		expect(found).toContain('shadow');
		expect(found).toContain('motion');
		expect(found).toContain('off-scale');
		expect(found).toContain('icon-pack');
	});
	it('passes brand classes', () => {
		expect(rules('C.vue', '<template><div class="bg-surface-subtle text-fg-muted border border-edge hover:border-edge-focus duration-160 ease-standard type-ui rounded-control" /></template>')).toEqual([]);
	});
	it('flags the brand radius as a raw value and offers its token', () => {
		const { findings } = checkText('a.css', '.a { border-radius: 8px; }');
		expect(findings.map((f) => f.rule)).toEqual(['off-scale']);
		expect(findings[0].hint).toContain('var(--ds-radius-');
		expect(rules('a.css', '.a { border-radius: var(--ds-radius-control); }')).toEqual([]);
	});
	it('honors a ds-override comment', () => {
		const r = checkText('a.css', '/* ds-override: third-party embed */\n.a { color: #123456; }');
		expect(r.findings).toEqual([]);
		expect(r.overrides).toHaveLength(1);
	});
});
