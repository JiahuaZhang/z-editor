import { Fragment } from 'react';
import { RichContent, RichContentLabel, SimpleRichContentLabel, TextContent } from './structure';

export type DisplayerFn<T extends RichContentLabel> = (props: RichContent<T>) => JSX.Element;

export const SpanDisplayer = (props: TextContent) => {
  if (!props.attribute) throw new Error('attribute is required');

  return <span un-italic={`${props.attribute.italic && '~'}`}
    un-underline={`${props.attribute.underline && '~'}`}
    un-font={`${props.attribute.bold && 'bold'}`}
    style={{
      color: props.attribute.color,
      background: props.attribute.background
    }} >{props.text}</span>;
};

export const PDisplayer: DisplayerFn<'p'> = (props) => {
  return <p>{props.data.children.map((child, index) => {
    if (child.attribute) {
      return <SpanDisplayer {...child} key={index} />;
    }
    return <Fragment key={index} >{child.text}</Fragment>;
  })}</p>;
};

export const H1Displayer: DisplayerFn<'h1'> = (props) => {
  return <h1>{props.data.children.map((child, index) => {
    if (child.attribute) {
      return <SpanDisplayer {...child} key={index} />;
    }
    return <Fragment key={index} >{child.text}</Fragment>;
  })}
  </h1>;
};

export type DefaultDisplayerMap = {
  [K in SimpleRichContentLabel]: DisplayerFn<K>;
};

export const defaultDisplayerMap = {
  p: PDisplayer,
  h1: H1Displayer
} as DefaultDisplayerMap;