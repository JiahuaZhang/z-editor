import { redirect } from 'react-router';
import { sessionStorage } from '~/service/auth.server';

export const loader = async ({ request }: { request: Request; }) => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));
  return redirect('/login', {
    headers: { 'Set-Cookie': await sessionStorage.destroySession(session) },
  });
};