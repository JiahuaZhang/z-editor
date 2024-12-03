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
import { atom, useAtom } from 'jotai';
import { $getNodeByKey, $getRoot, $getSelection, $isRangeSelection, $isTextNode, CLEAR_EDITOR_COMMAND, COMMAND_PRIORITY_EDITOR, createCommand, EditorState, KEY_ESCAPE_COMMAND, LexicalCommand, LexicalEditor, NodeKey, RangeSelection } from 'lexical';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { createDOMRange, createRectsFromDOMRange, getDOMSelection } from '../../util/utils';
import { CommentStore, createComment, createThread, Thread, useCommentStore, type Comment, type Comments } from './Comment';

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
    <div un-position='absolute' un-z='10' ref={boxRef}>
      <button un-bg='white hover:blue-5' un-py='2' un-px='1' un-border='rounded-full 2 solid zinc-4 hover:none' un-flex='~' un-text='hover:white'
        onClick={onAddComment}>
        <span className="i-material-symbols-light:comment-outline" un-text='3xl' />
      </button>
    </div>
  );
};

const EscapeHandlerPlugin = ({ onEscape, }: { onEscape: (e: KeyboardEvent) => boolean; }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => editor.registerCommand(KEY_ESCAPE_COMMAND, (event: KeyboardEvent) => onEscape(event), 2,), [editor, onEscape]);

  return null;
};

const UnoTrick = () => <div un-left='6' un-top='6' un-text='gray-4' />;

function PlainTextEditor({
  autoFocus,
  onEscape,
  onChange,
  editorRef,
  placeholder = 'Type a comment...',
}: {
  autoFocus?: boolean;
  className?: string;
  editorRef?: { current: null | LexicalEditor; };
  onChange: (editorState: EditorState, editor: LexicalEditor) => void;
  onEscape: (e: KeyboardEvent) => boolean;
  placeholder?: string;
}) {
  const initialConfig = {
    namespace: 'Commenting',
    nodes: [],
    onError: (error: Error) => { throw error; }
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div>
        <PlainTextPlugin
          contentEditable={
            <ContentEditable un-position='relative' un-min-w='80' un-min-h='25' un-m='2' un-z='5' un-p='2' aria-placeholder={placeholder}
              placeholder={<div un-position='absolute' un-top='6' un-left='6' un-text='gray-4' >{placeholder}</div>} />
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
}

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

      if ($isRangeSelection(selection)) {
        selectionRef.current = selection.clone();
        const anchor = selection.anchor;
        const focus = selection.focus;
        const range = createDOMRange(editor, anchor.getNode(), anchor.offset, focus.getNode(), focus.offset);
        const boxElem = boxRef.current;
        if (range !== null && boxElem !== null) {
          const { left, bottom, width } = range.getBoundingClientRect();
          const selectionRects = createRectsFromDOMRange(editor, range);
          let correctedLeft = selectionRects.length === 1 ? left + width / 2 - 125 : left - 125;
          if (correctedLeft < 10) {
            correctedLeft = 10;
          }
          boxElem.style.left = `${correctedLeft}px`;
          boxElem.style.top = `${bottom + 20 + (window.pageYOffset || document.documentElement.scrollTop)}px`;
          const selectionRectsLength = selectionRects.length;
          const { container } = selectionState;
          const elements: Array<HTMLSpanElement> = selectionState.elements;
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
            const style = `position:absolute;top:${selectionRect.top + (window.pageYOffset || document.documentElement.scrollTop)}px;left:${selectionRect.left}px;height:
            ${selectionRect.height}px;width:${selectionRect.width}px;background-color:rgba(${color}, 0.3);pointer-events:none;z-index:5;`;
            elem.style.cssText = style;
          }
          for (let i = elementsLength - 1; i >= selectionRectsLength; i--) {
            const elem = elements[i];
            container.removeChild(elem);
            elements.pop();
          }
        }
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

    return () => {
      window.removeEventListener('resize', updateLocation);
    };
  }, [updateLocation]);

  const onEscape = (event: KeyboardEvent): boolean => {
    event.preventDefault();
    cancelAddComment();
    return true;
  };

  const submitComment = () => {
    if (canSubmit) {
      let quote = editor.getEditorState().read(() => {
        const selection = selectionRef.current;
        return selection ? selection.getTextContent() : '';
      });
      if (quote.length > 100) {
        quote = quote.slice(0, 99) + '…';
      }
      submitAddComment(
        createThread(quote, [createComment(content, author)]),
        true,
        undefined,
        selectionRef.current,
      );
      selectionRef.current = null;
    }
  };

  const onChange = useOnChange(setContent, setCanSubmit);

  return (
    <div un-position='absolute' un-bg='white' un-z='10' un-p='2' un-border='rounded' un-shadow='[0_0_5px_0_#ccc]'
      un-animate='ascend-from-bottom'
      className='[&:before]:([content:""] position-absolute border-8 border-t-white border-l-white border-b-transparent border-r-transparent border-solid rotate-45 left-[calc(50%-8px)] top--1.8 shadow-[-3px_-3px_3px_0_#eee])' ref={boxRef} >
      <PlainTextEditor onEscape={onEscape} onChange={onChange} />
      <div un-flex='~' un-justify='between' un-gap='2' un-mx='2'>
        <button un-bg='zinc-2 hover:zinc-3' un-px='2' un-py='1' un-border='rounded' un-flex='1'
          onClick={cancelAddComment}>
          Cancel
        </button>
        <button un-bg='hover:white disabled:zinc-1 blue-5' un-text='hover:blue-4 white disabled:gray-6' un-font='bold disabled:normal' un-px='2' un-py='1' un-border='rounded' un-cursor='disabled:not-allowed' un-flex='1'
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
  const author = 'Playground User';

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
        className="CommentPlugin_CommentsPanel_Editor"
        autoFocus={false}
        onEscape={() => {
          return true;
        }}
        onChange={onChange}
        editorRef={editorRef}
        placeholder={placeholder}
      />
      <button
        className="CommentPlugin_CommentsPanel_SendButton"
        onClick={submitComment}
        disabled={!canSubmit}>
        <i className="send" />
      </button>
    </>
  );
};

