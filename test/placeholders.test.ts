import { existsSync, readFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { extname, join } from 'node:path';
import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Every picture in the library is an image slot: with images passed, no placeholder remains. Each placeholder carries
// data-ds-placeholder (a creative card without src, an empty tile, a generated blank), so this renders every page and
// every item that has one, first as it ships (the marker is there) and then with images (none is left): React on the
// server, and the web components in a browser, where scenes drawn at run time (product visuals) are counted too.

const root = join(__dirname, '..');
const MARK = 'data-ds-placeholder';
// A neutral shape, never a third-party picture.
const IMG = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="50"><rect width="40" height="50" fill="#363636"/></svg>')}`;
const shot = (alt = '') => ({ src: IMG, alt, fit: 'cover' as const, position: '50% 40%' });

type Json = unknown;
/** A copy of `v` with every placeholder filled: objects with a tone get a src, picture-like fields get an image, generated blanks are replaced. */
function fill<T>(v: T): T {
	if (Array.isArray(v)) return v.map(fill) as T;
	if (!v || typeof v !== 'object') return v;
	const o: Record<string, Json> = {};
	for (const [k, x] of Object.entries(v)) o[k] = fill(x);
	if ('tone' in o && !o.src) Object.assign(o, shot());
	for (const k of ['picture', 'cover', 'thumb', 'image']) {
		const x = o[k] as Record<string, Json> | undefined;
		if (x && typeof x === 'object' && !Array.isArray(x) && !x.src) o[k] = { ...x, ...shot() };
	}
	if (typeof o.src === 'string' && o.src.includes(MARK)) o.src = IMG;
	return o as T;
}

/** A product visual's content with a picture in every slot it draws one. */
function fillVisual(data: Json, parent = ''): Json {
	if (Array.isArray(data)) return data.map((x) => fillVisual(x, parent));
	if (!data || typeof data !== 'object') return data;
	const o: Record<string, Json> = {};
	for (const [k, x] of Object.entries(data)) o[k] = fillVisual(x, k);
	if (parent === 'sets' || parent === 'rows') o.picture = shot();
	if (parent === 'tiles' || parent === 'ads' || parent === 'page') Object.assign(o, shot());
	if (parent === 'creators') o.avatar = shot();
	return o;
}

/** The pages whose shipped defaults draw placeholders. */
const SHIPPED = ['home-page', 'about-page', 'blog-page', 'blog-post-page', 'case-studies-page', 'case-study-page', 'changelog-page', 'enterprise-page', 'templates-page', 'resources-page', 'use-cases-page', 'use-case-page', 'product-page'];
const lib = async <T>(path: string): Promise<T> => (await import(/* @vite-ignore */ join(root, 'registry/lib', `${path}.ts`))) as T;

/** Each page (and each item with a placeholder) with its pictures: the props both flavors take. */
async function fixtures() {
	const { headerMenus, headerNav } = await lib<typeof import('../registry/lib/site-header')>('site-header');
	const menus = {
		...headerMenus,
		products: { ...headerMenus.products, offers: headerMenus.products.offers.map((o) => ({ ...o, picture: shot() })) },
		useCases: { ...headerMenus.useCases, rows: headerMenus.useCases.rows.map((r) => ({ ...r, shots: [shot(), shot(), shot()] })) },
	};
	const { sessionContent } = await lib<typeof import('../registry/lib/home/session')>('home/session');
	const { mediaAds, ringContent, tallyContent } = await lib<typeof import('../registry/lib/home/features')>('home/features');
	const { burstContent } = await lib<typeof import('../registry/lib/home/accounts-burst')>('home/accounts-burst');
	const { whyCreatives } = await lib<typeof import('../registry/lib/home/why')>('home/why');
	const { storyCases } = await lib<typeof import('../registry/lib/home/stories')>('home/stories');
	const { pricingPanelSets } = await lib<typeof import('../registry/lib/home/pricing')>('home/pricing');
	const { closeCreatives } = await lib<typeof import('../registry/lib/home/close')>('home/close');
	const { aboutContent } = await lib<typeof import('../registry/lib/pages/about')>('pages/about');
	const { blogContent } = await lib<typeof import('../registry/lib/pages/blog')>('pages/blog');
	const { blogPostContent } = await lib<typeof import('../registry/lib/pages/blog-post')>('pages/blog-post');
	const { changelogContent } = await lib<typeof import('../registry/lib/pages/changelog')>('pages/changelog');
	const { caseStudies, caseStudiesIndexContent } = await lib<typeof import('../registry/lib/pages/case-studies')>('pages/case-studies');
	const { resourcesContent, articlesList } = await lib<typeof import('../registry/lib/pages/resources')>('pages/resources');
	const { useCasesContent } = await lib<typeof import('../registry/lib/pages/use-cases')>('pages/use-cases');
	const { templatesPageContent } = await lib<typeof import('../registry/lib/pages/templates')>('pages/templates');
	const { useCaseContent } = await lib<typeof import('../registry/lib/pages/use-case')>('pages/use-case');
	const { productContent } = await lib<typeof import('../registry/lib/pages/product')>('pages/product');
	const { scrollStories } = await lib<typeof import('../registry/lib/pages/scroll-stories')>('pages/scroll-stories');
	const { useCaseWheelContent } = await lib<typeof import('../registry/lib/use-case-wheel')>('use-case-wheel');
	const { useCaseChatContent, useCaseBuildContent } = await lib<typeof import('../registry/lib/use-case-hero')>('use-case-hero');
	const { ringPlaceholders } = await lib<typeof import('../registry/lib/enterprise-ring')>('enterprise-ring');
	const { runPlaceholders } = await lib<typeof import('../registry/lib/automation-run')>('automation-run');
	const { enterpriseFeaturesContent } = await lib<typeof import('../registry/lib/enterprise-features')>('enterprise-features');
	const { productVisualDefaults } = await lib<typeof import('../registry/lib/product-visual-data')>('product-visual-data');
	const { useCaseAnswerChat } = await lib<typeof import('../registry/lib/use-case-answer')>('use-case-answer');

	const p = productContent.product;
	const product = {
		...p,
		features: p.features.map((f) => ({ ...f, data: fillVisual(productVisualDefaults[f.visual]) })),
		pricing: { ...p.pricing, rows: p.pricing.rows.map((r) => ({ ...r, picture: shot() })), free: { ...p.pricing.free, picture: shot() } },
	};
	const pages: { name: string; props: Record<string, Json> }[] = [
		{ name: 'home-page', props: { menus, blocks: { hero: { session: fill(sessionContent) }, features: { ads: fill(mediaAds), burst: { ...burstContent, searches: burstContent.searches.map((s) => ({ ...s, images: [shot(), shot(), shot()] })) }, ring: fill(ringContent), tally: fill(tallyContent) }, why: { creatives: fill(whyCreatives) }, steps: { session: fill(sessionContent) }, stories: { cases: fill(storyCases) }, pricing: { sets: fill(pricingPanelSets) }, close: { creatives: fill(closeCreatives) } } } },
		{ name: 'about-page', props: { menus, content: { ...aboutContent, photos: aboutContent.photos.map((ph) => (ph.light ? ph : { ...ph, ...shot('Acme team') })) } } },
		{ name: 'auth-page', props: {} },
		{ name: 'blog-page', props: { menus, content: fill(blogContent) } },
		{ name: 'blog-post-page', props: { menus, content: fill(blogPostContent) } },
		{ name: 'careers-page', props: { menus } },
		{ name: 'case-studies-page', props: { menus, content: fill(caseStudiesIndexContent) } },
		{ name: 'case-study-page', props: { menus, study: fill(caseStudies[0]) } },
		{ name: 'changelog-page', props: { menus, content: fill(changelogContent) } },
		{ name: 'coming-soon-page', props: { menus } },
		{ name: 'contact-page', props: { menus } },
		{ name: 'dashboard-page', props: {} },
		{ name: 'enterprise-page', props: { menus, cards: fill(ringPlaceholders), run: fill(runPlaceholders), features: fill(enterpriseFeaturesContent) } },
		{ name: 'error-page', props: {} },
		{ name: 'legal-page', props: { menus } },
		{ name: 'not-found-page', props: { menus } },
		{ name: 'pricing-page', props: { menus } },
		{ name: 'product-page', props: { menus, product } },
		{ name: 'resource-list-page', props: { menus, list: fill(articlesList) } },
		{ name: 'resources-page', props: { menus, content: fill(resourcesContent) } },
		{ name: 'settings-page', props: {} },
		{ name: 'templates-page', props: { menus, content: fill(templatesPageContent), blocks: { wall: { pictures: [shot(), IMG] }, run: { items: fill(runPlaceholders) } } } },
		{ name: 'use-case-page', props: { menus, chat: fill(useCaseChatContent), blocks: { story: { story: fill(scrollStories[useCaseContent.story.preset]) }, wheel: { items: fill(useCaseWheelContent.items) } } } },
		{ name: 'use-case-page', props: { menus, visual: 'build', build: fill(useCaseBuildContent), blocks: { story: { story: fill(scrollStories[useCaseContent.story.preset]) }, wheel: { items: fill(useCaseWheelContent.items) } } } },
		{ name: 'use-cases-page', props: { menus, content: fill(useCasesContent) } },
	];
	const items: { name: string; props: Record<string, Json>; blank: Record<string, Json> }[] = [
		{ name: 'creative-card', props: { ...shot('An Acme ad'), brand: 'ACME SHOES' }, blank: { brand: 'ACME SHOES', caption: 'New season' } },
		{ name: 'testimonial', props: { quote: 'Acme works.', name: 'Alex', image: shot() }, blank: { quote: 'Acme works.', name: 'Alex' } },
		{ name: 'testimonial-block', props: { quote: 'Acme works.', name: 'Alex', image: IMG }, blank: { quote: 'Acme works.', name: 'Alex' } },
		{ name: 'skeleton', props: { ...shot('An Acme ad') }, blank: {} },
		{ name: 'creative-grid', props: { items: [shot(), shot(), shot()] }, blank: { items: [{ tone: 1 }, { tone: 2 }, { tone: 3 }] } },
		{ name: 'creative-row', props: { items: [shot(), shot(), shot()] }, blank: { items: [{ tone: 1 }, { tone: 2 }, { tone: 3 }] } },
		{ name: 'creative-ring', props: { items: [shot(), shot()] }, blank: { items: [{ tone: 1 }] } },
		{ name: 'creative-corridor', props: { items: [shot(), shot()] }, blank: { items: [{ tone: 1 }] } },
		{ name: 'templates-wall', props: { pictures: [shot(), IMG] }, blank: {} },
		{ name: 'automation-run', props: { items: fill(runPlaceholders) }, blank: {} },
		{ name: 'enterprise-hero', props: { cards: fill(ringPlaceholders) }, blank: {} },
		{ name: 'enterprise-features', props: { content: fill(enterpriseFeaturesContent) }, blank: {} },
		{ name: 'row-fan', props: { rows: fill(templatesPageContent.cities.rows).map((r) => ({ key: r.key, name: r.name, href: r.href, cta: r.line, items: r.items })) }, blank: { rows: templatesPageContent.cities.rows.map((r) => ({ key: r.key, name: r.name, href: r.href, cta: r.line, items: r.items })) } },
		{ name: 'use-case-hero', props: { chat: fill(useCaseChatContent) }, blank: {} },
		{ name: 'mcp-session', props: { content: fill(sessionContent) }, blank: {} },
		{ name: 'use-case-answer', props: { example: fill(useCaseAnswerChat) }, blank: {} },
		// The header's menus: the products live card's picture and the use cases' shots.
		{ name: 'site-header', props: { links: headerNav, menus }, blank: { links: headerNav } },
	];
	return { pages, items, kinds: Object.keys(productVisualDefaults).map((kind) => ({ kind, data: fillVisual(productVisualDefaults[kind as keyof typeof productVisualDefaults]) })) };
}

// ----- React, on the server -----

const COMPONENT: Record<string, string> = {
	'creative-card': 'site/CreativeCard', testimonial: 'site/Testimonial', 'testimonial-block': 'blocks/TestimonialBlock', skeleton: 'ui/Skeleton',
	'creative-grid': 'site/CreativeGrid', 'creative-row': 'site/CreativeRow', 'creative-ring': 'site/CreativeRing', 'creative-corridor': 'site/CreativeCorridor',
	'templates-wall': 'blocks/TemplatesWall', 'automation-run': 'site/AutomationRun', 'enterprise-hero': 'site/EnterpriseHero', 'enterprise-features': 'site/EnterpriseFeatures',
	'site-header': 'site/SiteHeader', 'row-fan': 'site/RowFan', 'use-case-hero': 'site/UseCaseHero', 'mcp-session': 'site/McpSession', 'use-case-answer': 'site/UseCaseAnswer',
};
const pascal = (s: string) => s.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase());
async function component(name: string): Promise<ComponentType<Record<string, unknown>>> {
	const path = COMPONENT[name] ?? `pages/${pascal(name)}`;
	const mod = (await import(/* @vite-ignore */ join(root, 'registry/react/components', `${path}.tsx`))) as Record<string, ComponentType<Record<string, unknown>>>;
	return mod[pascal(name)] ?? mod.default;
}
const render = async (name: string, props: Record<string, Json>) => renderToStaticMarkup(createElement(await component(name), props));
/** Each placeholder's opening tag, to say where one is left. */
const left = (html: string) => [...html.matchAll(/<[a-z][^<>]*\sdata-ds-placeholder(?:="")?[^<>]*>/g)].map((m) => m[0].slice(0, 160));

