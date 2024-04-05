export type HexColor = `#${string}`;
export type NamedColor = 'red' | 'green' | 'blue' | 'cyan' | 'magenta' | 'yellow' | 'black' | 'white';
export type Color = NamedColor | HexColor;
export type SimpleRichContentLabel = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote';
export type RichContentLabel = SimpleRichContentLabel | 'ul' | 'li' | 'ol' | 'code' | 'embed' | 'image' | 'link' | 'hashTag' | 'inlinePanel' | string;

type PlainData = {
  id?: string;
  text: string;
};

type ComplexData = {
  id?: string;
  value?: string;
  bold?: boolean;
  underline?: boolean;
  italic?: boolean;
  color?: Color;
  background?: Color;
  [key: string]: string | number | boolean | undefined;
};

export type ContentData = PlainData | ComplexData;

export type Content = {
  label: RichContentLabel;
  data?: ContentData;
  children?: Content[],
  id?: string;
};