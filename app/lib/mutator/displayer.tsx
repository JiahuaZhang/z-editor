import { ReactNode } from 'react';
import { ComplexData, RichData } from './type';

export const Displayer = ({ richData }: { richData: RichData; }) => {
  let Match = Span;
  switch (richData.label) {
    case 'p':
      Match = P;
      break;
    case 'h1':
      Match = H1;
      break;
  }

  return <Match richData={richData}>
    {richData.children?.map((n) => <Displayer key={n.id} richData={n} />)}
  </Match>;
};

const Span = ({ richData }: { richData: RichData, children: ReactNode; }) => {
  if (richData.data?.text) {
    return <>{richData.data.text}</>;
  }

  const data = richData.data as ComplexData;
  return <span
    un-italic={`${data.italic && '~'}`}
    un-underline={`${data.underline && '~'}`}
    un-font={`${data.bold && 'bold'}`}
    style={{
      color: data.color,
      background: data.background
    }}
  >
    {data.value}
  </span>;
};

const P = ({ richData, children }: { richData: RichData, children: ReactNode; }) => {
  return <p>
    {children}
  </p>;
};

const H1 = ({ richData, children }: { richData: RichData, children: ReactNode; }) => {
  return <h1>
    {children}
  </h1>;
};