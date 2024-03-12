import { Fragment } from 'react';
import { Content, SimpleRichContentLabel } from './type';

export type DisplayerFn = (props: Content) => JSX.Element;

export const SpanDisplayer = ({ data }: Content) => {
  if (!data || !data.value) throw new Error('attribute is required');

  return <span un-italic={`${data.italic && '~'}`}
    un-underline={`${data.underline && '~'}`}
    un-font={`${data.bold && 'bold'}`}
    style={{
      color: data.color,
      background: data.background
    }} >{data.value}</span>;
};

export const PDisplayer: DisplayerFn = ({ children }) => {
  return <p>{children?.map((child, index) => {
    if (child.data?.value) {
      return <SpanDisplayer {...child} key={index} />;
    }
    return <Fragment key={index} >{child.data?.text}</Fragment>;
  })}</p>;
};

export const H1Displayer: DisplayerFn = ({ children }) => {
  return <h1>{children?.map((child, index) => {
    if (child.data?.value) {
      return <SpanDisplayer {...child} key={index} />;
    }
    return <Fragment key={index} >{child.data?.text}</Fragment>;
  })}
  </h1>;
};

export type DefaultDisplayerMap = {
  [K in SimpleRichContentLabel]: DisplayerFn;
};

export const defaultDisplayerMap = {
  p: PDisplayer,
  h1: H1Displayer
} as DefaultDisplayerMap;