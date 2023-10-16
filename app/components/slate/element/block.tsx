import { Element, Transforms } from 'slate';
import { ReactEditor, RenderElementProps, useReadOnly, useSlateStatic } from 'slate-react';
import { CodeBlock, CodeBlockType } from '../plugin/code';
import { renderEmbed } from '../plugin/embed';

const H1 = ({ children, ...rest }: RenderElementProps) => {
  return <h1 className="text-4xl font-bold leading-tight text-blue-950" {...rest.attributes}>
    {children}
  </h1>;
};

const H2 = ({ children, ...rest }: RenderElementProps) => {
  return <h2 className="text-3xl font-bold leading-tight text-blue-900" {...rest.attributes}>
    {children}
  </h2>;
};

const H3 = ({ children, ...rest }: RenderElementProps) => {
  return <h3 className="text-2xl font-bold leading-tight text-blue-800" {...rest.attributes}>
    {children}
  </h3>;
};

const H4 = ({ children, ...rest }: RenderElementProps) => {
  return <h4 className="text-xl font-semibold leading-tight text-blue-700" {...rest.attributes}>
    {children}
  </h4>;
};

const H5 = ({ children, ...rest }: RenderElementProps) => {
  return <h5 className="text-lg font-semibold leading-tight text-blue-600" {...rest.attributes}>
    {children}
  </h5>;
};

const H6 = ({ children, ...rest }: RenderElementProps) => {
  return <h6 className="text-base font-medium leading-tight text-blue-500" {...rest.attributes}>
    {children}
  </h6>;
};

const Paragraph = ({ children, ...rest }: RenderElementProps) => {
  return <p {...rest.attributes} >
    {children}
  </p>;
};

const Blockquote = ({ children, ...rest }: RenderElementProps) => {
  return <blockquote className="border-l-4 border-gray-400 pl-4 italic text-gray-700"
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
      className='flex items-center'
      {...rest}
    >
      <input
        className='rounded h-4 w-4 accent-blue-500 cursor-pointer'
        type="checkbox"
        checked={checked}
        onChange={event => {
          Transforms.setNodes(editor,
            { checked: event.target.checked, } as Partial<Element>,
            { at: ReactEditor.findPath(editor as ReactEditor, element) });
        }}
      />
      <span
        className={`flex-1 ml-2 cursor-text ${checked && 'text-gray-500 italic line-through'}`}
        contentEditable={!readOnly}
        suppressContentEditableWarning
      >
        {children}
      </span>
    </div>
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
