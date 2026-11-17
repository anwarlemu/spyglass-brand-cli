// Renders every example of the named items (or every item with a web component port) as React (the source) and as
// web components, and compares them: both from apps/parity, /react/<item>/<example> and /elements/<item>/<example>.
// For each example, at 1440 and 390 wide:
//
//   pixels    full-page screenshots, diffed with pixelmatch; over 0.5% of the pixels differing fails
//   styles    computed styles of every element with data-ds, in flat-tree order (through shadow roots and slots)
//   keyboard  (at each width) Tab through the example and record where focus lands (the deepest focused element's role, name and
//             data-ds), then the item's own steps from apps/parity/interactions/<item>.mjs if it has one
//
// It writes report.json, report.html and the screenshots and diff images to the report folder.
//
//   node scripts/check-parity.mjs [items...] [--width 1440|390] [--out dir] [--threshold 0.5] [--parity-port 3351]
//
// It needs the registry built (bun run ci, or bun run registry). It serves the parity app (Vite's dev server) on 3351
// and stops it when done. Exit 1 when anything fails.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, fallback) => {
	const i = args.indexOf(`--${name}`);
	return i >= 0 ? args[i + 1] : fallback;
};
const flags = new Set(args.filter((a) => a.startsWith('--')));
const positional = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.match(/^--(width|out|threshold|parity-port)$/));
const PARITY_PORT = Number(opt('parity-port', 3351));
const THRESHOLD = Number(opt('threshold', 0.5));
const widths = opt('width') ? [Number(opt('width'))] : [1440, 390];
const flavorsWanted = ['elements'];
const out = resolve(root, opt('out', 'apps/parity/report'));
const CHROME = process.env.PARITY_CHROMIUM ?? '/Users/anwarlemu/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell';

const index = JSON.parse(readFileSync(join(root, 'apps/www/public/r/index.json'), 'utf8'));
const ported = index.items.filter((i) => i.flavors.includes('elements'));
const names = positional.length ? positional : ported.map((i) => i.name);
for (const n of names) if (!index.items.some((i) => i.name === n)) {
	console.error(`No item ${n}`);
	process.exit(1);
}

