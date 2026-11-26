import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { brand, packageRoot, tokens } from '../lib/brand.js';
// Emails as mail clients read them: one 600px table, every style inline, colors resolved from the tokens (Black ground,
// White type, the #262626 card, #363636 rules), the brand faces named first with system fallbacks (most clients do not
// load web fonts), the lockup as a PNG beside the file (mail cannot take SVG), and a preheader. Only the words passed
// are set; nothing is invented. Four kinds: newsletter, announcement, receipt and password-reset.
const require = createRequire(import.meta.url);
const { Resvg } = require('@resvg/resvg-js');
export const EMAIL_FLAGS = ['set', 'input', 'out', 'list', 'sample'];
export const EMAILS = {
    newsletter: {
        description: 'A headline, a lead, up to three stories (title, line, link) and a button.',
        slots: [{ id: 'preheader', note: 'the line inboxes show after the subject' }, { id: 'headline', required: true, note: '' }, { id: 'lead', note: '' }, { id: 'stories', note: 'Title | line | https://link, one story per line' }, { id: 'cta', note: 'the button' }, { id: 'cta-href', note: '' }, { id: 'footer', note: 'the address and unsubscribe line' }],
        sample: { preheader: 'What changed this week.', headline: 'What changed this week.', lead: 'Three launches worth a look.', stories: 'Acme ships alerts | Know the day a brand launches. | https://acme.com/alerts\nBoards for teams | Share a board with one link. | https://acme.com/boards', cta: 'Read more', 'cta-href': 'https://acme.com', footer: 'Acme Inc., 1 Market St. Unsubscribe at acme.com/unsubscribe' },
    },
    announcement: {
        description: 'One piece of news: a label, the headline, a paragraph and a button.',
        slots: [{ id: 'preheader', note: '' }, { id: 'label', note: 'a short label in capitals' }, { id: 'headline', required: true, note: '' }, { id: 'body', note: '' }, { id: 'cta', note: '' }, { id: 'cta-href', note: '' }, { id: 'footer', note: '' }],
        sample: { label: 'New', headline: 'Alerts for every launch.', body: 'Know the day a brand ships a new ad.', cta: 'Turn on alerts', 'cta-href': 'https://acme.com/alerts', footer: 'Acme Inc., 1 Market St.' },
    },
    receipt: {
        description: 'A receipt: the headline, line items with amounts, the total and a note.',
        slots: [{ id: 'preheader', note: '' }, { id: 'headline', required: true, note: '' }, { id: 'items', required: true, note: 'Item | amount, one per line' }, { id: 'total', required: true, note: '' }, { id: 'note', note: '' }, { id: 'footer', note: '' }],
        sample: { headline: 'Your receipt from Acme.', items: 'Pro plan, one month | $20.00\nExtra credits | $5.00', total: '$25.00', note: 'Charged to the card ending 4242 on June 1.', footer: 'Acme Inc., 1 Market St.' },
    },
    'password-reset': {
        description: 'A reset link: the headline, a line, the button and what to do if it was not asked for.',
        slots: [{ id: 'preheader', note: '' }, { id: 'headline', required: true, note: '' }, { id: 'body', note: '' }, { id: 'cta', required: true, note: '' }, { id: 'cta-href', required: true, note: '' }, { id: 'note', note: '' }, { id: 'footer', note: '' }],
        sample: { headline: 'Reset your password.', body: 'The link works for one hour.', cta: 'Choose a new password', 'cta-href': 'https://acme.com/reset', note: 'If you did not ask for this, ignore this email.', footer: 'Acme Inc., 1 Market St.' },
    },
};
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const hex = (name) => tokens()[name]?.light ?? '#000000';
export function emailHelp() {
    const b = brand().bin;
    return `Emails as mail clients read them: one 600px table, every style inline, the brand's colors and faces, the lockup as a PNG.

  ${b} email newsletter --set headline="..." --set stories="Title | line | https://link"
  ${b} email receipt --set headline="..." --set items="Pro plan | $20.00" --set total="$20.00"
  ${b} email password-reset --sample        The sample copy (Acme), to look at it

${Object.entries(EMAILS).map(([id, k]) => `  ${id.padEnd(16)}${k.description}\n${k.slots.map((s) => `      ${s.id}${s.required ? ' (required)' : ''}${s.note ? `: ${s.note}` : ''}`).join('\n')}`).join('\n')}

It writes <kind>.html and logo.png beside it: upload the PNG and point the img at its address.`;
}
export function renderEmail(kind, copy, logoSrc = 'logo.png') {
    const k = EMAILS[kind];
    if (!k)
        throw new Error(`Unknown email \`${kind}\`. Emails: ${Object.keys(EMAILS).join(', ')}.`);
    const missing = k.slots.filter((s) => s.required && !copy[s.id]?.trim()).map((s) => s.id);
    if (missing.length)
        throw new Error(`${kind} needs ${missing.map((m) => `--set ${m}=...`).join(' and ')} (--sample fills sample copy).`);
    const extra = Object.keys(copy).filter((c) => !k.slots.some((s) => s.id === c));
    if (extra.length)
        throw new Error(`${kind} does not take ${extra.join(', ')}. It takes ${k.slots.map((s) => s.id).join(', ')}.`);
    const c = { ground: hex('--ds-color-black'), card: hex('--ds-color-neutral-4'), fg: hex('--ds-color-white'), soft: hex('--ds-color-neutral-11'), muted: hex('--ds-color-neutral-9'), rule: hex('--ds-color-neutral-5'), button: hex('--ds-color-white'), buttonFg: hex('--ds-color-black') };
    const head = `'Funnel Display', 'Helvetica Neue', Arial, sans-serif`;
    const text = `'DM Sans', 'Helvetica Neue', Arial, sans-serif`;
    const row = (inner, pad = '0 40px') => `<tr><td style="padding:${pad};">${inner}</td></tr>`;
    const h1 = (t) => row(`<h1 style="margin:0;font-family:${head};font-weight:450;font-size:32px;line-height:36px;color:${c.fg};">${esc(t)}</h1>`, '32px 40px 0');
    const p = (t, color = c.soft, pad = '16px 40px 0') => row(`<p style="margin:0;font-family:${text};font-size:16px;line-height:24px;color:${color};">${esc(t)}</p>`, pad);
    const button = (label, href) => row(`<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-radius:8px;background:${c.button};"><a href="${esc(href || '#')}" style="display:inline-block;padding:10px 16px;font-family:${text};font-weight:500;font-size:14px;line-height:20px;color:${c.buttonFg};text-decoration:none;border-radius:8px;">${esc(label)}</a></td></tr></table>`, '32px 40px 0');
    const rule = row(`<div style="height:1px;line-height:1px;font-size:1px;background:${c.rule};">&nbsp;</div>`, '32px 40px 0');
    const parts = [];
    if (copy.label)
        parts.push(row(`<p style="margin:0;font-family:${text};font-weight:500;font-size:12px;line-height:16px;letter-spacing:0.72px;text-transform:uppercase;color:${c.muted};">${esc(copy.label)}</p>`, '32px 40px 0'));
    parts.push(h1(copy.headline));
    if (copy.lead)
        parts.push(p(copy.lead));
    if (copy.body)
        parts.push(p(copy.body));
    if (kind === 'newsletter' && copy.stories) {
        for (const line of copy.stories.split('\n').map((l) => l.trim()).filter(Boolean)) {
            const [title, line2, href] = line.split('|').map((x) => x.trim());
            parts.push(row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${c.card};border-radius:4px;"><tr><td style="padding:24px;"><p style="margin:0;font-family:${head};font-size:24px;line-height:28px;color:${c.fg};">${href ? `<a href="${esc(href)}" style="color:${c.fg};text-decoration:none;">${esc(title ?? '')}</a>` : esc(title ?? '')}</p>${line2 ? `<p style="margin:8px 0 0;font-family:${text};font-size:16px;line-height:24px;color:${c.soft};">${esc(line2)}</p>` : ''}</td></tr></table>`, '24px 40px 0'));
        }
    }
    if (kind === 'receipt') {
        const items = copy.items.split('\n').map((l) => l.split('|').map((x) => x.trim())).filter((x) => x[0]);
        const cells = items.map(([name, amount]) => `<tr><td style="padding:12px 0;border-top:1px solid ${c.rule};font-family:${text};font-size:16px;line-height:24px;color:${c.soft};">${esc(name)}</td><td align="right" style="padding:12px 0;border-top:1px solid ${c.rule};font-family:${text};font-size:16px;line-height:24px;color:${c.soft};">${esc(amount ?? '')}</td></tr>`).join('');
        parts.push(row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${cells}<tr><td style="padding:12px 0;border-top:1px solid ${c.rule};font-family:${text};font-weight:500;font-size:16px;line-height:24px;color:${c.fg};">Total</td><td align="right" style="padding:12px 0;border-top:1px solid ${c.rule};font-family:${head};font-size:24px;line-height:28px;color:${c.fg};">${esc(copy.total)}</td></tr></table>`, '24px 40px 0'));
    }
    if (copy.cta)
        parts.push(button(copy.cta, copy['cta-href']));
    if (copy.note)
        parts.push(p(copy.note, c.muted, '24px 40px 0'));
    if (copy.footer)
        parts.push(rule, p(copy.footer, c.muted, '16px 40px 0'));
    const pre = copy.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(copy.preheader)}</div>` : '';
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>${esc(copy.headline)}</title>
</head>
<body style="margin:0;padding:0;background:${c.ground};">
${pre}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${c.ground};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${c.ground};">
${row(`<img src="${esc(logoSrc)}" width="132" height="20" alt="${esc(brand().name)}" style="display:block;border:0;">`, '24px 40px 0')}
${parts.join('\n')}
<tr><td style="padding:40px 0 0;"></td></tr>
</table>
</td></tr>
</table>
</body>
</html>
`;
}
export function runEmail(cwd, args, flags, log = console.log) {
    if (flags.list || !args[0]) {
        log(emailHelp());
        return [];
    }
    const kind = args[0];
    const k = EMAILS[kind];
    if (!k)
        throw new Error(`Unknown email \`${kind}\`. Emails: ${Object.keys(EMAILS).join(', ')}.`);
    const copy = flags.sample ? { ...k.sample } : {};
    if (typeof flags.input === 'string')
        Object.assign(copy, JSON.parse(readFileSync(resolve(cwd, flags.input), 'utf8')));
    for (const s of [].concat(flags.set ?? [])) {
        const at = s.indexOf('=');
        if (at < 1)
            throw new Error(`--set takes slot=words, not "${s}".`);
        copy[s.slice(0, at).trim()] = s.slice(at + 1).replace(/\\n/g, '\n');
    }
    const out = resolve(cwd, typeof flags.out === 'string' ? flags.out : 'email');
    mkdirSync(out, { recursive: true });
    const html = renderEmail(kind, copy);
    const svg = readFileSync(join(packageRoot, 'brand', 'logo', 'svg', 'horizontal-white.svg'), 'utf8');
    writeFileSync(join(out, `${kind}.html`), html);
    writeFileSync(join(out, 'logo.png'), new Resvg(svg, { fitTo: { mode: 'height', value: 40 } }).render().asPng());
    const files = [join(out, `${kind}.html`), join(out, 'logo.png')];
    for (const f of files)
        log(f);
    return files;
}
