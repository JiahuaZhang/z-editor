import { ActionFunction, redirect } from 'react-router';
import { createSupabaseServerClient } from '~/util/supabase.server';

const getPublicUrl = (request: Request) => {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');
  console.log('Forwarded host', forwardedHost);
  console.log('Forwarded proto', forwardedProto);
  console.log('Request url', request.url);
  console.log('Origin', new URL(request.url).origin);
  if (forwardedHost && forwardedProto) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return new URL(request.url).origin;
};

export const loader = () => redirect('/login');

export const action: ActionFunction = async ({ request, params }) => {
  const { supabase, headers } = createSupabaseServerClient(request);
  const origin = getPublicUrl(request);
  console.log('redirect to', `${origin}/auth/${params.provider}/callback`);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: params.provider as any,
    options: {
      redirectTo: `${origin}/auth/${params.provider}/callback`,
    },
  });

  if (error) {
    throw error;
  }

  return redirect(data.url ?? '/', { headers });
};