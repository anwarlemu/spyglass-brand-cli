import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// What apply recorded in the app (.ds/state.json): its scope, whole or named parts, and the files the check covers.

export type Part = { whole?: boolean; kinds?: string[]; files?: string[]; targets: string[]; withShared?: boolean };
export type State = { version: 1; appliedAt: string; parts: Part[]; checked: string[]; whole: boolean };

export const statePath = (root: string) => join(root, '.ds', 'state.json');
export function readState(root: string): State | undefined {
	try {
		return JSON.parse(readFileSync(statePath(root), 'utf8')) as State;
	} catch {
		return undefined;
	}
}
