import { useAtom } from 'jotai';
import _ from 'lodash';
import { Fragment, useRef } from 'react';
import { contentAtom } from './state';
import { Content, SimpleRichContentLabel } from './type';
import { useImmerAtom } from 'jotai-immer';

export type DisplayerFn = (props: Content) => JSX.Element;

export const SpanDisplayer = ({ data, state }: Content) => {
  // const [content, setContent] = useAtom(contentAtom);
  if (!data || !data.value) throw new Error('Data value is required');

  const result = <span
    un-italic={`${data.italic && '~'}`}
    un-underline={`${data.underline && '~'}`}
    un-font={`${data.bold && 'bold'}`}
    style={{
      color: data.color,
      background: data.background
    }}
  // ref={
  //   r => {
  //     if (!r) return;
  //     setContent(draft => _.set(draft, `${state?.path}.state.element`, r));
  //   }
  // }
  >{data.value}</span>;

  return result;
};

const renderContent = (children: Content[]) => {
  return children?.map(child => {
    if (child.data?.value) {
      return <Fragment key={child.state?.id} >
        <SpanDisplayer {...child} />
      </Fragment>;
    }
    return <Fragment key={child.state?.id} >{child.data?.text}</Fragment>;
  });
};

export const PDisplayer: DisplayerFn = ({ content, state }) => {
  const [__, setContent] = useImmerAtom(contentAtom);

  return <p
    ref={
      r => {
        if (!r) return;
        setContent(draft => _.set(draft, `${state?.path}.state.element`, r));
      }}
  >
    {renderContent(content ?? [])}
  </p>;
};

export const H1Displayer: DisplayerFn = ({ content, state }) => {
  const [__, setContent] = useImmerAtom(contentAtom);

  return <h1
    ref={r => {
      if (!r) return;
      setContent(draft => _.set(draft, `${state?.path}.state.element`, r));
    }}
  >
    {renderContent(content ?? [])}
  </h1>;
};

export type DefaultDisplayerMap = {
  [K in SimpleRichContentLabel]: DisplayerFn;
};

export const defaultDisplayerMap = {
  p: PDisplayer,
  h1: H1Displayer
} as DefaultDisplayerMap;