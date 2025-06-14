import { ActionFunction, redirect } from 'react-router';
import { createSupabaseServerClient } from '~/util/supabase.server';

export const loader = () => redirect('/');

export const action: ActionFunction = async ({ request, params, context }) => {
  const { supabase, headers } = createSupabaseServerClient(request);
  const userResponse = await supabase.auth.getUser();

  if (!userResponse) {
    throw new Error('Unauthorized');
  }

  const json = await request.json();

  const result = await supabase.from('editor_documents')
    .upsert({ ...json, user_id: userResponse.data.user?.id })
    .select('id');
  return result;
};