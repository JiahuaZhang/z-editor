import { RenderElementProps } from 'slate-react';
import { Blockquote, H1, H2, H3, H4, H5, H6, P } from './block';
import { CHECK_LIST_ITEM_TYPE, CheckListItem, ListItem, OrderedList, UnorderedList } from '../plugin/list/list';
import { CodeBlock, CodeBlockType } from '../plugin/code';
import { ImageBlock, ImageType } from '../plugin/image';
import { LINK_TYPE, Link } from '../plugin/inline/link';
import { HASH_TAG_TYPE, HashTag } from '../plugin/inline/hash-tag';
import { InlinePanel, InlinePanelType } from '../plugin/panel/inline-panel';
import { renderEmbed } from '../plugin/embed';

export const renderElement = (props: RenderElementProps) => {
  switch ((props.element as any).type as string) {
    case 'blockquote':
      return <Blockquote {...props} />;
    case 'h1':
      return <H1 {...props} />;
    case 'h2':
      return <H2 {...props} />;
    case 'h3':
      return <H3 {...props} />;
    case 'h4':
      return <H4 {...props} />;
    case 'h5':
      return <H5 {...props} />;
    case 'h6':
      return <H6 {...props} />;
    case 'ol':
      return <OrderedList {...props} />;
    case 'ul':
      return <UnorderedList {...props} />;
    case 'li':
      return <ListItem {...props} />;
    case CHECK_LIST_ITEM_TYPE:
      return <CheckListItem {...props} />;
    case CodeBlockType:
      return <CodeBlock {...props} />;
    case ImageType:
      return <ImageBlock {...props} />;
    case LINK_TYPE:
      return <Link {...props} />;
    case HASH_TAG_TYPE:
      return <HashTag {...props} />;
    case InlinePanelType:
      return <InlinePanel {...props} />;
    case 'p':
      return <P {...props} />;
  }

  const embed = renderEmbed(props);
  return embed || <P {...props} />;
};