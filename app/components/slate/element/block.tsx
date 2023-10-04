import { FacebookEmbed, InstagramEmbed, LinkedInEmbed, PinterestEmbed, TikTokEmbed, TwitterEmbed } from 'react-social-media-embed';
import { Element, Transforms } from 'slate';
import { ReactEditor, RenderElementProps, useReadOnly, useSlateStatic } from 'slate-react';

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

const Code = ({ children, ...rest }: RenderElementProps) => {
  return <code {...rest.attributes} >
    {children}
  </code>;
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

const YouTube = ({ children, element, ...rest }: RenderElementProps) => {
  const { id } = element as any;
  return <div
    className='relative w-full max-w-[1280px] pb-[39.54%] mx-auto'
    contentEditable={false}
    {...rest}
  >
    <iframe
      src={`https://www.youtube.com/embed/${id!}`}
      aria-label="Youtube video"
      className='absolute top-0 left-0 w-full h-full'
    />
    {children}
  </div>;
};

const Facebook = ({ children, element, ...rest }: RenderElementProps) => {
  const { url } = element as any;
  return <div className='flex justify-center' {...rest} >
    <FacebookEmbed url={url!} />
    {children}
  </div>;
};

const Instagram = ({ children, element, ...rest }: RenderElementProps) => {
  const { url } = element as any;
  return <div className='flex justify-center' {...rest}>
    <InstagramEmbed url={url!} width={500} />
    {children}
  </div>;
};

const LinkedIn = ({ children, element, ...rest }: RenderElementProps) => {
  const { url } = element as any;
  return <div className='flex justify-center' {...rest}>
    <LinkedInEmbed url={url!} width={500} />
    {children}
  </div>;
};

const Pinterest = ({ children, element, ...rest }: RenderElementProps) => {
  const { url } = element as any;
  return <div className='flex justify-center' {...rest}>
    <PinterestEmbed url={url!} height={540} />
    {children}
  </div>;
};

const TikTok = ({ children, element, ...rest }: RenderElementProps) => {
  const { url } = element as any;
  return <div className='flex justify-center' {...rest}>
    <TikTokEmbed url={url!} />
    {children}
  </div>;
};

const Twitter = ({ children, element, ...rest }: RenderElementProps) => {
  const { url } = element as any;
  return <div className='flex justify-center' {...rest}>
    <TwitterEmbed url={url!} width={400} />
    {children}
  </div>;
};

// const CodeBlock = ({ children, element, ...rest }: RenderElementProps) => {
//   const { language } = element as any;
//   const editor = useSlateStatic();

//   return <div
//     className='font-mono text-base leading-5 mt-0 py-1.5 px-3 relative'
//     spellCheck={false}
//     {...rest}
//   >
//     <select
//       contentEditable={false}
//       className='absolute right-1.5 top-1.5 z-10'
//       value={language}
//       onChange={event => {
//         const path = ReactEditor.findPath(editor, element);
//         Transforms.setNodes(editor, { language: event.target.value } as any, { at: path });
//       }}
//     >
//       <option value="css">CSS</option>
//       <option value="html">HTML</option>
//       <option value="java">Java</option>
//       <option value="javascript">JavaScript</option>
//       <option value="jsx">JSX</option>
//       <option value="markdown">Markdown</option>
//       <option value="php">PHP</option>
//       <option value="python">Python</option>
//       <option value="sql">SQL</option>
//       <option value="tsx">TSX</option>
//       <option value="typescript">TypeScript</option>
//     </select>
//     {children}
//   </div>;
// };

export const renderElement = (props: RenderElementProps) => {
  switch ((props.element as any).type as string) {
    case 'code':
      return <Code {...props} />;
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
    case 'youtube':
      return <YouTube {...props} />;
    case 'facebook':
      return <Facebook {...props} />;
    case 'instagram':
      return <Instagram {...props} />;
    case 'linkedin':
      return <LinkedIn {...props} />;
    case 'pinterest':
      return <Pinterest {...props} />;
    case 'tiktok':
      return <TikTok {...props} />;
    case 'twitter':
      return <Twitter {...props} />;
    // case CodeBlockType:
    //   return <CodeBlock {...props} />;
    case 'p':
    default:
      return <Paragraph {...props} />;
  }
};
