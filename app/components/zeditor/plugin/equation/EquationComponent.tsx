import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import { $getNodeByKey, CLICK_COMMAND, COMMAND_PRIORITY_HIGH, COMMAND_PRIORITY_LOW, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND, KEY_ENTER_COMMAND, KEY_ESCAPE_COMMAND, NodeKey, SELECTION_CHANGE_COMMAND } from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EquationEditor } from './EquationEditor';
import { $isEquationNode } from './EuqationNode';
import { KatexRenderer } from './KatexRenderer';

type EquationComponentProps = {
  equation: string;
  inline: boolean;
  nodeKey: NodeKey;
};

export const EquationComponent = ({
  equation,
  inline,
  nodeKey,
}: EquationComponentProps) => {
  const [editor] = useLexicalComposerContext();
  const isEditable = useLexicalEditable();
  const [equationValue, setEquationValue] = useState(equation);
  const [showEquationEditor, setShowEquationEditor] = useState<boolean>(false);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const inputRef = useRef(null);
  const KatexRef = useRef<HTMLSpanElement>(null);

  const onDelete = useCallback(
    (event: KeyboardEvent) => {
      if (isSelected) {
        event.preventDefault();
        editor.update(() => $getNodeByKey(nodeKey)?.remove());
      }
      return false;
    },
    [editor, isSelected, nodeKey],
  );

  const onEnter = useCallback(
    (event: KeyboardEvent) => {
      if (isSelected) {
        event.preventDefault();
        setShowEquationEditor(true);
      }
      return false;
    },
    [isSelected],
  );

  const onClick = useCallback((event: MouseEvent) => {
    if (KatexRef.current?.contains(event.target as Node)) {
      setSelected(true);
      return true;
    }
    return false;
  }, [editor]);

  const onHide = useCallback(
    (restoreSelection?: boolean) => {
      setShowEquationEditor(false);
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isEquationNode(node)) {
          node.setEquation(equationValue);
          if (restoreSelection) {
            node.selectNext(0, 0);
          }
        }
      });
    },
    [editor, equationValue, nodeKey],
  );

  useEffect(() => {
    if (!showEquationEditor && equationValue !== equation) {
      setEquationValue(equation);
    }
  }, [showEquationEditor, equation, equationValue]);

  useEffect(() => {
    if (!isEditable) {
      return;
    }
    if (showEquationEditor) {
      return mergeRegister(
        editor.registerCommand(
          SELECTION_CHANGE_COMMAND,
          (payload) => {
            const activeElement = document.activeElement;
            const inputElem = inputRef.current;
            if (inputElem !== activeElement) {
              onHide();
            }
            return false;
          },
          COMMAND_PRIORITY_HIGH,
        ),
        editor.registerCommand(
          KEY_ESCAPE_COMMAND,
          (payload) => {
            const activeElement = document.activeElement;
            const inputElem = inputRef.current;
            if (inputElem === activeElement) {
              onHide(true);
              return true;
            }
            return false;
          },
          COMMAND_PRIORITY_HIGH,
        ),
      );
    } else {
      return mergeRegister(
        editor.registerCommand(CLICK_COMMAND, onClick, COMMAND_PRIORITY_LOW),
        editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
        editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
        editor.registerCommand(KEY_ENTER_COMMAND, onEnter, COMMAND_PRIORITY_LOW),
      );
    }
  }, [editor, nodeKey, onHide, onClick, onDelete, onEnter, showEquationEditor, isEditable]);

  return (
    <>
      {showEquationEditor && isEditable ? (
        <EquationEditor
          equation={equationValue}
          setEquation={setEquationValue}
          inline={inline}
          ref={inputRef}
          onSave={() => onHide(true)}
        />
      ) : (
        <KatexRenderer un-p='0.5'
          un-border={`${isSelected ? 'rounded 2 blue-4' : ''}`}
          katexRef={KatexRef}
          equation={equationValue}
          inline={inline}
          onDoubleClick={() => {
            if (isEditable) {
              setShowEquationEditor(true);
            }
          }}
        />
      )}
    </>
  );
};
