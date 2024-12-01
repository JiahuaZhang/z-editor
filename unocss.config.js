import { defineConfig, presetAttributify, presetIcons, presetTagify, presetTypography, presetUno, transformerVariantGroup } from 'unocss'

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
  ],
  theme: {
    animation: {
      keyframes: {
        'ascend-from-bottom': '{ 0% { opacity: 0; transform: translateY(50px) } 100% { opacity: 1; transform: translateY(0) }  }'
      },
      durations: {
        'ascend-from-bottom': '0.4s'
      },
      timingFns: {
        'ascend-from-bottom': 'ease'
      }
    }
  }
})