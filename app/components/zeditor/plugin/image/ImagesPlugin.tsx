import { CAN_USE_DOM } from '@lexical/utils';
import { LexicalCommand, createCommand } from 'lexical';
import { ImagePayload } from './ImageNode';

export type InsertImagePayload = Readonly<ImagePayload>;

const getDOMSelection = (targetWindow: Window | null) => CAN_USE_DOM ? (targetWindow || window).getSelection() : null;

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> = createCommand('INSERT_IMAGE_COMMAND');