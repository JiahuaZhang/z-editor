import { atom } from 'jotai';
import { RichData } from './type';

export const richDataAtom = atom<RichData[]>([]);