import { AppState, BinaryFiles } from '@excalidraw/excalidraw/types/types';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement } from '@lexical/utils';
import { $createParagraphNode, $insertNodes, $isRootOrShadowRoot, COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from 'lexical';
import { useEffect, useState } from 'react';
import { ExcalidrawInitialElements, ExcalidrawModal } from './ExcalidrawModal';
import { $createExcalidrawNode, ExcalidrawNode } from './ExcalidrawNode';

export const INSERT_EXCALIDRAW_COMMAND: LexicalCommand<void> = createCommand('INSERT_EXCALIDRAW_COMMAND');

export const ExcalidrawPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!editor.hasNodes([ExcalidrawNode])) {
      throw new Error(
        'ExcalidrawPlugin: ExcalidrawNode not registered on editor',
      );
    }

    return editor.registerCommand(
      INSERT_EXCALIDRAW_COMMAND,
      () => {
        setModalOpen(true);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  const onClose = () => setModalOpen(false);

  const onSave = (
    elements: ExcalidrawInitialElements,
    appState: Partial<AppState>,
    files: BinaryFiles,
  ) => {
    editor.update(() => {
      const excalidrawNode = $createExcalidrawNode();
      excalidrawNode.setData(JSON.stringify({ appState, elements, files }));
      $insertNodes([excalidrawNode]);
      if ($isRootOrShadowRoot(excalidrawNode.getParentOrThrow())) {
        $wrapNodeInElement(excalidrawNode, $createParagraphNode).selectEnd();
      }
    });
    setModalOpen(false);
  };

  return isModalOpen && <ExcalidrawModal initialElements={[]}
    initialAppState={{} as AppState}
    initialFiles={{}}
    onClose={onClose}
    onSave={onSave}
  />;
};