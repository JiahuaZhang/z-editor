import { LinksFunction } from '@remix-run/react/dist/routeModules';
import Prism from 'prismjs';
import 'prismjs/components/prism-java.js';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-jsx.js';
import 'prismjs/components/prism-markdown.js';
import 'prismjs/components/prism-php.js';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-sql.js';
import 'prismjs/components/prism-tsx.js';
import 'prismjs/components/prism-typescript.js';
import { Descendant, Editor, Element, Node, NodeEntry, Path, Range, Transforms } from 'slate';
import { ReactEditor, RenderElementProps, RenderLeafProps, useSlate, useSlateStatic } from 'slate-react';
import prismCSS from './code.prism.css';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: prismCSS }];
export { Prism };
export const CodeBlockType = 'code-block';
export const CodeLineType = 'code-line';

const codeLanguages = [
  ['css', 'CSS',],
  ['html', 'HTML',],
  ['java', 'Java',],
  ['javascript', 'JavaScript',],
  ['jsx', 'JSX',],
  ['markdown', 'Markdown',],
  ['php', 'PHP',],
  ['python', 'Python',],
  ['sql', 'SQL',],
  ['tsx', 'TSX',],
  ['typescript', 'TypeScript',],
];

const SupportedCodeLanguage = codeLanguages.map(([lang]) => lang);

