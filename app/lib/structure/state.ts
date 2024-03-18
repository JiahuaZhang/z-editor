import { atomWithImmer, withImmer } from 'jotai-immer';
import { Content } from './type';
import { atom, useAtom } from 'jotai';

// const primitiveAtom = atom<Content[]>([]);
export const contentAtom = atom<Content[]>([]);
// export const contentAtom = withImmer(primitiveAtom);
// export const contentAtom = atomWithImmer<Content[]>([]);