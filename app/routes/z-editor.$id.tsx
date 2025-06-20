import { LoaderFunctionArgs, useLoaderData } from 'react-router';
import { ZEditor } from '~/components/zeditor/zeditor';
import { createSupabaseServerClient } from '~/util/supabase.server';

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
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

export default function DocumentPage() {
  const { document, error } = useLoaderData<typeof loader>();

  if (error) {
    return (
      <div un-m='8' >
        <h1 un-text='red-6 xl' un-font='bold' >Error: {error.code}</h1>
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