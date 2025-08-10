import { useEffect, useState } from 'react';
import { LoaderFunction, ShouldRevalidateFunction, useFetcher, useLoaderData, useNavigate, useNavigation, type MetaFunction } from "react-router";
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
  const { supabase } = createSupabaseServerClient(request);

  const { data, error } = await supabase
    .from('editor_documents')
    .select('*');
  // .range(0, 10)
  // .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    return { error: 'Failed to fetch documents', status: 500 };
  }

  return { documents: data as Document[] };
};

export const shouldRevalidate: ShouldRevalidateFunction = ({ formMethod, defaultShouldRevalidate }) => {
  if (formMethod === 'POST') {
    return false;
  }
  return defaultShouldRevalidate;
};

const Search = () => {
  const { documents, error } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const { state } = useNavigation();
  const fetcher = useFetcher();
  const [displayDocuments, setDisplayDocuments] = useState<Document[]>([]);

  useEffect(() => setDisplayDocuments(documents), [documents]);

  useEffect(() => {
    if (fetcher.data) {
      setDisplayDocuments(fetcher.data.data as Document[]);
    }
  }, [fetcher.data]);

  if (state === 'loading') {
    return (
      <div un-text="center" un-p="14">
        <span className="i-mdi:loading" un-animate='spin' un-text="5xl blue-500" aria-label="Loading documents" />
      </div>
    );
  }

  if (error) {
    return <div un-text="center" un-p="14">
      <h1 un-text="red-500 lg">{error}</h1>
      <button
        onClick={() => navigate(0)}
        un-grid='~' un-mx='auto' un-grid-flow='col' un-justify='center' un-items='center' un-gap='2' un-mt='4'
        un-p="1" un-px="4" un-bg="blue-500 hover:white" un-text="white hover:blue-500" un-rounded="md" un-cursor="pointer"
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
      <fetcher.Form un-shadow="g" un-m='2' un-mx='auto' un-grid='~' un-grid-flow='col' un-justify='center' un-gap='2'
        method="post"
        action="/api/document/search"
        onSubmit={event => {
          if (event.currentTarget.search.value === '') {
            event.preventDefault();
            setDisplayDocuments(documents);
          }
        }}
      >
        <input un-p='2' un-px='4' un-border='gray-200 1 solid rounded focus:blue-400' un-outline='none'
          autoFocus
          type="text"
          name="search"
          placeholder="Search..."
        />
        {/* todo: dropdown in future */}
        <button un-bg='blue-400 hover:white' un-text='white hover:blue-400' un-p='2' un-px='4' un-border='rounded solid blue-400 2' un-cursor='pointer' un-shadow='sm'
          type="submit"
        >
          OK
        </button>
      </fetcher.Form>
      {
        fetcher.state === 'submitting' && (
          <div un-text="center" un-m='4'>
            <span className="i-mdi:loading" un-animate-spin='~' un-text="5xl blue-500" aria-label="Loading" />
          </div>
        )
      }
      <ul un-ml='4' un-flex='~ wrap' un-gap='4'>
        {displayDocuments.map((doc) => (
          <li key={doc.id} >
            <ZEditorCard document={doc} />
          </li>
        ))}
      </ul>
      {
        displayDocuments.length === 0 && (
          <div un-text="center" un-p="14">
            <h1 un-text="gray-500 lg">No documents found</h1>
          </div>
        )
      }
    </div>
  );
};

export default Search;