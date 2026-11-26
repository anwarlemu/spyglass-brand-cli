import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { runRules } from './rules.js';
import { brand } from '../lib/brand.js';
import { MARKUP, SCRIPT, STYLES, lineOf, loadSource } from './source.js';
const IGNORE = /(^|\/)(node_modules|\.git|\.nuxt|\.output|\.next|\.svelte-kit|\.astro|\.angular|dist|build|coverage|\.vercel|\.data|\.ds|vendor|storage|tmp|log|\.venv|venv|__pycache__|staticfiles)(\/|$)/;
/** The brand's own installed files (brand.css, kinds.css, the theme, web component modules) are not the app's to check. */
const own = (rel) => `/${rel.split('\\').join('/')}/`.includes(`/${brand().bin}/`);
export const checkable = (rel) => (STYLES.test(rel) || MARKUP.test(rel) || SCRIPT.test(rel)) && !/\.d\.ts$|\.config\.|\.test\.|\.spec\.|\.min\./.test(rel) && !own(rel);
/** Every checkable file under a folder, relative to it. */
export function walkFiles(dir, base = dir) {
    const out = [];
    for (const name of readdirSync(dir)) {
        const abs = join(dir, name);
        const rel = relative(base, abs);
        if (IGNORE.test(rel))
            continue;
        if (statSync(abs).isDirectory())
            out.push(...walkFiles(abs, base));
        else if (checkable(rel))
            out.push(rel);
    }
    return out;
}
export function checkText(rel, text) {
    const file = loadSource(rel, text);
    let raw;
    try {
        raw = runRules(file);
    }
    catch (error) {
        raw = [{ rule: 'crash', message: `check crashed: ${error.message}`, hint: 'Report this to the design system owners.', offset: 0 }];
    }
    const findings = [];
    const overrides = [];
    for (const r of raw) {
        const { line, column } = lineOf(file, r.offset);
        const finding = { file: rel, line, column, rule: r.rule, message: r.message, hint: r.hint, snippet: text.slice(r.offset, r.offset + Math.min(r.length ?? 40, 80)).split('\n')[0], fix: r.fix };
        const reason = file.overrides.get(line) ?? file.overrides.get(line - 1);
        if (reason)
            overrides.push({ ...finding, overridden: reason });
        else
            findings.push(finding);
    }
    findings.sort((a, b) => a.line - b.line || a.column - b.column);
    return { findings, overrides };
}
export function applyFixes(text, fixes) {
    let out = text;
    let last = Number.POSITIVE_INFINITY;
    let applied = 0;
    for (const f of [...fixes].sort((a, b) => b.start - a.start)) {
        if (f.end > last)
            continue;
        out = out.slice(0, f.start) + f.text + out.slice(f.end);
        last = f.start;
        applied++;
    }
    return { text: out, applied };
}
export function runCheck(root, opts = {}) {
    const started = performance.now();
    const targets = opts.paths?.length ? opts.paths : ['.'];
    const files = targets.flatMap((p) => {
        const abs = join(root, p);
        if (!existsSync(abs))
            return [];
        return statSync(abs).isDirectory() ? walkFiles(abs).map((f) => relative(root, join(abs, f))) : checkable(p) ? [p] : [];
    });
    const findings = [];
    const overrides = [];
    let fixed = 0;
    for (const rel of files) {
        let text = readFileSync(join(root, rel), 'utf8');
        let result = checkText(rel, text);
        if (opts.fix) {
            const fixes = result.findings.map((f) => f.fix).filter((f) => !!f);
            if (fixes.length) {
                const applied = applyFixes(text, fixes);
                text = applied.text;
                fixed += applied.applied;
                writeFileSync(join(root, rel), text);
                result = checkText(rel, text);
            }
        }
        findings.push(...result.findings);
        overrides.push(...result.overrides);
    }
    return { files: files.length, findings, overrides, fixed, ms: Math.round(performance.now() - started) };
}
export const formatFinding = (f) => `${f.file}:${f.line}:${f.column}  ${f.rule}  ${f.message}. ${f.hint}`;
/**
 * The check for an agent's edit hook: the files the payload names (Claude Code `tool_input.file_path`, Cursor
 * `file_path` or `files`, Codex `paths`), each checkable and inside the applied scope when one is recorded.
 */
export function hookCheck(root, payload) {
    let data = {};
    try {
        data = payload.trim() ? JSON.parse(payload) : {};
    }
    catch {
        data = { files: payload.split(/\s+/).filter(Boolean) };
    }
    const raw = [data.tool_input?.file_path, data.tool_input?.path, data.file_path, data.path, ...(data.files ?? []), ...(data.paths ?? []), ...(data.tool_input?.edits ?? []).map((e) => e?.file_path)].filter((x) => typeof x === 'string');
    const rels = [...new Set(raw.map((p) => relative(root, join(root, p.startsWith('/') ? relative(root, p) : p))))].filter((p) => !p.startsWith('..') && checkable(p) && existsSync(join(root, p)));
    let scoped = rels;
    try {
        const state = JSON.parse(readFileSync(join(root, '.ds', 'state.json'), 'utf8'));
        if (!state.whole)
            scoped = rels.filter((p) => state.checked.includes(p));
    }
    catch { }
    const r = scoped.length ? runCheck(root, { paths: scoped }) : { files: 0, findings: [], overrides: [], fixed: 0, ms: 0 };
    return { ...r, paths: scoped };
}
