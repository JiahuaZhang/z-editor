import { reactRouter } from '@react-router/dev/vite';
import { vitePlugin as remix } from "@remix-run/dev";
import path from 'path';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    UnoCSS(),
    reactRouter({
      ignoredRouteFiles: ['**/.*']
    }),
    remix(),
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      '@emoji-datasource-facebook': path.resolve(
        __dirname,
        'node_modules/emoji-datasource-facebook/img/facebook/64/',
      ),
    }
  },
  define: {
    "process.env.IS_PREACT": JSON.stringify("true"),
  },
})