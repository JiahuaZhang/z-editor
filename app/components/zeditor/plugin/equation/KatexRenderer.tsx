import katex from 'katex';
import 'katex/dist/katex.min.css';
import { MutableRefObject, useEffect } from 'react';

export const KatexRenderer = ({ equation, inline, onDoubleClick, katexRef, ...rest }: Readonly<{
  equation: string;
  inline: boolean;
  onDoubleClick: () => void;
  katexRef: MutableRefObject<HTMLSpanElement | null>;
}>) => {
  useEffect(() => {
    const katexElement = katexRef.current;

    if (katexElement !== null) {
      katex.render(equation, katexElement, {
        displayMode: !inline, // true === block display //
        errorColor: '#cc0000',
        output: 'html',
        strict: 'warn',
        throwOnError: false,
        trust: false,
      });
    }
  }, [equation, inline]);

  return (
    // We use an empty image tag either side to ensure Android doesn't try and compose from the
    // inner text from Katex. There didn't seem to be any other way of making this work,
    // without having a physical space.
    <>
      <img src="#" alt="" />
      <span
        role="button"
        tabIndex={-1}
        onDoubleClick={onDoubleClick}
        ref={katexRef}
        {...rest}
      />
      <img src="#" alt="" />
    </>
  );
};
