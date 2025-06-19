import { LoaderFunction, useLoaderData, useNavigate, useRouteLoaderData, type MetaFunction } from "react-router";
import { ZEditorCard } from '~/components/zeditor/ZEditorCard';
import { createSupabaseServerClient } from '~/util/supabase.server';
import { Tables } from '~/util/supabase.type';

type Document = Tables<'editor_documents'>;

type LoaderData = {
  documents: Document[];
  error?: string;
};

export const meta: MetaFunction = () => [{ title: "Search" }, { name: "description", content: "Search documents" }];

export const loader: LoaderFunction = async ({ request }) => {
  const { supabase, headers } = createSupabaseServerClient(request);

  const { data, error } = await supabase
    .from('editor_documents')
    .select('*');

  if (error) {
    console.error('Error fetching documents:', error);
    return { error: 'Failed to fetch documents', status: 500 };
  }

  return { documents: data as Document[] };
};

const Search = () => {
  const { documents, error } = useLoaderData<LoaderData>();
  const { user } = useRouteLoaderData('routes/z-editor');
  const navigate = useNavigate();

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
      <h1 un-mt='2' un-text="2xl center" un-mb="4">Search Documents</h1>
      <ul un-ml='4' un-grid='~' un-grid-flow='col' un-justify='start' un-gap='4'>
        {documents.map((doc) => (
          <li key={doc.id} >
            <ZEditorCard document={doc} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;