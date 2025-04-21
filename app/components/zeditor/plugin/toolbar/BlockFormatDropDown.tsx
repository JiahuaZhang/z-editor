import { $createCodeNode } from '@lexical/code';
import { INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createHeadingNode, $createQuoteNode, HeadingTagType } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { Select } from 'antd';
import { $createParagraphNode, $getSelection, $isRangeSelection, LexicalEditor } from 'lexical';
import { lazy, Suspense } from 'react';
import { useActiveEditorContext } from '../../context/activeEditor';
import { blockTypeToBlockName } from '../../context/ToolbarContext';

const Divider = lazy(() => import('./ToolbarPlugin').then(module => ({ default: module.Divider })));

const formatParagraph = (editor: LexicalEditor) => {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $setBlocksType(selection, () => $createParagraphNode());
    }
  });
};

const formatHeading = (heading: HeadingTagType) => (editor: LexicalEditor) => {
  editor.update(() => {
    const selection = $getSelection();
    $setBlocksType(selection, () => $createHeadingNode(heading));
  });
};

const formatBulletList = (editor: LexicalEditor) => {
  editor.update(() => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  });
};

const formatNumberedList = (editor: LexicalEditor) => {
  editor.update(() => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  });
};

const formatCheckList = (editor: LexicalEditor) => {
  editor.update(() => {
    editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
  });
};

const formatQuote = (editor: LexicalEditor) => {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $setBlocksType(selection, () => $createQuoteNode());
    }
  });
};

const formatCode = (editor: LexicalEditor) => {
  editor.update(() => {
    let selection = $getSelection();
    if (!selection) return;

    if (selection.isCollapsed()) {
      $setBlocksType(selection, () => $createCodeNode());
    } else {
      const textContent = selection.getTextContent();
      const codeNode = $createCodeNode();
      selection.insertNodes([codeNode]);
      selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertRawText(textContent);
      }
    }
  });
};

const COMMON_BLOCK_FORMATS = ['paragraph', 'h1', 'h2', 'h3', 'bullet', 'number', 'check', 'quote', 'code'] as const;
const BLOCK_LABELS: Record<keyof typeof blockTypeToBlockName, string> = {
  paragraph: 'Normal',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  bullet: 'Bullet List',
  number: 'Numbered List',
  check: 'Check List',
  quote: 'Quote',
  code: 'Code Block'
};
const BLOCK_ICONS: Record<keyof typeof blockTypeToBlockName, string> = {
  paragraph: 'i-system-uicons:paragraph-left',
  h1: 'i-ci:heading-h1',
  h2: 'i-ci:heading-h2',
  h3: 'i-ci:heading-h3',
  h4: 'i-ci:heading-h4',
  h5: 'i-ci:heading-h5',
  h6: 'i-ci:heading-h6',
  bullet: 'i-ph:list-bullets',
  number: 'i-ph:list-numbers',
  check: 'i-material-symbols-light:check-box-outline',
  quote: 'i-mdi:format-quote-open',
  code: 'i-ph:code-bold',
};
const BLOCK_CONVERTERS: Record<keyof typeof blockTypeToBlockName, (editor: LexicalEditor) => void> = {
  paragraph: formatParagraph,
  h1: formatHeading('h1'),
  h2: formatHeading('h2'),
  h3: formatHeading('h3'),
  h4: formatHeading('h4'),
  h5: formatHeading('h5'),
  h6: formatHeading('h6'),
  bullet: formatBulletList,
  number: formatNumberedList,
  check: formatCheckList,
  quote: formatQuote,
  code: formatCode
};

export const BlockFormatDropDown = ({ blockType }: { blockType: keyof typeof blockTypeToBlockName; }) => {
  const [editor] = useLexicalComposerContext();
  const activeEditor = useActiveEditorContext();

  if (editor !== activeEditor) return null;

  return <Suspense>
    <Select un-m='1' un-border='none hover:blue-6' className='[&>div]:(pr-0 pl-1)! [&>span]:(mr--1.5!)'
      disabled={!editor.isEditable()}
      value={blockType}
      popupClassName='w-auto!'
      options={COMMON_BLOCK_FORMATS.map(value => ({ label: BLOCK_LABELS[value], value }))}
      onChange={value => BLOCK_CONVERTERS[value as keyof typeof blockTypeToBlockName](activeEditor)}
      optionRender={args => {
        return <div un-inline='grid' un-grid-flow='col' un-gap='2' un-items='center' >
          <span className={BLOCK_ICONS[args.data.value]} un-text='lg' />
          {args.data.label}
        </div>;
      }}
      labelRender={args => <div un-flex='~' un-mr='-3' >
        <span className={BLOCK_ICONS[args.value as keyof typeof blockTypeToBlockName]} un-text='lg' />
      </div>}
      dropdownRender={original => <div un-min-w='80'>{original}</div>}
    />
    <Divider />
  </Suspense>;
};