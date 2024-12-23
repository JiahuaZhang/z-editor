import { Button, Dropdown, Form, Input, MenuProps, Modal } from 'antd';
import { useAtomValue } from 'jotai';
import { $getRoot } from 'lexical';
import { useCallback, useMemo, useState } from 'react';
import { activeEditorAtom } from '../../context/activeEditor';
import { INSERT_INLINE_COMMAND } from '../comment/CommentPlugin';
import { INSERT_EXCALIDRAW_COMMAND } from '../excalidraw/ExcalidrawPlugin';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '../horizontal-rule/HorizontalRuleNode';
import { INSERT_IMAGE_COMMAND } from '../image/ImagePlugin';
import { INSERT_PAGE_BREAK } from '../page-break/PageBreakPlugin';
import { $createStickyNode } from '../sticky-note/StickNote';

export const InsertDropDown = () => {
  const [isInsertingImage, setIsInsertingImage] = useState(false);
  const [isImageUrlMode, setIsImageUrlMode] = useState(true);
  const activeEditor = useAtomValue(activeEditorAtom);
  const insertItems = useMemo(() => {
    if (!activeEditor) return [];

    return [
      {
        key: 'horizontal-rule',
        label: 'Horizontal Rule',
        icon: <span className="i-material-symbols-light:horizontal-rule" un-text='xl!' />,
        onClick: () => activeEditor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)
      },
      {
        key: 'page-break',
        label: 'Page Break',
        icon: <span className="i-mdi:scissors" un-text='xl!' />,
        onClick: () => activeEditor.dispatchCommand(INSERT_PAGE_BREAK, undefined)
      },
      {
        key: 'image',
        label: 'Image',
        icon: <span className='i-mdi:image-outline' un-text='xl!' />,
        onClick: () => setIsInsertingImage(true),
      },
      {
        key: 'inline-image',
        label: 'Inline Image',
        icon: <span className='i-mdi:image-outline' un-text='xl!' />,
        onClick: () => activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, {
          src: 'https://picsum.photos/200/300',
          altText: 'random image',
        })
      },
      {
        key: 'sticky-note',
        label: 'Sticky Note',
        icon: <span className="i-bi:sticky" un-text='xl!' />,
        onClick: () => activeEditor.update(() => {
          const root = $getRoot();
          const stickyNode = $createStickyNode(0, 0);
          root.append(stickyNode);
        })
      },
      {
        key: 'excali-draw',
        label: 'Excalidraw',
        icon: <span className="i-ph:graph" un-text='xl!' />,
        onClick: () => activeEditor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, undefined)
      },
      {
        key: 'comment',
        label: 'Comment',
        icon: <span className="i-material-symbols-light:comment" un-text='xl!' />,
        onClick: () => activeEditor.dispatchCommand(INSERT_INLINE_COMMAND, undefined)
      },
    ] as MenuProps['items'];
  }, [activeEditor, setIsInsertingImage]);

  const insertImage = useCallback(({ src = 'https://picsum.photos/200/300', altText = 'random image' }: { src?: string, altText?: string; }) => {
    activeEditor!.dispatchCommand(INSERT_IMAGE_COMMAND, { src, altText });
  }, [activeEditor]);

  return <>
    <Dropdown menu={{ items: insertItems }} trigger={['click']} >
      <Button un-inline='grid' un-grid-auto-flow='col' un-items='center' un-gap='0.25' un-px='1' un-text='sm gray-6'>
        <span className="i-mdi:plus" un-text='lg' /> Insert <span className="i-ph:caret-down" un-text='lg' />
      </Button>
    </Dropdown>
    <Modal open={isInsertingImage} footer={null} onCancel={() => setIsInsertingImage(false)} title='Insert Image' >
      <div un-grid='~' un-gap='6' un-mt='2' >
        <button un-bg='blue-5 hover:white' un-mx='30' un-border='rounded blue-5 2' un-text='white lg hover:blue-5' un-p='2'
          onClick={() => insertImage({})}
        >Random</button>
        <button un-bg='blue-5 hover:white' un-mx='30' un-border='rounded blue-5 2' un-text='white lg hover:blue-5' un-p='2'
          onClick={() => {
            setIsInsertingImage(false);
            setIsImageUrlMode(true);
          }}
        >URL</button>
        <button un-bg='blue-5 hover:white' un-mx='30' un-border='rounded blue-5 2' un-text='white lg hover:blue-5' un-p='2' >File</button>
      </div>
    </Modal>
    <Modal open={isImageUrlMode} footer={null} onCancel={() => setIsImageUrlMode(false)} title='Insert Image' >
      <Form un-mt='6' labelCol={{ span: 5 }} className='[&>div:last-child]:m-0'
        onFinish={insertImage}
      >
        <Form.Item label='Image URL' name='src'
          rules={[{ required: true, message: 'Please input image URL!' }, { type: 'url' }]}
        >
          <Input placeholder='i.e. https://source.unsplash.com/random' />
        </Form.Item>
        <Form.Item label='Alt Text' name='alt' >
          <Input placeholder='Random unsplash image' />
        </Form.Item>
        <Form.Item label={null} wrapperCol={{ offset: 20 }} >
          <Button un-bg='blue-6' type='primary' htmlType='submit' >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  </>;
};