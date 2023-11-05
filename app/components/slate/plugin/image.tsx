import { Editor, NodeEntry, Range, Transforms } from 'slate';
import { RenderElementProps, useFocused, useSelected } from 'slate-react';

export const ImageType = 'image';

export const ImageBlock = ({ children, element, attributes }: RenderElementProps) => {
  const isSelected = useSelected();
  const isFocused = useFocused();
  const { url, data } = element as any;

  if (url) {
    return <div {...attributes}>
      {children}
      <div
        contentEditable={false}
        un-position='relative'
        un-z={`${isSelected && isFocused && '1'}`}
      >
        <img
          src={url}
          un-block='~'
          un-shadow={`${isSelected && isFocused && '[0_0_0_3px_#b4d5ff]'}`}
        />
      </div>
    </div>;
  }

  return null;
};

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

// image extentions
["ase", "art", "bmp", "blp", "cd5", "cit", "cpt", "cr2", "cut", "dds", "dib", "djvu", "egt", "exif", "gif", "gpl", "grf", "icns", "ico", "iff", "jng", "jpeg", "jpg", "jfif", "jp2", "jps", "lbm", "max", "miff", "mng", "msp", "nitf", "ota", "pbm", "pc1", "pc2", "pc3", "pcf", "pcx", "pdn", "pgm", "PI1", "PI2", "PI3", "pict", "pct", "pnm", "pns", "ppm", "psb", "psd", "pdd", "psp", "px", "pxm", "pxr", "qfx", "raw", "rle", "sct", "sgi", "rgb", "int", "bw", "tga", "tiff", "tif", "vtf", "xbm", "xcf", "xpm", "3dv", "amf", "ai", "awg", "cgm", "cdr", "cmx", "dxf", "e2d", "egt", "eps", "fs", "gbr", "odg", "svg", "stl", "vrml", "x3d", "sxd", "v2d", "vnd", "wmf", "emf", "art", "xar", "png", "webp", "jxr", "hdp", "wdp", "cur", "ecw", "iff", "lbm", "liff", "nrrd", "pam", "pcx", "pgf", "sgi", "rgb", "rgba", "bw", "int", "inta", "sid", "ras", "sun", "tga"];

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