import { vitePlugin as remix } from '@remix-run/dev'
import { installGlobals } from '@remix-run/node'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

// installGlobals();

export default defineConfig({
  ssr: {
    noExternal: [],
  },
  plugins: [
    UnoCSS(),
    remix({
      ignoredRouteFiles: ['**/.*']
    }),
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      '@emoji-datasource-facebook': path.resolve(
        __dirname,
        'node_modules/emoji-datasource-facebook/img/facebook/64/',
      ),
    }
  }
})