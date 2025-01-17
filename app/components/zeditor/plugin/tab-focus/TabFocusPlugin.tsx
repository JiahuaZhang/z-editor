import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, $setSelection, COMMAND_PRIORITY_LOW, FOCUS_COMMAND } from 'lexical';
import { useEffect } from 'react';

const TAB_TO_FOCUS_INTERVAL = 100;

let lastTabKeyDownTimestamp = 0;
let hasRegisteredKeyDownListener = false;

const registerKeyTimeStampTracker = () => {
  window.addEventListener(
    'keydown',
    (event: KeyboardEvent) => {
      // Tab
      if (event.key === 'Tab') {
        console.log('update timestamp', event.timeStamp);

        lastTabKeyDownTimestamp = event.timeStamp;
      }
    },
    true,
  );
};

export const TabFocusPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!hasRegisteredKeyDownListener) {
      registerKeyTimeStampTracker();
      hasRegisteredKeyDownListener = true;
    }

    return editor.registerCommand(
      FOCUS_COMMAND,
      (event: FocusEvent) => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          if (lastTabKeyDownTimestamp + TAB_TO_FOCUS_INTERVAL > event.timeStamp) {
            $setSelection(selection.clone());
          }
        }
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  return null;
};
