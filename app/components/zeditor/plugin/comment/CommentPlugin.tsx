import { $createMarkNode, $getMarkIDs, $isMarkNode, $unwrapMarkNode, $wrapSelectionInMarkNode, MarkNode } from '@lexical/mark';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { $isRootTextContentEmpty } from '@lexical/text';
import { mergeRegister, registerNestedElementResolver } from '@lexical/utils';
import { Tooltip } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { $getNodeByKey, $getRoot, $getSelection, $isRangeSelection, $isTextNode, CLEAR_EDITOR_COMMAND, COMMAND_PRIORITY_EDITOR, createCommand, EditorState, KEY_ESCAPE_COMMAND, LexicalCommand, LexicalEditor, NodeKey, RangeSelection } from 'lexical';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useToggle } from '~/components/util/useToggle';
import { createDOMRange, createRectsFromDOMRange, getDOMSelection } from '../../util/utils';
import { createComment, createThread, Thread, useCommentContext, type Comment, type Comments } from './CommentContext';

dayjs.extend(relativeTime);

export const INSERT_INLINE_COMMAND: LexicalCommand<void> = createCommand('INSERT_INLINE_COMMAND',);

const AddCommentBox = ({ anchorKey, editor, onAddComment }: {
  anchorKey: NodeKey;
  editor: LexicalEditor;
  onAddComment: () => void;
}): JSX.Element => {
  const boxRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const boxElem = boxRef.current;
    const rootElement = editor.getRootElement();
    const anchorElement = editor.getElementByKey(anchorKey);

    if (boxElem !== null && rootElement !== null && anchorElement !== null) {
      const { right } = rootElement.getBoundingClientRect();
      const { top } = anchorElement.getBoundingClientRect();
      boxElem.style.left = `${right - 20}px`;
      boxElem.style.top = `${top - 30}px`;
    }
  }, [anchorKey, editor]);

  useEffect(() => {
    window.addEventListener('resize', updatePosition);

    return () => window.removeEventListener('resize', updatePosition);
  }, [editor, updatePosition]);

  useEffect(updatePosition, [anchorKey, editor, updatePosition]);

  return (
    <div un-position='fixed' un-z='10' ref={boxRef}>
      <button un-bg='white hover:blue-500' un-py='2' un-px='1' un-border='rounded-full 2 solid zinc-400 hover:none' un-flex='~' un-text='hover:white'
        onClick={onAddComment}>
        <span className="i-material-symbols-light:comment-outline" un-text='3xl' />
      </button>
    </div>
  );
};

const EscapeHandlerPlugin = ({ onEscape, }: { onEscape: (e: KeyboardEvent) => boolean; }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => editor.registerCommand(KEY_ESCAPE_COMMAND, (event: KeyboardEvent) => onEscape(event), 2), [editor, onEscape]);

  return null;
};

const UnoTrick = () => <div un-left='2' un-top='1' un-right='0.2' un-text='gray-4 red-4 blue-4' un-pointer-events='none' un-border-l='solid zinc-2 15' un-justify='around' />;