export const CodeBlock = ({ children, element, attributes }: RenderElementProps) => {
  const { language } = element as any;
  const editor = useSlateStatic();

  return <div
    un-font='mono leading-5'
    un-text='base'
    un-mt='0'
    un-py='1.5'
    un-px='3'
    un-position='relative'
    un-bg='gray-100'
    un-border='2 zinc-200 rounded'
    spellCheck={false}
    {...attributes}
  >
    <select
      contentEditable={false}
      un-position='absolute'
      un-right='1.5'
      un-top='1.5'
      un-z='10'
      value={language}
      onChange={event => {
        const path = ReactEditor.findPath(editor, element);
        Transforms.setNodes(editor, { language: event.target.value } as any, { at: path });
      }}
    >
      {codeLanguages.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
    </select>
    {children}
  </div>;
};

export const CodeLeaf = ({ children, leaf: { text, ...rest }, attributes }: RenderLeafProps) => {
  return <span {...attributes} className={Object.keys(rest).join(' ')} >
    {children}
  </span>;
};

export const toChildren = (content: string) => [{ text: content }];
export const toCodeLines = (content: string): Element[] => content
  .split('\n')
  .map(line => ({ type: CodeLineType, children: toChildren(line) }));

export const insertText = (text: string) => {
  if (text === '```') {
    return { type: CodeBlockType, language: 'typescript' } as Partial<Node>;
  } else if (text.startsWith('```')) {
    const language = text.replace('```', '');
    if (SupportedCodeLanguage.includes(language)) {
      return { type: CodeBlockType, language } as Partial<Node>;
    }
  }

  return false;
};

export const insertBreak = (editor: Editor) => {
  const ancestor = editor.above();
  if (!ancestor) return false;

  const [block] = ancestor;
  if (!('type' in block)) return false;
  if (block.type !== CodeLineType) return false;

  const { selection } = editor;
  if (!selection || !Range.isCollapsed(selection)) return false;

  const text = Node.string(block);
  if (selection.anchor.offset !== text.length) return false;

  const [_, linePath] = editor.parent(selection);
  const [parentNode, parentPath] = editor.parent(linePath);
  if (linePath[linePath.length - 1] !== parentNode.children.length - 1) return false;

  const pathAfterBlock = Path.next(parentPath);
  Transforms.insertNodes(
    editor,
    { type: 'paragraph', children: [{ text: '' }] } as Node,
    { at: pathAfterBlock }
  );

  const newFocus = [...pathAfterBlock, 0];
  Transforms.select(editor, newFocus);
  return true;
};

export const useDecorate = (editor: Editor) => {
  const fn = ([node, _]: any) => {
    if (Element.isElement(node) && node.type === CodeLineType) {
      return (editor as any)?.nodeToDecorations?.get(node) || [];
    }
    return [];
  };

  // return useCallback(fn, [(editor as any).nodeToDecorations]);
  return fn;
};

export const CodePlugin = () => {
  const editor = useSlate();

  const blockEntries = Array.from(
    Editor.nodes<CodeBlockElement>(editor, {
      at: [],
      mode: 'highest',
      match: n => Element.isElement(n) && n.type === CodeBlockType,
    })
  );

  const nodeToDecorations = mergeMaps(...blockEntries.map(getChildNodeToDecorations));

  (editor as any).nodeToDecorations = nodeToDecorations;
  return null;
};

const mergeMaps = <K, V>(...maps: Map<K, V>[]) => {
  const map = new Map<K, V>();

  for (const m of maps) {
    for (const item of m) {
      map.set(...item);
    }
  }

  return map;
};

type CodeBlockElement = {
  type: 'code-block';
  language: string;
  children: Descendant[];
} & Node;

const getChildNodeToDecorations = ([block, blockPath]: NodeEntry<CodeBlockElement>) => {
  const nodeToDecorations = new Map<Element, Range[]>();

  const text = block.children.map(line => Node.string(line)).join('\n');
  const language = block.language ?? 'typescript';
  const tokens = Prism.tokenize(text, Prism.languages[language]);

  const normalizedTokens = normalizeTokens(tokens); // make tokens flat and grouped by line

  const blockChildren = block.children as Element[];

  for (let index = 0; index < normalizedTokens.length; index++) {
    const tokens = normalizedTokens[index];
    const element = blockChildren[index];

    if (!nodeToDecorations.has(element)) {
      nodeToDecorations.set(element, []);
    }

    let start = 0;
    for (const token of tokens) {
      const length = token.content.length;
      if (!length) {
        continue;
      }

      const end = start + length;

      const path = [...blockPath, index, 0];
      const range = {
        anchor: { path, offset: start },
        focus: { path, offset: end },
        token: true,
        ...Object.fromEntries(token.types.map(type => [type, true])),
      };

      nodeToDecorations.get(element)!.push(range);

      start = end;
    }
  }

  return nodeToDecorations;
};

type PrismToken = Prism.Token;
type Token = {
  types: string[];
  content: string;
  empty?: boolean;
};

const newlineRe = /\r\n|\r|\n/;

const normalizeEmptyLines = (line: Token[]) => {
  if (line.length === 0) {
    line.push({
      types: ['plain'],
      content: '\n',
      empty: true,
    });
  } else if (line.length === 1 && line[0].content === '') {
    line[0].content = '\n';
    line[0].empty = true;
  }
};

const appendTypes = (types: string[], add: string[] | string): string[] => {
  const typesSize = types.length;
  if (typesSize > 0 && types[typesSize - 1] === add) {
    return types;
  }

  return types.concat(add);
};

export const normalizeTokens = (tokens: (PrismToken | string)[]): Token[][] => {
  const typeArrStack: string[][] = [[]];
  const tokenArrStack = [tokens];
  const tokenArrIndexStack = [0];
  const tokenArrSizeStack = [tokens.length];

  let i = 0;
  let stackIndex = 0;
  let currentLine: Token[] = [];

  const acc = [currentLine];

  while (stackIndex > -1) {
    while (
      (i = tokenArrIndexStack[stackIndex]++) < tokenArrSizeStack[stackIndex]
    ) {
      let content;
      let types = typeArrStack[stackIndex];

      const tokenArr = tokenArrStack[stackIndex];
      const token = tokenArr[i];

      // Determine content and append type to types if necessary
      if (typeof token === 'string') {
        types = stackIndex > 0 ? types : ['plain'];
        content = token;
      } else {
        types = appendTypes(types, token.type);
        if (token.alias) {
          types = appendTypes(types, token.alias);
        }

        content = token.content;
      }

      // If token.content is an array, increase the stack depth and repeat this while-loop
      if (typeof content !== 'string') {
        stackIndex++;
        typeArrStack.push(types);
        tokenArrStack.push(content as any);
        tokenArrIndexStack.push(0);
        tokenArrSizeStack.push(content.length);
        continue;
      }

      // Split by newlines
      const splitByNewlines = content.split(newlineRe);
      const newlineCount = splitByNewlines.length;

      currentLine.push({ types, content: splitByNewlines[0] });

      // Create a new line for each string on a new line
      for (let i = 1; i < newlineCount; i++) {
        normalizeEmptyLines(currentLine);
        acc.push((currentLine = []));
        currentLine.push({ types, content: splitByNewlines[i] });
      }
    }

    // Decreate the stack depth
    stackIndex--;
    typeArrStack.pop();
    tokenArrStack.pop();
    tokenArrIndexStack.pop();
    tokenArrSizeStack.pop();
  }

  normalizeEmptyLines(currentLine);
  return acc;
};

export const dummyData = [
  {
    type: CodeBlockType,
    language: 'jsx',
    children: toCodeLines(`// Add the initial value.
    const initialValue = [
      {
        type: 'paragraph',
        children: [{ text: 'A line of text in a paragraph.' }]
      }
    ]

    const App = () => {
      const [editor] = useState(() => withReact(createEditor()))

      return (
        <Slate editor={editor} initialValue={initialValue}>
          <Editable />
        </Slate>
      )
    }`),
  },
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
  {
    type: CodeBlockType,
    language: 'typescript',
    children: toCodeLines(`// TypeScript users only add this code
    import { BaseEditor, Descendant } from 'slate'
    import { ReactEditor } from 'slate-react'

    type CustomElement = { type: 'paragraph'; children: CustomText[] }
    type CustomText = { text: string }

    declare module 'slate' {
      interface CustomTypes {
        Editor: BaseEditor & ReactEditor
        Element: CustomElement
        Text: CustomText
      }
    }`),
  },
];