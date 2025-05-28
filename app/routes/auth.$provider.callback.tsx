import { LoaderFunction, redirect } from 'react-router';
import { sessionStorage } from '~/service/session.server';
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
  if (error) {
    throw error;
  }

  const session = await sessionStorage.getSession(request.headers.get("cookie"));
  session.set('user', data.user);

  return redirect(next, { headers: { "Set-Cookie": await sessionStorage.commitSession(session) } });
};