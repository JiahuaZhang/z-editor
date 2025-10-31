import { useEffect, useState } from 'react';
import { Form, useNavigate, useNavigation } from "react-router";
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
import { AdvancedSearchResult } from '~/service/document.search.server';
import { ExtraDateFilter } from '../filter/date-filter-section';

export const SearchPage = (arg: AdvancedSearchResult) => {
  const { searchParams: { query, tag, page, perPage, offset }, documents, totalPages, totalCount, tagStat } = arg;
  const navigate = useNavigate();
  const { state } = useNavigation();
  const [searchValue, setSearchValue] = useState(query);
  const [tags, setTags] = useState(tag);
  const [currentPage, setCurrentPage] = useState(page);
  const [currentPerPage, setCurrentPerPage] = useState(perPage);
  const [hasExtraConfig, setHasExtraConfig] = useState(false);
  const [needUpdate, setNeedUpdate] = useState(false);

  const update = () => {
    let url = '/z-editor/search';
    const query: string[] = [];

    if (searchValue) {
      query.push(`query=${encodeURIComponent(searchValue)}`);
    }

    if (tags.length) {
      query.push(`tag=${tags.join(',')}`);
    }

    if (currentPage > 1) {
      query.push(`page=${currentPage}`);
    }

    if (currentPerPage !== DEFAULT_DOCUMENTS_PER_PAGE) {
      query.push(`perPage=${currentPerPage}`);
    }

    if (query.length) {
      navigate(`${url}?${query.join('&')}`);
    } else {
      navigate(url);
    }
  };

  useEffect(() => {
    if (!needUpdate) return;

    update();
    setNeedUpdate(false);
  }, [needUpdate]);

  return (
    <div>
      <title>Search</title>

      <header>
        <div un-flex='~' un-px='2' un-items='center' >
          <div un-flex="~ wrap" un-gap="2" un-mx="2" un-items="center">
            {tags.length > 0 && (
              <>
                {tags.map(tag => (
                  <Badge un-cursor='pointer'
                    key={tag}
                    variant="default"
                    deletable={true}
                    onDelete={() => {
                      setTags(prev => prev.filter(t => t !== tag));
                      setNeedUpdate(true);
                    }}
                  >
                    #{tag}
                  </Badge>
                ))}
              </>
            )}
            <TagSelector tagStats={tagStat} onTagSelect={tag => {
              setTags(prev => [...prev, tag]);
              setNeedUpdate(true);
            }} />
          </div>
          <Form un-shadow="g" un-mx='auto' un-grid='~' un-grid-flow='col' un-justify='center' un-gap='2'
            onSubmit={event => {
              event.preventDefault();
              setNeedUpdate(true);
            }}
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
              value={currentPerPage}
              onChange={(e) => {
                setCurrentPerPage(parseInt(e.target.value, 10));
                setCurrentPage(1);
                setNeedUpdate(true);
              }}
            >
              {DOCUMENTS_PER_PAGE_OPTIONS.map((option) => (
                <option key={option}
                  value={option}>
                  {option} / page
                </option>
              ))}
            </select>
          </div>
        </div>

        <ExtraDateFilter />
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
            <ZEditorCard document={doc} addTag={tag => {
              if (tags.includes(tag)) return;

              setTags(prev => [...prev, tag]);
              setNeedUpdate(true);
            }} selectedTags={tag} />
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
                  onClick={() => {
                    setCurrentPage(prev => prev - 1);
                    setNeedUpdate(true);
                  }}
                  disabled={currentPage === 1}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => {
                      setCurrentPage(page);
                      setNeedUpdate(true);
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => {
                    setCurrentPage(prev => prev + 1);
                    setNeedUpdate(true);
                  }}
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
