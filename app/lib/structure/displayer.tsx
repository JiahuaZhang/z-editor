import { Fragment } from 'react';
import { Content, SimpleRichContentLabel } from './type';
import { useSetAtom } from 'jotai';
import { updateElementAtom } from './state';

export type DisplayerFn = (props: Content) => JSX.Element;

export const SpanDisplayer = ({ data, state }: Content) => {
  // const updateElement = useSetAtom(updateElementAtom);
  if (!data || !data.value) throw new Error('Data value is required');

  const result = <span
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
        console.log('r', r);

        // updateElement(`${state?.path}.state.element`, r);
      }
    }
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

  return <p
  // ref={
  //   r => {
  //     if (!r) return;
  //     setContent(draft => _.set(draft, `${state?.path}.state.element`, r));
  //   }}
  >
    {renderContent(content ?? [])}
  </p>;
};

export const H1Displayer: DisplayerFn = ({ content, state }) => {

  return <h1
  // ref={r => {
  //   if (!r) return;
  //   setContent(draft => _.set(draft, `${state?.path}.state.element`, r));
  // }}
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