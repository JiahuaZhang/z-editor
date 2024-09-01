import { defineConfig, presetAttributify, presetIcons, presetTagify, presetTypography, presetUno, transformerAttributifyJsx, transformerVariantGroup } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({ extraProperties: { display: 'inline-block' } }),
    presetTypography(),
    presetTagify({ prefix: 'un-' })
  ],
  transformers: [transformerVariantGroup(),
    // transformerAttributifyJsx({ blocklist: [/^(?!un-)/] })
  ]
})