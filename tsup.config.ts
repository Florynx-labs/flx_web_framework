import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    // Main flx package
    'packages/flx/index': 'packages/flx/index.ts',
    'packages/flx/server/index': 'packages/flx/server/index.ts',
    'packages/flx/client/index': 'packages/flx/client/index.ts',
    'packages/flx/config': 'packages/flx/config.ts',
    'packages/flx/runtime/start-dev': 'packages/flx/runtime/start-dev.ts',
    'packages/flx/runtime/start-prod': 'packages/flx/runtime/start-prod.ts',
    'packages/flx/build/index': 'packages/flx/build/index.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'node18',
  platform: 'node',
  splitting: true,
  treeshake: true,
  minify: process.env.NODE_ENV === 'production',
  shims: true,
});
