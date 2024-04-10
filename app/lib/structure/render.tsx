import { ReactNode } from 'react';
import { ContentNode } from './managed-content';
import { ComplexData } from './type';

export const Render = ({ node }: { node: ContentNode; }) => {
  // console.log('Render', node);

  let Match = PRender;
  switch (node.content?.label) {
    case 'h1':
      Match = H1Render;
      break;
    case 'span':
      Match = SpanRender;
  }

  return <Match node={node}   >
    {node.children().map((n) => <Render key={n.content?.id} node={n} />)}
  </Match>;
};

const H1Render = ({ node, children }: { node: ContentNode, children?: ReactNode; }) => {
  return <h1 id={node.content?.id}   >
    {children}
  </h1>;
};

const PRender = ({ node, children }: { node: ContentNode, children?: ReactNode; }) => {
  return <p id={node.content?.id} >
    {children}
  </p>;
};

const SpanRender = ({ node }: { node: ContentNode; }) => {
  if (node.content?.data?.text) {
    return <span id={node.content?.id} >{node.content.data.text}</span>;
  }

  const data = node.content?.data as ComplexData;
  return (
    <span
      un-italic={`${data.italic && '~'}`}
      un-underline={`${data.underline && '~'}`}
      un-font={`${data.bold && 'bold'}`}
      style={{
        color: data.color,
        background: data.background
      }}
      id={node.content?.id}
    >
      {data.value}
    </span>
  );
};
