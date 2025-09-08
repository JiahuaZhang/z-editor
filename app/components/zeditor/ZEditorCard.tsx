import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { HashtagNode } from '@lexical/hashtag';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { MarkNode } from '@lexical/mark';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { $getRoot, createEditor } from 'lexical';
import { Link } from 'react-router';
import { Tables } from '~/util/supabase.type';
import { CollapsibleContainerNode } from './plugin/collapsible/CollapsibleContainerNode';
import { CollapsibleContentNode } from './plugin/collapsible/CollapsibleContentNode';
import { CollapsibleTitleNode } from './plugin/collapsible/CollapsibleTitleNode';
import { EmojiNode } from './plugin/emoji/EmojiNode';
import { EquationNode } from './plugin/equation/EuqationNode';
import { ExcalidrawNode } from './plugin/excalidraw/ExcalidrawNode';
import { HorizontalRuleNode } from './plugin/horizontal-rule/HorizontalRuleNode';
import { ImageNode } from './plugin/image/ImageNode';
import { InlineImageNode } from './plugin/inline-image/InlineImageNode';
import { LayoutContainerNode } from './plugin/layout/LayoutContainerNode';
import { LayoutItemNode } from './plugin/layout/LayoutItemNode';
import { PageBreakNode } from './plugin/page-break/PageBreakNode';
import { SpecialTextNode } from './plugin/special/SpecialTextNode';
import { StickyNode } from './plugin/sticky-note/StickNote';
import { TimeNode } from './plugin/time/TimeNode';
import { TweetNode } from './plugin/twitter/TweetNode';
import { YouTubeNode } from './plugin/youtube/YouTubeNode';

dayjs.extend(relativeTime);

type Document = Tables<'editor_documents'>;

const editorStatePreview = (document: Document, limit: number = 600) => {
  const editor = createEditor({
    nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode, CodeNode, CodeHighlightNode, TableNode, TableRowNode, TableCellNode, HashtagNode, LinkNode, AutoLinkNode, StickyNode, ImageNode, InlineImageNode, EmojiNode, ExcalidrawNode, EquationNode, HorizontalRuleNode, TweetNode, YouTubeNode, MarkNode, CollapsibleContainerNode, CollapsibleTitleNode, CollapsibleContentNode, PageBreakNode, LayoutContainerNode, LayoutItemNode, SpecialTextNode, TimeNode],
  });

  const editorState = editor.parseEditorState(document.content as any);
  let preview = 'Content preview unavailable';
  editorState.read(() => {
    preview = $getRoot().getTextContent().replace(/\n+/g, '\n');
  });

  return preview.length > limit ? preview.substring(0, limit) + ' ...' : preview;
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return 'Unknown';

  const date = dayjs(dateStr);
  if (!date.isValid()) return 'Unknown';

  const now = dayjs();
  if (date.isSame(now, 'day')) {
    return 'Today';
  } else if (now.diff(date, 'day') === 1) {
    return 'Yesterday';
  } else if (now.diff(date, 'day') <= 7) {
    return `${now.diff(date, 'day')} days ago`;
  } else {
    return date.format('MMM D, YYYY');
  }
};

export const ZEditorCard = ({ document, addTag, selectedTags }: { document: Document; addTag: (tag: string) => void; selectedTags: string[]; }) => {
  const preview = editorStatePreview(document);

  return <div un-p="2" un-grid='~' un-gap='2' un-border='blue-200 hover:blue-400 rounded solid 2' un-shadow="hover:xl">
    <Link to={`/z-editor/${document.id}`} >
      <pre un-h='60' un-max-w="xl" un-overflow-y="auto" un-overflow-x='hidden' un-font='sans' un-text='wrap' >
        {preview}
      </pre>
    </Link>
    {
      document.tag && document.tag.length > 0
      && <div un-flex="~" un-overflow-x="auto" un-whitespace="nowrap" un-gap="2" un-pb='0.5' >
        {document.tag.map((tag, index) => (
          <span key={index} un-bg="blue-100" un-text="blue-800 sm" un-px="1.5" un-py="1" un-rounded="xl" un-cursor={selectedTags.includes(tag) ? 'not-allowed' : 'pointer'}
            onClick={() => addTag(tag)}
          >
            {tag}
          </span>
        ))}
      </div>
    }
    <div un-flex="~" un-justify="between">
      <div>
        Created: {formatDate(document.created)}
      </div>
      <div>
        Updated: {formatDate(document.updated)}
      </div>
    </div>
  </div>;
};