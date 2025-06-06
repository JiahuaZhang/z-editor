import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';

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
