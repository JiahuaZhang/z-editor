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
    case 'h2':
      Match = H2;
      break;
    case 'h3':
      Match = H3;
      break;
    case 'h4':
      Match = H4;
      break;
    case 'h5':
      Match = H5;
      break;
    case 'h6':
      Match = H6;
      break;
  }

  return <Match richData={richData}>
    {richData.children?.map((n) => <Displayer key={n.id} richData={n} />)}
  </Match>;
};

const Span = ({ richData }: { richData: RichData, children: ReactNode; }) => {
  if (richData.data?.text !== undefined) {
    return <span un-empty='min-w-1em min-h-1em inline-block' id={richData.id} >{richData.data.text}</span>;
  }

  const data = richData.data as ComplexData;
  return <span un-empty='min-w-1em min-h-1em inline-block'
    un-italic={`${data.italic && '~'}`}
    un-underline={`${data.underline && '~'}`}
    un-font={`${data.bold && 'bold'}`}
    style={{
      color: data.color,
      background: data.background
    }}
    id={richData.id}
  >
    {data.value}
  </span>;
};

const P = ({ richData, children }: { richData: RichData, children: ReactNode; }) => {
  return <p id={richData.id} >
    {children}
  </p>;
};

const H1 = ({ richData, children }: { richData: RichData, children: ReactNode; }) => {
  return <h1 id={richData.id} >
    {children}
  </h1>;
};

const H2 = ({ richData, children }: { richData: RichData, children: ReactNode; }) => {
  return <h2 id={richData.id} >
    {children}
  </h2>;
};

const H3 = ({ richData, children }: { richData: RichData, children: ReactNode; }) => {
  return <h3 id={richData.id} >
    {children}
  </h3>;
};

const H4 = ({ richData, children }: { richData: RichData, children: ReactNode; }) => {
  return <h4 id={richData.id} >
    {children}
  </h4>;
};

const H5 = ({ richData, children }: { richData: RichData, children: ReactNode; }) => {
  return <h5 id={richData.id} >
    {children}
  </h5>;
};

const H6 = ({ richData, children }: { richData: RichData, children: ReactNode; }) => {
  return <h6 id={richData.id} >
    {children}
  </h6>;
};
