import { useEffect, useState } from 'react';
import { Form, useNavigate, useNavigation, useSearchParams } from "react-router";
import { TagSelector } from '~/components/search/tag-selector';
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
import { DEFAULT_DOCUMENTS_PER_PAGE, DOCUMENTS_PER_PAGE_OPTIONS } from '~/lib/constant';
import { getDocumentsWithPagination } from '~/service/document.search.server';
import type { Route } from './+types/z-editor.search';

export const loader = async ({ request }: Route.LoaderArgs) => getDocumentsWithPagination(request);

const Search = ({ loaderData }: Route.ComponentProps) => {
  const { documents, query, error, currentPage = 1, totalPages = 1, documentsPerPage = DEFAULT_DOCUMENTS_PER_PAGE, selectedTags = [], tagStats = [] } = loaderData;
  const navigate = useNavigate();
  const { state } = useNavigation();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(query);
  const [hasExtraConfig, setHasExtraConfig] = useState(false);

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

      <header>
        <div un-flex='~' un-px='2' un-items='center' >
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

          <div un-flex="~" un-items='center' un-gap="1" >
            <button un-flex='~ items-center' un-p='2' un-border='rounded' un-bg={`${hasExtraConfig && 'blue-400'}`}
              onClick={() => setHasExtraConfig(prev => !prev)} >
              <span className="i-mdi:cog" un-text={`lg ${hasExtraConfig && 'white'}`} un-cursor='pointer' />
            </button>
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