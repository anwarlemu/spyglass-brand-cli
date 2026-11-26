import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { brand } from '../lib/brand.js';
const LOCKS = [['bun.lock', 'bun'], ['bun.lockb', 'bun'], ['pnpm-lock.yaml', 'pnpm'], ['yarn.lock', 'yarn'], ['package-lock.json', 'npm']];
function readJson(path) {
    try {
        return JSON.parse(readFileSync(path, 'utf8'));
    }
    catch {
        return undefined;
    }
}
const read = (root, rel) => {
    try {
        return readFileSync(join(root, rel), 'utf8');
    }
    catch {
        return '';
    }
};
/** The installed major version of a package, read from node_modules up the tree, else from the declared range. */
function majorOf(root, name, declared) {
    for (let dir = root;; dir = dirname(dir)) {
        const pkg = readJson(join(dir, 'node_modules', name, 'package.json'));
        if (pkg?.version)
            return Number(String(pkg.version).split('.')[0]);
        if (dirname(dir) === dir)
            break;
    }
    const m = declared?.match(/(\d+)/);
    return m ? Number(m[1]) : undefined;
}
const SKIP_DIRS = /^(node_modules|\.git|\.nuxt|\.output|\.next|\.svelte-kit|\.astro|\.angular|dist|build|coverage|vendor|tmp|log|storage|\.venv|venv|env|__pycache__|\.ds|\.turbo|\.cache|\.vercel)$/;
/** Files under a folder (relative to root), a few levels deep, skipping dependencies and build output. */
export function listFiles(root, dir = '.', depth = 6, out = []) {
    if (depth < 0)
        return out;
    let names = [];
    try {
        names = readdirSync(join(root, dir));
    }
    catch {
        return out;
    }
    for (const name of names) {
        if (SKIP_DIRS.test(name))
            continue;
        const rel = dir === '.' ? name : posix.join(dir, name);
        let st;
        try {
            st = statSync(join(root, rel));
        }
        catch {
            continue;
        }
        if (st.isDirectory())
            listFiles(root, rel, depth - 1, out);
        else
            out.push(rel);
    }
    return out;
}
export const TEMPLATE_EXT = /\.(html?|erb|php|hbs|handlebars|mustache|ejs|liquid|twig|njk|jinja2?|j2)$/;
function detectFramework(root, deps, files) {
    // Server frameworks first: Laravel and Rails apps often have a package.json for their asset build.
    if (existsSync(join(root, 'artisan')) || /laravel\/framework/.test(read(root, 'composer.json')))
        return 'laravel';
    if ((existsSync(join(root, 'config', 'routes.rb')) && existsSync(join(root, 'app', 'views'))) || /^\s*gem\s+["']rails["']/m.test(read(root, 'Gemfile')))
        return 'rails';
    if (existsSync(join(root, 'manage.py')))
        return 'django';
    if (deps.nuxt || ['nuxt.config.ts', 'nuxt.config.js', 'nuxt.config.mjs'].some((f) => existsSync(join(root, f))))
        return 'nuxt';
    if (deps.next)
        return 'next';
    if (deps['@react-router/dev'] || deps['@remix-run/react'] || deps['@remix-run/dev'] || existsSync(join(root, 'react-router.config.ts')))
        return 'react-router';
    if (deps['@sveltejs/kit'])
        return 'sveltekit';
    if (deps.astro)
        return 'astro';
    if (deps['@angular/core'])
        return 'angular';
    if (deps['solid-js'])
        return 'solid';
    if (deps.vue)
        return 'vite-vue';
    if (deps.svelte)
        return 'vite-svelte';
    if (deps.react)
        return 'vite-react';
    const all = files();
    if (all.some((f) => /\.php$/.test(f)))
        return 'php';
    if (all.some((f) => /\.(hbs|handlebars|mustache|ejs|liquid|twig|njk|jinja2?|j2)$/.test(f)))
        return 'templates';
    if (all.some((f) => /\.html?$/.test(f)))
        return 'html';
    return 'unknown';
}
export const flavorOf = (framework) => (['next', 'react-router', 'vite-react'].includes(framework) ? 'react' : 'elements');
const LABELS = {
    nuxt: 'Nuxt',
    'vite-vue': 'Vite + Vue',
    next: 'Next.js',
    'react-router': 'React Router',
    'vite-react': 'Vite + React',
    sveltekit: 'SvelteKit',
    'vite-svelte': 'Vite + Svelte',
    astro: 'Astro',
    angular: 'Angular',
    solid: 'Solid',
    rails: 'Rails',
    laravel: 'Laravel',
    django: 'Django',
    php: 'PHP',
    templates: 'Server templates',
    html: 'Plain HTML',
    unknown: 'Unknown',
};
export const stackLabel = (s) => LABELS[s];
/** The stylesheet a script imports (`import './index.css'`), relative to root, when it exists. */
function importedCss(root, file) {
    const out = [];
    for (const m of read(root, file).matchAll(/import\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+\.(?:css|scss|sass|less|pcss))['"]/g)) {
        const spec = m[1];
        const rel = spec.startsWith('.') ? posix.normalize(posix.join(posix.dirname(file), spec)) : spec.startsWith('~/') || spec.startsWith('@/') ? posix.join(file.startsWith('app/') ? 'app' : 'src', spec.slice(2)) : undefined;
        if (rel && existsSync(join(root, rel)))
            out.push(rel);
    }
    return out;
}
const tailwindIn = (css) => /@import\s+["']tailwindcss|@tailwind\s+(base|components|utilities)|@import\s+["']tailwindcss\/(base|preflight)/.test(css);
export function readProject(root) {
    const pkg = readJson(join(root, 'package.json')) ?? {};
    const node = existsSync(join(root, 'package.json'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    let cached;
    const files = () => (cached ??= listFiles(root));
    const framework = detectFramework(root, deps, files);
    const has = (rel) => existsSync(join(root, rel));
    // Source folder: where app code lives and where `add` writes the library's files.
    const srcDir = framework === 'nuxt' ? (has('app') ? 'app' : '.')
        : framework === 'react-router' ? (has('app') ? 'app' : 'src')
            : framework === 'next' ? (has('src') ? 'src' : '.')
                : framework === 'rails' ? 'app'
                    : framework === 'laravel' ? 'resources'
                        : ['django', 'php', 'html', 'templates', 'unknown'].includes(framework) ? '.'
                            : has('src') ? 'src' : '.';
    const tsconfigs = ['tsconfig.json', 'tsconfig.app.json', 'jsconfig.json'].filter(has);
    const viteConfig = ['vite.config.ts', 'vite.config.js', 'vite.config.mjs', 'vite.config.mts'].find(has);
    const alias = framework === 'nuxt' || framework === 'sveltekit' || tsconfigs.some((f) => /"@\/\*"/.test(read(root, f))) || (!!viteConfig && /['"]@['"]\s*:/.test(read(root, viteConfig)));
    // A monorepo keeps one lockfile at the workspace root: install there, with its manager.
    let packageManager = 'npm';
    let installRoot = root;
    for (let dir = root;; dir = dirname(dir)) {
        const lock = LOCKS.find(([f]) => existsSync(join(dir, f)));
        if (lock) {
            packageManager = lock[1];
            installRoot = dir;
            break;
        }
        if (dirname(dir) === dir || existsSync(join(dir, '.git')))
            break;
    }
    if (installRoot === root && !LOCKS.some(([f]) => has(f))) {
        const declared = String(pkg.packageManager ?? '').split('@')[0];
        if (declared === 'bun' || declared === 'pnpm' || declared === 'yarn')
            packageManager = declared;
    }
    // The static folder and the URL it is served at.
    let publicDir = 'public';
    let publicUrl = '';
    if (framework === 'sveltekit')
        publicDir = 'static';
    else if (framework === 'django') {
        const settings = files().find((f) => /(^|\/)settings\.py$/.test(f));
        const text = settings ? read(root, settings) : '';
        const dirs = text.match(/STATICFILES_DIRS\s*=\s*\[\s*(?:BASE_DIR\s*\/\s*)?["']([^"']+)["']/)?.[1];
        publicDir = dirs ?? (has('static') ? 'static' : files().find((f) => /^[^/]+\/static\//.test(f))?.split('/').slice(0, 2).join('/') ?? 'static');
        publicUrl = (text.match(/STATIC_URL\s*=\s*["']([^"']+)["']/)?.[1] ?? '/static/').replace(/\/$/, '');
        if (!publicUrl.startsWith('/'))
            publicUrl = `/${publicUrl}`;
    }
    else if (framework === 'html' || framework === 'php')
        publicDir = node && has('public') ? 'public' : '.';
    else if (framework === 'angular' && !has('public') && has('src/assets')) {
        publicDir = 'src/assets';
        publicUrl = '/assets';
    }
    // Tailwind: 4 through @tailwindcss/vite, @tailwindcss/postcss or the CLI; 3 with a tailwind.config.
    const twDeclared = deps.tailwindcss ?? deps['@tailwindcss/vite'] ?? deps['@tailwindcss/postcss'] ?? deps['@tailwindcss/cli'];
    let tailwind = twDeclared ? majorOf(root, 'tailwindcss', twDeclared) : undefined;
    const tailwindConfig = ['tailwind.config.js', 'tailwind.config.cjs', 'tailwind.config.mjs', 'tailwind.config.ts', 'config/tailwind.config.js'].find(has);
    // Rails (tailwindcss-rails) and Django (django-tailwind, pytailwindcss) run Tailwind without a package.json.
    if (!tailwind && framework === 'rails' && /tailwindcss-rails/.test(read(root, 'Gemfile')))
        tailwind = has('app/assets/tailwind/application.css') ? 4 : 3;
    // The main stylesheet, and the script or template that pulls it in.
    let css;
    let cssEntry;
    let bundler = node && framework !== 'html' && framework !== 'php' && framework !== 'templates' && framework !== 'unknown';
    const pick = (...candidates) => candidates.map((p) => p.replace(/^\.\//, '')).find(has);
    const fromEntries = (...entries) => {
        for (const entry of entries.filter(has)) {
            const found = importedCss(root, entry);
            const tw = found.find((f) => tailwindIn(read(root, f)));
            if (found.length) {
                cssEntry = entry;
                return tw ?? found[0];
            }
        }
        return undefined;
    };
    const src = srcDir === '.' ? '' : `${srcDir}/`;
    switch (framework) {
        case 'nuxt': {
            const config = ['nuxt.config.ts', 'nuxt.config.js', 'nuxt.config.mjs'].find(has);
            const m = config ? read(root, config).match(/css\s*:\s*\[\s*['"]([^'"]+)['"]/) : null;
            if (m)
                css = m[1].replace(/^[~@]{1,2}\//, src);
            css ??= pick(`${src}assets/css/main.css`, `${src}assets/main.css`, `${src}assets/css/tailwind.css`);
            break;
        }
        case 'vite-vue':
            css = fromEntries(`${src}main.ts`, `${src}main.js`) ?? pick(`${src}assets/main.css`, `${src}style.css`, `${src}assets/css/main.css`, `${src}index.css`);
            break;
        case 'next':
            css = fromEntries(`${src}app/layout.tsx`, `${src}app/layout.jsx`, `${src}app/layout.js`, `${src}pages/_app.tsx`, `${src}pages/_app.jsx`, `${src}pages/_app.js`) ?? pick(`${src}app/globals.css`, `${src}styles/globals.css`);
            cssEntry ??= pick(`${src}app/layout.tsx`, `${src}app/layout.jsx`, `${src}app/layout.js`, `${src}pages/_app.tsx`, `${src}pages/_app.jsx`, `${src}pages/_app.js`);
            break;
        case 'react-router':
            css = fromEntries(`${src}root.tsx`, `${src}root.jsx`) ?? pick(`${src}app.css`, `${src}tailwind.css`);
            // React Router links its stylesheet from root.tsx's links() with ?url: that is the entry too.
            if (!css) {
                const root2 = pick(`${src}root.tsx`, `${src}root.jsx`);
                const m = root2 ? read(root, root2).match(/import\s+\w+\s+from\s+['"](\.\/[^'"]+\.css)\?url['"]/) : null;
                if (m && root2) {
                    css = posix.join(posix.dirname(root2), m[1]);
                    cssEntry = root2;
                }
            }
            cssEntry ??= pick(`${src}root.tsx`, `${src}root.jsx`);
            break;
        case 'vite-react':
        case 'solid':
        case 'vite-svelte':
            css = fromEntries(`${src}main.tsx`, `${src}main.jsx`, `${src}main.ts`, `${src}main.js`, `${src}index.tsx`, `${src}index.jsx`, `${src}index.ts`, `${src}index.js`) ?? pick(`${src}index.css`, `${src}app.css`, `${src}App.css`);
            break;
        case 'sveltekit':
            css = fromEntries('src/routes/+layout.svelte') ?? undefined;
            if (!css) {
                const layout = read(root, 'src/routes/+layout.svelte');
                const m = layout.match(/import\s+['"]([^'"]+\.css)['"]/);
                if (m) {
                    const rel = m[1].startsWith('.') ? posix.normalize(posix.join('src/routes', m[1])) : m[1].replace(/^\$lib\//, 'src/lib/');
                    if (has(rel)) {
                        css = rel;
                        cssEntry = 'src/routes/+layout.svelte';
                    }
                }
            }
            break;
        case 'astro': {
            for (const f of files().filter((x) => /^src\/(layouts|pages|components)\/.*\.astro$/.test(x))) {
                const text = read(root, f);
                const m = text.match(/import\s+['"]([^'"]+\.css)['"]/);
                if (!m)
                    continue;
                const rel = posix.normalize(posix.join(posix.dirname(f), m[1]));
                if (has(rel)) {
                    css = rel;
                    cssEntry = f;
                    if (tailwindIn(read(root, rel)))
                        break;
                }
            }
            break;
        }
        case 'angular': {
            const config = readJson(join(root, 'angular.json'));
            const project = config ? Object.values(config.projects ?? {})[0] : undefined;
            const styles = project?.architect?.build?.options?.styles ?? [];
            const first = styles.map((s) => (typeof s === 'string' ? s : s.input)).find((s) => /\.(css|scss|sass|less)$/.test(s) && !s.includes('node_modules'));
            css = first && has(first) ? first : pick('src/styles.css', 'src/styles.scss');
            cssEntry = 'angular.json';
            break;
        }
        case 'laravel': {
            css = pick('resources/css/app.css');
            bundler = node && !!css && (deps.vite !== undefined || has('vite.config.js') || has('vite.config.ts'));
            break;
        }
        case 'rails': {
            // tailwindcss-rails 4 builds app/assets/tailwind/application.css; propshaft serves app/assets/stylesheets as is.
            const tw = pick('app/assets/tailwind/application.css', 'app/assets/stylesheets/application.tailwind.css');
            css = tw ?? pick('app/assets/stylesheets/application.css', 'app/assets/stylesheets/application.scss');
            bundler = !!tw;
            break;
        }
        case 'django': {
            const input = files().find((f) => /(^|\/)static(_src)?\/.*\.css$/.test(f) && tailwindIn(read(root, f)) && !f.startsWith(`${publicDir}/${brand().bin}/`));
            css = input;
            bundler = !!input;
            break;
        }
        default: {
            // A plain site, PHP or templates: the stylesheet its pages link most, when it lives in the project.
            const linked = new Map();
            for (const page of files().filter((f) => TEMPLATE_EXT.test(f))) {
                for (const m of read(root, page).matchAll(/<link\b[^>]*rel=["']?stylesheet[^>]*>/gi)) {
                    const href = m[0].match(/href=["']([^"'{}<>]+)["']/)?.[1];
                    if (!href || /^(https?:)?\/\//.test(href) || href.includes(`/${brand().bin}/`))
                        continue;
                    const clean = href.split(/[?#]/)[0];
                    const rel = clean.startsWith('/') ? posix.join(publicDir === '.' ? '' : publicDir, clean.slice(1)) : posix.normalize(posix.join(posix.dirname(page), clean));
                    if (has(rel))
                        linked.set(rel, (linked.get(rel) ?? 0) + (/(^|\/)index\.html?$/.test(page) ? 2 : 1));
                }
            }
            css = [...linked].sort((a, b) => b[1] - a[1])[0]?.[0];
            bundler = false;
        }
    }
    // A Tailwind stylesheet processed by a CLI (no package build) still takes @import lines.
    if (css && tailwind && tailwindIn(read(root, css)))
        bundler = true;
    // Base layouts: the files with the page's <head>, where a <link> goes when nothing builds the CSS.
    const layoutPatterns = {
        rails: /^app\/views\/layouts\/[^/]+\.html\.erb$/,
        laravel: /^resources\/views\/(layouts|components\/layouts)\/[^/]+\.blade\.php$/,
        sveltekit: /^src\/app\.html$/,
        astro: /^src\/(layouts|pages)\/.*\.astro$/,
        angular: /^src\/index\.html$/,
        'vite-react': /^index\.html$/,
        'vite-vue': /^index\.html$/,
        'vite-svelte': /^index\.html$/,
        solid: /^index\.html$/,
    };
    const pattern = layoutPatterns[framework];
    const candidates = pattern ? files().filter((f) => pattern.test(f)) : files().filter((f) => TEMPLATE_EXT.test(f));
    const layouts = candidates.filter((f) => /<\/head>/i.test(read(root, f))).sort();
    return {
        root,
        framework,
        flavor: flavorOf(framework),
        srcDir,
        publicDir,
        publicUrl,
        alias,
        packageManager,
        installRoot,
        css,
        bundler,
        cssEntry,
        layouts,
        pkg,
        tailwind,
        tailwindConfig: tailwind === 3 ? tailwindConfig : undefined,
        merge: !!(deps['tailwind-merge'] || deps.cn || deps['tailwind-variants']),
        typescript: tsconfigs.some((f) => f.endsWith('.json') && !f.endsWith('jsconfig.json')),
        node,
    };
}
/** What stops the design system working here, with the fix; undefined when it can be installed. */
export function unsupported(project) {
    const b = brand();
    if (project.framework === 'unknown')
        return `${project.root} has no app this can restyle: no package.json with a framework, no Rails, Laravel or Django project, and no HTML, PHP or template files. Run ${b.bin} in the app's folder (or pass --cwd <app folder>). Nothing was written.`;
    if (project.tailwind !== undefined && project.tailwind < 3)
        return `This app is on Tailwind CSS ${project.tailwind}. ${b.name}'s theme needs Tailwind 3 or 4 (or no Tailwind): upgrade first, then run ${b.bin} again. Nothing was written.`;
    return undefined;
}
