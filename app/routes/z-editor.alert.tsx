import { PostgrestError } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import { LoaderFunction, useLoaderData } from "react-router";
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

const TimeAlert = ({ timeNode }: { timeNode: SerializedTimeNode; }) => {
  const { date, time, format } = timeNode;
  const dateObj = dayjs(date);
  const timeObj = dayjs(time);
  console.log(dateObj, timeObj);

  return (
    <div un-flex="~ items-center"
      un-gap="3"
      un-border="2 solid slate-3 rounded-lg hover:slate-5"
      un-p='2'
      un-px='3'
      un-shadow="sm hover:2xl"
      un-transition="all duration-200"
      un-cursor="pointer"
    >
      {
        format === 'both' && <div un-flex="~ items-center"
          un-gap="1"
          un-px="2"
          un-py="1"
          un-border='rounded'
          un-bg="gradient-to-br"
          un-from='purple-4'
          un-to='purple-6'
        >
          <span className="i-mdi:calendar-month"
            un-text="2xl white"
            aria-label="Date"
            role="img"
          />
          <span un-text="white" un-font="semibold">{dateObj.format('DD/MM/YYYY')}</span>
        </div>
      }

      <div un-flex="~ items-center"
        un-gap="1"
        un-border='rounded'
        un-px="2"
        un-py="1"
        un-bg="gradient-to-br"
        un-from='blue-4'
        un-to='blue-6'
      >
        <span className="i-material-symbols-light:schedule"
          un-text="2xl white"
          aria-label="Time"
          role="img"
        />
        <span un-text="white">{timeObj.format('hh:mm:ss A')}</span>
      </div>
    </div>
  );
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
    <div
      un-p="6"
      un-space="y-6"
      un-flex="~ col"
      un-items="start"
    >
      {data.map(d => (
        <div
          key={d.id}
          un-flex="~ col"
          un-gap="4"
          un-items="start"
          un-w="full"
        >
          {d.reminder.map((r: SerializedTimeNode, i: number) => (
            <TimeAlert key={i} timeNode={r} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Alert;