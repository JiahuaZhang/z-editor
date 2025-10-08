import { redirect } from 'react-router';
import { createSupabaseServerClient } from '~/service/supabase.server';

export const loader = async ({ request }: { request: Request; }) => {
  const { supabase, headers } = createSupabaseServerClient(request);
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  return redirect('/login', { headers });
};