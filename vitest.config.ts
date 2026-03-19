import { defineConfig } from 'vitest/config';
import path from 'path';

const root = import.meta.dirname;

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.config.*', 'e2e/**'],
    },
  },
  resolve: {
    // SYNC: aliases must match tsconfig.json "paths" — update both when adding new aliases
    alias: {
      '@': path.resolve(root, './src'),
      '@/server': path.resolve(root, './src/server'),
      '@/client': path.resolve(root, './src/client'),
      '@/shared': path.resolve(root, './src/shared'),
      '@/app': path.resolve(root, './src/app'),
    },
  },
});
