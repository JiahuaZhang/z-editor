import { $isCodeNode, CodeNode, getLanguageFriendlyName } from '@lexical/code';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNearestNodeFromDOMNode, isHTMLElement } from 'lexical';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFloatingAnchor } from '../../context/FloatingAnchor';
import { useDebounce } from '../../util/utils';
import { CopyButton } from './component/CopyButton';
import { PrettierButton } from './component/PrettierButton';

const CODE_PADDING = 8;

type Position = { top: string; right: string; };

const getMouseInfo = (event: MouseEvent): { codeDOMNode: HTMLElement | null; isOutside: boolean; } => {
  const target = event.target;

  if (isHTMLElement(target)) {
    const codeDOMNode = target.closest<HTMLElement>('code.lexical-code-locator');
    const isOutside = !(codeDOMNode || target.closest<HTMLElement>('div.lexical-code-menu-locator'));

    return { codeDOMNode, isOutside };
  } else {
    return { codeDOMNode: null, isOutside: true };
  }
};

const CodeActionMenuContainer = ({ anchorElem }: { anchorElem: HTMLElement; }) => {
  const [editor] = useLexicalComposerContext();
  const [lang, setLang] = useState('');
  const [isShown, setShown] = useState(false);
  const [shouldListenMouseMove, setShouldListenMouseMove] = useState(false);
  const [position, setPosition] = useState<Position>({ right: '0', top: '0' });
  const codeSetRef = useRef(new Set<string>());
  const codeDOMNodeRef = useRef<HTMLElement | null>(null);

  const debouncedOnMouseMove = useDebounce(
    (event: MouseEvent) => {
      const { codeDOMNode, isOutside } = getMouseInfo(event);
      if (isOutside) {
        setShown(false);
        return;
      }

      if (!codeDOMNode) return;

      codeDOMNodeRef.current = codeDOMNode;
      editor.update(() => {
        const maybeCodeNode = $getNearestNodeFromDOMNode(codeDOMNode);

        if ($isCodeNode(maybeCodeNode)) {
          const { y: editorElemY, right: editorElemRight } = anchorElem.getBoundingClientRect();
          const { y, right } = codeDOMNode.getBoundingClientRect();
          setLang(maybeCodeNode.getLanguage() ?? '');
          setShown(true);
          setPosition({
            right: `${editorElemRight - right + CODE_PADDING}px`,
            top: `${y - editorElemY}px`,
          });
        }
      });
    },
    50,
    1000,
  );

  useEffect(() => {
    if (!shouldListenMouseMove) return;

    document.addEventListener('mousemove', debouncedOnMouseMove);
    return () => {
      setShown(false);
      debouncedOnMouseMove.cancel();
      document.removeEventListener('mousemove', debouncedOnMouseMove);
    };
  }, [shouldListenMouseMove, debouncedOnMouseMove]);

  useEffect(() => {
    return editor.registerMutationListener(
      CodeNode,
      (mutations) => {
        editor.getEditorState().read(() => {
          for (const [key, type] of mutations) {
            switch (type) {
              case 'created':
                codeSetRef.current.add(key);
                break;

              case 'destroyed':
                codeSetRef.current.delete(key);
                break;

              default:
                break;
            }
          }
        });
        setShouldListenMouseMove(codeSetRef.current.size > 0);
      },
      { skipInitialization: false },
    );
  }, [editor]);

  return (
    <>
      {isShown ? (
        <div className="lexical-code-menu-locator" style={{ ...position }}
          un-position='absolute' un-z='5' un-select='none' un-text='gray-5' un-flex='~' un-gap='1' un-items='end'
          un-border=' solid purple-4'
        >
          <div un-text='sm'>{getLanguageFriendlyName(lang)}</div>
          <CopyButton editor={editor} getCodeDOMNode={() => codeDOMNodeRef.current} />
          <PrettierButton lang={lang} editor={editor} getCodeDOMNode={() => codeDOMNodeRef.current} />
        </div>
      ) : null}
    </>
  );
};

export const CodeActionMenuPlugin = () => {
  const anchor = useFloatingAnchor();
  return anchor && createPortal(<CodeActionMenuContainer anchorElem={anchor} />, anchor);
};
