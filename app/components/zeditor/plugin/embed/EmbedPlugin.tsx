import { AutoEmbedOption, EmbedConfig, EmbedMatchResult, LexicalAutoEmbedPlugin } from '@lexical/react/LexicalAutoEmbedPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Modal } from 'antd';
import { COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand, LexicalEditor, LexicalNode } from 'lexical';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { INSERT_TWEET_COMMAND } from '../twitter/TwitterPlugin';
import { INSERT_YOUTUBE_COMMAND } from '../youtube/YouTubePlugin';

type PlaygroundEmbedConfig = EmbedConfig & {
  // Human readable name of the embeded content e.g. Tweet or Google Map.
  contentName: string;
  // Icon for display.
  icon?: JSX.Element;
  // An example of a matching url https://twitter.com/jack/status/20
  exampleUrl: string;
  // For extra searching.
  keywords: string[];
  // Embed a Figma Project.
  description?: string;
};

export const YoutubeEmbedConfig: PlaygroundEmbedConfig = {
  contentName: 'Youtube Video',
  exampleUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
  // Icon for display.
  icon: <span className="i-mdi:youtube" un-text='[#f00]' />,
  insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, result.id),
  keywords: ['youtube', 'video'],
  // Determine if a given URL is a match and return url data.
  parseUrl: async (url: string) => {
    const match = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/.exec(url);
    const id = match ? (match?.[2].length === 11 ? match[2] : null) : null;
    if (id != null) return { id, url };

    return null;
  },
  type: 'youtube-video',
};

export const TwitterEmbedConfig: PlaygroundEmbedConfig = {
  contentName: 'Tweet',
  exampleUrl: 'https://twitter.com/jack/status/20',
  icon: <span className="i-mdi:twitter" un-text='[#1da1f2]' />,
  insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => editor.dispatchCommand(INSERT_TWEET_COMMAND, result.id),
  // For extra searching.
  keywords: ['tweet', 'twitter'],
  parseUrl: (text: string) => {
    const match = /^https:\/\/(twitter|x)\.com\/(#!\/)?(\w+)\/status(es)*\/(\d+)/.exec(text);
    if (match != null) return { id: match[5], url: match[1] };

    return null;
  },

  type: 'tweet',
};

export const EmbedConfigs = [TwitterEmbedConfig, YoutubeEmbedConfig];

export const INSERT_EMBED_COMMAND: LexicalCommand<string> = createCommand('INSERT_EMBED_COMMAND');

class EmbedOption extends AutoEmbedOption {
  config?: PlaygroundEmbedConfig;
  constructor(title: string, options: {
    onSelect: (targetNode: LexicalNode | null) => void;
    config?: PlaygroundEmbedConfig;
  }) {
    super(title, options);
    this.config = options.config;
  }
}

const AutoEmbedMenuItem = ({ index, isSelected, onClick, onMouseEnter, option }: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: EmbedOption;
}) => <li un-bg={`${isSelected && 'blue-1'}`}
  un-grid='~'
  un-grid-flow='col'
  un-justify='start'
  un-items='center'
  un-gap='1'
  tabIndex={-1}
  ref={option.setRefElement}
  role='option'
  aria-selected={isSelected}
  id={'typeahead-item-' + index}
  onMouseEnter={onMouseEnter}
  onClick={onClick}
>
    {option?.config?.icon ?? <span className="i-carbon:close-filled" un-text='red-5' />} {option.title}
  </li>;

const AutoEmbedMenu = ({ options, selectedItemIndex, onOptionClick, onOptionMouseEnter }: {
  selectedItemIndex: number | null;
  onOptionClick: (option: AutoEmbedOption, index: number) => void;
  onOptionMouseEnter: (index: number) => void;
  options: EmbedOption[];
}) => <ul un-border='rounded 2 solid blue-1' un-bg='white' un-position='relative' un-z='5'>
    {options.map((option, index) => <AutoEmbedMenuItem
      index={index}
      isSelected={selectedItemIndex === index}
      onClick={() => onOptionClick(option, index)}
      onMouseEnter={() => onOptionMouseEnter(index)}
      option={option}
      key={option.key}
    />)}
  </ul>;

const getMenuOptions = (config: PlaygroundEmbedConfig, embedFn: () => void, dismissFn: () => void) => [
  new EmbedOption('Dismiss', { onSelect: dismissFn }),
  new EmbedOption(`Embed ${config.contentName}`, { onSelect: embedFn, config }),
];

// todo? combined these into FloatingLinkPlugin
export const EmbedPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [embed, setEmbed] = useState('');

  useEffect(() => editor.registerCommand(INSERT_EMBED_COMMAND, (config) => {
    setEmbed(config);
    return false;
  }, COMMAND_PRIORITY_EDITOR), [editor]);

  // const getMenuOptions = 

  return <>
    {
      embed === 'youtube-video' && <Modal open>
        Insert Youtube Video dialog
      </Modal>
    }
    {
      embed === 'twitter' && <Modal open>
        Insert Twitter dialog
      </Modal>
    }
    <LexicalAutoEmbedPlugin<PlaygroundEmbedConfig>
      embedConfigs={EmbedConfigs}
      onOpenEmbedModalForConfig={() => {}}
      getMenuOptions={getMenuOptions}
      menuRenderFn={(anchorElementRef, { selectedIndex, options, selectOptionAndCleanUp, setHighlightedIndex }) => {
        return anchorElementRef.current ? createPortal(
          <AutoEmbedMenu
            options={options}
            selectedItemIndex={selectedIndex}
            onOptionClick={(option, index) => {
              setHighlightedIndex(index);
              selectOptionAndCleanUp(option);
            }}
            onOptionMouseEnter={setHighlightedIndex}
          />, anchorElementRef.current) : null;
      }}
    />
  </>;
};
