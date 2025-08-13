import { useEffect, useState } from 'react';
import { Form, LoaderFunction, useLoaderData, useNavigate, useNavigation, useSearchParams, type MetaFunction } from "react-router";
import { ZEditorCard } from '~/components/zeditor/ZEditorCard';
import { createSupabaseServerClient, searchDocuments } from '~/util/supabase.server';
import { Tables } from '~/util/supabase.type';

type Document = Tables<'editor_documents'>;

type LoaderData = {
  documents: Document[];
  query?: string;
  error?: string;
};

export const meta: MetaFunction = () => [{ title: "Search" }, { name: "description", content: "Search documents" }];

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('query');

  if (query) {
    const result = await searchDocuments(request, query);
    if (result.error) {
      return { error: result.error, status: result.status };
    }
    return { documents: result.data as Document[], query };
  }

  const { supabase } = createSupabaseServerClient(request);
  const { data, error } = await supabase
    .from('editor_documents')
    .select('*');

  if (error) {
    console.error('Error fetching documents:', error);
    return { error: 'Failed to fetch documents', status: 500 };
  }

  return { documents: data as Document[], query: '' };
};

const Search = () => {
  const { documents, query, error } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const { state } = useNavigation();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(query);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchQuery = formData.get('search') as string;

    if (searchQuery.trim() === '') {
      navigate('/z-editor/search');
    } else {
      navigate(`/z-editor/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  useEffect(() => {
    const urlQuery = searchParams.get('query');
    setSearchValue(urlQuery ?? '');
  }, [searchParams]);

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
      <Form un-shadow="g" un-m='2' un-mx='auto' un-grid='~' un-grid-flow='col' un-justify='center' un-gap='2'
        onSubmit={handleSearch}
      >
        <input un-p='2' un-px='4' un-border='gray-200 1 solid rounded focus:blue-400' un-outline='none'
          autoFocus
          type="text"
          name="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search..."
        />
        {/* todo: dropdown in future */}
        <button un-bg='blue-400 hover:white' un-text='white hover:blue-400' un-p='2' un-px='4' un-border='rounded solid blue-400 2' un-cursor='pointer' un-shadow='sm'
          type="submit"
        >
          OK
        </button>
      </Form>
      {
        state === 'submitting' && (
          <div un-text="center" un-m='4'>
            <span className="i-mdi:loading" un-animate-spin='~' un-text="5xl blue-500" aria-label="Loading" />
          </div>
        )
      }
      <ul un-ml='4' un-flex='~ wrap' un-gap='4'>
        {documents.map((doc) => (
          <li key={doc.id} >
            <ZEditorCard document={doc} />
          </li>
        ))}
      </ul>
      {
        documents.length === 0 && (
          <div un-text="center" un-p="14">
            <h1 un-text="gray-500 lg">
              {query ? 'No documents found for your search' : 'No documents found'}
            </h1>
          </div>
        )
      }
    </div>
  );
};

export default Search;