const PlainTextEditor = ({ autoFocus, onEscape, onChange, editorRef, placeholder = 'Type a comment...', ...rest }: {
  autoFocus?: boolean;
  className?: string;
  editorRef?: { current: null | LexicalEditor; };
  onChange: (editorState: EditorState, editor: LexicalEditor) => void;
  onEscape: (e: KeyboardEvent) => boolean;
  placeholder?: string;
}) => {
  const initialConfig = {
    namespace: 'Commenting',
    nodes: [],
    onError: (error: Error) => { throw error; }
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div un-position='relative' un-m='1' >
        <PlainTextPlugin
          contentEditable={
            <ContentEditable un-outline='none' un-border='2 gray-2 solid rounded focus:blue-400' un-p='1' aria-placeholder={placeholder}
              placeholder={<div un-position='absolute' un-top='1' un-left='2' un-text='gray-400' un-pointer-events='none' >{placeholder}</div>}
              {...rest}
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={onChange} />
        <HistoryPlugin />
        {autoFocus !== false && <AutoFocusPlugin />}
        <EscapeHandlerPlugin onEscape={onEscape} />
        <ClearEditorPlugin />
        {editorRef !== undefined && <EditorRefPlugin editorRef={editorRef} />}
      </div>
    </LexicalComposer>
  );
};

const useOnChange = (setContent: (text: string) => void, setCanSubmit: (canSubmit: boolean) => void) => {
  return useCallback(
    (editorState: EditorState, _editor: LexicalEditor) => {
      editorState.read(() => {
        const root = $getRoot();
        setContent(root.getTextContent());
        setCanSubmit(!$isRootTextContentEmpty(_editor.isComposing(), true));
      });
    },
    [setCanSubmit, setContent],
  );
};

const CommentInputBox = ({ editor, cancelAddComment, submitAddComment }: {
  cancelAddComment: () => void;
  editor: LexicalEditor;
  submitAddComment: (
    commentOrThread: Comment | Thread,
    isInlineComment: boolean,
    thread?: Thread,
    selection?: RangeSelection | null,
  ) => void;
}) => {
  const [content, setContent] = useState('');
  const [canSubmit, setCanSubmit] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const selectionState = useMemo(
    () => ({
      container: document.createElement('div'),
      elements: [],
    }),
    [],
  );
  const selectionRef = useRef<RangeSelection | null>(null);
  const author = 'User';

  const updateLocation = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      selectionRef.current = selection.clone();
      const anchor = selection.anchor;
      const focus = selection.focus;
      const range = createDOMRange(editor, anchor.getNode(), anchor.offset, focus.getNode(), focus.offset);
      const boxElem = boxRef.current;
      if (range === null || boxElem === null) return;

      const { left, bottom, width } = range.getBoundingClientRect();
      const selectionRects = createRectsFromDOMRange(editor, range);
      let correctedLeft = selectionRects.length === 1 ? left + width / 2 - 125 : left - 125;
      if (correctedLeft < 10) {
        correctedLeft = 10;
      }
      boxElem.style.left = `${correctedLeft}px`;
      boxElem.style.top = `${bottom + 20 + (window.scrollY || document.documentElement.scrollTop)}px`;
      const selectionRectsLength = selectionRects.length;
      const { container } = selectionState;
      const elements: HTMLSpanElement[] = selectionState.elements;
      const elementsLength = elements.length;

      for (let i = 0; i < selectionRectsLength; i++) {
        const selectionRect = selectionRects[i];
        let elem: HTMLSpanElement = elements[i];
        if (elem === undefined) {
          elem = document.createElement('span');
          elements[i] = elem;
          container.appendChild(elem);
        }
        const color = '255, 212, 0';
        const style = `position:absolute;top:${selectionRect.top + (window.scrollY || document.documentElement.scrollTop)}px;left:${selectionRect.left}px;height:
        ${selectionRect.height}px;width:${selectionRect.width}px;background-color:rgba(${color}, 0.3);pointer-events:none;z-index:5;`;
        elem.style.cssText = style;
      }
      for (let i = elementsLength - 1; i >= selectionRectsLength; i--) {
        const elem = elements[i];
        container.removeChild(elem);
        elements.pop();
      }
    });
  }, [editor, selectionState]);

  useLayoutEffect(() => {
    updateLocation();
    const container = selectionState.container;
    const body = document.body;
    if (body !== null) {
      body.appendChild(container);
      return () => {
        body.removeChild(container);
      };
    }
  }, [selectionState.container, updateLocation]);

  useEffect(() => {
    window.addEventListener('resize', updateLocation);

    return () => window.removeEventListener('resize', updateLocation);
  }, [updateLocation]);

  const onEscape = (event: KeyboardEvent): boolean => {
    event.preventDefault();
    cancelAddComment();
    return true;
  };

  const submitComment = () => {
    if (!canSubmit) return;

    let quote = editor.getEditorState().read(() => {
      const selection = selectionRef.current;
      return selection ? selection.getTextContent() : '';
    });
    if (quote.length > 100) {
      quote = quote.slice(0, 99) + '…';
    }
    submitAddComment(createThread(quote, [createComment(content, author)]), true, undefined, selectionRef.current);
    selectionRef.current = null;
  };

  const onChange = useOnChange(setContent, setCanSubmit);

  return (
    <div un-position='absolute' un-bg='white' un-z='10' un-p='2' un-border='rounded' un-shadow='[0_0_5px_0_#ccc]'
      un-animate='ascend-from-bottom'
      className='[&:before]:([content:""] position-absolute border-8 border-t-white border-l-white border-b-transparent border-r-transparent border-solid rotate-45 left-[calc(50%-8px)] top--1.8 shadow-[-3px_-3px_3px_0_#eee])' ref={boxRef} >
      <PlainTextEditor onEscape={onEscape} onChange={onChange} un-min-w='80' un-min-h='25' />
      <div un-flex='~' un-justify='between' un-gap='2' un-mx='2'>
        <button un-bg='zinc-200 hover:zinc-300' un-px='2' un-py='1' un-border='rounded' un-flex='1'
          onClick={cancelAddComment}>
          Cancel
        </button>
        <button un-bg='hover:white disabled:zinc-100 blue-500' un-text='hover:blue-400 white disabled:gray-600' un-font='bold disabled:normal' un-px='2' un-py='1' un-border='rounded' un-cursor='disabled:not-allowed' un-flex='1'
          onClick={submitComment}
          disabled={!canSubmit}>
          Comment
        </button>
      </div>
    </div>
  );
};

