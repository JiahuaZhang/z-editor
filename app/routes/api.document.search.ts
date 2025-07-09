import { ActionFunction } from 'react-router';
import { searchDocuments } from '~/util/supabase.server';

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const search = formData.get('search');
  // todo: filter by time range
  return searchDocuments(request, search as string);
};