import { $createHeadingNode } from '@lexical/rich-text';
import { $createTextNode, $getRoot } from 'lexical';

export const $generateContent = () => {
  const root = $getRoot();
  if (root.getFirstChild() !== null) return;

  const h1 = $createHeadingNode('h1');
  h1.append($createTextNode('Welcome to the playground'));
  root.append(h1);

  const h2 = $createHeadingNode('h2');
  h2.append($createTextNode('H2 Nodes here'));
  root.append(h2);

  const h3 = $createHeadingNode('h3');
  h3.append($createTextNode('H3 Nodes here'));
  root.append(h3);

  const h4 = $createHeadingNode('h4');
  h4.append($createTextNode('H4 Nodes here'));
  root.append(h4);

  const h5 = $createHeadingNode('h5');
  h5.append($createTextNode('H5 Nodes here'));
  root.append(h5);

  const h6 = $createHeadingNode('h6');
  h6.append($createTextNode('H6 Nodes here'));
  root.append(h6);

};