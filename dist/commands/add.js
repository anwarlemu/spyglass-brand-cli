import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { brand, elementPrefix } from '../lib/brand.js';
import { readProject, unsupported } from '../library/project.js';
import { chooseFlavor, elementTypesPath, flavorProblem, placedFiles, scriptLines } from '../library/flavors.js';
import { flavorsOf, resolveItems } from '../library/registry.js';
import { init } from './init.js';
import { installedItems, resolveNames } from './library.js';
export async function add(root, names, opts = {}) {
    const project = readProject(root);
    const problem = unsupported(project);
    if (problem)
        throw new Error(problem);
    let flavor = chooseFlavor(project, opts.framework);
    const stop = flavorProblem(project, flavor);
    // Asked for by name: stop and say why. Chosen from the app: the web components work without Tailwind, so use them.
    const fallback = stop && !opts.framework ? 'This app has no Tailwind, so it gets the web components (they carry their own styles). Install Tailwind 4 and pass --framework react for the React files.' : undefined;
    if (stop && !fallback)
        throw new Error(stop);
    if (fallback)
        flavor = 'elements';
    // Names as typed: Button, alert-dialog, AlertDialog, badge (an alias); every one resolves before anything is written.
    const resolved = await resolveNames(names);
    const notes = resolved.filter((r) => r.via).map((r) => r.via);
    if (fallback)
        notes.push(fallback);
    const items = await resolveItems(resolved.map((r) => r.name), flavor);
    const missing = items.filter((i) => !flavorsOf(i).includes(flavor));
    if (missing.length)
        throw new Error(`${missing.map((i) => i.name).join(', ')} ${missing.length === 1 ? 'has' : 'have'} no ${flavor === 'elements' ? 'web component' : 'React'} version in this registry yet. Nothing was written. Pass --framework ${flavor === 'react' ? 'elements' : 'react'} for the other flavor, or update the package.`);
    const written = [];
    const updated = [];
    const kept = [];
    const warnings = [];
    for (const f of await placedFiles(project, items, flavor)) {
        const abs = join(root, f.path);
        const before = existsSync(abs) ? readFileSync(abs, 'utf8') : undefined;
        if (before === f.content)
            continue;
        if (before !== undefined && !opts.overwrite && !f.generated && !f.prebuilt) {
            kept.push(f.path);
            continue;
        }
        // A prebuilt module that was there, at another version: replaced, and said so on one line.
        if (before !== undefined && f.prebuilt)
            updated.push(f.path);
        else
            written.push(f.path);
        if (!opts.dryRun) {
            mkdirSync(dirname(abs), { recursive: true });
            writeFileSync(abs, f.content);
        }
    }
    if (kept.length)
        warnings.push(`Kept ${kept.length} local file(s) that differ from the library; pass --overwrite to replace them.`);
    // npm packages: the React flavor imports them; prebuilt web components carry their own.
    const have = { ...project.pkg.dependencies, ...project.pkg.devDependencies };
    const nameOf = (spec) => spec.replace(/(.)@.*$/, '$1');
    const wanted = flavor === 'react' ? items.flatMap((i) => i.flavors?.react?.dependencies ?? i.dependencies) : [];
    const packages = [...new Set(wanted)].filter((p) => !have[nameOf(p)]);
    let installed = false;
    if (packages.length && !opts.dryRun && opts.install !== false) {
        if (!project.node)
            warnings.push(`This app has no package.json: install ${packages.join(', ')} yourself.`);
        else {
            const pm = project.packageManager;
            const args = pm === 'npm' ? ['install', ...packages] : ['add', ...packages];
            // Into the app's own package.json; a monorepo's manager installs from the workspace root's lockfile.
            execFileSync(pm, args, { cwd: root, stdio: ['ignore', 'inherit', 'inherit'] });
            installed = true;
        }
    }
    const scripts = flavor === 'elements' ? scriptLines(project, items) : [];
    if (flavor === 'elements') {
        const setup = customElementSetup(project);
        notes.push(...setup.notes);
        if (setup.write && !opts.dryRun)
            writeFileSync(join(root, setup.write.path), setup.write.content);
        if (setup.write)
            written.push(setup.write.path);
    }
    // The brand stylesheet, once: the components read its tokens.
    const r = await init(root, { dryRun: opts.dryRun });
    written.push(...r.writes);
    warnings.push(...r.warnings.filter((w) => !written.includes(w)));
    return { items: items.map((i) => i.name), flavor, written, updated, kept, packages, installed, warnings, notes, scripts };
}
/**
 * add --update: every item the app has, re-added from this version of the package in the flavor it was added in. Source
 * files the app changed are kept (unless --overwrite); prebuilt modules, types and the manifest are rewritten.
 */
