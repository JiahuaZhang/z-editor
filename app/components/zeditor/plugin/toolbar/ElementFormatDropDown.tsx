import { Select } from 'antd';
import { ElementFormatType, FORMAT_ELEMENT_COMMAND, INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND } from 'lexical';
import { lazy, Suspense } from 'react';
import { useActiveEditorContext } from '../../context/activeEditor';
import { SHORTCUTS } from '../shortcut/shortcut';

const Divider = lazy(() => import('./ToolbarPlugin').then(module => ({ default: module.Divider })));

const FORMATS = {
  left: {
    icon: <span className="i-mdi:format-align-left" un-text='xl!' />,
    content: 'Left Align',
    shortcut: SHORTCUTS.LEFT_ALIGN,
    command: FORMAT_ELEMENT_COMMAND,
    arg: 'left'
  },
  center: {
    icon: <span className="i-mdi:format-align-center" un-text='xl!' />,
    content: 'Center Align',
    shortcut: SHORTCUTS.CENTER_ALIGN,
    command: FORMAT_ELEMENT_COMMAND,
    arg: 'center'
  },
  right: {
    icon: <span className="i-mdi:format-align-right" un-text='xl!' />,
    content: 'Right Align',
    shortcut: SHORTCUTS.RIGHT_ALIGN,
    command: FORMAT_ELEMENT_COMMAND,
    arg: 'right'
  },
  justify: {
    icon: <span className="i-mdi:format-align-justify" un-text='xl!' />,
    content: 'Justify Align',
    shortcut: SHORTCUTS.JUSTIFY_ALIGN,
    command: FORMAT_ELEMENT_COMMAND,
    arg: 'justify'
  },
  start: {
    icon: <span className="i-mdi:format-align-left" un-text='xl!' />,
    content: 'Start Align',
    shortcut: '',
    command: FORMAT_ELEMENT_COMMAND,
    arg: 'start'
  },
  end: {
    icon: <span className="i-mdi:format-align-right" un-text='xl!' />,
    content: 'End Align',
    shortcut: '',
    command: FORMAT_ELEMENT_COMMAND,
    arg: 'end'
  },
  outdent: {
    icon: <span className="i-ph:text-outdent" un-text='xl!' />,
    content: 'Outdent',
    shortcut: SHORTCUTS.OUTDENT,
    command: OUTDENT_CONTENT_COMMAND,
    arg: undefined
  },
  indent: {
    icon: <span className="i-ph:text-indent" un-text='xl!' />,
    content: 'Indent',
    shortcut: SHORTCUTS.INDENT,
    command: INDENT_CONTENT_COMMAND,
    arg: undefined
  },
};

const options = Object.keys(FORMATS).map(value => ({ label: value, value }));

export const ElementFormatDropDown = ({ elementFormat, isRTL }: { elementFormat: ElementFormatType, isRTL: boolean; }) => {
  const activeEditor = useActiveEditorContext();

  return <Suspense>
    <Select un-m='1' un-border='none hover:blue-6' className='[&>div]:(pr-0 pl-1)! [&>span]:(mr--2.25!)'
      disabled={!activeEditor.isEditable()}
      value={elementFormat || 'left'}
      popupClassName='w-auto!'
      listHeight={300}
      options={options}
      onChange={value => {
        const format = FORMATS[value as keyof typeof FORMATS];
        activeEditor.dispatchCommand(format.command, format.arg as any);
      }}
      optionRender={args => {
        return <div un-inline='grid' un-grid-flow='col' un-gap='4' un-items='center' un-w='full'
          un-grid-cols='[max-content_1fr_max-content]'
        >
          {FORMATS[args.value as keyof typeof FORMATS].icon}
          <span>
            {FORMATS[args.value as keyof typeof FORMATS].content}
          </span>
          <span>
            {FORMATS[args.value as keyof typeof FORMATS].shortcut}
          </span>
        </div>;
      }}
      labelRender={args => <div un-flex='~' un-mr='-3' un-items='center' un-gap='2' >
        {FORMATS[args.value as keyof typeof FORMATS].icon}
        <span>
          {FORMATS[args.value as keyof typeof FORMATS].content}
        </span>
      </div>}
    />
    <Divider />
  </Suspense>;
};