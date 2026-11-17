// The docs site's full sweep, against a production server: build it (`bun run ci`, then `bun run www:build`), start it
// (`PORT=3201 node apps/www/.output/server/index.mjs`), then `DOCS_URL=http://localhost:3201 bun run test:docs`.
// Every component page and every /preview/<item>/<example> at 1440 and 390: no browser errors, no failed requests and
// no horizontal overflow. Then the rail (every item listed, the filter), the overlays (open, Escape, focus back on
// the trigger) and the items that compose others. CHROMIUM_PATH points at a Chromium build if playwright-core has
// none installed; CONCURRENCY sets how many pages load at once (4); SWEEP=0 skips the page sweep.
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const base = (process.env.DOCS_URL ?? 'http://localhost:3201').replace(/\/$/, '');
const widths = [1440, 390];
const concurrency = Number(process.env.CONCURRENCY ?? 4);
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const problems = [];
const fail = (where, what) => problems.push(`${where}: ${what}`);

// A page that records what went wrong while it was open.
async function open(width, path, label = path) {
	const context = await browser.newContext({ viewport: { width, height: width > 600 ? 1000 : 844 }, acceptDownloads: true });
	const page = await context.newPage();
	const where = `${label} @${width}`;
	page.on('pageerror', (e) => fail(where, `page error: ${e.message}`));
	page.on('console', (m) => { if (m.type() === 'error') fail(where, `console error: ${m.text()}`); });
	page.on('requestfailed', (r) => { if (!/net::ERR_ABORTED/.test(r.failure()?.errorText ?? '')) fail(where, `request failed: ${r.url()} (${r.failure()?.errorText})`); });
	page.on('response', (r) => { if (r.status() >= 400) fail(where, `HTTP ${r.status()}: ${r.url()}`); });
	await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
	await page.evaluate(() => document.fonts.ready);
	return { page, context, where };
}
async function overflow(page) {
	return page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
}
async function pool(tasks) {
	let next = 0;
	await Promise.all(Array.from({ length: concurrency }, async () => {
		while (next < tasks.length) await tasks[next++]();
	}));
}

const { items } = await (await fetch(`${base}/r/index.json`)).json();
assert.ok(items.length > 0, 'the index lists items');
const previews = items.flatMap((i) => i.examples.map((e) => `/preview/${i.name}/${e}`));