const ShowDeleteCommentOrThreadDialog = ({ commentOrThread, deleteCommentOrThread, onClose, thread = undefined }: {
  commentOrThread: Comment | Thread;
  deleteCommentOrThread: (
    comment: Comment | Thread,
    // eslint-disable-next-line no-shadow
    thread?: Thread,
  ) => void;
  onClose: () => void;
  thread?: Thread;
}) => {
  return (
    <>
      Are you sure you want to delete this {commentOrThread.type}?
      <div className="Modal__content">
        <button
          onClick={() => {
            deleteCommentOrThread(commentOrThread, thread);
            onClose();
          }}>
          Delete
        </button>{' '}
        <button
          onClick={() => {
            onClose();
          }}>
          Cancel
        </button>
      </div>
    </>
  );
};

const CommentsPanelListComment = ({ comment, deleteComment, thread }: {
  comment: Comment;
  deleteComment: (
    commentOrThread: Comment | Thread,
    // eslint-disable-next-line no-shadow
    thread?: Thread,
  ) => void;
  thread?: Thread;
}) => {
  // const [modal, showModal] = useModal();

  return (
    <li un-position='relative' un-cursor='pointer' className="CommentPlugin_CommentsPanel_List_Comment [&>button>span]:opacity-0 [&:hover>button>span]:opacity-100">
      <div className="CommentPlugin_CommentsPanel_List_Details">
        <span un-font='bold' un-p='1'>{comment.author}</span>
        <span className="CommentPlugin_CommentsPanel_List_Comment_Time"> · {dayjs(comment.timeStamp).fromNow()}</span>
      </div>
      <p un-px='2' un-text={`${comment.deleted ? 'gray-4' : 'gray-7'}`}>
        {comment.content}
      </p>
      {!comment.deleted && (
        <>
          <button un-position='absolute' un-right='1' un-top='1'
            onClick={() => {
              // showModal('Delete Comment', (onClose) => (
              //   <ShowDeleteCommentOrThreadDialog
              //     commentOrThread={comment}
              //     deleteCommentOrThread={deleteComment}
              //     thread={thread}
              //     onClose={onClose}
              //   />
              // ));
            }}
            className="CommentPlugin_CommentsPanel_List_DeleteButton">
            <span className="i-bi:trash3" un-text='hover:orange-6' />
          </button>
          {/* {modal} */}
        </>
      )}
    </li>
  );
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
  const [editor] = useLexicalComposerContext();
  const [counter, setCounter] = useState(0);
  // const [modal, showModal] = useModal();

  useEffect(() => {
    // Used to keep the time stamp up to date
    const id = setTimeout(() => {
      setCounter(counter + 1);
    }, 10000);

    return () => {
      clearTimeout(id);
    };
  }, [counter]);

  return (
    <ul className="CommentPlugin_CommentsPanel_List" ref={listRef}>
      {comments.map((commentOrThread) => {
        const id = commentOrThread.id;
        if (commentOrThread.type === 'thread') {
          const handleClickThread = () => {
            const markNodeKeys = markNodeMap.get(id);
            if (
              markNodeKeys !== undefined &&
              (activeIDs === null || activeIDs.indexOf(id) === -1)
            ) {
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
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
            <li
              key={id}
              onClick={handleClickThread}
              className={`CommentPlugin_CommentsPanel_List_Thread ${markNodeMap.has(id) ? 'interactive' : ''
                } ${activeIDs.indexOf(id) === -1 ? '' : 'active'}`}>
              <div un-position='relative'
                className="CommentPlugin_CommentsPanel_List_Thread_QuoteBox [&>button>span]:opacity-0 [&:hover>button>span]:opacity-100">
                <blockquote un-p='2' un-cursor='pointer' className="CommentPlugin_CommentsPanel_List_Thread_Quote">
                  {'> '} <span un-bg='yellow-2' >{commentOrThread.quote}</span>
                </blockquote>
                {/* INTRODUCE DELETE THREAD HERE*/}
                <button un-position='absolute' un-right='1' un-top='1'
                  // onClick={() => {
                  //   showModal('Delete Thread', (onClose) => (
                  //     <ShowDeleteCommentOrThreadDialog
                  //       commentOrThread={commentOrThread}
                  //       deleteCommentOrThread={deleteCommentOrThread}
                  //       onClose={onClose}
                  //     />
                  //   ));
                  // }}
                  className="CommentPlugin_CommentsPanel_List_DeleteButton">
                  <span className="i-bi:trash3" un-text='hover:orange-6' />
                </button>
                {/* {modal} */}
              </div>
              <ul className="CommentPlugin_CommentsPanel_List_Thread_Comments">
                {commentOrThread.comments.map((comment) => (
                  <CommentsPanelListComment
                    key={comment.id}
                    comment={comment}
                    deleteComment={deleteCommentOrThread}
                    thread={commentOrThread}
                  />
                ))}
              </ul>
              <div className="CommentPlugin_CommentsPanel_List_Thread_Editor">
                <CommentsComposer
                  submitAddComment={submitAddComment}
                  thread={commentOrThread}
                  placeholder="Reply to comment..."
                />
              </div>
            </li>
          );
        }
        return (
          <CommentsPanelListComment
            key={id}
            comment={commentOrThread}
            deleteComment={deleteCommentOrThread}
          />
        );
      })}
    </ul>
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
    <div className="CommentPlugin_CommentsPanel">
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

const showCommentSidebarAtom = atom(true);

export const CommentPlugin = ({ ...rest }: {}) => {
  const [editor] = useLexicalComposerContext();
  const commentStore = useMemo(() => new CommentStore(editor), [editor]);
  const comments = useCommentStore(commentStore);
  const markNodeMap = useMemo<Map<string, Set<NodeKey>>>(() => {
    return new Map();
  }, []);
  const [activeAnchorKey, setActiveAnchorKey] = useState<NodeKey | null>();
  const [activeIDs, setActiveIDs] = useState<Array<string>>([]);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showSidebar, setShowSidebar] = useAtom(showCommentSidebarAtom);

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
        const deletionInfo = commentStore.deleteCommentOrThread(
          comment,
          thread,
        );
        if (!deletionInfo) {
          return;
        }
        const { markedComment, index } = deletionInfo;
        commentStore.addComment(markedComment, thread, index);
      } else {
        commentStore.deleteCommentOrThread(comment);
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
    [commentStore, editor, markNodeMap],
  );

  const submitAddComment = useCallback(
    (
      commentOrThread: Comment | Thread,
      isInlineComment: boolean,
      thread?: Thread,
      selection?: RangeSelection | null,
    ) => {
      commentStore.addComment(commentOrThread, thread);
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
    [commentStore, editor],
  );

  useEffect(() => {
    const changedElems: Array<HTMLElement> = [];
    for (let i = 0; i < activeIDs.length; i++) {
      const id = activeIDs[i];
      const keys = markNodeMap.get(id);
      if (keys !== undefined) {
        for (const key of keys) {
          const elem = editor.getElementByKey(key);
          if (elem !== null) {
            elem.classList.add('selected');
            changedElems.push(elem);
            setShowComments(true);
          }
        }
      }
    }
    return () => {
      for (let i = 0; i < changedElems.length; i++) {
        const changedElem = changedElems[i];
        changedElem.classList.remove('selected');
      }
    };
  }, [activeIDs, editor, markNodeMap]);

  useEffect(() => {
    const markNodeKeysToIDs: Map<NodeKey, Array<string>> = new Map();

    return mergeRegister(
      registerNestedElementResolver<MarkNode>(
        editor,
        MarkNode,
        (from: MarkNode) => {
          return $createMarkNode(from.getIDs());
        },
        (from: MarkNode, to: MarkNode) => {
          // Merge the IDs
          const ids = from.getIDs();
          ids.forEach((id) => {
            to.addID(id);
          });
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
              const commentIDs = $getMarkIDs(
                anchorNode,
                selection.anchor.offset,
              );
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

  const onAddComment = () => {
    editor.dispatchCommand(INSERT_INLINE_COMMAND, undefined);
  };

  return (
    <>
      {showCommentInput
        && createPortal(
          <CommentInputBox
            editor={editor}
            cancelAddComment={cancelAddComment}
            submitAddComment={submitAddComment}
          />,
          document.body,
        )}
      {activeAnchorKey
        && !showCommentInput
        && createPortal(
          <AddCommentBox
            anchorKey={activeAnchorKey}
            editor={editor}
            onAddComment={onAddComment}
          />,
          document.body,
        )}
      {
        !showSidebar && <button un-position='absolute' un-right='0.2' un-top='1'
          un-border='2 rounded solid gray-3 hover:blue-4' un-z='10' un-flex='~'
          onClick={() => setShowSidebar(true)}
        >
          <Tooltip title='Expand Comments' >
            <span className="i-material-symbols-light:keyboard-double-arrow-left" un-text='xl hover:blue-6' />
          </Tooltip>
        </button>
      }
      {/* {createPortal(
        <button
          className={`CommentPlugin_ShowCommentsButton ${showComments ? 'active' : ''}`}
          onClick={() => setShowComments(!showComments)}
          title={showComments ? 'Hide Comments' : 'Show Comments'}>
          <i className="comments" /> show/hide comment
        </button>,
        document.body,
      )} */}
      <aside un-w={`${showSidebar ? '80' : '0'}`} un-transition='all' un-duration='500' un-flex='1' {...rest} >
        {
          showSidebar && <>
            <h1 un-flex='~' un-items='center' un-text='white' un-cursor='pointer' un-w='full'
              un-px='2' un-py='1' un-bg='blue-5 hover:gray-5'
              onClick={() => setShowSidebar(false)}
            >Comments <span className="i-material-symbols-light:keyboard-double-arrow-right" un-text='xl' /></h1>
            <CommentsPanel
              comments={comments}
              submitAddComment={submitAddComment}
              deleteCommentOrThread={deleteCommentOrThread}
              activeIDs={activeIDs}
              markNodeMap={markNodeMap}
            />
          </>
        }
      </aside>
      {/* {showComments &&
        createPortal(
          <CommentsPanel
            comments={comments}
            submitAddComment={submitAddComment}
            deleteCommentOrThread={deleteCommentOrThread}
            activeIDs={activeIDs}
            markNodeMap={markNodeMap}
          />,
          document.body,
        )} */}
    </>
  );
};
