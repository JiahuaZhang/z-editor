import { CAN_USE_DOM } from '@lexical/utils';
import { ImagePayload } from '../nodes/ImageNode';
import { LexicalCommand, createCommand } from 'lexical';

export type InsertImagePayload = Readonly<ImagePayload>;

const getDOMSelection = (targetWindow: Window | null) => CAN_USE_DOM ? (targetWindow || window).getSelection() : null;

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> = createCommand('INSERT_IMAGE_COMMAND');