const CommentsComposer = ({ submitAddComment, thread, placeholder }: {
  placeholder?: string;
  submitAddComment: (
    commentOrThread: Comment,
    isInlineComment: boolean,
    // eslint-disable-next-line no-shadow
    thread?: Thread,
  ) => void;
  thread?: Thread;
}) => {
  const [content, setContent] = useState('');
  const [canSubmit, setCanSubmit] = useState(false);
  const editorRef = useRef<LexicalEditor>(null);
  const author = 'User';

  const onChange = useOnChange(setContent, setCanSubmit);

  const submitComment = () => {
    if (canSubmit) {
      submitAddComment(createComment(content, author), false, thread);
      const editor = editorRef.current;
      if (editor !== null) {
        editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
      }
    }
  };

  return (
    <>
      <PlainTextEditor
        autoFocus={false}
        onEscape={() => true}
        onChange={onChange}
        editorRef={editorRef}
        placeholder={placeholder}
      />
      <button un-position='absolute' un-top='1' un-right='2' un-cursor={`${canSubmit ? 'pointer' : 'not-allowed'}`} un-text={`${canSubmit ? 'hover:blue-400' : ''} focus:blue-400`}
        un-outline='none'
        onClick={submitComment}
        disabled={!canSubmit}>
        <span className="i-bi:send" un-text='2xl' />
      </button>
    </>
  );
};