describe('placeholders (React)', async () => {
	const { pages, items } = await fixtures();
	it.each(pages.map((p, i) => [`${p.name}${p.props.visual ? ` (${p.props.visual})` : ''}`, i] as const))('%s: no placeholder once its pictures are passed', async (_, i) => {
		expect(left(await render(pages[i].name, pages[i].props))).toEqual([]);
	});
	it.each(items.map((x, i) => [x.name, i] as const))('%s: placeholders until images are passed, none after', async (_, i) => {
		const item = items[i];
		const props = item.name === 'skeleton' ? { className: 'h-4 w-48' } : {};
		expect(left(await render(item.name, { ...props, ...item.blank })).length, 'the placeholder carries the marker').toBeGreaterThan(0);
		expect(left(await render(item.name, { ...props, ...item.props }))).toEqual([]);
	});
	it('the pages that ship pictures mark them as placeholders by default', async () => {
		for (const name of SHIPPED) {
			expect(left(await render(name, {})).length, name).toBeGreaterThan(0);
		}
	});
	it('shows the sections given, in that order, and leaves the others out', async () => {
		const at = (html: string, ds: string) => html.indexOf(`data-ds="${ds}"`);
		const home = await render('home-page', { sections: ['close', 'stories', 'hero'] });
		expect(at(home, 'close-block')).toBeLessThan(at(home, 'case-stories-block'));
		expect(at(home, 'case-stories-block')).toBeLessThan(at(home, 'playground-hero'));
		expect(at(home, 'features-block')).toBe(-1);
		const pricing = await render('pricing-page', { sections: ['faq', 'head'] });
		expect(pricing).not.toContain('aria-label="Plans"');
		expect(at(pricing, 'faq-accordion')).toBeLessThan(at(pricing, 'page-head'));
		// The article's own sections stay inside it, where the first of them falls.
		const post = await render('blog-post-page', { sections: ['related', 'body', 'head'] });
		expect(post.indexOf('<article>')).toBeGreaterThan(post.indexOf('class="type-section"'));
		expect(post.indexOf('<header', post.indexOf('<article>'))).toBeGreaterThan(post.indexOf('<article>'));
		expect(at(post, 'offer-block')).toBe(-1);
		expect(at(post, 'creative-card')).toBeGreaterThan(-1);
		expect(await render('error-page', { sections: [] })).not.toContain('data-ds="error-head"');
	});
});

