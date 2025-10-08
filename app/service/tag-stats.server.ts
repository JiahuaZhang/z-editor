import { createSupabaseServerClient } from './supabase.server';

export type TagStat = {
  tag_name: string;
  document_count: number;
};

export async function getTagStatistics(request: Request, selectedTags?: string[]): Promise<{
  data: TagStat[] | null;
  error: string | null;
}> {
  try {
    const { supabase } = createSupabaseServerClient(request);

    let data, error;

    if (selectedTags && selectedTags.length > 0) {
      const result = await supabase.rpc('get_filtered_tag_statistics', { selected_tags: selectedTags });
      data = result.data;
      error = result.error;
    } else {
      const result = await supabase.rpc('get_tag_statistics');
      data = result.data;
      error = result.error;
    }

    if (error) {
      if (error.message?.toLowerCase().includes('function')) {
        console.log('Database function not found, falling back to client-side aggregation');
        return { data: null, error: 'function_not_found' };
      }
      console.error('Error fetching tag statistics:', error);
      return { data: null, error: 'Failed to fetch tag statistics' };
    }

    return { data: data as TagStat[], error: null };
  } catch (err) {
    console.error('Unexpected error in getTagStatistics:', err);
    return { data: null, error: 'Unexpected error occurred' };
  }
}
