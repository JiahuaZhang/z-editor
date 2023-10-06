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
import { Element } from 'slate';

export { Prism };
export const CodeBlockType = 'code-block';
export const CodeLineType = 'code-line';

export const toChildren = (content: string) => [{ text: content }];
export const toCodeLines = (content: string): Element[] => content
  .split('\n')
  .map(line => ({ type: CodeLineType, children: toChildren(line) }));