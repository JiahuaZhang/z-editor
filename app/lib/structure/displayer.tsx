import { useAtom } from 'jotai';
import _ from 'lodash';
import { Fragment } from 'react';
import { contentAtom } from './state';
import { Content, SimpleRichContentLabel } from './type';

export type DisplayerFn = (props: Content) => JSX.Element;

export const SpanDisplayer = ({ data, state }: Content) => {
  const [content, setContent] = useAtom(contentAtom);
  if (!data || !data.value) throw new Error('attribute is required');

  return <span un-italic={`${data.italic && '~'}`}
    un-underline={`${data.underline && '~'}`}
    un-font={`${data.bold && 'bold'}`}
    style={{
      color: data.color,
      background: data.background
    }}
    ref={r => {
      if (!r) return;
      setContent(draft => _.set(draft, `${state?.key}.state.ref`, r));
    }}
  >{data.value}</span>;
};

export const PDisplayer: DisplayerFn = ({ children, state }) => {
  const [content, setContent] = useAtom(contentAtom);

  return <p
    ref={
      r => {
        if (!r) return;
        setContent(draft => _.set(draft, `${state?.key}.state.ref`, r));
      }}
  >{children?.map((child, index) => {
    if (child.data?.value) {
      return <SpanDisplayer {...child} key={index} />;
    }
    return <Fragment key={index} >{child.data?.text}</Fragment>;
  })}</p>;
};

export const H1Displayer: DisplayerFn = ({ children, state }) => {
  const [content, setContent] = useAtom(contentAtom);

  return <h1
    ref={r => {
      if (!r) return;
      setContent(draft => _.set(draft, `${state?.key}.state.ref`, r));
    }}
  >{children?.map(child => {
    if (child.data?.value) {
      return <SpanDisplayer {...child} key={child.state?.id} />;
    }
    return <Fragment key={child.state?.id} >{child.data?.text}</Fragment>;
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