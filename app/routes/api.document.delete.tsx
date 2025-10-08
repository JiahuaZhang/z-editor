import { ActionFunction, redirect } from 'react-router';
import { createSupabaseServerClient } from '~/service/supabase.server';

export const loader = () => redirect('/');

export const action: ActionFunction = async ({ request, params, context }) => {
  const { supabase, headers } = createSupabaseServerClient(request);
  const userResponse = await supabase.auth.getUser();

  if (!userResponse) {
    throw new Error('Unauthorized');
  }

  const formData = await request.formData();
  const id = formData.get('id');

  const result = await supabase.from('editor_documents')
    .delete()
    .eq('id', id);
  return result;
};