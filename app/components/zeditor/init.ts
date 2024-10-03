import { $createCodeHighlightNode, $createCodeNode } from '@lexical/code';
import { $createHashtagNode } from '@lexical/hashtag';
import { $createListItemNode, $createListNode } from '@lexical/list';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $createTableCellNode, $createTableNode, $createTableRowNode } from '@lexical/table';
import { $createLineBreakNode, $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { $createLinkNode } from '@lexical/link';
import { $createStickyNode } from './plugin/sticky-note/StickNote';
import { $createMentionNode } from './plugin/mention/MentionNode';
import { $createImageNode } from './plugin/image/ImageNode';

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

const $generateCode = () => {
  const root = $getRoot();
  const code = $createCodeNode('java');
  code.append($createTextNode(`public class HelloWorld {
    public static void main(String[] args) {
        // Prints "Hello, World" to the console
        System.out.println("Hello, World");
    }
}`));
  root.append(code);

  const codeHighlight = $createCodeHighlightNode(`public class HelloWorld {
  public static void main(String[] args) {
      // Prints "Hello, World" to the console
      System.out.println("Hello, World");
  }
}`);
  const codeParagarph = $createCodeNode('java`');
  codeParagarph.append(codeHighlight);
  root.append(codeParagarph);
};

const $generateTable = () => {
  const root = $getRoot();

  const emptyTable = $createTableNode();
  const emptyRow = $createTableRowNode();
  const emptyCell = $createTableCellNode(0);
  emptyRow.append(emptyCell);
  emptyTable.append(emptyRow);
  root.append(emptyTable);

  const table = $createTableNode();
  const row = $createTableRowNode();
  const cell = $createTableCellNode(0);
  cell.append($createTextNode('cell'));

  row.append(cell);
  table.append(row);
  root.append(table);

  const table2x2 = $createTableNode();
  for (const row of [0, 1]) {
    const rowNode = $createTableRowNode();
    for (const col of [0, 1]) {
      const cell = $createTableCellNode(0);
      cell.append($createTextNode(`${row}-${col}`));
      rowNode.append(cell);
    }
    table2x2.append(rowNode);
  }
  root.append(table2x2);

  const table3x3 = $createTableNode();
  for (const row of [0, 1, 2]) {
    const rowNode = $createTableRowNode();
    for (const col of [0, 1, 2]) {
      const cell = $createTableCellNode(0);
      cell.append($createTextNode(`${row}-${col}`));
      rowNode.append(cell);
    }
    table3x3.append(rowNode);
  }
  root.append(table3x3);

  const table4x4 = $createTableNode();
  for (const row of [0, 1, 2, 3]) {
    const rowNode = $createTableRowNode();
    for (const col of [0, 1, 2, 3]) {
      const cell = $createTableCellNode(0);
      cell.append($createTextNode(`${row}-${col}`));
      rowNode.append(cell);
    }
    table4x4.append(rowNode);
  }
  root.append(table4x4);
};

const $generateHashTag = () => {
  const root = $getRoot();
  const paragraphNode = $createParagraphNode();
  const text = `Check out this hashtag: #lexical #smart-tag-here #中文标签🏷 #📕-中文-英文, #randomTag. #📕-😔-♥`;
  // const textNode = $createTextNode('Check out this hashtag: ');
  // const hashtagNode = $createHashtagNode('#lexical');
  // const textNode1 = $createTextNode(' ');
  // const hashtagNode1 = $createHashtagNode('#smart-tag-here');
  // const textNode2 = $createTextNode(' ');
  // const hashtagNode2 = $createHashtagNode('#中文标签🏷');
  // const textNode3 = $createTextNode(' ');
  // const hashtagNode3 = $createHashtagNode('#📕-中文-英文');
  // const textNode4 = $createTextNode(',');
  // const hashtagNode4 = $createHashtagNode('#randomTag');
  // const textNode5 = $createTextNode('.');
  // const hashtagNode5 = $createHashtagNode('#📕-😔-♥');
  // paragraphNode.append(textNode, hashtagNode, textNode1, hashtagNode1, textNode2, hashtagNode2, textNode, hashtagNode3, textNode4, hashtagNode4, textNode5, hashtagNode5);
  paragraphNode.append($createTextNode(text));
  root.append(paragraphNode);
};

const $generateLink = () => {
  const root = $getRoot();

  const link = $createLinkNode('https://www.google.com');
  link.append($createTextNode('google'));
  const paragraph = $createParagraphNode();
  paragraph.append(link);
  root.append(paragraph);

  const link2 = $createLinkNode('https://www.google.com/search?sca_esv=09b2b442516542ec&sxsrf=ADLYWIJu4_eb8hV8Q4a4FecqsoqigzsLIA:1723334765340&q=google+images&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2jogM63VUdBhAMVqo6r6ESHk5gYCycVYeSiTstipcfTqmDX4HENY8qrzy053qKvdRZFWn-VmYPJETamxffmtEKSqSFyN1NAs7geTy2Zjz_QIIZYxp-nlO2-_BmwI3ttsV3gNreTXhU1gZ0r7wI6MyQGb9r9hAw&sa=X&ved=2ahUKEwikl5Gk0uuHAxWUm4kEHStbAmEQtKgLegQIGBAB&biw=1912&bih=1002&dpr=1#vhid=yI1lnDQM0d5JwM&vssid=mosaic');
  link2.append($createTextNode('image'));
  const paragraph2 = $createParagraphNode();
  paragraph2.append(link2);
  root.append(paragraph2);

  const link3 = $createAutoLinkNode('https://www.apple.com');
  link3.append($createTextNode('apple'));
  const paragraph3 = $createParagraphNode();
  paragraph3.append(link3);
  root.append(paragraph3);
};

export const $generateContent = () => {
  $generateH1To6();
  // $generateListContent();
  // $generateCode();
  // $generateTable();
  $generateHashTag();
  $generateLink();

  const root = $getRoot();

  const quote = $createQuoteNode();
  quote.append($createTextNode('This is a quote node'));
  root.append(quote);

  const paragraph = $createParagraphNode();
  paragraph.append($createTextNode(''));
  root.append(paragraph);

  // const mention = $createMentionNode('hello');
  // const mentionParagraph = $createParagraphNode();
  // mentionParagraph.append(mention);
  // root.append(mentionParagraph);

  const image = $createImageNode({
    src: 'https://etc.usf.edu/clipart/76000/76095/76095_square_lg.gif',
    // src: 'https://images.dog.ceo/breeds/basenji/n02110806_1778.jpg',
    // src: 'https://images.dog.ceo/breeds/danish-swedish-farmdog/ebba_003.jpg',
    // src: `data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`,
    altText: 'random image',
  });
  // root.append(image);
  const imageParagraph = $createParagraphNode();
  imageParagraph.append(image);
  root.append(imageParagraph);

  // const stickyNode = $createStickyNode(600, 30);
  // root.append(stickyNode);
};