import { Element, Transforms } from 'slate';
import { ReactEditor, RenderElementProps, useReadOnly, useSlateStatic } from 'slate-react';
import { CodeBlock, CodeBlockType } from '../plugin/code';
import { renderEmbed } from '../plugin/embed';

const H1 = ({ children, ...rest }: RenderElementProps) => {
  return <h1
    un-text='4xl blue-950'
    un-font='bold'
    un-leading='tight'
    {...rest.attributes}>
    {children}
  </h1>;
};

const H2 = ({ children, ...rest }: RenderElementProps) => {
  return <h2
    un-text='3xl blue-900'
    un-font='bold'
    un-leading='tight'
    {...rest.attributes}>
    {children}
  </h2>;
};

const H3 = ({ children, ...rest }: RenderElementProps) => {
  return <h3
    un-text='2xl blue-800'
    un-font='bold'
    un-leading='tight'
    {...rest.attributes}>
    {children}
  </h3>;
};

const H4 = ({ children, ...rest }: RenderElementProps) => {
  return <h4
    un-text='xl blue-700'
    un-font='bold'
    un-leading='tight'
    {...rest.attributes}>
    {children}
  </h4>;
};

const H5 = ({ children, ...rest }: RenderElementProps) => {
  return <h5
    un-text='lg blue-600'
    un-font='bold'
    un-leading='tight'
    {...rest.attributes}>
    {children}
  </h5>;
};

const H6 = ({ children, ...rest }: RenderElementProps) => {
  return <h6
    un-text='base blue-500'
    un-font='bold'
    un-leading='tight'
    {...rest.attributes}>
    {children}
  </h6>;
};

const Paragraph = ({ children, ...rest }: RenderElementProps) => {
  return <p {...rest.attributes} >
    {children}
  </p>;
};

const Blockquote = ({ children, ...rest }: RenderElementProps) => {
  return <blockquote
    un-text='gray-700'
    un-border='l-4 gray-400'
    un-p='l-4'
    un-font='italic'
    {...rest.attributes} >
    {children}
  </blockquote>;
};

const CheckListItem = ({ children, element, ...rest }: RenderElementProps) => {
  const editor = useSlateStatic();
  const readOnly = useReadOnly();
  const { checked } = element as any;

  return (
    <div
      un-flex='~ items-center'
      {...rest}
    >
      <input
        un-border='rounded'
        un-h='4'
        un-w='4'
        un-accent='blue-500'
        un-cursor='pointer'
        type="checkbox"
        checked={checked}
        onChange={event => {
          Transforms.setNodes(editor,
            { checked: event.target.checked, } as Partial<Element>,
            { at: ReactEditor.findPath(editor as ReactEditor, element) });
        }}
      />
      <span
        un-flex='1'
        un-m='l-2'
        un-text={`${checked && 'gray-500'}`}
        un-font={`${checked && 'italic'}`}
        un-decoration={`${checked && 'line-through'}`}
        contentEditable={!readOnly}
        suppressContentEditableWarning
      >
        {children}
      </span>
    </div >
  );
};

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
    case 'check-list-item':
      return <CheckListItem {...props} />;
    case CodeBlockType:
      return <CodeBlock {...props} />;
    case 'p':
      return <Paragraph {...props} />;
  }

  const embed = renderEmbed(props);
  return embed || <Paragraph {...props} />;
};

export const dummyData = [
  {
    type: 'check-list-item',
    checked: true,
    children: [{ text: 'Slide to the left.' }],
  },
  {
    type: 'check-list-item',
    checked: false,
    children: [{ text: 'Criss-cross.' }],
  },
  {
    type: 'check-list-item',
    checked: true,
    children: [{ text: 'Criss-cross!' }],
  },
  {
    type: 'check-list-item',
    checked: false,
    children: [{ text: 'Cha cha real smooth…' }],
  },
  {
    type: 'check-list-item',
    checked: false,
    children: [{ text: "Let's go to work!" }],
  },
  {
    type: 'check-list-item',
    checked: false,
    children: [{ text: "" }],
  },
  {
    type: 'paragraph',
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
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph' }],
  },
  {
    type: 'blockquote',
    children: [{ text: 'A line of text in a blockquote' }],
  }
];
