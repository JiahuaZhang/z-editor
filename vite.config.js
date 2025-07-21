/// <reference types="vitest/config" />
import { reactRouter } from '@react-router/dev/vite';
import { fileURLToPath } from 'node:url';
import path from 'path';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import tsconfigPaths from 'vite-tsconfig-paths';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

const isStorybook = process.argv.some(arg => arg.includes('storybook'))
  || process.env.NODE_ENV === 'storybook'
  || process.env.STORYBOOK === 'true';

const isTest = process.argv.some(arg => arg.includes('vitest'))
  || process.env.NODE_ENV === 'test'
  || process.env.VITEST === 'true';

const shouldExcludeReactRouter = isStorybook || isTest;

export default defineConfig({
  plugins: shouldExcludeReactRouter ? [
    tsconfigPaths()
  ] : [
    devtoolsJson(),
    UnoCSS(),
    reactRouter({
      ignoredRouteFiles: ['**/.*']
    }),
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      '@emoji-datasource-facebook': path.resolve(__dirname, 'node_modules/emoji-datasource-facebook/img/facebook/64/'),
      '~': path.resolve(__dirname, 'app')
    }
  },
  define: {
    "process.env.IS_PREACT": JSON.stringify("true")
  },
  test: {
    environment: 'jsdom'
  }
});