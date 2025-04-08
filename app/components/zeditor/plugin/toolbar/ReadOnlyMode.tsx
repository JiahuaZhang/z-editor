import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Tooltip } from "antd";

export const ReadOnlyMode = () => {
  const [editor] = useLexicalComposerContext();

  if (editor.isEditable()) {
    return <button onClick={() => editor.setEditable(false)} >
      <Tooltip title='Read Only Mode' >
        <span className="i-mdi:lock-open" un-text='xl' />
      </Tooltip>
    </button>;
  }

  return <button onClick={() => editor.setEditable(true)} >
    <Tooltip title='Read Only Mode' >
      <span className="i-mdi:lock" un-text='xl zinc-6' />
    </Tooltip>
  </button>;
};