import { PostgrestError } from '@supabase/supabase-js';
import { LoaderFunction, useLoaderData } from "react-router";
import { Reminder, SerializedTimeNode } from '~/components/zeditor/plugin/time/TimeNode';
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

  console.log(data);
  return <div>
    {
      data.map(d => <div key={d.id}>
        {d.reminder.map((r: SerializedTimeNode, i: number) => <div key={i}>
          {r.date} {r.time} {r.format} {r.reminders.map((r: Reminder) => <div key={r.type}>{r.type}</div>)}
        </div>)}
      </div>)
    }
  </div>;
};

export default Alert;