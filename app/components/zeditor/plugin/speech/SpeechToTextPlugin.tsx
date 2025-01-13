import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand, LexicalEditor, RangeSelection, REDO_COMMAND, UNDO_COMMAND } from 'lexical';
import { useEffect, useRef, useState } from 'react';
import { useReport } from '../../util/useReport';

export const TOGGLE_SPEECH_TO_TEXT_COMMAND: LexicalCommand<void> = createCommand('TOGGLE_SPEECH_TO_TEXT_COMMAND');

const VOICE_COMMANDS: Readonly<Record<string, (arg: { editor: LexicalEditor; selection: RangeSelection; }) => void>> = {
  '\n': ({ selection }) => {
    selection.insertParagraph();
  },
  redo: ({ editor }) => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  },
  undo: ({ editor }) => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  },
};

export const canUseSpeechRecognition = () => 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

export const SpeechToTextPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const SpeechRecognition =
    // @ts-expect-error missing type
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = useRef<typeof SpeechRecognition | null>(null);
  const report = useReport();

  if (!canUseSpeechRecognition()) return null;

  useEffect(() => {
    if (isEnabled && recognition.current === null) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.addEventListener(
        'result',
        (event: typeof SpeechRecognition) => {
          const resultItem = event.results.item(event.resultIndex);
          const { transcript } = resultItem.item(0);
          report(transcript);

          if (!resultItem.isFinal) {
            return;
          }

          editor.update(() => {
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
              const command = VOICE_COMMANDS[transcript.toLowerCase().trim()];

              if (command) {
                command({
                  editor,
                  selection,
                });
              } else if (transcript.match(/\s*\n\s*/)) {
                selection.insertParagraph();
              } else {
                selection.insertText(transcript);
              }
            }
          });
        },
      );
    }

    if (recognition.current) {
      if (isEnabled) {
        recognition.current.start();
      } else {
        recognition.current.stop();
      }
    }

    return () => {
      if (recognition.current !== null) {
        recognition.current.stop();
      }
    };
  }, [SpeechRecognition, editor, isEnabled, report]);

  useEffect(() => {
    return editor.registerCommand(
      TOGGLE_SPEECH_TO_TEXT_COMMAND,
      () => {
        setIsEnabled(state => !state);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
};