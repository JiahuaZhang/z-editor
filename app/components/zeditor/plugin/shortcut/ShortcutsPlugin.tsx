import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { HeadingTagType } from '@lexical/rich-text';
import { COMMAND_PRIORITY_NORMAL, FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND, INDENT_CONTENT_COMMAND, KEY_MODIFIER_COMMAND, OUTDENT_CONTENT_COMMAND } from 'lexical';
import { useEffect } from 'react';
import { useActiveEditorContext } from '../../context/ActiveEditor';
import { useFloatContext } from '../../context/FloatContext';
import { useToolbarContext } from '../../context/ToolbarContext';
import { sanitizeUrl } from '../../util/url';
import { clearSelectionFormatting, formatBulletList, formatCheckList, formatCode, formatHeading, formatNumberedList, formatParagraph, formatQuote, updateFontSize, UpdateFontSizeType } from '../../util/utils';
import { DOCUMENT_SYNC_COMMAND } from '../document-synchronization/DocumentSynchronizationPlugin';
import { isCapitalize, isCenterAlign, isClearFormatting, isDecreaseFontSize, isFormatBulletList, isFormatCheckList, isFormatCode, isFormatHeading, isFormatNumberedList, isFormatParagraph, isFormatQuote, isIncreaseFontSize, isIndent, isInsertCodeBlock, isInsertLink, isJustifyAlign, isLeftAlign, isLowercase, isOutdent, isRightAlign, isSaveDocument, isStrikeThrough, isSubscript, isSuperscript, isUppercase } from './shortcut';

export const ShortcutsPlugin = () => {
  const editor = useActiveEditorContext();
  const { toolbarContext } = useToolbarContext();
  const { setIsLinkEditMode } = useFloatContext();

  useEffect(() => {
    const keyboardShortcutsHandler = (payload: KeyboardEvent) => {
      const event: KeyboardEvent = payload;

      if (isFormatParagraph(event)) {
        event.preventDefault();
        formatParagraph(editor);
      } else if (isFormatHeading(event)) {
        event.preventDefault();
        const { code } = event;
        const headingSize = `h${code[code.length - 1]}` as HeadingTagType;
        formatHeading(editor, toolbarContext.blockType, headingSize);
      } else if (isFormatBulletList(event)) {
        event.preventDefault();
        formatBulletList(editor, toolbarContext.blockType);
      } else if (isFormatNumberedList(event)) {
        event.preventDefault();
        formatNumberedList(editor, toolbarContext.blockType);
      } else if (isFormatCheckList(event)) {
        event.preventDefault();
        formatCheckList(editor, toolbarContext.blockType);
      } else if (isFormatCode(event)) {
        event.preventDefault();
        formatCode(editor, toolbarContext.blockType);
      } else if (isFormatQuote(event)) {
        event.preventDefault();
        formatQuote(editor, toolbarContext.blockType);
      } else if (isStrikeThrough(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
      } else if (isLowercase(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'lowercase');
      } else if (isUppercase(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'uppercase');
      } else if (isCapitalize(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'capitalize');
      } else if (isIndent(event)) {
        event.preventDefault();
        editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
      } else if (isOutdent(event)) {
        event.preventDefault();
        editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
      } else if (isCenterAlign(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
      } else if (isLeftAlign(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
      } else if (isRightAlign(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
      } else if (isJustifyAlign(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
      } else if (isSubscript(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
      } else if (isSuperscript(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
      } else if (isInsertCodeBlock(event)) {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
      } else if (isIncreaseFontSize(event)) {
        event.preventDefault();
        updateFontSize(editor, UpdateFontSizeType.increment, toolbarContext.fontSizeInputValue);
      } else if (isDecreaseFontSize(event)) {
        event.preventDefault();
        updateFontSize(editor, UpdateFontSizeType.decrement, toolbarContext.fontSizeInputValue);
      } else if (isClearFormatting(event)) {
        event.preventDefault();
        clearSelectionFormatting(editor);
      } else if (isInsertLink(event)) {
        event.preventDefault();
        const url = toolbarContext.isLink ? null : sanitizeUrl('https://');
        setIsLinkEditMode(!toolbarContext.isLink);

        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      } else if (isSaveDocument(event)) {
        event.preventDefault();
        editor.dispatchCommand(DOCUMENT_SYNC_COMMAND, undefined);
      }

      return false;
    };

    return editor.registerCommand(KEY_MODIFIER_COMMAND, keyboardShortcutsHandler, COMMAND_PRIORITY_NORMAL);
  }, [editor, toolbarContext.isLink, toolbarContext.blockType, toolbarContext.fontSizeInputValue, setIsLinkEditMode]);

  return null;
};
