import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents';
import { DecoratorBlockNode, SerializedDecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { DOMConversionMap, DOMConversionOutput, DOMExportOutput, EditorConfig, ElementFormatType, LexicalEditor, LexicalNode, NodeKey, Spread } from 'lexical';

type YouTubeComponentProps = Readonly<{
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  videoID: string;
}>;

const YouTubeComponent = ({ format, nodeKey, videoID }: YouTubeComponentProps) => {
  const [isSelected] = useLexicalNodeSelection(nodeKey);

  return (
    <BlockWithAlignableContents
      className={{
        base: '',
        focus: ''
      }}
      format={format}
      nodeKey={nodeKey}>
      <div un-w='full' un-max-w='1280px' un-p-b='39.54%' un-position='relative' un-mx='auto'
        un-border={`${isSelected ? '2 rounded blue-500' : '2 transparent'}`}
      >
        <iframe un-position='absolute' un-top='0' un-left='0' un-w='full' un-h='full'
          src={`https://www.youtube-nocookie.com/embed/${videoID}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={true}
          title="YouTube video"
        />
      </div>
    </BlockWithAlignableContents>
  );
};

export type SerializedYouTubeNode = Spread<{ videoID: string; }, SerializedDecoratorBlockNode>;

const $convertYoutubeElement = (domNode: HTMLElement): null | DOMConversionOutput => {
  const videoID = domNode.getAttribute('data-lexical-youtube');
  if (videoID) {
    const node = $createYouTubeNode(videoID);
    return { node };
  }
  return null;
};

export class YouTubeNode extends DecoratorBlockNode {
  __id: string;

  static getType(): string {
    return 'youtube';
  }

  static clone(node: YouTubeNode): YouTubeNode {
    return new YouTubeNode(node.__id, node.__format, node.__key);
  }

  static importJSON(serializedNode: SerializedYouTubeNode): YouTubeNode {
    const node = $createYouTubeNode(serializedNode.videoID);
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON(): SerializedYouTubeNode {
    return {
      ...super.exportJSON(),
      type: 'youtube',
      version: 1,
      videoID: this.__id,
    };
  }

  constructor(id: string, format?: ElementFormatType, key?: NodeKey) {
    super(format, key);
    this.__id = id;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('iframe');
    element.setAttribute('data-lexical-youtube', this.__id);
    element.setAttribute('width', '560');
    element.setAttribute('height', '315');
    element.setAttribute('src', `https://www.youtube-nocookie.com/embed/${this.__id}`);
    element.setAttribute('frameborder', '0');
    element.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    element.setAttribute('allowfullscreen', 'true');
    element.setAttribute('title', 'YouTube video');
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      iframe: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-youtube')) {
          return null;
        }
        return {
          conversion: $convertYoutubeElement,
          priority: 1,
        };
      },
    };
  }

  updateDOM(): false {
    return false;
  }

  getId(): string {
    return this.__id;
  }

  getTextContent(_includeInert?: boolean | undefined, _includeDirectionless?: false | undefined): string {
    return `https://www.youtube.com/watch?v=${this.__id}`;
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    return (
      <YouTubeComponent
        format={this.__format}
        nodeKey={this.getKey()}
        videoID={this.__id}
      />
    );
  }
}

export const $createYouTubeNode = (videoID: string) => new YouTubeNode(videoID);

export const $isYouTubeNode = (node: YouTubeNode | LexicalNode | null | undefined): node is YouTubeNode => node instanceof YouTubeNode;