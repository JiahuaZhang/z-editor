import { atom } from 'jotai';
import { atomWithImmer } from 'jotai-immer';
import _ from 'lodash';
import { Content } from './type';

export const contentAtom = atomWithImmer<Content[]>([]);

export const updateElementAtom = atom(
  null,
  (get, set, path: string, element: HTMLElement) => {
    set(contentAtom, draft => {
      _.set(draft, path, element);
    });
  }
);

export const updateSpanAtom = atom(
  null,
  (get, set, path: string, value: string) => {
    set(contentAtom, draft => {
      _.set(draft, `${path}.data.value`, value);
    });
  }
);

export const updateTextAtom = atom(
  null,
  (get, set, path: string, value: string) => {
    set(contentAtom, draft => {
      _.set(draft, `${path}.data.text`, value);
    });
  }
);