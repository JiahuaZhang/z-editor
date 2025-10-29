import { SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_DOCUMENTS_PER_PAGE } from '~/lib/constant';
import { getTagStatistics, type TagStat } from '~/service/tag-stats.server';
import { Tables } from '~/util/supabase.type';
import { createSupabaseServerClient } from './supabase.server';

type Document = Tables<'editor_documents'>;

export type ErrorResult = {
  error: string;
  status: number;
};

export type DateFilter = { at: string; }
  | { before: string; }
  | { after: string; }
  | { from: string; to: string; }
  | { around: string; days: number; }
  | { lastDays: number; };

export type SearchParams = {
  query: string;
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

export type AdvancedSearchResult = {
  documents: Document[];
  totalPages: number;
  totalCount: number;
  searchParams: SearchParams;
  tagStat: TagStat[];
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
  const at = url.searchParams.get(fieldName);
  if (at) return { at };

  const before = url.searchParams.get(`${fieldName}_before`);
  if (before) return { before };

  const after = url.searchParams.get(`${fieldName}_after`);
  if (after) return { after };

  const from = url.searchParams.get(`${fieldName}_from`);
  const to = url.searchParams.get(`${fieldName}_to`);
  if (from && to) return { from, to };

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
    query,
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

export async function advanceSearch(supabase: SupabaseClient<any, "public", any>, searchParams: SearchParams): Promise<AdvancedSearchResult | ErrorResult> {
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
        searchParams,
        tagStat: []
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
      const date = new Date(searchParams.created.at).toISOString().split('T')[0];
      query = query.gte('created', `${date}T00:00:00Z`).lt('created', `${date}T23:59:59Z`);
    } else if ('before' in searchParams.created) {
      query = query.lt('created', new Date(searchParams.created.before).toISOString());
    } else if ('after' in searchParams.created) {
      query = query.gt('created', new Date(searchParams.created.after).toISOString());
    } else if ('from' in searchParams.created && 'to' in searchParams.created) {
      query = query.gte('created', new Date(searchParams.created.from).toISOString())
        .lte('created', new Date(searchParams.created.to).toISOString());
    }
  }

  if (searchParams.updated) {
    if ('at' in searchParams.updated) {
      const date = new Date(searchParams.updated.at).toISOString().split('T')[0];
      query = query.gte('updated', `${date}T00:00:00Z`).lt('updated', `${date}T23:59:59Z`);
    } else if ('before' in searchParams.updated) {
      query = query.lt('updated', new Date(searchParams.updated.before).toISOString());
    } else if ('after' in searchParams.updated) {
      query = query.gt('updated', new Date(searchParams.updated.after).toISOString());
    } else if ('from' in searchParams.updated && 'to' in searchParams.updated) {
      query = query.gte('updated', new Date(searchParams.updated.from).toISOString())
        .lte('updated', new Date(searchParams.updated.to).toISOString());
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
    searchParams,
    tagStat: []
  };
}

export async function searchAll(request: Request): Promise<AdvancedSearchResult | ErrorResult> {
  const searchParams = getSearchParams(request);
  const { supabase } = createSupabaseServerClient(request);

  const result = await advanceSearch(supabase, searchParams);
  if ('error' in result) {
    return result;
  }

  const tagStatResult = await getTagStatistics(supabase, searchParams.tag.length > 0 ? searchParams.tag : undefined);
  const tagStat = tagStatResult.data || [];

  return { ...result, tagStat };
}
