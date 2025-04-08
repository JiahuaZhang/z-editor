import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import dayjs from 'dayjs';
import { atom, useSetAtom } from 'jotai';
import { $getNodeByKey, $getSelection, $insertNodes, $isRangeSelection, COMMAND_PRIORITY_LOW, createCommand } from 'lexical';
import { useEffect, useRef } from 'react';
import { $createTimeNode, TimeNode } from './TimeNode';

const DATE_FORMAT = 'YYYY/M/D HH:mm:ss';
const TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS';

export const INSERT_TIME_TODAY = createCommand<undefined>();
export const INSERT_TIME_NOW = createCommand<undefined>();
export const INSERT_TIME_TODAY_NOW = createCommand<undefined>();
export const INSERT_TIME_YESTERDAY = createCommand<undefined>();
export const INSERT_TIME_TOMORROW = createCommand<undefined>();

export const timeNodeMapAtom = atom<Record<string, TimeNode>>({});

export const TimePlugin = () => {
  const [editor] = useLexicalComposerContext();
  const setTimeNodeMap = useSetAtom(timeNodeMapAtom);
  const hasInitalizedRef = useRef(false);

  useEffect(() => {
    if (!editor.hasNodes([TimeNode])) {
      throw new Error('TimePlugin: TimeNode is not registered on editor');
    }

    return mergeRegister(
      editor.registerCommand(
        INSERT_TIME_TODAY,
        () => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return false;
          const timeNode = $createTimeNode(dayjs().format(DATE_FORMAT), '', 'date');
          $insertNodes([timeNode]);
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        INSERT_TIME_NOW,
        () => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return false;
          console.log(dayjs().format(TIME_FORMAT));
          const timeNode = $createTimeNode('', dayjs().format(TIME_FORMAT), 'time');
          $insertNodes([timeNode]);
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        INSERT_TIME_TODAY_NOW,
        () => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return false;
          const timeNode = $createTimeNode(dayjs().format(DATE_FORMAT), dayjs().format(TIME_FORMAT), 'both');
          $insertNodes([timeNode]);
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        INSERT_TIME_YESTERDAY,
        () => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return false;
          const timeNode = $createTimeNode(dayjs().subtract(1, 'day').format(DATE_FORMAT), '', 'date');
          $insertNodes([timeNode]);
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        INSERT_TIME_TOMORROW,
        () => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return false;
          const timeNode = $createTimeNode(dayjs().add(1, 'day').format(DATE_FORMAT), '', 'date');
          $insertNodes([timeNode]);
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
    );
  });

  useEffect(() => editor.registerUpdateListener(({ editorState }) => {
    if (hasInitalizedRef.current) return;

    console.log('initalized');
    const timeNodes = Array.from(editorState._nodeMap.values())
      .filter((node): node is TimeNode => node instanceof TimeNode);

    const newTimeNodeMap: Record<string, TimeNode> = {};
    editor.read(() => timeNodes.forEach((node) => newTimeNodeMap[node.getKey()] = node));
    setTimeNodeMap(newTimeNodeMap);
    hasInitalizedRef.current = true;
  }), [editor]);

  useEffect(() => editor.registerMutationListener(TimeNode, (mutations) => {
    editor.update(() => {
      for (const [key, mutation] of mutations) {
        const timeNode = $getNodeByKey(key) as TimeNode;

        if (mutation === 'created') {
          setTimeNodeMap((prev) => ({ ...prev, [key]: timeNode }));
        } else if (mutation === 'destroyed') {
          setTimeNodeMap((prev) => {
            const newMap = { ...prev };
            delete newMap[key];
            return newMap;
          });
        } else if (mutation === 'updated') {
          setTimeNodeMap((prev) => {
            const newMap = { ...prev };
            newMap[key] = timeNode;
            return newMap;
          });
        }
      }
    });
  }), [editor]);

  return null;
};