import { $isListNode, ListNode } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createHeadingNode, $isHeadingNode, HeadingTagType } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { $findMatchingParent, $getNearestNodeOfType } from '@lexical/utils';
import { Select } from 'antd';
import { $createParagraphNode, $getSelection, $isRangeSelection, $isRootOrShadowRoot, COMMAND_PRIORITY_LOW, LexicalEditor, SELECTION_CHANGE_COMMAND } from 'lexical';
import { useCallback, useEffect, useState } from 'react';

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

const BLOCK_FORMATS = ['paragraph', 'h1', 'h2', 'h3', 'bullet', 'number', 'check', 'quote', 'code'] as const;
const BLOCK_LABELS: Record<typeof BLOCK_FORMATS[number], string> = {
  paragraph: 'Normal',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  bullet: 'Bullet List',
  number: 'Numbered List',
  check: 'Check List',
  quote: 'Quote',
  code: 'Code Block'
};
const BLOCK_ICONS: Record<typeof BLOCK_FORMATS[number], string> = {
  paragraph: 'i-system-uicons:paragraph-left',
  h1: 'i-ci:heading-h1',
  h2: 'i-ci:heading-h2',
  h3: 'i-ci:heading-h3',
  bullet: 'i-ph:list-bullets',
  number: 'i-ph:list-numbers',
  check: 'i-material-symbols-light:check-box-outline',
  quote: 'i-mdi:format-quote-open',
  code: 'i-ph:code-bold',
};
const BLOCK_CONVERTERS: Record<typeof BLOCK_FORMATS[number], (editor: LexicalEditor) => void> = {
  paragraph: formatParagraph,
  h1: formatHeading('h1'),
  h2: formatHeading('h2'),
  h3: formatHeading('h3'),
  bullet: () => {},
  number: () => {},
  check: () => {},
  quote: () => {},
  code: () => {},
};

export const BlockFormatDropDown = ({}: {}) => {
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [format, setFormat] = useState(BLOCK_FORMATS[0]);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return;
    }

    const anchorNode = selection.anchor.getNode();
    let element = anchorNode.getKey() === 'root'
      ? anchorNode
      : $findMatchingParent(anchorNode, (e) => {
        const parent = e.getParent();
        return parent !== null && $isRootOrShadowRoot(parent);
      });

    if (element === null) {
      element = anchorNode.getTopLevelElementOrThrow();
    }

    const elementKey = element.getKey();
    const elementDOM = editor.getElementByKey(elementKey);

    if (elementDOM === null) {
      console.log('elementDOM is null');
      return;
    } else {
      if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType(anchorNode, ListNode);
        const type = parentList ? parentList.getListType() : element.getListType();
        setFormat(type as any);
      } else {
        const type = $isHeadingNode(element) ? element.getTag() : element.getType();
        if (BLOCK_FORMATS.includes(type as any)) {
          setFormat(type as any);
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        $updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, $updateToolbar]);

  return <Select un-m='1' un-min-w='30' un-border='none hover:blue-6' disabled={!isEditable}
    value={format}
    popupClassName='w-auto!'
    options={BLOCK_FORMATS.map(value => ({ label: BLOCK_LABELS[value], value }))}
    onChange={value => {
      setFormat(value);
      BLOCK_CONVERTERS[value as typeof BLOCK_FORMATS[number]](editor);
    }}
    optionRender={args => {
      return <div un-inline='grid' un-grid-flow='col' un-gap='2' un-items='center' >
        <span className={BLOCK_ICONS[args.data.value]} />
        {args.data.label}
      </div>;
    }}
    labelRender={args => {
      return <div un-inline='grid' un-grid-flow='col' un-gap='2' un-items='center' >
        <div className={BLOCK_ICONS[args.value as typeof BLOCK_FORMATS[number]]}></div>
        {args.label}
      </div>;
    }}
    dropdownRender={original => <div un-min-w='80'>{original}</div>}
  />;
};