import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $patchStyleText } from '@lexical/selection';
import { Select } from 'antd';
import { $getSelection } from 'lexical';
import { lazy, Suspense } from 'react';

const Divider = lazy(() => import('./ToolbarPlugin').then(module => ({ default: module.Divider })));

const FONTS = ['Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Trebuchet MS', 'Verdana'];
const options = FONTS.map(font => ({ label: font, value: font }));

export const FontDropDown = ({ font }: { font: string; }) => {
  const [editor] = useLexicalComposerContext();

  return <Suspense>
    <Select un-min-w='38' options={options} value={font}
      labelRender={value => <div un-flex='~' un-items='center' un-gap='1'  ><span className="i-bi:fonts" /> {value.value} </div>}
      onChange={font => editor.update(() => {
        const selection = $getSelection();
        if (selection === null) return;

        $patchStyleText(selection, { 'font-family': font });
      })} />
    <Divider />
  </Suspense>;
};