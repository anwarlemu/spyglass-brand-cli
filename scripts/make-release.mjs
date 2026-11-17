// The compiled tree apps install (the `release` branch): bin.js, dist/, brand/, build/, the registry as r/ (with its
// react/ and elements/ registries) and the prebuilt web component modules as elements/, with a package.json that has
// no dev dependencies, workspaces or scripts, so `npm install github:...#release` takes seconds.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = join(import.meta.dirname, '..');
const out = resolve(process.argv[2] ?? join(root, '.release'));
for (const need of ['dist/cli.js', 'build/brand.css', 'apps/www/public/r/index.json']) if (!existsSync(join(root, need))) throw new Error(`${need} is missing: run bun run ci first`);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const p of ['bin.js', 'dist', 'brand', 'build', 'README.md']) cpSync(join(root, p), join(out, p), { recursive: true });
cpSync(join(root, 'apps', 'www', 'public', 'r'), join(out, 'r'), { recursive: true });
// The web components' prebuilt modules (add copies them into an app's static folder), when the registry build made them.
if (existsSync(join(root, 'apps', 'www', 'public', 'elements'))) cpSync(join(root, 'apps', 'www', 'public', 'elements'), join(out, 'elements'), { recursive: true });
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const release = { name: pkg.name, version: pkg.version, description: pkg.description, type: pkg.type, bin: pkg.bin, files: pkg.files, engines: pkg.engines, dependencies: pkg.dependencies ?? {} };
writeFileSync(join(out, 'package.json'), `${JSON.stringify(release, null, 2)}\n`);
console.log(`release tree in ${out}`);