const CommentsPanelListComment = ({ comment, deleteComment, thread }: {
  comment: Comment;
  deleteComment: (
    commentOrThread: Comment | Thread,
    thread?: Thread,
  ) => void;
  thread?: Thread;
}) => {
  const { toggle: isDeletingComment, setToggle: setIsDeletingComment, containerRef } = useToggle();

  return (
    <li un-position='relative' un-cursor='pointer' className="[&>button>span]:opacity-0 [&:hover>button>span]:opacity-100" un-border={`${isDeletingComment && '2! solid red-4 rounded'}`} un-border-l={`${!isDeletingComment ? '4 solid zinc-4' : ''}`} un-ml='4' un-grid='~' >
      <div ref={containerRef} un-bg='zinc-1' un-border='rounded' un-h={`${isDeletingComment ? '14' : '0'}`} un-opacity={`${isDeletingComment ? '100' : '0'}`} un-transition='all' un-duration='500'
        un-pointer-events={`${!isDeletingComment && 'none'}`}>
        <h1 un-text='center' un-font='bold' un-my='1' >Delete Comment</h1>
        <div un-flex='~' un-mx='2' >
          <button un-flex='~ 1' un-justify='center' un-items='center' un-border='rounded' un-bg='hover:red-4' className='[&:hover>span]:text-white' un-py='1'
            onClick={() => {
              deleteComment(comment, thread);
              setIsDeletingComment(false);
            }} >
            <span className="i-bi:trash3" un-text='xl red-4' />
          </button>
          <button un-flex='~ 1' un-justify='center' un-items='center' un-border='rounded' un-bg='hover:blue-4' className='[&:hover>span]:text-white' un-py='1'
            onClick={() => setIsDeletingComment(false)} >
            <span className="i-material-symbols-light:close" un-text='xl blue-4' />
          </button>
        </div>
      </div>
      <div>
        <span un-font='bold' un-p='1'>{comment.author}</span>
        <span un-text='gray-4' > · {dayjs(comment.timeStamp).fromNow()}</span>
      </div>
      <p un-px='2' un-text={`${comment.deleted ? 'gray-4' : 'gray-7'}`}>
        {comment.content}
      </p>
      <button un-position='absolute' un-right='1' un-top='1' un-pointer-events={`${(comment.deleted || isDeletingComment) && 'none'}`} un-opacity={`${comment.deleted || isDeletingComment ? '0' : '100'}`}
        onClick={() => setIsDeletingComment(true)}>
        <span className="i-bi:trash3" un-text='hover:orange-6' />
      </button>
    </li>
  );
};

const ThreadOrComment = ({ commentOrThread, markNodeMap, isActive, deleteCommentOrThread, submitAddComment }: {
  commentOrThread: Comment | Thread;
  markNodeMap: Map<string, Set<NodeKey>>;
  isActive: boolean;
  deleteCommentOrThread: (
    commentOrThread: Comment | Thread,
    thread?: Thread,
  ) => void;
  submitAddComment: (
    commentOrThread: Comment | Thread,
    isInlineComment: boolean,
    thread?: Thread,
  ) => void;
}) => {
  const [editor] = useLexicalComposerContext();
  const { toggle: isDeletingThread, setToggle: setIsDeletingThread, containerRef } = useToggle();
  const id = commentOrThread.id;

  if (commentOrThread.type === 'thread') {
    const handleClickThread = () => {
      const markNodeKeys = markNodeMap.get(id);
      if (markNodeKeys !== undefined && !isActive) {
        const activeElement = document.activeElement;
        // Move selection to the start of the mark, so that we
        // update the UI with the selected thread.
        editor.update(
          () => {
            const markNodeKey = Array.from(markNodeKeys)[0];
            const markNode = $getNodeByKey<MarkNode>(markNodeKey);
            if ($isMarkNode(markNode)) {
              markNode.selectStart();
            }
          },
          {
            onUpdate() {
              // Restore selection to the previous element
              if (activeElement !== null) {
                (activeElement as HTMLElement).focus();
              }
            },
          },
        );
      }
    };

    return (
      <li un-bg={`${isActive ? 'zinc-100' : ''}`} un-border-l={`${isActive && !isDeletingThread ? 'solid zinc-200 15' : ''}`} un-border={`${isDeletingThread && '2 solid red-400 rounded'}`}
        key={id}
        onClick={handleClickThread}>
        <div ref={containerRef} un-bg='zinc-100' un-border='rounded' un-h={`${isDeletingThread ? '14' : '0'}`} un-opacity={`${isDeletingThread ? '100' : '0'}`} un-transition='all' un-duration='500'
          un-pointer-events={`${!isDeletingThread && 'none'}`} >
          <h1 un-text='center' un-font='bold' un-my='1' >Delete Thread?</h1>
          <div un-flex='~' un-mx='2' >
            <button un-flex='~ 1' un-justify='center' un-items='center' un-border='rounded' un-bg='hover:red-400' className='[&:hover>span]:text-white' un-py='1'
              onClick={() => deleteCommentOrThread(commentOrThread)} >
              <span className="i-bi:trash3" un-text='xl red-4' />
            </button>
            <button un-flex='~ 1' un-justify='center' un-items='center' un-border='rounded' un-bg='hover:blue-400' className='[&:hover>span]:text-white' un-py='1'
              onClick={() => setIsDeletingThread(false)} >
              <span className="i-material-symbols-light:close" un-text='xl blue-4' />
            </button>
          </div>
        </div>
        <div un-position='relative'
          className="[&>button>span]:opacity-0 [&:hover>button>span]:opacity-100">
          <blockquote un-p='2' un-cursor='pointer' >
            {'> '} <span un-bg='yellow-2' >{commentOrThread.quote}</span>
          </blockquote>
          <button un-position='absolute' un-right='1' un-top='1'
            un-pointer-events={`${isDeletingThread && 'none'}`} un-opacity={`${isDeletingThread ? '0' : '100'}`}
            onClick={() => setIsDeletingThread(true)}>
            <span className="i-bi:trash3" un-text='hover:orange-6' />
          </button>
          {/* {
            !isDeletingThread &&
          } */}
        </div>
        <ul className="[&>li:first-child]:(border-l-0 ml-2)">
          {commentOrThread.comments.map((comment) => (
            <CommentsPanelListComment
              key={comment.id}
              comment={comment}
              deleteComment={deleteCommentOrThread}
              thread={commentOrThread}
            />
          ))}
        </ul>
        <div un-position='relative'>
          <CommentsComposer
            submitAddComment={submitAddComment}
            thread={commentOrThread}
            placeholder="Reply to comment..."
          />
        </div>
      </li>
    );
  };

  return <CommentsPanelListComment
    key={id}
    comment={commentOrThread}
    deleteComment={deleteCommentOrThread}
  />;
};

