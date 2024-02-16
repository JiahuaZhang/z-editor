import { atom } from 'jotai';
import { atomEffect } from 'jotai-effect';

export type DropDownMessage = '' | 'up' | 'down' | 'space-trigger' | 'space' | 'enter' | `query ${string}`;

export const dropDownMessageAtom = atom<DropDownMessage>('');

export const dropDownKeyAtom = atom('');
export const dropDownOptionsAtom = atom<string[]>([]);

export const dropDownNavigationEffect = atomEffect((get, set) => {
  const dropdownMessage = get(dropDownMessageAtom);

  if (['up', 'down'].includes(dropdownMessage)) {
    const key = get(dropDownKeyAtom);
    const options = get(dropDownOptionsAtom);
    const index = options.findIndex(option => option === key);

    if ('up' === dropdownMessage) {
      set(dropDownKeyAtom, options[index > 0 ? index - 1 : 0]);
    } else {
      set(dropDownKeyAtom, options[index < options.length - 1 ? index + 1 : index]);
    }

    set(dropDownMessageAtom, '');
  }

});