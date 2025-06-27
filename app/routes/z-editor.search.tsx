import { ActionFunction, LoaderFunction, useFetcher, useLoaderData, useNavigate, useRouteLoaderData, type MetaFunction } from "react-router";
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

export const action: ActionFunction = async ({ request, params }) => {
  return 'good';
};

const Search = () => {
  const { documents, error } = useLoaderData<LoaderData>();
  const { user } = useRouteLoaderData('routes/z-editor');
  const navigate = useNavigate();
  const fetcher = useFetcher();

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
      {/* todo: search by # hashtag */}
      {/* possibly elastic search alike */}
      {/* filter by time range */}
      <fetcher.Form method="post" un-shadow="g" un-m='2' un-mx='auto' un-grid='~' un-grid-flow='col' un-justify='center' un-gap='2'>
        <input un-p='2' un-px='4' un-border='gray-2 1 solid rounded focus:blue-4' un-outline='none'
          autoFocus
          type="text"
          name="search"
          placeholder="Search..."
        />
        {/* todo: dropdown in future */}
        <button un-bg='blue-4 hover:white' un-text='white hover:blue-4' un-p='2' un-px='4' un-border='rounded solid blue-4 2' un-cursor='pointer' un-shadow='sm'
          type="submit"
        >
          OK
        </button>
      </fetcher.Form>
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