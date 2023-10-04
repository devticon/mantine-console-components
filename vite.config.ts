import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import packageJson from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [dts()],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'lib/main'),
      fileName: 'main',
      name: packageJson.name,
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-dom',
        '@mantine/core',
        '@mantine/dates',
        '@mantine/hooks',
        '@remix-run/react',
        'dayjs',
        'zod',
        'zod-form-data',
      ],
    },
  },
});
