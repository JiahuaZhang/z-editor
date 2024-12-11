import { $createCodeHighlightNode, $createCodeNode } from '@lexical/code';
import { $createHashtagNode } from '@lexical/hashtag';
import { $createListItemNode, $createListNode } from '@lexical/list';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $createTableCellNode, $createTableNode, $createTableRowNode } from '@lexical/table';
import { $createLineBreakNode, $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { $createLinkNode, $createAutoLinkNode } from '@lexical/link';
import { $createStickyNode } from './plugin/sticky-note/StickNote';
import { $createMentionNode } from './plugin/mention/MentionNode';
import { $createImageNode } from './plugin/image/ImageNode';
import { $createInlineImageNode } from './plugin/inline-image/InlineImageNode';
import { $createExcalidrawNode } from './plugin/excalidraw/ExcalidrawNode';
import { $createEquationNode } from './plugin/equation/EuqationNode';
import { $createHorizontalRuleNode } from './plugin/horizontal-rule/HorizontalRuleNode';
import { $createTweetNode } from './plugin/twitter/TweetNode';
import { $createYouTubeNode } from './plugin/youtube/YouTubeNode';
import { $createCollapsibleContainerNode } from './plugin/collapsible/CollapsibleContainerNode';
import { $createCollapsibleContentNode } from './plugin/collapsible/CollapsibleContentNode';
import { $createCollapsibleTitleNode } from './plugin/collapsible/CollapsibleTitleNode';
import { $createPageBreakNode } from './plugin/page-break/PageBreakNode';
import { $createLayoutContainerNode } from './plugin/layout/LayoutContainerNode';
import { $createLayoutItemNode } from './plugin/layout/LayoutItemNode';

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

  const paragraph = $createParagraphNode();
  paragraph.append($createTextNode('Regular paragraph also supports'));
  const codeText = $createTextNode('inline code format');
  codeText.toggleFormat('code');
  paragraph.append(codeText);
  paragraph.append($createTextNode(', so I am regular paragraph again'));
  root.append(paragraph);

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
  emptyCell.append($createParagraphNode());
  emptyRow.append(emptyCell);
  emptyTable.append(emptyRow);
  root.append(emptyTable);

  const table = $createTableNode();
  const row = $createTableRowNode();
  const cell = $createTableCellNode(0);
  const cellParagraph = $createParagraphNode();
  cellParagraph.append($createTextNode('cell'));
  cell.append(cellParagraph);

  row.append(cell);
  table.append(row);
  root.append(table);

  const table2x2 = $createTableNode();
  for (const row of [0, 1]) {
    const rowNode = $createTableRowNode();
    for (const col of [0, 1]) {
      const cell = $createTableCellNode(0);
      const cellParagraph = $createParagraphNode();
      cellParagraph.append($createTextNode(`${row}-${col}`));
      cell.append(cellParagraph);
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
      const cellParagraph = $createParagraphNode();
      cellParagraph.append($createTextNode(`${row}-${col}`));
      cell.append(cellParagraph);
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
      const cellParagraph = $createParagraphNode();
      cellParagraph.append($createTextNode(`${row}-${col}`));
      cell.append(cellParagraph);
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

  // const link3 = $createAutoLinkNode('https://www.apple.com');
  // link3.append($createTextNode('apple'));
  const paragraph3 = $createParagraphNode();
  // paragraph3.append(link3);
  paragraph3.append($createTextNode('https://www.awesome.com'));
  root.append(paragraph3);
};

const $generateImages = () => {
  const root = $getRoot();

  const image = $createImageNode({
    src: 'https://etc.usf.edu/clipart/76000/76095/76095_square_lg.gif',
    // src: 'https://images.dog.ceo/breeds/basenji/n02110806_1778.jpg',
    // src: 'https://images.dog.ceo/breeds/danish-swedish-farmdog/ebba_003.jpg',
    // src: `data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`,
    altText: 'random image',
  });
  const imageParagraph = $createParagraphNode();
  imageParagraph.append(image);
  root.append(imageParagraph);

  // const inlineImage = $createInlineImageNode({
  //   src: 'https://images.dog.ceo/breeds/basenji/n02110806_1778.jpg',
  //   altText: 'random image',
  //   position: 'left'
  // });
  // const inlineImageParagraph = $createParagraphNode();
  // inlineImageParagraph.append(inlineImage);
  // root.append(inlineImageParagraph);

  // const inlineImage2 = $createInlineImageNode({
  //   src: 'https://i.redd.it/zwfggeplutf61.jpg',
  //   altText: 'random cat image',
  //   position: 'right',
  // });
  // const inlineImageParagraph2 = $createParagraphNode();
  // inlineImageParagraph.append(inlineImage2);
  // root.append(inlineImageParagraph2);

  // const inlineImage3 = $createInlineImageNode({
  //   src: 'https://images.pexels.com/photos/5699519/pexels-photo-5699519.jpeg',
  //   altText: 'random drugs image',
  //   position: 'full',
  //   showCaption: true
  // });
  // const inlineImageParagraph3 = $createParagraphNode();
  // inlineImageParagraph.append(inlineImage3);
  // root.append(inlineImageParagraph3);
};

const $generateExcalidarw = () => {
  const root = $getRoot();

  const excalidarw = $createExcalidrawNode(
    JSON.stringify({ "appState": { "exportBackground": true, "exportScale": 1, "exportWithDarkMode": false, "isBindingEnabled": true, "isLoading": false, "name": "Untitled-2024-10-31-1941", "theme": "light", "viewBackgroundColor": "#ffffff", "viewModeEnabled": false, "zenModeEnabled": false, "zoom": { "value": 1 } }, "elements": [{ "id": "WyXD0OjViscpmyfBrniN6", "type": "rectangle", "x": 297, "y": 272, "width": 231, "height": 138, "angle": 0, "strokeColor": "#1e1e1e", "backgroundColor": "transparent", "fillStyle": "solid", "strokeWidth": 2, "strokeStyle": "solid", "roughness": 1, "opacity": 100, "groupIds": [], "frameId": null, "roundness": { "type": 3 }, "seed": 1489549535, "version": 29, "versionNonce": 1715676255, "isDeleted": false, "boundElements": null, "updated": 1730418070883, "link": null, "locked": false }], "files": {} }),
    'inherit',
    'inherit'
  );

  root.append(excalidarw);

  // const paragraph = $createParagraphNode();
  // paragraph.append(excalidarw);
  // root.append(paragraph);
};

const $generateEquation = () => {
  const root = $getRoot();
  const equation = $createEquationNode('a^2 + b^2 = c^2', true);
  const paragraph = $createParagraphNode();
  paragraph.append(equation);
  root.append(paragraph);

  const blockEquation = $createEquationNode('\\sqrt{a} + \\frac{d}{e} = \\log{666}', false);
  const blockEquationParagraph = $createParagraphNode();
  blockEquationParagraph.append(blockEquation);
  root.append(blockEquationParagraph);
};

const $generateTweets = () => {
  const root = $getRoot();

  const emptyParagraph1 = $createParagraphNode();
  root.append(emptyParagraph1);

  const tweet = $createTweetNode('1858318917141197107');
  root.append(tweet);

  const emptyParagraph2 = $createParagraphNode();
  root.append(emptyParagraph2);

  const tweet2 = $createTweetNode('1858209912691572779');
  root.append(tweet2);

  const emptyParagraph3 = $createParagraphNode();
  root.append(emptyParagraph3);
};

const $generateYoutubes = () => {
  const root = $getRoot();

  const emptyParagraph1 = $createParagraphNode();
  root.append(emptyParagraph1);

  const youtube = $createYouTubeNode('gwOhmYGihUw');
  root.append(youtube);

  const emptyParagraph2 = $createParagraphNode();
  root.append(emptyParagraph2);

  const youtube2 = $createYouTubeNode('Oj_2r9nurPg');
  root.append(youtube2);

  const emptyParagraph3 = $createParagraphNode();
  root.append(emptyParagraph3);
};

const $generateParagraph = () => {
  const root = $getRoot();
  const paragraph = $createParagraphNode();
  const texts = $createTextNode("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
  paragraph.append(texts);
  root.append(paragraph);
};

const $generateCollapsible = () => {
  const root = $getRoot();
  const container = $createCollapsibleContainerNode(true);
  const title = $createCollapsibleTitleNode();
  title.append($createTextNode('This is a collapsible title node'));
  const content = $createCollapsibleContentNode();
  const contentParagraph = $createParagraphNode();
  contentParagraph.append($createTextNode('This is a collapsible content node'));
  content.append(contentParagraph);
  container.append(title);
  container.append(content);
  root.append(container);
};

const $generatePageBreak = () => {
  const root = $getRoot();
  const pageBreak = $createPageBreakNode();
  root.append(pageBreak);
};

const $generateLayout = () => {
  const root = $getRoot();
  const layout = $createLayoutContainerNode('1fr 1fr');
  const item1 = $createLayoutItemNode();
  const item2 = $createLayoutItemNode();
  const paragraph1 = $createParagraphNode();
  paragraph1.append($createTextNode('This is a layout node'));
  item1.append(paragraph1);
  const paragraph2 = $createParagraphNode();
  paragraph2.append($createTextNode('This is a layout node'));
  item2.append(paragraph2);
  layout.append(item1);
  layout.append(item2);
  root.append(layout);
};

export const $generateContent = () => {
  const root = $getRoot();

  $generateH1To6();
  const hr = $createHorizontalRuleNode();
  root.append(hr);

  $generateCollapsible();
  $generatePageBreak();
  $generateParagraph();
  $generateLayout();
  // $generateListContent();
  // $generateCode();
  // $generateTable();
  // $generateHashTag();
  // $generateLink();
  // $generateImages();
  // $generateExcalidarw();
  // $generateEquation();
  // $generateTweets();
  $generateYoutubes();

  const quote = $createQuoteNode();
  quote.append($createTextNode('This is a quote node'));
  root.append(quote);

  const paragraph = $createParagraphNode();
  paragraph.append($createTextNode(''));
  root.append(paragraph);

  // const stickyNode = $createStickyNode(600, 30);
  // root.append(stickyNode);
};