import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { mergeRegister } from "@lexical/utils";
import { Button, Checkbox, Form, Input, InputNumber, Modal, Radio, Upload } from "antd";
import { COMMAND_PRIORITY_LOW, createCommand, LexicalCommand } from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";
import { INSERT_EQUATION_COMMAND } from "../equation/EquationPlugin";
import { KatexRenderer } from "../equation/KatexRenderer";
import { INSERT_IMAGE_COMMAND } from "../image/ImagePlugin";
import { INSERT_INLINE_IMAGE_COMMAND } from "../inline-image/InlineImagePlugin";
import { INSERT_LAYOUT_COMMAND } from "../layout/LayoutPlugin";

export const OPEN_IMAGE_POPUP_COMMAND: LexicalCommand<void> = createCommand('OPEN_IMAGE_POPUP_COMMAND');
export const OPEN_INLINE_IMAGE_POPUP_COMMAND: LexicalCommand<void> = createCommand('OPEN_INLINE_IMAGE_POPUP_COMMAND');
export const OPEN_TABLE_POPUP_COMMAND: LexicalCommand<void> = createCommand('OPEN_TABLE_POPUP_COMMAND');
export const OPEN_EQUATION_POPUP_COMMAND: LexicalCommand<void> = createCommand('OPEN_EQUATION_POPUP_COMMAND');
export const OPEN_COLUMN_LAYOUT_POPUP_COMMAND: LexicalCommand<void> = createCommand('OPEN_COLUMN_LAYOUT_POPUP_COMMAND');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const UnoTrick = <div un-auto-cols='[2fr_1fr] [3fr_1fr] [1fr_3fr] [1fr_2fr_1fr]' />;

const DEFAULT_LAYOUTS = [
  { layout: '1fr_1fr', children: [1, 1] },
  { layout: '2fr_1fr', children: [2, 1] },
  { layout: '1fr_2fr', children: [1, 2] },
  { layout: '3fr_1fr', children: [1, 3] },
  { layout: '1fr_3fr', children: [3, 1] },
  { layout: '1fr_1fr_1fr', children: [1, 1, 1] },
  { layout: '1fr_2fr_1fr', children: [1, 2, 1] },
  { layout: '1fr_1fr_1fr_1fr', children: [1, 1, 1, 1] },
];

