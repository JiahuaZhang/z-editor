import { RenderElementProps, useFocused, useSelected } from 'slate-react';

export const ImageType = 'image';

export const ImageBlock = ({ children, element, attributes }: RenderElementProps) => {
  // const editor = useSlateStatic();
  // const readOnly = useReadOnly();
  const isSelected = useSelected();
  const isFocused = useFocused();
  const { url, data } = element as any;

  if (url) {
    return <div
      {...attributes}>
      {children}
      <div
        un-position='relative'
      >
        <img
          contentEditable={false}
          src={url}
          un-block='~'
          // un-w='100%'
          // un-h='20em'
          un-shadow={`${isSelected && isFocused && '[0_0_0_3px_#b4d5ff]'}`}
        />
      </div>
    </div>;
  }

  return null;
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