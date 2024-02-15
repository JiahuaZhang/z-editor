import { useAtom, atom } from 'jotai';
import { atomEffect } from 'jotai-effect';

export type DropDownAction = '' | 'up' | 'down' | 'space' | 'enter' | `query ${string}`;
export type DropDownFeedback = '' | 'space';

export const dropDownActionAtom = atom<DropDownAction>('');
export const dropDownFeedbackAtom = atom<DropDownFeedback>('');

export const dropDownKeyAtom = atom('');
export const dropDownOptionsAtom = atom<string[]>([]);

export const dropDownNavigationEffect = atomEffect((get, set) => {
  const dropDownAction = get(dropDownActionAtom);

  if (['up', 'down'].includes(dropDownAction)) {
    const key = get(dropDownKeyAtom);
    const options = get(dropDownOptionsAtom);
    const index = options.findIndex(option => option === key);

    if ('up' === dropDownAction) {
      set(dropDownKeyAtom, options[index > 0 ? index - 1 : 0]);
    } else {
      set(dropDownKeyAtom, options[index < options.length - 1 ? index + 1 : index]);
    }

    set(dropDownActionAtom, '');
  }

});