import { redirect, useSubmit } from 'react-router';
import { FacebookLoginButton, GoogleLoginButton } from 'react-social-login-buttons';
import { createSupabaseServerClient } from '~/util/supabase.server';

export const loader = async ({ request }: { request: Request; }) => {
  const { supabase, headers } = createSupabaseServerClient(request);
  const userResponse = await supabase.auth.getUser();
  const { data: { user } } = userResponse;
  if (user) return redirect('/', { headers });
  return {};
};

const Login = () => {
  const submit = useSubmit();

  return (
    <div un-flex='~ col' un-items="center" un-mt='60' un-mx='auto' un-max-w='sm' >
      <GoogleLoginButton onClick={() => submit({}, { method: 'post', action: `/auth/google` })} />
      <FacebookLoginButton disabled className='text-gray-4! bg-blue-2! cursor-not-allowed!' onClick={() => submit({}, { method: 'post', action: `/auth/facebook` })} />
    </div>
  );
};

export default Login;