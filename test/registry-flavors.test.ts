import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createServer, type Server } from 'node:http';
import { extname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { builtModule, elementPath, gluedInterpolation, needsUseClient } from '../scripts/registry-flavors.ts';
import { explainBuildError } from '../scripts/build-elements.mjs';

// The React and web component flavors as the registry build writes them (bun run registry runs before the tests in ci).
const root = join(__dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const json = (p: string) => JSON.parse(read(p));
const brand = json('brand/brand.json');
const prefix = brand.elementPrefix as string;

describe('registry flavors: files', () => {
	it('maps each React component to its element file by name; hooks and lib files have none', () => {
		expect(elementPath('react/components/ui/Button.tsx')).toBe('elements/components/ui/button.ts');
		expect(elementPath('react/components/product/SearchBar.tsx')).toBe('elements/components/product/search-bar.ts');
		expect(elementPath('react/components/visuals/AsciiTexture.tsx')).toBe('elements/components/visuals/ascii-texture.ts');
		expect(elementPath('react/hooks/useControllable.ts')).toBeUndefined();
		expect(elementPath('lib/light.ts')).toBeUndefined();
	});
	it('catches a class name glued to an interpolation, which Tailwind cannot scan', () => {
		// The card element once rendered `bg-surface${...}` and lost its background.
		expect(gluedInterpolation('class=${`border bg-surface${this.framed ? " outline" : ""}`}')).toBeTruthy();
		expect(gluedInterpolation("const id = `card-${n}`; const s = `translateX(${x}px)`; `${a}${b}`")).toBeUndefined();
		expect(gluedInterpolation('<div className={cn("p-2", `bg-surface${x}`)} />')).toBeTruthy();
		expect(gluedInterpolation("icon(X, 'x', { class: `shrink-0 text-fg${muted}` })")).toBeTruthy();
	});
	it('looks for glued classes in class lists only, not in comments, keys or SVG paths', () => {
		expect(gluedInterpolation('<path d={`M0 0h${w}v${h}`} key={`row${i}`} /> // width${x}')).toBeUndefined();
		expect(gluedInterpolation('<i class=${`ds-${kind} text-fg`}>')).toBeUndefined();
	});
	it("asks for 'use client' where a React file uses hooks, not for useId alone", () => {
		expect(needsUseClient("const [a] = useState(0)")).toBe(true);
		expect(needsUseClient('const pop = usePopover({})')).toBe(true);
		expect(needsUseClient('const id = useId()')).toBe(false);
		expect(needsUseClient('// useState( in a comment\nexport const x = 1')).toBe(false);
	});
});

describe('registry flavors: a failed element build', () => {
	// An element importing what the shared chunk lacks (unsafeHTML once) failed to build, and the registry build then
	// crashed with ENOENT reading its module before printing why.
	it('reports a module that was not built instead of crashing', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-elements-'));
		try {
			const failures: string[] = [];
			expect(builtModule(dir, 'command-palette', 'command-palette', (m) => failures.push(m))).toBeUndefined();
			expect(failures).toEqual(['command-palette: elements/command-palette.js was not built (see the elements error above for why)']);
			writeFileSync(join(dir, 'tooltip.js'), 'export {}');
			expect(builtModule(dir, 'tooltip', 'tooltip', (m) => failures.push(m))).toBe('export {}');
			expect(failures).toHaveLength(1);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});
	it('names the shared chunk when an element imports what it does not export', () => {
		const esbuild = 'Build failed with 1 error:\nshared:all:1:9: ERROR: No matching export in "shared:all" for import "unsafeHTML"';
		expect(explainBuildError('elements/components/product/command-palette.ts', esbuild)).toBe('elements: elements/components/product/command-palette.ts: imports unsafeHTML, which the shared chunk does not export; add it to registry/elements/lib/index.ts');
		expect(explainBuildError('elements/components/ui/card.ts', 'Could not resolve "x"')).toBe('elements: elements/components/ui/card.ts: Could not resolve "x"');
	});
});

describe('registry flavors: output', () => {
	const index = json('apps/www/public/r/index.json');
	const ALL = ['ascii-texture', 'brand-light', 'button', 'card', 'input', 'logo', 'search-bar'];
	it('lists each item with its flavors (React, the source, and web components) and reports the coverage', () => {
		expect(index.elementPrefix).toBe(prefix);
		expect(index.coverage.total).toBe(index.items.length);
		expect(index.coverage.react).toBe(index.items.length);
		expect(index.coverage.vue).toBeUndefined();
		expect(index.coverage.elements).toBe(index.items.filter((i: { flavors: string[] }) => i.flavors.includes('elements')).length);
		for (const name of ALL) expect(index.items.find((i: { name: string }) => i.name === name).flavors, name).toEqual(['react', 'elements']);
	});
	it("carries each flavor in the item's JSON, React files at the top", () => {
		const button = json('apps/www/public/r/button.json');
		expect(button.files.map((f: { path: string }) => f.path)).toEqual(expect.arrayContaining(['react/components/ui/Button.tsx', 'react/lib/cn.ts']));
		expect(button.examples.map((e: { path: string }) => e.path)).toContain('react/examples/button/Variants.tsx');
		const react = button.flavors.react;
		expect(react.files.map((f: { path: string }) => f.path)).toEqual(expect.arrayContaining(['react/components/ui/Button.tsx', 'react/lib/cn.ts']));
		expect(react.examples.map((e: { name: string }) => e.name)).toEqual(button.examples.map((e: { name: string }) => e.name));
		const api = react.api.components.find((c: { name: string }) => c.name === 'Button');
		expect(api.props.find((p: { name: string }) => p.name === 'variant')).toMatchObject({ type: 'ButtonVariant', required: false, default: "'primary'" });
		const el = button.flavors.elements;
		expect(el.tag).toBe(`${prefix}-button`);
		expect(el.tags).toEqual([`${prefix}-button`]);
		expect(el.modules[0]).toBe('elements/shared.js');
		for (const m of el.modules) expect(existsSync(join(root, 'apps/www/public', m)), m).toBe(true);
		// Example icons are expanded to the svg Lucide renders.
		const sizes = el.examples.find((e: { name: string }) => e.name === 'Sizes');
		expect(sizes.content).toContain('class="lucide lucide-search"');
		expect(sizes.content).not.toContain('data-lucide');
	});
	it('records what an item requires in each flavor, and the modules its examples load', () => {
		const bar = json('apps/www/public/r/search-bar.json');
		expect(bar.requires).toEqual(['button']);
		expect(bar.flavors.elements.registryDependencies).toEqual(['button']);
		expect(bar.flavors.elements.modules).toEqual(expect.arrayContaining(['elements/shared.js', 'elements/search-bar.js', 'elements/button.js', 'elements/brand-light.js']));
		expect(bar.flavors.react.examples.find((e: { name: string }) => e.name === 'OnLight').registryDependencies).toEqual(expect.arrayContaining(['brand-light', 'button']));
		// The texture's generator imports the light's seeded random: the texture requires the light.
		expect(json('apps/www/public/r/ascii-texture.json').requires).toEqual(['brand-light']);
	});
	it('writes shadcn-style registries for React (imports rewritten to the app) and for elements (modules as files)', () => {
		const react = json('apps/www/public/r/react/search-bar.json');
		expect(react.$schema).toContain('registry-item.json');
		const file = react.files.find((f: { path: string }) => f.path === 'components/product/SearchBar.tsx');
		expect(file.type).toBe('registry:ui');
		expect(file.content).toContain("from '@/components/ui/Button'");
		expect(file.content).toContain("from '@/hooks/useControllable'");
		expect(file.content).not.toContain('@/react/');
		expect(react.files.find((f: { path: string }) => f.path === 'hooks/useControllable.ts').type).toBe('registry:hook');
		expect(react.registryDependencies).toEqual([`${brand.registryHost ?? brand.registryUrl}/r/react/button.json`]);
		const light = json('apps/www/public/r/react/brand-light.json');
		expect(light.files.find((f: { path: string }) => f.path === 'lib/light.ts').type).toBe('registry:lib');
		expect(light.files.find((f: { path: string }) => f.path === 'lib/light.ts').content).toContain("from '@/lib/light-master'");
		const elements = json('apps/www/public/r/elements/button.json');
		const shared = elements.files.find((f: { path: string }) => f.path === 'elements/shared.js');
		expect(shared.target).toBe(`public${brand.assetBase}/elements/shared.js`);
		expect(shared.content).toBe(read('apps/www/public/elements/shared.js'));
		expect(elements.files.some((f: { path: string }) => f.path === 'elements/button.d.ts')).toBe(true);
		for (const flavor of ['react', 'elements']) expect(json(`apps/www/public/r/${flavor}/index.json`).items.map((i: { name: string }) => i.name)).toEqual(expect.arrayContaining(ALL));
	});
	it('ships a custom elements manifest and types for every element', () => {
		const cem = json('apps/www/public/elements/custom-elements.json');
		const tags = cem.modules.map((m: { declarations: Array<{ tagName: string }> }) => m.declarations[0].tagName);
		expect(tags).toEqual(expect.arrayContaining(ALL.map((n) => `${prefix}-${n}`)));
		const button = cem.modules.find((m: { path: string }) => m.path === 'elements/button.js').declarations[0];
		expect(button.attributes.map((a: { name: string }) => a.name)).toEqual(expect.arrayContaining(['variant', 'size', 'icon', 'disabled']));
		const dts = read('apps/www/public/elements/button.d.ts');
		expect(dts).toContain(`'${prefix}-button': Button;`);
		expect(dts).toContain("export type ButtonVariant = 'primary' | 'secondary' | 'ghost'");
		// A type built from a value resolves to its literals (InputSize is keyof typeof SIZES in the source).
		expect(read('apps/www/public/elements/input.d.ts')).toContain('export type InputSize = "sm" | "md" | "lg"');
		// A type from the shared lib comes with the element.
		expect(read('apps/www/public/elements/brand-light.d.ts')).toMatch(/export type LightVariant = 'band' \| 'field'/);
	});
	it("keeps the host's inherited type: preflight's :host font reset is gone, and Tailwind's @property rules are registered from script", () => {
		const shared = read('apps/www/public/elements/shared.js');
		expect(shared).not.toMatch(/html,\s*:host\s*\{/);
		expect(shared).toContain(':host{display:contents}');
		for (const m of ['button', 'search-bar', 'brand-light']) expect(read(`apps/www/public/elements/${m}.js`), m).not.toContain('@property');
		expect(shared).toContain('--tw-border-style');
	});
});

describe('registry flavors: element types', () => {
	const dir = join(root, 'apps', 'www', 'public', 'elements');
	it('every generated .d.ts and every type in custom-elements.json compiles, strict, with nothing but the DOM', async () => {
		const ts = (await import('typescript')).default;
		const out = mkdtempSync(join(tmpdir(), 'spyglass-dts-'));
		const files: string[] = [];
		const dtsNames = readdirSync(dir).filter((f) => f.endsWith('.d.ts'));
		expect(dtsNames.length).toBeGreaterThanOrEqual(7);
		for (const f of dtsNames) {
			const text = readFileSync(join(dir, f), 'utf8');
			writeFileSync(join(out, f), text);
			files.push(join(out, f));
		}
		// The manifest's types, each checked against its own module's declarations (its tag map left out: one per file).
		const manifest = JSON.parse(readFileSync(join(dir, 'custom-elements.json'), 'utf8'));
		for (const mod of manifest.modules) {
			const name = mod.path.replace(/^elements\//, '').replace(/\.js$/, '');
			const own = readFileSync(join(dir, `${name}.d.ts`), 'utf8').replace(/declare global\s*\{[\s\S]*$/, '');
			const types: string[] = [];
			for (const d of mod.declarations) for (const m of d.members ?? []) {
				if (m.type?.text) types.push(m.type.text);
				if (m.return?.type?.text) types.push(m.return.type.text);
				for (const p of m.parameters ?? []) if (p.type?.text) types.push(p.type.text);
			}
			const check = join(out, `${name}.manifest.ts`);
			writeFileSync(check, `${own}\n${types.map((t, i) => `export type Manifest${i} = ${t}`).join('\n')}\n`);
			files.push(check);
		}
		const program = ts.createProgram(files, { strict: true, noEmit: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'], types: [], skipLibCheck: false });
		const errors = ts.getPreEmitDiagnostics(program).map((d) => `${d.file ? d.file.fileName.replace(out, '') : ''}: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`);
		expect(errors).toEqual([]);
		// Form fields carry the field API; checkValidity answers a boolean.
		for (const field of ['input', 'search-bar']) {
			const text = readFileSync(join(dir, `${field}.d.ts`), 'utf8');
			expect(text, field).toContain('checkValidity(): boolean;');
			expect(text, field).toContain('readonly validity: ValidityState;');
		}
		for (const f of dtsNames) expect(readFileSync(join(dir, f), 'utf8')).not.toMatch(/^\s*(const|function|static|render\(|return )/m);
		expect(JSON.stringify(manifest)).not.toContain('"text":"array"');
	});
});

// The elements in a real browser: form association, events, slots and tokens through the shadow root. Skipped where
// the Playwright Chromium the repository uses is not installed.
const CHROME = process.env.PARITY_CHROMIUM ?? '/Users/anwarlemu/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell';
describe.skipIf(!existsSync(CHROME))('registry flavors: elements in a browser', () => {
	let server: Server;
	let base = '';
	const page = `<!doctype html><html><head><link rel="stylesheet" href="/brand.css"></head><body>
<form id="f">
  <${prefix}-input name="org" value="Acme" aria-label="org"></${prefix}-input>
  <${prefix}-button type="submit" id="go">Save</${prefix}-button>
</form>
<form id="sf"><${prefix}-search-bar id="bar" name="q" value="Acme ads" aria-label="Search creatives"></${prefix}-search-bar></form>
<fieldset id="fs"><${prefix}-input id="own" name="own" disabled aria-label="own"></${prefix}-input><${prefix}-input id="free" name="free" aria-label="free"></${prefix}-input></fieldset>
<div data-theme="light" id="light"><${prefix}-button id="day">Day</${prefix}-button></div>
<${prefix}-ascii-texture id="bad-json" clear='[not json' width="160" height="80"></${prefix}-ascii-texture>
<${prefix}-ascii-texture id="as-text" width="160" height="80"></${prefix}-ascii-texture>
<${prefix}-brand-light id="light-el" variant="tile" seed="2"></${prefix}-brand-light>
<form id="v"><${prefix}-input id="v-input" name="name" required aria-label="name"></${prefix}-input><${prefix}-button type="submit">Send</${prefix}-button></form>
<script type="module">
  ${['shared', 'input', 'button', 'search-bar', 'ascii-texture', 'brand-light'].map((m) => `import '/elements/${m}.js'`).join('\n  ')}
  window.ready = true
</script></body></html>`;
	beforeAll(async () => {
		server = createServer((req, res) => {
			const url = (req.url ?? '/').split('?')[0];
			const file = url === '/' ? null : url === '/brand.css' ? join(root, 'build/brand.css') : join(root, 'apps/www/public', url);
			if (!file) {
				res.writeHead(200, { 'content-type': 'text/html' }).end(page);
				return;
			}
			if (!existsSync(file)) {
				res.writeHead(404).end();
				return;
			}
			res.writeHead(200, { 'content-type': extname(file) === '.js' ? 'text/javascript' : extname(file) === '.css' ? 'text/css' : 'application/octet-stream' }).end(readFileSync(file));
		});
		await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
		const address = server.address();
		base = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
	});
	afterAll(() => new Promise<void>((r) => server.close(() => r())));
	const open = async () => {
		const { chromium } = await import('playwright-core');
		const browser = await chromium.launch({ executablePath: CHROME });
		const p = await browser.newPage();
		const errors: string[] = [];
		p.on('pageerror', (e) => errors.push(e.message));
		await p.goto(base, { waitUntil: 'networkidle' });
		await p.waitForFunction(() => (window as unknown as { ready?: boolean }).ready);
		await p.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
		return { browser, p, errors };
	};

	it('takes part in forms, fires its events and inherits the tokens', async () => {
		const { browser, p, errors } = await open();
		try {
			// Form association: each field's name and value go with its form, and type="submit" submits it.
			expect(await p.evaluate(() => Object.fromEntries(new FormData(document.getElementById('f') as HTMLFormElement)))).toEqual({ org: 'Acme' });
			expect(await p.evaluate(() => Object.fromEntries(new FormData(document.getElementById('sf') as HTMLFormElement)))).toEqual({ q: 'Acme ads' });
			await p.evaluate(() => {
				const f = document.getElementById('f') as HTMLFormElement;
				(window as unknown as { submitted: number }).submitted = 0;
				f.addEventListener('submit', (e) => { e.preventDefault(); (window as unknown as { submitted: number }).submitted++; });
			});
			await p.locator('role=button[name="Save"]').click();
			expect(await p.evaluate(() => (window as unknown as { submitted: number }).submitted)).toBe(1);
			// Enter in a field submits its form, as in a native field.
			await p.locator('role=textbox[name="org"]').press('Enter');
			expect(await p.evaluate(() => (window as unknown as { submitted: number }).submitted)).toBe(2);
			// Typing updates value and fires input.
			const typed = await p.evaluate(() => new Promise<string>((resolve) => {
				const input = document.querySelector('[name="org"]') as HTMLElement & { value: string };
				input.addEventListener('input', () => resolve(input.value), { once: true });
				const inner = input.shadowRoot!.querySelector('input')!;
				inner.value = 'Acme Legal';
				inner.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
			}));
			expect(typed).toBe('Acme Legal');
			// A disabled fieldset disables its fields and, enabled again, gives each its own disabled back.
			const states = await p.evaluate(async () => {
				const fs = document.getElementById('fs') as HTMLFieldSetElement;
				const read = () => ['own', 'free'].map((id) => { const el = document.getElementById(id) as HTMLElement & { disabled: boolean }; return [el.shadowRoot!.querySelector('input')!.matches(':disabled'), el.disabled]; });
				fs.disabled = true;
				await new Promise((r) => setTimeout(r, 30));
				const held = read();
				fs.disabled = false;
				await new Promise((r) => setTimeout(r, 30));
				return [held, read()];
			});
			expect(states).toEqual([[[true, true], [true, false]], [[true, true], [false, false]]]);
			// Tokens arrive through inherited variables: a light block on an ancestor reaches the inner button (at rest, off hover).
			await p.mouse.move(2, 2);
			await p.waitForTimeout(400);
			const [dark, light] = await p.evaluate(() => ['go', 'day'].map((id) => getComputedStyle(document.getElementById(id)!.shadowRoot!.querySelector('button')!).backgroundColor));
			expect(dark).toBe('rgb(255, 255, 255)');
			expect(light).toBe('rgb(0, 0, 0)');
			expect(errors).toEqual([]);
		} finally {
			await browser.close();
		}
	});

	it('searches once per Enter or button press, with the query', async () => {
		const { browser, p } = await open();
		try {
			await p.evaluate(() => {
				const w = window as unknown as { queries: string[] };
				w.queries = [];
				document.getElementById('bar')!.addEventListener('search', (e) => w.queries.push((e as CustomEvent<{ query: string }>).detail.query));
				document.getElementById('sf')!.addEventListener('submit', (e) => e.preventDefault());
			});
			await p.locator('role=searchbox[name="Search creatives"]').press('Enter');
			await p.locator('role=button[name="Search"]').click();
			await p.waitForTimeout(50);
			expect(await p.evaluate(() => (window as unknown as { queries: string[] }).queries)).toEqual(['Acme ads', 'Acme ads']);
		} finally {
			await browser.close();
		}
	});

	it('submits a field whose name was set as a property, as React 19 and Vue set it', async () => {
		const { browser, p } = await open();
		try {
			const data = await p.evaluate(async (prefix) => {
				type Field = HTMLElement & { name?: string, value?: string, updateComplete: Promise<unknown> };
				const form = document.createElement('form');
				const input = document.createElement(`${prefix}-input`) as Field;
				input.name = 'ws';
				input.value = 'Acme';
				form.append(input);
				document.body.append(form);
				await input.updateComplete;
				const first = Object.fromEntries(new FormData(form));
				// A name taken away takes the field out of the submission.
				input.name = undefined;
				await input.updateComplete;
				return { first, after: Object.fromEntries(new FormData(form)), attr: input.hasAttribute('name') };
			}, prefix);
			expect(data).toEqual({ first: { ws: 'Acme' }, after: {}, attr: false });
		} finally {
			await browser.close();
		}
	});

	it('reads lists set as text and keeps its own when a list does not parse; the generators draw in the element', async () => {
		const { browser, p, errors } = await open();
		try {
			const out = await p.evaluate(async () => {
				type Tex = HTMLElement & { clear: unknown, updateComplete: Promise<unknown> };
				const text = document.getElementById('as-text') as Tex;
				text.clear = '[{"x": 0, "y": 0, "w": 160, "h": 80}]';
				await text.updateComplete;
				const bad = document.getElementById('bad-json') as Tex;
				await bad.updateComplete;
				const light = document.getElementById('light-el') as HTMLElement & { updateComplete: Promise<unknown> };
				await light.updateComplete;
				return {
					parsed: Array.isArray(text.clear),
					// All cleared: no characters left.
					cleared: text.shadowRoot!.querySelectorAll('text').length,
					badValue: bad.clear,
					badDrawn: bad.shadowRoot!.querySelectorAll('svg').length,
					uses: light.shadowRoot!.querySelectorAll('use').length,
					blend: getComputedStyle(light.shadowRoot!.querySelector('use')!).mixBlendMode,
				};
			});
			expect(out).toEqual({ parsed: true, cleared: 0, badValue: [], badDrawn: 1, uses: 3, blend: 'plus-lighter' });
			expect(errors).toEqual([]);
		} finally {
			await browser.close();
		}
	});

	it("reports a field's validity: a required empty field blocks its form, shows the browser's message and takes focus", async () => {
		const { browser, p } = await open();
		try {
			type Field = HTMLElement & { validity: ValidityState, validationMessage: string, willValidate: boolean, checkValidity(): boolean, value: unknown };
			const state = await p.evaluate(() => {
				const native = Object.assign(document.createElement('input'), { required: true }).validationMessage;
				const f = document.getElementById('v-input') as unknown as Field;
				return { native, message: f.validationMessage, missing: f.validity.valueMissing, form: (document.getElementById('v') as HTMLFormElement).checkValidity() };
			});
			expect(state.form).toBe(false);
			expect(state.missing).toBe(true);
			expect(state.message).toBe(state.native);
			await p.evaluate(() => {
				const w = window as unknown as { submitted: number };
				w.submitted = 0;
				document.getElementById('v')!.addEventListener('submit', (e) => { e.preventDefault(); w.submitted++; });
			});
			await p.locator('role=button[name="Send"]').click();
			expect(await p.evaluate(() => (window as unknown as { submitted: number }).submitted)).toBe(0);
			expect(await p.evaluate(() => { let a = document.activeElement; const host = a?.id; while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement; return `${host} ${a?.localName}`; })).toBe('v-input input');
			await p.evaluate(async () => {
				(document.getElementById('v-input') as unknown as Field).value = 'Acme';
				await new Promise((r) => setTimeout(r, 50));
			});
			await p.locator('role=button[name="Send"]').click();
			expect(await p.evaluate(() => (window as unknown as { submitted: number }).submitted)).toBe(1);
		} finally {
			await browser.close();
		}
	});
});
