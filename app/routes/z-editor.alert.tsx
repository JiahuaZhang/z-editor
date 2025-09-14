import { PostgrestError } from '@supabase/supabase-js';
import { Link, LoaderFunction, useLoaderData } from "react-router";
import { TimeAlert } from '~/components/alert/alert';
import { SerializedTimeNode } from '~/components/zeditor/plugin/time/TimeNode';
import { createSupabaseServerClient } from '~/util/supabase.server';

type LoaderData = {
  data: {
    id: string;
    reminder: SerializedTimeNode[];
  }[] | null;
  error: PostgrestError | null;
};

export const loader: LoaderFunction = async ({ request }): Promise<LoaderData> => {
  const { supabase } = createSupabaseServerClient(request);
  const { data, error } = await supabase.from('editor_documents')
    .select('id, reminder')
    .gt('reminder->0', 'null');
  return { data, error };
};

const Alert = () => {
  const { data, error } = useLoaderData<LoaderData>();

  if (error) {
    return <div>Postgrest Error: {error.message} - {error.code}</div>;
  }

  if (!data) {
    return <div>No alert</div>;
  }

  return (
    <div un-m="4" un-flex='~ wrap' un-gap='4'>
      {data.map(d => <div key={d.id}
        un-border='2 solid stone-100 rounded'
        un-bg='stone-50'
        un-p='2'
        un-flex="~ col"
        un-gap="2"
        un-h="fit"
      >
        {d.reminder.map((r: SerializedTimeNode, i: number) => (<div key={`${d.id}-${i}`}
          un-flex='~'
          un-justify='between'
          un-items='center'
          un-gap='2'
        >
          <TimeAlert timeNode={r} />
          {
            i === 0 && <Link className="group" un-flex='' un-justify='' un-px='2' un-py='1' un-bg='hover:blue-500'
              un-border='rounded'
              prefetch='render'
              to={`/z-editor/${d.id}`}>
              <span className="i-tabler-external-link" un-text='2xl blue-500 group-hover:white' />
            </Link>
          }
        </div>
        ))}
      </div>)}
    </div>
  );
};

export default Alert;