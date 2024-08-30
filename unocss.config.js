import { defineConfig, presetAttributify, presetIcons, presetTagify, presetTypography, presetUno, transformerVariantGroup, transformerAttributifyJsx } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({ extraProperties: { display: 'inline-block' } }),
    presetTypography(),
    presetTagify({ prefix: 'un-' })
  ],
  transformers: [transformerVariantGroup()]
})