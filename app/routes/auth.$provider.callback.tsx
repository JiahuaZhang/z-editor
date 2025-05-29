import { LoaderFunction, redirect } from 'react-router';
import { createSupabaseServerClient } from '~/util/supabase.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  if (!code) {
    throw new Response('Missing code param', { status: 400 });
  }

  const next = requestUrl.searchParams.get('next') || '/';
  const { supabase, headers } = createSupabaseServerClient(request);
  const { error, data } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    throw error || new Response('Missing user', { status: 400 });
  }

  return redirect(next, { headers });
};