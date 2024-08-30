import type { AttributifyAttributes, AttributifyNames } from '@unocss/preset-attributify';

type Prefix = 'un-';
type UnoKey = AttributifyNames<Prefix>;

type Color = 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone' | 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose';
type ColorLowValue = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type ColorHighValue = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950';
type UnoTextColor = `${Prefix}text-${Color}` | `${Prefix}text-${Color}-${ColorLowValue | ColorHighValue}`;

type UnoAttributifyNames = Record<UnoKey | UnoTextColor, React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>>;

declare global {
  namespace JSX {
    interface IntrinsicElements extends UnoAttributifyNames {}
  }
}
