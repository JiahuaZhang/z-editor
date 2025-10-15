import { DEFAULT_DOCUMENTS_PER_PAGE } from '~/lib/constant';
import { getTagStatistics, type TagStat } from '~/service/tag-stats.server';
import { Tables } from '~/util/supabase.type';
import { createSupabaseServerClient, searchDocuments } from './supabase.server';

type Document = Tables<'editor_documents'>;

export type SearchResult = {
  documents: Document[];
  query: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  documentsPerPage: number;
  selectedTags: string[];
  tagStats: TagStat[];
  error?: never;
  status?: never;
} | {
  error: string;
  status: number;
  documents?: never;
  query?: never;
  currentPage?: never;
  totalPages?: never;
  totalCount?: never;
  documentsPerPage?: never;
  selectedTags?: never;
  tagStats?: never;
};

export async function getDocumentsWithPagination(request: Request): Promise<SearchResult> {
  const url = new URL(request.url);
  const query = url.searchParams.get('query');
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const documentsPerPage = parseInt(url.searchParams.get('perPage') || DEFAULT_DOCUMENTS_PER_PAGE.toString(), 10);
  const offset = (page - 1) * documentsPerPage;
  const selectedTags: string[] = query ? query.match(/#\S+/g) || [] : [];

  const tagStatsResult = await getTagStatistics(request, selectedTags.length > 0 ? selectedTags : undefined);
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
    .order('updated', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    return { error: 'Failed to fetch documents', status: 500 };
  }

  const totalPages = Math.ceil((count ?? 0) / documentsPerPage);

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
}

export type DateFilter = { at: Date; }
  | { before: Date; }
  | { after: Date; }
  | { from: Date; to: Date; }
  | { around: Date; days: number; }
  | { lastDays: number; };

export type SearchParams = {
  query: string;
  tag: string[];
  created?: DateFilter;
  updated?: DateFilter;
  alert?: DateFilter;
  page: number;
  perPage: number;
  offset: number;
};

const parseDate = (dateStr: string): Date | null => {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

const parseDateFilter = (url: URL, fieldName: string): DateFilter | undefined => {
  const atParam = url.searchParams.get(fieldName);
  const beforeParam = url.searchParams.get(`${fieldName}_before`);
  const afterParam = url.searchParams.get(`${fieldName}_after`);
  const fromParam = url.searchParams.get(`${fieldName}_from`);
  const toParam = url.searchParams.get(`${fieldName}_to`);

  if (atParam) {
    const date = parseDate(atParam);
    if (date) return { at: date };
  }

  if (beforeParam) {
    const date = parseDate(beforeParam);
    if (date) return { before: date };
  }

  if (afterParam) {
    const date = parseDate(afterParam);
    if (date) return { after: date };
  }

  if (fromParam && toParam) {
    const fromDate = parseDate(fromParam);
    const toDate = parseDate(toParam);
    if (fromDate && toDate) return { from: fromDate, to: toDate };
  }

  return undefined;
};

export const getSearchParams = (request: Request): SearchParams => {
  const url = new URL(request.url);
  const query = url.searchParams.get('query') ?? '';
  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  const perPage = parseInt(url.searchParams.get('perPage') ?? DEFAULT_DOCUMENTS_PER_PAGE.toString(), 10);
  const offset = (page - 1) * perPage;
  const tag = (url.searchParams.get('tag') ?? '').split(',').filter(Boolean);

  const created = parseDateFilter(url, 'created');
  const updated = parseDateFilter(url, 'updated');
  const alert = parseDateFilter(url, 'alert');

  return {
    query,
    tag,
    created,
    updated,
    alert,
    page,
    perPage,
    offset,
  };
};
