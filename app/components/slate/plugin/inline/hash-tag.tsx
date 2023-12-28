import { blue, cyan, geekblue, gold, green, lime, magenta, orange, purple, red, volcano, yellow } from '@ant-design/colors';
import { Badge, ColorPicker, Divider, Popover, Tag } from 'antd';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { Editor, Transforms } from 'slate';
import { ReactEditor, RenderElementProps, useSlateStatic } from 'slate-react';

export const HASH_TAG_TYPE = 'hash-tag';

const colors = ['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'];
const presets = [{
  label: 'Recommended',
  colors: [
    ...red,
    ...volcano,
    ...orange,
    ...gold,
    ...yellow,
    ...lime,
    ...green,
    ...cyan,
    ...blue,
    ...geekblue,
    ...purple,
    ...magenta,
  ]
}];

const tagStyleAtom = atom('volcano');
const customColorAtom = atom('#f55');

const PresetTag = ({ color, name = color }: { color: string, name?: string; }) => {
  const [tagStyle, setTagStyle] = useAtom(tagStyleAtom);
  const editor = useSlateStatic();

  if (tagStyle === color) {
    return <Badge dot offset={[-8, 1]} color='green' >
      <Tag color={color}
        un-text='lg'
        un-px='1'
        un-cursor='pointer'
      >{name}</Tag>
    </Badge>;
  }

  return <div>
    <Tag color={color}
      un-text='lg'
      un-px='1'
      un-cursor='pointer'
      onClick={(event) => {
        event.stopPropagation();
        setTagStyle(color);
        const [match] = Editor.nodes(editor, { match: n => (n as any).type === HASH_TAG_TYPE, });
        if (match) {
          const [, path] = match;
          Transforms.setNodes(editor, { color } as Partial<Node>, { at: path });
        }
      }}
    >{name}</Tag>
  </div>;
};

const CustomColorTag = () => {
  const customColor = useAtomValue(customColorAtom);
  return <PresetTag color={customColor} />;
};

const CustomColorPicker = () => {
  const [customColor, setCustomColor] = useAtom(customColorAtom);

  return <div onClick={e => e.stopPropagation()} >
    <ColorPicker
      value={customColor}
      styles={{ popupOverlayInner: { width: 524, }, }}
      presets={presets}
      onChange={c => setCustomColor(c.toHexString())}
      panelRender={(_, { components: { Picker, Presets } }) => <div un-grid='~'
        un-grid-flow='col'
        un-grid-gap='2'
      >
        <div un-w='[234px]'>
          <Picker />
        </div>
        <Divider type="vertical" un-h='auto' />
        <div un-w='[234px]'>
          <Presets />
        </div>
      </div>}
    />
  </div>;
};

export const HashTag = ({ children, attributes, element }: RenderElementProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { color } = element as any;
  const setTagStyle = useSetAtom(tagStyleAtom);
  const setCustomColor = useSetAtom(customColorAtom);
  const editor = useSlateStatic();

  useEffect(() => {
    if (isPopoverOpen) {
      setTagStyle(color);
      if (!colors.some(c => color.includes(c))) {
        setCustomColor(color);
      }
    } else {
      ReactEditor.focus(editor);
    }
  }, [isPopoverOpen]);

  useEffect(() => () => ReactEditor.focus(editor), []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent | React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    const handlePopoverClick = (event: MouseEvent) => {
      if (!popoverRef.current?.contains(event.target as Node)) {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener('click', handlePopoverClick);
    return () => document.removeEventListener('click', handlePopoverClick);
  }, []);

  const Content = () => <div ref={popoverRef} >
    <h1 un-text='xl'
      un-font='semibold'
      un-grid='~'
      un-grid-flow='col'
      un-justify='between'
      un-items='center'
    >Customize Tag
      <i className='i-mdi:link-variant-off'
        un-cursor='pointer'
        un-hover='text-red-6'
        un-focus='text-red-6'
        onClick={() => Transforms.unwrapNodes(editor, { at: ReactEditor.findPath(editor, element) })}
      />
    </h1>
    <h2 un-text='lg' un-font='semibold'>Preset</h2>
    <div un-my='2'
      un-grid='~'
      un-grid-cols='[repeat(6,minmax(0,max-content))]'
      un-grid-gap='2'
    >
      {colors.map(c => <PresetTag color={`${c}`} key={c} />)}
    </div>
    <h2 un-text='lg' un-font='semibold'>
      Inverse Preset
    </h2>
    <div un-my='2'
      un-grid='~'
      un-grid-cols='[repeat(6,minmax(0,max-content))]'
      un-grid-gap='2'
    >
      {colors.map(c => <PresetTag color={`${c}-inverse`} key={c} name={c} />)}
    </div>
    <h2 un-text='lg' un-font='semibold' >Customize Color</h2>
    <div un-my='2'
      un-grid='~'
      un-grid-flow='col'
      un-justify='start'
      un-grid-gap='2'
    >
      <CustomColorPicker />
      <CustomColorTag />
    </div>
  </div>;

  return <ClientOnly>
    {
      () => <Popover content={<Content />} open={isPopoverOpen} {...attributes}  >
        <Tag color={color}
          un-text='lg'
          un-px='1'
          un-inline='~'
          un-position='static'
          onDoubleClick={() => setIsPopoverOpen(true)}
          {...attributes}
        >
          {children}
        </Tag>
      </Popover>
    }
  </ClientOnly>;
};