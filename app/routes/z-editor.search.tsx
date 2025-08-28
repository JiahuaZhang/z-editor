import { useEffect, useState } from 'react';
import { Form, useNavigate, useNavigation, useSearchParams } from "react-router";
import { Badge } from '~/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { ZEditorCard } from '~/components/zeditor/ZEditorCard';
import { createSupabaseServerClient, searchDocuments } from '~/util/supabase.server';
import { Tables } from '~/util/supabase.type';
import { getTagStatistics } from '~/util/tag-stats.server';
import type { Route } from './+types/z-editor.search';

type Document = Tables<'editor_documents'>;

const DEFAULT_DOCUMENTS_PER_PAGE = 10;
const DOCUMENTS_PER_PAGE_OPTIONS = [10, 20];

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('query');
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const perPage = parseInt(url.searchParams.get('perPage') || DEFAULT_DOCUMENTS_PER_PAGE.toString(), 10);
  const documentsPerPage = DOCUMENTS_PER_PAGE_OPTIONS.includes(perPage) ? perPage : DEFAULT_DOCUMENTS_PER_PAGE;
  const offset = (page - 1) * documentsPerPage;
  const selectedTags: string[] = query ? query.match(/#\S+/g) || [] : [];

  // todo, make all Promise awaited at the same time for perfromances
  let tagStatsResult = await getTagStatistics(request, selectedTags.length > 0 ? selectedTags : undefined);
  const tagStats = tagStatsResult.data || [];

  if (query) {
    const result = await searchDocuments(request, query);
    if (result.error) {
      return { error: result.error, status: result.status };
    }

    const allDocuments = result.data as Document[];
    const totalCount = allDocuments.length;
    const documents = allDocuments.slice(offset, offset + documentsPerPage);
    const totalPages = Math.ceil(totalCount / documentsPerPage);

    return {
      documents,
      query,
      currentPage: page,
      totalPages,
      totalCount,
      documentsPerPage,
      selectedTags,
      tagStats
    };
  }

  const { supabase } = createSupabaseServerClient(request);

  const { count } = await supabase
    .from('editor_documents')
    .select('*', { count: 'exact', head: true });

  const { data, error } = await supabase
    .from('editor_documents')
    .select('*')
    .range(offset, offset + documentsPerPage - 1)
    .order('created', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    return { error: 'Failed to fetch documents', status: 500 };
  }

  const totalPages = Math.ceil((count || 0) / documentsPerPage);

  return {
    documents: data as Document[],
    query: '',
    currentPage: page,
    totalPages,
    totalCount: count || 0,
    documentsPerPage,
    selectedTags,
    tagStats
  };
};

export function headers() {
  return {
    "Cache-Control": "max-age=3000, s-maxage=36000",
  };
}

type TagSelectorProps = {
  tagStats: { tag_name: string; document_count: number; }[];
  onTagSelect: (tag: string) => void;
};

const TagSelector = ({ tagStats, onTagSelect }: TagSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTags = tagStats.filter(stat => stat.tag_name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!tagStats.length) return null;

  return (
    <div un-relative="~">
      <input
        type="text"
        placeholder="Add tag"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={event => {
          if (searchTerm && event.key === 'Enter' && filteredTags.length === 1) {
            onTagSelect(filteredTags[0].tag_name);
          }
        }}
        un-px="3" un-py="1" un-text="sm" un-border="~ gray-300" un-rounded="full" un-bg="white hover:gray-50" un-outline="none" un-ring="focus:2 focus:blue-500" un-border-focus="blue-500" un-w="32"
      />
      {isOpen && (
        <div un-absolute="~ top-full left-0" un-mt="1" un-w="120" un-bg="white" un-border="~ gray-200" un-rounded="lg" un-shadow="lg" un-z="50">
          <div un-max-h="70" un-overflow="y-auto" un-p="2">
            {filteredTags.length > 0 ? (
              <div un-flex="~ wrap" un-gap="2">
                {filteredTags.map(stat => (
                  <span
                    key={stat.tag_name}
                    un-inline-flex="~" un-items='center' un-px="2" un-py="1" un-bg="blue-100 hover:blue-800" un-cursor="pointer" un-rounded="full" un-text="sm blue-800 hover:white" un-gap="1" un-whitespace="nowrap"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onTagSelect(stat.tag_name)}
                  >
                    <span>{stat.tag_name}</span>
                    <span un-text="white" un-bg="slate-400" un-px="1" un-border="rounded" un-leading="none">{stat.document_count}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div un-px="3" un-py="4" un-text="center gray-500 sm">
                🔍 No matching tag
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Search = ({ loaderData }: Route.ComponentProps) => {
  const { documents, query, error, currentPage = 1, totalPages = 1, totalCount = 0, documentsPerPage = DEFAULT_DOCUMENTS_PER_PAGE, selectedTags = [], tagStats = [] } = loaderData;
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

  const handlePerPageChange = (newPerPage: number) => {
    const params = new URLSearchParams(searchParams);
    if (newPerPage === DEFAULT_DOCUMENTS_PER_PAGE) {
      params.delete('perPage');
    } else {
      params.set('perPage', newPerPage.toString());
    }
    params.delete('page');

    const queryString = params.toString();
    navigate(`/z-editor/search${queryString ? `?${queryString}` : ''}`);
  };

  const handleAddTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      return;
    }

    const newQuery = `${searchValue?.trim()} ${tag}`;
    navigate(`/z-editor/search?query=${encodeURIComponent(newQuery)}`);
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
      {/* filter by time range */}

      <header un-flex='~' un-px='2' un-items='center' >
        <div un-flex="~ wrap" un-gap="2" un-mb="2" un-mx="2" un-items="center">
          {selectedTags.length > 0 && (
            <>
              {selectedTags.map(tag => (
                <Badge un-cursor='pointer'
                  key={tag}
                  variant="default"
                  deletable={true}
                  onDelete={() => {
                    const newQuery = searchValue?.replace(tag, '').replace(/\s+/, ' ').trim();
                    if (!newQuery || newQuery.trim() === '') {
                      navigate('/z-editor/search');
                    } else {
                      navigate(`/z-editor/search?query=${encodeURIComponent(newQuery)}`);
                    }
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </>
          )}
          <TagSelector tagStats={tagStats} onTagSelect={handleAddTag} />
        </div>
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
          <button un-bg='blue-400 hover:white' un-text='white hover:blue-400' un-p='2' un-px='4' un-border='rounded solid blue-400 2' un-cursor='pointer' un-shadow='sm'
            type="submit"
          >
            OK
          </button>
        </Form>

        <div un-flex="~" un-items='center' un-gap="2" >
          <select
            un-p="1" un-border="blue-400 1 solid rounded" un-bg="white" un-text="sm" un-cursor="pointer"
            value={documentsPerPage}
            onChange={(e) => handlePerPageChange(parseInt(e.target.value, 10))}
          >
            {DOCUMENTS_PER_PAGE_OPTIONS.map((option) => (
              <option
                key={option}
                value={option}>
                {option} / page
              </option>
            ))}
          </select>
        </div>
      </header>
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
            <ZEditorCard document={doc} addTag={handleAddTag} selectedTags={selectedTags} />
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
        <div un-mt="8" un-mb="4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

    </div>
  );
};

export default Search;