const CommentsPanelList = ({ activeIDs, comments, deleteCommentOrThread, listRef, submitAddComment, markNodeMap }: {
  activeIDs: string[];
  comments: Comments;
  deleteCommentOrThread: (
    commentOrThread: Comment | Thread,
    thread?: Thread,
  ) => void;
  listRef: { current: null | HTMLUListElement; };
  markNodeMap: Map<string, Set<NodeKey>>;
  submitAddComment: (
    commentOrThread: Comment | Thread,
    isInlineComment: boolean,
    thread?: Thread,
  ) => void;
}) => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    // Used to keep the time stamp up to date
    const id = setTimeout(() => setCounter(counter + 1), 10000);

    return () => clearTimeout(id);
  }, [counter]);

  return (
    <ul ref={listRef}>
      {comments.map(item => <ThreadOrComment key={item.id} commentOrThread={item} markNodeMap={markNodeMap} deleteCommentOrThread={deleteCommentOrThread} submitAddComment={submitAddComment} isActive={activeIDs.includes(item.id)} />)}
    </ul >
  );
};

const CommentsPanel = ({ activeIDs, deleteCommentOrThread, comments, submitAddComment, markNodeMap }: {
  activeIDs: string[];
  comments: Comments;
  deleteCommentOrThread: (
    commentOrThread: Comment | Thread,
    thread?: Thread,
  ) => void;
  markNodeMap: Map<string, Set<NodeKey>>;
  submitAddComment: (
    commentOrThread: Comment | Thread,
    isInlineComment: boolean,
    thread?: Thread,
  ) => void;
}) => {
  const listRef = useRef<HTMLUListElement>(null);
  const isEmpty = comments.length === 0;

  return (
    <div>
      {isEmpty ? (
        <div un-text='center gray-4' un-p='2'>No Comments</div>
      ) : (
        <CommentsPanelList
          activeIDs={activeIDs}
          comments={comments}
          deleteCommentOrThread={deleteCommentOrThread}
          listRef={listRef}
          submitAddComment={submitAddComment}
          markNodeMap={markNodeMap}
        />
      )}
    </div>
  );
};

