import { createSupabaseServerClient } from '~/service/supabase.server';
import { getTagStatistics } from '~/service/tag-stats.server';
import type { Route } from './+types/api.tag-stats';

export const loader = async ({ request }: Route.LoaderArgs) => {
  try {
    const url = new URL(request.url);
    const selectedTagsParam = url.searchParams.get('selectedTags');

    let selectedTags: string[] | undefined;
    if (selectedTagsParam) {
      selectedTags = selectedTagsParam.split(',').map(tag => tag.trim()).filter(tag => !!tag);
    }

    const { supabase } = createSupabaseServerClient(request);
    const result = await getTagStatistics(supabase, selectedTags);

    if (result.error) {
      return Response.json({ error: result.error }, { status: 500 });
    }

    return {
      tagStats: result.data,
      selectedTags: selectedTags || [],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in tag-stats API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};
