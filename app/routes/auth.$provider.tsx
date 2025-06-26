import { ActionFunction, redirect } from 'react-router';
import { createSupabaseServerClient } from '~/util/supabase.server';

export const loader = () => redirect('/login');

export const action: ActionFunction = async ({ request, params }) => {
  const { supabase, headers } = createSupabaseServerClient(request);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: params.provider as any,
    options: {
      redirectTo: `${new URL(request.url).origin}/auth/${params.provider}/callback`,
    },
  });

  if (error) {
    throw error;
  }

  return redirect(data.url ?? '/', { headers });
};