export async function update(root, opts = {}) {
    const project = readProject(root);
    const problem = unsupported(project);
    if (problem)
        throw new Error(problem);
    const have = await installedItems(project);
    if (!have.length)
        throw new Error(`No library items found in this app: add one first (${brand().bin} add <item>).`);
    const out = [];
    for (const flavor of ['react', 'elements']) {
        const names = have.filter((i) => i.flavor === flavor).map((i) => i.name);
        if (names.length)
            out.push(await add(root, names, { ...opts, framework: flavor }));
    }
    return out;
}
export const flavorLabel = (f) => (f === 'elements' ? 'web components' : 'React');
export const brandBin = () => brand().bin;
/**
 * What a framework needs to take the elements as custom elements, not as its own components: Vue and Nuxt are told
 * (isCustomElement, set in their config where that is a safe edit), Angular's components need CUSTOM_ELEMENTS_SCHEMA
 * (each component's own decorator, so the CLI says where), and Nuxt loads the modules from its head config.
 */
export function customElementSetup(project) {
    const prefix = `${elementPrefix()}-`;
    const check = `(tag) => tag.startsWith('${prefix}')`;
    const read = (rel) => (existsSync(join(project.root, rel)) ? readFileSync(join(project.root, rel), 'utf8') : '');
    if (project.framework === 'angular') {
        return { notes: [`Angular: in each component that uses them, add schemas: [CUSTOM_ELEMENTS_SCHEMA] to its @Component (import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'); without it the build stops with "'${prefix}button' is not a known element". The types for their properties are in ${elementTypesPath(project)}.`] };
    }
    if (project.framework === 'nuxt') {
        const path = ['nuxt.config.ts', 'nuxt.config.js', 'nuxt.config.mjs'].find((f) => existsSync(join(project.root, f)));
        const head = `Nuxt: load the modules from nuxt.config's app.head.script ({ type: 'module', src: '/${brand().assetBase.replace(/^\//, '')}/elements/<name>.js' }) or useHead on the pages that use them.`;
        if (!path)
            return { notes: [`Nuxt: tell Vue the ${prefix}* tags are custom elements: vue: { compilerOptions: { isCustomElement: ${check} } } in nuxt.config.`, head] };
        const text = read(path);
        if (/isCustomElement/.test(text))
            return { notes: [head] };
        if (!/\bvue\s*:/.test(text) && /defineNuxtConfig\(\s*\{/.test(text)) {
            const content = text.replace(/defineNuxtConfig\(\s*\{/, (m) => `${m}\n  // ${prefix}* tags are the design system's web components, not Vue components.\n  vue: { compilerOptions: { isCustomElement: ${check} } },`);
            return { notes: [`Set vue.compilerOptions.isCustomElement in ${path}, so Vue leaves the ${prefix}* tags to the browser.`, head], write: { path, content } };
        }
        return { notes: [`Nuxt: add isCustomElement: ${check} to vue.compilerOptions in ${path} (it could not be edited safely), so Vue leaves the ${prefix}* tags to the browser.`, head] };
    }
    if (project.framework === 'vite-vue') {
        const path = ['vite.config.ts', 'vite.config.js', 'vite.config.mts', 'vite.config.mjs'].find((f) => existsSync(join(project.root, f)));
        const text = path ? read(path) : '';
        if (/isCustomElement/.test(text))
            return { notes: [] };
        if (path && /\bvue\(\s*\)/.test(text)) {
            const content = text.replace(/\bvue\(\s*\)/, `vue({ template: { compilerOptions: { isCustomElement: ${check} } } })`);
            return { notes: [`Set the Vue plugin's isCustomElement in ${path}, so Vue leaves the ${prefix}* tags to the browser.`], write: { path, content } };
        }
        return { notes: [`Vue: pass vue({ template: { compilerOptions: { isCustomElement: ${check} } } }) in your Vite config, so Vue leaves the ${prefix}* tags to the browser.`] };
    }
    return { notes: [] };
}
