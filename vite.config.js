import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        emergency: resolve(__dirname, 'emergency.html'),
        directory: resolve(__dirname, 'directory.html'),
        yearbook: resolve(__dirname, 'yearbook.html'),
      },
    },
  },
});
