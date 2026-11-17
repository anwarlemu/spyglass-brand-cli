import { defineConfig } from 'vitest/config';

// The end-to-end tests run the CLI many times over scratch apps (and some drive a browser); on a loaded machine one
// can take well over 30s, so the limit leaves room without letting a real hang run on.
export default defineConfig({ test: { include: ['test/**/*.test.ts'], testTimeout: 180000 } });