export const PopupPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [isInsertingImage, setIsInsertingImage] = useState(false);
  const [isImageUrlMode, setIsImageUrlMode] = useState(false);
  const [isImageFileMode, setIsImageFileMode] = useState(false);
  const [isInlineImageInsertMode, setIsInlineImageInsertMode] = useState(false);
  const [isInsertingTable, setIsInsertingTable] = useState(false);
  const [isInsertingColumnLayout, setIsInsertingColumnLayout] = useState(false);
  const [isInsertEquationMode, setIsInsertEquationMode] = useState(false);
  const [equation, setEquation] = useState('');
  const katexRef = useRef(null);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(OPEN_IMAGE_POPUP_COMMAND, () => {
        setIsInsertingImage(true);
        return false;
      }, COMMAND_PRIORITY_LOW),
      editor.registerCommand(OPEN_INLINE_IMAGE_POPUP_COMMAND, () => {
        setIsInlineImageInsertMode(true);
        return false;
      }, COMMAND_PRIORITY_LOW),
      editor.registerCommand(OPEN_TABLE_POPUP_COMMAND, () => {
        setIsInsertingTable(true);
        return false;
      }, COMMAND_PRIORITY_LOW),
      editor.registerCommand(OPEN_COLUMN_LAYOUT_POPUP_COMMAND, () => {
        setIsInsertingColumnLayout(true);
        return false;
      }, COMMAND_PRIORITY_LOW),
      editor.registerCommand(OPEN_EQUATION_POPUP_COMMAND, () => {
        setIsInsertEquationMode(true);
        return false;
      }, COMMAND_PRIORITY_LOW)
    );
  }, [editor]);

  const insertImage = useCallback(({ src = 'https://picsum.photos/200/300', altText = 'random image' }: { src?: string, altText?: string; }) => {
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src, altText });
  }, [editor]);

  return <><Modal open={isInsertingImage} footer={null} onCancel={() => setIsInsertingImage(false)} title='Insert Image' >
    <div un-grid='~' un-gap='6' un-mt='2' >
      <button un-bg='blue-5 hover:white' un-mx='30' un-border='rounded blue-5 2' un-text='white lg hover:blue-5' un-p='2'
        onClick={() => {
          setIsInsertingImage(false);
          insertImage({});
        }}
      >Random</button>
      <button un-bg='blue-5 hover:white' un-mx='30' un-border='rounded blue-5 2' un-text='white lg hover:blue-5' un-p='2'
        onClick={() => {
          setIsInsertingImage(false);
          setIsImageUrlMode(true);
        }}
      >URL</button>
      <button un-bg='blue-5 hover:white' un-mx='30' un-border='rounded blue-5 2' un-text='white lg hover:blue-5' un-p='2'
        onClick={() => {
          setIsInsertingImage(false);
          setIsImageFileMode(true);
        }}
      >File</button>
    </div>
  </Modal>
    {isImageUrlMode &&
      <Modal open footer={null} onCancel={() => setIsImageUrlMode(false)} title='Insert Image' >
        <Form un-mt='6' labelCol={{ span: 5 }} className='[&>div:last-child]:m-0'
          onFinish={values => {
            insertImage(values);
            setIsImageUrlMode(false);
          }}
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
    }
    {isImageFileMode &&
      <Modal open footer={null} onCancel={() => setIsImageFileMode(false)} title='Insert Image'>
        <Form un-mt='6' labelCol={{ span: 5 }} className='[&>div:last-child]:m-0'
          onFinish={values => {
            const { images: { fileList } } = values;
            if (Array.isArray(fileList)) {
              fileList.forEach(image => insertImage({ src: URL.createObjectURL(image.originFileObj), altText: image.name }));
            }
            setIsImageFileMode(false);
          }}
        >
          <Form.Item label='File' name='images' valuePropName='images' rules={[{ required: true, message: 'Please upload image!' }]} >
            <Upload.Dragger listType='picture' accept='image/*' onPreview={() => {}}
              beforeUpload={() => false}
              itemRender={(originalNode, file, _fileList) => {
                return <div>
                  {originalNode}
                  <div un-flex='~' un-gap='1' un-mt='1' un-items='center' >
                    Alt Text:
                    <input un-flex-grow='1' un-border='rounded 2 solid gray-2' un-p='0.5' defaultValue={file.name} onChange={event => file.name = event.target.value} />
                  </div>
                </div>;
              }}
            >
              <span className="i-material-symbols-light:upload" un-text='6xl blue-6' />
              <p>Click or drag file to this area to upload</p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item label={null} wrapperCol={{ offset: 20 }} >
            <Button un-bg='blue-6' type='primary' htmlType='submit' >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    }
    {isInlineImageInsertMode &&
      <Modal open footer={null} onCancel={() => setIsInlineImageInsertMode(false)} title='Insert Inline Image'>
        <Form un-mt='6' labelCol={{ span: 5 }} className='[&>div:last-child]:m-0'
          onFinish={values => {
            const { images: { fileList }, position, showCaption } = values;
            if (Array.isArray(fileList)) {
              editor.dispatchCommand(INSERT_INLINE_IMAGE_COMMAND, { src: URL.createObjectURL(fileList[0].originFileObj), altText: fileList[0].name, position, showCaption });
            }
            setIsInlineImageInsertMode(false);
          }}
        >
          <Form.Item label='File' name='images' valuePropName='images' rules={[{ required: true, message: 'Please upload image!' }]} >
            <Upload.Dragger listType='picture' accept='image/*' onPreview={() => {}} maxCount={1}
              beforeUpload={() => false}
              itemRender={(originalNode, file, _fileList) => {
                return <div>
                  {originalNode}
                  <div un-flex='~' un-gap='1' un-mt='1' un-items='center' >
                    Alt Text:
                    <input un-flex-grow='1' un-border='rounded 2 solid gray-2' un-p='0.5' defaultValue={file.name} onChange={event => file.name = event.target.value} />
                  </div>
                </div>;
              }}
            >
              <span className="i-material-symbols-light:upload" un-text='6xl blue-6' />
              <p>Click or drag file to this area to upload</p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item label='Position' name='position' initialValue={'left'} >
            <Radio.Group optionType='button' block >
              <Radio value='left'>Left</Radio>
              <Radio value='full'>Full Width</Radio>
              <Radio value='right'>Right</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label='Show Caption' name='showCaption' valuePropName='checked' >
            <Checkbox />
          </Form.Item>
          <Form.Item label={null} wrapperCol={{ offset: 20 }} >
            <Button un-bg='blue-6' type='primary' htmlType='submit' >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    }
    <Modal className='w-80!' open={isInsertingTable} footer={null} onCancel={() => setIsInsertingTable(false)} title='Insert Table'>
      <Form un-mt='6' labelCol={{ span: 8 }} className='[&>div:last-child]:m-0'
        onFinish={({ rows, columns }) => {
          editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows, columns });
          setIsInsertingTable(false);
        }}
      >
        <Form.Item label='Rows' name='rows' initialValue={5}
          rules={[{ required: true, message: 'Please input table rows!' }, { type: 'number' }]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item label='Columns' name='columns' initialValue={5}
          rules={[{ required: true, message: 'Please input table columns!' }, { type: 'number' }]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item label={null} wrapperCol={{ offset: 18 }} >
          <Button un-bg='blue-6' type='primary' htmlType='submit' >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
    <Modal open={isInsertingColumnLayout} footer={null} onCancel={() => setIsInsertingColumnLayout(false)} title='Insert Column Layout'>
      <div un-grid='~' un-justify='center' >
        {
          DEFAULT_LAYOUTS.map(item =>
            <button un-w='100' un-p='2' un-grid='~' un-grid-flow='col' un-gap='2' un-border='rounded' un-bg='hover:blue-3' un-auto-cols={`[${item.layout}]`}
              key={item.layout}
              onClick={() => {
                editor.dispatchCommand(INSERT_LAYOUT_COMMAND, item.layout.replaceAll('_', ' '));
                setIsInsertingColumnLayout(false);
              }}
            >
              {
                item.children.map((child, index) => <div key={index} un-border='rounded 2 dashed gray-4' un-text='center' >{child}</div>)
              }
            </button>)
        }
      </div>
    </Modal>
    {
      isInsertEquationMode &&
      <Modal open footer={null} onCancel={() => setIsInsertEquationMode(false)} title='Insert Equation'>
        <Form labelCol={{}} className='[&>div]:m-0'
          onFinish={({ inline, equation }) => {
            editor.dispatchCommand(INSERT_EQUATION_COMMAND, { equation, inline });
            setIsInsertEquationMode(false);
            setEquation('');
          }}
        >
          <Form.Item label='Inline' name='inline' valuePropName='checked' wrapperCol={{ offset: 20 }} >
            <Checkbox />
          </Form.Item>
          <Form.Item label='Equation' name='equation' labelCol={{ span: 24 }}>
            <Input value={equation} onChange={e => setEquation(e.target.value)} />
          </Form.Item>
          <KatexRenderer equation={equation} inline={false} onDoubleClick={() => {}} katexRef={katexRef} />
          <Form.Item label={null} wrapperCol={{ offset: 20 }} >
            <Button un-bg='blue-600' type='primary' htmlType='submit' >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    }
  </>;
};