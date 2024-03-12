export type HexColor = `#${string}`;
export type NamedColor = 'red' | 'green' | 'blue' | 'cyan' | 'magenta' | 'yellow' | 'black' | 'white';
export type Color = NamedColor | HexColor;
export type SimpleRichContentLabel = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote';
export type RichContentLabel = SimpleRichContentLabel | 'ul' | 'li' | 'ol' | 'code' | 'embed' | 'image' | 'link' | 'hashTag' | 'inlinePanel' | string;

export type ContentState = {
  ref?: HTMLElement;
  id?: string;
  key?: string;
} & Record<string, any>;

export type ContentData = ({ text: string; }
  | {
    value?: string;
    bold?: boolean;
    underline?: boolean;
    italic?: boolean;
    color?: Color;
    background?: Color;
  }) & Record<string, string>;

export type Content = {
  label: RichContentLabel;
  state?: ContentState;
  data?: ContentData;
  children?: Content[],
};