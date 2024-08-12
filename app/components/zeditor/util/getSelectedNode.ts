import { $isAtNodeEnd } from '@lexical/selection';
import { RangeSelection } from 'lexical';

export const getSelectedNode = (selection: RangeSelection) => {
  const { anchor, focus } = selection;
  const anchorNode = anchor.getNode();
  const focusNode = focus.getNode();
  if (anchorNode === focusNode) return anchorNode;

  if (selection.isBackward()) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
  }
};