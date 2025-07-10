import { ActionFunction, LoaderFunction, useLoaderData } from "react-router";
import { createSupabaseServerClient } from '~/util/supabase.server';

export const loader: LoaderFunction = async ({ request }) => {
  const { supabase } = createSupabaseServerClient(request);
  const { data, error } = await supabase.from('editor_documents')
    .select('id, reminder')
    .gt('reminder->0', 'null');
  return { data, error };
};

const Alert = () => {
  const { data, error } = useLoaderData<typeof loader>();

  if (error) {
    console.error('Error fetching documents:', error);
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <div>No data</div>;
  }

  console.log(data);


  return <div>Alert</div>;
};

export default Alert;