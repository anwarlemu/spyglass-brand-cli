// The design core: shared by every brand CLI, byte for byte. Only adapter.ts beside it belongs to one brand.
export * from './types.js';
export { CORE_VERSION, designHelp, designManifest, runDesign } from './run.js';
export { checkDesign, checkText, contrast, errorsOf, inkOf, luminance, NEVER_ALLOWED, RULES, SMALL_FLOOR, wordsOf } from './check.js';
export { allTemplates, DesignError, differences, infoFor, docText, nearest, parseDoc, redo, sameAs, SAME, stateOf, undo } from './doc.js';
export { applyEdits, create, layerFlag } from './ops.js';
export { examples, parsePhrases } from './phrases.js';
export { PLATFORMS, platformOf, sizeAlias, zonePx } from './platforms.js';
export { decodePng, encodePng, pngSize } from './png.js';
export { comparison, contactSheet, sheetCanvas, sheetSvg } from './sheet.js';
export { applyCompose, blockInfo, blockOf, blockOverlaps, blockRects, COMPOSE, composeExamples, composeInfo, composePhrase, GRID, gridOf, isCompose, outsideCells, parseAt, placeAt, validateBlocks, validateOutline } from './compose.js';
