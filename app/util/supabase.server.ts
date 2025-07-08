import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import { HASHTAG_QUERY_REGEX } from '~/components/zeditor/plugin/hashtag/HashTagPlugin';

export const createSupabaseServerClient = (request: Request) => {
  const headers = new Headers();

  const supabase = createServerClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_KEY,
    {
      cookies: {
        getAll: () => {
          return parseCookieHeader(request.headers.get('Cookie') ?? '') as { name: string; value: string; }[];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            headers.append('Set-Cookie', serializeCookieHeader(name, value, options))
          );
        },
      },
    }
  );

  return { supabase, headers };
};


export const extractHashtags = (query: string): string[] => {
  return [...query.matchAll(HASHTAG_QUERY_REGEX)]
    .map(match => match.groups?.tag)
    .filter(Boolean)
    .map(tag => `#${tag}`);
};

export const searchDocuments = async (request: Request, query: string) => {
  const { supabase } = createSupabaseServerClient(request);

  const tags: string[] = [];
  const words: string[] = [];
  const phrases: string[] = [];

  const tagRegex = /(#\S+)/g;
  const phraseRegex = /"([^"]+)"/g;

  let remainingQuery = query;

  let match;
  while ((match = phraseRegex.exec(remainingQuery)) !== null) {
    phrases.push(match[1]);
  }
  remainingQuery = remainingQuery.replace(phraseRegex, '');

  while ((match = tagRegex.exec(remainingQuery)) !== null) {
    tags.push(match[1]);
  }
  remainingQuery = remainingQuery.replace(tagRegex, '');

  words.push(...remainingQuery.trim().split(/\s+/).filter(Boolean));

  const rpcParams = {
    tags,
    words,
    phrases
  };

  console.log('Frontend parsed query:', rpcParams);

  const { data, error } = await supabase.rpc('search_documents_combined', rpcParams);

  console.log('Search data:', data, error);

  return { data, error };
};