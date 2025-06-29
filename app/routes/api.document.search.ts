import { ActionFunction } from 'react-router';
import { searchDocuments } from '~/util/supabase.server';

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const search = formData.get('search');
  const { data, error } = await searchDocuments(request, search as string);

  // todo: search by # hashtag
  // todo: filter by time range
  // todo: search by content
  return { data, error };
};