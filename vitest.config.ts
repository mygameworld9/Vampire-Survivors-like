import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        include: ['tests/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/core/**', 'src/entities/**'],
            exclude: ['**/*.d.ts', '**/index.ts']
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    }
});
