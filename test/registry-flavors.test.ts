import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createServer, type Server } from 'node:http';
import { extname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { builtModule, elementPath, gluedInterpolation, needsUseClient, reactPath } from '../scripts/registry-flavors.ts';
import { explainBuildError } from '../scripts/build-elements.mjs';

// The React and web component flavors as the registry build writes them (bun run registry runs before the tests in ci).
const root = join(__dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const json = (p: string) => JSON.parse(read(p));
const brand = json('brand/brand.json');
const prefix = brand.elementPrefix as string;

describe('registry flavors: files', () => {
	it('maps each Vue file to its React and element files by name', () => {
		expect(reactPath('components/ui/PixelButton.vue')).toBe('react/components/ui/PixelButton.tsx');
		expect(reactPath('composables/useMenu.ts')).toBe('react/hooks/useMenu.ts');
		expect(elementPath('components/ui/PixelButton.vue')).toBe('elements/components/ui/pixel-button.ts');
		expect(elementPath('components/product/ScopeMenu.vue')).toBe('elements/components/product/scope-menu.ts');
		expect(elementPath('components/ui/InputOtp.vue')).toBe('elements/components/ui/input-otp.ts');
		expect(elementPath('composables/useMenu.ts')).toBeUndefined();
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
	it('lists each item with its flavors and reports the coverage', () => {
		expect(index.elementPrefix).toBe(prefix);
		expect(index.coverage.total).toBe(index.items.length);
		expect(index.coverage.vue).toBe(index.items.length);
		for (const item of index.items) expect(item.flavors[0]).toBe('vue');
		expect(index.coverage.react).toBe(index.items.filter((i: { flavors: string[] }) => i.flavors.includes('react')).length);
		expect(index.coverage.elements).toBe(index.items.filter((i: { flavors: string[] }) => i.flavors.includes('elements')).length);
		for (const pilot of ['button', 'field', 'dialog', 'tabs', 'card', 'menu', 'toast', 'scope-menu', 'popover', 'switch']) {
			const item = index.items.find((i: { name: string }) => i.name === pilot);
			expect(item.flavors, pilot).toEqual(['vue', 'react', 'elements']);
		}
	});
	it("carries each flavor in the item's JSON next to the Vue fields", () => {
		const button = json('apps/www/public/r/button.json');
		expect(button.files.map((f: { path: string }) => f.path)).toContain('components/ui/Button.vue');
		const react = button.flavors.react;
		expect(react.files.map((f: { path: string }) => f.path)).toEqual(expect.arrayContaining(['react/components/ui/Button.tsx', 'react/components/ui/PixelButton.tsx', 'react/components/ui/HoldButton.tsx', 'react/lib/cn.ts']));
		expect(react.dependencies.some((d: string) => d.startsWith('lucide-react@'))).toBe(true);
		expect(react.examples.map((e: { name: string }) => e.name)).toEqual(button.examples.map((e: { name: string }) => e.name));
		const api = react.api.components.find((c: { name: string }) => c.name === 'Button');
		expect(api.props.find((p: { name: string }) => p.name === 'variant')).toMatchObject({ type: 'ButtonVariant', required: false, default: "'secondary'" });
		const el = button.flavors.elements;
		expect(el.tag).toBe(`${prefix}-button`);
		expect(el.tags).toEqual([`${prefix}-button`, `${prefix}-pixel-button`, `${prefix}-hold-button`]);
		expect(el.modules[0]).toBe('elements/shared.js');
		for (const m of el.modules) expect(existsSync(join(root, 'apps/www/public', m)), m).toBe(true);
		const hold = el.api.elements.find((e: { tag: string }) => e.tag === `${prefix}-hold-button`);
		expect(hold.events.map((e: { name: string }) => e.name)).toContain('confirm');
		// Example icons are expanded to the svg lucide-vue-next renders.
		const dark = el.examples.find((e: { name: string }) => e.name === 'Dark');
		expect(dark.content).toContain('class="lucide lucide-key-round"');
		expect(dark.content).not.toContain('data-lucide');
	});
	it("records an element's dependencies when a bare import comes before an import ... from", () => {
		const item = JSON.parse(readFileSync(join(root, 'apps/www/public/r/date-picker.json'), 'utf8'));
		expect(item.flavors.elements.registryDependencies).toEqual(expect.arrayContaining(['button', 'calendar']));
	});
	it('lists the modules an item needs, those of the elements it renders included', () => {
		const scope = json('apps/www/public/r/scope-menu.json').flavors.elements;
		expect(scope.modules).toEqual(expect.arrayContaining(['elements/shared.js', 'elements/scope-menu.js', 'elements/combobox.js', 'elements/select.js', 'elements/field.js']));
		expect(scope.registryDependencies).toEqual([]);
		const dialog = json('apps/www/public/r/dialog.json');
		expect(dialog.flavors.react.registryDependencies).toEqual([]);
		expect(dialog.flavors.react.examples[0].registryDependencies).toEqual(expect.arrayContaining(['button', 'field']));
	});
	it('writes shadcn-style registries for React (imports rewritten to the app) and for elements (modules as files)', () => {
		const react = json('apps/www/public/r/react/button.json');
		expect(react.$schema).toContain('registry-item.json');
		const file = react.files.find((f: { path: string }) => f.path === 'components/ui/PixelButton.tsx');
		expect(file.type).toBe('registry:ui');
		expect(file.content).toContain("from '@/hooks/usePixelGrid'");
		expect(file.content).not.toContain('@/react/');
		expect(react.files.find((f: { path: string }) => f.path === 'hooks/usePixelGrid.ts').type).toBe('registry:hook');
		const elements = json('apps/www/public/r/elements/button.json');
		const shared = elements.files.find((f: { path: string }) => f.path === 'elements/shared.js');
		expect(shared.target).toBe(`public${brand.assetBase}/elements/shared.js`);
		expect(shared.content).toBe(read('apps/www/public/elements/shared.js'));
		expect(elements.files.some((f: { path: string }) => f.path === 'elements/button.d.ts')).toBe(true);
		for (const flavor of ['react', 'elements']) expect(json(`apps/www/public/r/${flavor}/index.json`).items.some((i: { name: string }) => i.name === 'button')).toBe(true);
	});
	it('ships a custom elements manifest and types for every element', () => {
		const cem = json('apps/www/public/elements/custom-elements.json');
		const tags = cem.modules.map((m: { declarations: Array<{ tagName: string }> }) => m.declarations[0].tagName);
		expect(tags).toEqual(expect.arrayContaining([`${prefix}-button`, `${prefix}-dialog`, `${prefix}-select`]));
		const button = cem.modules.find((m: { path: string }) => m.path === 'elements/button.js').declarations[0];
		expect(button.attributes.map((a: { name: string }) => a.name)).toEqual(expect.arrayContaining(['variant', 'icon', 'press', 'disabled']));
		const dts = read('apps/www/public/elements/button.d.ts');
		expect(dts).toContain(`'${prefix}-button': Button;`);
		expect(dts).toContain("export type ButtonVariant = 'secondary'");
	});
	it("keeps the host's inherited type: preflight's :host font reset is gone, and Tailwind's @property rules are registered from script", () => {
		const shared = read('apps/www/public/elements/shared.js');
		expect(shared).not.toMatch(/html,\s*:host\s*\{/);
		expect(shared).toContain(':host{display:contents}');
		for (const m of ['button', 'pixel-button', 'combobox']) expect(read(`apps/www/public/elements/${m}.js`), m).not.toContain('@property');
		expect(shared).toContain('--tw-border-style');
	});
});

// The elements in a real browser: form association, events, slots and tokens through the shadow root. Skipped where
// the Playwright Chromium the repository uses is not installed.
describe('registry flavors: element types', () => {
	const dir = join(root, 'apps', 'www', 'public', 'elements');
	it('every generated .d.ts and every type in custom-elements.json compiles, strict, with nothing but the DOM', async () => {
		const ts = (await import('typescript')).default;
		const out = mkdtempSync(join(tmpdir(), 'conare-dts-'));
		const files: string[] = [];
		const dtsNames = readdirSync(dir).filter((f) => f.endsWith('.d.ts'));
		expect(dtsNames.length).toBeGreaterThan(50);
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
		const input = readFileSync(join(dir, 'input.d.ts'), 'utf8');
		expect(input).toContain('checkValidity(): boolean;');
		expect(input).toContain('readonly validity: ValidityState;');
		expect(readFileSync(join(dir, 'form.d.ts'), 'utf8')).toContain('checkValidity(): boolean;');
		// Types a member names from another module come with it, and no source code rides along.
		const select = readFileSync(join(dir, 'select.d.ts'), 'utf8');
		expect(select).toMatch(/export (interface|type) ComboOption/);
		expect(select).toMatch(/export type Align = /);
		for (const f of dtsNames) expect(readFileSync(join(dir, f), 'utf8')).not.toMatch(/^\s*(const|function|static|render\(|return )/m);
		expect(JSON.stringify(manifest)).not.toContain('"text":"array"');
	});
});

const CHROME = process.env.PARITY_CHROMIUM ?? '/Users/anwarlemu/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell';
describe.skipIf(!existsSync(CHROME))('registry flavors: elements in a browser', () => {
	let server: Server;
	let base = '';
	const page = `<!doctype html><html><head><link rel="stylesheet" href="/brand.css"></head><body>
<form id="f">
  <${prefix}-input name="org" value="Acme"></${prefix}-input>
  <${prefix}-switch name="rerank" checked label="rerank"></${prefix}-switch>
  <${prefix}-select name="region" value="eu" label="region" options='[{"value":"us","label":"US"},{"value":"eu","label":"EU"}]'></${prefix}-select>
  <${prefix}-button type="submit" id="go">Save</${prefix}-button>
</form>
<fieldset id="fs"><${prefix}-input id="own" name="own" disabled></${prefix}-input><${prefix}-switch id="sw" name="sw" label="sw"></${prefix}-switch></fieldset>
<${prefix}-hold-button label="Revoke" ms="200" id="hold"></${prefix}-hold-button>
<div data-theme="dark" id="dark"><${prefix}-button variant="secondary" id="night">Night</${prefix}-button></div>
<${prefix}-tabs id="bad-json" label="bad" options='[not json'></${prefix}-tabs>
<${prefix}-tabs id="as-text" label="text"></${prefix}-tabs>
<${prefix}-menu id="m" label="m"><span slot="trigger">Open</span><${prefix}-menu-item>One</${prefix}-menu-item><${prefix}-menu-item>Two</${prefix}-menu-item></${prefix}-menu>
<script type="module">
  ${['shared', 'input', 'switch', 'combobox', 'select', 'button', 'hold-button', 'tabs', 'menu', 'menu-item'].map((m) => `import '/elements/${m}.js'`).join('\n  ')}
  window.ready = true
</script></body></html>`;
	// Every field required and empty, in a native form, in conare-form, and the request-access page's own form.
	const validityPage = `<!doctype html><html><head><link rel="stylesheet" href="/brand.css"></head><body>
<form id="v">
  <${prefix}-input id="v-input" name="name" required></${prefix}-input>
  <${prefix}-textarea id="v-textarea" name="about" required></${prefix}-textarea>
  <${prefix}-native-select id="v-native" name="size" value="" required><option value="" disabled>Choose</option><option>1-10</option></${prefix}-native-select>
  <${prefix}-checkbox id="v-checkbox" name="terms" label="terms" required></${prefix}-checkbox>
  <${prefix}-radio-group id="v-radio" name="plan" label="plan" required options='[{"value":"a","label":"A"},{"value":"b","label":"B"}]'></${prefix}-radio-group>
  <${prefix}-switch id="v-switch" name="on" label="on" required></${prefix}-switch>
  <${prefix}-select id="v-select" name="region" label="region" required options='[{"value":"us","label":"US"}]'></${prefix}-select>
  <${prefix}-date-picker id="v-date" name="day" aria-label="day" required></${prefix}-date-picker>
  <${prefix}-input-otp id="v-otp" name="code" label="code" length="4" required></${prefix}-input-otp>
  <${prefix}-slider id="v-slider" name="k" label="k" value="5"></${prefix}-slider>
  <${prefix}-button type="submit">Send</${prefix}-button>
</form>
<${prefix}-form id="cf" label="conare form"><${prefix}-input id="cf-input" name="x" required></${prefix}-input><${prefix}-button slot="actions" type="submit">Go</${prefix}-button></${prefix}-form>
<${prefix}-form id="cf2" label="react form"><${prefix}-input name="y"></${prefix}-input><${prefix}-button slot="actions" id="prop-submit">Send it</${prefix}-button><button slot="actions" type="button" id="plain-button">Not a send</button><button slot="actions" id="native-submit">Native send</button></${prefix}-form>
<${prefix}-request-access-page id="rap" state="form" email="sam@acme.com" name="Sam" full="false" home-href="#" demo-href="#" sign-in-href="#" privacy-href="#"></${prefix}-request-access-page>
<script type="module">
  ${['shared', 'input', 'textarea', 'native-select', 'checkbox', 'radio-group', 'switch', 'combobox', 'select', 'date-picker', 'input-otp', 'slider', 'button', 'form', 'request-access-page'].map((m) => `import '/elements/${m}.js'`).join('\n  ')}
  window.ready = true
</script></body></html>`;
	beforeAll(async () => {
		server = createServer((req, res) => {
			const url = (req.url ?? '/').split('?')[0];
			if (url === '/validity') {
				res.writeHead(200, { 'content-type': 'text/html' }).end(validityPage);
				return;
			}
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

	it('takes part in forms, fires its events and inherits the tokens', async () => {
		const { chromium } = await import('playwright-core');
		const browser = await chromium.launch({ executablePath: CHROME });
		try {
			const p = await browser.newPage();
			await p.goto(base, { waitUntil: 'networkidle' });
			await p.waitForFunction(() => (window as unknown as { ready?: boolean }).ready);
			await p.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
			// Form association: each field's name and value go with its form, and type="submit" submits it.
			const data = await p.evaluate(() => Object.fromEntries(new FormData(document.getElementById('f') as HTMLFormElement)));
			expect(data).toEqual({ org: 'Acme', rerank: 'on', region: 'eu' });
			await p.evaluate(() => {
				const f = document.getElementById('f') as HTMLFormElement;
				(window as unknown as { submitted: number }).submitted = 0;
				f.addEventListener('submit', (e) => { e.preventDefault(); (window as unknown as { submitted: number }).submitted++; });
			});
			await p.locator('role=button[name="Save"]').click();
			expect(await p.evaluate(() => (window as unknown as { submitted: number }).submitted)).toBe(1);
			// Enter in a field submits its form, as in a native field.
			await p.locator('role=textbox').first().press('Enter');
			expect(await p.evaluate(() => (window as unknown as { submitted: number }).submitted)).toBe(2);
			// v-model: typing updates value and fires input; the switch fires change and leaves the form when off.
			const typed = await p.evaluate(() => new Promise<string>((resolve) => {
				const input = document.querySelector('[name="org"]') as HTMLElement & { value: string };
				input.addEventListener('input', () => resolve(input.value), { once: true });
				const inner = input.shadowRoot!.querySelector('input')!;
				inner.value = 'Acme Legal';
				inner.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
			}));
			expect(typed).toBe('Acme Legal');
			await p.locator('role=switch[name="rerank"]').click();
			expect(await p.evaluate(() => Object.fromEntries(new FormData(document.getElementById('f') as HTMLFormElement)))).toEqual({ org: 'Acme Legal', region: 'eu' });
			// The hold button confirms after its hold.
			await p.evaluate(() => document.getElementById('hold')!.addEventListener('confirm', () => { (window as unknown as { confirmed: boolean }).confirmed = true; }));
			await p.locator('role=button[name="hold to revoke"]').focus();
			await p.keyboard.down('Space');
			await p.waitForTimeout(700);
			await p.keyboard.up('Space');
			expect(await p.evaluate(() => (window as unknown as { confirmed?: boolean }).confirmed)).toBe(true);
			// A disabled fieldset disables its fields and, enabled again, gives each its own disabled back.
			const states = await p.evaluate(async () => {
				const fs = document.getElementById('fs') as HTMLFieldSetElement;
				// What the element shows (its inner control) and its own disabled, which the fieldset never overwrites.
				const read = () => ['own', 'sw'].map((id) => { const el = document.getElementById(id) as HTMLElement & { disabled: boolean }; return [el.shadowRoot!.querySelector('input, button')!.matches(':disabled'), el.disabled]; });
				fs.disabled = true;
				await new Promise((r) => setTimeout(r, 30));
				const held = read();
				fs.disabled = false;
				await new Promise((r) => setTimeout(r, 30));
				return [held, read()];
			});
			expect(states).toEqual([[[true, true], [true, false]], [[true, true], [false, false]]]);
			// The switch fires the native input and change events, as a checkbox does.
			const fired = await p.evaluate(() => {
				const sw = document.getElementById('sw')!;
				const seen: string[] = [];
				for (const t of ['input', 'change', 'checked-change']) sw.addEventListener(t, () => seen.push(t));
				sw.shadowRoot!.querySelector('button')!.click();
				return seen;
			});
			expect(fired).toEqual(['input', 'change', 'checked-change']);
			// Tokens arrive through inherited variables: dark on an ancestor reaches the inner button.
			const [light, dark] = await p.evaluate(() => ['go', 'night'].map((id) => getComputedStyle(document.getElementById(id)!.shadowRoot!.querySelector('button')!).backgroundColor));
			expect(light).not.toBe(dark);
		} finally {
			await browser.close();
		}
	});

	it('submits a field whose name was set as a property, as React 19 and Vue set it', async () => {
		const { chromium } = await import('playwright-core');
		const browser = await chromium.launch({ executablePath: CHROME });
		try {
			const p = await browser.newPage();
			await p.goto(base, { waitUntil: 'networkidle' });
			await p.waitForFunction(() => (window as unknown as { ready?: boolean }).ready);
			const data = await p.evaluate(async (prefix) => {
				type Field = HTMLElement & { name?: string, value?: string, checked?: boolean, updateComplete: Promise<unknown> };
				const form = document.createElement('form');
				const input = document.createElement(`${prefix}-input`) as Field;
				input.name = 'ws';
				input.value = 'Acme';
				const sw = document.createElement(`${prefix}-switch`) as Field;
				sw.name = 'live';
				sw.checked = true;
				form.append(input, sw);
				document.body.append(form);
				await input.updateComplete;
				await sw.updateComplete;
				const first = Object.fromEntries(new FormData(form));
				// A name taken away takes the field out of the submission.
				input.name = undefined;
				await input.updateComplete;
				return { first, after: Object.fromEntries(new FormData(form)), attr: input.hasAttribute('name') };
			}, prefix);
			expect(data).toEqual({ first: { ws: 'Acme', live: 'on' }, after: { live: 'on' }, attr: false });
		} finally {
			await browser.close();
		}
	});

	it('reads lists set as text and keeps its own when a list does not parse', async () => {
		const { chromium } = await import('playwright-core');
		const browser = await chromium.launch({ executablePath: CHROME });
		try {
			const p = await browser.newPage();
			const errors: string[] = [];
			p.on('pageerror', (e) => errors.push(e.message));
			await p.goto(base, { waitUntil: 'networkidle' });
			await p.waitForFunction(() => (window as unknown as { ready?: boolean }).ready);
			// Svelte sets attributes as properties: a JSON list arrives as text.
			const tabs = await p.evaluate(async () => {
				type Tabs = HTMLElement & { options: unknown, updateComplete: Promise<unknown> };
				const text = document.getElementById('as-text') as Tabs;
				text.options = '["Volume", "Latency"]';
				await text.updateComplete;
				const bad = document.getElementById('bad-json') as Tabs;
				await bad.updateComplete;
				const count = (el: Tabs) => el.shadowRoot!.querySelectorAll('[role="tab"]').length;
				return { text: count(text), parsed: Array.isArray(text.options), bad: count(bad), badValue: bad.options };
			});
			expect(tabs).toEqual({ text: 2, parsed: true, bad: 0, badValue: [] });
			expect(errors).toEqual([]);
		} finally {
			await browser.close();
		}
	});

	it('moves focus to a row when an arrow reaches the button of a menu that is already open', async () => {
		const { chromium } = await import('playwright-core');
		const browser = await chromium.launch({ executablePath: CHROME });
		try {
			const p = await browser.newPage();
			await p.goto(base, { waitUntil: 'networkidle' });
			await p.waitForFunction(() => (window as unknown as { ready?: boolean }).ready);
			await p.locator('role=button[name="Open"]').click();
			await p.locator('role=button[name="Open"]').focus();
			await p.keyboard.press('ArrowDown');
			await p.waitForTimeout(50);
			const focused = () => p.evaluate(() => { let a = document.activeElement; while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement; const row = (a?.getRootNode() as ShadowRoot | undefined)?.host ?? a; return row?.textContent?.trim(); });
			expect(await focused()).toBe('One');
			await p.locator('role=button[name="Open"]').focus();
			await p.keyboard.press('ArrowUp');
			await p.waitForTimeout(50);
			expect(await focused()).toBe('Two');
		} finally {
			await browser.close();
		}
	});

	it('reports each field\'s validity: a required empty field blocks its form, shows the browser\'s message and takes focus', async () => {
		const { chromium } = await import('playwright-core');
		const browser = await chromium.launch({ executablePath: CHROME });
		try {
			const p = await browser.newPage();
			await p.goto(`${base}/validity`, { waitUntil: 'networkidle' });
			await p.waitForFunction(() => (window as unknown as { ready?: boolean }).ready);
			await p.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
			type Field = HTMLElement & { validity: ValidityState, validationMessage: string, willValidate: boolean, checkValidity(): boolean, value: unknown, checked: boolean };
			const ids = ['v-input', 'v-textarea', 'v-native', 'v-checkbox', 'v-radio', 'v-switch', 'v-select', 'v-date', 'v-otp'];
			// Each required empty field is missing its value, with the browser's own message; the slider is valid.
			const states = await p.evaluate((ids) => {
				const native = Object.assign(document.createElement('input'), { required: true }).validationMessage;
				const read = (id: string) => { const f = document.getElementById(id) as unknown as Field; return [id, f.willValidate, f.validity.valueMissing, f.validationMessage.length > 0, f.checkValidity()]; };
				return { native, form: (document.getElementById('v') as HTMLFormElement).checkValidity(), fields: ids.map(read), slider: (document.getElementById('v-slider') as unknown as Field).validity.valid, input: (document.getElementById('v-input') as unknown as Field).validationMessage };
			}, ids);
			expect(states.form).toBe(false);
			for (const f of states.fields) expect(f.slice(1)).toEqual([true, true, true, false]);
			expect(states.slider).toBe(true);
			expect(states.input).toBe(states.native);
			// A send stops at the first: no submit, an invalid event on it, and focus in its inner control.
			await p.evaluate(() => {
				const w = window as unknown as { submitted: number, invalid: string[] };
				w.submitted = 0;
				w.invalid = [];
				const f = document.getElementById('v') as HTMLFormElement;
				f.addEventListener('submit', (e) => { e.preventDefault(); w.submitted++; });
				f.addEventListener('invalid', (e) => w.invalid.push((e.target as HTMLElement).id), true);
			});
			await p.locator('role=button[name="Send"]').click();
			const focus = () => p.evaluate(() => { let a = document.activeElement; const host = a?.id; while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement; return `${host} ${a?.localName}`; });
			expect(await p.evaluate(() => (window as unknown as { submitted: number }).submitted)).toBe(0);
			expect(await p.evaluate(() => (window as unknown as { invalid: string[] }).invalid[0])).toBe('v-input');
			expect(await focus()).toBe('v-input input');
			// Filled in, each turns valid and the form sends.
			await p.evaluate(async () => {
				const set = (id: string, k: string, v: unknown) => { (document.getElementById(id) as unknown as Record<string, unknown>)[k] = v; };
				set('v-input', 'value', 'Acme'); set('v-textarea', 'value', 'Search'); set('v-native', 'value', '1-10'); set('v-checkbox', 'checked', true);
				set('v-radio', 'value', 'a'); set('v-switch', 'checked', true); set('v-select', 'value', 'us'); set('v-date', 'value', new Date(2026, 10, 13)); set('v-otp', 'value', '1234');
				await new Promise((r) => setTimeout(r, 50));
			});
			expect(await p.evaluate(() => (document.getElementById('v') as HTMLFormElement).checkValidity())).toBe(true);
			await p.locator('role=button[name="Send"]').click();
			expect(await p.evaluate(() => (window as unknown as { submitted: number }).submitted)).toBe(1);
			// conare-form checks its slotted fields; reportValidity focuses the first invalid one.
			expect(await p.evaluate(() => (document.getElementById('cf') as unknown as { checkValidity(): boolean }).checkValidity())).toBe(false);
			expect(await p.evaluate(() => (document.getElementById('cf') as unknown as { reportValidity(): boolean }).reportValidity())).toBe(false);
			expect(await focus()).toBe('cf-input input');
			// A submit button whose type is a property only (React sets it so) sends a conare-form; a page's <button>
			// sends unless it says type="button", as in a native form.
			const sends = await p.evaluate(async () => {
				const f = document.getElementById('cf2')!;
				let n = 0;
				f.addEventListener('submit', () => n++);
				const b = document.getElementById('prop-submit') as HTMLElement & { type: string };
				b.type = 'submit';
				await new Promise((r) => setTimeout(r, 30));
				const hadAttribute = b.hasAttribute('type');
				b.shadowRoot!.querySelector('button')!.click();
				const afterProp = n;
				document.getElementById('plain-button')!.click();
				const afterPlain = n;
				document.getElementById('native-submit')!.click();
				return [hadAttribute, afterProp, afterPlain, n];
			});
			expect(sends).toEqual([false, 1, 1, 2]);
			// The request-access page's form stops at its empty company, with no submit event.
			await p.evaluate(() => document.getElementById('rap')!.addEventListener('submit', () => { (window as unknown as { sent: number }).sent = ((window as unknown as { sent?: number }).sent ?? 0) + 1; }));
			await p.locator('role=button[name="Send request"]').click();
			expect(await p.evaluate(() => (window as unknown as { sent?: number }).sent ?? 0)).toBe(0);
			expect(await p.evaluate(() => { let a = document.activeElement; while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement; return a?.getAttribute('aria-label'); })).toBe('Company');
			// A function-valued disabled (the picker's days that can't be picked) does not disable the field.
			const picker = await p.evaluate(async () => {
				const d = document.getElementById('v-date') as HTMLElement & { disabled: unknown, inactive: boolean };
				d.disabled = (day: Date) => day.getDay() === 0;
				await new Promise((r) => setTimeout(r, 30));
				return [d.inactive, d.shadowRoot!.querySelector('button')!.disabled];
			});
			expect(picker).toEqual([false, false]);
		} finally {
			await browser.close();
		}
	});
});
