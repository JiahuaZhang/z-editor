import { $getNearestNodeFromDOMNode, $getSelection, $setSelection, LexicalEditor } from "lexical";
import { useState } from "react";
import { $isCodeNode } from '@lexical/code';
import { useDebounce } from "../../../util/utils";

type Props = {
  editor: LexicalEditor;
  getCodeDOMNode: () => HTMLElement | null;
}

export const CopyButton = ({ editor, getCodeDOMNode }: Props) => {
  const [isCopyCompleted, setCopyCompleted] = useState(false);
  const removeSuccessIcon = useDebounce(() => setCopyCompleted(false), 1000);

  const handleClick = async () => {
    const codeDOMNode = getCodeDOMNode();
    if (!codeDOMNode) return;

    let content = '';
    editor.update(() => {
      const codeNode = $getNearestNodeFromDOMNode(codeDOMNode);

      if ($isCodeNode(codeNode)) {
        content = codeNode.getTextContent();
      }

      const selection = $getSelection();
      $setSelection(selection);
    });

    try {
      await navigator.clipboard.writeText(content);
      setCopyCompleted(true);
      removeSuccessIcon();
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }

  return (
    <button un-border='rounded 2 solid transparent hover:blue-3' un-flex='~' un-items='center' un-text='lg' onClick={handleClick} aria-label="copy">
      {isCopyCompleted ? (
        <div className="i-material-symbols-light:check" un-text='green-6' ></div>
      ) : (
        <div className="i-ph:copy" un-text='hover:blue-4' ></div>
      )}
    </button>
  );
}
