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

export type AdvancedSearchResult = {
  documents: Document[];
  totalPages: number;
  totalCount: number;
  searchParams: SearchParams;
} | {
  error: string;
  status: number;
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
  word: string[];
  phrase: string[];
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

const extractWordsAndPhrases = (query: string): { word: string[]; phrase: string[]; } => {
  const word: string[] = [];
  const phrase: string[] = [];

  const phraseRegex = /"([^"]+)"/g;
  let remainingQuery = query;

  let match;
  while ((match = phraseRegex.exec(remainingQuery)) !== null) {
    phrase.push(match[1]);
  }
  remainingQuery = remainingQuery.replace(phraseRegex, '');
  word.push(...remainingQuery.trim().split(/\s+/).filter(Boolean));

  return { word, phrase };
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

  const { word, phrase } = extractWordsAndPhrases(query);
  const created = parseDateFilter(url, 'created');
  const updated = parseDateFilter(url, 'updated');
  const alert = parseDateFilter(url, 'alert');

  return {
    word,
    phrase,
    tag,
    created,
    updated,
    alert,
    page,
    perPage,
    offset,
  };
};

export async function advanceSearch(request: Request, searchParams: SearchParams): Promise<AdvancedSearchResult> {
  const { supabase } = createSupabaseServerClient(request);

  let textSearchIds: string[] = [];
  let hasTextSearch = false;
  if (searchParams.word.length > 0 || searchParams.phrase.length > 0) {
    hasTextSearch = true;
    const { data: searchIds, error: searchError } = await supabase.rpc('search_document_content', {
      word_array: searchParams.word,
      phrase_array: searchParams.phrase
    });

    if (searchError) {
      console.error('Error in text search:', searchError);
      return { error: 'Failed to perform text search', status: 500 };
    }

    textSearchIds = searchIds ?? [];

    if (textSearchIds.length === 0) {
      return {
        documents: [],
        totalPages: 0,
        totalCount: 0,
        searchParams
      };
    }
  }

  let query = supabase.from('editor_documents').select('*', { count: 'exact' });

  if (hasTextSearch && textSearchIds.length > 0) {
    query = query.in('id', textSearchIds);
  }

  if (searchParams.tag.length > 0) {
    query = query.contains('tag', searchParams.tag);
  }

  if (searchParams.created) {
    if ('at' in searchParams.created) {
      const date = searchParams.created.at.toISOString().split('T')[0];
      query = query.gte('created', `${date}T00:00:00Z`).lt('created', `${date}T23:59:59Z`);
    } else if ('before' in searchParams.created) {
      query = query.lt('created', searchParams.created.before.toISOString());
    } else if ('after' in searchParams.created) {
      query = query.gt('created', searchParams.created.after.toISOString());
    } else if ('from' in searchParams.created && 'to' in searchParams.created) {
      query = query.gte('created', searchParams.created.from.toISOString())
        .lte('created', searchParams.created.to.toISOString());
    }
  }

  if (searchParams.updated) {
    if ('at' in searchParams.updated) {
      const date = searchParams.updated.at.toISOString().split('T')[0];
      query = query.gte('updated', `${date}T00:00:00Z`).lt('updated', `${date}T23:59:59Z`);
    } else if ('before' in searchParams.updated) {
      query = query.lt('updated', searchParams.updated.before.toISOString());
    } else if ('after' in searchParams.updated) {
      query = query.gt('updated', searchParams.updated.after.toISOString());
    } else if ('from' in searchParams.updated && 'to' in searchParams.updated) {
      query = query.gte('updated', searchParams.updated.from.toISOString())
        .lte('updated', searchParams.updated.to.toISOString());
    }
  }

  query = query.order('updated', { ascending: false })
    .range(searchParams.offset, searchParams.offset + searchParams.perPage - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error in advanced search:', error);
    return { error: 'Failed to perform advanced search', status: 500 };
  }

  const documents = data as Document[];
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / searchParams.perPage);

  return {
    documents,
    totalPages,
    totalCount,
    searchParams
  };
}
