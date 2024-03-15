import { atomWithImmer } from 'jotai-immer';
import { Content } from './type';

export const contentAtom = atomWithImmer<Content[]>([]);
