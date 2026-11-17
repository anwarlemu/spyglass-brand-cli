import { readFileSync } from "node:fs";
import path from "node:path";

import index from "./registry.generated.json";

// What the registry build wrote for the docs site (lib/registry.generated.json), and the library's source files.
export type Prop = { name: string; type: string; required: boolean; default?: string; description?: string };
export type Item = {
  name: string;
  title: string;
  group: string;
  description: string;
  use_for: string;
  never: string[];
  source: string;
  body: string;
  requires: string[];
  dependencies: string[];
  files: string[];
  examples: { name: string; label: string; center: boolean; half: boolean; bleed?: boolean }[];
  api?: { components: { name: string; file: string; props: Prop[] }[] };
  flavors: { react?: { files: string[] }; elements?: { files: string[]; tag: string; tags: string[]; modules: string[] } };
};

export const registryName = index.name;
export const groups = index.groups as Record<string, string>;
export const elementPrefix = index.elementPrefix;
export const assetBase = index.assetBase;
export const REPO = "https://github.com/anwarlemu/spyglass-brand-cli";
export const INSTALL_COMMAND = "npm install --save-dev github:anwarlemu/spyglass-brand-cli#release";
export const CLI = "npx spyglass-ds";
export const items = (index.items as Item[]).slice().sort((a, b) => a.title.localeCompare(b.title));
export const findItem = (name: string) => items.find((i) => i.name === name);

/** Items by group, in brand.json's group order, each group A to Z. */
export const grouped = Object.entries(groups)
  .map(([id, label]) => ({ id, label, items: items.filter((i) => i.group === id) }))
  .filter((g) => g.items.length);

const root = path.join(process.cwd(), "../../registry");
export const sourceOf = (rel: string) => readFileSync(path.join(root, rel), "utf8");
