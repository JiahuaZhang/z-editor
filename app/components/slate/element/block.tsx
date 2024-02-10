import { RenderElementProps } from 'slate-react';
import { CodeBlock, CodeBlockType } from '../plugin/code';
import { renderEmbed } from '../plugin/embed';
import { ImageBlock, ImageType } from '../plugin/image';
import { HASH_TAG_TYPE, HashTag } from '../plugin/inline/hash-tag';
import { LINK_TYPE, Link } from '../plugin/inline/link';
import { CHECK_LIST_ITEM_TYPE, CheckListItem, ListItem, OrderedList, UnorderedList } from '../plugin/list/list';
import { InlinePanel, InlinePanelType } from '../plugin/panel/inline-panel';

const H1 = ({ children, attributes }: RenderElementProps) => {
  return <h1
    un-text='4xl blue-950'
    un-font='bold'
    un-leading='tight'
    {...attributes}>
    {children}
  </h1>;
};

export const H1DropDown = () => <h1 un-text='4xl blue-950'
  un-font='bold'
  un-leading='tight'>Heading h1</h1>;

const H2 = ({ children, attributes }: RenderElementProps) => {
  return <h2
    un-text='3xl blue-900'
    un-font='bold'
    un-leading='tight'
    {...attributes}>
    {children}
  </h2>;
};

export const H2DropDown = () => <h2 un-text='3xl blue-900'
  un-font='bold'
  un-leading='tight'>Heading h2</h2>;

const H3 = ({ children, attributes }: RenderElementProps) => {
  return <h3
    un-text='2xl blue-800'
    un-font='bold'
    un-leading='tight'
    {...attributes}>
    {children}
  </h3>;
};

export const H3DropDown = () => <h3 un-text='2xl blue-800'
  un-font='bold'
  un-leading='tight'>Heading h3</h3>;

const H4 = ({ children, attributes }: RenderElementProps) => {
  return <h4
    un-text='xl blue-700'
    un-font='bold'
    un-leading='tight'
    {...attributes}>
    {children}
  </h4>;
};

export const H4DropDown = () => <h4 un-text='xl blue-700'
  un-font='bold'
  un-leading='tight'>Heading h4</h4>;

const H5 = ({ children, attributes }: RenderElementProps) => {
  return <h5
    un-text='lg blue-600'
    un-font='bold'
    un-leading='tight'
    {...attributes}>
    {children}
  </h5>;
};

export const H5DropDown = () => <h5 un-text='lg blue-600'
  un-font='bold'
  un-leading='tight'>Heading h5</h5>;

const H6 = ({ children, attributes }: RenderElementProps) => {
  return <h6
    un-text='base blue-500'
    un-font='bold'
    un-leading='tight'
    {...attributes}>
    {children}
  </h6>;
};

export const H6DropDown = () => <h6 un-text='base blue-500'
  un-font='bold'
  un-leading='tight'>Heading h6</h6>;

const P = ({ children, attributes }: RenderElementProps) => {
  return <p {...attributes} >
    {children}
  </p>;
};

export const PDropDown = () => <p>paragraph</p>;

const Blockquote = ({ children, attributes }: RenderElementProps) => {
  return <blockquote
    un-text='gray-700'
    un-border='l-4 gray-400'
    un-p='l-4'
    un-font='italic'
    {...attributes} >
    {children}
  </blockquote>;
};

export const BlockquoteDropDown = () => <blockquote un-text='gray-700'
  un-border='l-4 gray-400'
  un-p='l-4'
  un-font='italic'>blockquote</blockquote>;

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

export const dummyData = [
  {
    type: 'p',
    children: [{ text: 'Try it out for yourself!' }],
  },
  {
    type: 'h1',
    children: [{ text: 'Heading 1 here' }],
  },
  {
    type: 'h2',
    children: [{ text: 'Heading 2 here' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Heading 3 here' }],
  },
  {
    type: 'h4',
    children: [{ text: 'Heading 4 here' }],
  },
  {
    type: 'h5',
    children: [{ text: 'Heading 5 here' }],
  },
  {
    type: 'h6',
    children: [{ text: 'Heading 6 here' }],
  },
  {
    type: 'p',
    children: [{ text: 'A line of text in a paragraph' }],
  },
  {
    type: 'blockquote',
    children: [{ text: 'A line of text in a blockquote' }],
  },
];
