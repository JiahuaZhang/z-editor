import { defineConfig, presetAttributify, presetIcons, presetTagify, presetTypography, presetWind4, transformerVariantGroup } from 'unocss';
import { presetAnimations } from 'unocss-preset-animations';
import { presetAntd } from 'unocss-preset-antd';

export default defineConfig({
  presets: [
    presetWind4({ preflights: { reset: true } }),
    presetAntd(),
    presetAnimations(),
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