try {
	// 1. Every component page and every preview, at both widths (SWEEP=0 skips it, to rerun the checks below).
	if (process.env.SWEEP !== '0') {
	const routes = [...items.map((i) => `/components/${i.name}`), ...previews];
	let done = 0;
	await pool(routes.flatMap((path) => widths.map((width) => async () => {
		const { page, context, where } = await open(width, path);
		try {
			if (path.startsWith('/components/')) {
				const name = path.split('/').pop();
				const title = items.find((i) => i.name === name).title;
				await page.getByRole('heading', { name: title, exact: true, level: 1 }).waitFor({ timeout: 5000 }).catch(() => fail(where, 'no page title'));
			} else {
				await page.waitForTimeout(600);
				if (!(await page.evaluate(() => document.querySelector('#__nuxt')?.textContent?.trim().length || document.querySelector('#__nuxt svg, #__nuxt img, #__nuxt canvas')))) fail(where, 'renders nothing');
			}
			const over = await overflow(page);
			if (over > 0) fail(where, `overflows by ${over}px`);
		} finally {
			await context.close();
		}
		if (++done % 100 === 0) console.log(`  ${done} of ${routes.length * widths.length} loads`);
	})));
	console.log(`Swept ${items.length} component pages and ${previews.length} previews at ${widths.join(' and ')}.`);
	}

	// 2. The rail lists every item, and its filter narrows it.
	{
		const { page, context, where } = await open(1440, '/components/button', 'rail');
		const rail = page.locator('#docs-rail');
		const listed = await rail.locator('a[href^="/components/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href').split('/').pop()));
		const missing = items.map((i) => i.name).filter((n) => !listed.includes(n));
		if (missing.length) fail(where, `missing from the rail: ${missing.join(', ')}`);
		if (listed.length !== items.length) fail(where, `rail lists ${listed.length} items, the index ${items.length}`);
		const filter = rail.getByRole('textbox', { name: 'filter components' });
		await filter.fill('menu');
		const narrowed = await rail.locator('a[href^="/components/"]').allTextContents();
		const expected = items.filter((i) => i.title.toLowerCase().includes('menu') || i.name.includes('menu')).length;
		if (narrowed.length !== expected) fail(where, `filter "menu" shows ${narrowed.length}, expected ${expected}`);
		await rail.locator('a[href="/components/menubar"]').click();
		await page.waitForURL('**/components/menubar');
		if ((await filter.inputValue()) !== 'menu') fail(where, 'the filter is not kept after navigating');
		await filter.fill('zzz');
		await rail.getByText('Nothing matches').waitFor({ timeout: 3000 }).catch(() => fail(where, 'no empty message for a filter with no match'));
		await context.close();
		console.log(`Rail: ${listed.length} items listed; filter checked.`);
	}

	// 3. Overlays: open from the trigger, Escape closes, focus returns to the trigger.
	// [item, its trigger]: a menu button by default, the example's first button for a dialog it opens.
	const POPUP = '[aria-haspopup]:visible, [aria-expanded]:visible';
	const overlays = [
		['dialog', 'button:visible'], ['alert-dialog', 'button:visible'], ['sheet', 'button:visible'], ['drawer', 'button:visible'],
		['popover', POPUP], ['menu', POPUP], ['context-menu', '[data-context]'], ['hover-card', 'a'], ['date-picker', POPUP],
		['combobox', POPUP], ['select', POPUP], ['scope-menu', POPUP], ['filter-chip', POPUP], ['account-menu', POPUP],
		['workspace-switcher', POPUP], ['menubar', POPUP],
	].filter(([n]) => items.some((i) => i.name === n));
	for (const [name, selector] of overlays) {
		const example = items.find((i) => i.name === name).examples[0];
		const { page, context, where } = await open(1440, `/preview/${name}/${example}`, `overlay ${name}`);
		try {
			const surface = () => page.locator('dialog[open], .ds-pop:visible, [role="dialog"]:visible, [role="menu"]:visible, [role="listbox"]:visible, [role="tooltip"]:visible').first();
			// Some examples open themselves as they load: close that first, so the trigger is what opens it.
			if (await surface().isVisible().catch(() => false)) { await page.keyboard.press('Escape'); await page.waitForTimeout(300); }
			const trigger = page.locator(selector).first();
			if (!(await trigger.count())) { fail(where, 'no trigger found'); continue; }
			if (name === 'hover-card') await page.keyboard.press('Tab');
			else await trigger.focus();
			if (name === 'context-menu') await trigger.click({ button: 'right' });
			else if (name !== 'hover-card') await page.keyboard.press('Enter');
			if (!(await surface().isVisible().catch(() => false))) await trigger.click(name === 'context-menu' ? { button: 'right' } : {});
			await surface().waitFor({ state: 'visible', timeout: 3000 }).catch(() => fail(where, 'did not open'));
			await page.waitForTimeout(350);
			await page.keyboard.press('Escape');
			await page.waitForTimeout(400);
			if (await surface().isVisible().catch(() => false)) fail(where, 'Escape did not close it');
			const back = await trigger.evaluate((t) => t === document.activeElement || t.contains(document.activeElement));
			if (!back && name !== 'context-menu' && name !== 'hover-card') fail(where, 'focus did not return to the trigger');
		} finally {
			await context.close();
		}
	}
	console.log(`Overlays: ${overlays.length} opened, closed with Escape, focus checked.`);

	// 4. Items that compose others: the composed parts render and answer.
	const checks = {
		async 'data-table/Product'(page) {
			const chip = page.locator('button[aria-haspopup]').first();
			await chip.click();
			await page.getByRole('menuitemradio').nth(1).click();
			assert.match(await chip.textContent(), /:/, 'the chip names its pick');
		},
		async 'search-run/Product'(page) {
			const show = page.locator('[data-codepop] > button');
			await show.waitFor({ timeout: 4000 });
			await show.click();
			assert.equal(await show.getAttribute('aria-expanded'), 'true');
		},
		async 'search-results/Product'(page) {
			assert.ok(await page.getByRole('button', { name: /Download/ }).first().isVisible(), 'the best match has Download');
			const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Download/ }).first().click()]);
			assert.ok(download.suggestedFilename().endsWith('.txt'));
			await page.getByText('Downloaded').first().waitFor({ timeout: 3000 });
		},
		async 'search-box/Product'(page) {
			const scope = await page.locator('[aria-haspopup]').filter({ hasText: /namespace/i }).first().elementHandle();
			await scope.click();
			await page.getByRole('option', { name: /contracts/ }).first().click();
			assert.match(await scope.textContent(), /contracts/);
		},
		async 'hero/Site'(page) {
			assert.ok(await page.locator('h1.ds-hl').count(), 'the headline is highlight-text');
			await page.getByRole('tab').nth(2).click();
			assert.equal(await page.getByRole('tab').nth(2).getAttribute('aria-selected'), 'true');
			assert.ok(await page.locator('a.ds-btnlink[data-arrow]').count(), 'the action is a button link');
		},
		async 'site-footer/Site'(page) {
			assert.ok((await page.locator('.ds-roll-host .ds-roll').count()) > 10, 'labels roll');
		},
		async 'product-menu/Site'(page) {
			await page.locator('.ds-product-art[data-active] .ds-viz').first().waitFor({ timeout: 3000 });
			await page.getByRole('link', { name: /Benchmarks/ }).hover();
			await page.waitForTimeout(300);
			assert.ok(await page.locator('.ds-product-art[data-active] .ds-viz').count(), 'the picked item shows its window');
		},
		async 'overview-page/Product'(page) {
			assert.ok(await page.locator('h1.ds-hl').count(), 'the greeting is highlight-text');
			assert.ok(await page.locator('.ds-viz').count(), 'the key window is a viz window');
			await page.getByRole('tab', { name: 'Latency' }).click();
			await page.getByText('Search latency, last 24 hours').first().waitFor({ timeout: 3000 });
		},
		async 'call-to-action/Site'(page) {
			assert.equal(await page.locator('a.ds-btnlink').getAttribute('data-fill'), 'black');
		},
		async 'blog-card/Site'(page) {
			await page.locator('.ds-blog-card .ds-viz').first().waitFor({ timeout: 3000 });
		},
		async 'work-panel/Product'(page) {
			assert.ok(await page.locator('.ds-work-panel .ds-viz').count(), 'the panel plays step-viz');
		},
		async 'parse-page/Product'(page) {
			await page.getByRole('button', { name: /API call/ }).waitFor({ timeout: 5000 });
		},
		async 'button/Icon'(page) {
			const icons = await page.locator('button').evaluateAll((bs) => bs.filter((b) => b.className.includes('w-control-sm')).map((b) => getComputedStyle(b).paddingLeft));
			for (const p of icons) assert.equal(p, '0px', 'an icon button has no side padding');
		},
	};
	for (const [key, run] of Object.entries(checks)) {
		const [name, example] = key.split('/');
		if (!items.find((i) => i.name === name)?.examples.includes(example)) continue;
		const { page, context, where } = await open(1440, `/preview/${name}/${example}`, `interaction ${key}`);
		try { await run(page); } catch (e) { fail(where, e.message.split('\n')[0]); } finally { await context.close(); }
	}
	console.log(`Interactions: ${Object.keys(checks).length} composed items checked.`);
} finally {
	await browser.close();
}

if (problems.length) {
	console.error(`\n${problems.length} problem(s):\n${problems.map((p) => `  ${p}`).join('\n')}`);
	process.exit(1);
}
console.log('PASS: the docs site is clean.');
