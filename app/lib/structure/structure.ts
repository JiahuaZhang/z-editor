type HexColor = `#${string}`;
type NamedColor = 'red' | 'green' | 'blue' | 'cyan' | 'magenta' | 'yellow' | 'black' | 'white';
type Color = NamedColor | HexColor;

export type TextContent = {
  text: string;
  attribute?: {
    bold?: boolean;
    underline?: boolean;
    italic?: boolean;
    color?: Color;
    background?: Color;
  },
};

export type ChildContent = TextContent | {
  [key: string]: any;
};

export type SimpleRichContentLabel = 'p' | 'h1'
  | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote';

export type RichContentLabel = SimpleRichContentLabel | 'ul' | 'li' | 'ol' | 'code' | 'embed' | 'image' | 'link' | 'hashTag' | 'inlinePanel' | string;

export type RichContentData<T extends RichContentLabel = RichContentLabel> = {
  children: T extends SimpleRichContentLabel ? TextContent[] : ChildContent[],
  [key: string]: any;
};

export type RichContentState = {
  id: string;
  [key: string]: any;
};

export type RichContent<T extends RichContentLabel = RichContentLabel> = {
  label: T,
  data: RichContentData<T>,
  state?: RichContentState,
};

export type PContent = RichContent<'p'>;
export type H1Content = RichContent<'h1'>;