import { useState } from 'react';
import { BaseEditor, Editor, Element, Transforms, createEditor } from 'slate';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';
import { renderElement } from '~/components/slate/element/block';
import { withCommon } from '~/components/slate/plugin/common';
import { handleEmbed } from '~/components/slate/plugin/embed';
import { withMarkdownShortcuts } from '~/components/slate/plugin/markdown';

type CustomElement = { type: 'paragraph' | string; children: CustomText[]; };
type CustomText = { text: string; };

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const CustomLeaf = (props: any) => {
  return <span
    {...props.attributes}
    style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}
  >
    {props.children}
  </span>;
};

const renderLeaf = (props: any) => <CustomLeaf {...props} />;

const CustomEditor = {
  isBoldMarkActive(editor: Editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.bold === true : false;
  },

  isCodeBlockActive(editor: Editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === 'code',
    });
    return !!match;
  },

  toggleBoldMark(editor: Editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    if (isActive) {
      Editor.removeMark(editor, 'bold');
    } else {
      Editor.addMark(editor, 'bold', true);
    }
  },

  toggleCodeBlock(editor: Editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? null : 'code' },
      { match: n => Element.isElement(n) && Editor.isBlock(editor, n) }
    );
  }
};

const initialValue = [
  {
    type: 'check-list-item',
    checked: true,
    children: [{ text: 'Slide to the left.' }],
  },
  // {
  //   type: CodeBlockType,
  //   language: 'jsx',
  //   children: toCodeLines(`// Add the initial value.
  //   const initialValue = [
  //     {
  //       type: 'paragraph',
  //       children: [{ text: 'A line of text in a paragraph.' }]
  //     }
  //   ]

  //   const App = () => {
  //     const [editor] = useState(() => withReact(createEditor()))

  //     return (
  //       <Slate editor={editor} initialValue={initialValue}>
  //         <Editable />
  //       </Slate>
  //     )
  //   }`),
  // },
  {
    type: 'twitter',
    url: 'https://twitter.com/bboczeng/status/1704506963864740350',
    children: [{ text: '' }]
  },
  {
    type: 'tiktok',
    url: 'https://www.tiktok.com/@gemdzq/video/7273529185589562625?lang=en',
    children: [{ text: '' }]
  },
  {
    type: 'tiktok',
    url: 'https://www.tiktok.com/@naho_nishikawaka/video/7252313395729353992?lang=en',
    children: [{ text: '' }]
  },
  {
    type: 'pinterest',
    url: 'https://www.pinterest.co.uk/pin/345721708908845555/',
    children: [{ text: '' }]
  },
  {
    type: 'linkedin',
    url: 'https://www.linkedin.com/embed/feed/update/urn:li:share:6898694772484112384',
    children: [{ text: '' }]
  },
  {
    type: 'linkedin',
    url: 'https://www.linkedin.com/embed/feed/update/urn:li:share:7109495184224124928',
    children: [{ text: '' }]
  },
  {
    type: 'instagram',
    url: 'https://www.instagram.com/p/CxVSMw7I__x/',
    children: [{ text: '' }]
  },
  {
    type: 'instagram',
    url: 'https://www.instagram.com/p/CUbHfhpswxt/',
    children: [{ text: '' }]
  },
  {
    type: 'facebook',
    url: 'https://www.facebook.com/andrewismusic/posts/451971596293956',
    children: [{ text: '' }]
  },
  {
    type: 'facebook',
    url: 'https://www.facebook.com/photo/?fbid=779946203929812&set=a.537750521482716',
    children: [{ text: '' }]
  },
  {
    type: 'check-list-item',
    checked: true,
    children: [{ text: 'Slide to the right.' }],
  },
  {
    type: 'youtube',
    id: 'gwOhmYGihUw',
    children: [{ text: '' }]
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
  },
  {
    type: 'code',
    children: [{ text: 'fn main() {\n    // code\n}' }],
  },
];

export const MySlate = () => {
  const [editor] = useState(() => withMarkdownShortcuts(withCommon(withReact(createEditor()))));

  return <div >
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={value => {
        // console.log('onchange!');

        // const isAstChange = editor.operations.some(op => 'set_selection' != op.type);

        // if (isAstChange) {
        //   const content = JSON.stringify(value);
        //   localStorage.setItem('content', content);
        //   console.log('save content to localStorage');
        // }
      }}
    >
      <Editable
        className='m-4 border-2 border-orange-200 p-2'
        onPaste={event => {
          const text = event.clipboardData.getData('text/plain');
          if (handleEmbed(text, editor)) {
            event.preventDefault();
          }
        }}
        // need to wrap useCallback?
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={event => {
          if (!event.ctrlKey) return;

          switch (event.key) {
            case '`':
              event.preventDefault();
              CustomEditor.toggleCodeBlock(editor);
              // const [match] = Editor.nodes(editor, {
              //   match: n => n.type === 'code',
              // });
              // Transforms.setNodes(
              //   editor,
              //   { type: match ? 'paragraph' : 'code' },
              //   { match: n => Element.isElement(n) && Editor.isBlock(editor, n) }
              // );
              break;
            case 'b':
              event.preventDefault();
              // Editor.addMark(editor, 'bold', true);
              CustomEditor.toggleBoldMark(editor);
              break;
            default:
              break;
          }
        }}
      />
    </Slate>
  </div>;
};

export const Route = () => {
  return <MySlate />;
  // return <ClientOnly>
  //   {() => <MySlate />}
  // </ClientOnly>;
};

export default Route;