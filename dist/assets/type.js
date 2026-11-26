import { codeFace, faces } from '../image/fonts.js';
import { capHeight, descent, measure, normalize } from '../image/text.js';
let facesPending;
export function allFaces() {
    facesPending ??= (async () => {
        const f = await faces();
        const code = await codeFace();
        return { display: f.heading, body: f.text, medium: f.medium, code };
    })();
    return facesPending;
}
export function faceFor(all, role) {
    return role === 'display' ? all.display : role === 'body' ? all.body : role === 'code' ? all.code : all.medium;
}
/** Copy that cannot be drawn whole: the message says what to change. */
export class FitError extends Error {
    slot;
    detail;
    constructor(message, slot, detail) {
        super(message);
        this.slot = slot;
        this.detail = detail;
    }
}
/** Wraps text into lines that fit a width at a size (explicit line breaks kept). A line may run 0.5% past the box:
 * the brand's boxes are set tight to the type, and the vendored faces measure a hair wider than the design tool's. */
export function wrapLines(face, text, size, width, tracking) {
    const lines = [];
    for (const para of clean(text).split('\n')) {
        const words = para.split(' ').filter(Boolean);
        let line = '';
        for (const word of words) {
            const next = line ? `${line} ${word}` : word;
            if (!line || measure(face, next, size, tracking) <= width * 1.005)
                line = next;
            else {
                lines.push(line);
                line = word;
            }
        }
        lines.push(line);
    }
    return lines;
}
/** Copy as it is set: composed characters, no control or zero-width characters, single spaces, its own line breaks. */
export function clean(text) {
    const out = [];
    for (const c of text.normalize('NFC').replace(/\r\n?/g, '\n')) {
        const n = c.codePointAt(0);
        if (n === 0x09 || n === 0xa0 || n === 0x2028 || n === 0x2029)
            out.push(' ');
        else if ((n < 0x20 && n !== 0x0a) || n === 0x7f || (n >= 0x200b && n <= 0x200d) || n === 0x2060 || n === 0xfeff || n === 0xfe0f)
            continue;
        else
            out.push(c);
    }
    return normalize(out.join(''));
}
/** Throws when a face has no glyph for a character: it would draw as an empty box. */
export function checkGlyphs(face, text, slot) {
    const missing = [...new Set([...clean(text)].filter((c) => c !== '\n' && !face.font.charToGlyphIndex(c)))];
    if (!missing.length)
        return;
    const emoji = missing.some((c) => /\p{Extended_Pictographic}/u.test(c));
    throw new FitError(`${face.family} has no ${missing.slice(0, 8).map((c) => `\`${c}\``).join(', ')}${missing.length > 8 ? ` (and ${missing.length - 8} more)` : ''}, which the ${slot ?? 'text'} uses. ${emoji ? 'The brand does not set emoji: take it out.' : `The brand's faces cover ${coverage(face)}: write it in those characters.`}`, slot);
}
function coverage(face) {
    const has = (c) => face.font.charToGlyphIndex(c) > 0;
    const scripts = [has('é') && has('ñ') ? 'Western European Latin' : 'basic Latin', has('ž') && has('ł') ? 'Central European Latin' : '', has('Ж') ? 'Cyrillic' : '', has('α') ? 'Greek' : ''].filter(Boolean);
    return scripts.join(', ');
}
/** The lines of a text at one size, or undefined when a line is wider than the box (a word longer than the line). */
export function linesAt(face, text, size, w, tracking) {
    const lines = wrapLines(face, text, size, w, tracking);
    return lines.every((l) => measure(face, l, size, tracking) <= w * 1.005 + 0.5) ? lines : undefined;
}
/** The size a single text draws at: its own if the copy fits its line limit, else a step smaller, to its floor. */
export function fitText(face, text, layer) {
    checkGlyphs(face, text, layer.slot);
    const tracking = layer.tracking ?? 0;
    const max = layer.maxLines ?? 99;
    const min = layer.min ?? layer.size * 0.75;
    for (let size = layer.size; size >= min - 0.01; size -= Math.max(0.25, layer.size / 40)) {
        const lines = linesAt(face, text, size, layer.w, tracking);
        if (lines && lines.length <= max)
            return { size, leading: layer.leading * (size / layer.size), lines };
    }
    const fits = longestPrefix(text, (t) => {
        const lines = linesAt(face, t, min, layer.w, tracking);
        return Boolean(lines && lines.length <= max);
    });
    throw tooLong(layer.slot, text, fits, `${max} line${max === 1 ? '' : 's'} at ${Math.round(min)}px, the smallest readable size`);
}
/** The longest run of whole words that fits. */
export function longestPrefix(text, fits) {
    const words = clean(text).split(/\s+/);
    let lo = 0;
    let hi = words.length;
    while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (fits(words.slice(0, mid).join(' ')))
            lo = mid;
        else
            hi = mid - 1;
    }
    return words.slice(0, lo).join(' ').length;
}
export function tooLong(slot, text, fits, room) {
    const name = slot ?? 'text';
    const words = clean(text).split(/\s+/);
    const long = words.reduce((a, b) => (b.length > a.length ? b : a), '');
    if (fits === 0)
        return new FitError(`The word \`${long.length > 40 ? `${long.slice(0, 40)}...` : long}\` in the ${name} is wider than this layout (${room}). Shorten it or break it into words.`, slot);
    return new FitError(`The ${name} is too long for this layout: ${clean(text).length} characters, and about ${fits} fit (${room}). Shorten it, or use a size or template with more room.`, slot);
}
/** The height from a first line's capitals to the last baseline. */
export const blockH = (face, lines, size, leading) => capHeight(face, size) + (lines - 1) * leading;
export { capHeight, descent, measure };
