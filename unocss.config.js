import { defineConfig, presetUno, presetIcons, presetAttributify, presetTypography } from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetAttributify(), presetIcons(), presetTypography()],
})