export const CommentPlugin = ({ ...rest }: {}) => {
  const [editor] = useLexicalComposerContext();
  const commentContext = useCommentContext();
  const markNodeMap = useMemo<Map<string, Set<NodeKey>>>(() => new Map(), []);
  const [activeAnchorKey, setActiveAnchorKey] = useState<NodeKey | null>();
  const [activeIDs, setActiveIDs] = useState<Array<string>>([]);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const cancelAddComment = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      // Restore selection
      if (selection !== null) {
        selection.dirty = true;
      }
    });
    setShowCommentInput(false);
  }, [editor]);

  const deleteCommentOrThread = useCallback(
    (comment: Comment | Thread, thread?: Thread) => {
      if (comment.type === 'comment') {
        const deletionInfo = commentContext.deleteCommentOrThread(comment, thread);
        if (!deletionInfo) return;

        const { markedComment, index } = deletionInfo;
        commentContext.addComment(markedComment, thread, index);
      } else {
        commentContext.deleteCommentOrThread(comment);
        // Remove ids from associated marks
        const id = thread !== undefined ? thread.id : comment.id;
        const markNodeKeys = markNodeMap.get(id);
        if (markNodeKeys !== undefined) {
          // Do async to avoid causing a React infinite loop
          setTimeout(() => {
            editor.update(() => {
              for (const key of markNodeKeys) {
                const node: null | MarkNode = $getNodeByKey(key);
                if ($isMarkNode(node)) {
                  node.deleteID(id);
                  if (node.getIDs().length === 0) {
                    $unwrapMarkNode(node);
                  }
                }
              }
            });
          });
        }
      }
    },
    [commentContext.addComment, commentContext.deleteCommentOrThread, editor, markNodeMap],
  );

  const submitAddComment = useCallback(
    (
      commentOrThread: Comment | Thread,
      isInlineComment: boolean,
      thread?: Thread,
      selection?: RangeSelection | null,
    ) => {
      commentContext.addComment(commentOrThread, thread);
      if (isInlineComment) {
        editor.update(() => {
          if ($isRangeSelection(selection)) {
            const isBackward = selection.isBackward();
            const id = commentOrThread.id;

            // Wrap content in a MarkNode
            $wrapSelectionInMarkNode(selection, isBackward, id);
          }
        });
        setShowCommentInput(false);
      }
    },
    [commentContext.addComment, editor],
  );

  useEffect(() => {
    const changedElems = activeIDs.map(id => markNodeMap.get(id))
      .filter(keys => keys !== undefined)
      .flatMap(keys => [...keys])
      .map(key => editor.getElementByKey(key))
      .filter(elem => elem !== null)
      .map(elem => {
        elem.classList.add('bg-yellow-300');
        setShowSidebar(true);
        return elem;
      });
    return () => changedElems.forEach(elem => elem.classList.remove('bg-yellow-300'));
  }, [activeIDs, editor, markNodeMap]);

  useEffect(() => {
    const markNodeKeysToIDs: Map<NodeKey, Array<string>> = new Map();

    return mergeRegister(
      registerNestedElementResolver<MarkNode>(
        editor,
        MarkNode,
        (from: MarkNode) => $createMarkNode(from.getIDs()),
        (from: MarkNode, to: MarkNode) => {
          // Merge the IDs
          from.getIDs().forEach((id) => to.addID(id));
        },
      ),
      editor.registerMutationListener(
        MarkNode,
        (mutations) => {
          editor.getEditorState().read(() => {
            for (const [key, mutation] of mutations) {
              const node: null | MarkNode = $getNodeByKey(key);
              let ids: NodeKey[] = [];

              if (mutation === 'destroyed') {
                ids = markNodeKeysToIDs.get(key) || [];
              } else if ($isMarkNode(node)) {
                ids = node.getIDs();
              }

              for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                let markNodeKeys = markNodeMap.get(id);
                markNodeKeysToIDs.set(key, ids);

                if (mutation === 'destroyed') {
                  if (markNodeKeys !== undefined) {
                    markNodeKeys.delete(key);
                    if (markNodeKeys.size === 0) {
                      markNodeMap.delete(id);
                    }
                  }
                } else {
                  if (markNodeKeys === undefined) {
                    markNodeKeys = new Set();
                    markNodeMap.set(id, markNodeKeys);
                  }
                  if (!markNodeKeys.has(key)) {
                    markNodeKeys.add(key);
                  }
                }
              }
            }
          });
        },
        { skipInitialization: false },
      ),
      editor.registerUpdateListener(({ editorState, tags }) => {
        editorState.read(() => {
          const selection = $getSelection();
          let hasActiveIds = false;
          let hasAnchorKey = false;

          if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();

            if ($isTextNode(anchorNode)) {
              const commentIDs = $getMarkIDs(anchorNode, selection.anchor.offset);
              if (commentIDs !== null) {
                setActiveIDs(commentIDs);
                hasActiveIds = true;
              }
              if (!selection.isCollapsed()) {
                setActiveAnchorKey(anchorNode.getKey());
                hasAnchorKey = true;
              }
            }
          }
          if (!hasActiveIds) {
            setActiveIDs((_activeIds) =>
              _activeIds.length === 0 ? _activeIds : [],
            );
          }
          if (!hasAnchorKey) {
            setActiveAnchorKey(null);
          }
          if (!tags.has('collaboration') && $isRangeSelection(selection)) {
            setShowCommentInput(false);
          }
        });
      }),
      editor.registerCommand(
        INSERT_INLINE_COMMAND,
        () => {
          const domSelection = getDOMSelection(editor._window);
          if (domSelection !== null) {
            domSelection.removeAllRanges();
          }
          setShowCommentInput(true);
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor, markNodeMap]);

  const onAddComment = () => editor.dispatchCommand(INSERT_INLINE_COMMAND, undefined);

  return (
    <>
      {
        showCommentInput && createPortal(
          <CommentInputBox
            editor={editor}
            cancelAddComment={cancelAddComment}
            submitAddComment={submitAddComment}
          />,
          document.body)
      }
      {
        activeAnchorKey
        && !showCommentInput
        && createPortal(
          <AddCommentBox
            anchorKey={activeAnchorKey}
            editor={editor}
            onAddComment={onAddComment}
          />,
          document.body)
      }
      {
        !showSidebar && <button un-position='absolute' un-right='0.2' un-top='1'
          un-border='2 rounded solid gray-300 hover:blue-400' un-z='10' un-flex='~'
          onClick={() => setShowSidebar(true)}
        >
          <Tooltip title='Expand Comments' >
            <span className="i-material-symbols-light:keyboard-double-arrow-left" un-text='xl hover:blue-6' />
          </Tooltip>
        </button>
      }
      <aside un-w={`${showSidebar ? '80' : '0'}`} un-transition='all' un-duration='500' {...rest} >
        {
          showSidebar && <>
            <Tooltip title='Hide Comments'>
              <h1 un-flex='~' un-items='center' un-justify='center' un-text='white' un-cursor='pointer' un-w='full'
                un-px='2' un-py='1' un-bg='blue-500 hover:gray-500'
                onClick={() => setShowSidebar(false)}>
                Comments <span className="i-material-symbols-light:keyboard-double-arrow-right" un-text='xl' />
              </h1>
            </Tooltip>
            <CommentsPanel
              comments={commentContext.comments}
              submitAddComment={submitAddComment}
              deleteCommentOrThread={deleteCommentOrThread}
              activeIDs={activeIDs}
              markNodeMap={markNodeMap}
            />
          </>
        }
      </aside>
    </>
  );
};
