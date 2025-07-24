import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  env: (config) => ({
    ...config,
    STORYBOOK: 'true'
  }),
  viteFinal: async (config) => {
    // Dynamic imports for ESM modules
    const { default: UnoCSS } = await import('unocss/vite');
    const { default: tsconfigPaths } = await import('vite-tsconfig-paths');

    config.plugins = config.plugins || [];
    config.plugins.push(UnoCSS());
    config.plugins.push(tsconfigPaths());

    // Add alias for ~ path
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '~': path.resolve(__dirname, '../app')
    };

    return config;
  }
};

export default config;