// ----- Web components, in a browser -----

const CHROME = process.env.PARITY_CHROMIUM ?? '/Users/anwarlemu/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const built = existsSync(join(root, 'apps/www/public/elements/shared.js'));
describe.skipIf(!existsSync(CHROME) || !built)('placeholders (web components)', async () => {
	const prefix = JSON.parse(readFileSync(join(root, 'brand/brand.json'), 'utf8')).elementPrefix as string;
	const { pages, items, kinds } = await fixtures();
	const names = [...new Set([...pages.map((p) => p.name), ...items.map((x) => x.name), 'product-visual'])];
	const modules = [...new Set(names.flatMap((n) => JSON.parse(readFileSync(join(root, 'apps/www/public/r', `${n}.json`), 'utf8')).flavors.elements.modules as string[]))];
	let server: Server;
	let base = '';
	beforeAll(async () => {
		const page = `<!doctype html><html><head><link rel="stylesheet" href="/brand.css"></head><body><div id="stage"></div><script type="module">${modules.map((m) => `import '/${m}'`).join('\n')}\nwindow.ready = true</script></body></html>`;
		server = createServer((req, res) => {
			const url = (req.url ?? '/').split('?')[0];
			const file = url === '/' ? null : url === '/brand.css' ? join(root, 'build/brand.css') : join(root, 'apps/www/public', url);
			if (!file) return void res.writeHead(200, { 'content-type': 'text/html' }).end(page);
			if (!existsSync(file)) return void res.writeHead(404).end();
			res.writeHead(200, { 'content-type': extname(file) === '.js' ? 'text/javascript' : extname(file) === '.css' ? 'text/css' : 'application/octet-stream' }).end(readFileSync(file));
		});
		await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
		const address = server.address();
		base = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
	});
	afterAll(() => new Promise<void>((r) => server.close(() => r())));

	it('leaves no placeholder in any page or item once its pictures are passed, and marks them before', async () => {
		const { chromium } = await import('playwright-core');
		const browser = await chromium.launch({ executablePath: CHROME });
		try {
			const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
			const errors: string[] = [];
			p.on('pageerror', (e) => errors.push(e.message));
			await p.goto(base, { waitUntil: 'networkidle' });
			await p.waitForFunction(() => (window as unknown as { ready?: boolean }).ready);
			/** Mounts <prefix-name> with these properties and returns the opening tags of the placeholders left, through every shadow root. */
			const count = (tag: string, props: Record<string, Json>) => p.evaluate(async ({ tag, props }) => {
				const stage = document.getElementById('stage')!;
				stage.replaceChildren();
				const el = document.createElement(tag) as HTMLElement & Record<string, unknown>;
				Object.assign(el, props);
				if (tag.endsWith('-skeleton')) el.className = 'h-4 w-48';
				stage.append(el);
				const settle = async (root: ParentNode) => {
					for (const node of root.querySelectorAll('*')) {
						const host = node as HTMLElement & { updateComplete?: Promise<unknown>; shadowRoot: ShadowRoot | null };
						if (host.updateComplete) await host.updateComplete;
						if (host.shadowRoot) await settle(host.shadowRoot);
					}
				};
				await settle(stage);
				await settle(stage);
				await new Promise((r) => setTimeout(r, 120));
				const found: string[] = [];
				const walk = (root: ParentNode) => {
					for (const node of root.querySelectorAll('*')) {
						if (node.hasAttribute('data-ds-placeholder')) found.push(node.outerHTML.slice(0, 160));
						if ((node as HTMLElement).shadowRoot) walk((node as HTMLElement).shadowRoot!);
					}
				};
				walk(stage);
				return found;
			}, { tag, props });
			const leftover: string[] = [];
			for (const name of SHIPPED) expect((await count(`${prefix}-${name}`, {})).length, `${name} marks its placeholders`).toBeGreaterThan(0);
			for (const page of pages) for (const f of await count(`${prefix}-${page.name}`, page.props)) leftover.push(`${page.name}: ${f}`);
			for (const item of items) {
				expect((await count(`${prefix}-${item.name}`, item.blank)).length, `${item.name} marks its placeholders`).toBeGreaterThan(0);
				for (const f of await count(`${prefix}-${item.name}`, item.props)) leftover.push(`${item.name}: ${f}`);
			}
			// Product visuals draw their scenes at run time: the kinds with pictures mark them, and none is left with data.
			const marked: string[] = [];
			for (const { kind, data } of kinds) {
				if ((await count(`${prefix}-product-visual`, { kind })).length) marked.push(kind);
				for (const f of await count(`${prefix}-product-visual`, { kind, data })) leftover.push(`product-visual ${kind}: ${f}`);
			}
			expect(marked).toEqual(expect.arrayContaining(['brand-record', 'comment-thread', 'filter-narrow', 'collabs-timeline', 'media-mix', 'links-board']));
			expect(leftover).toEqual([]);
			expect(errors).toEqual([]);
		} finally {
			await browser.close();
		}
	});
});
