import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: '../public',
        emptyOutDir: false,
        lib: {
            entry: 'src/main.js',
            name: 'FundedWidget',
            fileName: () => 'widget.js',
            formats: ['iife']
        },
        rollupOptions: {
            output: {
                extend: true,
            }
        }
    }
});
