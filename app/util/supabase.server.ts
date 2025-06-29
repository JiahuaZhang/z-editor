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
  const hashtags = extractHashtags(query);

  if (hashtags.length === 0 || (hashtags.length === 1 && hashtags[0] === '')) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('editor_documents')
    .select('*')
    .overlaps('tag', hashtags);
  return { data, error };
};