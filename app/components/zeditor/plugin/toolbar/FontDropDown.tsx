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
    <Select options={options} value={font} popupClassName='w-40!' className='[&>div]:(pr-0! pl-1!) [&>span]:(mr--1.5!)'
      disabled={!editor.isEditable()}
      labelRender={_ => <div un-flex='~' ><span className="i-bi:fonts" un-text='lg' /> </div>}
      onChange={font => editor.update(() => {
        const selection = $getSelection();
        if (selection === null) return;

        $patchStyleText(selection, { 'font-family': font });
      })} />
    <Divider />
  </Suspense>;
};