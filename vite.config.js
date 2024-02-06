import { unstable_vitePlugin as remix } from '@remix-run/dev'
import { installGlobals } from '@remix-run/node'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

installGlobals()

export default defineConfig({
  resolve: {
    alias: {
      '~': `${process.cwd()}/app`
    }
  },
  server: {
    port: 3000,
  },
  plugins: [
    UnoCSS(),
    remix({
      ignoredRouteFiles: ['**/.*']
    })
  ]
})