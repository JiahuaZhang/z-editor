import { createCookieSessionStorage, redirect } from 'react-router';
import { createSupabaseServerClient } from '~/util/supabase.server';

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.VITE_COOKIES_SECRET ?? 'your-secret-key'],
    secure: process.env.NODE_ENV === 'production',
  },
});

export const authenticate = async (request: Request) => {
  const { supabase, headers } = createSupabaseServerClient(request);
  const userResponse = await supabase.auth.getUser();
  const { data: { user } } = userResponse;

  if (!user) {
    throw redirect('/login', { headers });
  }

  return user;
};