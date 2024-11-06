import { ChangeEvent, forwardRef, Ref, RefObject, useEffect } from 'react';

type BaseEquationEditorProps = {
  equation: string;
  inline: boolean;
  setEquation: (equation: string) => void;
};

const InternalEquationEditor = (
  { equation, setEquation, inline }: BaseEquationEditorProps,
  forwardedRef: Ref<HTMLInputElement | HTMLTextAreaElement>,
) => {
  const onChange = (event: ChangeEvent) => setEquation((event.target as HTMLInputElement).value);

  useEffect(() => {
    const { current } = (forwardedRef as RefObject<HTMLElement>);
    if (current instanceof HTMLTextAreaElement) {
      current.style.height = '0';
      const scrollHeight = current.scrollHeight;
      current.style.height = `${scrollHeight}px`;
    }
  }, [forwardedRef, equation]);

  return inline ? (
    <span un-bg='slate-2' un-flex='inline' un-border='rounded' un-gap='0.5' >
      <span un-text='gray-4'>$</span>
      <input un-bg='inherit' un-outline='none'
        value={equation}
        onChange={onChange}
        autoFocus={true}
        ref={forwardedRef as RefObject<HTMLInputElement>}
      />
      <span un-text='gray-4'>$</span>
    </span>
  ) : (
    <div un-bg='slate-2' un-border='rounded' >
      <span un-text='gray-4'>{'$$\n'}</span>
      <textarea un-bg='inherit' un-outline='none' un-w='full' un-resize='none'
        value={equation}
        onChange={onChange}
        ref={forwardedRef as RefObject<HTMLTextAreaElement>}
      />
      <span un-text='gray-4'>{'\n$$'}</span>
    </div>
  );
};

export const EquationEditor = forwardRef(InternalEquationEditor);