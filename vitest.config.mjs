import { defineConfig } from 'vitest/config';

export default defineConfig({
    // Next.js keeps JSX in plain .js files, which esbuild does not assume by default.
    esbuild: {
        loader: 'jsx',
        include: [/\.[jt]sx?$/],
        exclude: [/node_modules/],
        jsx: 'automatic',
    },
    test: {
        // Component suites opt into jsdom with a `@vitest-environment jsdom` docblock.
        environment: 'node',
        globals: true,
        setupFiles: ['tests/setup.js'],
        include: ['tests/**/*.test.{js,jsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['app/**/*.js', 'utils/**/*.js', 'middleware.js'],
        },
    },
});
