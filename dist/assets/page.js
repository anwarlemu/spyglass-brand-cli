import { brand } from '../lib/brand.js';
// Pages from the library's sections, for `design page compose`: an outline (checked by the core) becomes a React page
// that imports the installed components (`add` them first), the same page with the web components, and a plain HTML
// page that needs only the brand stylesheet. Only the outline's words go on the page; links default to "#".
export const SECTIONS = [
    { type: 'header', description: 'The site header: the lockup, links, a sign-in and the one White button.', copy: [{ id: 'action' }, { id: 'action-href' }, { id: 'secondary' }, { id: 'secondary-href' }], items: { count: [0, 7], copy: [{ id: 'label', required: true }, { id: 'href' }] } },
    { type: 'hero', description: 'The page head: an eyebrow, the headline, a lead and up to two buttons.', copy: [{ id: 'title', required: true }, { id: 'eyebrow' }, { id: 'description' }, { id: 'primary' }, { id: 'primary-href' }, { id: 'secondary' }, { id: 'secondary-href' }] },
    { type: 'prompt', description: 'The prompt card: a question field and where it works.', copy: [{ id: 'placeholder', required: true }, { id: 'works-label' }], items: { count: [0, 6], copy: [{ id: 'label', required: true }] } },
    { type: 'logos', description: 'A row of names set as wordmarks (Acme, never real companies).', copy: [{ id: 'label' }], items: { count: [2, 8], copy: [{ id: 'name', required: true }] } },
    { type: 'features', description: 'Cards of features: a title and a line each.', copy: [{ id: 'title' }, { id: 'description' }], items: { count: [2, 9], copy: [{ id: 'title', required: true }, { id: 'body', required: true }] } },
    { type: 'stats', description: 'Figures with a line each.', copy: [{ id: 'title' }], items: { count: [1, 4], copy: [{ id: 'value', required: true }, { id: 'label', required: true }] } },
    { type: 'testimonial', description: 'One quote with a name and role (Acme, never a real person).', copy: [{ id: 'quote', required: true }, { id: 'name', required: true }, { id: 'role' }, { id: 'label' }] },
    { type: 'pricing', description: 'Plans side by side: a name, the price, what it includes and a button.', copy: [{ id: 'title' }, { id: 'description' }], items: { count: [1, 4], copy: [{ id: 'title', required: true }, { id: 'price' }, { id: 'features' }, { id: 'cta' }, { id: 'href' }] } },
    { type: 'faq', description: 'Questions and answers.', copy: [{ id: 'title' }], items: { count: [1, 20], copy: [{ id: 'question', required: true }, { id: 'answer', required: true }] } },
    { type: 'cta', description: 'The closing offer: a headline, the terms and the White button.', copy: [{ id: 'title', required: true }, { id: 'note' }, { id: 'primary' }, { id: 'primary-href' }] },
    { type: 'footer', description: 'The site footer: the wordmark, link columns and the legal line.', copy: [{ id: 'legal' }], items: { count: [1, 6], copy: [{ id: 'title', required: true }, { id: 'links', required: true }] } },
];
const href = (v) => v?.trim() || '#';
const split = (v) => (v ? v.split('|').map((x) => x.trim()).filter(Boolean) : []);
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const attr = (v) => esc(typeof v === 'string' ? v : JSON.stringify(v)).replace(/'/g, '&#39;');
const js = (v) => JSON.stringify(v);
/** "Docs, /docs | Blog, /blog" as links: a label, then an optional address. */
const linksOf = (v) => split(v).map((p) => {
    const [label, to] = p.split(',').map((x) => x.trim());
    return { label: label, href: href(to) };
});
/** What each section needs, as data both flavors set the same way. */
function dataOf(s) {
    const c = s.copy ?? {};
    const items = s.items ?? [];
    switch (s.type) {
        case 'header':
            return { links: items.map((i) => ({ label: i.label, href: href(i.href) })), ...(c.action ? { cta: { label: c.action, href: href(c['action-href']) } } : {}), ...(c.secondary ? { secondary: { label: c.secondary, href: href(c['secondary-href']) } } : {}) };
        case 'features':
            return { features: items.map((i) => ({ title: i.title, body: i.body })) };
        case 'stats':
            return { stats: items.map((i) => ({ value: i.value, label: i.label })) };
        case 'pricing':
            return { plans: items.map((i) => ({ title: i.title, ...(i.price ? { price: i.price } : {}), ...(i.features ? { features: split(i.features) } : {}), ...(i.cta ? { cta: i.cta, href: href(i.href) } : {}) })) };
        case 'faq':
            return { items: items.map((i) => ({ q: i.question, a: i.answer })) };
        case 'logos':
            return { names: items.map((i) => i.name) };
        case 'footer':
            return { columns: items.map((i) => ({ title: i.title, links: linksOf(i.links) })) };
        default:
            return {};
    }
}
/** The page as React: one file importing the installed components. */
function react(o) {
    const imports = new Map();
    const use = (name, group) => imports.set(name, `@/components/${group}/${name}`);
    const parts = [];
    for (const s of o.sections) {
        const c = s.copy ?? {};
        const d = dataOf(s);
        const button = (label, to, variant) => (label ? (use('Button', 'ui'), `<Button href=${js(href(to))}${variant === 'primary' ? '' : ` variant="${variant}"`}>{${js(label)}}</Button>`) : '');
        switch (s.type) {
            case 'header':
                use('SiteHeader', 'site');
                parts.push(`<div className="mx-auto w-full max-w-page-wide px-(--ds-layout-gutter)"><SiteHeader links={${js(d.links)}}${d.cta ? ` cta={${js(d.cta)}}` : ''}${d.secondary ? ` secondary={${js(d.secondary)}}` : ''} /></div>`);
                break;
            case 'hero': {
                use('HeroBlock', 'blocks');
                const actions = [button(c.primary, c['primary-href'], 'primary'), button(c.secondary, c['secondary-href'], 'secondary')].filter(Boolean);
                parts.push(`<HeroBlock placement="center" light="none" headline={${js(c.title)}}${c.eyebrow ? ` eyebrow={${js(c.eyebrow)}}` : ''}${c.description ? ` body={${js(c.description)}}` : ''}${actions.length ? ` actions={<>${actions.join('')}</>}` : ''} />`);
                break;
            }
            case 'prompt':
                use('PromptCard', 'product');
                parts.push(`<div className="mx-auto flex w-full max-w-page-wide justify-center px-(--ds-layout-gutter) pb-(--ds-layout-section)"><PromptCard placeholder={${js(c.placeholder)}}${c['works-label'] ? ` worksLabel={${js(c['works-label'])}}` : ''}${s.items?.length ? ` works={${js(s.items.map((i) => i.label))}}` : ''} /></div>`);
                break;
            case 'logos':
                use('LogoStripBlock', 'blocks');
                parts.push(section(`<LogoStripBlock names={${js(d.names)}}${c.label ? ` label={${js(c.label)}}` : ''} />`));
                break;
            case 'features':
                use('FeatureGridBlock', 'blocks');
                parts.push(section(`<FeatureGridBlock features={${js(d.features)}}${c.title ? ` title={${js(c.title)}}` : ''}${c.description ? ` body={${js(c.description)}}` : ''} />`));
                break;
            case 'stats':
                use('StatBlock', 'blocks');
                parts.push(section(`<StatBlock stats={${js(d.stats)}}${c.title ? ` title={${js(c.title)}}` : ''} />`));
                break;
            case 'testimonial':
                use('TestimonialBlock', 'blocks');
                parts.push(section(`<TestimonialBlock quote={${js(c.quote)}} name={${js(c.name)}}${c.role ? ` position={${js(c.role)}}` : ''}${c.label ? ` label={${js(c.label)}}` : ''} image={false} />`));
                break;
            case 'pricing':
                use('PricingTableBlock', 'blocks');
                parts.push(section(`<PricingTableBlock plans={${js(d.plans)}}${c.title ? ` title={${js(c.title)}}` : ''}${c.description ? ` body={${js(c.description)}}` : ''} />`));
                break;
            case 'faq':
                use('FaqBlock', 'blocks');
                parts.push(section(`<FaqBlock items={${js(d.items)}}${c.title ? ` title={${js(c.title)}}` : ''} />`));
                break;
            case 'cta':
                use('OfferBlock', 'blocks');
                parts.push(`<OfferBlock headline={${js(c.title)}}${c.note ? ` note={${js(c.note)}}` : ''}${c.primary ? ` cta={${js({ label: c.primary, href: href(c['primary-href']) })}}` : ''} />`);
                break;
            case 'footer':
                use('SiteFooter', 'blocks');
                parts.push(`<SiteFooter columns={${js(d.columns)}}${c.legal ? ` legal={${js(c.legal)}}` : ''} />`);
                break;
        }
    }
    const lines = [...imports].map(([name, path]) => `import { ${name} } from '${path}'`);
    const title = o.title ? `// ${o.title}\n` : '';
    return { 'page.tsx': `${title}${lines.join('\n')}\n\nexport default function Page() {\n  return (\n    <main className="bg-surface text-fg">\n      ${parts.join('\n      ')}\n    </main>\n  )\n}\n` };
}
const section = (inner) => `<section className="mx-auto w-full max-w-page-wide px-(--ds-layout-gutter) py-(--ds-layout-section)">${inner}</section>`;
/** The page with the web components: the modules from the app's static folder, the brand stylesheet. */
function elements(o) {
    const p = brand().elementPrefix;
    const base = brand().assetBase;
    const used = new Set();
    const tag = (name, attrs, inner = '') => {
        used.add(name);
        const a = Object.entries(attrs).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => ` ${k}='${attr(v)}'`).join('');
        return `<${p}-${name}${a}>${inner}</${p}-${name}>`;
    };
    const wrap = (inner, pad = true) => `<section style="max-width: calc(var(--ds-layout-content) + 2 * var(--ds-layout-gutter)); margin: 0 auto; padding: ${pad ? 'var(--ds-layout-section)' : '0'} var(--ds-layout-gutter);">${inner}</section>`;
    const parts = [];
    for (const s of o.sections) {
        const c = s.copy ?? {};
        const d = dataOf(s);
        const button = (label, to, variant) => (label ? (used.add('button'), `<${p}-button slot="actions" href="${esc(href(to))}"${variant === 'primary' ? '' : ` variant="${variant}"`}>${esc(label)}</${p}-button>`) : '');
        switch (s.type) {
            case 'header':
                parts.push(wrap(tag('site-header', { links: d.links, cta: d.cta, secondary: d.secondary }), false));
                break;
            case 'hero':
                parts.push(tag('hero-block', { headline: c.title, eyebrow: c.eyebrow, body: c.description, placement: 'center', light: 'none' }, button(c.primary, c['primary-href'], 'primary') + button(c.secondary, c['secondary-href'], 'secondary')));
                break;
            case 'prompt':
                parts.push(wrap(`<div style="display: flex; justify-content: center;">${tag('prompt-card', { placeholder: c.placeholder, 'works-label': c['works-label'], works: s.items?.length ? s.items.map((i) => i.label) : undefined })}</div>`));
                break;
            case 'logos':
                parts.push(wrap(tag('logo-strip-block', { names: d.names, label: c.label })));
                break;
            case 'features':
                parts.push(wrap(tag('feature-grid-block', { features: d.features, heading: c.title, body: c.description })));
                break;
            case 'stats':
                parts.push(wrap(tag('stat-block', { stats: d.stats, heading: c.title })));
                break;
            case 'testimonial':
                parts.push(wrap(tag('testimonial-block', { quote: c.quote, name: c.name, position: c.role, label: c.label, image: 'false' })));
                break;
            case 'pricing':
                parts.push(wrap(tag('pricing-table-block', { plans: d.plans, heading: c.title, body: c.description })));
                break;
            case 'faq':
                parts.push(wrap(tag('faq-block', { items: d.items, heading: c.title })));
                break;
            case 'cta':
                parts.push(tag('offer-block', { headline: c.title, note: c.note, cta: c.primary ? { label: c.primary, href: href(c['primary-href']) } : undefined }));
                break;
            case 'footer':
                parts.push(tag('site-footer', { columns: d.columns, legal: c.legal }));
                break;
        }
    }
    const scripts = [...used].sort().map((n) => `  <script type="module" src="${base}/elements/${n}.js"></script>`).join('\n');
    return { 'index.html': `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>${esc(o.title ?? brand().name)}</title>\n  <link rel="stylesheet" href="${base}/brand.css">\n${scripts}\n</head>\n<body>\n<main>\n${parts.join('\n')}\n</main>\n</body>\n</html>\n` };
}
/** The page as plain HTML on the brand stylesheet: no script, the brand's tokens in a few rules. */
function html(o) {
    const parts = [];
    for (const s of o.sections) {
        const c = s.copy ?? {};
        const items = s.items ?? [];
        const d = dataOf(s);
        const btn = (label, to, quiet = false) => (label ? `<a class="btn${quiet ? ' btn-quiet' : ''}" href="${esc(href(to))}">${esc(label)}</a>` : '');
        const head = (t, b) => `${t ? `<h2 class="head">${esc(t)}</h2>` : ''}${b ? `<p class="lead">${esc(b)}</p>` : ''}`;
        switch (s.type) {
            case 'header':
                parts.push(`<header class="bar wrap"><a class="home" href="/">${esc(brand().name)}</a><nav>${d.links.map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}</nav><div class="row">${c.secondary ? `<a href="${esc(href(c['secondary-href']))}">${esc(c.secondary)}</a>` : ''}${btn(c.action, c['action-href'])}</div></header>`);
                break;
            case 'hero':
                parts.push(`<section class="wrap hero">${c.eyebrow ? `<p class="label">${esc(c.eyebrow)}</p>` : ''}<h1 class="head">${esc(c.title)}</h1>${c.description ? `<p class="lead">${esc(c.description)}</p>` : ''}<div class="row">${btn(c.primary, c['primary-href'])}${btn(c.secondary, c['secondary-href'], true)}</div></section>`);
                break;
            case 'prompt':
                parts.push(`<section class="wrap"><form class="prompt"><textarea rows="2" placeholder="${esc(c.placeholder)}" aria-label="${esc(c.placeholder)}"></textarea>${c['works-label'] || items.length ? `<p class="meta">${esc(c['works-label'] ?? '')} ${items.map((i) => esc(i.label)).join(' · ')}</p>` : ''}</form></section>`);
                break;
            case 'logos':
                parts.push(`<section class="wrap">${c.label ? `<p class="label">${esc(c.label)}</p>` : ''}<p class="logos">${items.map((i) => `<span>${esc(i.name)}</span>`).join('')}</p></section>`);
                break;
            case 'features':
                parts.push(`<section class="wrap">${head(c.title, c.description)}<div class="grid">${items.map((i) => `<article class="card"><h3>${esc(i.title)}</h3><p>${esc(i.body)}</p></article>`).join('')}</div></section>`);
                break;
            case 'stats':
                parts.push(`<section class="wrap">${head(c.title)}<dl class="grid">${items.map((i) => `<div><dt class="figure">${esc(i.value)}</dt><dd>${esc(i.label)}</dd></div>`).join('')}</dl></section>`);
                break;
            case 'testimonial':
                parts.push(`<section class="wrap"><figure>${c.label ? `<p class="label">${esc(c.label)}</p>` : ''}<blockquote class="head">${esc(c.quote)}</blockquote><figcaption>${esc(c.name)}${c.role ? `<span class="label"> ${esc(c.role)}</span>` : ''}</figcaption></figure></section>`);
                break;
            case 'pricing':
                parts.push(`<section class="wrap">${head(c.title, c.description)}<div class="grid">${items.map((i) => `<article class="card"><h3>${esc(i.title)}</h3>${i.price ? `<p>${esc(i.price)}</p>` : ''}${i.features ? `<ul>${split(i.features).map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}${btn(i.cta, i.href)}</article>`).join('')}</div></section>`);
                break;
            case 'faq':
                parts.push(`<section class="wrap faq">${head(c.title)}<div>${items.map((i) => `<details><summary>${esc(i.question)}</summary><p>${esc(i.answer)}</p></details>`).join('')}</div></section>`);
                break;
            case 'cta':
                parts.push(`<section class="wrap hero"><h2 class="head">${esc(c.title)}</h2>${c.note ? `<p class="label">${esc(c.note)}</p>` : ''}<div class="row">${btn(c.primary, c['primary-href'])}</div></section>`);
                break;
            case 'footer':
                parts.push(`<footer class="wrap"><div class="card"><div class="grid">${d.columns.map((col) => `<div><h2>${esc(col.title)}</h2>${col.links.map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}</div>`).join('')}</div>${c.legal ? `<p class="meta">${esc(c.legal)}</p>` : ''}</div></footer>`);
                break;
        }
    }
    const css = `body{margin:0;background:var(--ds-color-surface);color:var(--ds-color-fg)}
.wrap{max-width:var(--ds-layout-content);margin:0 auto;padding:var(--ds-layout-section) var(--ds-layout-gutter)}
.bar{display:flex;align-items:center;justify-content:space-between;gap:24px;height:var(--ds-size-header);padding-block:0}
.bar nav,.row{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
.bar a,.faq summary{color:var(--ds-color-fg-soft);text-decoration:none;font-size:var(--ds-text-ui);transition:color var(--ds-duration-micro) var(--ds-easing-out)}
@media (hover:hover){.bar a:hover{color:var(--ds-color-fg)}}
.home{font-family:var(--ds-font-heading);font-size:var(--ds-text-heading-4);color:var(--ds-color-fg)!important}
.head{font-family:var(--ds-font-heading);font-weight:var(--ds-font-weight-heading);font-size:var(--ds-text-heading-2);line-height:var(--ds-text-heading-2-leading);margin:0 0 16px;text-wrap:balance}
@media (min-width:768px){.head{font-size:var(--ds-text-heading-1);line-height:var(--ds-text-heading-1-leading)}}
@media (min-width:1024px){.head{font-size:var(--ds-text-hero);line-height:var(--ds-text-hero-leading)}}
.hero{text-align:center}.hero .row{justify-content:center}
.lead{font-size:var(--ds-text-body-lg);line-height:var(--ds-text-body-lg-leading);color:var(--ds-color-fg-soft);max-width:var(--ds-layout-measure);margin:0 auto 24px}
.label{font-size:var(--ds-text-label);font-weight:var(--ds-font-weight-medium);letter-spacing:var(--ds-tracking-label);text-transform:uppercase;color:var(--ds-color-fg-muted)}
.meta{font-size:var(--ds-text-ui);color:var(--ds-color-fg-muted)}
.btn{display:inline-flex;align-items:center;height:var(--ds-size-control-md);padding:0 16px;border-radius:var(--ds-radius-control);background:var(--ds-color-action-primary);color:var(--ds-color-action-primary-fg);font-size:var(--ds-text-ui);font-weight:var(--ds-font-weight-medium);text-decoration:none;transition:background-color var(--ds-duration-micro) var(--ds-easing-out)}
.btn-quiet{background:var(--ds-color-action-secondary);color:var(--ds-color-action-secondary-fg);box-shadow:inset 0 0 0 1px var(--ds-color-action-secondary-edge)}
@media (hover:hover){.btn:hover{background:var(--ds-color-action-primary-hover)}.btn-quiet:hover{background:var(--ds-color-action-secondary-hover)}}
.grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));margin:0}
.card{background:var(--ds-color-surface-raised);border-radius:var(--ds-radius-container);padding:24px}
.card h3,footer h2{font-family:var(--ds-font-heading);font-weight:400;font-size:var(--ds-text-heading-3);margin:0 0 8px}
.card p,dd,.faq p{color:var(--ds-color-fg-soft);margin:0}
.figure{font-family:var(--ds-font-heading);font-size:var(--ds-text-hero)}
.prompt{max-width:800px;margin:0 auto;background:var(--ds-color-surface-subtle);border-radius:var(--ds-radius-lg);box-shadow:inset 0 0 0 1px var(--ds-color-edge-strong);padding:12px}
.prompt textarea{width:100%;background:transparent;border:0;color:var(--ds-color-fg);font:inherit;resize:none;outline:none;padding:12px 16px}
.logos{display:flex;flex-wrap:wrap;gap:48px;font-family:var(--ds-font-heading);font-size:var(--ds-text-heading-3);color:var(--ds-color-fg-muted)}
.faq details{border-top:1px solid var(--ds-color-edge);padding:20px 0}
footer a{display:block;color:var(--ds-color-fg-soft);text-decoration:none;padding:4px 0}`;
    return { 'page.html': `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>${esc(o.title ?? brand().name)}</title>\n  <link rel="stylesheet" href="${brand().assetBase}/brand.css">\n  <style>\n${css}\n  </style>\n</head>\n<body>\n<main>\n${parts.join('\n')}\n</main>\n</body>\n</html>\n` };
}
export async function writePage(o, flavor) {
    if (flavor === 'react')
        return react(o);
    if (flavor === 'elements')
        return elements(o);
    if (flavor === 'html')
        return html(o);
    throw new Error(`Pages come as react, elements or html, not ${flavor}.`);
}
