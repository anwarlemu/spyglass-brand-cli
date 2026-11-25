import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// The end-to-end tests run the CLI many times over scratch apps (and some drive a browser); on a loaded machine one
// can take well over 30s, so the limit leaves room without letting a real hang run on. The library's own imports
// (@/react/..., @/lib/...) resolve to registry/, so a test can render its React files on the server.
const registry = fileURLToPath(new URL('./registry/', import.meta.url));
export default defineConfig({
	resolve: { alias: [{ find: /^@\/(react|lib)\//, replacement: `${registry}$1/` }] },
	esbuild: { jsx: 'automatic' },
	test: { include: ['test/**/*.test.ts'], testTimeout: 180000 },
});
