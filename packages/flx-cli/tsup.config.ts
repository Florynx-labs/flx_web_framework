import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts'],
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: true,
  target: 'node18',
  platform: 'node',
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
  external: [
    '@florynx-labs/flx-core',
    '@florynx-labs/flx',
    '@florynx-labs/flx-pack',
    '@teamvelix/velix-core',
    '@teamvelix/velix',
    '@teamvelix/velix-pack',
    'esbuild',
    'chokidar',
    'picocolors',
    'prompts',
    'ora',
    'fsevents',
  ],
});
