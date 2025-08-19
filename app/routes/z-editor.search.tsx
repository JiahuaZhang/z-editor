import { useEffect, useState } from 'react';
import { Form, useNavigate, useNavigation, useSearchParams } from "react-router";
import { ZEditorCard } from '~/components/zeditor/ZEditorCard';
import { createSupabaseServerClient, searchDocuments } from '~/util/supabase.server';
import { Tables } from '~/util/supabase.type';
import type { Route } from './+types/z-editor.search';

type Document = Tables<'editor_documents'>;

const DOCUMENTS_PER_PAGE = 5;

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('query');
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const offset = (page - 1) * DOCUMENTS_PER_PAGE;

  if (query) {
    const result = await searchDocuments(request, query);
    if (result.error) {
      return { error: result.error, status: result.status };
    }

    const allDocuments = result.data as Document[];
    const totalCount = allDocuments.length;
    const documents = allDocuments.slice(offset, offset + DOCUMENTS_PER_PAGE);
    const totalPages = Math.ceil(totalCount / DOCUMENTS_PER_PAGE);

    return {
      documents,
      query,
      currentPage: page,
      totalPages,
      totalCount
    };
  }

  const { supabase } = createSupabaseServerClient(request);

  const { count } = await supabase
    .from('editor_documents')
    .select('*', { count: 'exact', head: true });

  const { data, error } = await supabase
    .from('editor_documents')
    .select('*')
    .range(offset, offset + DOCUMENTS_PER_PAGE - 1)
    .order('created', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    return { error: 'Failed to fetch documents', status: 500 };
  }

  const totalPages = Math.ceil((count || 0) / DOCUMENTS_PER_PAGE);

  return {
    documents: data as Document[],
    query: '',
    currentPage: page,
    totalPages,
    totalCount: count || 0
  };
};

const Search = ({ loaderData }: Route.ComponentProps) => {
  const { documents, query, error, currentPage, totalPages, totalCount } = loaderData;
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

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }

    const queryString = params.toString();
    navigate(`/z-editor/search${queryString ? `?${queryString}` : ''}`);
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
      <title>Search</title>
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
        {documents?.map((doc) => (
          <li key={doc.id} >
            <ZEditorCard document={doc} />
          </li>
        ))}
      </ul>
      {
        documents?.length === 0 && (
          <div un-text="center" un-p="14">
            <h1 un-text="gray-500 lg">
              {query ? 'No documents found for your search' : 'No documents found'}
            </h1>
          </div>
        )
      }

      {totalPages > 1 && (
        <div un-flex="~ justify-center items-center" un-gap="2" un-mt="8" un-mb="4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            un-p="2" un-px="3" un-border="rounded solid gray-300 1"
            un-bg="white hover:gray-50 disabled:gray-100"
            un-text="gray-700 disabled:gray-400"
            un-cursor="pointer disabled:not-allowed"
            un-disabled="opacity-50"
          >
            ←
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              un-p="2" un-px="3" un-border="rounded solid gray-300 1"
              un-bg={currentPage === page ? "blue-500" : "white hover:gray-50"}
              un-text={currentPage === page ? "white" : "gray-700"}
              un-cursor="pointer"
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            un-p="2" un-px="3" un-border="rounded solid gray-300 1"
            un-bg="white hover:gray-50 disabled:gray-100"
            un-text="gray-700 disabled:gray-400"
            un-cursor="pointer disabled:not-allowed"
            un-disabled="opacity-50"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

export default Search;