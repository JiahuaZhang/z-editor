import { AutoEmbedOption, EmbedConfig, EmbedMatchResult, LexicalAutoEmbedPlugin } from '@lexical/react/LexicalAutoEmbedPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button, Form, Input, Modal } from 'antd';
import { LexicalEditor, LexicalNode } from 'lexical';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { INSERT_TWEET_COMMAND } from '../twitter/TwitterPlugin';
import { INSERT_YOUTUBE_COMMAND } from '../youtube/YouTubePlugin';

type PlaygroundEmbedConfig = EmbedConfig & {
  // Human readable name of the embeded content e.g. Tweet or Google Map.
  contentName: string;
  // Icon for display.
  icon?: JSX.Element;
  largeIcon?: JSX.Element;
  // An example of a matching url https://twitter.com/jack/status/20
  exampleUrl: string;
  // For extra searching.
  keywords: string[];
  // Embed a Figma Project.
  description?: string;
  error?: string;
};

export const YoutubeEmbedConfig: PlaygroundEmbedConfig = {
  contentName: 'Youtube Video',
  exampleUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
  // Icon for display.
  icon: <span className="i-mdi:youtube" un-text='[#f00]' />,
  largeIcon: <span className="i-mdi:youtube" un-text='[#f00] xl!' />,
  insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, result.id),
  keywords: ['youtube', 'video'],
  // Determine if a given URL is a match and return url data.
  parseUrl: (url: string) => {
    const match = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/.exec(url);
    const id = match ? (match?.[2].length === 11 ? match[2] : null) : null;
    if (id != null) return { id, url };

    return null;
  },
  type: 'youtube-video',
  error: 'Invalid YouTube URL',
};

export const TwitterEmbedConfig: PlaygroundEmbedConfig = {
  contentName: 'Tweet',
  exampleUrl: 'https://twitter.com/jack/status/20',
  icon: <span className="i-mdi:twitter" un-text='[#1da1f2]' />,
  largeIcon: <span className="i-mdi:twitter" un-text='[#1da1f2] xl!' />,
  insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => editor.dispatchCommand(INSERT_TWEET_COMMAND, result.id),
  // For extra searching.
  keywords: ['tweet', 'twitter'],
  parseUrl: (text: string) => {
    const match = /^https:\/\/(twitter|x)\.com\/(#!\/)?(\w+)\/status(es)*\/(\d+)/.exec(text);
    if (match != null) return { id: match[5], url: match[1] };

    return null;
  },
  type: 'tweet',
  error: 'Invalid Twitter URL',
};

export const EmbedConfigs = [TwitterEmbedConfig, YoutubeEmbedConfig];

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
}) => <li un-bg={`${isSelected && 'blue-100'}`}
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
}) => <ul un-border='rounded 2 solid blue-100' un-bg='white' un-position='relative' un-z='5'>
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

  return <>
    {EmbedConfigs.map(config => embed === config.type && <Modal open key={config.type} footer={null} onCancel={() => setEmbed('')} title={`Embed ${config.contentName}`} >
      <Form un-mt='6' className='[&>div:last-child]:m-0'
        onFinish={({ url }) => {
          config.insertNode(editor, config.parseUrl(url) as EmbedMatchResult);
          setEmbed('');
        }}
      >
        <Form.Item name='url' rules={[
          { required: true, },
          () => ({
            validator: (_, value) => {
              if (value === '') return Promise.resolve();

              if (config.parseUrl(value)) {
                return Promise.resolve();
              } else {
                return Promise.reject(new Error(config.error));
              }
            },
          })
        ]} >
          <Input ref={r => setTimeout(() => r?.focus(), 0)} placeholder={`${config.exampleUrl}`} />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 20 }} >
          <Button un-bg='blue-6' type='primary' htmlType='submit'>Embed</Button>
        </Form.Item>
      </Form>
    </Modal>)}
    <LexicalAutoEmbedPlugin<PlaygroundEmbedConfig>
      embedConfigs={EmbedConfigs}
      onOpenEmbedModalForConfig={config => setEmbed(config.type)}
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
