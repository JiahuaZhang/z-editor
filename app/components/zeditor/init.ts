import { $createListItemNode, $createListNode } from '@lexical/list';
import { $createHeadingNode } from '@lexical/rich-text';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';

const $generateListContent = () => {
  const root = $getRoot();

  const bulletList = $createListNode('bullet');
  for (const number of [1, 2, 3]) {
    const listItem = $createListItemNode(false);
    listItem.append($createTextNode(`bullet list item ${number}`));
    bulletList.append(listItem);
  }
  root.append(bulletList);

  const numberList = $createListNode('number');
  for (const number of [1, 2, 3]) {
    const listItem = $createListItemNode(false);
    listItem.append($createTextNode(`number list list item ${number}`));
    numberList.append(listItem);
  }
  root.append(numberList);

  const checkList = $createListNode('check');
  for (const number of [1, 2, 3]) {
    const listItem = $createListItemNode(number % 2 === 0);
    listItem.append($createTextNode(`check-list list item ${number}`));
    checkList.append(listItem);
  }
  root.append(checkList);

  const indentList = $createListNode('bullet');
  const indentItem1 = $createListItemNode();
  const indentItem2 = $createListItemNode();
  const indent2List = $createListNode('bullet');
  const indent2Item1 = $createListItemNode();
  const indent2Item2 = $createListItemNode();
  const indent3List = $createListNode('bullet');
  const indent3Item1 = $createListItemNode();
  const indent3Item2 = $createListItemNode();

  indent3Item2.append($createTextNode('indent 3 item 2'));
  indent3Item1.append($createTextNode('indent 3 item 1'));
  indent3List.append(indent3Item1);
  indent3List.append(indent3Item2);

  indent2Item2.append(indent3List);
  indent2Item1.append($createTextNode('indent 2 item 1'));
  indent2List.append(indent2Item1);
  indent2List.append(indent2Item2);

  indentItem2.append(indent2List);
  indentItem1.append($createTextNode('indent 1 item 1'));
  indentList.append(indentItem1);
  indentList.append(indentItem2);

  root.append(indentList);

  const numberIndentList = $createListNode('number');
  const numberIndentItem1 = $createListItemNode();
  const numberIndentItem2 = $createListItemNode();
  const numberIndent2List = $createListNode('number');
  const numberIndent2Item1 = $createListItemNode();
  const numberIndent2Item2 = $createListItemNode();
  const numberIndent3List = $createListNode('number');
  const numberIndent3Item1 = $createListItemNode();
  const numberIndent3Item2 = $createListItemNode();

  numberIndent3Item2.append($createTextNode('number indent 3 item 2'));
  numberIndent3Item1.append($createTextNode('number indent 3 item 1'));
  numberIndent3List.append(numberIndent3Item1);
  numberIndent3List.append(numberIndent3Item2);

  numberIndent2Item2.append(numberIndent3List);
  numberIndent2Item1.append($createTextNode('number indent 2 item 1'));
  numberIndent2List.append(numberIndent2Item1);
  numberIndent2List.append(numberIndent2Item2);

  numberIndentItem2.append(numberIndent2List);
  numberIndentItem1.append($createTextNode('number indent 1 item 1'));
  numberIndentList.append(numberIndentItem1);
  numberIndentList.append(numberIndentItem2);

  root.append(numberIndentList);

  const hybridIndentList = $createListNode('bullet');
  const hybridIndentItem1 = $createListItemNode();
  const hybridIndentItem2 = $createListItemNode();
  const hybridIndent2List = $createListNode('number');
  const hybridIndent2Item1 = $createListItemNode();
  const hybridIndent2Item2 = $createListItemNode();
  const hybridIndent3List = $createListNode('bullet');
  const hybridIndent3Item1 = $createListItemNode();
  const hybridIndent3Item2 = $createListItemNode();

  hybridIndent3Item2.append($createTextNode('hybrid indent 3 item 2'));
  hybridIndent3Item1.append($createTextNode('hybrid indent 3 item 1'));
  hybridIndent3List.append(hybridIndent3Item1);
  hybridIndent3List.append(hybridIndent3Item2);

  hybridIndent2Item2.append(hybridIndent3List);
  hybridIndent2Item1.append($createTextNode('hybrid indent 2 item 1'));
  hybridIndent2List.append(hybridIndent2Item1);
  hybridIndent2List.append(hybridIndent2Item2);

  hybridIndentItem2.append(hybridIndent2List);
  hybridIndentItem1.append($createTextNode('hybrid indent 1 item 1'));
  hybridIndentList.append(hybridIndentItem1);
  hybridIndentList.append(hybridIndentItem2);

  root.append(hybridIndentList);
};

const $generateH1To6 = () => {
  const root = $getRoot();

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

export const $generateContent = () => {
  $generateH1To6();
  $generateListContent();

  const root = $getRoot();
  const paragraph = $createParagraphNode();
  paragraph.append($createTextNode(''));
  root.append(paragraph);
};