import { RichContent } from './structure';
import { v4 } from 'uuid';

export const prepareRichContent = (content: RichContent<string>) => ({
  ...content,
  state: {
    id: v4()
  }
});

export const initContent = (contents: RichContent<string>[]) => contents.map(prepareRichContent);