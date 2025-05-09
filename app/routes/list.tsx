import { LoaderFunction, useLoaderData, useNavigate } from 'react-router';
import { ZEditorCard } from '~/components/zeditor/ZEditorCard';
import { createSupabaseServerClient } from '~/util/supabase.server';
import { Tables } from '../util/supabase.type';

type Document = Tables<'editor_documents'>;

type LoaderData = {
  documents: Document[];
  error?: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const { supabase, getHeaders } = createSupabaseServerClient(request);

  const { data, error } = await supabase
    .from('editor_documents')
    .select('*');

  if (error) {
    console.error('Error fetching documents:', error);
    return { error: 'Failed to fetch documents', status: 500 };
  }

  console.log({ data, error });
  return { documents: data as Document[] };
};

const List = () => {
  const navigate = useNavigate();
  const { documents, error } = useLoaderData<LoaderData>();

  if (error) {
    return <div un-text="center" un-p="14">
      <h1 un-text="red-500 lg">{error}</h1>
      <button
        onClick={() => navigate(0)}
        un-grid='~' un-mx='auto' un-grid-flow='col' un-justify='center' un-items='center' un-gap='2' un-mt='4'
        un-p="1" un-px="4" un-bg="blue-5 hover:white" un-text="white hover:blue-5" un-rounded="md" un-cursor="pointer"
      >
        <span className="i-material-symbols-light:refresh" un-text='lg' />
        Retry
      </button>
    </div>;
  }

  return (
    <div>
      <ul un-mt='16' un-mx='8' un-grid='~' >
        {documents.map((doc) => (
          <li key={doc.id} >
            <ZEditorCard document={doc} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default List;