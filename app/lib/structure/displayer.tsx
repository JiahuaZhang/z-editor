import { useSetAtom } from 'jotai';
import { Fragment } from 'react';
import { updateElementAtom } from './state';
import { Content, SimpleRichContentLabel } from './type';

export type DisplayerFn = (props: Content) => JSX.Element;

export const SpanDisplayer = ({ data, state }: Content) => {
  const updateElement = useSetAtom(updateElementAtom);
  if (!data || !data.value) throw new Error('Data value is required');

  return <span
    un-italic={`${data.italic && '~'}`}
    un-underline={`${data.underline && '~'}`}
    un-font={`${data.bold && 'bold'}`}
    style={{
      color: data.color,
      background: data.background
    }}
    ref={
      r => {
        if (!r) return;
        updateElement(`${state?.path}.state.element`, r);
      }
    }
  >{data.value}</span>;
};

const renderContent = (children: Content[]) => {
  return children?.map(child => {
    if (child.data?.value) {
      return <Fragment key={child.state?.id} >
        <SpanDisplayer {...child as Content} />
      </Fragment>;
    }
    return <Fragment key={child.state?.id} >{child.data?.text}</Fragment>;
  });
};

export const PDisplayer: DisplayerFn = ({ content, state }) => {
  const updateElement = useSetAtom(updateElementAtom);

  return <p
    ref={
      r => {
        if (!r) return;
        updateElement(`${state?.path}.state.element`, r);
      }}
  >
    {renderContent(content ?? [])}
  </p>;
};

export const H1Displayer: DisplayerFn = ({ content, state }) => {
  const updateElement = useSetAtom(updateElementAtom);

  return <h1
    ref={r => {
      if (!r) return;
      updateElement(`${state?.path}.state.element`, r);
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