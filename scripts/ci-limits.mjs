// Limits CI enforces: no brand strings in src/ (everything brand-specific comes from brand/), no em dashes in prose.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const brand = JSON.parse(readFileSync(join(root, 'brand', 'brand.json'), 'utf8'));
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
const problems = [];
const needle = new RegExp(`\\b(${brand.name}|${brand.bin})\\b`, 'i');
for (const f of walk(join(root, 'src'))) {
	readFileSync(f, 'utf8').split('\n').forEach((line, i) => { if (needle.test(line)) problems.push(`${f.slice(root.length + 1)}:${i + 1} names the brand; read it from brand/brand.json`); });
}
const prose = [...walk(join(root, 'brand')).filter((f) => f.endsWith('.md')), ...walk(join(root, 'registry')), join(root, 'README.md'), join(root, 'CLAUDE.md'), join(root, 'PLAN.md'), join(root, 'AGENTS.md')];
for (const f of prose) {
	try {
		readFileSync(f, 'utf8').split('\n').forEach((line, i) => { if (line.includes('—')) problems.push(`${f.slice(root.length + 1)}:${i + 1} has an em dash`); });
	} catch {}
}
if (problems.length) {
	console.error(problems.join('\n'));
	process.exit(1);
}
console.log('limits: ok');
