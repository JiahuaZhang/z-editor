import { DEFAULT_DOCUMENTS_PER_PAGE } from '~/lib/constant';
import { Tables } from '~/util/supabase.type';
import { getTagStatistics, type TagStat } from '~/service/tag-stats.server';
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
}
