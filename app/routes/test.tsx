import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { BaseEditor, Editor, Element, Transforms, createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';
import { dummyData as blockDummyData, renderElement } from '~/components/slate/element/block';
import { dummyData as leafDummyData, renderLeaf } from '~/components/slate/element/leaf';
import { CodePlugin, dummyData as codeDummyData, links, useDecorate } from '~/components/slate/plugin/code';
import { onDOMBeforeInput as commonOnDOMBeforeInput, withCommon } from '~/components/slate/plugin/common';
import { dummyData as embedDummyData, handleEmbed } from '~/components/slate/plugin/embed';
import { FloatingToolbar } from '~/components/slate/plugin/floating-toolbar';
import { handlePasteOnImageUrl, dummyData as imageDummyData, onKeyDown as onKeyDownForImage } from '~/components/slate/plugin/image';
import { LinkPlugin, dummyData as inlineDummyData, isFloatingLinkOpenAtom, isFocusOnLink, isNewLinkShortcut } from '~/components/slate/plugin/inline';
import { withMarkdownShortcuts } from '~/components/slate/plugin/markdown';

export { links };

type CustomElement = { type: 'paragraph' | string; children: CustomText[]; };
type CustomText = { text: string; };

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

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
  ...blockDummyData,
  ...inlineDummyData,
  ...imageDummyData,
  ...codeDummyData,
  ...embedDummyData,
  ...leafDummyData,
];

export const MySlate = () => {
  const [editor] = useState(() => withMarkdownShortcuts(withCommon(withHistory(withReact(createEditor())))));
  const decorate = useDecorate(editor);
  const setIsFloatingLinkOpen = useSetAtom(isFloatingLinkOpenAtom);

  return <div >
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={value => {
        // console.log('onchange!');
        // console.log(value);

        // const isAstChange = editor.operations.some(op => 'set_selection' != op.type);

        // if (isAstChange) {
        //   const content = JSON.stringify(value);
        //   localStorage.setItem('content', content);
        //   console.log('save content to localStorage');
        // }
      }}
    >
      <FloatingToolbar />
      <CodePlugin />
      <LinkPlugin />
      <Editable
        spellCheck={false}
        un-m='4'
        un-border='2 orange-200'
        un-p='2'
        onKeyDown={event => {
          if (isNewLinkShortcut(event.nativeEvent)) {
            event.preventDefault();
            if (!isFocusOnLink(editor)) {
              setIsFloatingLinkOpen(prev => !prev);
            }
          }

          if (onKeyDownForImage(event, editor)) {
            return;
          }
        }}
        onPaste={event => {
          const text = event.clipboardData.getData('text/plain');
          if (handleEmbed(text, editor) || handlePasteOnImageUrl(text, editor)) {
            event.preventDefault();
          }
        }}
        // need to wrap useCallback?
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        decorate={decorate}
        // onKeyDown={event => {
        //   if (!event.ctrlKey) return;

        //   switch (event.key) {
        //     case '`':
        //       event.preventDefault();
        //       CustomEditor.toggleCodeBlock(editor);
        //       const [match] = Editor.nodes(editor, {
        //         match: n => n.type === 'code',
        //       });
        //       Transforms.setNodes(
        //         editor,
        //         { type: match ? 'paragraph' : 'code' },
        //         { match: n => Element.isElement(n) && Editor.isBlock(editor, n) }
        //       );
        //       break;
        //     case 'b':
        //       event.preventDefault();
        //       Editor.addMark(editor, 'bold', true);
        //       CustomEditor.toggleBoldMark(editor);
        //       break;
        //     default:
        //       break;
        //   }
        // }}
        onDOMBeforeInput={event => {
          commonOnDOMBeforeInput(editor, event);
        }}
      />
    </Slate>
  </div>;
};

export const Route = () => {
  return <MySlate />;
};

export default Route;