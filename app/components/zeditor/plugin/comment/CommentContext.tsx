import { createContext, Dispatch, SetStateAction, useCallback, useContext, useState } from 'react';

export type Comment = {
  author: string;
  content: string;
  deleted: boolean;
  id: string;
  timeStamp: number;
  type: 'comment';
};

export type Thread = {
  comments: Array<Comment>;
  id: string;
  quote: string;
  type: 'thread';
};

export type Comments = (Thread | Comment)[];

const createUID = () => Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, 6);

export const createComment = (
  content: string,
  author: string,
  id?: string,
  timeStamp?: number,
  deleted?: boolean,
): Comment => ({
  author,
  content,
  deleted: deleted === undefined ? false : deleted,
  id: id === undefined ? createUID() : id,
  timeStamp: timeStamp === undefined ? performance.timeOrigin + performance.now() : timeStamp,
  type: 'comment',
});

export const createThread = (quote: string, comments: Comment[], id?: string,): Thread => ({
  comments,
  id: id === undefined ? createUID() : id,
  quote,
  type: 'thread',
});

const cloneThread = (thread: Thread): Thread => ({
  comments: Array.from(thread.comments),
  id: thread.id,
  quote: thread.quote,
  type: 'thread',
});

const markDeleted = (comment: Comment): Comment => ({
  author: comment.author,
  content: '[Deleted Comment]',
  deleted: true,
  id: comment.id,
  timeStamp: comment.timeStamp,
  type: 'comment',
});

type CommentState = {
  comments: Comments;
  setComments: Dispatch<SetStateAction<Comments>>;
  addComment: (commentOrThread: Comment | Thread, thread?: Thread, offset?: number) => void;
  deleteCommentOrThread: (commentOrThread: Comment | Thread, thread?: Thread) => { markedComment: Comment; index: number; } | null;
};

const Context = createContext<CommentState>({
  comments: [],
  setComments: () => {},
  addComment: () => {},
  deleteCommentOrThread: () => null,
});

export const CommentContext = ({ children }: { children: JSX.Element; }) => {
  const [comments, setComments] = useState<Comments>([]);

  const addComment = useCallback((commentOrThread: Comment | Thread, thread?: Thread, offset?: number) => {
    const nextComments = Array.from(comments);

    if (thread !== undefined && commentOrThread.type === 'comment') {
      for (let i = 0; i < nextComments.length; i++) {
        const comment = nextComments[i];
        if (comment.type === 'thread' && comment.id === thread.id) {
          const newThread = cloneThread(comment);
          nextComments.splice(i, 1, newThread);
          const insertOffset = offset !== undefined ? offset : newThread.comments.length;
          newThread.comments.splice(insertOffset, 0, commentOrThread);
          break;
        }
      }
    } else {
      const insertOffset = offset !== undefined ? offset : nextComments.length;
      nextComments.splice(insertOffset, 0, commentOrThread);
    }
    setComments(nextComments);
  }, [comments]);

  const deleteCommentOrThread = useCallback((commentOrThread: Comment | Thread, thread?: Thread): { markedComment: Comment; index: number; } | null => {
    const nextComments = Array.from(comments);
    let commentIndex: number | null = null;

    if (thread !== undefined) {
      for (let i = 0; i < nextComments.length; i++) {
        const nextComment = nextComments[i];
        if (nextComment.type === 'thread' && nextComment.id === thread.id) {
          const newThread = cloneThread(nextComment);
          nextComments.splice(i, 1, newThread);
          const threadComments = newThread.comments;
          commentIndex = threadComments.indexOf(commentOrThread as Comment);
          threadComments.splice(commentIndex, 1);
          break;
        }
      }
    } else {
      commentIndex = nextComments.indexOf(commentOrThread);
      nextComments.splice(commentIndex, 1);
    }
    setComments(nextComments);

    if (commentOrThread.type === 'comment') {
      return {
        index: commentIndex as number,
        markedComment: markDeleted(commentOrThread as Comment),
      };
    }
    return null;
  }, [comments]);


  return <Context.Provider value={{ comments, setComments, addComment, deleteCommentOrThread }}>{children}</Context.Provider>;
};

export const useCommentContext = () => useContext(Context);