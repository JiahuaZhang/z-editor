import { Tooltip } from 'antd';
import { useAtomValue } from 'jotai';
import { lazy, Suspense, useEffect, useState } from 'react';
import { activeEditorAtom } from '../../context/activeEditor';
import { MAX_ALLOWED_FONT_SIZE, MIN_ALLOWED_FONT_SIZE } from '../../context/ToolbarContext';
import { updateFontSize, updateFontSizeInSelection, UpdateFontSizeType } from '../../util/utils';
import { SHORTCUTS } from '../shortcut/shortcut';

const Divider = lazy(() => import('./ToolbarPlugin').then(module => ({ default: module.Divider })));

export const FontSize = ({ fontSize }: { fontSize: string; }) => {
  const editor = useAtomValue(activeEditorAtom);
  const [value, setValue] = useState(fontSize);
  const [inputChangeFlag, setInputChangeFlag] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') return;

    const inputValueNumber = Number(value);
    if (['e', 'E', '+', '-'].includes(e.key) || isNaN(inputValueNumber)) {
      e.preventDefault();
      setValue('');
      return;
    }

    setInputChangeFlag(true);
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();

      updateFontSizeByInputValue(inputValueNumber);
    }
  };

  const updateFontSizeByInputValue = (inputValueNumber: number) => {
    let updatedFontSize = inputValueNumber;
    if (inputValueNumber > MAX_ALLOWED_FONT_SIZE) {
      updatedFontSize = MAX_ALLOWED_FONT_SIZE;
    } else if (inputValueNumber < MIN_ALLOWED_FONT_SIZE) {
      updatedFontSize = MIN_ALLOWED_FONT_SIZE;
    }

    setValue(String(updatedFontSize));
    updateFontSizeInSelection(editor!, `${updatedFontSize}px`, null);
    setInputChangeFlag(false);
  };

  const handleInputBlur = () => {
    if (value !== '' && inputChangeFlag) {
      updateFontSizeByInputValue(Number(value));
    }
  };

  useEffect(() => setValue(fontSize), [fontSize]);

  return <Suspense>
    <div un-flex='~' un-items='center' un-gap='1' >
      <Tooltip title={`Decrease font size (${SHORTCUTS.DECREASE_FONT_SIZE})`}>
        <button un-text='disabled:gray-3 gray-5' un-translate-y='-0.25' aria-label="Decrease font size"
          disabled={fontSize === '' || Number(value) <= MIN_ALLOWED_FONT_SIZE}
          onClick={() => updateFontSize(editor!, UpdateFontSizeType.decrement, value)}
        >-</button>
      </Tooltip>
      <Tooltip title='Font Size' >
        <input un-border='2 solid zinc-3 rounded' un-w='8' un-text='sm center'
          className='[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' type='number'
          value={value} onChange={event => setValue(event.target.value)}
          min={MIN_ALLOWED_FONT_SIZE} max={MAX_ALLOWED_FONT_SIZE}
          onKeyDown={handleKeyPress}
          onBlur={handleInputBlur}
        />
      </Tooltip>
      <Tooltip title={`Decrease font size (${SHORTCUTS.INCREASE_FONT_SIZE})`}>
        <button un-text='disabled:gray-3 gray-5' un-translate-y='-0.25' aria-label="Increase font size"
          disabled={fontSize === '' || Number(value) >= MAX_ALLOWED_FONT_SIZE}
          onClick={() => updateFontSize(editor!, UpdateFontSizeType.increment, value)}
        >+</button>
      </Tooltip>
    </div>
    <Divider />
  </Suspense>;
};