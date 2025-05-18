import { LoaderFunction, redirect } from 'react-router';
import { authenticator, sessionStorage } from '~/service/auth.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await authenticator.authenticate(params.provider ?? '', request);
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));
  session.set('user', user);

  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  });
};