import { redirect, useSubmit } from 'react-router';
import { FacebookLoginButton, GoogleLoginButton } from 'react-social-login-buttons';
import { SocialsProvider } from 'remix-auth-socials';
import { sessionStorage } from '~/service/auth.server';

export const loader = async ({ request }: { request: Request; }) => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));
  const user = session.get('user');
  if (user) return redirect('/');
  return {};
};

const Login = () => {
  const submit = useSubmit();

  return (
    <div un-flex='~ col' un-items="center" un-mt='60' un-mx='auto' un-max-w='sm' >
      <GoogleLoginButton onClick={() => submit({}, { method: 'post', action: `/auth/${SocialsProvider.GOOGLE}` })} />
      <FacebookLoginButton onClick={() => submit({}, { method: 'post', action: `/auth/${SocialsProvider.FACEBOOK}` })} />
    </div>
  );
};

export default Login;