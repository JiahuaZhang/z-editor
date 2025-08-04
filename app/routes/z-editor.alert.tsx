import { PostgrestError } from '@supabase/supabase-js';
import { LoaderFunction, useLoaderData } from "react-router";
import { TimeAlert } from '~/components/alert/alert';
import { SerializedTimeNode } from '~/components/zeditor/plugin/time/TimeNode';
import { createSupabaseServerClient } from '~/util/supabase.server';

type LoaderData = {
  data: {
    id: any;
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
    <div un-m="6">
      {data.map(d => <div key={d.id}
        un-flex="~"
        un-gap="4"
        un-items="start"
      >
        {d.reminder.map((r: SerializedTimeNode, i: number) => (
          <TimeAlert key={i} timeNode={r} />
        ))}
      </div>)}
    </div>
  );
};

export default Alert;