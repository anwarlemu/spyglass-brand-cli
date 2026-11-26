import { resolve } from 'node:path';
import { brand, registryHost } from './lib/brand.js';
import { formatFinding, hookCheck, runCheck } from './check/engine.js';
import { add, update } from './commands/add.js';
import { apply, formatApply, readState } from './commands/apply.js';
import { describeProject, init } from './commands/init.js';
import { flavorLabel } from './commands/add.js';
import { diff, formatInfo, formatView, info, search, view } from './commands/library.js';
import { brandHelp, principlesHelp, runBrand, runPrinciples } from './commands/brand.js';
import { componentHelp, runComponent } from './commands/component.js';
import { IMAGE_FLAGS, imageHelp, runImage } from './commands/image.js';
import { DECK_FLAGS, deckHelp, runDeck } from './commands/deck.js';
import { MERCH_FLAGS, merchHelp, runMerch } from './commands/merch.js';
import { slotNames } from './assets/templates.js';
import { formatManifest, manifest, manifestHelp } from './commands/manifest.js';
import { findTokens, list } from './commands/small.js';
import { runVideo, VIDEO_FLAGS, videoHelp } from './commands/video.js';
import { patternHelp, runAscii, runLight } from './commands/pattern.js';
import { helpRow } from './lib/help-row.js';
import { ILLUSTRATE_FLAGS, illustrateHelp, runIllustrate } from './commands/illustrate.js';
import { RECIPE_FLAGS, runRecipe } from './commands/recipe.js';
import { ICONS_FLAGS, iconsHelp, runIcons } from './commands/icons.js';
import { EMAIL_FLAGS, emailHelp, runEmail } from './commands/email.js';
import { FIGMA_FLAGS, figmaHelp, runFigma } from './commands/figma.js';
import { suggest } from './lib/names.js';
import { AD_FLAGS, adHelp, runAd } from './commands/ad.js';
const HELP = () => {
    const b = brand().bin;
    const row = (cmd, what) => helpRow(`${b} ${cmd}`, what, 44);
    const more = (text) => `      ${text}`;
    return [
        `${brand().name} design system (${b})`,
        '',
        'Restyle an app:',
        row('apply', "The whole app: style values to the brand's tokens, the library's look on buttons,"),
        `  ${''.padEnd(44)}fields, cards, dialogs, tables...; theme and fonts installed`,
        row('apply button card dialog', "Only those kinds, wherever the app uses them (its components and elements)"),
        row('apply /settings /billing', 'Only those pages (by route), with the components only they use'),
        row('apply app/settings/page.tsx', 'Pages by file (or a glob in quotes); an app component by name (PrimaryButton)'),
        more('any stack: Vue, React, Svelte, Astro, Angular, Solid, HTML, ERB, Blade, Django, PHP, Liquid, Twig...'),
        row('apply --components button,card --pages /settings', ''),
        more('--with-shared  include layouts and components other pages share'),
        more('--dry-run [--json]  list every file it would touch and why, write nothing'),
        more('--redo  repeat the recorded scope (.ds/state.json)'),
        '',
        'Use the library:',
        row('add <item...>', 'Copy items (Button, alert-dialog, badge...) and what they need into the app'),
        more('in its flavor: React (Next, Vite, React Router), web components (everything else)'),
        more('--framework react|elements   --dry-run   --overwrite   --no-install (skip packages)'),
        row('add --update', 'Every installed item to this version: prebuilt modules replaced, files you changed kept (--overwrite replaces them)'),
        row('view <item...> [--source]', 'How to use an item: rules, props, slots, events, examples, source'),
        row('search <words>', 'Find items by what they do'),
        row('list', 'Every item, with what it requires'),
        row('diff <item...>', "Your copy of an item against the library's"),
        '',
        'The app:',
        row('info', "The app's setup, installed items, applied scope and what to run next"),
        row('init', 'The brand stylesheet, theme, fonts and agent contract only'),
        row('check [paths...] [--fix] [--all]', 'Values off the tokens (the applied scope; --all for every file)'),
        row('tokens [term...]', 'Find tokens by name or value (no match is an error)'),
        row('hook', "An agent's edit hook: checks the files its payload names (stdin), exit 2 on findings"),
        '',
        'For an agent, start with manifest --json. It lists every command, template, size, component, token and rule.',
        row('manifest', 'That document. describe is the same command'),
        row('brand [--section color]', 'Tokens, fonts, logos and voice. colour is color. --token --ds-color-fg reads one'),
        row('principles [--surface product]', 'Product and website rules. Surfaces: product, website, all'),
        row('component list', 'Components with group ids, parts and states'),
        row('component inspect <item>', 'Props, slots, states and examples. --part --source'),
        row('component emit <item>', 'React for one state. --state variant:secondary, --state example:Variants, --prop name=value'),
        '',
        'Brand graphics:',
        row('light --variant band --seed 1', 'The brand light as SVG or PNG, seeded (--source brand|generated, --list)'),
        row('ascii --seed 4', 'The ASCII texture as SVG or PNG, seeded (--density, --ground)'),
        row('email <kind>', 'Emails as mail clients read them (tables, inline styles): newsletter, announcement, receipt, password-reset'),
        row('icons', 'The favicon set, app icons, a maskable icon, avatars and the web manifest'),
        row('ad brief.md', 'Static ads from a brief: 2 to 4 per size, design files and a labeled sheet (--image, --format)'),
        row('recipe <name>', 'Ready layouts for what no template covers: display ads, cards, print, email, backgrounds (--list)'),
        row('illustrate <style>', 'Brand imagery: pattern, light, texture, split (--image), --list'),
        row('figma tokens|push|pull|check', 'Files and the ordered Figma MCP calls; the CLI never calls Figma'),
        '',
        'Assets (PNG and SVG from the brand assets page; --list on each shows templates, sizes and slots):',
        row('image post-offer --headline "..."', 'Posts, ads, banners, avatar, logo backgrounds, Open Graph, story'),
        more('--size og,story,x-banner|all|custom   --theme   --image <file> (repeat)   --seed   --light   --input carousel.json   --sample'),
        more('--format png,svg,jpg,webp   --scale   --out'),
        row('deck --input deck.json', 'Pitch deck slides at 1920x1080 as PNG and one PDF (--slide <type> for one)'),
        row('video --template light-band --size square', 'Seamless loops of the light: MP4 and WebM via ffmpeg, else frames'),
        row('merch --item tee-front --variant full-color', 'Print files: SVG at physical size, PNG at 300 dpi, with bleed (--list)'),
        '',
        'Make it, then revise it until it is right:',
        row('design new og --headline "..." -o og.design.json', 'A design file and its PNG, checked against the brand'),
        row('design revise og.design.json "bigger headline, logo top right"', 'Plain words; anything it does not understand changes nothing'),
        row('design edit | undo | variants | sizes | compare | check', 'Exact edits, history, alternatives, other sizes (design --help)'),
        '',
        'Common options: --cwd <dir> (default: the current folder), --json (machine output on stdout).',
        `Registry: ${registryHost()}/r/index.json`,
    ].join('\n');
};
const VALUE_FLAGS = new Set(['theme', 'scale', 'badge', 'page', 'headline', 'body', 'label', 'cta', 'price', 'plan', 'features', 'prompt', 'quote', 'name', 'role', 'url', 'kicker', 'items', 'stat', 'light', 'input', 'slide', 'item', 'dpi', 'fps', 'seconds', 'variant', 'seed', 'source', 'width', 'height', 'density', 'cwd', 'components', 'pages', 'framework', 'title', 'text', 'subtitle', 'eyebrow', 'by', 'author', 'image', 'template', 'size', 'ground', 'out', 'format', 'section', 'token', 'surface', 'group', 'state', 'part', 'prop', 'set', 'preset', 'texture', 'example', 'browser', 'file', 'variants']);
const REPEAT_FLAGS = new Set(['prop', 'image', 'set']);
export function parse(argv) {
    const flags = {};
    const rest = [];
    const take = (key, value) => {
        if (REPEAT_FLAGS.has(key)) {
            const cur = flags[key];
            const list = Array.isArray(cur) ? cur : typeof cur === 'string' ? [cur] : [];
            flags[key] = [...list, value];
        }
        else
            flags[key] = value;
    };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        const eq = a.match(/^--([\w-]+)=(.*)$/);
        if (eq)
            take(eq[1], eq[2]);
        else if (a.startsWith('--') && VALUE_FLAGS.has(a.slice(2)))
            take(a.slice(2), argv[++i] ?? '');
        else if (a === '-h')
            flags.help = true;
        else if (a.startsWith('--no-'))
            flags[a.slice(5)] = false;
        else if (a.startsWith('--'))
            flags[a.slice(2)] = true;
        else
            rest.push(a);
    }
    return { command: rest[0], args: rest.slice(1), flags };
}
const listFlag = (v) => (typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : undefined);
// The flags each command takes; anything else is a mistake to report, not to ignore (a typo would widen an apply).
const COMMON = ['cwd', 'json', 'help'];
const FLAGS = {
    list: [],
    add: ['update', 'dry-run', 'overwrite', 'install', 'framework'],
    apply: ['components', 'pages', 'with-shared', 'dry-run', 'redo'],
    view: ['source', 'full', 'framework'],
    show: ['source', 'full', 'framework'],
    search: [],
    info: [],
    diff: ['framework'],
    init: ['dry-run'],
    check: ['fix', 'all'],
    hook: [],
    tokens: [],
    image: [...IMAGE_FLAGS, ...slotNames('image')],
    deck: [...DECK_FLAGS, ...slotNames('deck')],
    video: VIDEO_FLAGS,
    merch: MERCH_FLAGS,
    brand: ['section', 'token'],
    principles: ['surface'],
    component: ['group', 'part', 'state', 'prop', 'source'],
    manifest: [],
    describe: [],
    light: ['variant', 'seed', 'source', 'width', 'height', 'out', 'format', 'ground', 'list'],
    ascii: ['seed', 'width', 'height', 'density', 'out', 'format', 'ground'],
    illustrate: ILLUSTRATE_FLAGS,
    recipe: RECIPE_FLAGS,
    icons: ICONS_FLAGS,
    email: EMAIL_FLAGS,
    figma: FIGMA_FLAGS,
    design: [],
    ad: AD_FLAGS,
};
async function main() {
    // `design` reads its own arguments, untouched.
    if (process.argv[2] === 'design') {
        const { runDesign } = await import('./design/index.js');
        const { adapter, paint } = await import('./design/adapter.js');
        const argv = process.argv.slice(3);
        let cwd = process.cwd();
        const at = argv.indexOf('--cwd');
        if (at >= 0)
            cwd = resolve(argv.splice(at, 2)[1] ?? '.');
        process.exitCode = await runDesign(argv, adapter(), { cwd, bin: brand().bin, out: console.log, err: console.error, paint });
        return;
    }
    const { command, args, flags } = parse(process.argv.slice(2));
    const known = command ? FLAGS[command] : undefined;
    if (known) {
        const bad = Object.keys(flags).filter((f) => !COMMON.includes(f) && !known.includes(f));
        if (bad.length)
            throw new Error(`Unknown option${bad.length > 1 ? 's' : ''} for ${command}: ${bad.map((f) => `--${f}`).join(', ')}. ${brand().bin} ${command} takes ${[...known, ...COMMON].map((f) => `--${f}`).join(', ')}.`);
    }
    const cwd = resolve(typeof flags.cwd === 'string' ? flags.cwd : process.cwd());
    const json = flags.json === true;
    const out = (value, text) => console.log(json ? JSON.stringify(value, null, 2) : text);
    const ownHelp = new Set(['image', 'deck', 'merch', 'video', 'brand', 'principles', 'component', 'manifest', 'describe', 'light', 'ascii', 'illustrate', 'figma', 'recipe', 'icons', 'email', 'ad']);
    if (flags.help && command && !ownHelp.has(command)) {
        console.log(HELP());
        return;
    }
    switch (command) {
        case 'list': {
            const items = await list();
            out({ items }, items.map((i) => `${i.name.padEnd(22)} ${i.group.padEnd(12)} ${i.flavors.map((f) => (f === 'elements' ? 'wc' : f)).join(',').padEnd(15)} ${i.description}`).join('\n'));
            return;
        }
        case 'add': {
            const opts = { dryRun: flags['dry-run'] === true, overwrite: flags.overwrite === true, install: flags.install !== false };
            const lines = (r) => [
                ...r.notes.map((n) => `note: ${n}`),
                `${flags['dry-run'] ? 'Would add' : 'Added'} ${r.items.join(', ')} (${flavorLabel(r.flavor)})`,
                ...r.written.map((w) => `  + ${w}`),
                ...(r.updated.length ? [`Updated ${r.updated.length} prebuilt module(s) to this version: ${r.updated.map((u) => u.split('/').pop()).join(', ')}`] : []),
                ...(r.packages.length ? [`Packages: ${r.packages.join(', ')}${r.installed ? ' (installed)' : ''}`] : []),
                ...(r.scripts.length ? ['Load each on the pages that use it (once):', ...r.scripts.map((l) => `  ${l}`)] : []),
                ...r.warnings.map((w) => `warning: ${w}`),
            ];
            if (flags.update === true) {
                if (args.length)
                    throw new Error(`add --update re-adds every installed item; name none (or add them by name without --update).`);
                const rs = await update(cwd, opts);
                out({ results: rs }, rs.flatMap(lines).join('\n'));
                return;
            }
            if (!args.length)
                throw new Error(`Name at least one item: ${brand().bin} add button (\`${brand().bin} search <words>\` finds one), or ${brand().bin} add --update for every installed item`);
            const r = await add(cwd, args, { ...opts, framework: typeof flags.framework === 'string' ? flags.framework : undefined });
            out(r, [...lines(r), ...(flags['dry-run'] ? [] : [`How to use: ${brand().bin} view ${r.items[r.items.length - 1]}`])].join('\n'));
            return;
        }
        case 'apply': {
            const r = await apply(cwd, { targets: args, components: listFlag(flags.components), pages: listFlag(flags.pages), withShared: flags['with-shared'] === true, dryRun: flags['dry-run'] === true, redo: flags.redo === true });
            out({ scope: r.scope, files: r.files.map((f) => ({ file: f.file, reason: f.reason, changes: f.changes })), skipped: r.skipped, sharedLeftOut: r.sharedLeftOut, setup: r.setup, warnings: r.warnings, dryRun: r.dryRun, state: r.dryRun ? undefined : r.state }, formatApply(r));
            return;
        }
        case 'view':
        case 'show': {
            if (!args.length)
                throw new Error(`Name an item: ${brand().bin} view button`);
            const v = await view(cwd, args, { framework: typeof flags.framework === 'string' ? flags.framework : undefined });
            out({ items: v }, v.map((x) => formatView(x, flags.source === true || flags.full === true)).join('\n\n'));
            return;
        }
        case 'search': {
            if (!args.length)
                throw new Error(`Say what you are looking for: ${brand().bin} search date picker`);
            const r = await search(args);
            out({ results: r }, r.length ? r.map((x) => `${x.name.padEnd(22)} ${x.group.padEnd(11)} ${x.flavors.map((f) => (f === 'elements' ? 'wc' : f)).join(',').padEnd(15)} ${x.description}`).join('\n') : `Nothing matches. \`${brand().bin} list\` shows every item.`);
            return;
        }
        case 'info': {
            const r = await info(cwd);
            out(r, formatInfo(r));
            return;
        }
        case 'diff': {
            if (!args.length)
                throw new Error(`Name an item: ${brand().bin} diff button`);
            const r = await diff(cwd, args, { framework: typeof flags.framework === 'string' ? flags.framework : undefined });
            out({ items: r }, r.map((i) => i.files.map((f) => (f.status === 'changed' ? f.diff : `${f.path}: ${f.status === 'same' ? 'same as the library' : `not in this app (${brand().bin} add ${i.name})`}`)).join('\n')).join('\n'));
            if (r.some((i) => i.files.some((f) => f.status === 'changed')))
                process.exitCode = 1;
            return;
        }
        case 'init': {
            const r = await init(cwd, { dryRun: flags['dry-run'] === true });
            out({ framework: r.project.framework, flavor: r.project.flavor, styling: r.styling, writes: r.writes, links: r.links, warnings: r.warnings }, [`${describeProject(r.project)} at ${cwd} (${r.styling})`, ...r.writes.map((w) => `  + ${w}`), ...(r.links.length ? [`Linked from ${r.project.layouts.length ? r.project.layouts.join(', ') : 'no layout'}:`, ...r.links.map((l) => `  ${l}`)] : []), ...r.warnings.map((w) => `warning: ${w}`)].join('\n'));
            return;
        }
        case 'hook': {
            // An agent's edit hook (Claude Code PostToolUse, Codex, Cursor afterFileEdit): the payload on stdin names the
            // edited files; their findings go back on stderr with exit 2, which the agent reads and fixes.
            const input = await new Promise((done) => {
                let data = '';
                process.stdin.on('data', (c) => (data += c));
                process.stdin.on('end', () => done(data));
                if (process.stdin.isTTY)
                    done('');
            });
            const r = hookCheck(cwd, input);
            if (json)
                console.log(JSON.stringify(r, null, 2));
            if (r.findings.length) {
                console.error([`${brand().name} design system: ${r.findings.length} value${r.findings.length === 1 ? '' : 's'} off the brand in ${r.paths.join(', ')}:`, ...r.findings.slice(0, 30).map(formatFinding)].join('\n'));
                process.exitCode = 2;
            }
            return;
        }
        case 'check': {
            // With an applied scope, the check enforces the brand on that scope only, so a partial adoption passes.
            const state = readState(cwd);
            const scoped = !args.length && flags.all !== true && state && !state.whole;
            const r = runCheck(cwd, { paths: scoped ? state.checked : args, fix: flags.fix === true });
            const note = scoped ? ' in the applied scope (--all checks every file)' : '';
            const n = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
            out({ ...r, scope: scoped ? state.checked : undefined }, [...r.findings.map(formatFinding), `${n(r.files, 'file')}${note}, ${n(r.findings.length, 'finding')}${r.fixed ? `, ${r.fixed} fixed` : ''} (${r.ms}ms)`].join('\n'));
            if (r.findings.length)
                process.exitCode = 1;
            return;
        }
        case 'tokens': {
            const t = findTokens(args);
            out({ tokens: t }, t.map((x) => `${x.name.padEnd(40)} ${x.light}${x.dark !== x.light ? `  (dark ${x.dark})` : ''}`).join('\n'));
            return;
        }
        case 'image': {
            if (flags.help) {
                console.log(imageHelp());
                return;
            }
            const r = await runImage(cwd, args, flags);
            out(r.json, r.text);
            return;
        }
        case 'deck': {
            if (flags.help) {
                console.log(deckHelp());
                return;
            }
            const r = await runDeck(cwd, args, flags);
            out(r.json, r.text);
            return;
        }
        case 'merch': {
            if (flags.help) {
                console.log(merchHelp());
                return;
            }
            const r = await runMerch(cwd, args, flags);
            out(r.json, r.text);
            return;
        }
        case 'video': {
            if (flags.help) {
                console.log(videoHelp());
                return;
            }
            const r = await runVideo(cwd, args, flags);
            out(r.json, r.text);
            return;
        }
        case 'brand': {
            if (flags.help) {
                console.log(brandHelp());
                return;
            }
            const r = runBrand(args, flags);
            out(r.json, r.text);
            return;
        }
        case 'principles': {
            if (flags.help) {
                console.log(principlesHelp());
                return;
            }
            const r = runPrinciples(args, flags);
            out(r.json, r.text);
            return;
        }
        case 'component': {
            if (flags.help) {
                console.log(componentHelp());
                return;
            }
            const r = await runComponent(cwd, args, flags);
            out(r.json, r.text);
            return;
        }
        case 'light':
        case 'ascii': {
            if (flags.help) {
                console.log(patternHelp(command));
                return;
            }
            const r = command === 'light' ? await runLight(cwd, args, flags) : await runAscii(cwd, args, flags);
            out(r.json, r.text);
            return;
        }
        case 'email': {
            if (flags.help)
                console.log(emailHelp());
            else
                runEmail(cwd, args, flags);
            break;
        }
        case 'icons': {
            if (flags.help)
                console.log(iconsHelp());
            else
                runIcons(cwd, flags);
            break;
        }
        case 'ad': {
            if (flags.help) {
                console.log(adHelp());
                return;
            }
            const r = await runAd(cwd, args, flags);
            out(r.json, r.text);
            return;
        }
        case 'recipe': {
            process.exitCode = await runRecipe(cwd, args, { ...flags, ...(flags.help ? { list: true } : {}) });
            break;
        }
        case 'illustrate': {
            if (flags.help) {
                console.log(illustrateHelp());
                return;
            }
            const r = await runIllustrate(cwd, args, flags);
            out(r.json, r.text);
            return;
        }
        case 'figma': {
            if (flags.help) {
                console.log(figmaHelp());
                return;
            }
            const r = await runFigma(cwd, args, flags);
            out(r.json, r.text);
            if (r.exitCode)
                process.exitCode = r.exitCode;
            return;
        }
        case 'manifest':
        case 'describe': {
            if (flags.help) {
                console.log(manifestHelp());
                return;
            }
            if (args.length)
                throw new Error(`\`${command}\` takes no arguments. ${brand().bin} manifest --json`);
            const doc = await manifest();
            out(doc, formatManifest(doc));
            return;
        }
        default:
            console.log(HELP());
            if (command && command !== 'help' && command !== '--help') {
                const near = suggest(command, [...Object.keys(FLAGS), 'show', 'help']);
                console.error(`\nUnknown command \`${command}\`.${near.length ? ` Did you mean ${near.map((n) => `\`${n}\``).join(' or ')}?` : ''}`);
                process.exitCode = 1;
            }
    }
}
main().catch((error) => {
    console.error(`${brand().bin}: ${error.message}`);
    process.exitCode = 1;
});
