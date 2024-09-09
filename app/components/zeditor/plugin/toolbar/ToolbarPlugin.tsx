import { Button, Dropdown, MenuProps, Select } from 'antd';

const BLOCK_FORMATS = ['paragraph', 'h1', 'h2', 'h3', 'bullet', 'number', 'check', 'quote', 'code'] as const;
const BLOCK_LABELS: Record<typeof BLOCK_FORMATS[number], string> = {
  paragraph: 'Normal',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  bullet: 'Bullet List',
  number: 'Numbered List',
  check: 'Check List',
  quote: 'Quote',
  code: 'Code Block'
};
const BLOCK_ICONS: Record<typeof BLOCK_FORMATS[number], string> = {
  paragraph: 'i-system-uicons:paragraph-left',
  h1: 'i-ci:heading-h1',
  h2: 'i-ci:heading-h2',
  h3: 'i-ci:heading-h3',
  bullet: 'i-ph:list-bullets',
  number: 'i-ph:list-numbers',
  check: 'i-material-symbols-light:check-box-outline',
  quote: 'i-mdi:format-quote-open',
  code: 'i-ph:code-bold',
};
const items: MenuProps['items'] = [
  {
    key: 'sticky-note',
    label: 'Sticky Note',
    icon: <div className="i-bi:sticky"></div>
  },
];

const Divider = () => <span un-bg='neutral' un-w='2px' un-h='70%' un-border='rounded-full' />;

export const ToolbarPlugin = () => {
  return <div un-border='2px solid blue-4' un-text='2xl' un-grid='~' un-grid-flow='col' un-justify='start' un-items='center' un-gap='1'  >
    <button un-hover='bg-blue-6 [&>span]:text-white' un-border='rounded' un-inline='grid' un-py='1' >
      <span className="i-material-symbols-light:undo" un-text='blue-6'  ></span>
    </button>
    <button un-hover='bg-blue-6 [&>span]:text-white' un-border='rounded' un-inline='grid' un-py='1' >
      <span className="i-material-symbols-light:redo" un-text='blue-6'  ></span>
    </button>
    <Divider />

    <button un-hover='bg-blue-6 [&>span]:text-white' un-border='rounded' un-inline='grid' un-py='1' disabled un-disabled='[&>span]:text-gray-4 hover:bg-transparent cursor-not-allowed' >
      <span className="i-material-symbols-light:undo" un-text='blue-6'   ></span>
    </button>
    <button un-hover='bg-blue-6 [&>span]:text-white' un-border='rounded' un-inline='grid' un-py='1' disabled un-disabled='[&>span]:text-gray-4 hover:bg-transparent cursor-not-allowed' >
      <span className="i-material-symbols-light:redo" un-text='blue-6'  ></span>
    </button>
    <Divider />

    <button un-hover='bg-blue-6 [&>span]:text-white' un-border='rounded' un-inline='grid' un-py='1' >
      <span className="i-material-symbols-light:undo" un-text='blue-6'  ></span>
    </button>
    <button un-hover='bg-blue-6 [&>span]:text-white' un-border='rounded' un-inline='grid' un-py='1' >
      <span className="i-material-symbols-light:redo" un-text='blue-6'  ></span>
    </button>
    <Divider />

    <Select un-m='1' un-min-w='30' un-border='none hover:blue-6'
      defaultValue="paragraph"
      popupClassName='w-auto!'
      options={BLOCK_FORMATS.map(value => ({ label: BLOCK_LABELS[value], value }))}
      optionRender={args => {
        return <div un-inline='grid' un-grid-flow='col' un-gap='2' un-items='center' >
          <span className={BLOCK_ICONS[args.data.value]} />
          {args.data.label}
        </div>;
      }}
      labelRender={args => {
        return <div un-inline='grid' un-grid-flow='col' un-gap='2' un-items='center' >
          <div className={BLOCK_ICONS[args.value as typeof BLOCK_FORMATS[number]]}></div>
          {args.label}
        </div>;
      }}
      dropdownRender={original => <div un-min-w='80'>
        {original}
      </div>}
    />

    <Divider />
    <Dropdown menu={{ items }} trigger={['click']} >
      <Button un-inline='grid' un-grid-auto-flow='col' un-items='center' un-gap='1' un-text='sm' >
        <span className="i-mdi:plus" />
        Insert
        <span className="i-ph:caret-down" />
      </Button>
    </Dropdown>

  </div>;
};