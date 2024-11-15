import { DecoratorNode, EditorConfig, LexicalEditor, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import { useSharedAutocompleteContext } from './AutoCompleteContext';
import { autoCompleteUuid } from './AutoCompletePlugin';

declare global {
  interface Navigator {
    userAgentData?: {
      mobile: boolean;
    };
  }
}

export type SerializedAutocompleteNode = Spread<
  {
    uuid: string;
  },
  SerializedLexicalNode
>;

export class AutocompleteNode extends DecoratorNode<JSX.Element | null> {
  /**
   * A unique uuid is generated for each session and assigned to the instance.
   * This helps to:
   * - Ensures max one Autocomplete node per session.
   * - Ensure that when collaboration is enabled, this node is not shown in
   *   other sessions.
   * See https://github.com/facebook/lexical/blob/master/packages/lexical-playground/src/plugins/AutocompletePlugin/index.tsx#L39
   */
  __uuid: string;

  static clone(node: AutocompleteNode): AutocompleteNode {
    return new AutocompleteNode(node.__uuid, node.__key);
  }

  static getType(): 'autocomplete' {
    return 'autocomplete';
  }

  static importJSON(serializedNode: SerializedAutocompleteNode): AutocompleteNode {
    const node = $createAutocompleteNode(serializedNode.uuid);
    return node;
  }

  exportJSON(): SerializedAutocompleteNode {
    return {
      ...super.exportJSON(),
      type: 'autocomplete',
      uuid: this.__uuid,
      version: 1,
    };
  }

  constructor(uuid: string, key?: NodeKey) {
    super(key);
    this.__uuid = uuid;
  }

  updateDOM(prevNode: unknown, dom: HTMLElement, config: EditorConfig): boolean {
    return false;
  }

  createDOM(config: EditorConfig): HTMLElement {
    return document.createElement('span');
  }

  decorate(editor: LexicalEditor, config: EditorConfig): JSX.Element | null {
    if (this.__uuid !== autoCompleteUuid) {
      return null;
    }
    return <AutocompleteComponent />;
  }
}

export const $createAutocompleteNode = (uuid: string) => new AutocompleteNode(uuid);

const AutocompleteComponent = () => {
  const [suggestion] = useSharedAutocompleteContext();
  const userAgentData = window.navigator.userAgentData;
  const isMobile = userAgentData !== undefined ? userAgentData.mobile : window.innerWidth <= 800 && window.innerHeight <= 600;
  return (
    <span un-text='zinc-2' spellCheck="false">
      {suggestion} {isMobile ? '(SWIPE →)' : '(TAB)'}
    </span>
  );
};
