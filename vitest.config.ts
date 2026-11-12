import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      '@florynx-labs/flx-core': path.resolve(__dirname, 'packages/flx-core/src/index.ts'),
      '@florynx-labs/flx-react': path.resolve(__dirname, 'packages/flx-react/src/index.ts'),
      '@florynx-labs/flx-pack': path.resolve(__dirname, 'packages/flx-pack/src/index.ts'),
      '@florynx-labs/flx': path.resolve(__dirname, 'packages/flx/index.ts'),
      '@teamvelix/velix-core': path.resolve(__dirname, 'packages/flx-core/src/index.ts'),
      '@teamvelix/velix-react': path.resolve(__dirname, 'packages/flx-react/src/index.ts'),
      '@teamvelix/velix-pack': path.resolve(__dirname, 'packages/flx-pack/src/index.ts'),
      '@teamvelix/velix': path.resolve(__dirname, 'packages/flx/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: [
      'packages/*/src/**/*.test.ts',
      'packages/*/src/**/*.spec.ts',
      'packages/*/src/**/*.test.tsx',
      'packages/*/tests/**/*.test.ts',
    ],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.velix/**', '**/.flx/**', '**/templates/**'],
    environmentMatchGlobs: [
      ['packages/flx-react/src/**/*.test.tsx', 'jsdom'],
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: ['node_modules', 'dist', 'templates', '**/*.config.*'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      }
    }
  }
});
