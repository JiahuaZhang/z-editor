import { ZEditor } from '~/components/zeditor/zeditor';
import { createSupabaseServerClient } from '~/service/supabase.server';
import type { Route } from './+types/z-editor.$id';

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { supabase, headers } = createSupabaseServerClient(request);
  const documentId = params.id;

  if (!documentId) {
    throw new Response('Document ID is required', { status: 400 });
  }

  const { data: document, error } = await supabase
    .from('editor_documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (error) {
    console.error('Error fetching document:', error);
    return { error };
  }

  return { document };
};

export default function DocumentPage({ loaderData }: Route.ComponentProps) {
  const { document, error } = loaderData;

  if (error) {
    return (
      <div un-m='8' >
        <h1 un-text='red-600 xl' un-font='bold' >Error: {error.code}</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div un-h='[calc(100vh-46px)]' >
      <ZEditor document={document.content} comments={document.comment} />
    </div>
  );
}