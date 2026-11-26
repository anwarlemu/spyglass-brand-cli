import { readFileSync } from 'node:fs';
import { join } from 'node:path';
export const statePath = (root) => join(root, '.ds', 'state.json');
export function readState(root) {
    try {
        return JSON.parse(readFileSync(statePath(root), 'utf8'));
    }
    catch {
        return undefined;
    }
}
