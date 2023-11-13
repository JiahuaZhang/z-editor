import { Image } from 'antd';
import { useRef, useState } from 'react';
import { Editor, Node, NodeEntry, Path, Range, Transforms } from 'slate';
import { ReactEditor, RenderElementProps, useFocused, useSelected, useSlateStatic } from 'slate-react';
import { isUrl } from '../util';

export const ImageType = 'image';

export const ImageBlock = ({ children, element, attributes }: RenderElementProps) => {
  const isSelected = useSelected();
  const isFocused = useFocused();
  const editor = useSlateStatic();
  const ref = useRef<HTMLDivElement>(null);
  const { url } = element as any;
  const [preview, setPreview] = useState({ visible: false });

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!ref.current) return;

    const getInsertPath = () => {
      const rect = ref.current!.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const path = ReactEditor.findPath(editor, element);
      const insertBefore = event.clientX < centerX || event.clientY < centerY;
      return insertBefore ? path : Path.next(path);
    };

    const { files } = event.dataTransfer;
    if (files.length > 0) {
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          Transforms.insertNodes(editor, await fileToImageNode(file), { at: getInsertPath() });
        }
      }
    }
  };

  return <div
    contentEditable={false}
    onDrop={handleDrop}
    {...attributes}
    ref={ref}
  >
    {children}
    <Image
      onClick={event => {
        event.stopPropagation();
        const path = ReactEditor.findPath(editor, element);
        Transforms.select(editor, path);
      }}
      src={url}
      un-cursor='pointer'
      un-shadow={`${isSelected && isFocused && '[0_0_0_3px_#b4d5ff]'}`}
      preview={{
        ...preview,
        onVisibleChange: () => setPreview({ visible: false }),
        mask: null,
        getContainer: () => ref.current!
      }}
      onDoubleClick={() => setPreview({ visible: true })}
    />
  </div>;
};

export const fileToImageNode = (file: File) => new Promise<Node>((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve({
    type: ImageType,
    url: reader.result,
    children: [{ text: '' }],
  } as Node);
  reader.onerror = error => reject(error);
});

export const onKeyDown = (event: React.KeyboardEvent, editor: Editor) => {
  if (event.key === 'Enter') {
    const [match] = Editor.nodes(editor, {
      match: n => (n as any)?.type === ImageType,
    });

    if (match) {
      event.preventDefault();
      Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }], });
      return true;
    }
  } else if (event.key === 'Backspace') {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const [match] = Editor.nodes(editor, {
        match: n => (n as any)?.type === 'paragraph',
        mode: 'highest',
      });

      if (match) {
        const [_paragraph, path] = match;

        if (Editor.string(editor, path) === '' && Editor.previous(editor, { at: path })) {
          const [previousNode, previousPath] = Editor.previous(editor, { at: path }) as NodeEntry;
          if ((previousNode as any)?.type === ImageType) {
            event.preventDefault();
            Transforms.removeNodes(editor, { at: path });
            Transforms.select(editor, previousPath);
            return true;
          }
        }
      }
    }
  }
  return false;
};

const extensions = ["ase", "art", "bmp", "blp", "cd5", "cit", "cpt", "cr2", "cut", "dds", "dib", "djvu", "egt", "exif", "gif", "gpl", "grf", "icns", "ico", "iff", "jng", "jpeg", "jpg", "jfif", "jp2", "jps", "lbm", "max", "miff", "mng", "msp", "nitf", "ota", "pbm", "pc1", "pc2", "pc3", "pcf", "pcx", "pdn", "pgm", "PI1", "PI2", "PI3", "pict", "pct", "pnm", "pns", "ppm", "psb", "psd", "pdd", "psp", "px", "pxm", "pxr", "qfx", "raw", "rle", "sct", "sgi", "rgb", "int", "bw", "tga", "tiff", "tif", "vtf", "xbm", "xcf", "xpm", "3dv", "amf", "ai", "awg", "cgm", "cdr", "cmx", "dxf", "e2d", "egt", "eps", "fs", "gbr", "odg", "svg", "stl", "vrml", "x3d", "sxd", "v2d", "vnd", "wmf", "emf", "art", "xar", "png", "webp", "jxr", "hdp", "wdp", "cur", "ecw", "iff", "lbm", "liff", "nrrd", "pam", "pcx", "pgf", "sgi", "rgb", "rgba", "bw", "int", "inta", "sid", "ras", "sun", "tga"];

export const handlePasteOnImageUrl = (url: string, editor: Editor) => {
  if (!isUrl(url)) return false;

  const extention = new URL(url).pathname.split('.').pop() || '';
  if (extensions.includes(extention)) {
    Transforms.insertNodes(editor, { type: ImageType, url, children: [{ text: '' }] } as Node);
    return true;
  }

  // todo: strange bug
  // for async checking, event.preventDefault won't be working as expected
  // seems like onPaste hanlder won't wait at all...
  // if (await isImageUrl(url)) {
  //   Transforms.insertNodes(editor, { type: ImageType, url, children: [{ text: '' }] } as Node);
  //   return true;
  // }

  return false;
};

const isImageUrl = async (url: string) => {
  const response = await fetch(url, { method: 'HEAD' });
  const contentType = response.headers.get('content-type');
  return contentType && contentType.startsWith('image/');
};

export const dummyData = [
  {
    type: ImageType,
    url: 'https://source.unsplash.com/kFrdX5IeQzI',
    children: [{ text: '' }],
  },
  {
    type: ImageType,
    url: 'https://source.unsplash.com/zOwZKwZOZq8',
    children: [{ text: '' }],
  },
];