// ----- Servers -----
const started = [];
function serve(cmd, cmdArgs, env, url) {
	const child = spawn(cmd, cmdArgs, { cwd: root, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
	let log = '';
	child.stdout.on('data', (d) => { log += d; });
	child.stderr.on('data', (d) => { log += d; });
	started.push(child);
	return (async () => {
		for (let i = 0; i < 120; i++) {
			try {
				const r = await fetch(url);
				if (r.status < 500) return child;
			} catch {}
			if (child.exitCode !== null) throw new Error(`${cmd} ${cmdArgs.join(' ')} exited:\n${log}`);
			await new Promise((r) => setTimeout(r, 500));
		}
		throw new Error(`${url} did not answer:\n${log}`);
	})();
}
function stopAll() {
	for (const c of started) if (c.exitCode === null) c.kill('SIGTERM');
}
process.on('exit', stopAll);
process.on('SIGINT', () => { stopAll(); process.exit(130); });

function run(cmd, cmdArgs, label) {
	console.log(`parity: ${label}`);
	const r = spawnSync(cmd, cmdArgs, { cwd: root, stdio: 'inherit' });
	if (r.status !== 0) {
		console.error(`parity: ${label} failed`);
		process.exit(1);
	}
}
// ----- Page probes (run in the browser) -----
/** Every element in flat-tree order: shadow roots instead of their hosts' children, slots' assigned nodes in place. */
const FLAT = `(() => {
  const out = [];
  const visit = (node) => {
    if (node.nodeType !== 1) return;
    out.push(node);
    if (node.shadowRoot) { for (const c of node.shadowRoot.children) visit(c); return; }
    if (node.localName === 'slot') { const a = node.assignedElements({ flatten: true }); if (a.length) { a.forEach(visit); return; } }
    for (const c of node.children) visit(c);
  };
  visit(document.body);
  return out;
})()`;
const PROPS = ['display', 'position', 'box-sizing', 'width', 'height', 'min-width', 'min-height', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-top-style', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'border-radius', 'background-color', 'background-image', 'color', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-align', 'text-transform', 'white-space', 'gap', 'flex-direction', 'align-items', 'justify-content', 'opacity', 'transform', 'outline-style', 'outline-width', 'outline-color', 'outline-offset', 'box-shadow', 'overflow', 'cursor', 'transition-property', 'transition-duration', 'transition-timing-function', 'animation-name', 'z-index', 'visibility'];
const STYLES = `(() => {
  const props = ${JSON.stringify(PROPS)};
  return ${FLAT}.filter((el) => el.hasAttribute('data-ds') && !(el.shadowRoot && getComputedStyle(el).display === 'contents')).map((el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const style = {};
    for (const p of props) style[p] = cs.getPropertyValue(p);
    return { ds: el.getAttribute('data-ds'), tag: el.localName.includes('-') ? 'host' : el.localName, box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], style };
  });
})()`;
/** How tall the example is: its frame, and any open overlay (dialog, menu, listbox, toast, fixed panel) below it. The
 * screenshot is clipped to it, so blank viewport below a short example does not water down the difference. */
const HEIGHT = `(() => {
  const frame = document.querySelector('body .bg-surface');
  let bottom = frame ? frame.getBoundingClientRect().bottom + scrollY : document.documentElement.scrollHeight;
  for (const el of ${FLAT}) {
    const cs = getComputedStyle(el);
    const overlay = (el.localName === 'dialog' && el.open) || /^(menu|listbox|dialog|status)$/.test(el.getAttribute('role') || '') || cs.position === 'fixed';
    if (!overlay || cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width && r.height) bottom = Math.max(bottom, r.bottom + scrollY);
  }
  return Math.ceil(bottom);
})()`;
/** Where focus is: the deepest active element through shadow roots, as role, name and data-ds. */
const FOCUS = `(() => {
  let a = document.activeElement;
  while (a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement;
  if (!a || a === document.body) return 'body';
  const text = (n) => { const parts = []; const walk = (x) => { if (x.nodeType === 3) parts.push(x.textContent); else if (x.nodeType === 1) { if (x.localName === 'slot') { const nodes = x.assignedNodes({ flatten: true }); (nodes.length ? nodes : [...x.childNodes]).forEach(walk); } else if (x.shadowRoot) [...x.shadowRoot.childNodes].forEach(walk); else if (!x.hidden && x.getAttribute('aria-hidden') !== 'true') [...x.childNodes].forEach(walk); } }; walk(n); return parts.join(' ').replace(/\\s+/g, ' ').trim().slice(0, 48); };
  // The accessible name, roughly: aria-label, then a <label for>, then the text inside.
  const name = (el) => el.getAttribute('aria-label') || (el.labels && el.labels[0] ? text(el.labels[0]) : '') || text(el);
  let ds = a.closest('[data-ds]'); let up = a;
  while (!ds && up) { const h = up.getRootNode().host; if (!h) break; ds = h.closest('[data-ds]'); up = h; }
  const role = a.getAttribute('role') || a.localName;
  return [role, name(a), ds ? ds.getAttribute('data-ds') : ''].join(' | ');
})()`;
/** Open overlays and expanded triggers, so a step's effect can be compared. */
const STATE = `(() => {
  const all = ${FLAT};
  // An element's text in the flat tree (slotted text included, as a React element's own), without whitespace.
  const text = (n) => { const parts = []; const walk = (x) => { if (x.nodeType === 3) parts.push(x.textContent); else if (x.nodeType === 1) { if (x.localName === 'slot') { const nodes = x.assignedNodes({ flatten: true }); (nodes.length ? nodes : [...x.childNodes]).forEach(walk); } else if (x.shadowRoot) [...x.shadowRoot.childNodes].forEach(walk); else if (x.localName !== 'style' && x.localName !== 'script') [...x.childNodes].forEach(walk); } }; walk(n); return parts.join('').replace(/\\s+/g, '').slice(0, 32); };
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden'; };
  return {
    dialogs: all.filter((e) => e.localName === 'dialog' && e.open).length,
    menus: all.filter((e) => /^(menu|listbox|dialog)$/.test(e.getAttribute('role') || '') && vis(e)).length,
    expanded: all.filter((e) => e.getAttribute('aria-expanded') === 'true').length,
    selected: all.filter((e) => e.getAttribute('aria-selected') === 'true').map(text).join(', '),
    active: all.filter((e) => e.hasAttribute('data-active')).map(text).join(', '),
    checked: all.filter((e) => e.getAttribute('aria-checked') === 'true').length,
    pressed: all.filter((e) => e.getAttribute('aria-pressed') === 'true').length,
    controls: all.filter((e) => /^(input|select|textarea)$/.test(e.localName) && e.type !== 'hidden').map((e) => (e.type === 'checkbox' || e.type === 'radio' ? (e.checked ? 'on' : 'off') : e.value)).join('|'),
  };
})()`;

// ----- Run -----
const { chromium } = await import('playwright-core');
const { PNG } = await import('pngjs');
const pixelmatch = (await import('pixelmatch')).default;

const parity = `http://localhost:${PARITY_PORT}`;
try {
	await Promise.all([
		// The parity app runs as Vite's dev server, so it always serves the registry output as it is now.
		serve(join(root, 'node_modules/.bin/vite'), ['--config', 'apps/parity/vite.config.ts', '--port', String(PARITY_PORT), '--strictPort', '--host', '127.0.0.1'], {}, `${parity}/`),
	]);
} catch (error) {
	console.error(`parity: ${error.message}`);
	stopAll();
	process.exit(1);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'img'), { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
const results = [];

async function capture(url, width, settle = true) {
	const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
	const page = await context.newPage();
	// The same random sequence on every flavor's page: globalThis.__dsRandom, a seeded generator (mulberry32), for
	// examples that draw at random (room-grid's tiles use it before Math.random). Math.random itself is left alone,
	// since each framework draws from it a different number of times.
	await page.addInitScript(() => {
		let seed = 0x2f6b1d;
		globalThis.__dsRandom = () => {
			seed = (seed + 0x6d2b79f5) | 0;
			let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	});
	const errors = [];
	page.on('pageerror', (e) => errors.push(e.message));
	page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
	await page.goto(url, { waitUntil: 'networkidle' });
	await page.evaluate(() => document.fonts.ready);
	// Entrances (a dialog rising, a menu dropping) finish, and a pointer at rest is off the example.
	await page.mouse.move(width - 1, 899);
	await page.waitForTimeout(900);
	const height = await page.evaluate(HEIGHT);
	// Settled: running animations jump to their end, unless the example opts out (a timer drawn as an animation).
	// Margins first: the full-page screenshot resizes the page for a moment, and an mx-auto box's auto margins (computed
	// in px) can come back from it a scrollbar's width apart in one flavor and not the other.
	const margins = await page.evaluate(STYLES);
	const png = await page.screenshot({ fullPage: true, clip: { x: 0, y: 0, width, height }, animations: settle ? 'disabled' : 'allow', caret: 'hide' });
	const styles = await page.evaluate(STYLES);
	styles.forEach((s, i) => {
		const m = margins[i];
		if (m && m.ds === s.ds) for (const p of ['margin-left', 'margin-right']) s.style[p] = m.style[p];
	});
	return { context, page, png, styles, errors };
}

// A step: { label, example?, reload?, click? (with button: 'right' for a right-click), clickAt? ([x, y]), focus?, hover?, hold? (selector, with ms), key?, down?, up?, type?, wait?,
// shot? }. Selectors are Playwright's, which pierce shadow roots: prefer role=button[name="Create key"] or text=...,
// which find the same control in every flavor. `shot` screenshots the example after the step and diffs it with React's.
async function keyboard(page, steps) {
	const trail = [];
	// From the page as it loaded (a dialog that opens with the page keeps focus in it).
	const record = async (label, shot) => {
		const entry = { step: label, focus: await page.evaluate(FOCUS), state: await page.evaluate(STATE) };
		if (shot) {
			const width = page.viewportSize().width;
			entry.png = await page.screenshot({ fullPage: true, clip: { x: 0, y: 0, width, height: await page.evaluate(HEIGHT) }, caret: 'hide' });
		}
		trail.push(entry);
	};
	for (let i = 0; i < 6; i++) {
		await page.keyboard.press('Tab');
		await page.waitForTimeout(60);
		await record(`Tab ${i + 1}`);
	}
	for (const s of steps) {
		const label = s.label ?? s.key ?? s.click ?? s.hover ?? s.hold ?? s.focus ?? s.type ?? s.down ?? s.up;
		try {
			if (s.reload) {
				await page.reload({ waitUntil: 'networkidle' });
				await page.evaluate(() => document.fonts.ready);
				await page.waitForTimeout(400);
			}
			const at = (sel) => page.locator(sel).first();
			if (s.click) await at(s.click).click({ timeout: 3000, button: s.button ?? 'left' });
			if (s.clickAt) await page.mouse.click(s.clickAt[0], s.clickAt[1]);
			if (s.focus) await at(s.focus).focus({ timeout: 3000 });
			if (s.hover) await at(s.hover).hover({ timeout: 3000 });
			if (s.hold) {
				await at(s.hold).hover({ timeout: 3000 });
				await page.mouse.down();
				await page.waitForTimeout(s.ms ?? 1200);
				await page.mouse.up();
			}
			if (s.key) await page.keyboard.press(s.key);
			if (s.down) await page.keyboard.down(s.down);
			if (s.up) await page.keyboard.up(s.up);
			if (s.type) await page.keyboard.type(s.type);
			await page.waitForTimeout(s.wait ?? 300);
			await record(label, s.shot);
		} catch (error) {
			trail.push({ step: label, focus: `step failed: ${error.message.split('\n')[0]}`, state: {} });
		}
	}
	return trail;
}

const pct = (n) => `${(n * 100).toFixed(3)}%`;
function diff(a, b, file) {
	const A = PNG.sync.read(a);
	const B = PNG.sync.read(b);
	const w = Math.max(A.width, B.width);
	const h = Math.max(A.height, B.height);
	const pad = (img) => {
		if (img.width === w && img.height === h) return img;
		const p = new PNG({ width: w, height: h });
		p.data.fill(255);
		PNG.bitblt(img, p, 0, 0, img.width, img.height, 0, 0);
		return p;
	};
	const pa = pad(A);
	const pb = pad(B);
	const d = new PNG({ width: w, height: h });
	const n = pixelmatch(pa.data, pb.data, d.data, w, h, { threshold: 0.1 });
	writeFileSync(file, PNG.sync.write(d));
	return { ratio: n / (w * h), pixels: n, size: [A.width, A.height, B.width, B.height] };
}
// A url() resolves against the page, so the docs site and the parity app give it different origins.
const norm = (v) => String(v).replace(/url\("https?:\/\/(localhost|127\.0\.0\.1):\d+/g, 'url("');
function compareStyles(ref, other) {
	const problems = [];
	if (ref.length !== other.length) problems.push(`${ref.length} data-ds elements in React, ${other.length} here (${ref.map((s) => s.ds).join(',')} / ${other.map((s) => s.ds).join(',')})`);
	for (let i = 0; i < Math.min(ref.length, other.length); i++) {
		const a = ref[i];
		const b = other[i];
		if (a.ds !== b.ds) {
			problems.push(`#${i}: ${a.ds} in React, ${b.ds} here`);
			continue;
		}
		if (a.box.join() !== b.box.join()) problems.push(`#${i} ${a.ds}: box ${a.box.join(' ')} in React, ${b.box.join(' ')} here`);
		for (const p of PROPS) if (norm(a.style[p]) !== norm(b.style[p])) problems.push(`#${i} ${a.ds}: ${p} ${a.style[p]} in React, ${b.style[p]} here`);
	}
	return problems;
}

let failed = 0;
for (const name of names) {
	const item = index.items.find((i) => i.name === name);
	const detail = JSON.parse(readFileSync(join(root, 'apps/www/public/r', `${name}.json`), 'utf8'));
	let steps = [];
	const stepsFile = join(root, 'apps/parity/interactions', `${name}.mjs`);
	let settle = true;
	if (existsSync(stepsFile)) {
		const mod = await import(pathToFileURL(stepsFile).href);
		steps = mod.default ?? [];
		// `export const settle = false`: screenshots let running animations run (hero's tab timer would advance its tab).
		if (mod.settle === false) settle = false;
	}
	for (const ex of detail.examples) {
		for (const width of widths) {
			const ref = await capture(`${parity}/react/${name}/${ex.name}`, width, settle);
			const refFile = `img/${name}-${ex.name}-${width}-react.png`;
			writeFileSync(join(out, refFile), ref.png);
			const exSteps = steps.filter((s) => (!s.example || s.example === ex.name) && (!s.width || s.width === width));
			const refKeys = await keyboard(ref.page, exSteps);
			await ref.context.close();
			for (const flavor of flavorsWanted) {
				const r = { item: name, example: ex.name, width, flavor, ok: true, notes: [] };
				results.push(r);
				if (!item.flavors.includes(flavor)) {
					r.ok = false;
					r.missing = true;
					r.notes.push(`no ${flavor} port`);
					failed++;
					continue;
				}
				const url = `${parity}/${flavor}/${name}/${ex.name}`;
				let got;
				try {
					got = await capture(url, width, settle);
				} catch (error) {
					// A page that does not load fails its example, and the run goes on to the next.
					r.ok = false;
					r.notes.push(`load: ${String(error.message).split('\n')[0]}`);
					failed++;
					console.log(`FAIL ${name}/${ex.name} ${width} ${flavor}: ${r.notes[0]}`);
					continue;
				}
				const file = `img/${name}-${ex.name}-${width}-${flavor}.png`;
				writeFileSync(join(out, file), got.png);
				const d = diff(ref.png, got.png, join(out, `img/${name}-${ex.name}-${width}-${flavor}-diff.png`));
				Object.assign(r, { ref: refFile, image: file, diff: `img/${name}-${ex.name}-${width}-${flavor}-diff.png`, ratio: d.ratio, size: d.size });
				if (d.ratio * 100 > THRESHOLD) r.notes.push(`pixels: ${pct(d.ratio)} differ (${d.pixels}); React ${d.size[0]}x${d.size[1]}, here ${d.size[2]}x${d.size[3]}`);
				r.styles = compareStyles(ref.styles, got.styles);
				if (r.styles.length) r.notes.push(`styles: ${r.styles.length} difference(s)`);
				if (got.errors.length) r.notes.push(`errors: ${got.errors.join(' / ')}`);
				{
					const keys = await keyboard(got.page, exSteps);
					r.keyboard = keys.map((k, i) => ({ ...k, ref: refKeys[i] })).filter((k) => k.focus !== k.ref?.focus || JSON.stringify(k.state) !== JSON.stringify(k.ref?.state)).map(({ png, ref, ...k }) => ({ ...k, ref: ref && { focus: ref.focus, state: ref.state } }));
					if (r.keyboard.length) r.notes.push(`keyboard: ${r.keyboard.map((k) => `${k.step}: ${k.ref?.focus} ${JSON.stringify(k.ref?.state)} in React, ${k.focus} ${JSON.stringify(k.state)} here`).join('; ')}`);
					r.trail = keys.map(({ png, ...k }, i) => ({ ...k, ref: refKeys[i]?.focus }));
					r.shots = [];
					keys.forEach((k, i) => {
						if (!k.png || !refKeys[i]?.png) return;
						const tag = `${name}-${ex.name}-${width}-step${i}-${flavor}`;
						writeFileSync(join(out, `img/${tag}.png`), k.png);
						writeFileSync(join(out, `img/${tag}-react.png`), refKeys[i].png);
						const sd = diff(refKeys[i].png, k.png, join(out, `img/${tag}-diff.png`));
						r.shots.push({ step: k.step, ratio: sd.ratio, image: `img/${tag}.png`, ref: `img/${tag}-react.png`, diff: `img/${tag}-diff.png` });
						if (sd.ratio * 100 > THRESHOLD) r.notes.push(`after "${k.step}": ${pct(sd.ratio)} of pixels differ`);
					});
				}
				await got.context.close();
				r.ok = !r.notes.length;
				if (!r.ok) failed++;
				console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${name}/${ex.name} ${width} ${flavor}: ${pct(d.ratio)}${r.notes.length ? `  ${r.notes.join('  ')}` : ''}`);
			}
		}
	}
}
await browser.close();
stopAll();

const summary = names.map((n) => {
	const rs = results.filter((r) => r.item === n);
	return { item: n, ...Object.fromEntries(flavorsWanted.map((f) => {
		const fr = rs.filter((r) => r.flavor === f && !r.missing);
		return [f, fr.length ? { pass: fr.filter((r) => r.ok).length, of: rs.filter((r) => r.flavor === f).length, worst: Math.max(...fr.map((r) => r.ratio ?? 0)) } : null];
	})) };
});
writeFileSync(join(out, 'report.json'), `${JSON.stringify({ threshold: THRESHOLD, widths, summary, results }, null, 2)}\n`);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
writeFileSync(join(out, 'report.html'), `<!doctype html><meta charset="utf-8"><title>Parity</title><style>body{font:13px/1.5 system-ui;margin:24px}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:4px 8px;vertical-align:top}img{max-width:420px;border:1px solid #ccc}.f{color:#b42317}</style>
<h1>Parity: ${failed ? `${failed} failing` : 'all pass'}</h1><p>Threshold ${THRESHOLD}% of pixels; widths ${widths.join(', ')}.</p>
<table><tr><th>Item</th>${flavorsWanted.map((f) => `<th>${f}</th>`).join('')}</tr>${summary.map((s) => `<tr><td>${s.item}</td>${flavorsWanted.map((f) => `<td>${s[f] ? `${s[f].pass}/${s[f].of}, worst ${pct(s[f].worst)}` : 'not ported'}</td>`).join('')}</tr>`).join('')}</table>
${results.filter((r) => !r.missing).map((r) => `<h3 class="${r.ok ? '' : 'f'}">${r.item}/${r.example} ${r.width} ${r.flavor}: ${pct(r.ratio ?? 0)}</h3>${r.notes.length ? `<pre class="f">${esc(r.notes.join('\n'))}</pre>${r.styles?.length ? `<pre>${esc(r.styles.slice(0, 40).join('\n'))}</pre>` : ''}` : ''}<p><img src="${r.ref}" alt="react"> <img src="${r.image}" alt="${r.flavor}"> <img src="${r.diff}" alt="diff"></p>`).join('\n')}`);
console.log(`\nparity: ${results.length - failed} of ${results.length} pass; report at ${relative(root, join(out, 'report.html'))}`);
for (const s of summary) console.log(`  ${s.item.padEnd(20)} ${flavorsWanted.map((f) => `${f} ${s[f] ? `${s[f].pass}/${s[f].of} (worst ${pct(s[f].worst)})` : 'not ported'}`).join('   ')}`);
process.exit(failed ? 1 : 0);
